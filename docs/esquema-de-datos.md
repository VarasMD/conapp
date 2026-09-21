# Esquema de datos (por módulo)

Diseño de tablas y relaciones, organizado por módulo (mismo criterio de "schema-per-módulo" que definimos en la arquitectura). Escrito en sintaxis tipo Prisma para que sea casi directamente trasladable al `schema.prisma` real. Los nombres de modelos y campos están en inglés porque son código; el resto del documento está en español.

**Convención de IDs:** todas las primary key son `Int` autoincremental (`@id @default(autoincrement())`), como en SQL Server — no UUID. Única excepción con matiz: `Role` suma un campo `code` (string, único) además del `id` numérico, para poder leer/buscar por un valor legible (`"admin"`) sin perder la consistencia de tener `id: Int` en todas las tablas.

**Patrones transversales aplicados** (ver `especificacion-funcional-modulos.md`):
- Soft delete (`active: Boolean` en vez de borrar filas) en todo lo que tenga implicancia de auditoría.
- Relaciones muchos-a-muchos vía una tabla `Membership` reutilizada para admin↔consorcio, proveedor↔consorcio, propietario/inquilino↔unidad.
- `Invitation` como mecanismo único, compartido entre altas de propietario/inquilino y de proveedor.
- `Charge` como concepto genérico, del que `Invoice` (expensas) y `AmenityBooking` (amenities) son posibles orígenes.
- `AuditLog` como log de auditoría genérico y único, usado por cualquier módulo que necesite trazabilidad (boletas corregidas, pagos reasignados, cambios de membresía, verificación de proveedores) en vez de una tabla de historial por módulo.

---

## Núcleo

```prisma
model User {
  id              Int      @id @default(autoincrement())
  email           String   @unique
  passwordHash    String?
  ssoProvider     String?  // "google" | "microsoft" | null
  name            String
  phone           String?
  language        String   @default("es-AR")
  active          Boolean  @default(true) // soft delete
  createdAt       DateTime @default(now())

  preferences     UserPreferences?
  memberships     Membership[]
  providerProfile ProviderProfile?
}

model UserPreferences {
  id                Int     @id @default(autoincrement())
  userId            Int     @unique
  user              User    @relation(fields: [userId], references: [id])
  notifChannel      String  @default("push") // "push" | "email" | "both"
  notifFrequency    String  @default("immediate")
  alternativePhone  String?
}

model Condominium {
  id          Int      @id @default(autoincrement())
  name        String
  type        String   // "building" | "gated_community" | "office" | "gallery"
  address     String?
  taxId       String?  // CUIT
  metadata    Json?    // campos condicionales según tipo
  createdAt   DateTime @default(now())

  units       Unit[]
  memberships Membership[]
}

model Unit {
  id            Int      @id @default(autoincrement())
  condominiumId Int
  condominium   Condominium @relation(fields: [condominiumId], references: [id])
  label         String    // "4B", "Lote 12", etc.
  coefficient   Decimal?  // null para tipos que no usan coeficiente clásico
  metadata      Json?

  memberships   Membership[]
  bookings      AmenityBooking[]
  charges       Charge[]
}

// Catálogo de roles disponibles. Empieza con las 6 filas fijas del MVP
// (admin, owner, tenant, board_member, provider, super_intendent) cargadas
// como seed data, pero al ser tabla aparte permite sumar roles nuevos o
// agregar permisos más finos (ej. subroles de administrador) sin tocar Membership.
model Role {
  id        Int      @id @default(autoincrement())
  code      String   @unique // "admin" | "owner" | "tenant" | "board_member" | "provider" | "super_intendent"
  name      String   // nombre para mostrar
  createdAt DateTime @default(now())

  memberships Membership[]
  invitations Invitation[]
}

// Tabla central de roles: cubre admin↔consorcio, proveedor↔consorcio,
// propietario/inquilino↔unidad — un solo patrón reutilizado en todos los casos.
model Membership {
  id                Int      @id @default(autoincrement())
  userId            Int
  user              User     @relation(fields: [userId], references: [id])
  condominiumId     Int
  condominium       Condominium @relation(fields: [condominiumId], references: [id])
  unitId            Int?
  unit              Unit?    @relation(fields: [unitId], references: [id])
  roleId            Int
  role              Role     @relation(fields: [roleId], references: [id])
  ownerMembershipId Int?     // si role="tenant", referencia a la membresía del propietario que lo invitó
  active            Boolean  @default(true)
  createdAt         DateTime @default(now())
}

model Invitation {
  id              Int      @id @default(autoincrement())
  email           String
  condominiumId   Int
  roleId          Int
  role            Role     @relation(fields: [roleId], references: [id])
  unitId          Int?
  code            String   @unique // para el flujo de auto-registro
  invitedByUserId Int?     // admin o propietario que invita
  status          String   @default("pending") // "pending" | "accepted" | "expired"
  createdAt       DateTime @default(now())
  expiresAt       DateTime
}

// Log de auditoría genérico y único para toda la plataforma. Reemplaza
// a una tabla de historial por módulo: cualquier cambio sensible
// (boleta corregida, pago reasignado, membresía modificada, proveedor
// verificado) se registra acá, referenciando la entidad afectada.
model AuditLog {
  id          Int      @id @default(autoincrement())
  entityType  String   // "Invoice" | "Payment" | "Membership" | "ProviderProfile" | ...
  entityId    Int
  action      String   // "created" | "updated" | "corrected" | "deleted"
  actorUserId Int?
  changes     Json     // { field: { before, after } }
  createdAt   DateTime @default(now())
}
```

---

## Expensas

```prisma
model Expense {
  id                 Int      @id @default(autoincrement())
  condominiumId      Int
  type               String   // "ordinary" | "extraordinary" | "differentiated"
  description        String
  amount             Decimal
  date               DateTime
  allocationCriteria String   @default("general_coefficient") // "general_coefficient" | "custom"
  createdAt          DateTime @default(now())

  allocations        ExpenseAllocation[]
}

// Solo se usa cuando allocationCriteria = "custom" (gastos diferenciados)
model ExpenseAllocation {
  id             Int     @id @default(autoincrement())
  expenseId      Int
  expense        Expense @relation(fields: [expenseId], references: [id])
  unitId         Int
  assignedAmount Decimal
}

model Settlement {
  id            Int      @id @default(autoincrement())
  condominiumId Int
  period        String   // "2026-09"
  status        String   @default("draft") // "draft" | "issued" | "corrected"
  version       Int      @default(1)
  createdAt     DateTime @default(now())

  invoices      Invoice[]
}

model Invoice {
  id           Int      @id @default(autoincrement())
  settlementId Int
  settlement   Settlement @relation(fields: [settlementId], references: [id])
  unitId       Int
  totalAmount  Decimal
  dueDate      DateTime
  pdfUrl       String?
  version      Int      @default(1)
  createdAt    DateTime @default(now())

  charge       Charge?
}
```

Cada corrección/re-emisión de una boleta genera un registro en `AuditLog` (`entityType="Invoice"`, `action="corrected"`), con el estado anterior guardado en `changes` — no hace falta una tabla de historial propia para Expensas.

---

## Cobranzas

```prisma
// Concepto genérico: tanto una Invoice (expensa) como una AmenityBooking
// pueden generar un Charge. Los Payment siempre apuntan a un Charge, nunca
// directamente a una Invoice o una Booking.
model Charge {
  id               Int      @id @default(autoincrement())
  unitId           Int
  unit             Unit     @relation(fields: [unitId], references: [id])
  origin           String   // "expense" | "amenity"
  originId         Int      // id de Invoice o AmenityBooking
  amount           Decimal
  remainingBalance Decimal
  dueDate          DateTime?
  createdAt        DateTime @default(now())

  invoice          Invoice? @relation(fields: [originId], references: [id], map: "charge_invoice_fk")
  payments         Payment[]
}

model Payment {
  id          Int      @id @default(autoincrement())
  chargeId    Int
  charge      Charge   @relation(fields: [chargeId], references: [id])
  amount      Decimal
  method      String   // "mercado_pago" | "siro" | "cash" | "bank_transfer"
  receiptUrl  String?
  paidAt      DateTime
  createdAt   DateTime @default(now())
}

// Cola de excepciones: pagos recibidos que no matchean automáticamente
// con ningún Charge pendiente. Se resuelven manualmente.
model UnmatchedPayment {
  id               Int      @id @default(autoincrement())
  method           String
  amount           Decimal
  rawData          Json     // payload original del medio de pago / archivo SIRO
  status           String   @default("pending") // "pending" | "resolved"
  assignedChargeId Int?
  resolvedByUserId Int?
  createdAt        DateTime @default(now())
}
```

---

## Amenities

```prisma
model Amenity {
  id                  Int      @id @default(autoincrement())
  condominiumId       Int
  name                String   // "SUM", "Pileta", "Parrilla"
  bookingLimitPerUnit Int?     // null = sin límite
  cost                Decimal? // null = gratis
  createdAt           DateTime @default(now())

  bookings            AmenityBooking[]
}

model AmenityBooking {
  id         Int      @id @default(autoincrement())
  amenityId  Int
  amenity    Amenity  @relation(fields: [amenityId], references: [id])
  unitId     Int
  unit       Unit     @relation(fields: [unitId], references: [id])
  userId     Int
  date       DateTime
  timeSlot   String?  // franja horaria, si aplica
  status     String   @default("confirmed") // "confirmed" | "cancelled"
  createdAt  DateTime @default(now())
}
```

---

## Contactos

```prisma
model Contact {
  id            Int      @id @default(autoincrement())
  condominiumId Int
  name          String
  category      String   // "emergency" | "provider" | "resident"
  phone         String
  ownerUserId   Int?     // si el contacto es la ficha de un Proveedor con cuenta propia
  visibility    String   @default("public") // "public" | "admin_board"
  createdAt     DateTime @default(now())
}
```

---

## Proveedor

```prisma
// Extiende a User cuando la Membership tiene role="provider"
model ProviderProfile {
  id                   Int      @id @default(autoincrement())
  userId               Int      @unique
  user                 User     @relation(fields: [userId], references: [id])
  specialty            String   // "locksmith", "plumber", "electrician", ...
  availableForUrgent   Boolean  @default(false)
  verified             Boolean  @default(false)
  verifiedByUserId     Int?
  createdAt            DateTime @default(now())
}
```

---

## Comunicación

```prisma
model Announcement {
  id            Int      @id @default(autoincrement())
  condominiumId Int
  authorId      Int      // usuario con role admin o board_member
  title         String
  body          String
  targetScope   String   // "all" | "unit" | "group"
  unitId        Int?     // si targetScope="unit"
  group         String?  // "owners" | "tenants", si targetScope="group"
  createdAt     DateTime @default(now())

  deliveries    SentNotification[]
}

model SentNotification {
  id             Int      @id @default(autoincrement())
  announcementId Int
  announcement   Announcement @relation(fields: [announcementId], references: [id])
  userId         Int
  channel        String   // "push" | "email"
  status         String   @default("sent") // "sent" | "read"
  createdAt      DateTime @default(now())
}
```

---

## Notas para la siguiente iteración

- **`Charge.originId`** apunta a distintas tablas según `origin` (Invoice o AmenityBooking) — esto es un patrón polimórfico que Prisma no modela nativamente con una FK típica; en la implementación real conviene resolverlo a nivel de aplicación (el `charge_invoice_fk` de arriba es orientativo) o separar en dos FKs opcionales (`invoiceId?`, `amenityBookingId?`) si se prefiere integridad referencial estricta a nivel de base.
- **`Unit.metadata` y `Condominium.metadata`** quedan como `Json` para los campos condicionales por tipo de consorcio (edificio/country/oficina/galería) — evita modelar de entrada todas las variantes posibles; se pueden "graduar" a columnas propias más adelante si un campo se vuelve común a todos los tipos.
- Falta definir **índices** (por ejemplo `Charge.unitId + remainingBalance` para las queries de morosidad, `Invoice.dueDate` para los recordatorios automáticos) — se agregan naturalmente al escribir las queries reales, no hace falta anticiparlos todos ahora.
- Los módulos de Alcance 2/3 (Reclamos, Asambleas, Sueldos, Proveedor-portal-completo) no están en este esquema — se diseñan cuando se aborde cada fase.
- `AuditLog` queda como tabla única y genérica para toda la plataforma. Si con el tiempo el volumen de registros de auditoría crece mucho, es candidata a particionarse por fecha o moverse a un almacenamiento distinto (ej. un log store aparte de la base transaccional) sin afectar al resto del esquema.
