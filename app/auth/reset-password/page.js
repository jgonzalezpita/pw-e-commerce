'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [exito, setExito] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleReset = async (e) => {
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
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setError(error.message);
      } else {
        setExito(true);
        setTimeout(() => router.push('/auth/login'), 2500);
      }
    } catch {
      setError('Error al actualizar la contraseña.');
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
            <h2 className="auth-exito__titulo">¡Contraseña actualizada!</h2>
            <p className="auth-exito__texto">Redirigiendo al inicio de sesión...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link href="/" className="auth-logo">Franchus</Link>
        <h1 className="auth-titulo">Nueva contraseña</h1>

        <form className="auth-form" onSubmit={handleReset}>
          <div className="auth-field">
            <label className="auth-label" htmlFor="password">Nueva contraseña</label>
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
            {loading ? 'Actualizando...' : 'Actualizar contraseña'}
          </button>
        </form>
      </div>
    </div>
  );
}
