import { requireAdmin } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return Response.json({ error: 'No autorizado' }, { status: 403 });

  const { data, error } = await supabaseAdmin
    .from('productos').select('*').order('id');

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data ?? []);
}

export async function POST(request) {
  const admin = await requireAdmin();
  if (!admin) return Response.json({ error: 'No autorizado' }, { status: 403 });

  const { nombre, descripcion, precio, stock = 0, imagen_url, categoria, activo = true } = await request.json();
  if (!nombre || precio == null) return Response.json({ error: 'nombre y precio son requeridos' }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from('productos')
    .insert({ nombre, descripcion, precio: Number(precio), stock: Number(stock), imagen_url, categoria, activo })
    .select().single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data, { status: 201 });
}
