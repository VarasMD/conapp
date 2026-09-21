# Plan de producto: App de Administración de Consorcios (Argentina)

## 1. Resumen ejecutivo

**Propuesta de valor:** una plataforma única donde el **administrador de consorcio** gestiona expensas, cobranzas, proveedores y comunicación, y el **propietario/inquilino** consulta su estado de cuenta, paga, reserva amenities y reclama, todo sin planillas de Excel ni WhatsApp disperso.

**Diferenciales posibles frente al mercado actual (CONSO, Adminia Manager, y otros):**
- Onboarding más simple para consorcios chicos/medianos (nicho poco atendido por soluciones "enterprise").
- Precio transparente y accesible para autogestión (consorcios sin administrador profesional).
- UX moderna tanto en app de propietario como en panel de administrador.
- Módulo de transparencia total (todo movimiento con comprobante adjunto, trazabilidad ante cambio de administración o auditoría).

---

## 2. Usuarios y roles

| Rol | Necesidades principales | Nota |
|---|---|---|
| **Administrador** | Liquidar expensas, cobrar, pagar proveedores/sueldos, convocar asambleas, responder reclamos, generar reportes para el consejo de propietarios | Rol comprador — es a quien hay que convencer con el MVP |
| **Propietario** | Ver saldo y expensas históricas, pagar online, reservar amenities, hacer reclamos, ver actas y documentación, votar en asambleas | Acceso completo a info patrimonial y voto |
| **Inquilino** | Similar a propietario pero **sin** acceso a info patrimonial ni voto en asambleas | Rol separado del propietario (decidido) |
| **Consejo de propietarios** | Vista de reportes financieros, aprobación de gastos extraordinarios, seguimiento de KPIs | Subconjunto de propietarios con permisos extra |
| **Encargado/portero** (fase 3) | Registrar reclamos recibidos in situ, checklist de tareas, fichada, recibo | — |
| **Proveedor** | Perfil básico (especialidad, teléfono, disponibilidad para urgencias) + cuenta propia con login | **MVP:** solo perfil + ficha de contacto de emergencia, cargado y asociado al consorcio por el administrador (no es marketplace abierto, el vecino no agrega proveedores). Tiene botón de "llamar ahora" desde el portal del propietario. **Fase 3:** flujo completo de solicitud de presupuesto, cotización, historial de trabajos y pagos — reutiliza la cuenta ya creada en el MVP. |

---

## 3. Marco legal y contexto argentino (a incorporar al diseño)

- **Código Civil y Comercial (arts. 2037 a 2072):** régimen de propiedad horizontal, el consorcio como persona jurídica, reglamento de propiedad horizontal, fondo de reserva obligatorio, mayorías para asambleas.
- **Normativa local adicional:**
  - CABA: **Ley 941** — exige registro de administradores y **declaración jurada anual** por consorcio.
  - Provincia de Buenos Aires: **Ley 14.701**.
  - Neuquén: **Ley 3041**.
  - (Cada jurisdicción argentina puede tener su propia normativa: conviene parametrizar esto en vez de hardcodearlo.)
- **Expensas:** deben liquidarse por **coeficiente de copropiedad** (prorrateo), distinguiendo expensas comunes ordinarias, extraordinarias y (donde aplique) diferenciadas.
- **Cobranza judicial:** para iniciar juicio ejecutivo por falta de pago se necesita un **certificado de deuda firmado** — vale la pena que el sistema lo genere automáticamente.
- **Sueldos de encargados:** conviene integrar la escala salarial **SUTERH (CCT 589/10)** si el consorcio tiene personal en relación de dependencia.
- **Asambleas:** desde la pandemia están habilitadas las modalidades virtuales/híbridas; conviene soportar convocatoria con acuse de recibo, padrón por coeficientes y actas.
- **Facturación:** el administrador cobra honorarios y debe facturar (AFIP/ARCA); considerar si la app también asiste con eso o queda fuera de alcance inicial.

*(Nota: esto es una guía de producto, no asesoramiento legal — conviene validar cada punto con un abogado especializado en propiedad horizontal antes de lanzar.)*

---

## 4. Módulos funcionales

### Núcleo (transversal a todos los alcances)
- **Consorcios & unidades** — alta de consorcio, unidades funcionales, coeficientes, propietarios/inquilinos.
- **Identity & roles** — Administrador, Propietario, Inquilino (sin info patrimonial ni voto), Consejo, Proveedor.
- **Login** — usuario y contraseña con creación de cuenta, más SSO (Gmail, Outlook/Hotmail).
- **Panel del usuario** — mis preferencias, mis unidades, cerrar sesión, cerrar cuenta.

### MVP / Alcance 1 (lo mínimo para tener un producto usable y vendible)
1. **Liquidación de expensas** — carga de gastos, prorrateo automático por coeficiente, generación de boleta/expensa mensual en PDF.
2. **Cobranza multi-medio** — Mercado Pago, SIRO y efectivo/transferencia con conciliación manual, cada uno como un adaptador dentro del módulo.
3. **Portal del propietario** — ver saldo, histórico de expensas, descargar comprobantes.
4. **Reserva de amenities** — SUM, pileta, parrilla, con calendario y reglas (ej. un turno por unidad).
5. **Contactos** — directorio de vecinos/unidades + contactos útiles del consorcio (portero, proveedores, emergencias).
6. **Proveedor — perfil básico** — ficha con especialidad, teléfono y disponibilidad para urgencias, cargada y asociada al consorcio por el administrador; botón de "llamar ahora" desde el portal del propietario. Cuenta propia con login, sin flujo de presupuestos todavía.
7. **Comunicación básica** — avisos push/email a todos o a una unidad, notificaciones de vencimiento.
8. **Presentación web** — primera plataforma en salir.

### Alcance 1.5 (fast-follow inmediato tras el lanzamiento)
9. **App mobile** — misma funcionalidad del portal del propietario, en iOS/Android.

### Alcance 2 (diferenciación)
10. **Reclamos (tickets)** — el propietario carga un reclamo con foto, el administrador lo gestiona y responde.
11. **Notificaciones avanzadas** — reglas más finas, multi-canal (push/email/WhatsApp).
12. **Reportería** — reportes financieros para el administrador y el consejo de propietarios.
13. **Chat IA** — asistente conversacional que responde consultas frecuentes (saldo, vencimientos, estado de reclamo).
14. **APIs para integraciones** — internas (entre tus propios módulos) y para clientes/terceros que quieran integrarse contra tu plataforma.
15. **Asambleas digitales** — convocatoria con acuse, padrón, votación, acta generada automáticamente.
16. **Certificado de deuda digital** — para gestión de morosidad y eventual vía judicial.
17. **Conciliación bancaria automática / OCR de comprobantes** — reduce carga manual del administrador (tendencia fuerte del mercado 2026).

### Alcance 3 (expansión)
18. **Proveedor — portal completo** — solicitud de presupuesto, cotización, historial de trabajos y pagos, reutilizando la cuenta creada en el MVP.
19. **Asambleas** *(si no se hizo en Alcance 2)* y **Portero** — checklist de tareas, registro de novedades, fichada, recibo.
20. **Sueldos del personal (SUTERH)** — liquidación integrada como gasto del consorcio.
21. **Seguros y vencimientos críticos** — alertas de ART, seguro del edificio, service de ascensores, matafuegos, etc.
22. **Reportes financieros avanzados y KPIs** — tasa de cobranza, morosidad, NPS por consorcio, útil si el producto apunta a estudios de administración con múltiples edificios.

---

## 5. Modelo de negocio (opciones)

| Modelo | Cómo funciona | Pro / Contra |
|---|---|---|
| **Suscripción por unidad funcional/mes** (el más usado en el mercado) | El administrador paga X $/unidad/mes | Escala con el tamaño del consorcio; es el modelo estándar, fácil de comparar con la competencia |
| **Suscripción plana por consorcio** | Precio fijo independiente de unidades | Simple, pero menos rentable en edificios grandes |
| **Freemium + comisión en cobranza** | Gratis hasta cierto uso, cobra % sobre pagos procesados online | Baja fricción de entrada, pero depende del volumen de transacciones digitales |
| **Modelo híbrido** | Base gratis para autogestión (consorcios chicos sin administrador) + plan pago para administradores profesionales multi-edificio | Permite capturar dos segmentos distintos con necesidades muy diferentes |

**Recomendación inicial:** empezar con suscripción por unidad funcional (estándar del mercado, fácil de vender a administradores) y evaluar un plan gratuito/muy económico para autogestión como gancho de adquisición.

---

## 6. Plataforma recomendada

Dado que vas a tener **dos perfiles con necesidades muy distintas** (administrador = trabajo intensivo, muchas pantallas, ideal en desktop/web; propietario = consulta rápida y pago, ideal en el celular), la combinación más eficiente es:

- **Panel del administrador → Web app** (responsive, pero pensada para escritorio). Permite trabajar con planillas, reportes, múltiples ventanas.
- **App del propietario → Mobile app** (iOS + Android) con **React Native o Flutter** para no duplicar desarrollo, más una versión web liviana como respaldo (login por link, sin instalar nada) para quien no quiera bajar una app.
- **Backend único** que sirve a ambos, con roles y permisos.

Esto evita el error común de forzar todo a mobile-first cuando el uso del administrador es claramente de "escritorio de trabajo".

---

## 7. Arquitectura técnica (propuesta a alto nivel)

- **Backend:** API REST/GraphQL (Node.js/NestJS o Python/Django) + base de datos relacional (PostgreSQL) — el dominio es muy relacional (unidades, coeficientes, movimientos contables).
- **Frontend admin:** React/Next.js.
- **Mobile:** React Native o Flutter.
- **Pagos:** integración con Mercado Pago (checkout + suscripciones/débito automático) como prioridad; considerar SIRO o Pago Fácil/Rapipago para quienes prefieren pagar en efectivo con código de barras.
- **Notificaciones:** push (Firebase Cloud Messaging), email transaccional, y WhatsApp Business API para avisos (alto engagement en Argentina).
- **Almacenamiento de documentos:** S3-compatible para comprobantes, actas, reglamentos.
- **Multi-tenant:** diseño desde el día uno pensando en múltiples consorcios por administrador (aislamiento de datos por consorcio).

---

## 8. Roadmap sugerido

| Etapa | Duración estimada | Objetivo |
|---|---|---|
| Discovery + validación con administradores reales | 2-4 semanas | Entrevistas con 5-10 administradores/consorcios, validar dolor y disposición a pagar |
| Diseño UX/UI del MVP | 3-4 semanas | Wireframes + prototipo navegable de los 6 módulos MVP |
| Desarrollo MVP | 10-14 semanas | Liquidación, cobranza, portal, comunicación, reclamos |
| Piloto con 3-5 consorcios reales | 4-6 semanas | Ajustar según uso real antes de escalar |
| Lanzamiento comercial + Fase 2 | continuo | Sumar amenities, asambleas, proveedores según feedback |

---

## 9. Riesgos y consideraciones

- **Regulatorio:** validar con un abogado de propiedad horizontal antes de automatizar certificados de deuda o procesos de asamblea.
- **Adopción del propietario:** muchos vecinos no bajan apps — tener siempre una alternativa web/WhatsApp reduce fricción.
- **Competencia establecida:** CONSO y Adminia Manager ya tienen features de IA (OCR, agentes de WhatsApp) — si el objetivo es competir directo con administradores profesionales, hay que diferenciarse en UX, precio o un nicho específico (consorcios chicos, autogestión, cierta provincia).
- **Medios de pago:** la variedad de medios (Mercado Pago, transferencia, efectivo en Rapipago/Pago Fácil) obliga a soportar conciliación de múltiples fuentes desde el MVP.
