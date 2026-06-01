'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function Registro() {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [exito, setExito] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegistro = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { nombre, apellido } },
      });
      if (error) {
        setError(error.message);
      } else {
        setExito(true);
      }
    } catch (err) {
      setError('Error al registrarse. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (exito) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <Link href="/" className="auth-logo">Franchus</Link>
          <div className="auth-exito">
            <div className="auth-exito__icono">✓</div>
            <h2 className="auth-exito__titulo">¡Cuenta creada!</h2>
            <p className="auth-exito__texto">
              Revisá tu email para confirmar tu cuenta. Una vez confirmada, podés iniciar sesión.
            </p>
            <Link href="/auth/login" className="auth-btn auth-btn--link">
              Ir al inicio de sesión
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link href="/" className="auth-logo">Franchus</Link>
        <h1 className="auth-titulo">Crear cuenta</h1>

        <form className="auth-form" onSubmit={handleRegistro}>
          <div className="auth-field">
            <label className="auth-label" htmlFor="nombre">Nombre</label>
            <input
              className="auth-input"
              id="nombre"
              type="text"
              placeholder="Tu nombre"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              required
            />
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="apellido">Apellido</label>
            <input
              className="auth-input"
              id="apellido"
              type="text"
              placeholder="Tu apellido"
              value={apellido}
              onChange={e => setApellido(e.target.value)}
              required
            />
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="email">Email</label>
            <input
              className="auth-input"
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="password">Contraseña</label>
            <input
              className="auth-input"
              id="password"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="confirmPassword">Confirmar contraseña</label>
            <input
              className="auth-input"
              id="confirmPassword"
              type="password"
              placeholder="Repetí tu contraseña"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="auth-link">
          ¿Ya tenés cuenta?{' '}
          <Link href="/auth/login">Iniciá sesión</Link>
        </p>
      </div>
    </div>
  );
}
