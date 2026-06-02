import { createSupabaseServer } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { redirect } from 'next/navigation';
import AdminPanel from './AdminPanel';

export default async function AdminPage() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: perfil } = await supabaseAdmin
    .from('usuarios').select('rol').eq('id', user.id).single();

  if (perfil?.rol !== 'admin') redirect('/');

  return <AdminPanel />;
}
