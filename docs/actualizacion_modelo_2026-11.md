# EVP · Actualización del modelo (noviembre 2026)

Decisiones tomadas en la reunión de revisión del prototipo del **12/11/2026**, después de simular el uso como propietario y como inquilino. Este documento **reemplaza** las secciones del contexto maestro que se indican abajo; el resto del contexto sigue vigente.

---

## 1. Decisiones

### 1.1 EVP no es una inmobiliaria
- EVP se presenta como una **plataforma de promoción y publicidad** de unidades en edificios VIP, no como inmobiliaria.
- **No intermedia** en el alquiler: no cobra el alquiler, no retiene dinero en custodia y no es parte del contrato.
- El interesado se comunica **directamente con el propietario** (o con la inmobiliaria que publica la unidad).
- **Motivo:** no asumir la responsabilidad legal de una inmobiliaria.

### 1.2 Sin comisión
- **Al inquilino:** no se le cobra la tarifa del 5–7%.
- **Al propietario:** no se le cobra comisión sobre el alquiler.
- **Propuesta en análisis:** publicar gratis durante el primer año.
- **Después del primer año:** si se cobra, será por la publicación (un plan con costo fijo), **nunca como comisión**. El monto y el formato están pendientes de definir.

### 1.3 Foco
- Por ahora, **solo edificios y solo alquileres de temporada**.
- Las **ventas** se piensan incorporar a corto plazo, en una etapa posterior.
- Se mantienen los **períodos fijos**: quincena, mes o temporada.

### 1.4 Edificios primero
Orden de trabajo:
1. Cargar fichas completas de edificios conocidos de 4 y 5 estrellas, con **todas** sus características. Es un trabajo que se hace una sola vez por edificio.
2. Promocionar entre los propietarios para que suban sus unidades. Es lo fundamental y lo más difícil.
3. Recién con unidades cargadas, salir a buscar inquilinos.

Objetivo de referencia: 10 edificios × ~50 unidades = 500 unidades. Probablemente no se llegue para esta temporada sino para la siguiente.

### 1.5 Mercado
La promoción apunta sobre todo a **Argentina** y, en segundo lugar, a **San Pablo**. La demanda uruguaya es menor.

---

## 2. Qué cambió en la app

| Antes | Ahora |
|---|---|
| Checkout con pago (Stripe / dLocal / PIX) en custodia de EVP | **Consulta directa** al propietario (`/consultar/:id`) |
| Precio = neto + 5% "Tarifa de Gestión Digital" | Precio = el que fija el propietario, **sin cargos** |
| Contrato digital generado y firmado en EVP | Contrato y pago **entre las partes**; EVP solo recomienda hacerlo por escrito |
| Inventario de check-in y liberación de fondos 24–48 h | Eliminado |
| Panel: dinero en custodia, liquidaciones, cuenta bancaria | Panel: **consultas recibidas**, **disponibilidad** que marca el dueño y **contacto** para interesados |
| "0% de comisión el primer año" | **"Publicación gratis el primer año"** |
| Mis reservas (huésped) | **Mis consultas** y **Unidades guardadas** |
| Ficha del edificio con 12 amenities | Ficha con **29 amenities en 6 grupos**, más distancia a la playa, ascensores, política de mascotas, última renovación, sitio web y normas de convivencia |

### Cómo funciona la consulta
1. El interesado elige unidad y, si quiere, un período.
2. Verifica su email con un código, igual que en el login.
3. Envía la consulta: nombre, teléfono / WhatsApp, país, cantidad de huéspedes, mascota y mensaje.
   - El mensaje se prearma con la unidad y el período, y se puede editar.
   - Tiene que **autorizar** que EVP envíe sus datos al anunciante (leyes de datos personales).
4. El propietario la recibe en su email y en su panel. Responde por WhatsApp o email y la marca como respondida, alquilada o descartada.
5. Si el propietario cargó un teléfono, el interesado lo ve **recién después de enviar la consulta**, nunca en la publicación pública.

### Seguridad (por qué sigue siendo necesaria)
Sin pagos en custodia, el riesgo principal pasa a ser el **fraude de avisos**: alguien que publica un departamento que no es suyo y pide una seña. Por eso la app mantiene o suma estos controles:
- **Titularidad:** se valida antes de mostrar una unidad.
- **Teléfono del propietario:** visible solo para quien verificó su email y consultó.
- **Segundo factor:** obligatorio para propietarios. Cambiar el teléfono de contacto pide verificación reforzada y genera un aviso por email.
- **Reportar publicación:** disponible en cada unidad.
- **Consejos de seguridad:** se muestran al inquilino tras enviar la consulta, por ejemplo "EVP nunca cobra alquileres ni señas".
- **Límite anti-spam:** máximo 10 consultas por día por cuenta.

---

## 3. Secciones del contexto maestro que quedan reemplazadas

| Sección | Estado |
|---|---|
| §2 Modelo de negocio e ingresos (5–7% al inquilino, 5% + 5%, 50/50 con inmobiliarias) | Reemplazada por §1.2 |
| §3 Contratación digital y aceptación del reglamento como parte del contrato | Reemplazada: el contrato es entre las partes |
| §5 Flujo de pagos, pasarelas y escrow | **Eliminada** |
| §7 Etapa 3: "cobranza de reservas, custodia y liberación de fondos" | Reemplazada por gestión de consultas |
| §8 Proyección financiera | **Desactualizada**: los ingresos por comisión no existen en este modelo. Rehacer con planes de publicación |

---

## 4. Pendientes

Lo que falta definir para avanzar:
1. **Filtros de búsqueda adicionales.** Valeria está armando la lista.
2. **Datos que carga el propietario al publicar.** Valeria está armando la lista. El formulario mantiene hoy sus 5 pasos y suma el contacto en la revisión final.
3. **Edificios reales.** Cargar las fichas con la plantilla de `docs/plantilla_ficha_edificio.md`.
4. **Plan de cobro después del primer año.** Definir monto, formato y fecha de aviso.
5. **Marca.** Se evalúa sumar el respaldo de una marca reconocida de Punta del Este para las reuniones con las comisiones de los edificios. No se usa ninguna marca de terceros en la app hasta tener un acuerdo.
6. **Ventas.** Definir cuándo se incorporan y qué datos requieren.
7. **Proyección financiera.** Rehacerla sin comisiones (ver §3).
