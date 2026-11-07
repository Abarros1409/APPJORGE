import { CheckCircle, DeviceMobile, DownloadSimple, Laptop, ShieldCheck, SignOut, Trash } from '@phosphor-icons/react'
import { useEffect, useId, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { CodeInput, StepUpDialog, useCodeError } from '../components/auth-ui'
import { Button, ButtonLink, Field, InfoNote, cx } from '../components/ui'
import { isOwner, maskPhone, useAuth } from '../lib/auth'
import { BUILDING_BY_ID } from '../lib/data'
import { dateTime, usd } from '../lib/format'
import { useLang } from '../lib/i18n'
import { PERIOD_BY_ID } from '../lib/periods'
import { bookingStatus, useStore } from '../lib/store'

function TwoFactor() {
  const { t } = useLang()
  const { user, requestPhone, verifyPhone } = useAuth()
  const fid = useId()
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const err = useCodeError()
  if (!user) return null
  if (user.mfa) {
    return (
      <p className="flex items-center gap-2 text-[0.9375rem]">
        <CheckCircle size={20} weight="fill" className="text-ok" />
        {t(`Activada · SMS a ${maskPhone(user.phone)}`, `Ativada · SMS para ${maskPhone(user.phone)}`)}
      </p>
    )
  }
  const send = (e: FormEvent) => {
    e.preventDefault()
    if (phone.replace(/\D/g, '').length < 8) return setError(t('Incluí el código de país, por ejemplo +598 99…', 'Inclua o código do país, por exemplo +55 11…'))
    const r = requestPhone(phone)
    if (!r.ok) return setError(err(r))
    setError('')
    setSent(true)
  }
  const verify = (e: FormEvent) => {
    e.preventDefault()
    const r = verifyPhone(code)
    if (!r.ok) return setError(err(r))
  }
  return (
    <div className="flex flex-col gap-4">
      {isOwner(user) && (
        <InfoNote tone="ocaso">{t('Es obligatoria para propietarios: sin ella no se pueden recibir liquidaciones.', 'É obrigatória para proprietários: sem ela não é possível receber repasses.')}</InfoNote>
      )}
      {!sent ? (
        <form onSubmit={send} noValidate className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Field label={t('Celular para recibir códigos', 'Celular para receber códigos')} htmlFor={`${fid}-p`} error={error || undefined}>
              <input id={`${fid}-p`} type="tel" inputMode="tel" autoComplete="tel" className="field" placeholder="+598 99 123 456" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </Field>
          </div>
          <Button type="submit" variant="ink">{t('Enviar código', 'Enviar código')}</Button>
        </form>
      ) : (
        <form onSubmit={verify} noValidate className="flex flex-col gap-3 sm:max-w-xs">
          <Field label={t('Código del SMS', 'Código do SMS')} htmlFor={`${fid}-c`} error={error || undefined}>
            <CodeInput id={`${fid}-c`} value={code} onChange={setCode} invalid={!!error} />
          </Field>
          <Button type="submit" variant="ink">{t('Activar', 'Ativar')}</Button>
        </form>
      )}
    </div>
  )
}

export default function Account() {
  const { t, lang } = useLang()
  const { user, session, sessions, updateUser, logout, logoutEverywhere, revokeSession, deleteAccount } = useAuth()
  const { bookings, unitById } = useStore()
  const nav = useNavigate()
  const { hash } = useLocation()
  const fid = useId()
  const [name, setName] = useState(user?.name ?? '')
  const [saved, setSaved] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView()
  }, [hash])

  if (!user) return null
  const mine = bookings.filter((b) => b.guest.email.toLowerCase() === user.email)
  const active = mine.filter((b) => bookingStatus(b) !== 'liberado')

  const download = () => {
    const data = { cuenta: { email: user.email, nombre: user.name, telefono: user.phone ?? null, roles: user.roles, creada: user.createdAt, verificacion_dos_pasos: user.mfa }, reservas: mine, sesiones: sessions.map(({ device, createdAt, lastActive }) => ({ device, createdAt, lastActive })) }
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }))
    const a = document.createElement('a')
    a.href = url
    a.download = 'evp-mis-datos.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const section = 'flex flex-col gap-5 border-t border-line pt-8'
  return (
    <div className="pt-28 pb-24 md:pt-32">
      <div className="shell grid grid-cols-[minmax(0,1fr)] gap-12 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-16">
        <nav aria-label={t('Secciones de la cuenta', 'Seções da conta')} className="lg:sticky lg:top-28 lg:self-start">
          <ul className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:px-0">
            {[
              ['perfil', t('Perfil', 'Perfil')],
              ['reservas', t('Mis reservas', 'Minhas reservas')],
              ['seguridad', t('Seguridad', 'Segurança')],
              ['sesiones', t('Sesiones', 'Sessões')],
              ['datos', t('Mis datos', 'Meus dados')],
            ].map(([id, l]) => (
              <li key={id}>
                <a href={`#${id}`} className={cx('block rounded-full px-4 py-2 text-[0.9375rem] whitespace-nowrap hover:bg-mist', hash === `#${id}` && 'bg-mist font-medium')}>
                  {l}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex min-w-0 max-w-3xl flex-col gap-12">
          <header className="flex flex-col gap-2">
            <h1 className="f-h2 text-[clamp(2rem,4vw,3rem)]">{t('Mi cuenta', 'Minha conta')}</h1>
            <p className="text-mute">{user.email}</p>
            {isOwner(user) && (
              <ButtonLink to="/panel" variant="ink" size="sm" trailing className="mt-3 self-start">
                {t('Panel de propietario', 'Painel de proprietário')}
              </ButtonLink>
            )}
          </header>

          <section id="perfil" className={section} aria-labelledby="perfil-t">
            <h2 id="perfil-t" className="f-h3 text-[1.25rem]">{t('Perfil', 'Perfil')}</h2>
            <form
              className="flex flex-col gap-4 sm:flex-row sm:items-end"
              onSubmit={(e) => {
                e.preventDefault()
                updateUser({ name: name.trim() })
                setSaved(true)
              }}
            >
              <div className="flex-1">
                <Field label={t('Nombre y apellido', 'Nome e sobrenome')} htmlFor={`${fid}-n`}>
                  <input id={`${fid}-n`} className="field" autoComplete="name" value={name} onChange={(e) => { setName(e.target.value); setSaved(false) }} />
                </Field>
              </div>
              <Button type="submit" variant="outline">{saved ? t('Guardado', 'Salvo') : t('Guardar', 'Salvar')}</Button>
            </form>
            <p className="text-[0.875rem] text-mute">
              {t('El email identifica tu cuenta. Para cambiarlo escribinos: lo validamos con un código en el email actual y en el nuevo.', 'O e-mail identifica sua conta. Para alterá-lo, fale conosco: validamos com um código no e-mail atual e no novo.')}
            </p>
          </section>

          <section id="reservas" className={section} aria-labelledby="res-t">
            <h2 id="res-t" className="f-h3 text-[1.25rem]">{t('Mis reservas', 'Minhas reservas')}</h2>
            {mine.length ? (
              <ul className="flex flex-col divide-y divide-line rounded-[16px] ring-1 ring-line">
                {mine.map((b) => {
                  const u = unitById(b.unitId)
                  return (
                    <li key={b.code}>
                      <Link to={`/reserva/${b.code}`} className="flex flex-wrap items-center justify-between gap-3 p-4 hover:bg-mist">
                        <span className="flex flex-col">
                          <span className="font-semibold">{u ? `${BUILDING_BY_ID[u.buildingId].name} · ${u.unit}` : b.unitId}</span>
                          <span className="text-[0.875rem] text-mute">{PERIOD_BY_ID[b.period].name[lang]} · {b.code}</span>
                        </span>
                        <span className="f-num font-medium">{usd(b.total, lang)}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <p className="text-mute">
                {t('Todavía no tenés reservas con este email.', 'Você ainda não tem reservas com este e-mail.')}{' '}
                <Link to="/buscar" className="font-medium text-marine-strong underline-offset-4 hover:underline">{t('Explorar unidades', 'Explorar unidades')}</Link>
              </p>
            )}
          </section>

          <section id="seguridad" className={section} aria-labelledby="seg-t">
            <div className="flex items-center gap-3">
              <ShieldCheck size={22} className="text-marine-strong" />
              <h2 id="seg-t" className="f-h3 text-[1.25rem]">{t('Verificación en dos pasos', 'Verificação em duas etapas')}</h2>
            </div>
            <p className="text-[0.9375rem] text-mute">
              {t('Además del código por email, te pedimos un código por SMS al ingresar y antes de acciones sensibles, como cambiar la cuenta de cobro.', 'Além do código por e-mail, pedimos um código por SMS ao entrar e antes de ações sensíveis, como alterar a conta de recebimento.')}
            </p>
            <TwoFactor />
          </section>

          <section id="sesiones" className={section} aria-labelledby="ses-t">
            <h2 id="ses-t" className="f-h3 text-[1.25rem]">{t('Dispositivos con sesión abierta', 'Dispositivos com sessão aberta')}</h2>
            <ul className="flex flex-col divide-y divide-line rounded-[16px] ring-1 ring-line">
              {sessions.map((s) => {
                const current = s.id === session?.id
                return (
                  <li key={s.id} className="flex items-center gap-4 p-4">
                    <span className="text-mute">{/iPhone|Android/.test(s.device) ? <DeviceMobile size={22} /> : <Laptop size={22} />}</span>
                    <span className="flex flex-1 flex-col">
                      <span className="font-medium">{s.device}</span>
                      <span className="text-[0.8125rem] text-mute">
                        {current ? t('Este dispositivo', 'Este dispositivo') : `${t('Última actividad', 'Última atividade')} ${dateTime(s.lastActive, lang)}`}
                      </span>
                    </span>
                    {!current && (
                      <button type="button" onClick={() => revokeSession(s.id)} className="text-[0.875rem] font-medium text-marine-strong underline-offset-4 hover:underline">
                        {t('Cerrar', 'Encerrar')}
                      </button>
                    )}
                  </li>
                )
              })}
            </ul>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" size="sm" onClick={() => { logout(); nav('/') }} trailing={<SignOut size={14} />}>
                {t('Cerrar sesión', 'Sair')}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => { logoutEverywhere(); nav('/') }}>
                {t('Cerrar sesión en todos los dispositivos', 'Sair de todos os dispositivos')}
              </Button>
            </div>
            <p className="text-[0.8125rem] text-mute">
              {t('Por seguridad, la sesión se cierra sola tras 30 minutos sin actividad y a las 12 horas como máximo.', 'Por segurança, a sessão é encerrada após 30 minutos sem atividade e no máximo em 12 horas.')}
            </p>
          </section>

          <section id="datos" className={section} aria-labelledby="dat-t">
            <h2 id="dat-t" className="f-h3 text-[1.25rem]">{t('Mis datos', 'Meus dados')}</h2>
            <p className="text-[0.9375rem] text-mute">
              {t('Podés descargar todo lo que EVP guarda sobre vos o pedir que se elimine (Ley 18.331 de Uruguay, LGPD de Brasil y Ley 25.326 de Argentina).', 'Você pode baixar tudo o que a EVP guarda sobre você ou pedir a exclusão (Lei 18.331 do Uruguai, LGPD do Brasil e Lei 25.326 da Argentina).')}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" size="sm" onClick={download} trailing={<DownloadSimple size={14} />}>
                {t('Descargar mis datos', 'Baixar meus dados')}
              </Button>
              <Button variant="ghost" size="sm" className="text-bad" onClick={() => setConfirmDelete(true)} disabled={active.length > 0 || isOwner(user)}>
                <span className="inline-flex items-center gap-2"><Trash size={14} />{t('Eliminar mi cuenta', 'Excluir minha conta')}</span>
              </Button>
            </div>
            {(active.length > 0 || isOwner(user)) && (
              <p className="text-[0.8125rem] text-mute">
                {isOwner(user)
                  ? t('Las cuentas de propietario se dan de baja con soporte, para cerrar antes las liquidaciones pendientes.', 'Contas de proprietário são encerradas com o suporte, para fechar antes os repasses pendentes.')
                  : t('No se puede eliminar mientras tengas reservas en curso. Los contratos firmados se conservan el plazo que exige la ley.', 'Não é possível excluir enquanto houver reservas em andamento. Os contratos assinados são mantidos pelo prazo legal.')}
              </p>
            )}
          </section>
        </div>
      </div>
      <StepUpDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        reason={t('Vas a eliminar tu cuenta de forma definitiva.', 'Você vai excluir sua conta definitivamente.')}
        onVerified={() => {
          deleteAccount()
          nav('/')
        }}
      />
    </div>
  )
}
