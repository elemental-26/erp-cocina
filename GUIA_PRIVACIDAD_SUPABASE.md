# ERP Cocina - Supabase y privacidad del código

## Regla principal

El código fuente (`src/`, `scripts/`, `.git`, configuración de desarrollo) no se comparte con clientes, interesados ni usuarios de prueba.

Para demos se comparte solo una de estas opciones:

- URL publicada en Netlify/Vercel/Sites.
- Paquete generado con `npm run package:trial`, que contiene solo `dist/` compilado.

## Crear Supabase

1. Crear un proyecto en Supabase.
2. Activar Auth con correo/contraseña.
3. Crear el primer usuario administrador desde Authentication.
4. Abrir SQL Editor y ejecutar `supabase/erp_schema.sql`.
5. Crear workspace y membresía inicial usando el UUID del usuario:

```sql
insert into public.erp_workspaces (name, owner_id)
values ('Mi empresa', 'UUID_DEL_USUARIO')
returning id;

insert into public.erp_workspace_members (workspace_id, user_id, role)
values ('UUID_WORKSPACE', 'UUID_DEL_USUARIO', 'owner');
```

## Configurar la PWA

En el ERP:

1. Admin > General > Sincronización multi-equipo.
2. Activar sincronización.
3. Pegar Supabase URL.
4. Pegar anon public key.
5. Pegar Workspace ID.
6. Ingresar correo y contraseña de Supabase Auth.
7. Conectar.
8. Subir datos actuales si este equipo tiene la información principal.

## Seguridad

- La llave `anon` puede estar en la PWA porque es pública.
- La seguridad real está en Row Level Security (RLS).
- Nunca pegar `service_role` en la app, en Netlify ni en el navegador.
- El repositorio debe mantenerse privado.
- Las demos deben usar usuarios limitados y datos limpios.

## Compartir modo prueba

Ejecutar:

```bash
npm run package:trial
```

Compartir el `.tar.gz` de `release/` o publicar la carpeta generada. Ese paquete no incluye código fuente editable.
