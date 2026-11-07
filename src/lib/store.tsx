import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { UNITS, type Unit } from './data'
import type { PeriodId } from './periods'

export type PaymentMethod = 'card' | 'pix'

export type Booking = {
  code: string
  unitId: string
  period: PeriodId
  createdAt: string
  guest: {
    name: string
    email: string
    phone: string
    doc: string
    country: 'AR' | 'BR' | 'UY' | 'OTRO'
    guests: number
    pet: boolean
  }
  net: number
  fee: number
  total: number
  method: PaymentMethod
  methodDetail: string
  signature: string
  signedAt: string
  /** Set when the guest completes the digital inventory at check-in. */
  checkin?: { at: string; notes: string }
  /** Escrow release: 24–48 h after a successful check-in. */
  releaseAt?: string
}

export type BookingStatus = 'custodia' | 'checkin' | 'liberado'

export function bookingStatus(b: Booking, now = Date.now()): BookingStatus {
  if (!b.checkin) return 'custodia'
  if (b.releaseAt && Date.parse(b.releaseAt) <= now) return 'liberado'
  return 'checkin'
}

export type Lead = { id: string; building: string; name: string; role: string; email: string; phone: string; message: string; createdAt: string }

type State = {
  bookings: Booking[]
  ownerUnits: Unit[]
  leads: Lead[]
  favorites: string[]
}

const KEY = 'evp:state:v1'

const now = Date.now()
const SEED_STATE: State = {
  favorites: [],
  leads: [],
  ownerUnits: [],
  bookings: [
    {
      code: 'EVP-K7Q2MX',
      unitId: 'u01',
      period: 'ene1',
      createdAt: new Date(now - 34 * 86_400_000).toISOString(),
      guest: { name: 'Martín Echeverría', email: 'martin@ejemplo.com', phone: '+54 9 11 5555 0101', doc: 'AR 30.111.222', country: 'AR', guests: 5, pet: false },
      net: 4200,
      fee: 210,
      total: 4410,
      method: 'card',
      methodDetail: 'Visa •••• 4242',
      signature: '',
      signedAt: new Date(now - 34 * 86_400_000).toISOString(),
    },
    {
      code: 'EVP-B3RN8T',
      unitId: 'u05',
      period: 'ene2',
      createdAt: new Date(now - 12 * 86_400_000).toISOString(),
      guest: { name: 'Camila Duarte', email: 'camila@exemplo.com.br', phone: '+55 11 95555 0202', doc: 'BR 123.456.789-00', country: 'BR', guests: 4, pet: true },
      net: 3550,
      fee: 178,
      total: 3728,
      method: 'pix',
      methodDetail: 'PIX · dLocal',
      signature: '',
      signedAt: new Date(now - 12 * 86_400_000).toISOString(),
    },
    {
      code: 'EVP-H9WD4P',
      unitId: 'u05',
      period: 'feb1',
      createdAt: new Date(now - 5 * 86_400_000).toISOString(),
      guest: { name: 'Rafael Montes', email: 'rafael@exemplo.com.br', phone: '+55 51 95555 0303', doc: 'BR 987.654.321-00', country: 'BR', guests: 6, pet: false },
      net: 3350,
      fee: 168,
      total: 3518,
      method: 'card',
      methodDetail: 'Mastercard •••• 5100',
      signature: '',
      signedAt: new Date(now - 5 * 86_400_000).toISOString(),
    },
  ],
}

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
  units: Unit[]
  unitById: (id: string) => Unit | undefined
  addBooking: (b: Booking) => void
  completeCheckin: (code: string, notes: string) => void
  releaseNow: (code: string) => void
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

  const units = useMemo(() => {
    const all = [...UNITS, ...state.ownerUnits]
    return all.map((u) => {
      const extra = state.bookings.filter((b) => b.unitId === u.id).map((b) => b.period)
      return extra.length ? { ...u, booked: Array.from(new Set([...u.booked, ...extra])) } : u
    })
  }, [state.ownerUnits, state.bookings])

  const unitById = useCallback((id: string) => units.find((u) => u.id === id), [units])

  const addBooking = useCallback((b: Booking) => setState((s) => ({ ...s, bookings: [b, ...s.bookings] })), [])

  const completeCheckin = useCallback(
    (code: string, notes: string) =>
      setState((s) => ({
        ...s,
        bookings: s.bookings.map((b) =>
          b.code === code
            ? { ...b, checkin: { at: new Date().toISOString(), notes }, releaseAt: new Date(Date.now() + 36 * 3_600_000).toISOString() }
            : b,
        ),
      })),
    [],
  )

  const releaseNow = useCallback(
    (code: string) =>
      setState((s) => ({
        ...s,
        bookings: s.bookings.map((b) =>
          b.code === code
            ? { ...b, checkin: b.checkin ?? { at: new Date().toISOString(), notes: '' }, releaseAt: new Date(Date.now() - 1000).toISOString() }
            : b,
        ),
      })),
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
    () => ({ ...state, units, unitById, addBooking, completeCheckin, releaseNow, publishUnit, addLead, toggleFavorite, storageWarning, resetDemo }),
    [state, units, unitById, addBooking, completeCheckin, releaseNow, publishUnit, addLead, toggleFavorite, storageWarning, resetDemo],
  )
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
