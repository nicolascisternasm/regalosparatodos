# Setup del panel de administración

## 1. Aplicar migración de base de datos

En el [SQL Editor de Supabase](https://supabase.com/dashboard/project/ocibmphnxljicpszaonv/sql/new), ejecuta:

```sql
ALTER TABLE cajas ADD COLUMN IF NOT EXISTS stock integer NOT NULL DEFAULT 0;
```

## 2. Crear el bucket de imágenes

1. Ve a **Storage** en el dashboard de Supabase.
2. Crea un nuevo bucket llamado `productos`.
3. Márcalo como **público** (Public bucket).
4. En la pestaña **Policies**, agrega una política:
   - Nombre: `Permitir subida autenticada`
   - Operación: INSERT
   - Rol: `authenticated`
   - Expresión: `true`

## 3. Configurar la variable ADMIN_SECRET_TOKEN en Railway

1. Ve a tu proyecto en Railway.
2. Selecciona el servicio de la app.
3. Ve a **Variables** y agrega:
   ```
   ADMIN_SECRET_TOKEN=<una-cadena-aleatoria-segura>
   ```
   Genera un valor con: `openssl rand -hex 32`

## 4. Crear la primera cuenta administradora

Haz el llamado **una sola vez** desde tu máquina. Reemplaza los valores:

```bash
curl -X POST https://regalosparatodos-production.up.railway.app/api/admin/setup \
  -H "Content-Type: application/json" \
  -H "x-admin-token: TU_ADMIN_SECRET_TOKEN" \
  -d '{"email": "tu@email.com", "password": "contraseña-segura"}'
```

Si la respuesta es `{"ok": true, ...}`, la cuenta fue creada.
Si responde `409`, ya existe una cuenta admin (no se creará otra).

## 5. Acceder al panel

- URL: `/admin` (o desde el footer de la web: "Administración")
- Inicia sesión con el email y contraseña del paso anterior.
- El panel permite gestionar todos los productos.

## Notas de seguridad

- El `ADMIN_SECRET_TOKEN` solo se usa para crear la primera cuenta. Después de hacerlo puedes mantenerlo igual o cambiarlo.
- Las contraseñas se almacenan de forma segura en Supabase Auth.
- Los tokens de sesión son JWT de corta duración gestionados por Supabase.
- **Nunca compartas** el `ADMIN_SECRET_TOKEN` ni lo subas al repositorio.
