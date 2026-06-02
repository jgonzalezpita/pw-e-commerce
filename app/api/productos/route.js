import { createSupabaseServer } from '@/lib/supabase-server';

export async function GET() {
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase.from('productos').select().eq('activo', true);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}
