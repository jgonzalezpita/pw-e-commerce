import { MercadoPagoConfig, Preference } from 'mercadopago';
import { createSupabaseServer } from '@/lib/supabase-server';

const mp = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });

export async function POST(request) {
  const supabase = await createSupabaseServer();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'No autenticado' }, { status: 401 });

  const { orden_id } = await request.json();
  if (!orden_id) return Response.json({ error: 'orden_id requerido' }, { status: 400 });

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

  const { data: items } = await supabase
    .from('orden_items')
    .select('cantidad, precio_unitario, productos(nombre)')
    .eq('orden_id', orden_id);

  if (!items?.length) {
    return Response.json({ error: 'La orden no tiene ítems' }, { status: 400 });
  }

  const appUrl = new URL(request.url).origin;
  // back_urls solo funcionan con URLs públicas (Vercel). En localhost se omiten.
  const isPublic = !appUrl.includes('localhost') && !appUrl.includes('127.0.0.1');

  try {
    const preference = await new Preference(mp).create({
      body: {
        items: items.map(item => ({
          title: item.productos.nombre,
          quantity: item.cantidad,
          unit_price: Number(item.precio_unitario),
          currency_id: 'ARS',
        })),
        payer: { email: user.email },
        external_reference: String(orden_id),
        notification_url: isPublic ? `${appUrl}/api/pagos/webhook` : undefined,
        ...(isPublic && {
          back_urls: {
            success: `${appUrl}/ordenes?estado=aprobado`,
            failure: `${appUrl}/ordenes?estado=rechazado`,
            pending: `${appUrl}/ordenes?estado=pendiente`,
          },
          auto_return: 'approved',
        }),
      },
    });

    return Response.json({ payment_link: preference.init_point });
  } catch (err) {
    console.error('MP crear-preferencia error:', err);
    return Response.json({ error: err.message ?? 'Error al crear preferencia de pago' }, { status: 500 });
  }
}
