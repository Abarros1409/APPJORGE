import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { UNITS, type Unit } from './data'
import type { PeriodId } from './periods'

/**
 * Direct inquiry from an interested tenant to the advertiser (owner or agency).
 * EVP does not intermediate: no payment, contract or commission goes through
 * the platform (see docs/actualizacion_modelo_2026-11.md).
 */
export type Inquiry = {
  id: string
  unitId: string
  period: PeriodId | null
  createdAt: string
  guest: {
    name: string
    email: string
    phone: string
    country: 'AR' | 'BR' | 'UY' | 'OTRO'
    guests: number
    pet: boolean
  }
  message: string
  status: InquiryStatus
}

export type InquiryStatus = 'nueva' | 'respondida' | 'alquilado' | 'descartada'

export type Lead = { id: string; building: string; name: string; role: string; email: string; phone: string; message: string; createdAt: string }

export type Report = { id: string; unitId: string; reason: string; createdAt: string }

type State = {
  inquiries: Inquiry[]
  /** Periods the advertiser marked as already rented, per unit. */
  rented: Record<string, PeriodId[]>
  ownerUnits: Unit[]
  leads: Lead[]
  reports: Report[]
  favorites: string[]
}

const KEY = 'evp:state:v2'

const now = Date.now()
const ago = (days: number) => new Date(now - days * 86_400_000).toISOString()
const SEED_STATE: State = {
  favorites: [],
  leads: [],
  reports: [],
  ownerUnits: [],
  rented: {},
  inquiries: [
    {
      id: 'C-K7Q2MX',
      unitId: 'u01',
      period: 'ene1',
      createdAt: ago(34),
      guest: { name: 'Martín Echeverría', email: 'martin@ejemplo.com', phone: '+54 9 11 5555 0101', country: 'AR', guests: 5, pet: false },
      message: 'Hola, somos dos adultos y tres chicos. ¿El servicio de playa está incluido en la quincena?',
      status: 'alquilado',
    },
    {
      id: 'C-B3RN8T',
      unitId: 'u05',
      period: 'feb2',
      createdAt: ago(3),
      guest: { name: 'Camila Duarte', email: 'camila@exemplo.com.br', phone: '+55 11 95555 0202', country: 'BR', guests: 4, pet: true },
      message: 'Olá! Viajamos com um cachorro pequeno. A unidade aceita? Chegaríamos de carro desde São Paulo.',
      status: 'nueva',
    },
    {
      id: 'C-H9WD4P',
      unitId: 'u01',
      period: 'feb',
      createdAt: ago(1),
      guest: { name: 'Rafael Montes', email: 'rafael@exemplo.com.br', phone: '+55 51 95555 0303', country: 'BR', guests: 6, pet: false },
      message: 'Bom dia, temos interesse no mês de fevereiro completo. É possível fazer um preço para o mês?',
      status: 'nueva',
    },
    {
      id: 'C-Q4ZT7L',
      unitId: 'u12',
      period: 'ene2',
      createdAt: ago(6),
      guest: { name: 'Lucía Ferreira', email: 'lucia@ejemplo.com', phone: '+54 9 11 5555 0404', country: 'AR', guests: 3, pet: false },
      message: '¿La terraza tiene parrillero? Buscamos algo tranquilo para la segunda quincena.',
      status: 'respondida',
    },
  ],
}

const baseBooked = (s: State, unitId: string): PeriodId[] => [...UNITS, ...s.ownerUnits].find((u) => u.id === unitId)?.booked ?? []

function load(): State {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<State>
      return { ...SEED_STATE, ...parsed }
    }
  } catch {
    /* corrupted or unavailable */
  }
  return SEED_STATE
}

type Ctx = State & {
  /** Units visible to guests (ownership verified). */
  units: Unit[]
  /** Every unit, including those pending verification (owner panel only). */
  allUnits: Unit[]
  submitTitleDoc: (unitId: string, fileName: string) => void
  approveUnit: (unitId: string) => void
  unitById: (id: string) => Unit | undefined
  addInquiry: (q: Inquiry) => void
  setInquiryStatus: (id: string, status: InquiryStatus) => void
  /** Owner marks/unmarks a period as already rented. */
  toggleRented: (unitId: string, period: PeriodId) => void
  reportListing: (unitId: string, reason: string) => void
  publishUnit: (u: Unit) => void
  addLead: (l: Lead) => void
  toggleFavorite: (unitId: string) => void
  storageWarning: boolean
  resetDemo: () => void
}

const StoreContext = createContext<Ctx | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(load)
  const [storageWarning, setStorageWarning] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state))
      setStorageWarning(false)
    } catch {
      setStorageWarning(true)
    }
  }, [state])

  const allUnits = useMemo(() => {
    const all = [...UNITS, ...state.ownerUnits]
    return all.map((u) => {
      // Once the advertiser edits availability, their list replaces the seed data.
      const own = state.rented[u.id]
      return own ? { ...u, booked: own } : u
    })
  }, [state.ownerUnits, state.rented])
  const units = useMemo(() => allUnits.filter((u) => !u.verification), [allUnits])

  const unitById = useCallback((id: string) => allUnits.find((u) => u.id === id), [allUnits])

  const submitTitleDoc = useCallback(
    (unitId: string, name: string) =>
      setState((s) => ({ ...s, ownerUnits: s.ownerUnits.map((u) => (u.id === unitId ? { ...u, verification: 'revision', titleDoc: { name, at: new Date().toISOString() } } : u)) })),
    [],
  )
  const approveUnit = useCallback(
    (unitId: string) => setState((s) => ({ ...s, ownerUnits: s.ownerUnits.map((u) => (u.id === unitId ? { ...u, verification: undefined } : u)) })),
    [],
  )

  const addInquiry = useCallback((q: Inquiry) => setState((s) => ({ ...s, inquiries: [q, ...s.inquiries] })), [])

  const setInquiryStatus = useCallback(
    (id: string, status: InquiryStatus) =>
      setState((s) => {
        const q = s.inquiries.find((x) => x.id === id)
        const rented = { ...s.rented }
        // Closing a deal blocks that period in the listing.
        if (q && status === 'alquilado' && q.period) rented[q.unitId] = Array.from(new Set([...(rented[q.unitId] ?? baseBooked(s, q.unitId)), q.period]))
        return { ...s, rented, inquiries: s.inquiries.map((x) => (x.id === id ? { ...x, status } : x)) }
      }),
    [],
  )

  const toggleRented = useCallback(
    (unitId: string, period: PeriodId) =>
      setState((s) => {
        const cur = s.rented[unitId] ?? baseBooked(s, unitId)
        return { ...s, rented: { ...s.rented, [unitId]: cur.includes(period) ? cur.filter((p) => p !== period) : [...cur, period] } }
      }),
    [],
  )

  const reportListing = useCallback(
    (unitId: string, reason: string) => setState((s) => ({ ...s, reports: [{ id: crypto.randomUUID(), unitId, reason, createdAt: new Date().toISOString() }, ...s.reports] })),
    [],
  )

  const publishUnit = useCallback((u: Unit) => setState((s) => ({ ...s, ownerUnits: [u, ...s.ownerUnits] })), [])
  const addLead = useCallback((l: Lead) => setState((s) => ({ ...s, leads: [l, ...s.leads] })), [])
  const toggleFavorite = useCallback(
    (id: string) =>
      setState((s) => ({ ...s, favorites: s.favorites.includes(id) ? s.favorites.filter((f) => f !== id) : [...s.favorites, id] })),
    [],
  )
  const resetDemo = useCallback(() => setState(SEED_STATE), [])

  const value = useMemo<Ctx>(
    () => ({ ...state, units, allUnits, submitTitleDoc, approveUnit, unitById, addInquiry, setInquiryStatus, toggleRented, reportListing, publishUnit, addLead, toggleFavorite, storageWarning, resetDemo }),
    [state, units, allUnits, submitTitleDoc, approveUnit, unitById, addInquiry, setInquiryStatus, toggleRented, reportListing, publishUnit, addLead, toggleFavorite, storageWarning, resetDemo],
  )
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
