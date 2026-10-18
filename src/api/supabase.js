import { createClient } from '@supabase/supabase-js';

// ⚠️ REEMPLAZA ESTO CON LOS DATOS DE TU PROYECTO DE SUPABASE
// Los encuentras en Supabase: Settings (Engranaje) -> API
const supabaseUrl = 'https://TU-PROYECTO.supabase.co';
const supabaseAnonKey = 'eyJhbG...TU-CLAVE-LARGA...';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
