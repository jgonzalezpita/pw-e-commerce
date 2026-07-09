import { requireAdmin } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { esPrecioValido, esStockValido, textoNoVacio } from '@/lib/validaciones';

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

  if (!textoNoVacio(nombre))   return Response.json({ error: 'El nombre es requerido' }, { status: 400 });
  if (!esPrecioValido(precio)) return Response.json({ error: 'El precio debe ser un número mayor a 0' }, { status: 400 });
  if (!esStockValido(stock))   return Response.json({ error: 'El stock debe ser un entero mayor o igual a 0' }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from('productos')
    .insert({ nombre: nombre.trim(), descripcion, precio: Number(precio), stock: Number(stock), imagen_url, categoria, activo })
    .select().single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data, { status: 201 });
}
