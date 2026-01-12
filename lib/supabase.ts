
import { createClient } from '@supabase/supabase-js';

const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ? process.env.NEXT_PUBLIC_SUPABASE_URL.trim() : '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ? process.env.SUPABASE_SERVICE_ROLE_KEY.trim() : '';

let supabaseUrl = envUrl;
if (!supabaseUrl.startsWith('http')) {
    console.warn(`Invalid Supabase URL found in env: ${supabaseUrl}. Falling back to placeholder.`);
    supabaseUrl = 'https://example.supabase.co';
}

if (!supabaseKey && process.env.NODE_ENV !== 'production') {
    console.warn('Missing Supabase environment variables. Using placeholders.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
