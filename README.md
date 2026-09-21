# Consorcios App

Monorepo del MVP: administración de consorcios en Argentina.

## Estructura

- `apps/api` — Backend NestJS (monolito modular) + Prisma
- `apps/web` — Panel de administrador y portal del propietario en web (Next.js)
- `apps/mobile` — App del propietario (React Native + Expo)
- `packages/shared` — Tipos, validaciones (Zod) y cliente de API compartidos

## Documentación de referencia

Este esqueleto sigue las definiciones de producto y arquitectura acordadas:
plan de producto, stack técnico, especificación funcional, esquema de datos,
estructura de carpetas y plan de ejecución por fases.

## Primeros pasos

```bash
npm install
cp apps/api/.env.example apps/api/.env   # completar DATABASE_URL
npx prisma generate --schema=apps/api/prisma/schema.prisma
npm run dev
```
