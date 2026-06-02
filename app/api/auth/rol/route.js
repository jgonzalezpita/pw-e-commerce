import { createSupabaseServer } from '@/lib/supabase-server';

export async function GET() {
  const supabase = await createSupabaseServer();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ rol: null, autenticado: false });
  }

  const { data: perfil } = await supabase
    .from('usuarios')
    .select('rol')
    .eq('id', user.id)
    .single();

  return Response.json({
    rol: perfil?.rol ?? 'cliente',
    autenticado: true,
    email: user.email,
  });
}
