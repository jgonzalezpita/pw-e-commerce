export default function Marquee() {
  const texto = '3 CUOTAS SIN INTERÉS \u00a0·\u00a0 ENVÍO GRATIS DESDE $80.000 \u00a0·\u00a0 20% OFF TRANSFERENCIA \u00a0\u00a0\u00a0\u00a0\u00a0\u00a0';
  const repetido = texto.repeat(4);
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee__track">
        <span className="marquee__texto">{repetido}</span>
        <span className="marquee__texto">{repetido}</span>
      </div>
    </div>
  );
}
