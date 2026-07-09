'use client';

import { useState } from 'react';
import { esEmailValido } from '@/lib/validaciones';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [gracias, setGracias] = useState(false);
  const [error, setError] = useState('');

  function handleSuscribir() {
    if (!esEmailValido(email)) {
      setError('Ingresá un email válido para suscribirte.');
      return;
    }
    setError('');
    setGracias(true);
    setEmail('');
    setTimeout(() => setGracias(false), 3000);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSuscribir();
  }

  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__brand">
          <p className="footer__logo">Franchus</p>
          <p className="footer__tagline">Accesorios · Vicente López, Buenos Aires</p>
        </div>

        <div className="footer__contacto">
          <h4 className="footer__titulo">Contacto</h4>
          <ul className="footer__lista">
            <li><a href="mailto:franchus.accesorios@gmail.com" className="footer__link">franchus.accesorios@gmail.com</a></li>
            <li><a href="https://wa.me/5491100000000" className="footer__link" target="_blank" rel="noopener noreferrer">WhatsApp</a></li>
          </ul>
        </div>

        <div className="footer__redes">
          <h4 className="footer__titulo">Seguinos</h4>
          <div className="footer__iconos">
            <a href="#" className="footer__icono" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
            <a href="#" className="footer__icono" aria-label="TikTok"><i className="fab fa-tiktok"></i></a>
            <a href="#" className="footer__icono" aria-label="Pinterest"><i className="fab fa-pinterest"></i></a>
          </div>
        </div>

        <div className="footer__novedades">
          <h4 className="footer__titulo">Novedades Franchus</h4>
          {gracias ? (
            <p className="novedades__gracias" style={{ display: 'block' }}>¡Gracias! Te avisamos de las novedades.</p>
          ) : (
            <div className="novedades__form">
              <input
                className={`novedades__input${error ? ' novedades__input--error' : ''}`}
                type="email"
                placeholder="Tu email..."
                value={email}
                onChange={e => { setEmail(e.target.value); if (error) setError(''); }}
                onKeyDown={handleKeyDown}
                aria-invalid={error ? 'true' : 'false'}
              />
              <button className="novedades__btn" onClick={handleSuscribir}>Suscribirme</button>
            </div>
          )}
          {error && <p className="novedades__error">{error}</p>}
        </div>
      </div>
      <p className="footer__copy">&copy; 2026 Franchus Jewelry. Todos los derechos reservados.</p>
    </footer>
  );
}
