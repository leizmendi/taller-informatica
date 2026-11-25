-- =====================================================================
-- Taller de informática · base de datos en Supabase
-- Pegar entero en Supabase → SQL Editor → Run. Se puede ejecutar más
-- de una vez sin romper nada.
--
-- Después:
--   1. Authentication → Users → Add user → Create new user:
--      tu correo + contraseña, marca "Auto Confirm User".
--   2. Ejecuta (cambiando el correo):
--        update public.perfiles set rol = 'admin', apodo = 'Monitor'
--        where id = (select id from auth.users where email = 'TU@CORREO');
--   3. Authentication → Sign In / Providers → desactiva
--      "Allow new users to sign up" (las cuentas las crea el monitor).
--
-- Privacidad: aquí solo se guardan usuario y apodo, nunca nombres reales.
-- =====================================================================

create extension if not exists pgcrypto with schema extensions;

-- ---------- Tablas ----------

create table if not exists public.cursos (
  id      uuid primary key default gen_random_uuid(),
  nombre  text not null,
  activo  boolean not null default true,
  creado  timestamptz not null default now()
);

create table if not exists public.perfiles (
  id        uuid primary key references auth.users(id) on delete cascade,
  usuario   text not null unique,
  apodo     text not null,
  rol       text not null default 'alumno' check (rol in ('alumno', 'admin')),
  curso_id  uuid references public.cursos(id) on delete set null,
  creado    timestamptz not null default now()
);

-- Cada vez que un alumno termina un ejercicio.
-- valor = la cifra que se clasifica (ppm en mecanografía, segundos en ratón).
create table if not exists public.intentos (
  id         bigint generated always as identity primary key,
  alumno_id  uuid not null references public.perfiles(id) on delete cascade,
  curso_id   uuid references public.cursos(id) on delete set null,
  ejercicio  text not null,
  valor      numeric not null,
  acierto    numeric,          -- % de aciertos
  segundos   numeric,
  errores    int,
  detalle    jsonb not null default '{}'::jsonb,
  creado     timestamptz not null default now()
);
create index if not exists intentos_ejercicio_idx on public.intentos (curso_id, ejercicio);
create index if not exists intentos_alumno_idx on public.intentos (alumno_id, ejercicio);

-- ---------- Funciones de ayuda ----------

create or replace function public.es_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from perfiles where id = auth.uid() and rol = 'admin');
$$;

create or replace function public.mi_curso() returns uuid
language sql stable security definer set search_path = public as $$
  select curso_id from perfiles where id = auth.uid();
$$;

-- Perfil automático para usuarios creados desde el panel de Supabase.
create or replace function public.crear_perfil() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into perfiles (id, usuario, apodo)
  values (new.id, split_part(new.email, '@', 1), split_part(new.email, '@', 1))
  on conflict do nothing;
  return new;
end $$;

drop trigger if exists al_crear_usuario on auth.users;
create trigger al_crear_usuario after insert on auth.users
  for each row execute function public.crear_perfil();

-- El intento se guarda siempre con el curso actual del alumno.
create or replace function public.poner_curso_intento() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  -- Marcas imposibles (alguien enviando datos a mano): se rechazan
  if new.ejercicio like 'meca-%' and (new.valor < 0 or new.valor > 150) then
    raise exception 'Marca no válida';
  end if;
  if new.ejercicio like 'raton-%' and (new.valor < 1 or new.valor > 600) then
    raise exception 'Marca no válida';
  end if;
  new.alumno_id := auth.uid();
  new.curso_id := (select curso_id from perfiles where id = auth.uid());
  new.creado := now();
  return new;
end $$;

drop trigger if exists intento_curso on public.intentos;
create trigger intento_curso before insert on public.intentos
  for each row execute function public.poner_curso_intento();

-- ---------- Seguridad (RLS) ----------

alter table public.cursos   enable row level security;
alter table public.perfiles enable row level security;
alter table public.intentos enable row level security;

drop policy if exists cursos_ver on public.cursos;
create policy cursos_ver on public.cursos for select to authenticated
  using (es_admin() or id = mi_curso());
drop policy if exists cursos_admin on public.cursos;
create policy cursos_admin on public.cursos for all to authenticated
  using (es_admin()) with check (es_admin());

drop policy if exists perfiles_ver on public.perfiles;
create policy perfiles_ver on public.perfiles for select to authenticated
  using (es_admin() or id = auth.uid() or (curso_id is not null and curso_id = mi_curso()));
drop policy if exists perfiles_admin on public.perfiles;
create policy perfiles_admin on public.perfiles for update to authenticated
  using (es_admin()) with check (es_admin());

drop policy if exists intentos_ver on public.intentos;
create policy intentos_ver on public.intentos for select to authenticated
  using (es_admin() or alumno_id = auth.uid());
drop policy if exists intentos_crear on public.intentos;
create policy intentos_crear on public.intentos for insert to authenticated
  with check (auth.uid() is not null);
drop policy if exists intentos_borrar on public.intentos;
create policy intentos_borrar on public.intentos for delete to authenticated
  using (es_admin());

-- ---------- Clasificación ----------
-- Mejor marca de cada alumno del curso en un ejercicio.
-- Un alumno solo puede pedir la de su curso; el admin, la de cualquiera.
create or replace function public.clasificacion(
  p_ejercicio text, p_menor_mejor boolean default false, p_curso uuid default null)
returns table (apodo text, mejor numeric, acierto numeric, intentos bigint, soy_yo boolean)
language sql stable security definer set search_path = public as $$
  with c as (select coalesce(p_curso, mi_curso()) as id),
  mejores as (
    select distinct on (p.id)
      p.apodo, i.valor, i.acierto,
      count(*) over (partition by p.id) as n,
      p.id = auth.uid() as yo
    from intentos i
      join perfiles p on p.id = i.alumno_id
      join c on c.id = i.curso_id
    where i.ejercicio = p_ejercicio
      and p.curso_id = c.id
      and (es_admin() or c.id = mi_curso())
    order by p.id,
      case when p_menor_mejor then i.valor end asc,
      case when not p_menor_mejor then i.valor end desc
  )
  select apodo, valor, acierto, n, yo from mejores
  order by case when p_menor_mejor then valor end asc,
           case when not p_menor_mejor then valor end desc;
$$;

-- ---------- Administración de cuentas ----------
-- Los alumnos entran con usuario + contraseña. Por dentro Supabase
-- necesita un correo, así que se usa usuario@taller.local.

create or replace function public.admin_crear_alumno(
  p_usuario text, p_password text, p_apodo text, p_curso uuid)
returns uuid
language plpgsql security definer set search_path = public, extensions as $$
declare
  v_id uuid := gen_random_uuid();
  v_usuario text := lower(trim(p_usuario));
  v_email text;
begin
  if not es_admin() then raise exception 'Solo el monitor puede crear alumnos'; end if;
  if v_usuario !~ '^[a-z0-9._-]{3,30}$' then
    raise exception 'Usuario no válido: usa 3-30 letras sin acentos, números, punto o guion';
  end if;
  if length(p_password) < 6 then raise exception 'La contraseña debe tener al menos 6 caracteres'; end if;
  if exists (select 1 from perfiles where usuario = v_usuario) then
    raise exception 'Ya existe el usuario %', v_usuario;
  end if;
  v_email := v_usuario || '@taller.local';

  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new, email_change)
  values (
    '00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated',
    v_email, crypt(p_password, gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}', '{}', now(), now(),
    '', '', '', '');

  insert into auth.identities (
    id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  values (
    gen_random_uuid(), v_id, v_id::text,
    jsonb_build_object('sub', v_id::text, 'email', v_email, 'email_verified', true),
    'email', now(), now(), now());

  -- el trigger ya creó el perfil; se completa
  update perfiles set usuario = v_usuario, apodo = coalesce(nullif(trim(p_apodo), ''), v_usuario),
    curso_id = p_curso where id = v_id;
  return v_id;
end $$;

create or replace function public.admin_cambiar_password(p_alumno uuid, p_password text)
returns void
language plpgsql security definer set search_path = public, extensions as $$
begin
  if not es_admin() then raise exception 'Solo el monitor'; end if;
  if length(p_password) < 6 then raise exception 'La contraseña debe tener al menos 6 caracteres'; end if;
  update auth.users set encrypted_password = crypt(p_password, gen_salt('bf')), updated_at = now()
  where id = p_alumno;
end $$;

create or replace function public.admin_borrar_alumno(p_alumno uuid)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if not es_admin() then raise exception 'Solo el monitor'; end if;
  if p_alumno = auth.uid() then raise exception 'No te puedes borrar a ti mismo'; end if;
  delete from auth.users where id = p_alumno;
end $$;

-- Hacer monitor a una cuenta o devolverla a alumno.
-- Nadie se quita el papel a sí mismo, así siempre queda algún monitor.
create or replace function public.admin_cambiar_rol(p_alumno uuid, p_rol text)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if not es_admin() then raise exception 'Solo el monitor'; end if;
  if p_rol not in ('alumno', 'admin') then raise exception 'Papel no válido'; end if;
  if p_alumno = auth.uid() then raise exception 'No puedes cambiar tu propio papel'; end if;
  update perfiles set rol = p_rol where id = p_alumno;
  if not found then raise exception 'No existe esa cuenta'; end if;
end $$;

-- Solo usuarios con sesión pueden llamar a las funciones.
revoke execute on function public.clasificacion(text, boolean, uuid) from anon, public;
revoke execute on function public.admin_crear_alumno(text, text, text, uuid) from anon, public;
revoke execute on function public.admin_cambiar_password(uuid, text) from anon, public;
revoke execute on function public.admin_borrar_alumno(uuid) from anon, public;
revoke execute on function public.admin_cambiar_rol(uuid, text) from anon, public;
grant execute on function public.clasificacion(text, boolean, uuid) to authenticated;
grant execute on function public.admin_crear_alumno(text, text, text, uuid) to authenticated;
grant execute on function public.admin_cambiar_password(uuid, text) to authenticated;
grant execute on function public.admin_borrar_alumno(uuid) to authenticated;
grant execute on function public.admin_cambiar_rol(uuid, text) to authenticated;
