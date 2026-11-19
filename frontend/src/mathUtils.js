// Evaluador seguro de expresiones matemáticas en formato estándar
export function evaluateMath(expr, xVal) {
  try {
    let clean = expr.trim();
    if (!clean) return NaN;

    // Normalizar potencias ^ a **
    clean = clean.replace(/\^/g, '**');

    // Multiplicación implícita como 2x o 2(x) o (x+1)(x-2)
    clean = clean.replace(/([0-9])\s*([a-zA-Z(])/g, '$1 * $2');
    clean = clean.replace(/(\))\s*([0-9a-zA-Z(])/g, '$1 * $2');

    // Mapear funciones estándar de Math
    const mathMap = {
      'sin': 'Math.sin',
      'cos': 'Math.cos',
      'tan': 'Math.tan',
      'exp': 'Math.exp',
      'log': 'Math.log',
      'ln': 'Math.log',
      'sqrt': 'Math.sqrt',
      'abs': 'Math.abs',
      'pi': 'Math.PI',
      'PI': 'Math.PI',
      'e': 'Math.E',
      'E': 'Math.E'
    };

    // Reemplazar tokens reconocidos
    for (const [key, val] of Object.entries(mathMap)) {
      const regex = new RegExp(`\\b${key}\\b`, 'g');
      clean = clean.replace(regex, val);
    }

    // Funciones personalizadas seguras
    const fn = new Function('x', 'Math', `
      try {
        return (${clean});
      } catch(e) {
        return NaN;
      }
    `);

    const result = fn(xVal, Math);
    return typeof result === 'number' && !isNaN(result) && isFinite(result) ? result : NaN;
  } catch (err) {
    return NaN;
  }
}

// Método de Bisección
export function solveBisection(funcStr, a, b, mode, val) {
  const f = (x) => evaluateMath(funcStr, x);
  const maxIter = mode === 'iter' ? Math.max(1, Math.floor(val)) : 100;
  const tol = mode === 'tol' ? Math.max(1e-12, val) : 1e-5;

  let fa = f(a);
  let fb = f(b);

  if (isNaN(fa) || isNaN(fb)) {
    return { error: 'No se pudo evaluar la función en los límites indicados.', history: [], root: null };
  }

  if (fa * fb > 0) {
    return { 
      error: 'f(A) y f(B) tienen el mismo signo. No se garantiza una raíz en el intervalo [A, B] según el teorema de Bolzano.', 
      history: [], 
      root: null 
    };
  }

  let currentA = a;
  let currentB = b;
  let c = currentA;
  let prevC = null;
  const history = [];

  for (let iter = 1; iter <= maxIter; iter++) {
    c = (currentA + currentB) / 2;
    const fc = f(c);

    let error = prevC !== null ? Math.abs((c - prevC) / c) : 1;
    if (c === 0 && prevC !== null) error = Math.abs(c - prevC);

    history.push({
      iteration: iter,
      a: currentA,
      b: currentB,
      root: c,
      fRoot: fc,
      error: prevC !== null ? error : null
    });

    if (fc === 0 || (mode === 'tol' && error < tol)) {
      break;
    }

    if (f(currentA) * fc < 0) {
      currentB = c;
    } else {
      currentA = c;
    }

    prevC = c;
  }

  return {
    root: c,
    fRoot: f(c),
    iterations: history.length,
    history,
    error: null
  };
}

// Método de Falsa Posición (Regula Falsi)
export function solveFalsePosition(funcStr, a, b, mode, val) {
  const f = (x) => evaluateMath(funcStr, x);
  const maxIter = mode === 'iter' ? Math.max(1, Math.floor(val)) : 100;
  const tol = mode === 'tol' ? Math.max(1e-12, val) : 1e-5;

  let fa = f(a);
  let fb = f(b);

  if (isNaN(fa) || isNaN(fb)) {
    return { error: 'No se pudo evaluar la función en los límites indicados.', history: [], root: null };
  }

  if (fa * fb > 0) {
    return { 
      error: 'f(A) y f(B) tienen el mismo signo. No se garantiza una raíz en el intervalo [A, B] según el teorema de Bolzano.', 
      history: [], 
      root: null 
    };
  }

  let currentA = a;
  let currentB = b;
  let c = currentA;
  let prevC = null;
  const history = [];

  for (let iter = 1; iter <= maxIter; iter++) {
    const fA = f(currentA);
    const fB = f(currentB);

    if (fB === fA) break;

    // Fórmula Falsa Posición: c = b - (f(b)*(b - a)) / (f(b) - f(a))
    c = currentB - (fB * (currentB - currentA)) / (fB - fA);
    const fc = f(c);

    let error = prevC !== null ? Math.abs((c - prevC) / c) : 1;
    if (c === 0 && prevC !== null) error = Math.abs(c - prevC);

    history.push({
      iteration: iter,
      a: currentA,
      b: currentB,
      root: c,
      fRoot: fc,
      error: prevC !== null ? error : null
    });

    if (fc === 0 || (mode === 'tol' && error < tol)) {
      break;
    }

    if (fA * fc < 0) {
      currentB = c;
    } else {
      currentA = c;
    }

    prevC = c;
  }

  return {
    root: c,
    fRoot: f(c),
    iterations: history.length,
    history,
    error: null
  };
}
