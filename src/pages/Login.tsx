import { LockKey, ShieldCheck, UserCircle } from '@phosphor-icons/react'
import { useEffect } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router'
import { ArchScene } from '../components/ArchScene'
import { LoginFlow } from '../components/auth-ui'
import { useAuth } from '../lib/auth'
import { useLang } from '../lib/i18n'

/** Only same-origin relative paths are accepted as redirect targets (prevents open redirects). */
export function safeNext(raw: string | null) {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//') || raw.includes('\\')) return '/cuenta'
  return raw
}

export default function Login() {
  const { t } = useLang()
  const { user } = useAuth()
  const [sp] = useSearchParams()
  const nav = useNavigate()
  const next = safeNext(sp.get('next'))

  useEffect(() => {
    document.title = 'EVP · Ingresar'
    return () => {
      document.title = 'EVP · Edificios VIP Punta del Este'
    }
  }, [])

  if (user) return <Navigate to={next} replace />

  return (
    <div className="grid min-h-[100dvh] lg:grid-cols-[1fr_1.05fr]">
      <div className="on-ink relative isolate hidden overflow-hidden bg-ink text-on-ink lg:flex lg:flex-col lg:justify-end">
        <ArchScene shape="curved" time="night" seed={97} lit className="absolute inset-0 -z-10 size-full" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,transparent_40%,oklch(0.205_0.035_240/0.92))]" />
        <ul className="flex flex-col gap-4 p-12 text-[0.9375rem]">
          {[
            [<LockKey key="l" size={20} />, t('Sin contraseñas: un código nuevo cada vez.', 'Sem senhas: um código novo a cada vez.')],
            [<ShieldCheck key="s" size={20} />, t('Verificación en dos pasos para propietarios.', 'Verificação em duas etapas para proprietários.')],
            [<UserCircle key="u" size={20} />, t('Cada cuenta ve solo sus reservas y sus unidades.', 'Cada conta vê só suas reservas e unidades.')],
          ].map(([i, l], k) => (
            <li key={k} className="flex items-center gap-3">
              <span className="text-ocaso">{i}</span>
              {l}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col justify-center px-5 pt-28 pb-16 sm:px-10 lg:px-16">
        <div className="mx-auto flex w-full max-w-md flex-col gap-8">
          <div className="flex flex-col gap-3">
            <h1 className="f-display text-[clamp(2.2rem,4.5vw,3.25rem)]">{t('Ingresá a EVP', 'Entre na EVP')}</h1>
            <p className="text-mute">
              {t('Con tu email. Si es la primera vez, la cuenta se crea sola al verificarlo.', 'Com seu e-mail. Se for a primeira vez, a conta é criada ao verificá-lo.')}
            </p>
          </div>
          <LoginFlow onDone={() => nav(next, { replace: true })} />
          <div className="flex flex-col gap-2 border-t border-line pt-6">
            <p className="text-[0.8125rem] font-semibold text-mute">{t('Cuentas de demostración', 'Contas de demonstração')}</p>
            <ul className="flex flex-col gap-1 text-[0.875rem]">
              <li>
                <span className="font-medium">valentina@ejemplo.com</span> · {t('propietaria, con verificación en dos pasos', 'proprietária, com verificação em duas etapas')}
              </li>
              <li>
                <span className="font-medium">martin@ejemplo.com</span> · {t('huésped con una reserva', 'hóspede com uma reserva')}
              </li>
              <li className="text-mute">{t('O cualquier email: se crea una cuenta nueva.', 'Ou qualquer e-mail: uma conta nova é criada.')}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
