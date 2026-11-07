import { Check, CheckCircle, ImageSquare, Sparkle, Star, Trash, UploadSimple, Waves, Car, PawPrint, Timer } from '@phosphor-icons/react'
import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { BuildingVisual } from '../components/units'
import { Button, ButtonLink, Field, InfoNote, Seal, Stars, Stepper, Toggle, cx } from '../components/ui'
import { AMENITIES, BUILDINGS, BUILDING_BY_ID, ZONES, ZONE_NAME, type Prices, type Unit } from '../lib/data'
import { useAuth } from '../lib/auth'
import { breakdown, usd } from '../lib/format'
import { useLang } from '../lib/i18n'
import { PERIOD_GROUPS, PERIOD_BY_ID, type PeriodId } from '../lib/periods'
import { useStore } from '../lib/store'

type PhotoTag = 'living' | 'dorm' | 'terraza' | 'cocina' | 'bano' | 'otro'
type Photo = { id: string; src: string; tag: PhotoTag }

const MIN_PHOTOS = 5
const REQUIRED_TAGS: PhotoTag[] = ['living', 'dorm', 'terraza']

async function downscale(file: File, max = 1400): Promise<string> {
  const bmp = await createImageBitmap(file)
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height))
  const c = document.createElement('canvas')
  c.width = Math.round(bmp.width * scale)
  c.height = Math.round(bmp.height * scale)
  c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height)
  bmp.close()
  return c.toDataURL('image/jpeg', 0.8)
}

export default function Publish() {
  const { t, lang } = useLang()
  const { publishUnit, allUnits: units } = useStore()
  const { user, addRole } = useAuth()
  const fid = useId()
  const [step, setStep] = useState(0)
  const [attempted, setAttempted] = useState(false)
  const [started] = useState(() => Date.now())
  const [elapsed, setElapsed] = useState(0)
  const [buildingId, setBuildingId] = useState('')
  const [floor, setFloor] = useState('')
  const [unitNo, setUnitNo] = useState('')
  const [beds, setBeds] = useState(2)
  const [baths, setBaths] = useState(2)
  const [guests, setGuests] = useState(4)
  const [m2, setM2] = useState('')
  const [sea, setSea] = useState(true)
  const [garage, setGarage] = useState(true)
  const [pet, setPet] = useState(false)
  const [prices, setPrices] = useState<Partial<Record<PeriodId, string>>>({})
  const [photos, setPhotos] = useState<Photo[]>([])
  const [dragOver, setDragOver] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [published, setPublished] = useState<Unit | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const i = window.setInterval(() => setElapsed(Math.floor((Date.now() - started) / 1000)), 1000)
    return () => window.clearInterval(i)
  }, [started])
  useEffect(() => {
    if (step > 0) headingRef.current?.focus()
  }, [step])

  const b = buildingId ? BUILDING_BY_ID[buildingId] : null
  const numericPrices: Prices = Object.fromEntries(
    Object.entries(prices)
      .map(([k, v]) => [k, Number(String(v).replace(/\D/g, ''))])
      .filter(([, v]) => (v as number) > 0),
  )
  const tagLabel: Record<PhotoTag, string> = {
    living: t('Living', 'Sala'),
    dorm: t('Dormitorio', 'Quarto'),
    terraza: t('Terraza / vista', 'Terraço / vista'),
    cocina: t('Cocina', 'Cozinha'),
    bano: t('Baño', 'Banheiro'),
    otro: t('Otro', 'Outro'),
  }
  const missingTags = REQUIRED_TAGS.filter((tg) => !photos.some((p) => p.tag === tg))

  const errors: Record<string, string> = {}
  if (step === 0 && !b) errors.building = t('Elegí tu edificio de la lista.', 'Escolha seu edifício na lista.')
  if (step === 1) {
    const f = Number(floor)
    if (!floor || !Number.isInteger(f) || f < 0 || (b && f > b.floors)) errors.floor = b ? t(`Entre 0 y ${b.floors}.`, `Entre 0 e ${b.floors}.`) : t('Ingresá el piso.', 'Informe o andar.')
    if (!unitNo.trim()) errors.unit = t('Ingresá el número o la letra de la unidad.', 'Informe o número ou a letra da unidade.')
    else if (units.some((u) => u.buildingId === buildingId && u.unit.toLowerCase() === unitNo.trim().toLowerCase())) errors.unit = t('Esa unidad ya está publicada en EVP.', 'Essa unidade já está publicada na EVP.')
  }
  if (step === 2) {
    if (guests < beds) errors.guests = t('La capacidad debería ser al menos igual a la cantidad de dormitorios.', 'A capacidade deve ser pelo menos igual ao número de quartos.')
    const n = Number(m2)
    if (!n || n < 30 || n > 900) errors.m2 = t('Entre 30 y 900 m².', 'Entre 30 e 900 m².')
  }
  if (step === 3 && !Object.keys(numericPrices).length) errors.prices = t('Fijá la tarifa de al menos un período.', 'Defina a tarifa de pelo menos um período.')
  if (step === 4) {
    if (photos.length < MIN_PHOTOS) errors.photos = t(`Subí al menos ${MIN_PHOTOS} fotos (tenés ${photos.length}).`, `Envie pelo menos ${MIN_PHOTOS} fotos (você tem ${photos.length}).`)
    else if (missingTags.length) errors.photos = t(`Falta al menos una foto de: ${missingTags.map((m) => tagLabel[m]).join(', ')}.`, `Falta pelo menos uma foto de: ${missingTags.map((m) => tagLabel[m]).join(', ')}.`)
  }

  const suggest = () => {
    if (!b) return
    const peers = units.filter((u) => u.buildingId === b.id)
    const base = peers.length ? peers.reduce((s, u) => s + (u.prices.ene1 ?? 0) / u.bedrooms, 0) / peers.length : 1500
    const ene1 = Math.round((base * beds) / 50) * 50
    const r = (n: number) => String(Math.round(n / 50) * 50)
    setPrices({ ene1: r(ene1), ene2: r(ene1 * 0.94), ene: r(ene1 * 1.81), feb1: r(ene1 * 0.88), feb2: r(ene1 * 0.74), feb: r(ene1 * 1.5), dic: r(ene1 * 1.05) })
  }

  const addFiles = async (files: FileList | null) => {
    if (!files?.length) return
    setProcessing(true)
    const imgs = Array.from(files).filter((f) => f.type.startsWith('image/')).slice(0, 15 - photos.length)
    const order: PhotoTag[] = ['living', 'dorm', 'terraza', 'cocina', 'bano', 'otro']
    const out: Photo[] = []
    for (const [i, f] of imgs.entries()) {
      try {
        const src = await downscale(f)
        const tag = order[Math.min(photos.length + i, order.length - 1)]
        out.push({ id: crypto.randomUUID(), src, tag })
      } catch {
        /* unreadable image: skip */
      }
    }
    setPhotos((p) => [...p, ...out])
    setProcessing(false)
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    setAttempted(true)
    if (Object.keys(errors).length) return
    setAttempted(false)
    if (step < 5) {
      setStep(step + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    const unit: Unit = {
      id: `p${Date.now().toString(36)}`,
      buildingId,
      floor: Number(floor),
      unit: unitNo.trim(),
      bedrooms: beds,
      baths,
      guests,
      m2: Number(m2),
      seaView: sea,
      garage,
      pet,
      channel: { type: 'owner' },
      prices: numericPrices,
      booked: [],
      ownerId: user!.id,
      verification: 'titulo',
      photos: photos.map((p) => p.src),
      view: sea ? 'frente' : 'lateral',
      createdAt: new Date().toISOString(),
    }
    publishUnit(unit)
    addRole('owner')
    setPublished(unit)
    window.scrollTo({ top: 0 })
  }

  const stepNames = [t('Edificio', 'Edifício'), t('Piso y unidad', 'Andar e unidade'), t('Distribución', 'Distribuição'), t('Tarifas', 'Tarifas'), t('Fotos', 'Fotos')]
  const mm = Math.floor(elapsed / 60)
  const ss = String(elapsed % 60).padStart(2, '0')

  if (published) {
    return (
      <div className="pt-28 pb-24 md:pt-36">
        <div className="shell flex max-w-3xl flex-col items-start gap-8">
          <CheckCircle size={44} weight="fill" className="text-ok" />
          <h1 className="f-display text-[clamp(2.2rem,5vw,3.75rem)]">{t('Tu unidad está cargada.', 'Sua unidade está cadastrada.')}</h1>
          <p className="text-[1.125rem] text-mute">
            {t(
              `La cargaste en ${mm} min ${ss} s. Falta un paso: subí en tu panel un documento que acredite la titularidad (título o boleto de compraventa). Cuando EVP lo valide, la unidad se publica como «Directo de Dueño».`,
              `Você cadastrou em ${mm} min ${ss} s. Falta uma etapa: envie no seu painel um documento que comprove a titularidade (escritura ou compromisso de compra e venda). Quando a EVP validar, a unidade é publicada como «Direto do Proprietário».`,
            )}
          </p>
          <InfoNote>
            {t('Así nadie puede publicar un departamento que no es suyo. Hasta la validación, solo vos ves la unidad.', 'Assim ninguém pode publicar um apartamento que não é seu. Até a validação, só você vê a unidade.')}
          </InfoNote>
          <div className="flex flex-wrap gap-3">
            <ButtonLink to="/panel" trailing>
              {t('Subir documento de titularidad', 'Enviar documento de titularidade')}
            </ButtonLink>
            <ButtonLink to={`/unidades/${published.id}`} variant="outline">
              {t('Ver vista previa', 'Ver pré-visualização')}
            </ButtonLink>
          </div>
        </div>
      </div>
    )
  }

  const err = (k: string) => (attempted ? errors[k] : undefined)

  return (
    <div className="pt-24 pb-24 md:pt-28">
      <div className="shell grid gap-12 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-16">
        <form onSubmit={submit} noValidate className="flex flex-col gap-8">
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between gap-4">
              <p className="text-[0.875rem] font-medium text-mute">
                {step < 5 ? t(`Paso ${step + 1} de 5 · ${stepNames[step]}`, `Etapa ${step + 1} de 5 · ${stepNames[step]}`) : t('Revisión final', 'Revisão final')}
              </p>
              <p className="f-num inline-flex items-center gap-1.5 text-[0.8125rem] text-mute" aria-label={t('Tiempo transcurrido', 'Tempo decorrido')}>
                <Timer size={16} />
                {mm}:{ss}
              </p>
            </div>
            <div className="grid grid-cols-5 gap-1.5" aria-hidden>
              {stepNames.map((s, i) => (
                <span key={s} className={cx('h-1 rounded-full transition-colors duration-500 ease-[var(--ease-out)]', i < step || step === 5 ? 'bg-ok' : i === step ? 'bg-ink' : 'bg-line')} />
              ))}
            </div>
          </div>

          <h1 ref={headingRef} tabIndex={-1} className="f-h2 text-[clamp(1.8rem,3.4vw,2.75rem)] outline-none">
            {step === 0 && t('¿En qué edificio está tu unidad?', 'Em qual edifício está sua unidade?')}
            {step === 1 && t('¿Qué piso y qué unidad?', 'Qual andar e qual unidade?')}
            {step === 2 && t('Distribución y comodidades', 'Distribuição e comodidades')}
            {step === 3 && t('Tus tarifas netas en USD', 'Suas tarifas líquidas em USD')}
            {step === 4 && t('Fotos del interior', 'Fotos do interior')}
            {step === 5 && t('Revisá y publicá', 'Revise e publique')}
          </h1>

          {step === 0 && (
            <div className="flex flex-col gap-6">
              <Field label={t('Edificio VIP', 'Edifício VIP')} htmlFor={`${fid}-b`} error={err('building')} hint={t('Solo figuran edificios certificados por EVP.', 'Só aparecem edifícios certificados pela EVP.')}>
                <select id={`${fid}-b`} className="field" value={buildingId} onChange={(e) => setBuildingId(e.target.value)} aria-invalid={!!err('building') || undefined}>
                  <option value="">{t('Elegí tu edificio…', 'Escolha seu edifício…')}</option>
                  {ZONES.map((z) => (
                    <optgroup key={z.id} label={z.name}>
                      {BUILDINGS.filter((x) => x.zone === z.id).map((x) => (
                        <option key={x.id} value={x.id}>
                          {x.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </Field>
              {b && (
                <div className="grid gap-5 rounded-[18px] bg-mist p-5 sm:grid-cols-[10rem_1fr]">
                  <div className="bezel">
                    <div className="aspect-[4/5]">
                      <BuildingVisual b={b} className="size-full" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Seal className="self-start" />
                    <p className="f-h3 mt-1 text-[1.125rem]">{b.name}</p>
                    <p className="text-[0.875rem] text-mute">
                      {b.address} · {ZONE_NAME[b.zone]}
                    </p>
                    <p className="f-num text-[0.875rem] text-mute">
                      {b.floors} {t('pisos', 'andares')} · {b.year} · {b.architects}
                    </p>
                    <Stars n={b.stars} />
                    <p className="mt-1 text-[0.875rem]">
                      {b.amenities.length} {t('amenities certificados, entre ellos', 'amenities certificados, entre eles')} {b.amenities.slice(0, 3).map((a) => AMENITIES[a][lang].toLowerCase()).join(', ')}.
                    </p>
                    <p className="text-[0.8125rem] text-mute">{t('No tenés que cargar nada de esto: ya forma parte de la ficha madre.', 'Você não precisa cadastrar nada disso: já faz parte da ficha técnica.')}</p>
                  </div>
                </div>
              )}
              <p className="text-[0.875rem] text-mute">
                {t('¿Tu edificio no está?', 'Seu edifício não está na lista?')}{' '}
                <Link to="/administraciones" className="font-medium text-marine-strong underline-offset-4 hover:underline">
                  {t('Proponelo para certificación', 'Proponha para certificação')}
                </Link>
              </p>
            </div>
          )}

          {step === 1 && (
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label={t('Piso', 'Andar')} htmlFor={`${fid}-f`} error={err('floor')}>
                <input id={`${fid}-f`} className="field" inputMode="numeric" value={floor} onChange={(e) => setFloor(e.target.value.replace(/\D/g, '').slice(0, 2))} aria-invalid={!!err('floor') || undefined} />
              </Field>
              <Field label={t('Unidad', 'Unidade')} htmlFor={`${fid}-u`} error={err('unit')} hint={t('Ej.: 1702, B-03', 'Ex.: 1702, B-03')}>
                <input id={`${fid}-u`} className="field" value={unitNo} onChange={(e) => setUnitNo(e.target.value.slice(0, 8))} aria-invalid={!!err('unit') || undefined} />
              </Field>
              <div className="sm:col-span-2">
                <InfoNote>{t('El número de unidad se usa para el contrato y el registro en portería.', 'O número da unidade é usado no contrato e no registro da portaria.')}</InfoNote>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col divide-y divide-line rounded-[16px] px-5 ring-1 ring-line">
                <Stepper label={t('Dormitorios', 'Quartos')} value={beds} min={1} max={6} onChange={setBeds} />
                <Stepper label={t('Baños', 'Banheiros')} value={baths} min={1} max={6} onChange={setBaths} />
                <Stepper label={t('Capacidad máxima de huéspedes', 'Capacidade máxima de hóspedes')} value={guests} min={1} max={14} onChange={setGuests} />
              </div>
              {err('guests') && <p className="text-[0.8125rem] text-bad" role="alert">{err('guests')}</p>}
              <div className="max-w-xs">
                <Field label={t('Superficie total (m²)', 'Área total (m²)')} htmlFor={`${fid}-m2`} error={err('m2')}>
                  <input id={`${fid}-m2`} className="field" inputMode="numeric" value={m2} onChange={(e) => setM2(e.target.value.replace(/\D/g, '').slice(0, 3))} aria-invalid={!!err('m2') || undefined} />
                </Field>
              </div>
              <div className="flex flex-wrap gap-2">
                <Toggle checked={sea} onChange={setSea} icon={<Waves size={16} />}>
                  {t('Vista al mar', 'Vista para o mar')}
                </Toggle>
                <Toggle checked={garage} onChange={setGarage} icon={<Car size={16} />}>
                  {t('Garage', 'Garagem')}
                </Toggle>
                <Toggle checked={pet} onChange={setPet} icon={<PawPrint size={16} />}>
                  Pet friendly
                </Toggle>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-[14px] bg-ocaso-soft p-4">
                <p className="text-[0.9375rem]">{t('Dejá vacío un período para reservarlo para tu uso.', 'Deixe um período vazio para reservá-lo para seu uso.')}</p>
                <Button type="button" variant="ink" size="sm" onClick={suggest} trailing={<Sparkle size={14} />}>
                  {t('Sugerir según el edificio', 'Sugerir pelo edifício')}
                </Button>
              </div>
              {PERIOD_GROUPS.map((g) => (
                <fieldset key={g.label.es} className="flex flex-col gap-3">
                  <legend className="mb-1 text-[0.8125rem] font-semibold text-mute">{g.label[lang]}</legend>
                  <div className={cx('grid gap-3', g.ids.length === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2')}>
                    {g.ids.map((id) => {
                      const v = prices[id] ?? ''
                      const n = Number(v)
                      return (
                        <label key={id} className="flex flex-col gap-1.5">
                          <span className="text-[0.875rem] font-medium">{PERIOD_BY_ID[id].name[lang]}</span>
                          <span className="relative">
                            <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-[0.875rem] text-mute">USD</span>
                            <input
                              className="field f-num pl-14"
                              inputMode="numeric"
                              value={v ? Number(v).toLocaleString(lang === 'es' ? 'es-UY' : 'pt-BR') : ''}
                              onChange={(e) => setPrices({ ...prices, [id]: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                              placeholder="—"
                            />
                          </span>
                          <span className="f-num text-[0.75rem] text-mute">{n ? t(`Huésped paga ${usd(breakdown(n).total, lang)}`, `Hóspede paga ${usd(breakdown(n).total, lang)}`) : t('No se ofrece', 'Não oferecido')}</span>
                        </label>
                      )
                    })}
                  </div>
                </fieldset>
              ))}
              {err('prices') && <p className="text-[0.875rem] text-bad" role="alert">{err('prices')}</p>}
            </div>
          )}

          {step === 4 && (
            <div className="flex flex-col gap-6">
              <div
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragOver(true)
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setDragOver(false)
                  addFiles(e.dataTransfer.files)
                }}
                className={cx('flex flex-col items-center gap-4 rounded-[18px] border-2 border-dashed px-6 py-10 text-center transition-colors duration-200', dragOver ? 'border-marine bg-marine-soft' : 'border-line-strong bg-mist')}
              >
                <UploadSimple size={32} weight="light" className="text-marine-strong" />
                <div>
                  <p className="font-semibold">{t('Arrastrá tus fotos acá', 'Arraste suas fotos aqui')}</p>
                  <p className="text-[0.875rem] text-mute">{t(`Mínimo ${MIN_PHOTOS}: living, dormitorios y terraza o vista. JPG o PNG.`, `Mínimo ${MIN_PHOTOS}: sala, quartos e terraço ou vista. JPG ou PNG.`)}</p>
                </div>
                <input ref={fileRef} type="file" accept="image/*" multiple className="sr-only" id={`${fid}-files`} onChange={(e) => addFiles(e.target.files)} />
                <Button type="button" variant="ink" size="sm" onClick={() => fileRef.current?.click()} loading={processing}>
                  {t('Elegir fotos', 'Escolher fotos')}
                </Button>
              </div>
              {photos.length > 0 && (
                <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {photos.map((p, i) => (
                    <li key={p.id} className="flex flex-col gap-2">
                      <div className="relative aspect-[4/3] overflow-hidden rounded-[12px] bg-mist">
                        <img src={p.src} alt={tagLabel[p.tag]} className="size-full object-cover" />
                        {i === 0 && (
                          <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[0.75rem] font-semibold">
                            <Star size={12} weight="fill" className="text-ocaso-strong" />
                            {t('Portada', 'Capa')}
                          </span>
                        )}
                        <div className="absolute top-2 right-2 flex gap-1">
                          {i > 0 && (
                            <button type="button" onClick={() => setPhotos((ph) => [p, ...ph.filter((x) => x.id !== p.id)])} className="flex size-9 items-center justify-center rounded-full bg-white/90 hover:bg-white" aria-label={t('Usar como portada', 'Usar como capa')}>
                              <Star size={16} />
                            </button>
                          )}
                          <button type="button" onClick={() => setPhotos((ph) => ph.filter((x) => x.id !== p.id))} className="flex size-9 items-center justify-center rounded-full bg-white/90 hover:bg-white" aria-label={t('Quitar foto', 'Remover foto')}>
                            <Trash size={16} />
                          </button>
                        </div>
                      </div>
                      <select className="field min-h-10 py-1.5 text-[0.875rem]" value={p.tag} aria-label={t('Ambiente de la foto', 'Ambiente da foto')} onChange={(e) => setPhotos((ph) => ph.map((x) => (x.id === p.id ? { ...x, tag: e.target.value as PhotoTag } : x)))}>
                        {(Object.keys(tagLabel) as PhotoTag[]).map((k) => (
                          <option key={k} value={k}>
                            {tagLabel[k]}
                          </option>
                        ))}
                      </select>
                    </li>
                  ))}
                </ul>
              )}
              <ul className="flex flex-wrap gap-2 text-[0.8125rem]">
                <li className={cx('inline-flex items-center gap-1.5 rounded-full px-3 py-1', photos.length >= MIN_PHOTOS ? 'bg-ok-soft' : 'bg-mist text-mute')}>
                  {photos.length >= MIN_PHOTOS ? <Check size={14} /> : <ImageSquare size={14} />}
                  {photos.length}/{MIN_PHOTOS} {t('fotos', 'fotos')}
                </li>
                {REQUIRED_TAGS.map((tg) => (
                  <li key={tg} className={cx('inline-flex items-center gap-1.5 rounded-full px-3 py-1', missingTags.includes(tg) ? 'bg-mist text-mute' : 'bg-ok-soft')}>
                    {missingTags.includes(tg) ? <ImageSquare size={14} /> : <Check size={14} />}
                    {tagLabel[tg]}
                  </li>
                ))}
              </ul>
              {err('photos') && <p className="text-[0.875rem] text-bad" role="alert">{err('photos')}</p>}
            </div>
          )}

          {step === 5 && b && (
            <dl className="flex flex-col divide-y divide-line rounded-[18px] ring-1 ring-line">
              {[
                [t('Edificio', 'Edifício'), `${b.name} · ${ZONE_NAME[b.zone]}`, 0],
                [t('Unidad', 'Unidade'), `${t('Piso', 'Andar')} ${floor} · ${unitNo}`, 1],
                [t('Distribución', 'Distribuição'), `${beds} ${t('dorm.', 'quartos')} · ${baths} ${t('baños', 'banh.')} · ${t('hasta', 'até')} ${guests} · ${m2} m²${sea ? ` · ${t('vista al mar', 'vista mar')}` : ''}${garage ? ' · garage' : ''}${pet ? ' · pet friendly' : ''}`, 2],
                [t('Tarifas', 'Tarifas'), (Object.entries(numericPrices) as [PeriodId, number][]).map(([k, v]) => `${PERIOD_BY_ID[k].short[lang]} ${usd(v, lang)}`).join(' · '), 3],
                [t('Fotos', 'Fotos'), `${photos.length} ${t('fotos', 'fotos')}`, 4],
              ].map(([k, v, s]) => (
                <div key={k as string} className="flex flex-col gap-1 p-5 sm:flex-row sm:items-baseline sm:gap-6">
                  <dt className="w-32 shrink-0 text-[0.875rem] text-mute">{k}</dt>
                  <dd className="f-num flex-1">{v}</dd>
                  <button type="button" onClick={() => setStep(s as number)} className="self-start text-[0.875rem] font-medium text-marine-strong underline-offset-4 hover:underline">
                    {t('Editar', 'Editar')}
                  </button>
                </div>
              ))}
            </dl>
          )}

          <div className="flex flex-col-reverse gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
            {step > 0 ? (
              <Button type="button" variant="ghost" onClick={() => setStep(step - 1)}>
                {t('Atrás', 'Voltar')}
              </Button>
            ) : (
              <span />
            )}
            <Button type="submit" size="lg" trailing>
              {step < 4 ? t('Continuar', 'Continuar') : step === 4 ? t('Revisar', 'Revisar') : t('Publicar unidad', 'Publicar unidade')}
            </Button>
          </div>
        </form>

        <aside className="flex flex-col gap-5 lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-[22px] bg-ink p-6 text-on-ink on-ink">
            <p className="f-h3 text-[1.125rem]">{t('Primer año: 0% de comisión', 'Primeiro ano: 0% de comissão')}</p>
            <p className="mt-2 text-[0.9375rem] text-on-ink-mute">
              {t('Cobrás el 100% de tu tarifa neta. El huésped paga aparte una tarifa de gestión del 5%.', 'Você recebe 100% da sua tarifa líquida. O hóspede paga à parte uma taxa de gestão de 5%.')}
            </p>
          </div>
          <ul className="flex flex-col gap-3 px-1 text-[0.9375rem]">
            {stepNames.map((s, i) => (
              <li key={s} className={cx('flex items-center gap-3', i > step && 'text-mute')}>
                <span className={cx('f-num flex size-7 items-center justify-center rounded-full text-[0.75rem] font-semibold', i < step ? 'bg-ok text-white' : i === step ? 'bg-ink text-on-ink' : 'bg-mist')}>
                  {i < step ? <Check size={12} weight="bold" /> : i + 1}
                </span>
                {s}
              </li>
            ))}
          </ul>
          <p className="px-1 text-[0.8125rem] text-mute">
            {t('Publicás como', 'Publicando como')} {user?.name || user?.email}. {t('Tus datos personales no se muestran en la publicación.', 'Seus dados pessoais não aparecem no anúncio.')}
          </p>
        </aside>
      </div>
    </div>
  )
}

