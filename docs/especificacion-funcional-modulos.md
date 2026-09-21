# Especificación funcional por módulo (MVP)

Detalle de reglas de negocio y decisiones de producto para cada módulo del MVP, resultado de la ronda de definición módulo por módulo. Sirve como base para el diseño del esquema de datos y la arquitectura de código.

---

## Núcleo

### Consorcios & unidades
- Tipos de consorcio soportados: **edificios, countries/barrios cerrados, oficinas, galerías**. Cada tipo puede tener campos condicionales (ej. un country puede manejar lotes en vez de unidades funcionales con coeficiente clásico de propiedad horizontal).
- Un **administrador puede manejar múltiples consorcios** desde una sola cuenta → relación muchos-a-muchos entre administrador y consorcio.
- Alta de consorcio: **manual** (formulario) o por **importación de planilla** (carga masiva de unidades y coeficientes).

### Identity & roles
- Roles: Administrador, Propietario, Inquilino, Consejo de propietarios, Proveedor, Encargado/portero (fase 3).
- Alta de propietario/inquilino: **mixta** — el administrador invita por email directamente, o genera un código de consorcio para auto-registro. Requiere tabla de `invitaciones` con estado (pendiente / aceptada / expirada).
- El **propietario puede dar de alta a su inquilino** desde su propia cuenta → relación jerárquica propietario → inquilino → unidad. Definir qué pasa si el propietario revoca el acceso del inquilino.
- **Sin subroles de administrador** en el MVP — un solo nivel de permiso "admin" por consorcio (ampliable después sin romper el modelo, porque ya existe la relación administrador↔consorcio).
- Alta de proveedor: el administrador lo invita por email/teléfono, igual que a un propietario (reutiliza la tabla de invitaciones).
- Un proveedor puede estar **vinculado a varios consorcios** (relación muchos-a-muchos, igual que administrador↔consorcio).

### Login
- **Sin verificación de email obligatoria** en el MVP (se puede enviar email de bienvenida no bloqueante).
- Recupero de contraseña: **link estándar por email**.
- **Una persona = una cuenta, múltiples roles/unidades**: el usuario (identificado por email) es una entidad separada de su "membresía" (rol + unidad + consorcio). Una persona puede tener varias membresías activas simultáneas.
- Soporta login por usuario/contraseña y SSO (Gmail, Outlook/Hotmail).

### Panel del usuario
- Preferencias configurables: **notificaciones** (canal/frecuencia), **idioma**, **datos de contacto adicionales** (teléfono alternativo, etc.) → tabla `preferencias_usuario` separada de la identidad core.
- "Cerrar cuenta" = **soft delete** (se desactiva, no se borra) por temas de auditoría y trazabilidad de deuda. Ninguna tabla que referencie a un usuario debe borrar en cascada.

---

## Módulos de dominio (MVP)

### Liquidación de expensas
- Tipos de expensa soportados: **ordinarias, extraordinarias y diferenciadas** (estas últimas con prorrateo por criterio específico, no por el coeficiente general — ej. solo unidades con cochera pagan el gasto del portón).
- Carga de gastos: **manual** (formulario) y **masiva** (importación de planilla).
- Las boletas **se pueden reabrir y corregir** después de emitidas, con re-emisión. Requiere versionado/historial de cambios (no alcanza con un estado fijo "emitida"), clave para trazabilidad ante auditorías o el consejo de propietarios.

### Cobranza multi-medio
- Medios soportados: Mercado Pago, SIRO, efectivo/transferencia con conciliación manual.
- Si un pago **no matchea** con ninguna expensa pendiente (monto distinto, unidad ambigua): **no se registra automáticamente**, queda en una cola de excepciones (`pagos_sin_conciliar`) para que el administrador lo revise y asigne manualmente.
- **Pagos parciales permitidos**: una expensa no es un estado binario (pagada/no pagada), tiene un `saldo_pendiente` que se reduce con cada pago.
- **Recordatorios automáticos** de vencimiento unos días antes, vía job programado (Redis/BullMQ) — conecta con el módulo de Comunicación.

### Portal del propietario
- Ver saldo actual, histórico de expensas, y descargar comprobantes. Alcance simple, sin reglas de negocio adicionales identificadas.

### Amenities
- Reserva **auto-confirmada** al instante (sin aprobación previa del administrador), aunque el admin debe poder cancelar una reserva manualmente si hace falta.
- **Límite de reservas configurable por unidad/mes** por cada amenity (`limite_reservas_por_unidad`) — el sistema cuenta las reservas ya hechas por esa unidad en el período antes de permitir una nueva.
- **Costo/seña configurable** por el administrador — genera un cargo (`cargo_amenity`) que reutiliza la misma infraestructura de cobro multi-medio que las expensas.

### Contactos
- Edición: el **administrador** gestiona el directorio general; cada **proveedor** puede editar su propia ficha (requiere `owner_id` opcional vinculando el contacto a una cuenta de proveedor).
- **Visibilidad por rol**: algunos contactos son públicos (todos los que tienen cuenta en ese consorcio), otros solo visibles para admin/consejo. Requiere campo `visibilidad` y filtro por rol al armar el listado (mismo patrón de permisos que Identity).

### Proveedor — perfil básico
- Perfil con especialidad, teléfono, disponibilidad para urgencias.
- **Sello de verificado**: flag/estado puesto por el administrador, probablemente afecta si el proveedor aparece destacado en la sección de emergencias.
- Sin flujo de presupuestos todavía (eso queda para Alcance 3, "Proveedor — portal completo").

### Comunicación básica
- Pueden enviar avisos: **administrador y consejo de propietarios**.
- **Segmentación de destinatarios**: a todos, a una unidad puntual, o a un grupo (ej. solo propietarios, excluyendo inquilinos) — requiere sistema de destinatarios flexible.
- **Sin plantillas** en el MVP — cada aviso se escribe desde cero.

---

## Implicancias transversales para el esquema de datos

- **Relaciones muchos-a-muchos** se repiten en varios lugares: administrador↔consorcio, proveedor↔consorcio. Conviene modelarlas con el mismo patrón reutilizable.
- **Invitaciones** es una entidad compartida entre Identity (propietarios/inquilinos) y Proveedor (altas de proveedor) — un solo mecanismo, no dos.
- **Soft delete** debe ser la norma general para usuarios y para todo lo que tenga implicancia de auditoría (boletas, pagos), no solo para "cerrar cuenta".
- **Versionado/historial** hace falta en Liquidación de expensas (boletas corregidas) — evaluar si conviene un patrón general de auditoría (tabla de eventos) reutilizable por otros módulos a futuro (ej. reclamos, asambleas).
- **Cargos multi-origen**: tanto expensas como amenities generan cargos que pasan por el mismo módulo de Cobranza — conviene modelar un concepto genérico de "cargo" del que expensas y amenities sean casos particulares, en vez de dos flujos de pago separados.
- **Permisos por rol y visibilidad** aparecen tanto en Identity como en Contactos — mismo patrón de control de acceso, reutilizable.
