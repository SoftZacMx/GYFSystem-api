# Prompt: Desarrollo — Verificación de cuenta por correo (auth)

Usa este documento como **prompt o guía** para implementar la funcionalidad de verificación de cuenta por email en el módulo de auth. La planeación detallada está en `docs/planning-account-verification.md`.

---

## Contexto

- **Proyecto:** GYFSystem API (Node.js + Express + TypeScript).
- **Funcionalidad:** Al registrar un usuario, enviar un correo con un enlace que contiene un **token JWT** (expiración 1 hora). El enlace apunta a `auth/account/verify`. Al hacer clic, se valida el token, se comprueba que el usuario exista y que `isAccountActivated` sea `false`, se actualiza a `true` y se envía un segundo correo confirmando la activación.
- **Enfoque:** Token firmado JWT, **sin** tabla de tokens; solo columna `isAccountActivated` en la tabla `user`.
- **Idioma:** Todo el código, nombres de archivos, variables, mensajes de API y logs en **inglés**. Este prompt está en español.

---

## Referencias obligatorias

Antes de implementar, revisar:

1. **Planeación:** `docs/planning-account-verification.md` (alcance, flujo, componentes, orden de implementación).
2. **Convenciones del backend:** `docs/backend-creation-prompt.md` (MVC, SOLID, formato de respuestas, Zod, códigos de error, middlewares).
3. **Código existente:** `src/routes/auth.routes.ts`, `src/controllers/AuthController.ts`, `src/services/AuthService.ts`, `src/entities/User.ts`, `src/mail/MailService.ts`, `src/mail/templates.ts`, `src/config/jwt.ts`, `src/config/env.ts`.

---

## Instrucciones de implementación

Implementa la verificación de cuenta siguiendo este orden y estas reglas:

### 1. Modelo de datos

- Crear **migración TypeORM** que añada a la tabla `user`:
  - `is_account_activated` (BOOLEAN o TINYINT(1), DEFAULT 0).
  - Opcional: `email_verified_at` (DATETIME, NULL).
- Actualizar la **entidad** `User`: propiedades `isAccountActivated` y, si aplica, `emailVerifiedAt` (camelCase en código; nombres de columna en snake_case).

### 2. Configuración

- Asegurar que exista una variable para la **URL base** del enlace de verificación (ej. `BASE_URL` o `APP_URL`). Validarla en `config/env.ts` si es necesaria para el flujo. Usarla para construir: `{BASE_URL}/auth/account/verify?token=...`.

### 3. Correo

- En `mail/templates.ts` (o el módulo de plantillas que use el proyecto): definir **dos** conjuntos de funciones/interfaces:
  - **Verificación de cuenta:** asunto y cuerpo HTML (y texto plano si aplica) que incluyan el enlace con el token. Recibir al menos: `recipientName`, `verificationUrl`.
  - **Cuenta activada:** asunto y cuerpo de confirmación (sin enlace). Recibir al menos: `recipientName`.
- En **MailService:** añadir métodos para enviar cada tipo de correo (o un método genérico que reciba tipo y datos), reutilizando el `transporter` existente y el formato de envío actual (from, to, subject, html, text). Mantener logs similares a los existentes.

### 4. AuthService

- **Generar token de verificación:** función que reciba `userId` y `email`, y devuelva un JWT con payload: `{ userId, email, purpose: 'account_verify' }` y expiración de **1 hora**. Usar el mismo secreto que el resto de JWTs (o uno específico documentado) desde config.
- **Verificar cuenta:** función que reciba el `token` (string):
  - Verificar firma y expiración del JWT; comprobar que `purpose === 'account_verify'`.
  - Extraer `userId` (o `email`) y buscar el usuario en BD.
  - Si el usuario no existe o `isAccountActivated === true`: lanzar error **genérico** (mensaje tipo "Invalid or expired link"), sin revelar si el email está registrado.
  - Si todo es correcto: actualizar `isAccountActivated = true` (y opcionalmente `emailVerifiedAt`), enviar el correo "Cuenta activada", y no lanzar error (éxito).
- Usar **repositorio de User** (inyección existente o la que corresponda) para buscar y actualizar. Usar **MailService** para el envío del correo de activación.

### 5. Validación de entrada

- En `validators/auth.ts` (o donde estén los esquemas de auth): definir esquema **Zod** para el endpoint verify:
  - Si el endpoint es **GET:** validar `token` en **query** (string no vacío).
  - Si es **POST:** validar **body** con `token` (string no vacío).
- Exportar el esquema para usarlo en la ruta.

### 6. AuthController

- Añadir método **verifyAccount**: leer el token de `req.query.token` o `req.body.token` (según método HTTP), validar con el esquema Zod (o delegar en middleware de validación); llamar a `authService.verifyAccount(token)`; en éxito responder 200 con formato estándar (`success`, `data` con mensaje, `meta` con `timestamp`); en error delegar en `next(err)` para que el manejador global devuelva 400/422 con mensaje genérico.
- No exponer en la respuesta si el email existe o no cuando el token sea inválido o la cuenta ya esté activada.

### 7. Rutas

- En `src/routes/auth.routes.ts`: registrar el endpoint **auth/account/verify**:
  - Ruta: `GET /auth/account/verify` o `POST /auth/account/verify` (elegir uno y ser consistente con el validador).
  - Usar middleware de validación (query o body) con el esquema de verify.
  - No usar `authMiddleware` (el usuario aún no está autenticado por token de acceso).
  - Delegar en el nuevo método del AuthController; manejar promesas con `.catch(next)`.

### 8. Flujo de registro de usuarios

- Localizar dónde se **crea** el usuario (p. ej. UserController/UserService o endpoint de registro en auth):
  - Al crear el usuario, asignar `isAccountActivated: false` (y opcionalmente `emailVerifiedAt: null`).
  - Tras persistir con éxito: generar token de verificación (AuthService), construir la URL con `BASE_URL` y el token, enviar el correo de verificación (MailService con la plantilla que incluye el enlace).
  - La respuesta al cliente debe ser la habitual de registro exitoso; **no** incluir el token en la respuesta.
- Si el envío de correo falla, decidir si se considera registro exitoso de todos modos (usuario creado) o se hace rollback; documentar o loguear el fallo de envío.

### 9. Códigos de error y respuestas

- **Verify exitoso:** HTTP 200, cuerpo: `success: true`, `data` con mensaje (ej. "Account verified successfully"), `meta: { timestamp }`.
- **Token inválido, expirado, usuario no encontrado o ya activado:** HTTP 400 o 422, cuerpo estándar de error con `message` genérico (ej. "Invalid or expired verification link"), código `BAD_REQUEST` o `UNPROCESSABLE_ENTITY`. No incluir detalles que revelen si el email existe.
- **Validación de entrada (token faltante o inválido):** HTTP 400, `VALIDATION_ERROR`, con `details` si el proyecto los expone para Zod.

### 10. Seguridad y buenas prácticas

- Usar el mismo `JWT_SECRET` (o el definido en env) para firmar el token de verificación.
- Mensajes de error genéricos en el endpoint verify para no revelar existencia de emails.
- En producción, `BASE_URL` debe ser la URL pública correcta (frontend o API según dónde se consuma el enlace).

---

## Checklist antes de dar por cerrado

- [ ] Migración creada y entidad `User` actualizada.
- [ ] Variable de URL base configurada y usada en el enlace.
- [ ] Plantillas y métodos de correo para "verificación" y "cuenta activada".
- [ ] AuthService: generar token (1 h) y verificar token + actualizar usuario + enviar correo activación.
- [ ] Validador Zod para el token en verify.
- [ ] AuthController: método verifyAccount y manejo de errores.
- [ ] Ruta `auth/account/verify` registrada sin authMiddleware.
- [ ] Registro de usuario: crear con `isAccountActivated: false`, enviar correo de verificación tras crear.
- [ ] Respuestas y códigos de error según formato estándar del proyecto.
- [ ] Pruebas manuales: registro → recibir correo → clic en enlace → verificar activación y segundo correo.

---

## Formato del prompt para copiar/pegar (resumido)

Puedes usar este bloque para pedir la implementación a un asistente o equipo:

> Implementa la verificación de cuenta por correo en el módulo auth según la planeación en `docs/planning-account-verification.md` y las instrucciones en `docs/prompt-account-verification.md`.
>
> Resumen: token JWT de 1 hora sin tabla de tokens; columna `is_account_activated` en `user`; endpoint `auth/account/verify` que valida token, comprueba usuario y `!isAccountActivated`, actualiza y envía correo de activación; en el registro, crear usuario con `isAccountActivated: false` y enviar correo con enlace. Respuestas y errores según convenciones del backend (Zod, formato estándar, mensajes genéricos en verify). Código y mensajes en inglés.

---

*Prompt de desarrollo para la funcionalidad de verificación de cuenta — GYFSystem API.*
