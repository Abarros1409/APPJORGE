# EVP — Edificios VIP Punta del Este

> **Estado:** prototipo funcional implementado (React + Vite + Tailwind 4). Ver `README.md`. Contexto de diseño vigente: `PRODUCT.md` (estrategia) y `DESIGN.md` (tokens, tipografía, motion). Antes de cambiar la UI, leerlos y respetar los tokens de `src/styles.css`.
>
> **Modelo vigente (nov. 2026):** EVP es una **plataforma de promoción**, no una inmobiliaria. El interesado **consulta directo** al propietario; EVP no cobra comisión, no procesa pagos ni es parte del contrato. Publicar es gratis el primer año. Detalle y pendientes: `docs/actualizacion_modelo_2026-11.md` (reemplaza §2, §3, §5 y §8 del contexto maestro). Nunca reintroducir lenguaje de intermediación (reservar, pagar en la app, custodia, comisión, tarifa de gestión).

Plataforma web responsiva (PWA, sin descarga obligatoria) para alquiler temporario de unidades en edificios VIP de 4-5 estrellas en Punta del Este (Mansa, Brava, La Barra, Manantiales, Península). Contexto completo de negocio: `docs/contexto_maestro_evp.md`. Leerlo antes de diseñar o programar.

## Dirección de diseño (brief)

- **Sensación buscada:** lujo discreto, confianza y privacidad. Moderno y llamativo, pero nunca "masivo" ni con aspecto de Airbnb/Booking. Referencias de tono: hotelería boutique, real estate de alta gama, editorial de arquitectura.
- **Público:** alto poder adquisitivo. Mercado prioritario: **Argentina**, luego **San Pablo**; Uruguay en menor medida. Interfaz en **español y portugués** (inglés opcional). Precios siempre en **USD**.
- **Dos públicos, dos tonos:**
  - Huésped: aspiracional, fotográfico, cinematográfico (fachadas, vistas al mar, amenities).
  - Propietario: sobrio, seguro, eficiente ("publicá tu unidad en menos de 3 minutos", "publicación gratis el primer año, sin comisiones", "tu inmueble no se expone en canales masivos").
- **Elementos de confianza visibles:** sello "Edificio certificado EVP", ficha madre completa del edificio, propietario verificado como titular, teléfono visible solo para interesados verificados, consejos para alquilar seguro, "Reportar publicación", etiqueta "Directo de Dueño" vs "Inmobiliaria Aliada".
- **Restricción de producto que el diseño debe reflejar:** no hay calendario por días. Solo períodos: 1ª/2ª quincena de enero, mes de enero, 1ª/2ª quincena de febrero, mes de febrero, diciembre, temporada completa (dic-abr). Usar selectores de período (chips o segmentos), no date-pickers.
- **Precio:** el que fija el propietario, sin cargos ni comisiones de EVP. El contrato y el pago se acuerdan entre las partes.
- **Mobile-first:** gran parte del tráfico llega desde Instagram/Facebook (geofencing), así que el móvil es la pantalla principal.

### Pantallas clave
1. Landing / home (huésped) con buscador: Edificio o Zona, Período, Rango USD, dormitorios, baños y capacidad, filtros Pet Friendly, Garage y Vista al Mar.
2. Resultados (lista + mapa).
3. Ficha del edificio VIP (ficha madre: amenities agrupados, playa, ascensores, mascotas, normas, arquitectos, fotos profesionales). Plantilla de carga: `docs/plantilla_ficha_edificio.md`.
4. Ficha de la unidad + selector de período + desglose de precio.
5. Consulta directa al propietario (`/consultar/:id`): email verificado, consentimiento para compartir datos, contacto visible tras enviar, consejos de seguridad.
6. Landing para propietarios + formulario ágil de 5 pasos (edificio en drop-down, piso/unidad, distribución, tarifas USD, fotos con mínimo 5).
7. Panel del propietario: consultas recibidas, disponibilidad por período, contacto para interesados (con verificación reforzada).
8. Página para administraciones y portería (alianzas).

## Skills de diseño instaladas en el proyecto (`.claude/skills/`)

Están en el repo, así que cualquier sesión de Claude Code sobre este proyecto las tiene disponibles. Orden recomendado de uso:

| Paso | Skill | Para qué en EVP |
|---|---|---|
| 1. Sistema visual | `ui-ux-pro-max` | Generar el design system base (paleta, tipografías, estilo, reglas UX) desde su base de datos local. Desde la raíz: `python3 .claude/skills/ui-ux-pro-max/scripts/search.py "luxury real estate vacation rental premium" --design-system -p "EVP"` |
| 2. Tokens | `uiux-design-system` | Tokens en tres capas (primitivo → semántico → componente) y variables CSS. |
| 3. Identidad | `uiux-brand` | Voz de marca ES/PT, identidad visual y guía de estilo de EVP. |
| 4. Landing / marketing | `design-taste-frontend`, `high-end-visual-design` | Diseño de agencia premium sin aspecto genérico de IA: tipografía, espaciado, sombras, motion. Para home, landing de propietarios y la de administraciones. |
| 5. Motion "llamativo" | `gpt-taste`, `emil-design-eng` | Animación de scroll (GSAP) solo en hero y landings. Micro-interacciones y pulido en toda la app. |
| 6. UI de producto | `impeccable`, `uiux-ui-styling` | Buscador, filtros, fichas, consulta al propietario, formulario del propietario y panel: jerarquía, estados y formularios. Implementación con shadcn/ui + Tailwind. |
| 7. Web moderna | `modern-web-guidance` | Consultar antes de implementar HTML/CSS/JS: view transitions, animaciones por scroll, rendimiento de imágenes (LCP) y PWA. Usa `npx modern-web-guidance`. |
| 8. Textos | `ux-copy` | CTAs, microcopy, estados vacíos y errores, en ES y PT. |
| 9. Revisión | `design-critique`, `accessibility-review` | Crítica estructurada y auditoría WCAG 2.1 AA antes de cerrar cada pantalla. |
| 10. Entrega | `design-handoff` | Specs para la agencia de software que cotiza el pliego (layout, tokens, props y estados). |

Reglas para combinarlas:
- `design-taste-frontend` y `high-end-visual-design` son para páginas de marketing. Para el producto (buscador, consulta, panel) manda `impeccable`.
- Las dos dan directivas fuertes. Si chocan con este brief, gana este brief: lujo discreto antes que efectos.
- `gpt-taste` usa motion intenso. Aplicarlo solo al hero y a secciones de storytelling, nunca a la consulta ni a formularios.

## Skills complementarias disponibles en la cuenta (no copiadas al repo)
- `figma:figma-generate-design` y `figma:figma-design-to-code`: si se trabaja el diseño en Figma (requiere el conector de Figma).
- `veiren-skills-portable:imagegen-frontend-web`, `imagegen-frontend-mobile` y `brandkit`: referencias visuales y brand board (requieren una herramienta de generación de imágenes).
- `skills-megapack:seo-hreflang` y `seo-local`: SEO ES/PT y local para Punta del Este.
- `anthropic-skills:theme-factory`: temas rápidos para presentaciones y documentos comerciales.
