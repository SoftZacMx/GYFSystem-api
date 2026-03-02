# Planning — Buenas prácticas y mejoras

## Estado actual (buenas prácticas ya presentes)

- **Capas:** Controladores → Servicios → Repositorios con responsabilidades claras.
- **Validación con Zod:** Body y query tipados y validados antes de usarlos.
- **Inyección de dependencias:** Servicios reciben repositorios por constructor; composición en `index.ts`.
- **Interfaces de repositorios:** `ICompanyRepository`, etc., para desacoplar y facilitar tests.
- **Manejo de errores centralizado:** `createAppError` y middleware global que unifica respuestas de error.
- **Migraciones:** Esquema versionado con TypeORM.
- **Auth en rutas:** Middleware de autenticación en endpoints que lo requieren.
- **Variables de entorno:** Validación con Zod en `config/env.ts` al arranque.
- **Helmet:** Cabeceras de seguridad ya aplicadas.
- **Logger:** Pino configurado (niveles por entorno, pino-pretty en desarrollo).

---

## Mejoras implementadas

### 1. Tipado de Express (`req.user`, `req.validatedQuery`)

- **Archivo:** `src/types/express.d.ts`
- **Qué hace:** Extiende `Express.Request` con `user?: AccessTokenPayload` (tras `authMiddleware`) y `validatedQuery?: unknown` (tras `validateQuery`).
- **Beneficio:** Mejor autocompletado y menos casts; rutas que usan auth pueden tipar `req.user`.

### 2. Middlewares de validación reutilizables

- **Archivo:** `src/middlewares/validate.ts`
- **Qué hace:** `validateBody(schema)` y `validateQuery(schema)` parsean `req.body` / `req.query`; en éxito asignan a `req.body` / `req.validatedQuery` y llaman a `next()`; en error llaman a `next(zodError)` (el global error handler ya devuelve 400 con mensaje controlado).
- **Beneficio:** Menos repetición en controladores; un solo middleware por ruta en lugar de 4–5 líneas de parse + comprobación.

### 3. Logging de peticiones

- **Archivo:** `src/middlewares/request-logger.ts`
- **Qué hace:** Middleware que registra método, URL, statusCode y duración por petición. No registra body ni cabeceras para evitar datos sensibles.
- **Beneficio:** Trazabilidad en desarrollo y producción sin exponer información sensible.

### 4. Rate limiting

- **Paquete:** `express-rate-limit`
- **Uso:** Límite por IP (ventana y máximo configurables; por defecto 100 peticiones / 15 min).
- **Beneficio:** Mitiga abuso y fuerza bruta sin bloquear uso normal.

### 5. Documentación API (OpenAPI / Swagger)

- **Archivos:** Especificación OpenAPI (p. ej. `src/config/openapi.ts` o `docs/openapi.json`) y `swagger-ui-express`.
- **Ruta:** `GET /api-docs` sirve la UI de Swagger.
- **Beneficio:** Contrato claro para el frontend y otros consumidores; documentación siempre alineada si se mantiene el spec.

### 6. Tests unitarios (ejemplo: Company)

- **Herramienta:** Vitest.
- **Alcance:** Validadores de company (schemas) y `CompanyService` (get, update, create) con repositorio mockeado.
- **Beneficio:** Regresiones detectadas; base para extender tests a otros módulos.

### 7. Env estricto en producción

- **Archivo:** `src/config/env.ts`
- **Qué hace:** El env ya se validaba con Zod; se añadió un `.refine()` que en `NODE_ENV=production` exige `JWT_SECRET` con al menos 32 caracteres. Si no se cumple, el arranque falla con mensaje claro.
- **Beneficio:** Menos riesgo de desplegar con secret débil.

---

## Malas prácticas mitigadas

| Antes | Mejora |
|-------|--------|
| Repetición parse + next en cada controlador | Middlewares `validateBody` / `validateQuery` en rutas |
| Zod pasado tal cual a `next()` | El global error handler ya formatea Zod a 400 con mensaje controlado; los middlewares solo pasan el error |
| Sin tipado de `req.user` | `Express.Request` extendido con `user` y `validatedQuery` |
| Sin límite de peticiones | Rate limiting por IP |
| Sin documentación de API | OpenAPI + Swagger UI en `/api-docs` |
| Sin tests | Vitest + tests de validadores y CompanyService |
| Posible JWT_SECRET débil en producción | Validación de longitud mínima en env |

---

## Pendiente / mejoras futuras

- **Transacciones:** Operaciones que toquen varias tablas usar `DataSource.transaction()` para consistencia.
- **Más tests:** Extender a otros servicios, controladores e integración (rutas + DB).
- **Validación de env ampliada:** Más reglas por entorno (p. ej. URLs, rangos de puertos).
- **Request ID:** Añadir `X-Request-Id` y loguearlo para correlacionar logs por petición.

---

## Resumen de archivos tocados

| Archivo | Cambio |
|---------|--------|
| `docs/PLANNING.md` | Este documento |
| `src/types/express.d.ts` | Tipado de `Request` |
| `src/middlewares/validate.ts` | `validateBody`, `validateQuery` |
| `src/middlewares/request-logger.ts` | Log de peticiones |
| `src/config/env.ts` | JWT_SECRET mínimo en producción |
| `src/config/openapi.ts` | Spec OpenAPI 3 (health, company) |
| `src/index.ts` | Rate limit, request logger, Swagger en `/api-docs` |
| `src/routes/company.routes.ts` | Uso de `validateQuery` y `validateBody` |
| `src/controllers/CompanyController.ts` | Uso de `req.validatedQuery` y `req.body` ya validado |
| `package.json` | Scripts `test` y `test:watch`; deps `express-rate-limit`, `swagger-ui-express`, `vitest` |
| `vitest.config.ts` | Configuración Vitest (node, globals, src/**/*.test.ts) |
| `src/validators/company.test.ts` | Tests de validadores (query, create, update) |
| `src/services/CompanyService.test.ts` | Tests de CompanyService (get, update, create) con repo mock |
