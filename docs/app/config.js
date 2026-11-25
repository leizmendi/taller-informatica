// Conexión con Supabase. La clave "publishable" es pública por diseño:
// lo que protege los datos son las reglas RLS de supabase.sql.
export const SUPABASE_URL = 'https://ibcfbdnuvufykqvtvjdz.supabase.co';
export const SUPABASE_KEY = 'sb_publishable_ZXDj7QIJeCfAt-fW-lEHdA_WE5NyjvE';

// Los alumnos escriben solo su usuario; por dentro es usuario@DOMINIO.
export const DOMINIO_ALUMNOS = 'taller.local';
