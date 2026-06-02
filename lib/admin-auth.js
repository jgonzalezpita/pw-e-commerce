import { createSupabaseServer } from './supabase-server';
import { supabaseAdmin } from './supabase-admin';

export async function requireAdmin() {
  try {
    const supabase = await createSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data: perfil } = await supabaseAdmin
      .from('usuarios')
      .select('rol')
      .eq('id', user.id)
      .single();
    return perfil?.rol === 'admin' ? user : null;
  } catch {
    return null;
  }
}
