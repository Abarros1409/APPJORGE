# DESIGN.md — EVP

## Escena

> Un ejecutivo porteño revisa el celular a las 23 h de un martes de octubre: está planificando enero. Después, una familia paulista compara torres en la computadora del living un domingo a la mañana. Ambos imaginan lo mismo: la Mansa a las 20:40 de enero, con la bahía pasando del naranja sodio al azul Atlántico y las torres blancas encendiéndose por dentro.

Estado de ánimo: **"Ocaso en la Mansa"**. Azul Atlántico profundo, luz de atardecer y arquitectura blanca.

## Dos registros

| Superficie | Registro | Estrategia de color | Motion |
|---|---|---|---|
| Home, landing de propietarios, administraciones y ficha del edificio | brand | **Committed**: el azul `ink` cubre entre el 30% y el 60% de la superficie (hero, bloques narrativos y pie de página) | Storytelling con GSAP en el hero (de la tarde a la noche) y revelados por scroll nativos |
| Resultados, unidad, checkout, reserva, publicar y panel | product | **Restrained**: blanco puro, `marine` para la selección y `ocaso` solo en la acción principal | Transiciones de 160 a 240 ms que solo comunican estado |

## Color (OKLCH)

| Token | Valor | Rol |
|---|---|---|
| `--color-ink` | `oklch(0.205 0.035 240)` | Atlántico profundo. Texto principal y superficies "drenched" |
| `--color-ink-2` | `oklch(0.29 0.045 238)` | Capa elevada sobre `ink` |
| `--color-marine` | `oklch(0.55 0.105 230)` | Semilla de marca. Selección, mapas y gráficos |
| `--color-marine-strong` | `oklch(0.45 0.1 232)` | Links y foco sobre blanco (≥ 4.5:1) |
| `--color-ocaso` | `oklch(0.77 0.13 58)` | Atardecer de la Mansa. CTA principal (con texto `ink`) y sello de certificación |
| `--color-bg` | `oklch(1 0 0)` | Blanco puro. Sin tinte cálido |
| `--color-mist` | `oklch(0.972 0.007 230)` | Segunda capa neutra: paneles y filtros |
| `--color-line` | `oklch(0.9 0.012 235)` | Divisores y bordes de inputs |
| `--color-mute` | `oklch(0.47 0.025 240)` | Texto secundario (5.9:1 sobre blanco) |
| `--color-on-ink` / `--color-on-ink-mute` | `oklch(0.97 0.01 230)` / `oklch(0.8 0.025 235)` | Texto sobre `ink` |
| `--color-ok` / `--color-warn` / `--color-bad` | `oklch(0.52 0.1 160)` / `oklch(0.62 0.13 70)` / `oklch(0.55 0.17 25)` | Estados |

Decisiones descartadas a propósito:
- **Negro y dorado**: es lo que `ui-ux-pro-max` propuso para el rubro, el reflejo de categoría.
- **Fondo crema**: es el reflejo de 2026.
- **Ningún glass decorativo**: solo la nav flotante usa `backdrop-filter`.

## Tipografía

Una sola familia, elegida a propósito: **Archivo Variable** (ejes `wdth` 62–125 y `wght` 100–900, alojada en el propio sitio con @fontsource y sin llamadas a terceros). La voz sale del contraste de ancho. El ancho expandido evoca la placa de bronce en la entrada de una torre modernista; el ancho normal se usa para la lectura.

| Rol | Ancho / peso | Tamaño |
|---|---|---|
| Display | `wdth 125`, `wght 520`, tracking -0.025em | `clamp(2.6rem, 6vw, 5.5rem)` |
| H2 | `wdth 118`, `wght 540` | `clamp(1.9rem, 3.6vw, 3.2rem)` |
| H3 | `wdth 108`, `wght 600` | 1.25rem |
| Cuerpo | `wdth 100`, `wght 400`, line-height 1.6 | 1rem a 1.0625rem, máximo 68ch |
| Etiqueta / dato | `wdth 100`, `wght 550`, `tabular-nums` | 0.8125rem a 0.875rem |
| Sello | `wdth 125`, `wght 600`, mayúsculas con tracking 0.14em | 0.6875rem (solo en el sello EVP, nunca como kicker de sección) |

## Forma

- Radios: 10 px en controles, 18 px en paneles y `9999px` en CTA y chips. Los marcos de imagen llevan doble bisel solo en el hero y en las tarjetas de unidad (carcasa de 6 px, núcleo con radio interno = externo − 6).
- Bordes: hairline `--color-line`. Sombras ambientales muy difusas: `0 24px 60px -30px oklch(0.205 0.035 240 / 0.35)`.
- Íconos: Phosphor en peso **Light**.
- Botón principal: pastilla `ocaso` con texto `ink` y un círculo interno con la flecha que se desplaza en hover ("button-in-button").

## Imaginería

Mientras no existan las fotos profesionales que produce EVP, la imaginería es **ilustración arquitectónica procedural en SVG** (`ArchScene`). Muestra elevaciones de cada torre sobre el horizonte del Atlántico, en cinco horas del día, junto con planos de planta generados a partir de la distribución real de la unidad. Cada unidad acepta `photos[]`: al cargarlas, reemplazan a las ilustraciones.

## Motion

- Curvas de easing: `--ease-out: cubic-bezier(0.22, 1, 0.36, 1)`, `--ease-fluid: cubic-bezier(0.32, 0.72, 0, 1)`. Sin bounce, sin `linear` en la UI.
- Hero: GSAP ScrollTrigger con el hero fijado (pin). El cielo pasa de la tarde a la noche y las ventanas se encienden. Con reduced motion se muestra la escena final estática.
- Revelados: `animation-timeline: view()` con `@supports`. El contenido es visible por defecto y la animación es una mejora progresiva.
- Navegación entre unidades: View Transitions (`viewTransition` de React Router) para la imagen de la tarjeta → hero de la unidad.

## Capas z-index

`--z-sticky: 20` · `--z-nav: 30` · `--z-sheet: 40` · `--z-modal: 50` · `--z-toast: 60`
