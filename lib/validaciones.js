// ============================================================
//  Validaciones compartidas de formularios
//  Se usan tanto en el cliente (UX inmediata) como en la API
//  (seguridad: nunca confiar solo en el navegador).
// ============================================================

// Email con formato razonable (algo@algo.dominio)
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Teléfono argentino: solo dígitos, espacios, +, -, () — mínimo 8 dígitos reales.
// Rechaza "test", letras y basura.
const TEL_RE = /^[0-9+()\-\s]+$/;

export function esEmailValido(valor) {
  return typeof valor === 'string' && EMAIL_RE.test(valor.trim());
}

export function esTelefonoValido(valor) {
  if (typeof valor !== 'string') return false;
  const limpio = valor.trim();
  if (!limpio) return false;
  if (!TEL_RE.test(limpio)) return false;          // no letras/símbolos raros
  const digitos = limpio.replace(/\D/g, '');
  return digitos.length >= 8 && digitos.length <= 15;
}

// Código postal argentino: 4 dígitos, o formato CPA (letra + 4 dígitos + 3 letras)
export function esCPValido(valor) {
  if (typeof valor !== 'string') return false;
  const v = valor.trim();
  return /^\d{4}$/.test(v) || /^[A-Za-z]\d{4}[A-Za-z]{3}$/.test(v);
}

// Precio: número finito y estrictamente mayor a 0
export function esPrecioValido(valor) {
  const n = Number(valor);
  return Number.isFinite(n) && n > 0;
}

// Stock: entero mayor o igual a 0
export function esStockValido(valor) {
  const n = Number(valor);
  return Number.isFinite(n) && Number.isInteger(n) && n >= 0;
}

export function textoNoVacio(valor, min = 1) {
  return typeof valor === 'string' && valor.trim().length >= min;
}

// Valida los datos de envío del checkout. Devuelve un objeto de errores
// { campo: 'mensaje' }. Si está vacío, es válido.
export function validarEnvio(form) {
  const errores = {};
  if (!textoNoVacio(form.nombre, 2))       errores.nombre = 'Ingresá tu nombre.';
  if (!esEmailValido(form.email))          errores.email = 'Ingresá un email válido.';
  if (!textoNoVacio(form.direccion, 4))    errores.direccion = 'Ingresá tu dirección.';
  // Teléfono y CP son opcionales, pero si los cargan deben ser válidos
  if (textoNoVacio(form.telefono) && !esTelefonoValido(form.telefono))
    errores.telefono = 'Teléfono inválido (solo números, mín. 8 dígitos).';
  if (textoNoVacio(form.cp) && !esCPValido(form.cp))
    errores.cp = 'Código postal inválido (ej: 1638).';
  return errores;
}
