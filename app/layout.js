import './globals.css';

export const metadata = {
  title: 'Franchus Jewelry — Joyería Fina',
  description: 'Accesorios de acero inoxidable bañado en oro. Vicente López, Buenos Aires.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
