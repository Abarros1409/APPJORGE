# EVP · Edificios VIP Punta del Este

Prototipo funcional de la web app (PWA responsiva) para alquiler temporario en edificios VIP certificados de Punta del Este. Contexto de negocio: [`docs/contexto_maestro_evp.md`](docs/contexto_maestro_evp.md).

## Cómo correrlo

```bash
npm install
```

```bash
npm run dev
```

Abre en `http://localhost:5173`. Para el build de producción (incluye service worker offline):

```bash
npm run build && npm run preview
```

## Qué incluye (las 8 pantallas del pliego)

| Ruta | Pantalla | Funciones |
|---|---|---|
| `/` | Home del huésped | Hero con storytelling (de la tarde a la noche al hacer scroll), buscador por zona/edificio + período + huéspedes, carrusel de edificios, "cómo funciona", mapa de zonas y comparativa con portales masivos |
| `/buscar` | Resultados | Lista + mapa. Filtros por zona, edificio, período fijo, rango USD, dormitorios, baños, huéspedes, vista al mar, garage, pet friendly y "Directo de Dueño" o "Inmobiliaria Aliada". Orden por precio. Los filtros quedan en la URL |
| `/edificios`, `/edificios/:id` | Ficha madre del edificio | Ubicación y coordenadas, año, pisos, unidades, arquitectos, categoría, checklist de amenities verificados, fecha de certificación y unidades del edificio |
| `/unidades/:id` | Ficha de la unidad | Galería, plano de planta generado, selector de período (quincena, mes, temporada) con disponibilidad real y desglose del precio: neto + tarifa del 5% |
| `/reservar/:id` | Checkout | 3 pasos: datos del huésped → contrato de temporada (Uruguay) + reglamento + firma digital → pago con tarjeta (Stripe/dLocal) o PIX (dLocal/EBANX) en custodia |
| `/reserva/:code`, `/contrato/:code` | Reserva | Estado de la custodia (contrato → pago → check-in → liberación 24–48 h), inventario digital de ingreso y contrato imprimible o en PDF |
| `/propietarios`, `/propietarios/publicar` | Propietarios | Landing (0% año 1, privacidad, calculadora) y formulario ágil de 5 pasos: edificio → piso/unidad → distribución → tarifas USD → fotos (mín. 5, con living, dormitorio y terraza) |
| `/panel` | Panel del propietario | Montos en custodia y transferidos, ocupación por período de cada unidad y reservas con su estado de liquidación |
| `/administraciones` | Administraciones y portería | Propuesta de valor, proceso de alianza y formulario de relevamiento |

Interfaz en **español y portugués** (selector ES/PT; detecta el idioma del navegador). Precios siempre en USD.

## Importante: qué es de demostración

- **Catálogo ficticio.** Los 10 edificios, los arquitectos y las inmobiliarias son inventados.
- **Ilustraciones en lugar de fotos.** Las imágenes de los edificios son ilustraciones arquitectónicas procedurales (`src/components/ArchScene.tsx`) hasta que EVP produzca las fotos profesionales. Cada unidad acepta `photos[]`: las fotos que carga el propietario se muestran tal cual.
- **Pagos simulados.** No se conecta con Stripe, dLocal ni EBANX y no se cobra nada. Tarjeta de prueba: `4242 4242 4242 4242`.
- **Datos guardados solo en el navegador.** Viven en `localStorage`; el botón "Reiniciar datos de demo" del pie de página los resetea. En producción esto lo reemplaza un backend.
- **Contrato sin validar.** El texto en `src/components/Contract.tsx` es un **borrador modelo**: tiene que revisarlo un escribano o abogado uruguayo.

## Stack

React 19 · React Router 7 · Vite 7 · Tailwind CSS 4 · GSAP (ScrollTrigger) · Phosphor Icons · Archivo Variable (self-hosted). Sin backend.

## Diseño

- `PRODUCT.md`: usuarios, personalidad de marca, anti-referencias y principios.
- `DESIGN.md`: paleta OKLCH "Ocaso en la Mansa", tipografía, forma, motion e imaginería.
- `.claude/skills/`: las skills de diseño usadas (ver `CLAUDE.md`).

Verificado con axe-core (WCAG 2.1 AA, sin violaciones en las 12 rutas), con el detector de anti-patrones de `impeccable` (sin hallazgos) y con flujos end-to-end en Playwright (reserva completa y publicación con fotos).
