# Stack técnico: App de Administración de Consorcios

Definición de tecnología para el desarrollo web + mobile, sobre la arquitectura de **monolito modular** ya definida en el plan de producto.

**Criterio general:** stack unificado en **TypeScript** de punta a punta (backend, web, mobile) para compartir tipos, validaciones y lógica de negocio, y minimizar el costo de mantener dos lenguajes distintos con un equipo chico.

---

## Backend

| Tecnología | Uso |
|---|---|
| **Node.js + NestJS** | Framework backend. Encaja con el enfoque de monolito modular: cada módulo (Expensas, Cobranzas, Reclamos, etc.) como su propio controller/service/provider, fácil de aislar o extraer a servicio propio más adelante |
| **PostgreSQL + Prisma** | Base de datos y ORM. Buen soporte para schema-per-módulo, migraciones claras, tipado automático que se propaga al resto del stack |
| **Redis + BullMQ** | Jobs en background: liquidación mensual, conciliación de pagos, envío de notificaciones |
| **Passport.js / Auth.js** | Login usuario/contraseña + SSO (Gmail, Outlook) |

## Web

| Tecnología | Uso |
|---|---|
| **Next.js (React)** | Panel del administrador (tablas, reportes, dashboards) y versión web del portal del propietario |

## Mobile

| Tecnología | Uso |
|---|---|
| **React Native + Expo** | App del propietario (iOS/Android). Comparte lógica y tipos con el resto del stack por ser React. Expo simplifica builds y permite actualizaciones OTA sin pasar por review de las stores |

## Compartido (monorepo)

| Tecnología | Uso |
|---|---|
| **Turborepo o Nx** | Un solo repo: `apps/api`, `apps/web`, `apps/mobile`, `packages/shared` (tipos, validaciones con Zod, cliente de API) — evita duplicar lógica de negocio entre plataformas |

## Infraestructura (MVP — simple, sin sobre-ingeniería)

| Servicio | Uso |
|---|---|
| **Railway o Render** | Hosting del backend + PostgreSQL administrado |
| **Vercel** | Hosting del Next.js (web) |
| **Cloudflare R2 o AWS S3** | Almacenamiento de comprobantes, actas, documentos |
| **Firebase Cloud Messaging** | Push notifications (compatible con Expo/RN) |

*Migrar a infraestructura más robusta (AWS/GCP con contenedores, etc.) cuando el volumen lo justifique — no es necesario desde el día uno.*

## Pagos e integraciones locales

| Medio | Cómo se integra |
|---|---|
| **Mercado Pago** | SDK oficial de Node, API REST moderna — el adaptador más directo |
| **SIRO** | Interfaz bancaria por archivo, no API REST — se resuelve con un job que procesa archivos de conciliación en batch |
| **Efectivo / transferencia manual** | Sin integración externa: carga de comprobante por el vecino + aprobación del administrador |

---

## Alternativa a evaluar más adelante

**React Native Web** (vía Expo) permitiría una sola base de código para web y mobile literalmente (no solo lógica compartida, sino UI). Se descarta para el MVP porque el panel de administrador necesita una experiencia "de escritorio" (tablas densas, atajos de teclado) que Next.js resuelve mejor. Podría reconsiderarse si en algún momento el portal del propietario (web) y el mobile quieren fusionarse en un solo código.
