# Estructura de carpetas del monorepo

Basada en el stack (NestJS + Prisma + Next.js + React Native/Expo, con Turborepo) y en la arquitectura de monolito modular ya definidos. Nombres de carpetas y archivos en inglés porque son código; este documento en español.

```
condo-app/
├── apps/
│   ├── api/                        # Backend NestJS — el monolito modular
│   │   ├── src/
│   │   │   ├── core/                    # Núcleo compartido (ver plan de producto)
│   │   │   │   ├── users/
│   │   │   │   ├── condominiums/
│   │   │   │   ├── units/
│   │   │   │   ├── memberships/
│   │   │   │   ├── roles/
│   │   │   │   ├── invitations/
│   │   │   │   ├── audit-log/
│   │   │   │   └── auth/                # login, SSO, recupero de contraseña
│   │   │   ├── modules/                 # Módulos de dominio del MVP
│   │   │   │   ├── expenses/            # Liquidación de expensas
│   │   │   │   ├── billing/             # Cobranza multi-medio
│   │   │   │   ├── amenities/
│   │   │   │   ├── contacts/
│   │   │   │   ├── providers/           # Proveedor — perfil básico
│   │   │   │   └── communication/       # Comunicación básica (avisos)
│   │   │   ├── app.module.ts
│   │   │   └── main.ts
│   │   ├── prisma/
│   │   │   ├── schema.prisma            # el esquema completo que ya definimos
│   │   │   └── migrations/
│   │   └── test/
│   │
│   ├── web/                        # Next.js — panel admin + portal propietario (web)
│   │   ├── app/
│   │   │   ├── (admin)/                 # rutas del panel de administrador
│   │   │   ├── (owner)/                 # rutas del portal del propietario en web
│   │   │   └── layout.tsx
│   │   ├── components/
│   │   └── lib/
│   │
│   └── mobile/                     # React Native + Expo — app del propietario
│       ├── app/                         # pantallas (expo-router)
│       ├── components/
│       └── lib/
│
├── packages/
│   ├── shared/                     # Lo que comparten api + web + mobile
│   │   └── src/
│   │       ├── types/                   # tipos derivados de Prisma
│   │       ├── schemas/                 # validaciones con Zod (mismas reglas en front y back)
│   │       └── api-client/              # cliente tipado para llamar a la API
│   │
│   ├── ui/                         # Componentes de diseño compartidos (web, y lo que aplique a mobile)
│   │
│   └── config/                     # eslint, tsconfig, tailwind config compartidos
│
├── turbo.json
├── package.json
└── README.md
```

## Cómo se ve un módulo por dentro (ejemplo: `expenses/`)

Todos los módulos de `core/` y `modules/` siguen el mismo patrón interno de NestJS:

```
expenses/
├── expenses.module.ts       # declara el módulo y sus dependencias
├── expenses.controller.ts   # recibe las peticiones HTTP
├── expenses.service.ts      # lógica de negocio (prorrateo, emisión de boletas)
├── dto/                     # validación de entrada/salida de cada endpoint
│   ├── create-expense.dto.ts
│   └── correct-invoice.dto.ts
└── expenses.service.spec.ts # tests
```

## Ideas clave de esta organización

- **`apps/` vs `packages/`**: `apps/` son las tres cosas que se despliegan (API, web, mobile). `packages/` es código que no se despliega solo, sino que los `apps/` importan — evita duplicar tipos y validaciones entre backend y frontends.
- **`core/` vs `modules/` dentro de `api/`**: refleja exactamente la separación núcleo/dominio que ya definimos en la arquitectura — no es una carpeta nueva, es la misma idea llevada a disco.
- **Un solo `schema.prisma`**: aunque hablemos de "un esquema por módulo" a nivel conceptual, en la práctica Prisma trabaja con un archivo de schema por proyecto — la separación por módulo se refleja en que cada modelo pertenece conceptualmente a un dominio (documentado en `esquema-de-datos.md`), no en archivos separados. Si en algún momento el proyecto crece mucho, Prisma permite dividir el schema en múltiples archivos `.prisma` que se combinan en uno solo al generar el cliente.
- **`packages/shared/types`**: se generan a partir de los modelos de Prisma (`api`) y se consumen tanto en `web` como en `mobile` — así un cambio en el esquema de datos se propaga como error de compilación en el frontend si algo quedó desalineado, en vez de romperse en producción.
- **Cuando un módulo necesite separarse** (Cobranzas, el candidato más probable): se mueve la carpeta `modules/billing/` a su propio `apps/billing-service/`, reutilizando la lógica ya escrita — el corte es limpio porque el módulo ya vivía aislado.
