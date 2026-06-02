import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

// Rutas que no necesitan autenticación
const PUBLIC_PATHS = ['/auth/login', '/auth/registro', '/auth/reset-password'];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Si no está autenticado y no es ruta pública ni API, redirigir al login
  const isPublic = PUBLIC_PATHS.some(p => pathname.startsWith(p));
  const isApi    = pathname.startsWith('/api/');

  if (!user && !isPublic && !isApi) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
