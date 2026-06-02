import { createSupabaseServer } from '@/lib/supabase-server';

export async function GET() {
  const supabase = await createSupabaseServer();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json([], { status: 200 });

  const { data: items, error } = await supabase
    .from('carrito')
    .select('producto_id, cantidad')
    .eq('usuario_id', user.id);

  if (error || !items?.length) return Response.json([], { status: 200 });

  const { data: productos } = await supabase.from('productos').select();
  const catalogo = productos ?? [];

  const carrito = items
    .map(item => {
      const prod = catalogo.find(p => p.id === item.producto_id);
      return prod
        ? { ...prod, imagen: prod.imagen_url || prod.imagen, cantidad: item.cantidad }
        : null;
    })
    .filter(Boolean);

  return Response.json(carrito);
}

export async function POST(request) {
  const supabase = await createSupabaseServer();

  // Verificar autenticación
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'No autenticado' }, { status: 401 });

  const { producto_id, cantidad = 1 } = await request.json();

  if (!producto_id || cantidad < 1) {
    return Response.json({ error: 'Datos inválidos' }, { status: 400 });
  }

  // Verificar stock disponible
  const { data: producto, error: prodError } = await supabase
    .from('productos')
    .select('id, nombre, stock')
    .eq('id', producto_id)
    .single();

  if (prodError || !producto) {
    return Response.json({ error: 'Producto no encontrado' }, { status: 404 });
  }
  if (producto.stock < cantidad) {
    return Response.json(
      { error: `Stock insuficiente para ${producto.nombre}` },
      { status: 400 }
    );
  }

  // Agregar al carrito
  const { error } = await supabase
    .from('carrito')
    .upsert(
      { usuario_id: user.id, producto_id, cantidad },
      { onConflict: 'usuario_id,producto_id' }
    );

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true }, { status: 201 });
}
