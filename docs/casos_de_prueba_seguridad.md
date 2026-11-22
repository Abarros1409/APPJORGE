# EVP · Casos de prueba de seguridad y acceso

Casos mínimos que la versión de producción debe superar, **probados en el servidor**: la API tiene que rechazar el pedido aunque alguien lo haga a mano, sin pasar por la app.

En el prototipo, los 22 casos se ejecutaron de punta a punta con Playwright y todos pasaron. Allí la validación ocurre en el navegador, así que sirven como especificación del comportamiento esperado, no como prueba de seguridad real.

| # | Caso | Resultado esperado |
|---|---|---|
| 1 | Usuario sin sesión abre `/panel` | Redirige a `/ingresar?next=/panel` |
| 2 | Usuario sin sesión abre `/cuenta` | Redirige al login; no muestra datos |
| 3 | 5 códigos incorrectos seguidos | Bloqueo de 15 min para ese email |
| 4 | Pedir un código nuevo durante el bloqueo | Sigue bloqueado |
| 5 | Login con `?next=//sitio-externo.com` | Ignora el destino y va a `/cuenta` (sin open redirect) |
| 6 | Interesado sin sesión toca "Consultar al propietario" | Pide verificar el email antes de cargar datos |
| 7 | Consulta con email verificado | El email queda bloqueado, igual al de la cuenta |
| 8 | Enviar la consulta sin autorizar el envío de datos | Rechazada: la autorización es obligatoria |
| 9 | Interesado abre "Mis consultas" | Ve solo las que envió; nunca las de otros |
| 10 | Interesado abre el panel de propietario | Acceso denegado, con opción de publicar |
| 11 | Teléfono del propietario en la publicación pública | No aparece; se muestra recién después de enviar una consulta verificada |
| 12 | Propietaria con segundo factor ingresa | Después del código por email pide el código por SMS |
| 13 | Propietaria ve su panel | Solo las consultas sobre sus unidades |
| 14 | Propietaria marca "Se lo alquilé" | El período queda como "Alquilado" en la publicación |
| 15 | Propietaria marca o libera períodos | La publicación refleja la disponibilidad |
| 16 | Propietaria cambia el teléfono de contacto | Pide verificación reforzada (código nuevo) y avisa por email |
| 17 | Nuevo propietario publica una unidad | Queda "cargada", con el documento de titularidad pendiente |
| 18 | Unidad sin titularidad verificada | No aparece en el catálogo |
| 19 | Unidad sin titularidad verificada | No acepta consultas, aunque se entre por la URL |
| 20 | EVP aprueba la titularidad | La unidad aparece en el catálogo |
| 21 | Más de 10 consultas en un día desde la misma cuenta | Rechazado (anti-spam) |
| 22 | Sesión con 31 minutos de inactividad | Se cierra y vuelve a pedir login |

## Casos adicionales para producción

Estos casos no se pueden simular en el prototipo:

- Reutilizar un refresh token ya usado → se revocan todas las sesiones de ese usuario.
- Pedidos directos a la API con el token de otro rol (huésped → endpoints de propietario o de portería) → 403/404.
- Subir un archivo que no es imagen ni PDF como foto o título → rechazado, con validación del tipo real del archivo y antivirus.
- Fotos publicadas → sin metadatos EXIF.
- Portería consulta un edificio que no es el suyo → 404.
- Personal de soporte intenta ver un título de propiedad → denegado y registrado en la auditoría.
- Más de 5 envíos de código por hora al mismo email → rechazado.
- Pedido a la API del teléfono de un anunciante sin haber consultado esa unidad → 404.
- Scraping masivo de publicaciones → limitado por IP; el teléfono nunca sale en el HTML.
