import { createSupabaseServer } from '@/lib/supabase-server';

export async function POST(request) {
  const supabase = await createSupabaseServer();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'No autenticado' }, { status: 401 });

  const { orden_id } = await request.json();
  if (!orden_id) return Response.json({ error: 'orden_id requerido' }, { status: 400 });

  // Verificar que la orden existe y pertenece al usuario
  const { data: orden, error: ordenError } = await supabase
    .from('ordenes')
    .select('*')
    .eq('id', orden_id)
    .eq('usuario_id', user.id)
    .single();

  if (ordenError || !orden) {
    return Response.json({ error: 'Orden no encontrada' }, { status: 404 });
  }

  if (orden.estado !== 'pendiente') {
    return Response.json({ error: 'La orden ya fue procesada' }, { status: 400 });
  }

  // Obtener items de la orden
  const { data: items } = await supabase
    .from('orden_items')
    .select('cantidad, precio_unitario, productos(nombre)')
    .eq('orden_id', orden_id);

  if (!items?.length) {
    return Response.json({ error: 'La orden no tiene ítems' }, { status: 400 });
  }

  // Estructura preparada para Mercado Pago (Semana 13)
  const preferencia = {
    items: items.map(item => ({
      title: item.productos.nombre,
      quantity: item.cantidad,
      unit_price: Number(item.precio_unitario),
      currency_id: 'ARS',
    })),
    payer: { email: user.email },
    external_reference: String(orden_id),
    notification_url: `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/api/pagos/webhook`,
  };

  // Semana 13: aquí se llamará al SDK de Mercado Pago
  // const mp = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
  // const preference = await new Preference(mp).create({ body: preferencia });
  // return Response.json({ payment_link: preference.init_point });

  return Response.json({ preferencia, mensaje: 'Estructura lista para Mercado Pago' });
}
