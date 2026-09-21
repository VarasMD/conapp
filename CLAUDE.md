# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Qué es esto

Monorepo del MVP de una app de administración de consorcios (Argentina). npm workspaces + Turborepo, TypeScript de punta a punta. Documentación y comentarios de negocio en español; nombres de código (carpetas, archivos, modelos, símbolos) en inglés.

**Estado actual: es un esqueleto.** Solo existe un módulo de ejemplo (`condominiums`, con un service placeholder que devuelve datos vacíos) y el schema Prisma completo. El repo todavía no tiene commits.

## Comandos

Se corren desde la raíz (Turborepo los reparte a cada workspace):

```bash
npm install
npm run dev     # turbo dev  — api (nest --watch), web (next dev), mobile (expo start)
npm run build   # turbo build
npm run lint    # turbo lint
npm run test    # turbo test (depende de ^build)
```

Un solo workspace: `npx turbo dev --filter=@conapp/api` (o `npm run dev -w @conapp/api`).

API / Prisma (el schema está en `apps/api/prisma/schema.prisma`, no en la raíz):

```bash
cp apps/api/.env.example apps/api/.env      # completar DATABASE_URL (PostgreSQL)
npx prisma generate --schema=apps/api/prisma/schema.prisma
npm run prisma:migrate -w @conapp/api       # prisma migrate dev
```

Un test individual (cuando haya): `npm test -w @conapp/api -- <patrón>` (Jest).

CI (`.github/workflows/ci.yml`): Node 20, `npm install` → `lint` → `build` → `test` en cada push/PR.

### Ojo: el tooling está referenciado pero no instalado/configurado

- Los scripts `lint`/`test` usan `eslint`, `jest` y `next lint`, pero **ninguno está en `devDependencies`** ni hay configs (`.eslintrc`, `jest.config`). Hasta que se agreguen, `npm run lint` y `npm run test` van a fallar en los workspaces que los definen (y por lo tanto el CI).
- `packages/config` (eslint/tsconfig/tailwind compartidos según los docs) existe pero está vacío. Solo `apps/api` tiene `tsconfig.json`.
- No hay `packages/ui` todavía (aparece en los docs).

## Arquitectura

Monolito modular: el backend es una sola app NestJS, y cada módulo de negocio es un módulo Nest aislado para poder extraerlo a servicio propio después (candidato más probable: Cobranzas → `apps/billing-service/`).

- `apps/api` — NestJS + Prisma (PostgreSQL). `src/core/` = núcleo transversal (users, condominiums, units, memberships, roles, invitations, audit-log, auth); `src/modules/` = dominio del MVP (expenses, billing, amenities, contacts, providers, communication). Solo `core/condominiums` está creado; cada módulo nuevo debe registrarse en `src/app.module.ts`. Patrón interno de cada módulo: `*.module.ts`, `*.controller.ts`, `*.service.ts`, `dto/`, `*.service.spec.ts`. Aún no existe un `PrismaService` compartido (los services lo van a inyectar cuando se arme).
- `apps/web` — Next.js 14 (App Router): panel de administrador y portal del propietario. Planificado con grupos de rutas `(admin)` y `(owner)`.
- `apps/mobile` — Expo 51 + expo-router: app del propietario.
- `packages/shared` (`@conapp/shared`) — pensado para compartir entre api/web/mobile: tipos derivados de Prisma, schemas Zod (mismas reglas en front y back) y cliente tipado de la API. Hoy `src/index.ts` está vacío; se consume como fuente TS (`main: src/index.ts`, sin build).

### Decisiones de modelado que conviene conocer (schema.prisma)

- **Multi-tenancy por `condominiumId`**: casi todo cuelga de un `Condominium`; el acceso de un usuario se resuelve vía `Membership` (user + condominio + rol + unidad opcional). No hay un tenant/organización por encima.
- Enums modelados como `String` (p. ej. `Charge.origin`, `status`, `method`), no como `enum` de Prisma; los valores permitidos están documentados en `docs/esquema-de-datos.md`.
- `Charge` reemplaza una FK polimórfica del diseño original por dos FKs opcionales únicas (`invoiceId`, `amenityBookingId`) discriminadas por `origin`.
- Varios `*Id` (p. ej. `Expense.condominiumId`, `Settlement.condominiumId`, `Contact.condominiumId`) son enteros sin `@relation` declarada; hay que verificar antes de asumir integridad referencial en base.

## Docs de referencia (`docs/`)

Fuente de verdad de las decisiones de producto/arquitectura; leer antes de agregar módulos:

- `estructura-carpetas-monorepo.md` — layout objetivo del monorepo y patrón de módulos.
- `esquema-de-datos.md` — modelo por módulo y notas pendientes para la próxima iteración.
- `especificacion-funcional-modulos.md` — alcance funcional del MVP por módulo.
- `stack-tecnico-consorcios.md` — stack elegido y previsto (Redis + BullMQ, Passport/Auth.js, Mercado Pago, SIRO, S3/R2, FCM aún no están en el código).
- `plan-app-administracion-consorcios.md` — plan de producto y fases.
