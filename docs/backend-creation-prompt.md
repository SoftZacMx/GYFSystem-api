# Prompt: Creación del Backend — Files Manager API

Usa este documento como guía o prompt al generar o extender el backend de **Files Manager API**.

---

## Contexto

- **Lenguaje:** Todo el backend se escribe en **TypeScript (TS)**. No usar JavaScript (JS); entradas, servicios, entidades, migraciones y configuración deben ser `.ts`.
- **Idioma del código:** Todo el código, nombres de archivos, nombres de variables, clases, interfaces, comentarios en código, mensajes de log y claves de respuesta deben estar en **inglés**. Este documento (el prompt) se mantiene en español.
- **Stack:** Node.js + Express. Validación de entrada con **Zod** (esquemas, campos requeridos, tipos inferidos).
- **Arquitectura:** MVC (Model-View-Controller).
- **Principios:** SOLID en toda la implementación.
- **Base de datos:** Relacional (según ERD: usuarios, estudiantes, documentos, eventos, notificaciones, audit log). Stack detallado, auth, query params y códigos de error en las secciones siguientes.

---

## Stack técnico

| Ámbito        | Tecnología | Uso |
|---------------|------------|-----|
| Runtime       | Node.js (LTS) | Ejecución del backend. |
| API           | Express | Servidor HTTP y rutas. |
| Lenguaje      | TypeScript | Código, entidades, tipos. |
| Base de datos | MySQL | Persistencia relacional. |
| ORM           | TypeORM | Entidades, repositorios, migraciones. |
| Validación    | Zod | Esquemas body/params/query, tipos inferidos. |
| Auth           | JWT | Access token en header `Authorization: Bearer <token>`. |
| Archivos       | AWS S3 (o compatible S3) | Subida y URL de documentos; en BD solo `file_url` y metadata. |
| Tiempo real    | Socket.io | Notificaciones en vivo (emit al usuario al crear notificación). |
| Config         | dotenv | Variables de entorno; validar con Zod o módulo de config. |
| Logs           | pino | Logging estructurado (JSON); en producción evitar `console.log` para la app. |
| Seguridad      | Helmet, cors | Headers seguros y configuración de CORS. |

---

## Arquitectura MVC

### Model (Modelo)

- Representan entidades y lógica de dominio.
- Responsables de: estructura de datos, validaciones de negocio, acceso a datos (repositorios o capa de persistencia).
- No conocen HTTP ni Express (req/res). Solo datos y reglas de negocio.
- Ejemplos de entidades: `User`, `Student`, `Document`, `DocumentCategory`, `Event`, `Notification`, `AuditLog`, `UserType`, `Role`, `ParentStudent`.

### View (Vista)

- En una API REST, la “vista” es la **representación de la respuesta** (JSON, status, formato).
- Responsables de: serialización, DTOs, formateo de errores y respuestas estándar.
- Pueden vivir como **serializers**, **presenters** o **response helpers** que transforman modelos/DTOs a JSON.

### Controller (Controlador)

- Reciben la petición HTTP (req/res), delegan en servicios o casos de uso y devuelven la respuesta usando la “vista” (formato de respuesta).
- Delgados: orquestan, no contienen lógica de negocio ni de persistencia.
- Validan entrada (o delegan en validadores) y traducen errores a códigos HTTP y mensajes coherentes.

---

## Principios SOLID

### S — Single Responsibility (Responsabilidad única)

- Cada módulo/clase tiene una única razón de cambio.
- Ejemplo: un `UserService` orquesta lógica de usuario; un `UserRepository` solo accede a datos; un `UserSerializer` solo formatea la respuesta.

### O — Open/Closed (Abierto/Cerrado)

- Abierto a extensión (nuevos comportamientos sin tocar lo existente), cerrado a modificación.
- Usar interfaces/contratos (por ejemplo repositorios, servicios) e inyección de dependencias para poder extender con nuevas implementaciones.

### L — Liskov Substitution (Sustitución de Liskov)

- Las implementaciones concretas deben poder sustituir a sus abstracciones sin romper el contrato.
- Ejemplo: cualquier implementación de `IUserRepository` debe cumplir el mismo contrato que esperan los servicios.

### I — Interface Segregation (Segregación de interfaces)

- Interfaces pequeñas y específicas en lugar de una interfaz gigante.
- Ejemplo: `IUserReader`, `IUserWriter` o `IUserRepository` con métodos acotados, en lugar de un único “god interface”.

### D — Dependency Inversion (Inversión de dependencias)

- Los módulos de alto nivel no dependen de los de bajo nivel; ambos dependen de abstracciones.
- Los controladores y servicios dependen de interfaces (repositorios, servicios), no de implementaciones concretas. Las implementaciones se inyectan (p. ej. en el bootstrap de la app).

---

## Estructura de carpetas sugerida

```
src/
├── config/           # Configuración (env, DB, etc.)
├── models/           # Entidades y/o modelos de dominio
├── repositories/     # Acceso a datos (implementaciones)
├── services/         # Lógica de negocio / casos de uso
├── controllers/      # Controladores HTTP
├── views/            # Serializers, presenters, formato de respuesta (API)
├── middlewares/      # Auth, validación, errores, logging
├── routes/           # Definición de rutas (usan controladores)
├── validators/       # Validación de entrada (opcional, puede ir en middlewares)
└── index.ts          # Entrada y montaje de la app
```

---

## Requisitos de implementación

1. **Rutas:** Organizar por recurso (users, students, documents, events, notifications, audit) y usar controladores, no lógica en el router.
2. **Validación:** Validar body, params y query en capa de controlador o middleware; rechazar con 400 y mensajes claros. Usar **Zod** (o librería equivalente) para esquemas, campos requeridos y parsing con tipos en TypeScript.
3. **Errores:** **Manejador global de errores** (middleware al final de la cadena): captura cualquier error no manejado, devuelve JSON uniforme (mensaje, código, detalles si aplica) y códigos HTTP coherentes (400, 401, 404, 500). No dejar promesas rechazadas sin capturar.
4. **Respuestas:** Formato estándar según la sección **“Formato estándar de respuestas API”**: en éxito siempre `success`, `data` y **`meta`** (mínimo `timestamp`; en listas paginadas también `page`, `limit`, `total`, `totalPages`); en error `success`, `error`. Implementar helpers en la capa vista y usarlos en controladores y manejador global de errores.
5. **Seguridad:** No exponer detalles internos en producción; sanitizar inputs; preparar puntos de extensión para autenticación y autorización.
6. **Base de datos:** Los modelos y repositorios deben alinearse con el ERD (tablas, FKs, tipos). La conexión y configuración en `config/`.
7. **SOLID:** Servicios y controladores dependientes de abstracciones (repositorios/servicios); inyección de dependencias en el arranque de la aplicación.
8. **MVC:** Lógica de negocio en servicios; persistencia en repositorios/modelos; formato de salida en views/serializers; controladores solo orquestando.

---

## Middlewares obligatorios

- **Manejador global de errores:** Middleware de cuatro argumentos `(err, req, res, next)`. Debe ir registrado al final, después de todas las rutas. Recibe cualquier error lanzado o pasado a `next(err)` y responde con JSON estándar y el código HTTP adecuado.
- **Auth (autenticación):** Middleware que verifique token/sesión (p. ej. JWT), extraiga el usuario y lo adjunte a `req` (p. ej. `req.user`). En rutas protegidas, si no hay token o es inválido, responder 401 y no llamar a `next()`.
- **Roles (autorización):** Middleware que reciba los roles permitidos (p. ej. `requireRoles('admin', 'editor')`). Compruebe que `req.user` existe y que su rol está en la lista; si no, responder 403. Debe usarse después del middleware de auth en rutas que exijan rol.
- **Validación de entrada:** Usar **Zod** para definir esquemas de `body`, `params` y `query` (campos requeridos, tipos, formatos). Un middleware o helper que ejecute `schema.parse()` y, si falla, devuelva 400 con los errores de Zod en el cuerpo de la respuesta. Así se centraliza la validación y se obtienen tipos TypeScript a partir del esquema.

---

## Autenticación (JWT)

- **Token:** JWT como **access token** en header `Authorization: Bearer <token>`.
- **Payload recomendado:** `sub` (user id), `email`, `roleId` (o `role`), `userTypeId` si aplica; `iat` y `exp` (expiración; ej. 1h o 15min).
- **Refresh token (opcional):** Cookie HttpOnly o cuerpo; guardar hash en BD o Redis; rotar en cada uso; access corto, refresh largo.
- **Middleware auth:** 1) Extraer token del header. 2) Verificar firma y expiración. 3) Cargar usuario (o validar claims) y adjuntar a `req.user` (id, email, roleId, etc.). Si no hay token o es inválido, responder 401 y no llamar a `next()`.
- **Middleware roles:** Recibe los roles permitidos (ej. `requireRoles('admin', 'editor')`); comprueba que `req.user` existe y que su rol está en la lista; si no, 403.
- **Secreto:** `JWT_SECRET` en variables de entorno; en producción no compartir con el front y rotar si procede.

---

## Query params (paginación y orden)

- **Paginación:**  
  - `page`: número de página (1-based). Por defecto: `1`.  
  - `limit`: tamaño de página (ej. entre 5 y 100). Por defecto: `20`; máximo ej. `100`.  
  - Cálculo: `offset = (page - 1) * limit`. Incluir en `meta`: `page`, `limit`, `total`, `totalPages`.
- **Orden:**  
  - `sortBy`: nombre del campo (validar contra whitelist de campos permitidos para evitar inyección).  
  - `order`: `asc` | `desc`. Por defecto: `asc`.  
  - Ejemplo: `?sortBy=createdAt&order=desc`.
- **Filtros:** Por recurso (ej. `status`, `categoryId`); validar con Zod contra un esquema de query.
- Nombres en **inglés** y **camelCase** en la API (`sortBy`, `order`, `page`, `limit`).

---

## Formato estándar de respuestas API

Todas las respuestas JSON de la API siguen este formato. Implementar helpers o un módulo en `views/` (p. ej. `response.helper.ts`) que expongan funciones para construir cada tipo. El manejador global de errores y los controladores deben usar siempre estas formas.

### Respuesta exitosa (2xx)

Todas las respuestas exitosas incluyen **siempre** `success`, `data` y **`meta`**. Así la forma es uniforme y el cliente puede contar con la misma estructura en todos los 2xx.

- **Un recurso (200, 201):** un solo objeto en `data`; `meta` con al menos `timestamp` (ISO 8601). Opcionalmente otros campos (ej. `requestId`).
- **Lista (200):** array en `data`; `meta` con `timestamp` y, si hay paginación, `page`, `limit`, `total`, `totalPages`.

Estructura (recurso único):

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2026-02-21T12:00:00.000Z"
  }
}
```

Estructura (lista, con paginación):

```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "timestamp": "2026-02-21T12:00:00.000Z",
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

- **Claves:** `success` (boolean), `data` (objeto o array), **`meta` (siempre presente)**: mínimo `timestamp`; en listas paginadas añadir `page`, `limit`, `total`, `totalPages`.
- **Códigos HTTP:** 200 para GET/PUT/PATCH, 201 para POST (recurso creado). No devolver cuerpo en 204 si se usa.

### Respuesta de error (4xx, 5xx)

Estructura única para todos los errores (validación, auth, no encontrado, servidor):

```json
{
  "success": false,
  "error": {
    "message": "Human-readable message",
    "code": "VALIDATION_ERROR",
    "details": []
  }
}
```

- **Claves:**  
  - `success`: siempre `false`.  
  - `error`: objeto con:  
    - `message` (string): mensaje legible para el cliente.  
    - `code` (string): código interno en UPPER_SNAKE_CASE (ej. `VALIDATION_ERROR`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `INTERNAL_ERROR`).  
    - `details` (opcional): array u objeto con información extra (ej. errores de Zod en validación).
- **Códigos HTTP:** Según la tabla de códigos de error estándar (abajo). El status HTTP va en el header; el cuerpo siempre usa la misma forma anterior.

### Códigos de error estándar

Usar siempre uno de estos códigos en `error.code` (UPPER_SNAKE_CASE). En `error.details`: para `VALIDATION_ERROR`, array de `{ path, message }` (p. ej. formato Zod); para el resto, opcional (ej. `requestId` en producción). No exponer stack ni mensajes internos al cliente en producción.

| Código                 | HTTP | Uso |
|------------------------|------|-----|
| `VALIDATION_ERROR`     | 400  | Body, params o query inválidos (Zod u otro). |
| `BAD_REQUEST`          | 400  | Petición mal formada o no permitida (genérico). |
| `UNAUTHORIZED`         | 401  | Sin token, token inválido o expirado. |
| `FORBIDDEN`            | 403  | Sin permiso (rol insuficiente). |
| `NOT_FOUND`            | 404  | Recurso o ruta no encontrado. |
| `CONFLICT`             | 409  | Conflicto (ej. email o CURP ya existente). |
| `UNPROCESSABLE_ENTITY` | 422  | Regla de negocio no cumplida (ej. estado no permite la acción). |
| `INTERNAL_ERROR`       | 500  | Error inesperado del servidor. |
| `SERVICE_UNAVAILABLE`  | 503  | Servicio externo (BD, S3, etc.) no disponible. |

### Resumen de convención

| Situación           | success | data | meta | error | HTTP   |
|---------------------|--------|------|------|-------|--------|
| OK (recurso)        | true   | ✓    | ✓    | —     | 200/201|
| OK (lista/paginada) | true   | ✓    | ✓    | —     | 200    |
| Error               | false  | —    | —    | ✓     | 4xx/5xx|

Implementar funciones tipo `res.success(data, meta)` y `res.successList(data, meta)` de forma que **meta** se rellene siempre (al menos `timestamp`; en listas, además `page`, `limit`, `total`, `totalPages`), y `res.error(message, code, details)` para errores. Usarlas en controladores y en el manejador global de errores.

---

## Modelo de datos (entidades, campos y relaciones)

Referencia única para el esquema de la base de datos. A partir de esto se creará el `.sql` inicial y las entidades TypeORM. Nombres de tablas y columnas en **snake_case** en BD; en código (entidades) se usan **camelCase** donde aplique.

### 1. `user_type`

| Campo   | Tipo         | Restricciones |
|---------|--------------|---------------|
| id      | INT          | PK, AUTO_INCREMENT |
| name    | VARCHAR(255) | |

**Relaciones:** Una fila puede estar referenciada por muchas filas de `user` (user_type_id).

---

### 2. `role`

| Campo   | Tipo         | Restricciones |
|---------|--------------|---------------|
| id      | INT          | PK, AUTO_INCREMENT |
| name    | VARCHAR(255) | |

**Relaciones:** Una fila puede estar referenciada por muchas filas de `user` (role_id).

---

### 3. `user`

| Campo        | Tipo         | Restricciones |
|--------------|--------------|---------------|
| id           | INT          | PK, AUTO_INCREMENT |
| name         | VARCHAR(255) | |
| email        | VARCHAR(255) | UNIQUE |
| password     | VARCHAR(255) | |
| user_type_id | INT          | FK → user_type.id |
| role_id      | INT          | FK → role.id |
| status       | VARCHAR(50)  | |
| created_at   | DATETIME     | DEFAULT CURRENT_TIMESTAMP |
| updated_at   | DATETIME     | DEFAULT CURRENT_TIMESTAMP ON UPDATE |

**Relaciones:** N → 1 con `user_type` y `role`. 1 → N con `parent_student`, `document` (uploaded_by), `event` (created_by), `notification`, `audit_log`.

---

### 4. `student`

| Campo     | Tipo         | Restricciones |
|-----------|--------------|---------------|
| id        | INT          | PK, AUTO_INCREMENT |
| full_name | VARCHAR(255) | |
| curp      | VARCHAR(18)  | UNIQUE |
| grade     | VARCHAR(50)  | |
| status    | VARCHAR(50)  | |
| created_at| DATETIME     | DEFAULT CURRENT_TIMESTAMP |

**Relaciones:** 1 → N con `parent_student` y `document`.

---

### 5. `parent_student` (tabla de unión N:N user–student)

| Campo      | Tipo | Restricciones |
|------------|------|---------------|
| user_id    | INT  | PK, FK → user.id |
| student_id | INT  | PK, FK → student.id |

**Relaciones:** N → 1 con `user` y con `student`. Permite que un usuario esté asociado a varios estudiantes y un estudiante a varios usuarios (padres/tutores).

---

### 6. `document_category`

| Campo       | Tipo    | Restricciones |
|-------------|---------|---------------|
| id          | INT     | PK, AUTO_INCREMENT |
| name        | VARCHAR(255) | |
| description | TEXT    | NULL permitido |

**Relaciones:** 1 → N con `document` (category_id).

---

### 7. `document`

| Campo         | Tipo         | Restricciones |
|---------------|--------------|---------------|
| id            | INT          | PK, AUTO_INCREMENT |
| student_id    | INT          | FK → student.id |
| category_id   | INT          | FK → document_category.id |
| uploaded_by   | INT          | FK → user.id |
| file_url      | VARCHAR(500) | |
| uploaded_at   | DATETIME     | DEFAULT CURRENT_TIMESTAMP |
| signature_hash| VARCHAR(255)  | NULL (integridad) |
| deleted_at    | DATETIME     | NULL (soft delete) |

**Relaciones:** N → 1 con `student`, `document_category`, `user` (uploaded_by). 1 → N con `notification` (document_id opcional).

---

### 8. `event`

| Campo       | Tipo         | Restricciones |
|-------------|--------------|---------------|
| id          | INT          | PK, AUTO_INCREMENT |
| created_by  | INT          | FK → user.id |
| title       | VARCHAR(255) | |
| description | TEXT         | NULL permitido |
| event_date  | DATETIME     | |
| created_at  | DATETIME     | DEFAULT CURRENT_TIMESTAMP |

**Relaciones:** N → 1 con `user` (created_by). 1 → N con `notification` (event_id opcional).

---

### 9. `notification`

| Campo      | Tipo     | Restricciones |
|------------|----------|---------------|
| id         | INT      | PK, AUTO_INCREMENT |
| user_id    | INT      | FK → user.id (destinatario) |
| message    | TEXT     | |
| type       | VARCHAR(50) | |
| is_read    | TINYINT(1)  | DEFAULT 0 (boolean) |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP |
| document_id| INT      | NULL, FK → document.id |
| event_id   | INT      | NULL, FK → event.id |

**Relaciones:** N → 1 con `user`. Opcionalmente N → 1 con `document` y con `event`.

---

### 10. `audit_log`

| Campo      | Tipo        | Restricciones |
|------------|-------------|---------------|
| id         | INT         | PK, AUTO_INCREMENT |
| user_id    | INT         | NULL, FK → user.id |
| action     | VARCHAR(100)| |
| entity_type| VARCHAR(50) | |
| entity_id  | INT         | NULL |
| created_at | DATETIME    | DEFAULT CURRENT_TIMESTAMP |
| ip         | VARCHAR(45) | NULL |

**Relaciones:** Opcional N → 1 con `user` (user_id NULL si es acción de sistema o no autenticada).

---

### Orden recomendado para CREATE TABLE (por dependencias de FKs)

1. `user_type`  
2. `role`  
3. `user`  
4. `student`  
5. `parent_student`  
6. `document_category`  
7. `document`  
8. `event`  
9. `notification`  
10. `audit_log`

---

## Entidades del dominio (resumen)

- **User** (user_type_id, role_id), **UserType**, **Role**
- **Student**
- **ParentStudent** (user_id, student_id)
- **Document** (student_id, category_id, uploaded_by), **DocumentCategory**
- **Event** (created_by)
- **Notification** (user_id, document_id?, event_id?)
- **AuditLog** (user_id?, action, entity_type, entity_id, ip?)

Toda creación del backend (incluido el `.sql` inicial) debe respetar este modelo de datos: tablas, columnas, tipos y relaciones.

---

## Formato del prompt para uso con IA o equipo

Al pedir generación o revisión del backend, puedes usar:

> Genera o extiende el backend de Files Manager API siguiendo:
> - **Todo en TypeScript (TS)**; no usar JavaScript (JS). Código, entidades, migraciones y config en `.ts`.
> - **Todo en inglés**: nombres de archivos, variables, clases, interfaces, comentarios en código, logs y claves de respuesta. El prompt puede estar en español.
> - Arquitectura **MVC**: modelos (y repositorios) para datos y dominio, vistas (serializers/response) para el formato de la API, controladores delgados que orquesten.
> - Principios **SOLID**: una responsabilidad por módulo, dependencias invertidas (inyección de interfaces), interfaces segregadas, extensión sin modificar código estable.
> - La estructura y entidades descritas en `docs/backend-creation-prompt.md`, alineadas con el ERD del proyecto.
> - Respuestas JSON consistentes. **Zod** para validación de body/params/query y campos requeridos. **Manejador global de errores** (middleware 4 args). **Middlewares de auth** (token/sesión) y **roles** (autorización por rol). Ver sección "Middlewares obligatorios" en este documento.
> - **Stack técnico**: TypeORM + MySQL, JWT (Bearer), S3 para archivos, Socket.io para notificaciones, pino para logs, Helmet + cors. **Auth**: JWT en `Authorization: Bearer <token>`; payload con `sub`, `email`, `roleId`; middlewares auth y roles. **Query params**: `page` (default 1), `limit` (default 20, max 100), `sortBy`, `order` (asc/desc); validar con Zod. **Códigos de error**: usar la tabla "Códigos de error estándar" (VALIDATION_ERROR, UNAUTHORIZED, FORBIDDEN, NOT_FOUND, etc.).

---

*Documento de referencia para la creación y evolución del backend — Files Manager API.*
