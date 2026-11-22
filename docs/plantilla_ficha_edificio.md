# Plantilla · Ficha madre de un edificio

La ficha madre la carga **EVP una sola vez por edificio**. El propietario no la completa: solo elige su edificio de la lista. Conviene poner **todas** las características que tenga cada edificio, porque es lo que lo distingue y lo que respalda el sello "Certificado EVP".

**Cómo cargar los datos:**
- Se puede completar la planilla [`plantilla_ficha_edificio.csv`](plantilla_ficha_edificio.csv), que se abre con Excel o Google Sheets, con **una fila por edificio**.
- O se puede copiar la lista de abajo y responderla por escrito.

Con esa información se cargan los edificios en la app.

---

## Datos del edificio

| Campo | Qué poner | Ejemplo |
|---|---|---|
| `nombre` | Nombre comercial del edificio | Lobos Tower |
| `zona` | Una de: `mansa`, `brava`, `peninsula`, `barra`, `manantiales` | brava |
| `direccion` | Calle y parada | Rambla Lorenzo Batlle Pacheco, parada 2 |
| `latitud`, `longitud` | En Google Maps: clic derecho sobre el edificio → copiar coordenadas | -34.9541, -54.9332 |
| `anio_construccion` | Año de finalización | 2023 |
| `pisos` | Cantidad de pisos | 36 |
| `unidades_totales` | Cantidad total de apartamentos del edificio | 150 |
| `arquitectos` | Estudio o arquitectos del proyecto | — |
| `estrellas` | 4 o 5, según el criterio de certificación de EVP | 5 |
| `distancia_playa_m` | Metros caminando hasta la arena. **0 = frente al mar** | 0 |
| `ascensores` | Cantidad | 6 |
| `mascotas` | `si` / `no`, según el reglamento del edificio | si |
| `ultima_renovacion` | Año de la última renovación importante, si la hubo | 2024 |
| `sitio_web` | Página propia del edificio, si tiene | https://… |
| `amenities` | Códigos de la tabla de abajo, separados por `\|` | pool_in\|spa\|gym |
| `frase_es` / `frase_pt` | Una línea que lo distinga, en español y portugués | Treinta y seis pisos con vista a la isla de Lobos. |
| `descripcion_es` / `descripcion_pt` | Dos o tres frases: arquitectura, vistas y lo que lo hace único | — |
| `contacto_administracion` | **Uso interno, no se publica.** Administración o encargado | — |
| `carpeta_fotos` | **Uso interno.** Link a las fotos profesionales de fachada y áreas comunes | — |

> En la planilla, los textos que tienen comas van entre comillas, como en la fila de ejemplo.

---

## Amenities y servicios (códigos)

Marcá todos los que tenga el edificio. Si falta alguno que sea importante, por ejemplo un helipuerto, agregalo al final con una descripción y lo sumamos al sistema.

**Agua y bienestar**

| Código | Amenity |
|---|---|
| `pool_in` | Piscina climatizada interior |
| `pool_out` | Piscina exterior |
| `jacuzzi` | Jacuzzi |
| `spa` | Spa y masajes |
| `sauna` | Sauna seco y húmedo |
| `solarium` | Solárium |

**Deporte**

| Código | Amenity |
|---|---|
| `gym` | Gimnasio equipado |
| `courts` | Cancha de tenis |
| `padel` | Cancha de pádel |
| `squash` | Cancha de squash |

**Playa y aire libre**

| Código | Amenity |
|---|---|
| `beach` | Servicio de playa (sombrillas y reposeras) |
| `beach_access` | Acceso directo a la playa |
| `grill` | Parrilleros |
| `garden` | Parque y jardines |

**Familia y entretenimiento**

| Código | Amenity |
|---|---|
| `kids` | Kids club con monitores |
| `playground` | Juegos infantiles |
| `games` | Sala de juegos |
| `cinema` | Microcine |
| `party` | Salón de fiestas |
| `restaurant` | Restaurante o bar |

**Servicios**

| Código | Amenity |
|---|---|
| `concierge` | Conserjería |
| `housekeeping` | Servicio de limpieza opcional |
| `laundry` | Lavandería |
| `cowork` | Business center |
| `wifi` | Wi-Fi en áreas comunes |

**Seguridad e infraestructura**

| Código | Amenity |
|---|---|
| `security` | Seguridad 24 h |
| `generator` | Grupo electrógeno |
| `guest_parking` | Cocheras para visitas |
| `ev_charger` | Cargador para autos eléctricos |

---

## Normas de convivencia

Todas las fichas muestran las normas comunes, como el horario de descanso, el registro en portería y el uso de amenities según el reglamento. Si un edificio tiene una regla particular que conviene que el inquilino conozca antes de consultar, anotala aparte.
