const rawApiUrl = import.meta.env.VITE_API_URL;
let API_BASE_URL = 'http://127.0.0.1:8001/api/metodos';

if (rawApiUrl) {
  const cleanUrl = rawApiUrl.replace(/\/+$/, '');
  API_BASE_URL = cleanUrl.endsWith('/api/metodos') ? cleanUrl : `${cleanUrl}/api/metodos`;
}

/**
 * Llama al endpoint de Bisección en el backend FastAPI
 */
export async function solveBisectionBackend(funcStr, a, b, stopMode, val) {
  const payload = {
    funcion: funcStr,
    a: parseFloat(a),
    b: parseFloat(b),
    stop_mode: stopMode,
    tol: stopMode === 'tol' ? parseFloat(val) : 1e-5,
    max_iter: stopMode === 'iter' ? Math.floor(val) : 100
  };

  const response = await fetch(`${API_BASE_URL}/biseccion`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Error al comunicarse con el servidor.');
  }

  return response.json();
}

/**
 * Llama al endpoint de Falsa Posición en el backend FastAPI
 */
export async function solveFalsePositionBackend(funcStr, a, b, stopMode, val) {
  const payload = {
    funcion: funcStr,
    a: parseFloat(a),
    b: parseFloat(b),
    stop_mode: stopMode,
    tol: stopMode === 'tol' ? parseFloat(val) : 1e-5,
    max_iter: stopMode === 'iter' ? Math.floor(val) : 100
  };

  const response = await fetch(`${API_BASE_URL}/falsa-posicion`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Error al comunicarse con el servidor.');
  }

  return response.json();
}
