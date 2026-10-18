import { createClient } from '@supabase/supabase-js';

// ⚠️ REEMPLAZA ESTO CON LOS DATOS DE TU PROYECTO DE SUPABASE
// Los encuentras en Supabase: Settings (Engranaje) -> API
const supabaseUrl = 'https://klrargyceafqfitqyctd.supabase.co';
const supabaseAnonKey = 'sb_publishable_jKkSy3q5J0YR7ggeDqrJyQ_MErzd3Tj...';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);





 