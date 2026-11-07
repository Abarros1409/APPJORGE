# EVP · Casos de prueba de seguridad y acceso

Casos mínimos que la versión de producción debe superar, **probados en el servidor**: la API tiene que rechazar el pedido aunque alguien lo haga a mano, sin pasar por la app.

En el prototipo los 22 casos se ejecutaron de punta a punta con Playwright y todos pasaron. Allí la validación ocurre en el navegador, así que sirven como especificación del comportamiento esperado, no como prueba de seguridad real.

| # | Caso | Resultado esperado |
|---|---|---|
| 1 | Usuario sin sesión abre `/panel` | Redirige a `/ingresar?next=/panel` |
| 2 | Usuario sin sesión abre `/reserva/{código}` | Redirige al login; no muestra datos |
| 3 | 5 códigos incorrectos seguidos | Bloqueo de 15 min para ese email |
| 4 | Pedir un código nuevo durante el bloqueo | Sigue bloqueado |
| 5 | Login con `?next=//sitio-externo.com` | Ignora el destino y va a `/cuenta` (sin open redirect) |
| 6 | Huésped abre su propia reserva | Ve la reserva |
| 7 | Huésped abre la reserva de otro huésped (cambiando el código en la URL) | "No existe", igual que un código inválido (sin IDOR) |
| 8 | Huésped abre el contrato de otro huésped | "No encontrado" |
| 9 | Huésped abre el panel de propietario | Acceso denegado, con opción de publicar |
| 10 | Propietaria con segundo factor ingresa | Después del código por email pide el código por SMS |
| 11 | Propietaria completa el segundo factor | Llega al panel |
| 12 | Propietaria ve su panel | Solo sus unidades y las reservas de esas unidades |
| 13 | Propietaria cambia la cuenta de cobro | Pide verificación reforzada (código nuevo) |
| 14 | Cambio de cuenta confirmado | Se guarda enmascarada y queda habilitada recién en 48 h, con aviso por email |
| 15 | Propietaria abre la página de reserva de un huésped | "No existe": el dueño ve la reserva solo desde su panel, abreviada |
| 16 | Checkout sin sesión | Pide verificar el email antes de cargar datos |
| 17 | Checkout con email verificado | El email del titular queda bloqueado, igual al de la cuenta |
| 18 | Nuevo propietario publica una unidad | Queda "cargada", con el documento de titularidad pendiente |
| 19 | Unidad sin titularidad verificada | No aparece en el catálogo público |
| 20 | Panel de un propietario nuevo | Muestra los pendientes: titularidad y segundo factor |
| 21 | EVP aprueba la titularidad | La unidad aparece en el catálogo |
| 22 | Sesión con 31 minutos de inactividad | Se cierra y vuelve a pedir login |

## Casos adicionales para producción

Estos casos no se pueden simular en el prototipo:

- Reutilizar un refresh token ya usado → se revocan todas las sesiones de ese usuario.
- Pedidos directos a la API con el token de otro rol (huésped → endpoints de propietario o de portería) → 403/404.
- Subir un archivo que no es imagen ni PDF como foto o título → rechazado, con validación del tipo real del archivo y antivirus.
- Fotos publicadas → sin metadatos EXIF.
- Portería consulta un edificio que no es el suyo → 404.
- Personal de soporte intenta ver datos bancarios → denegado y registrado en la auditoría.
- Más de 5 envíos de código por hora al mismo email → rechazado.
- Webhook de pago con firma inválida → rechazado; ningún cambio de estado de la reserva.
