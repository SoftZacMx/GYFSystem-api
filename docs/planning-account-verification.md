# Planeación: Verificación de cuenta por correo (auth)

## Objetivo

Implementar flujo de verificación de cuenta por email: al registrar un usuario se envía un correo con un enlace que contiene un token firmado (JWT). Al hacer clic, el usuario llama al endpoint `auth/account/verify`; se valida el token, se comprueba que el correo esté registrado y que `isAccountActivated` sea `false`, se actualiza la columna a `true` y se envía un correo de confirmación de activación.

**Enfoque elegido:** Token firmado tipo JWT, **sin** tabla de tokens. Solo se actualiza la columna `isAccountActivated` en la tabla `user`.

---

## Alcance

| Elemento | Descripción |
|----------|-------------|
| **Módulo** | Auth (y uso de User / Mail) |
| **Nuevo endpoint** | `GET` o `POST` `/auth/account/verify` (token en query o body) |
| **Token** | JWT con payload `userId`, `email`, `purpose: 'account_verify'`, expiración **1 hora** |
| **Persistencia** | No se crea tabla de tokens; solo columna `isAccountActivated` en `user` |
| **Correos** | 1) Verificación (con URL); 2) Cuenta activada (confirmación) |

---

## Requisitos funcionales

1. **Registro de usuario**
   - Tras crear el usuario con éxito, generación de token JWT de verificación (1 h).
   - Construcción de URL: `{BASE_URL}/auth/account/verify?token=...`
   - Envío de correo de verificación con ese enlace.
   - El usuario se crea con `isAccountActivated = false`.

2. **Verificación (`auth/account/verify`)**
   - Recibir `token` (query si GET, body si POST).
   - Validar firma y expiración del token; validar `purpose === 'account_verify'`.
   - Obtener `userId` (o `email`) del payload y cargar usuario.
   - Comprobar que el usuario exista y que `isAccountActivated === false`.
   - Si algo falla: respuesta genérica (ej. "Enlace inválido o expirado") sin revelar si el email existe.
   - Si todo es correcto: actualizar `isAccountActivated = true`, enviar correo "Cuenta activada", responder éxito.

3. **Correos**
   - Plantilla 1: asunto y cuerpo con enlace de verificación.
   - Plantilla 2: asunto y cuerpo de confirmación de activación (sin enlace).

---

## Requisitos no funcionales

- **Seguridad:** Misma clave (o una dedicada) para firmar el JWT; mensajes de error genéricos.
- **Idioma:** Código, nombres y mensajes de API en **inglés**; este doc en español.
- **Consistencia:** Respuestas según formato estándar de la API (`success`, `data`/`error`, `meta`); validación con Zod; manejo de errores con el middleware global.

---

## Modelo de datos

### Cambios en `user`

| Campo | Tipo | Restricciones |
|-------|------|---------------|
| `is_account_activated` | BOOLEAN / TINYINT(1) | DEFAULT 0 (false) |

Opcional (auditoría):

| Campo | Tipo | Restricciones |
|-------|------|---------------|
| `email_verified_at` | DATETIME | NULL |

- Migración TypeORM para añadir la(s) columna(s).
- Entidad `User`: propiedad en camelCase (`isAccountActivated`, `emailVerifiedAt`).

---

## Componentes a tocar o crear

| Componente | Acción |
|------------|--------|
| Migración | Nueva migración: añadir `is_account_activated` (y opcional `email_verified_at`) a `user`. |
| Entidad `User` | Añadir propiedades correspondientes. |
| Config / env | `BASE_URL` (o equivalente) para armar la URL del enlace (si no existe). |
| JWT | Usar mismo secreto o uno específico para verificación; payload con `userId`, `email`, `purpose`, `exp`. |
| MailService | Nuevos métodos o plantillas: envío de "verificación" y de "cuenta activada". |
| AuthService | Lógica: generar token de verificación; verificar token y activar cuenta. |
| AuthController | Acción para `auth/account/verify` (recibir token, llamar servicio, responder). |
| Rutas auth | Registrar `GET` o `POST` `/auth/account/verify`. |
| Validadores | Esquema Zod para query o body del endpoint verify (ej. `token` string). |
| Registro de usuarios | Donde se cree el usuario (p. ej. UserController/UserService): tras crear, generar token, armar URL, enviar correo de verificación; crear usuario con `isAccountActivated: false`. |

---

## Flujo resumido

```
[Registro] → Crear user (isAccountActivated=false)
          → Generar JWT (userId, email, purpose, exp 1h)
          → Enviar correo con URL ?token=...
          → Respuesta éxito (sin exponer token)

[Usuario hace clic] → GET/POST /auth/account/verify?token=...
                    → Validar JWT (firma, exp, purpose)
                    → Buscar user por userId/email
                    → Si no existe o isAccountActivated===true → respuesta genérica error
                    → Si ok: UPDATE user SET is_account_activated=true
                    → Enviar correo "Cuenta activada"
                    → Respuesta éxito (opcional redirección a front con ?verified=1)
```

---

## Orden de implementación sugerido

1. Migración y entidad `User`: columna(s) `is_account_activated` (y opcional `email_verified_at`).
2. Config: `BASE_URL` o variable para la URL base del enlace.
3. Mail: plantillas y envío para "verificación" y "cuenta activada".
4. AuthService: `generateVerificationToken(userId, email)`, `verifyAccount(token)` (validar, buscar usuario, comprobar `!isAccountActivated`, actualizar, enviar correo).
5. Validador: esquema para `token` en verify.
6. AuthController: acción `verifyAccount`; rutas: registrar `auth/account/verify`.
7. Flujo de registro: tras crear usuario, generar token, URL y enviar correo de verificación; asegurar que el usuario se cree con `isAccountActivated: false`.
8. Pruebas manuales o automatizadas: registro → correo → clic en enlace → verificar columna y segundo correo.

---

## Códigos de error y respuestas

- **Verify exitoso:** 200, `success: true`, `data` con mensaje o indicador de activación; `meta` con `timestamp`.
- **Token inválido/expirado/usuario ya activado:** 400 o 422, mensaje genérico ("Invalid or expired link"), sin indicar si el email existe. Código sugerido: `BAD_REQUEST` o `UNPROCESSABLE_ENTITY`.
- Validación de entrada (token faltante o mal formado): 400, `VALIDATION_ERROR` con detalles Zod si se exponen.

---

## Resumen de archivos implicados (referencia)

| Archivo / Área | Cambio |
|----------------|--------|
| `migrations/...` | Nueva migración para `user` |
| `entities/User.ts` | `isAccountActivated`, opcional `emailVerifiedAt` |
| `config/env.ts` | `BASE_URL` (o similar) si no existe |
| `mail/templates.ts` (o equivalente) | Plantillas verificación y cuenta activada |
| `mail/MailService.ts` | Métodos para enviar ambos correos |
| `services/AuthService.ts` | Generar token verificación; verificar token y activar cuenta |
| `controllers/AuthController.ts` | Acción verify |
| `routes/auth.routes.ts` | Ruta `auth/account/verify` |
| `validators/auth.ts` | Esquema verify (token) |
| Flujo de registro (UserService/UserController o donde se registre) | Crear con `isAccountActivated: false`; tras crear, token + correo verificación |

---

*Documento de planeación para la funcionalidad de verificación de cuenta por correo — GYFSystem API.*
