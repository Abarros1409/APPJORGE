import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

/*
 * PROTOTYPE AUTH — simulates the production flow so it can be designed and
 * tested end to end. It is NOT a security boundary: everything here runs in
 * the browser. In production (see docs/seguridad_y_acceso.md):
 *   - codes are generated, hashed and verified by the auth provider's server;
 *   - the session lives in an HttpOnly + Secure + SameSite cookie;
 *   - every data request is authorized server-side (row-level security).
 * The rules below (expiry, attempts, cooldowns, step-up) mirror those
 * production rules so the UX is faithful.
 */

export type Role = 'guest' | 'owner'

export type User = {
  id: string
  email: string
  name: string
  phone?: string
  roles: Role[]
  /** Second factor (SMS / authenticator). Mandatory for owners before payouts. */
  mfa: boolean
  createdAt: string
  payout?: { bank: string; masked: string; holdUntil?: string }
}

export type Session = {
  id: string
  userId: string
  device: string
  createdAt: string
  lastActive: string
  /** Last successful re-verification, for sensitive actions. */
  stepUpAt?: string
}

export type DemoMessage = { id: string; to: string; channel: 'email' | 'sms'; code?: string; subject: string; at: string }

type Purpose = 'login' | 'mfa' | 'stepup' | 'phone'
type Challenge = { purpose: Purpose; target: string; code: string; expiresAt: number; attempts: number; sentAt: number; userId?: string; phone?: string }

export const CODE_TTL_MS = 10 * 60_000
export const RESEND_COOLDOWN_MS = 30_000
export const MAX_ATTEMPTS = 5
export const LOCK_MS = 15 * 60_000
export const SESSION_ABSOLUTE_MS = 12 * 3_600_000
export const SESSION_IDLE_MS = 30 * 60_000
export const STEP_UP_VALID_MS = 5 * 60_000

const USERS_KEY = 'evp:users:v1'
const SESSIONS_KEY = 'evp:sessions:v1'
const CURRENT_KEY = 'evp:session:v1'
const LOCKS_KEY = 'evp:locks:v1'

const SEED_USERS: User[] = [
  {
    id: 'demo-owner',
    email: 'valentina@ejemplo.com',
    name: 'Valentina Rossi',
    phone: '+598 99 555 021',
    roles: ['guest', 'owner'],
    mfa: true,
    createdAt: '2026-08-20T12:00:00.000Z',
    payout: { bank: 'BROU', masked: '•••• 4821' },
  },
]
const SEED_SESSIONS: Session[] = [
  { id: 'seed-iphone', userId: 'demo-owner', device: 'iPhone · Safari · Montevideo', createdAt: new Date(Date.now() - 3 * 86_400_000).toISOString(), lastActive: new Date(Date.now() - 2 * 86_400_000).toISOString() },
]

const read = <T,>(k: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(k)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}
const write = (k: string, v: unknown) => {
  try {
    localStorage.setItem(k, JSON.stringify(v))
  } catch {
    /* storage unavailable */
  }
}

export const normalizeEmail = (e: string) => e.trim().toLowerCase()
export const emailValid = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e.trim())
/** "+598 99 555 021" → "+598 •• ••• 021": keeps country code and last 3 digits. */
export function maskPhone(p?: string) {
  if (!p) return ''
  const total = (p.match(/\d/g) ?? []).length
  let seen = 0
  const cc = p.trim().startsWith('+') ? (p.trim().split(/\s/)[0].match(/\d/g) ?? []).length : 0
  return p.replace(/\d/g, (d) => {
    seen++
    return seen <= cc || seen > total - 3 ? d : '•'
  })
}

function sixDigits() {
  const n = crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000
  return String(n).padStart(6, '0')
}

function deviceLabel() {
  const ua = navigator.userAgent
  const os = /iPhone|iPad/.test(ua) ? 'iPhone' : /Android/.test(ua) ? 'Android' : /Mac/.test(ua) ? 'Mac' : /Windows/.test(ua) ? 'Windows' : 'Linux'
  const br = /Edg\//.test(ua) ? 'Edge' : /Chrome\//.test(ua) ? 'Chrome' : /Safari\//.test(ua) ? 'Safari' : /Firefox\//.test(ua) ? 'Firefox' : 'Navegador'
  return `${os} · ${br}`
}

export type CodeResult =
  | { ok: true }
  | { ok: false; reason: 'invalid' | 'expired' | 'locked' | 'cooldown' | 'none'; remaining?: number; retryAt?: number }

export type VerifyResult = { ok: true; next: 'done' | 'mfa' } | Extract<CodeResult, { ok: false }>

type Ctx = {
  user: User | null
  session: Session | null
  sessions: Session[]
  inbox: DemoMessage[]
  dismissMessage: (id: string) => void
  /** Step 1: send a one-time code to an email. Same response whether the account exists or not. */
  requestLogin: (email: string) => CodeResult
  /** Step 2: verify the code. Owners with 2FA continue to an SMS step. */
  verifyLogin: (code: string) => VerifyResult
  verifyMfa: (code: string) => VerifyResult
  resend: () => CodeResult
  pending: { purpose: Purpose; target: string; sentAt: number } | null
  cancelPending: () => void
  logout: () => void
  logoutEverywhere: () => void
  revokeSession: (id: string) => void
  /** Re-verification for sensitive actions (payout account, email). */
  stepUpFresh: () => boolean
  requestStepUp: () => CodeResult
  verifyStepUp: (code: string) => VerifyResult
  requestPhone: (phone: string) => CodeResult
  verifyPhone: (code: string) => VerifyResult
  updateUser: (patch: Partial<Pick<User, 'name' | 'payout'>>) => void
  addRole: (r: Role) => void
  deleteAccount: () => void
  notify: (to: string, subject: string, channel?: 'email' | 'sms') => void
  allUsers: User[]
}

const AuthContext = createContext<Ctx | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(() => read(USERS_KEY, SEED_USERS))
  const [sessions, setSessions] = useState<Session[]>(() => read(SESSIONS_KEY, SEED_SESSIONS))
  const [currentId, setCurrentId] = useState<string | null>(() => read<string | null>(CURRENT_KEY, null))
  const [locks, setLocks] = useState<Record<string, number>>(() => read(LOCKS_KEY, {}))
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [inbox, setInbox] = useState<DemoMessage[]>([])

  useEffect(() => write(USERS_KEY, users), [users])
  useEffect(() => write(SESSIONS_KEY, sessions), [sessions])
  useEffect(() => write(CURRENT_KEY, currentId), [currentId])
  useEffect(() => write(LOCKS_KEY, locks), [locks])

  const session = useMemo(() => sessions.find((s) => s.id === currentId) ?? null, [sessions, currentId])
  const user = useMemo(() => (session ? (users.find((u) => u.id === session.userId) ?? null) : null), [session, users])

  // Session expiry: absolute 12 h and 30 min of inactivity.
  useEffect(() => {
    if (!session) return
    const check = () => {
      const now = Date.now()
      if (now - Date.parse(session.createdAt) > SESSION_ABSOLUTE_MS || now - Date.parse(session.lastActive) > SESSION_IDLE_MS) {
        setSessions((all) => all.filter((s) => s.id !== session.id))
        setCurrentId(null)
      }
    }
    check()
    const touch = () => {
      const now = Date.now()
      if (now - Date.parse(session.lastActive) > 60_000) setSessions((all) => all.map((s) => (s.id === session.id ? { ...s, lastActive: new Date(now).toISOString() } : s)))
    }
    const i = window.setInterval(check, 30_000)
    window.addEventListener('pointerdown', touch)
    window.addEventListener('keydown', touch)
    document.addEventListener('visibilitychange', check)
    return () => {
      window.clearInterval(i)
      window.removeEventListener('pointerdown', touch)
      window.removeEventListener('keydown', touch)
      document.removeEventListener('visibilitychange', check)
    }
  }, [session])

  const notify = useCallback((to: string, subject: string, channel: 'email' | 'sms' = 'email') => {
    setInbox((m) => [{ id: crypto.randomUUID(), to, channel, subject, at: new Date().toISOString() }, ...m].slice(0, 4))
  }, [])

  const send = useCallback(
    (c: Omit<Challenge, 'code' | 'expiresAt' | 'attempts' | 'sentAt'>, subject: string, channel: 'email' | 'sms'): CodeResult => {
      const key = `${c.purpose}:${c.target}`
      const lockedUntil = locks[key] ?? 0
      if (lockedUntil > Date.now()) return { ok: false, reason: 'locked', retryAt: lockedUntil }
      const code = sixDigits()
      setChallenge({ ...c, code, expiresAt: Date.now() + CODE_TTL_MS, attempts: 0, sentAt: Date.now() })
      setInbox((m) => [{ id: crypto.randomUUID(), to: c.target, channel, code, subject, at: new Date().toISOString() }, ...m].slice(0, 4))
      return { ok: true }
    },
    [locks],
  )

  const check = useCallback(
    (code: string, purpose: Purpose): Extract<CodeResult, { ok: false }> | null => {
      if (!challenge || challenge.purpose !== purpose) return { ok: false, reason: 'none' }
      const key = `${purpose}:${challenge.target}`
      if ((locks[key] ?? 0) > Date.now()) return { ok: false, reason: 'locked', retryAt: locks[key] }
      if (Date.now() > challenge.expiresAt) return { ok: false, reason: 'expired' }
      if (code.replace(/\D/g, '') !== challenge.code) {
        const attempts = challenge.attempts + 1
        if (attempts >= MAX_ATTEMPTS) {
          const until = Date.now() + LOCK_MS
          setLocks((l) => ({ ...l, [key]: until }))
          setChallenge(null)
          return { ok: false, reason: 'locked', retryAt: until }
        }
        setChallenge({ ...challenge, attempts })
        return { ok: false, reason: 'invalid', remaining: MAX_ATTEMPTS - attempts }
      }
      return null
    },
    [challenge, locks],
  )

  const startSession = useCallback((u: User) => {
    const now = new Date().toISOString()
    const s: Session = { id: crypto.randomUUID(), userId: u.id, device: deviceLabel(), createdAt: now, lastActive: now }
    setSessions((all) => [s, ...all])
    setCurrentId(s.id)
  }, [])

  const requestLogin = useCallback((email: string) => send({ purpose: 'login', target: normalizeEmail(email) }, 'Tu código para ingresar a EVP', 'email'), [send])

  const verifyLogin = useCallback(
    (code: string): VerifyResult => {
      const fail = check(code, 'login')
      if (fail) return fail
      const email = challenge!.target
      let u = users.find((x) => x.email === email)
      if (!u) {
        u = { id: crypto.randomUUID(), email, name: '', roles: ['guest'], mfa: false, createdAt: new Date().toISOString() }
        const created = u
        setUsers((all) => [...all, created])
      }
      if (u.mfa && u.phone) {
        const r = send({ purpose: 'mfa', target: u.phone, userId: u.id }, 'Código de verificación EVP', 'sms')
        return r.ok ? { ok: true, next: 'mfa' } : r
      }
      setChallenge(null)
      startSession(u)
      return { ok: true, next: 'done' }
    },
    [check, challenge, users, send, startSession],
  )

  const verifyMfa = useCallback(
    (code: string): VerifyResult => {
      const fail = check(code, 'mfa')
      if (fail) return fail
      const u = users.find((x) => x.id === challenge!.userId)
      setChallenge(null)
      if (!u) return { ok: false, reason: 'none' }
      startSession(u)
      return { ok: true, next: 'done' }
    },
    [check, challenge, users, startSession],
  )

  const resend = useCallback((): CodeResult => {
    if (!challenge) return { ok: false, reason: 'none' }
    if (Date.now() - challenge.sentAt < RESEND_COOLDOWN_MS) return { ok: false, reason: 'cooldown', retryAt: challenge.sentAt + RESEND_COOLDOWN_MS }
    const rest = { purpose: challenge.purpose, target: challenge.target, userId: challenge.userId, phone: challenge.phone }
    return send(rest, challenge.purpose === 'login' ? 'Tu código para ingresar a EVP' : 'Código de verificación EVP', challenge.purpose === 'login' ? 'email' : 'sms')
  }, [challenge, send])

  const logout = useCallback(() => {
    if (currentId) setSessions((all) => all.filter((s) => s.id !== currentId))
    setCurrentId(null)
    setChallenge(null)
  }, [currentId])

  const logoutEverywhere = useCallback(() => {
    if (user) setSessions((all) => all.filter((s) => s.userId !== user.id))
    setCurrentId(null)
  }, [user])

  const revokeSession = useCallback((id: string) => setSessions((all) => all.filter((s) => s.id !== id)), [])

  const stepUpFresh = useCallback(() => !!session?.stepUpAt && Date.now() - Date.parse(session.stepUpAt) < STEP_UP_VALID_MS, [session])

  const requestStepUp = useCallback((): CodeResult => {
    if (!user) return { ok: false, reason: 'none' }
    return user.mfa && user.phone
      ? send({ purpose: 'stepup', target: user.phone, userId: user.id }, 'Confirmá esta acción en EVP', 'sms')
      : send({ purpose: 'stepup', target: user.email, userId: user.id }, 'Confirmá esta acción en EVP', 'email')
  }, [user, send])

  const verifyStepUp = useCallback(
    (code: string): VerifyResult => {
      const fail = check(code, 'stepup')
      if (fail) return fail
      setChallenge(null)
      setSessions((all) => all.map((s) => (s.id === currentId ? { ...s, stepUpAt: new Date().toISOString() } : s)))
      return { ok: true, next: 'done' }
    },
    [check, currentId],
  )

  const requestPhone = useCallback((phone: string) => (user ? send({ purpose: 'phone', target: phone.trim(), userId: user.id, phone: phone.trim() }, 'Activá la verificación en dos pasos', 'sms') : ({ ok: false, reason: 'none' } as CodeResult)), [user, send])

  const verifyPhone = useCallback(
    (code: string): VerifyResult => {
      const fail = check(code, 'phone')
      if (fail) return fail
      const phone = challenge!.phone!
      setChallenge(null)
      setUsers((all) => all.map((u) => (u.id === user?.id ? { ...u, phone, mfa: true } : u)))
      return { ok: true, next: 'done' }
    },
    [check, challenge, user],
  )

  const updateUser = useCallback((patch: Partial<Pick<User, 'name' | 'payout'>>) => setUsers((all) => all.map((u) => (u.id === user?.id ? { ...u, ...patch } : u))), [user])
  const addRole = useCallback((r: Role) => setUsers((all) => all.map((u) => (u.id === user?.id && !u.roles.includes(r) ? { ...u, roles: [...u.roles, r] } : u))), [user])
  const deleteAccount = useCallback(() => {
    if (!user) return
    setSessions((all) => all.filter((s) => s.userId !== user.id))
    setUsers((all) => all.filter((u) => u.id !== user.id))
    setCurrentId(null)
  }, [user])

  const value = useMemo<Ctx>(
    () => ({
      user,
      session,
      sessions: user ? sessions.filter((s) => s.userId === user.id) : [],
      inbox,
      dismissMessage: (id) => setInbox((m) => m.filter((x) => x.id !== id)),
      requestLogin,
      verifyLogin,
      verifyMfa,
      resend,
      pending: challenge ? { purpose: challenge.purpose, target: challenge.target, sentAt: challenge.sentAt } : null,
      cancelPending: () => setChallenge(null),
      logout,
      logoutEverywhere,
      revokeSession,
      stepUpFresh,
      requestStepUp,
      verifyStepUp,
      requestPhone,
      verifyPhone,
      updateUser,
      addRole,
      deleteAccount,
      notify,
      allUsers: users,
    }),
    [user, session, sessions, inbox, requestLogin, verifyLogin, verifyMfa, resend, challenge, logout, logoutEverywhere, revokeSession, stepUpFresh, requestStepUp, verifyStepUp, requestPhone, verifyPhone, updateUser, addRole, deleteAccount, notify, users],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export const isOwner = (u: User | null) => !!u?.roles.includes('owner')
