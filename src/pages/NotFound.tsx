import { ArchScene } from '../components/ArchScene'
import { ButtonLink } from '../components/ui'
import { useLang } from '../lib/i18n'

export default function NotFound() {
  const { t } = useLang()
  return (
    <section className="on-ink relative isolate flex min-h-[80dvh] items-end overflow-hidden bg-ink text-on-ink">
      <ArchScene kind="view" time="night" seed={3} className="absolute inset-0 -z-10 size-full" />
      <div className="shell flex flex-col items-start gap-6 pb-16">
        <h1 className="f-display text-[clamp(2.4rem,6vw,4.5rem)]">{t('Esta página no existe.', 'Esta página não existe.')}</h1>
        <p className="text-on-ink-mute">{t('Puede que la unidad ya no esté publicada.', 'Talvez a unidade não esteja mais publicada.')}</p>
        <ButtonLink to="/buscar" trailing>
          {t('Ver unidades disponibles', 'Ver unidades disponíveis')}
        </ButtonLink>
      </div>
    </section>
  )
}
