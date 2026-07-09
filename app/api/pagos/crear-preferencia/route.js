import { MercadoPagoConfig, Preference } from 'mercadopago';
import { createSupabaseServer } from '@/lib/supabase-server';

export async function POST(request) {
  // Validar credenciales ANTES de tocar la base: evita el error críptico de MP
  // cuando el token no está configurado en el entorno (ej. Vercel sin variables).
  const accessToken = process.env.MP_ACCESS_TOKEN;
  if (!accessToken) {
    return Response.json(
      { error: 'MercadoPago no está configurado (falta MP_ACCESS_TOKEN en el entorno).' },
      { status: 500 }
    );
  }
  const mp = new MercadoPagoConfig({ accessToken });

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
          quantity: Number(item.cantidad),
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

    // init_point sirve tanto para credenciales de prueba (paga un usuario/tarjeta
    // de test, sin dinero real) como de producción. Con las nuevas credenciales de
    // MercadoPago ambas empiezan con APP_USR-, así que no se distingue por el prefijo.
    const paymentLink = preference.init_point ?? preference.sandbox_init_point;

    return Response.json({ payment_link: paymentLink });
  } catch (err) {
    console.error('MP crear-preferencia error:', err);
    // Mensaje más útil ante el típico "cruce de credenciales" (token de otra cuenta/app)
    const msg = err?.message ?? 'Error al crear preferencia de pago';
    const esAuth = /unauthorized|invalid.*token|credential/i.test(msg);
    return Response.json(
      { error: esAuth
          ? 'MercadoPago rechazó las credenciales. Verificá que el Access Token sea válido y de la misma aplicación que la Public Key.'
          : msg },
      { status: 500 }
    );
  }
}
