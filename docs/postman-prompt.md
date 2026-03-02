# Prompt para generar colección de Postman — Files Manager API

Crea una colección de Postman para la API **Files Manager** con base URL `http://localhost:3000`. Agrupa los requests en carpetas por módulo. Usa una variable de colección `{{baseUrl}}` = `http://localhost:3000` y `{{token}}` para el Bearer token (se obtiene del login).

---

## Autenticación global

Todas las rutas marcadas con 🔒 requieren header `Authorization: Bearer {{token}}`. Configúralo a nivel de colección como herencia.

---

## 1. Auth

### POST Login
- URL: `{{baseUrl}}/auth/login`
- Body (JSON):
```json
{ "email": "admin@filesmanager.com", "password": "password123" }
```
- En Tests, guarda el token automáticamente:
```js
var res = pm.response.json();
if (res.data && res.data.token) {
    pm.collectionVariables.set("token", res.data.token);
}
```

### 🔒 GET Me
- URL: `{{baseUrl}}/auth/me`

---

## 2. User Types (solo lectura)

### GET List
- URL: `{{baseUrl}}/user-types`

### GET By ID
- URL: `{{baseUrl}}/user-types/1`

---

## 3. Roles (solo lectura)

### GET List
- URL: `{{baseUrl}}/roles`

### GET By ID
- URL: `{{baseUrl}}/roles/1`

---

## 4. Users (CRUD)

### GET List
- URL: `{{baseUrl}}/users`

### GET By ID
- URL: `{{baseUrl}}/users/1`

### POST Create
- URL: `{{baseUrl}}/users`
- Body (JSON):
```json
{
  "name": "Nuevo Usuario",
  "email": "nuevo@filesmanager.com",
  "password": "password123",
  "userTypeId": 1,
  "roleId": 2,
  "status": "active"
}
```

### PUT Update
- URL: `{{baseUrl}}/users/1`
- Body (JSON):
```json
{ "name": "Nombre Actualizado" }
```

### DELETE
- URL: `{{baseUrl}}/users/5`

---

## 5. Students (CRUD con paginación)

### GET List (paginado)
- URL: `{{baseUrl}}/students?page=1&limit=10&sortBy=fullName&order=asc`
- Query params opcionales: `page`, `limit`, `sortBy` (id|fullName|curp|grade|status|createdAt), `order` (asc|desc)

### GET By ID
- URL: `{{baseUrl}}/students/1`

### POST Create
- URL: `{{baseUrl}}/students`
- Body (JSON):
```json
{
  "fullName": "Luis Hernández Pérez",
  "curp": "HEPL140312HDFRRR06",
  "grade": "2B",
  "status": "active"
}
```
- Nota: CURP debe ser exactamente 18 caracteres, formato mexicano oficial (4 letras + 6 dígitos + H/M + 5 letras + alfanumérico + dígito).

### PUT Update
- URL: `{{baseUrl}}/students/1`
- Body (JSON):
```json
{ "grade": "4A", "status": "active" }
```

### DELETE
- URL: `{{baseUrl}}/students/5`

---

## 6. Parent-Student (vínculos)

### POST Associate
- URL: `{{baseUrl}}/parent-students`
- Body (JSON):
```json
{ "userId": 3, "studentId": 1 }
```

### DELETE Disassociate
- URL: `{{baseUrl}}/parent-students`
- Body (JSON):
```json
{ "userId": 3, "studentId": 1 }
```

### GET Students by User (parent)
- URL: `{{baseUrl}}/users/3/students`

### GET Parents by Student
- URL: `{{baseUrl}}/students/1/parents`

---

## 7. Document Categories (CRUD)

### GET List
- URL: `{{baseUrl}}/document-categories`

### GET By ID
- URL: `{{baseUrl}}/document-categories/1`

### POST Create
- URL: `{{baseUrl}}/document-categories`
- Body (JSON):
```json
{ "name": "Fotografía", "description": "Foto tamaño infantil" }
```

### PUT Update
- URL: `{{baseUrl}}/document-categories/1`
- Body (JSON):
```json
{ "description": "Acta de nacimiento original o copia certificada" }
```

### DELETE
- URL: `{{baseUrl}}/document-categories/7`

---

## 8. Documents (CRUD + Upload) 🔒 Todos requieren auth

### 🔒 GET List (paginado con filtros)
- URL: `{{baseUrl}}/documents?page=1&limit=10&sortBy=uploadedAt&order=desc`
- Query params opcionales: `page`, `limit`, `sortBy` (id|uploadedAt|studentId|categoryId), `order` (asc|desc), `studentId`, `categoryId`

### 🔒 GET By ID
- URL: `{{baseUrl}}/documents/1`

### 🔒 POST Create (con URL directa)
- URL: `{{baseUrl}}/documents`
- Body (JSON):
```json
{
  "studentId": 1,
  "categoryId": 1,
  "fileUrl": "https://example.com/doc.pdf"
}
```

### 🔒 POST Upload (archivo real a S3)
- URL: `{{baseUrl}}/documents/upload`
- Body: **form-data**
  - `file` (tipo File): seleccionar archivo (PDF, JPG, PNG, WebP, DOC, DOCX, XLS, XLSX — máx 10 MB)
  - `studentId` (tipo Text): `1`
  - `categoryId` (tipo Text): `1`
  - `sign` (tipo Text): `true` (opcional, default `false` — si `true`, firma digitalmente el documento con RSA-SHA256)

### 🔒 DELETE (soft delete)
- URL: `{{baseUrl}}/documents/1`

### GET Verify Signature (público)
- URL: `{{baseUrl}}/documents/1/verify`
- Descripción: Verifica la firma digital del documento. Devuelve si es válida + metadata (quién subió, cuándo, estudiante, categoría). Solo funciona si el documento fue firmado (`sign: true` al subir).

### GET QR Code (público)
- URL: `{{baseUrl}}/documents/1/qr`
- Descripción: Devuelve una imagen PNG del código QR que contiene la URL de verificación del documento. Solo funciona si el documento fue firmado.

---

## 9. Events (CRUD con paginación) 🔒 Todos requieren auth

### 🔒 GET List (paginado con filtros)
- URL: `{{baseUrl}}/events?page=1&limit=10&sortBy=eventDate&order=desc`
- Query params opcionales: `page`, `limit`, `sortBy` (id|title|eventDate|createdAt), `order` (asc|desc), `createdBy` (número, filtra por usuario creador)

### 🔒 GET By ID
- URL: `{{baseUrl}}/events/1`

### 🔒 POST Create
- URL: `{{baseUrl}}/events`
- Body (JSON):
```json
{
  "title": "Junta de padres de familia",
  "description": "Reunión general para entrega de calificaciones del segundo bimestre.",
  "eventDate": "2026-03-15T10:00:00.000Z"
}
```
- Nota: `description` es opcional/nullable. `eventDate` debe ser formato ISO 8601.

### 🔒 PUT Update
- URL: `{{baseUrl}}/events/1`
- Body (JSON):
```json
{
  "title": "Junta de padres — REPROGRAMADA",
  "eventDate": "2026-03-20T10:00:00.000Z"
}
```

### 🔒 DELETE
- URL: `{{baseUrl}}/events/1`

---

## 10. Notifications (CRUD + marcar como leídas) 🔒 Todos requieren auth

### 🔒 GET My Notifications
- URL: `{{baseUrl}}/notifications/me?page=1&limit=10&sortBy=createdAt&order=desc`
- Descripción: Lista las notificaciones del usuario autenticado (usa el token).
- Query params opcionales: `page`, `limit`, `sortBy` (id|createdAt|type|isRead), `order` (asc|desc), `isRead` (true|false), `type` (info|warning|document|event)

### 🔒 PATCH Mark All My Notifications as Read
- URL: `{{baseUrl}}/notifications/me/read-all`
- No requiere body.

### 🔒 GET List (admin, con filtros)
- URL: `{{baseUrl}}/notifications?page=1&limit=10&sortBy=createdAt&order=desc`
- Query params opcionales: `page`, `limit`, `sortBy` (id|createdAt|type|isRead), `order` (asc|desc), `userId` (número), `isRead` (true|false), `type` (info|warning|document|event)

### 🔒 GET By ID
- URL: `{{baseUrl}}/notifications/1`

### 🔒 POST Create
- URL: `{{baseUrl}}/notifications`
- Body (JSON):
```json
{
  "userId": 2,
  "message": "Se ha subido un nuevo documento para tu hijo.",
  "type": "document",
  "documentId": 1,
  "eventId": null
}
```
- Nota: `type` acepta: `info`, `warning`, `document`, `event`. Los campos `documentId` y `eventId` son opcionales/nullable. Al crear, se envía automáticamente un correo al usuario destinatario.

### 🔒 PATCH Mark as Read
- URL: `{{baseUrl}}/notifications/1/read`
- No requiere body.

### 🔒 DELETE
- URL: `{{baseUrl}}/notifications/1`

---

## 11. Health (público)

### GET Health
- URL: `{{baseUrl}}/health`

### GET Root
- URL: `{{baseUrl}}/`

---

## Formato de respuestas

Éxito (recurso único):
```json
{ "success": true, "data": { ... }, "meta": { "timestamp": "..." } }
```

Éxito (lista paginada):
```json
{ "success": true, "data": [ ... ], "meta": { "timestamp": "...", "page": 1, "limit": 20, "total": 100, "totalPages": 5 } }
```

Error:
```json
{ "success": false, "error": { "message": "...", "code": "NOT_FOUND", "details": [] } }
```

Códigos de error: VALIDATION_ERROR (400), UNAUTHORIZED (401), FORBIDDEN (403), NOT_FOUND (404), CONFLICT (409), INTERNAL_ERROR (500).
