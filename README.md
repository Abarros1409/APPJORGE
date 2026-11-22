# EVP · Edificios VIP Punta del Este

Prototipo funcional de la web app (PWA responsiva) para promocionar el alquiler temporario de unidades en edificios VIP certificados de Punta del Este.

**Modelo vigente:** EVP es una plataforma de promoción, no una inmobiliaria. El interesado consulta directo al propietario; EVP no cobra comisión ni procesa pagos, y publicar es gratis el primer año. Ver [`docs/actualizacion_modelo_2026-11.md`](docs/actualizacion_modelo_2026-11.md), que actualiza el [contexto maestro](docs/contexto_maestro_evp.md).

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
| `/edificios`, `/edificios/:id` | Ficha madre del edificio | Ubicación y coordenadas, año, pisos, unidades, distancia a la playa, ascensores, mascotas, arquitectos, categoría, 29 amenities en 6 grupos, normas de convivencia, sitio web, fecha de certificación y unidades del edificio. Plantilla de carga: [`docs/plantilla_ficha_edificio.md`](docs/plantilla_ficha_edificio.md) |
| `/unidades/:id` | Ficha de la unidad | Galería, plano de planta generado, selector de período (quincena, mes, temporada) con disponibilidad, precio del propietario sin cargos y "Reportar publicación" |
| `/consultar/:id` | Consulta directa | Email verificado → período, datos, mensaje prearmado y autorización para compartir los datos con el anunciante. Al enviar: contacto del propietario (si lo cargó) y consejos para alquilar seguro |
| `/propietarios`, `/propietarios/publicar` | Propietarios | Landing (0% año 1, privacidad, calculadora) y formulario ágil de 5 pasos: edificio → piso/unidad → distribución → tarifas USD → fotos (mín. 5, con living, dormitorio y terraza) |
| `/panel` | Panel del propietario | Consultas recibidas (responder por WhatsApp o email, "Se lo alquilé", descartar), disponibilidad por período que marca el dueño, contacto para interesados y verificación de titularidad |
| `/administraciones` | Administraciones y portería | Propuesta de valor, proceso de alianza y formulario de relevamiento |

## Cuentas y seguridad

| Ruta | Qué hace |
|---|---|
| `/ingresar` | Ingreso sin contraseña: código de 6 dígitos por email y, para propietarios, un segundo código por SMS |
| `/cuenta` | Perfil, mis consultas, unidades guardadas, verificación en dos pasos, dispositivos con sesión abierta, descargar mis datos y eliminar la cuenta |

- **Cuentas de demo:**
  - `valentina@ejemplo.com`: propietaria, con verificación en dos pasos.
  - `martin@ejemplo.com`: interesado con una consulta enviada.
  - Cualquier otro email crea una cuenta nueva.
- **Códigos en pantalla:** como no hay servidor de email ni de SMS, los códigos aparecen en una "bandeja de demo" en la pantalla.
- **Permisos:**
  - Cada interesado ve solo sus consultas.
  - Cada propietario ve solo sus unidades y las consultas sobre ellas.
  - Las rutas privadas piden login.
- **Unidades nuevas:** quedan ocultas hasta que EVP valida el documento de titularidad.
- **Teléfono del propietario:** nunca es público; solo lo ve quien envió una consulta con email verificado.
- **Acciones sensibles:** cambiar el teléfono de contacto o eliminar la cuenta pide un código nuevo aunque la sesión esté abierta.
- **Controles:**
  - Bloqueo tras 5 códigos incorrectos.
  - Cierre de sesión por inactividad (30 min).
  - Redirecciones post-login solo a rutas del propio sitio.

Requisitos de producción para el pliego: [`docs/seguridad_y_acceso.md`](docs/seguridad_y_acceso.md). Casos de prueba: [`docs/casos_de_prueba_seguridad.md`](docs/casos_de_prueba_seguridad.md).

> El login del prototipo corre en el navegador y **no es una barrera de seguridad real**. Sirve para diseñar y validar los flujos. En producción la autorización la hace el servidor.

Interfaz en **español y portugués** (selector ES/PT; detecta el idioma del navegador). Precios siempre en USD.

## Importante: qué es de demostración

- **Catálogo ficticio.** Los 10 edificios, los arquitectos y las inmobiliarias son inventados.
- **Ilustraciones en lugar de fotos.** Las imágenes de los edificios son ilustraciones arquitectónicas procedurales (`src/components/ArchScene.tsx`) hasta que EVP produzca las fotos profesionales. Cada unidad acepta `photos[]`: las fotos que carga el propietario se muestran tal cual.
- **WhatsApp y llamadas simulados.** Los botones muestran un aviso en lugar de abrir WhatsApp, para que los datos de demo no lleguen a un número real.
- **Datos guardados solo en el navegador.** Viven en `localStorage`, incluidas las cuentas y las sesiones; el botón "Reiniciar datos de demo" del pie de página resetea consultas, disponibilidad y publicaciones. En producción esto lo reemplazan un backend y un proveedor de autenticación.
- **Emails y SMS simulados.** Se muestran en la bandeja de demo; no se envía nada.

## Stack

React 19 · React Router 7 · Vite 7 · Tailwind CSS 4 · GSAP (ScrollTrigger) · Phosphor Icons · Archivo Variable (self-hosted). Sin backend.

## Diseño

- `PRODUCT.md`: usuarios, personalidad de marca, anti-referencias y principios.
- `DESIGN.md`: paleta OKLCH "Ocaso en la Mansa", tipografía, forma, motion e imaginería.
- `.claude/skills/`: las skills de diseño usadas (ver `CLAUDE.md`).

Verificado con:
- **axe-core** (WCAG 2.1 AA): sin violaciones en todas las rutas, incluidas login, cuenta, panel y el diálogo de verificación.
- **Detector de anti-patrones de `impeccable`:** sin hallazgos.
- **Flujos end-to-end en Playwright:** consulta directa completa, panel del propietario (consultas, disponibilidad, contacto), publicación con fotos y los 22 casos de seguridad.
