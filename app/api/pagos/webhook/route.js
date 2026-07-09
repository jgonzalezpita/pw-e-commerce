import { MercadoPagoConfig, Payment } from 'mercadopago';
import { createClient } from '@supabase/supabase-js';

// Usa service role para actualizar sin restricciones de RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  // MP siempre espera 200; si falta el token no rompemos, solo registramos.
  const accessToken = process.env.MP_ACCESS_TOKEN;
  if (!accessToken) {
    console.error('Webhook MP: falta MP_ACCESS_TOKEN en el entorno.');
    return new Response('ok', { status: 200 });
  }
  const mp = new MercadoPagoConfig({ accessToken });

  const { searchParams } = new URL(request.url);
  const topic = searchParams.get('topic') || searchParams.get('type');
  const id = searchParams.get('id') || searchParams.get('data.id');

  // MP también manda el body con data.id
  let paymentId = id;
  if (!paymentId) {
    try {
      const body = await request.json();
      paymentId = body?.data?.id;
    } catch (_) {}
  }

  if (topic !== 'payment' && topic !== 'merchant_order') {
    return new Response('ok', { status: 200 });
  }

  if (!paymentId) return new Response('ok', { status: 200 });

  try {
    const payment = await new Payment(mp).get({ id: paymentId });

    const ordenId = payment.external_reference;
    if (!ordenId) return new Response('ok', { status: 200 });

    const estadoMP = payment.status; // approved | rejected | pending | in_process
    const estadoOrden = estadoMP === 'approved' ? 'pagada'
      : estadoMP === 'rejected' ? 'cancelada'
      : 'pendiente';

    await supabase
      .from('ordenes')
      .update({ estado: estadoOrden, mp_payment_id: String(paymentId) })
      .eq('id', ordenId);

  } catch (err) {
    console.error('Webhook MP error:', err.message);
  }

  return new Response('ok', { status: 200 });
}
