// Conexión con Supabase. La clave "publishable" es pública por diseño:
// lo que protege los datos son las reglas RLS de supabase.sql.
export const SUPABASE_URL = 'https://ibcfbdnuvufykqvtvjdz.supabase.co';
export const SUPABASE_KEY = 'sb_publishable_ZXDj7QIJeCfAt-fW-lEHdA_WE5NyjvE';

// Los alumnos escriben solo su usuario; por dentro es usuario@DOMINIO.
export const DOMINIO_ALUMNOS = 'taller.local';

// Idiomas por defecto (cada alumno puede cambiarlos). Códigos de idiomas/lista.js;
// el secundario puede ser '-' (ninguno).
export const IDIOMA_PRINCIPAL = 'es';
export const IDIOMA_SECUNDARIO = 'fr';
