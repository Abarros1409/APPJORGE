import type { L10n } from './i18n'
import type { PeriodId } from './periods'

/*
 * DEMO CATALOG — buildings, architects and agencies below are fictional.
 * In production every "Ficha Madre" is produced and certified by EVP
 * (docs/contexto_maestro_evp.md §4.A) and served by the backend.
 */

export type ZoneId = 'mansa' | 'brava' | 'barra' | 'manantiales' | 'peninsula'

export const ZONES: { id: ZoneId; name: string; blurb: L10n }[] = [
  { id: 'mansa', name: 'Mansa', blurb: { es: 'La bahía calma y los atardeceres sobre el agua.', pt: 'A baía calma e os pores do sol sobre a água.' } },
  { id: 'brava', name: 'Brava', blurb: { es: 'El Atlántico abierto, las olas y los paradores.', pt: 'O Atlântico aberto, as ondas e os paradores.' } },
  { id: 'peninsula', name: 'Península', blurb: { es: 'El puerto, la calle Gorlero y el faro a pie.', pt: 'O porto, a rua Gorlero e o farol a pé.' } },
  { id: 'barra', name: 'La Barra', blurb: { es: 'El puente ondulado, el arroyo y el pinar.', pt: 'A ponte ondulada, o arroio e o pinheiral.' } },
  { id: 'manantiales', name: 'Manantiales', blurb: { es: 'Bikini, médanos altos y silencio.', pt: 'Bikini, dunas altas e silêncio.' } },
]

export const ZONE_NAME = Object.fromEntries(ZONES.map((z) => [z.id, z.name])) as Record<ZoneId, string>

export type AmenityId =
  | 'pool_in'
  | 'pool_out'
  | 'spa'
  | 'gym'
  | 'beach'
  | 'courts'
  | 'cinema'
  | 'security'
  | 'sauna'
  | 'kids'
  | 'concierge'
  | 'cowork'

export const AMENITIES: Record<AmenityId, L10n> = {
  pool_in: { es: 'Piscina climatizada interior', pt: 'Piscina aquecida interna' },
  pool_out: { es: 'Piscina exterior', pt: 'Piscina externa' },
  spa: { es: 'Spa y masajes', pt: 'Spa e massagens' },
  gym: { es: 'Gimnasio equipado', pt: 'Academia equipada' },
  beach: { es: 'Servicio de playa', pt: 'Serviço de praia' },
  courts: { es: 'Canchas de tenis y pádel', pt: 'Quadras de tênis e padel' },
  cinema: { es: 'Microcine', pt: 'Microcinema' },
  security: { es: 'Seguridad 24 h', pt: 'Segurança 24 h' },
  sauna: { es: 'Sauna seco y húmedo', pt: 'Sauna seca e úmida' },
  kids: { es: 'Kids club', pt: 'Kids club' },
  concierge: { es: 'Conserjería', pt: 'Concierge' },
  cowork: { es: 'Business center', pt: 'Business center' },
}

export type SceneShape = 'tower' | 'curved' | 'slab' | 'twin' | 'stepped' | 'lowrise'
export type SceneTime = 'dawn' | 'day' | 'golden' | 'dusk' | 'night'

export type Building = {
  id: string
  name: string
  zone: ZoneId
  address: string
  lat: number
  lng: number
  /** Position on the illustrated map (viewBox 1000×640). */
  map: { x: number; y: number }
  year: number
  floors: number
  units: number
  architects: string
  stars: 4 | 5
  amenities: AmenityId[]
  certifiedAt: string
  scene: { shape: SceneShape; time: SceneTime; seed: number }
  tagline: L10n
  description: L10n
}

export const BUILDINGS: Building[] = [
  {
    id: 'altamar-brava',
    name: 'Altamar Brava',
    zone: 'brava',
    address: 'Rambla Lorenzo Batlle Pacheco, parada 5',
    lat: -34.9472,
    lng: -54.9181,
    map: { x: 640, y: 372 },
    year: 2019,
    floors: 32,
    units: 128,
    architects: 'Ferrés Lanza Arquitectos',
    stars: 5,
    amenities: ['pool_in', 'pool_out', 'spa', 'gym', 'beach', 'cinema', 'security', 'sauna', 'concierge'],
    certifiedAt: '2026-09-12',
    scene: { shape: 'tower', time: 'golden', seed: 11 },
    tagline: { es: 'Treinta y dos pisos frente al Atlántico abierto.', pt: 'Trinta e dois andares de frente para o Atlântico aberto.' },
    description: {
      es: 'Torre de vidrio y hormigón blanco con balcones corridos de borde curvo. Cada unidad mira al mar sin obstáculos. En la planta baja, un deck de 1.800 m² con piscina exterior y servicio de playa propio en la parada 5.',
      pt: 'Torre de vidro e concreto branco com sacadas corridas de borda curva. Cada unidade tem vista livre para o mar. No térreo, um deck de 1.800 m² com piscina externa e serviço de praia próprio na parada 5.',
    },
  },
  {
    id: 'mirador-mansa',
    name: 'Mirador de la Mansa',
    zone: 'mansa',
    address: 'Rambla Claudio Williman, parada 9',
    lat: -34.9381,
    lng: -54.9622,
    map: { x: 330, y: 344 },
    year: 2016,
    floors: 25,
    units: 96,
    architects: 'Estudio Arocena Rius',
    stars: 5,
    amenities: ['pool_in', 'pool_out', 'spa', 'gym', 'beach', 'courts', 'kids', 'security', 'concierge'],
    certifiedAt: '2026-08-30',
    scene: { shape: 'curved', time: 'dusk', seed: 23 },
    tagline: { es: 'Atardeceres sobre la bahía desde cada living.', pt: 'Pores do sol sobre a baía de cada sala.' },
    description: {
      es: 'Volumen ondulado que sigue la curva de la bahía. Todas las unidades orientadas al oeste, hacia el sol de la tarde y la isla Gorriti. Parque de 2 hectáreas con canchas y kids club.',
      pt: 'Volume ondulado que acompanha a curva da baía. Todas as unidades voltadas para o oeste, para o sol da tarde e a ilha Gorriti. Parque de 2 hectares com quadras e kids club.',
    },
  },
  {
    id: 'faro-peninsular',
    name: 'Faro Peninsular',
    zone: 'peninsula',
    address: 'Calle 20 esquina 27, Península',
    lat: -34.9618,
    lng: -54.9466,
    map: { x: 494, y: 452 },
    year: 2012,
    floors: 18,
    units: 64,
    architects: 'Bonomi Carrau',
    stars: 4,
    amenities: ['pool_in', 'gym', 'sauna', 'security', 'concierge', 'cowork'],
    certifiedAt: '2026-09-04',
    scene: { shape: 'slab', time: 'day', seed: 31 },
    tagline: { es: 'A dos cuadras de Gorlero y del puerto.', pt: 'A duas quadras da Gorlero e do porto.' },
    description: {
      es: 'Edificio de líneas horizontales en el corazón de la península, con vista a ambas costas desde los pisos altos. Todo queda a pie: restaurantes, el puerto y el faro.',
      pt: 'Edifício de linhas horizontais no coração da península, com vista para as duas costas nos andares altos. Tudo a pé: restaurantes, o porto e o farol.',
    },
  },
  {
    id: 'pinares-barra',
    name: 'Pinares de La Barra',
    zone: 'barra',
    address: 'Ruta 10 km 161, La Barra',
    lat: -34.9148,
    lng: -54.8651,
    map: { x: 878, y: 252 },
    year: 2021,
    floors: 5,
    units: 22,
    architects: 'Taller Mazzini Otero',
    stars: 5,
    amenities: ['pool_out', 'spa', 'gym', 'beach', 'security', 'concierge'],
    certifiedAt: '2026-09-20',
    scene: { shape: 'lowrise', time: 'dawn', seed: 47 },
    tagline: { es: 'Veintidós unidades entre pinos, a 80 m del mar.', pt: 'Vinte e duas unidades entre pinheiros, a 80 m do mar.' },
    description: {
      es: 'Arquitectura baja de madera y piedra, escondida en el pinar. Pocas unidades, accesos privados y un spa con vista al médano. La discreción de La Barra en su versión más silenciosa.',
      pt: 'Arquitetura baixa de madeira e pedra, escondida no pinheiral. Poucas unidades, acessos privativos e um spa com vista para a duna. A discrição de La Barra em sua versão mais silenciosa.',
    },
  },
  {
    id: 'atlantica-manantiales',
    name: 'Atlántica Manantiales',
    zone: 'manantiales',
    address: 'Ruta 10 km 164, Manantiales',
    lat: -34.9002,
    lng: -54.8353,
    map: { x: 952, y: 230 },
    year: 2022,
    floors: 4,
    units: 18,
    architects: 'Galli Sienra Arquitectos',
    stars: 5,
    amenities: ['pool_in', 'pool_out', 'spa', 'gym', 'beach', 'cinema', 'security'],
    certifiedAt: '2026-10-02',
    scene: { shape: 'stepped', time: 'golden', seed: 53 },
    tagline: { es: 'Terrazas escalonadas sobre los médanos de Bikini.', pt: 'Terraços escalonados sobre as dunas de Bikini.' },
    description: {
      es: 'Cuatro niveles que bajan en terrazas hacia la playa Bikini. Cada unidad tiene su propia terraza jardín y deck con ducha exterior.',
      pt: 'Quatro níveis que descem em terraços até a praia Bikini. Cada unidade tem seu próprio terraço jardim e deck com ducha externa.',
    },
  },
  {
    id: 'torre-gorriti',
    name: 'Torre Gorriti',
    zone: 'mansa',
    address: 'Rambla Claudio Williman, parada 4',
    lat: -34.9503,
    lng: -54.9449,
    map: { x: 430, y: 384 },
    year: 2018,
    floors: 28,
    units: 112,
    architects: 'Ferrés Lanza Arquitectos',
    stars: 5,
    amenities: ['pool_in', 'pool_out', 'spa', 'gym', 'beach', 'courts', 'cinema', 'kids', 'security', 'sauna'],
    certifiedAt: '2026-09-15',
    scene: { shape: 'twin', time: 'night', seed: 61 },
    tagline: { es: 'Dos torres gemelas a pasos de la península.', pt: 'Duas torres gêmeas a passos da península.' },
    description: {
      es: 'Dos torres unidas por un puente de vidrio en el piso 14, con vista a la isla Gorriti. A diez minutos a pie de la península, sin depender del auto.',
      pt: 'Duas torres unidas por uma ponte de vidro no 14º andar, com vista para a ilha Gorriti. A dez minutos a pé da península, sem depender do carro.',
    },
  },
  {
    id: 'brava-norte',
    name: 'Brava Norte Residences',
    zone: 'brava',
    address: 'Rambla Lorenzo Batlle Pacheco, parada 10',
    lat: -34.9352,
    lng: -54.8949,
    map: { x: 760, y: 318 },
    year: 2020,
    floors: 22,
    units: 80,
    architects: 'Estudio Arocena Rius',
    stars: 4,
    amenities: ['pool_in', 'pool_out', 'gym', 'beach', 'courts', 'security', 'kids'],
    certifiedAt: '2026-09-28',
    scene: { shape: 'stepped', time: 'day', seed: 71 },
    tagline: { es: 'Terrazas profundas en la Brava tranquila.', pt: 'Terraços profundos na Brava tranquila.' },
    description: {
      es: 'Torre de perfil escalonado con terrazas de hasta 40 m². Está en el tramo más calmo de la Brava, cerca de los paradores y lejos del tránsito.',
      pt: 'Torre de perfil escalonado com terraços de até 40 m². Fica no trecho mais calmo da Brava, perto dos paradores e longe do trânsito.',
    },
  },
  {
    id: 'bahia-alta',
    name: 'Bahía Alta',
    zone: 'mansa',
    address: 'Rambla Claudio Williman, parada 14',
    lat: -34.9297,
    lng: -54.9802,
    map: { x: 205, y: 310 },
    year: 2014,
    floors: 24,
    units: 88,
    architects: 'Bonomi Carrau',
    stars: 4,
    amenities: ['pool_in', 'pool_out', 'gym', 'sauna', 'courts', 'security'],
    certifiedAt: '2026-10-05',
    scene: { shape: 'slab', time: 'dusk', seed: 83 },
    tagline: { es: 'La Mansa amplia, con parque y canchas.', pt: 'A Mansa ampla, com parque e quadras.' },
    description: {
      es: 'Torre clásica de la Mansa, renovada en 2024: carpinterías nuevas, lobby rediseñado y piscina climatizada. Es una de las opciones favoritas de las familias por su parque y sus canchas.',
      pt: 'Torre clássica da Mansa, renovada em 2024: esquadrias novas, lobby redesenhado e piscina aquecida. É uma das opções preferidas das famílias pelo parque e pelas quadras.',
    },
  },
  {
    id: 'puerto-arena',
    name: 'Puerto Arena',
    zone: 'peninsula',
    address: 'Rambla Artigas y calle 10, frente al puerto',
    lat: -34.9645,
    lng: -54.9512,
    map: { x: 462, y: 500 },
    year: 2017,
    floors: 12,
    units: 40,
    architects: 'Taller Mazzini Otero',
    stars: 5,
    amenities: ['pool_in', 'spa', 'gym', 'security', 'concierge', 'cinema'],
    certifiedAt: '2026-09-09',
    scene: { shape: 'curved', time: 'golden', seed: 97 },
    tagline: { es: 'Los veleros del puerto, debajo de su terraza.', pt: 'Os veleiros do porto, logo abaixo do seu terraço.' },
    description: {
      es: 'Edificio boutique de doce pisos frente a la marina. Solo hay cuatro unidades por piso y un spa en el rooftop con vista al puerto y a la isla Gorriti.',
      pt: 'Edifício boutique de doze andares em frente à marina. São apenas quatro unidades por andar e um spa no rooftop com vista para o porto e a ilha Gorriti.',
    },
  },
  {
    id: 'lobos-tower',
    name: 'Lobos Tower',
    zone: 'brava',
    address: 'Rambla Lorenzo Batlle Pacheco, parada 2',
    lat: -34.9541,
    lng: -54.9332,
    map: { x: 574, y: 398 },
    year: 2023,
    floors: 36,
    units: 150,
    architects: 'Galli Sienra Arquitectos',
    stars: 5,
    amenities: ['pool_in', 'pool_out', 'spa', 'gym', 'beach', 'courts', 'cinema', 'kids', 'security', 'sauna', 'concierge', 'cowork'],
    certifiedAt: '2026-09-01',
    scene: { shape: 'tower', time: 'night', seed: 109 },
    tagline: { es: 'La torre más alta de la Brava, con vista a la isla de Lobos.', pt: 'A torre mais alta da Brava, com vista para a ilha de Lobos.' },
    description: {
      es: 'Treinta y seis pisos con una vista que va desde la península hasta la isla de Lobos. Tiene la oferta de amenities más completa de Punta del Este, con business center incluido.',
      pt: 'Trinta e seis andares com uma vista que vai da península até a ilha de Lobos. Tem a oferta de amenities mais completa de Punta del Este, com business center incluído.',
    },
  },
]

export const BUILDING_BY_ID = Object.fromEntries(BUILDINGS.map((b) => [b.id, b])) as Record<string, Building>

export type Channel = { type: 'owner' } | { type: 'agency'; agency: string }

export type Prices = Partial<Record<PeriodId, number>>

export type Unit = {
  id: string
  buildingId: string
  floor: number
  unit: string
  bedrooms: number
  baths: number
  guests: number
  m2: number
  seaView: boolean
  garage: boolean
  pet: boolean
  channel: Channel
  prices: Prices
  booked: PeriodId[]
  ownerId?: string
  photos?: string[]
  /** View orientation used for scenes. */
  view: 'frente' | 'lateral' | 'parque'
  createdAt?: string
  /**
   * Ownership verification. Undefined = verified and public.
   * 'titulo': waiting for the owner's title document; 'revision': EVP is checking it.
   * Units are hidden from guests until verified (prevents listing someone else's flat).
   */
  verification?: 'titulo' | 'revision'
  titleDoc?: { name: string; at: string }
}

const r50 = (n: number) => Math.round(n / 50) * 50

/** Derive the full seasonal price sheet from the 1st-half-of-January price. */
function sheet(ene1: number, opts: { temporada?: boolean; dic?: boolean } = {}): Prices {
  const ene2 = r50(ene1 * 0.94)
  const feb1 = r50(ene1 * 0.88)
  const feb2 = r50(ene1 * 0.74)
  const p: Prices = {
    ene1,
    ene2,
    ene: r50((ene1 + ene2) * 0.93),
    feb1,
    feb2,
    feb: r50((feb1 + feb2) * 0.93),
  }
  if (opts.dic !== false) p.dic = r50(ene1 * 1.05)
  if (opts.temporada) p.temporada = r50(ene1 * 3.9)
  return p
}

type Seed = [
  id: string,
  building: string,
  floor: number,
  unit: string,
  beds: number,
  baths: number,
  guests: number,
  m2: number,
  flags: string, // s = sea view, g = garage, p = pet friendly
  channel: string | null, // null = owner direct
  ene1: number,
  booked: PeriodId[],
  extra?: { temporada?: boolean; dic?: boolean; owner?: string; view?: Unit['view'] },
]

const SEEDS: Seed[] = [
  ['u01', 'altamar-brava', 21, '2101', 3, 3, 6, 168, 'sg', null, 4200, ['ene1'], { temporada: true, owner: 'demo-owner' }],
  ['u02', 'altamar-brava', 14, '1403', 2, 2, 4, 118, 'sgp', null, 3100, ['feb2']],
  ['u03', 'altamar-brava', 28, '2801', 4, 4, 8, 240, 'sg', 'Costa Este Propiedades', 6900, ['ene'], { temporada: true }],
  ['u04', 'mirador-mansa', 9, '902', 2, 2, 5, 124, 'sg', null, 2950, []],
  ['u05', 'mirador-mansa', 17, '1701', 3, 3, 6, 176, 'sgp', null, 3800, ['ene2', 'feb1'], { owner: 'demo-owner', temporada: true }],
  ['u06', 'mirador-mansa', 22, '2204', 4, 3, 8, 210, 'sg', 'Bahía Real Estate', 5200, []],
  ['u07', 'faro-peninsular', 6, '602', 1, 1, 2, 64, 'g', null, 1650, ['ene1', 'ene2'], { view: 'lateral' }],
  ['u08', 'faro-peninsular', 15, '1501', 3, 2, 6, 142, 'sgp', null, 3200, []],
  ['u09', 'pinares-barra', 2, 'B-201', 3, 3, 6, 190, 'gp', null, 5400, ['ene1'], { view: 'parque' }],
  ['u10', 'pinares-barra', 4, 'A-402', 2, 2, 4, 128, 'sgp', 'Costa Este Propiedades', 4100, []],
  ['u11', 'atlantica-manantiales', 3, 'T3', 4, 4, 8, 260, 'sgp', null, 7800, ['ene'], { temporada: true }],
  ['u12', 'atlantica-manantiales', 1, 'T1', 2, 2, 4, 132, 'sp', null, 4300, [], { owner: 'demo-owner' }],
  ['u13', 'torre-gorriti', 19, 'N-1902', 3, 2, 6, 150, 'sg', null, 3350, ['feb1']],
  ['u14', 'torre-gorriti', 8, 'S-803', 2, 2, 4, 104, 'g', null, 2250, [], { view: 'lateral' }],
  ['u15', 'torre-gorriti', 25, 'S-2501', 4, 4, 8, 228, 'sgp', 'Bahía Real Estate', 6100, ['ene2'], { temporada: true }],
  ['u16', 'brava-norte', 12, '1202', 3, 3, 6, 160, 'sgp', null, 3450, []],
  ['u17', 'brava-norte', 5, '503', 2, 1, 4, 96, 'g', null, 2100, ['ene1'], { view: 'lateral' }],
  ['u18', 'bahia-alta', 16, '1604', 3, 2, 6, 138, 'sgp', null, 2850, ['feb2']],
  ['u19', 'bahia-alta', 10, '1001', 2, 2, 5, 112, 'sg', 'Costa Este Propiedades', 2400, []],
  ['u20', 'puerto-arena', 11, '1102', 2, 2, 4, 120, 'sg', null, 3600, ['ene1', 'feb1']],
  ['u21', 'puerto-arena', 7, '701', 3, 3, 6, 158, 'sgp', null, 4250, []],
  ['u22', 'lobos-tower', 33, '3301', 4, 4, 8, 255, 'sg', null, 7200, [], { temporada: true }],
  ['u23', 'lobos-tower', 18, '1806', 2, 2, 4, 110, 'sgp', null, 3000, ['ene2']],
  ['u24', 'lobos-tower', 26, '2603', 3, 3, 6, 172, 'sg', 'Bahía Real Estate', 4600, ['feb']],
]

export const UNITS: Unit[] = SEEDS.map(([id, buildingId, floor, unit, bedrooms, baths, guests, m2, flags, channel, ene1, booked, extra]) => ({
  id,
  buildingId,
  floor,
  unit,
  bedrooms,
  baths,
  guests,
  m2,
  seaView: flags.includes('s'),
  garage: flags.includes('g'),
  pet: flags.includes('p'),
  channel: channel ? { type: 'agency', agency: channel } : { type: 'owner' },
  prices: sheet(ene1, { temporada: extra?.temporada }),
  booked,
  ownerId: extra?.owner,
  view: extra?.view ?? (flags.includes('s') ? 'frente' : 'lateral'),
}))

export const DEMO_OWNER = { id: 'demo-owner', name: 'Valentina Rossi', email: 'valentina@ejemplo.com' }
