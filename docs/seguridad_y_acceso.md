# EVP · Seguridad, acceso y cuentas de usuario

*Sección del pliego de requerimientos técnicos. Describe cómo deben ingresar los usuarios, qué puede ver cada uno y qué controles son obligatorios en la versión de producción. El prototipo (`src/lib/auth.tsx`) implementa estos flujos del lado de la interfaz para validarlos con usuarios, pero **no es una barrera de seguridad**: todo lo que sigue debe hacerse en el servidor.*

---

## 1. Principios

1. **Sin contraseñas.** Se ingresa con un código de un solo uso enviado por email, con Google o Apple, o con passkey (Face ID / huella). Se elimina el principal vector de ataque: contraseñas reutilizadas y filtradas.
2. **El servidor decide, la pantalla no.** Cada pedido de datos se autoriza en el backend. Ocultar un botón no protege nada.
3. **Mínimo privilegio.** Cada rol ve solo lo indispensable para su tarea.
4. **Discreción como servicio.** La identidad del propietario nunca se expone al huésped. La del huésped se muestra al propietario solo abreviada ("Martín E.").
5. **No construir la autenticación desde cero.** Usar un proveedor especializado. Sugeridos, a cotizar por la agencia: Supabase Auth, Clerk o Auth0.

---

## 2. Roles y alcance de datos

| Rol | Cómo se crea | Qué puede ver y hacer | Qué NO puede ver |
|---|---|---|---|
| **Interesado / huésped** | Automáticamente al verificar su email para enviar una consulta | Sus consultas y unidades guardadas; el teléfono del anunciante **solo** de las unidades que consultó | Consultas de otros; documento y email del propietario |
| **Propietario** | Al publicar su primera unidad | Sus unidades, su disponibilidad y las consultas sobre ellas, con los datos de contacto que el interesado autorizó compartir | Consultas sobre unidades de otros dueños; documentos de otros |
| **Inmobiliaria aliada** | Alta manual por EVP (cuenta de organización con varios miembros) | Unidades y consultas de su inmobiliaria | Unidades de otras inmobiliarias o de dueños directos |
| **Administración / portería** | Alta manual por EVP, asociada a un edificio | Ficha de *su* edificio y unidades publicadas en él | Consultas, datos de contacto, documentos |
| **Personal EVP** | Interno | Según función: carga de fichas, verificación de titularidad, moderación de reportes, soporte | Lo que su función no requiere: soporte no ve documentos de titularidad |

Un mismo usuario puede tener varios roles (por ejemplo, un propietario que también consulta por una unidad en otro edificio). Usa un solo login y cambia de vista dentro de la app.

---

## 3. Flujos de ingreso

### 3.1 Huésped
1. Busca y elige unidad **sin cuenta**: no hay registro previo.
2. Al consultar por una unidad ingresa su email y recibe un código de 6 dígitos (vence en 10 minutos).
3. Al verificarlo se crea la cuenta. El email verificado queda fijo en la consulta: es por donde le responde el anunciante y lo que le da acceso a "Mis consultas".
4. Alternativa: "Continuar con Google / Apple".

### 3.2 Propietario
1. Igual que el huésped (código por email) para crear la cuenta y publicar.
2. **Verificación de titularidad obligatoria:** la unidad queda oculta y no puede recibir consultas hasta que el dueño sube un título o boleto de compraventa y EVP lo valida. Para validarlo, EVP lo cruza con la administración del edificio, que es aliada. Así se evita que alguien publique un departamento ajeno y pida una seña.
3. **Segundo factor obligatorio** (SMS o app autenticadora) para agregar o cambiar el teléfono que ven los interesados.
4. Después, en cada ingreso: código por email + código por SMS, o passkey.

### 3.3 Personal EVP, inmobiliarias y administraciones
- Segundo factor obligatorio desde el primer ingreso.
- Para el personal EVP: passkey o llave física (FIDO2) recomendada, e inicio de sesión corporativo (SSO) si la empresa lo usa.

---

## 4. Controles obligatorios

### 4.1 Códigos de un solo uso
| Parámetro | Valor |
|---|---|
| Longitud | 6 dígitos, generador criptográficamente seguro |
| Vigencia | 10 minutos, un solo uso |
| Almacenamiento | Hash del código; nunca en texto plano |
| Intentos fallidos | Máx. 5 → bloqueo de 15 min para ese email y propósito |
| Reenvío | Espera mínima de 30 s; máx. 5 envíos por hora por email |
| Enumeración de cuentas | Misma respuesta exista o no el email |

### 4.2 Sesiones
- Cookie `HttpOnly`, `Secure`, `SameSite=Lax`: el código de la página no puede leerla.
- **Inactividad:** cierre a los 30 min (huésped y propietario) y a los 15 min (personal EVP).
- **Duración máxima:** 12 h; el refresh token rota en cada uso y se revoca si se reutiliza.
- Lista de dispositivos con sesión abierta, con "cerrar en este dispositivo" y "cerrar en todos".
- Al cambiar el email o el segundo factor, se cierran todas las demás sesiones.

### 4.3 Verificación reforzada (step-up) para acciones sensibles
Aunque la sesión esté abierta, se pide un código nuevo (válido 5 min) para:
- Cambiar el teléfono de contacto de las publicaciones, con aviso por email a la dirección registrada. Es la acción preferida de quien toma una cuenta ajena para estafar a los interesados.
- Cambiar email o teléfono (código en el valor actual **y** en el nuevo).
- Ver o descargar documentos de identidad.
- Eliminar la cuenta.

### 4.4 Autorización (lo más importante)
- **Seguridad por fila (RLS) en la base de datos:** cada tabla define quién puede leer y escribir cada registro, por ejemplo `consulta.email_interesado = email_verificado_actual` y `unidad.propietario_id = usuario_actual`. La regla vive en la base, no en cada pantalla.
- **IDs no adivinables:** UUID o códigos aleatorios. Aun así, nunca alcanza con conocer el ID: siempre se valida la pertenencia.
- **Recursos ajenos:** responder "no encontrado" (404) y no "prohibido" (403), para no confirmar que el recurso existe.
- **Redirecciones post-login:** solo se aceptan rutas relativas del propio sitio. Hay que bloquear `//dominio-externo` (open redirect).

### 4.5 Datos sensibles
| Dato | Tratamiento |
|---|---|
| Pagos y tarjetas | **No aplica:** EVP no procesa pagos. El alquiler y la seña se acuerdan entre las partes |
| Documento de identidad, título de propiedad | Almacenamiento cifrado separado, acceso con URL firmada que vence en minutos y registro de cada acceso |
| Teléfono del propietario | Nunca en el HTML público ni indexable. Se entrega solo por API a un usuario con email verificado que envió una consulta por esa unidad |
| Datos del interesado en una consulta | Se comparten con el anunciante solo con autorización explícita (casilla obligatoria) |
| Fotos interiores | Se publican sin metadatos EXIF (ubicación GPS, dispositivo) |

### 4.6 Protección contra abuso
- Límite de pedidos por IP y por cuenta en login, envío de códigos y consultas (máx. 10 consultas por día por cuenta).
- Captcha invisible (Cloudflare Turnstile o reCAPTCHA v3) en el login y en los formularios públicos.
- Alertas por email ante ingreso desde un dispositivo o país nuevo, y ante cambios del teléfono de contacto.
- Encabezados de seguridad: Content Security Policy estricta, HSTS, `X-Frame-Options: DENY` y `Referrer-Policy`.

### 4.7 Auditoría
Registro inalterable de quién vio o modificó qué y cuándo: logins, cambios del teléfono de contacto, entregas del teléfono a interesados, accesos a documentos y acciones del personal EVP. Se conserva por 2 años como mínimo.

---

### 4.8 Prevención de fraude de avisos
Sin pagos en custodia, el riesgo principal es el aviso falso: alguien que publica una unidad ajena, o que toma la cuenta de un dueño real y cambia el teléfono, para cobrar señas. Controles:
- **Titularidad:** se valida antes de publicar (§3.2).
- **Teléfono:** solo para interesados verificados (§4.5) y protegido con segundo factor y verificación reforzada (§4.3).
- **Reportar publicación:** botón en cada unidad. EVP revisa los reportes y puede pausar el aviso.
- **Consejos de seguridad:** se le muestran al interesado tras consultar. Entre ellos: contrato escrito antes de pagar, pedir el documento del dueño y "EVP nunca cobra alquileres ni señas".
- **Precios atípicos:** alerta interna si una tarifa queda muy por debajo de la mediana del edificio.

## 5. Recuperación de cuenta
- Si pierde el acceso al email: validación por teléfono **y** documento con soporte humano. Nunca solo por SMS, por el riesgo de duplicado de SIM (SIM swapping).
- Si pierde el teléfono (propietarios): códigos de respaldo generados al activar el segundo factor, o validación con soporte.

---

## 6. Cumplimiento legal

EVP trata datos de residentes de tres países:

| País | Norma | Implica |
|---|---|---|
| Uruguay | Ley 18.331 y Decreto 414/009 | Registro de las bases de datos ante la URCDP, consentimiento informado, derechos de acceso, rectificación y supresión |
| Brasil | LGPD (Lei 13.709/2018) | Base legal por tratamiento, encargado de datos, aviso de incidentes |
| Argentina | Ley 25.326 | Consentimiento y derechos ARCO |

En la app:
- Política de privacidad en ES y PT.
- **Descargar mis datos** (implementado en el prototipo).
- **Eliminar mi cuenta.**
- Protocolo de notificación de incidentes.

---

## 7. Verificación antes del lanzamiento
1. Pruebas automatizadas de autorización: cada rol intenta leer y modificar datos de otro y el servidor debe rechazarlo. El prototipo incluye la lista de casos en `docs/casos_de_prueba_seguridad.md`.
2. Prueba de penetración externa enfocada en accesos indebidos (IDOR), sesiones, formulario de consulta, entrega del teléfono del anunciante y carga de archivos.
3. Revisión de dependencias y secretos en el pipeline de CI.
4. Simulacro de recuperación de cuenta y de respuesta a incidentes.

---

## 8. Estimación orientativa
| Ítem | Costo |
|---|---|
| Proveedor de autenticación (piloto, < 10.000 usuarios activos) | USD 0 – 25 / mes |
| SMS de segundo factor (≈ 100 propietarios, Uruguay / Argentina / Brasil) | USD 10 – 30 / mes |
| Prueba de penetración externa (una vez, antes del lanzamiento) | USD 1.500 – 4.000 |

La prueba de penetración no está en el presupuesto base de desarrollo del contexto maestro (§6) y conviene sumarla al plan financiero.
