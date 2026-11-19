import React, { useState, useMemo, useEffect } from 'react';
import FunctionChart from './FunctionChart';
import NumberStepper from './NumberStepper';
import { solveBisection, solveFalsePosition, evaluateMath } from './mathUtils';
import { solveBisectionBackend, solveFalsePositionBackend } from './api';
import { CheckCircle2, AlertCircle } from './icons';
import './App.css';

export default function App() {
  // Estado de Navegación del Menú Tabulado (Solo Bisección y Falsa Posición según instrucción)
  const [activeTab, setActiveTab] = useState('biseccion'); // 'biseccion' | 'falsa-posicion'

  // Parámetros numéricos
  const [funcStr, setFuncStr] = useState('x^3 - x - 2');
  const [limA, setLimA] = useState(1);
  const [limB, setLimB] = useState(2);

  // Switch modo de parada: 'iter' (iteraciones fijas) o 'tol' (tolerancia)
  const [stopMode, setStopMode] = useState('iter'); // 'iter' | 'tol'
  const [iterations, setIterations] = useState(10);
  const [tolerance, setTolerance] = useState(0.0001);

  // Estado del cálculo (conectado al Backend FastAPI con fallback local)
  const [calculation, setCalculation] = useState(() => {
    return solveBisection(funcStr, limA, limB, stopMode, iterations);
  });
  const [backendActive, setBackendActive] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const val = stopMode === 'iter' ? iterations : tolerance;

    const executeMethod = async () => {
      try {
        let res;
        if (activeTab === 'biseccion') {
          res = await solveBisectionBackend(funcStr, limA, limB, stopMode, val);
        } else {
          res = await solveFalsePositionBackend(funcStr, limA, limB, stopMode, val);
        }
        if (isMounted && res) {
          setCalculation(res);
          setBackendActive(true);
        }
      } catch (err) {
        if (isMounted) {
          const fallback = activeTab === 'biseccion'
            ? solveBisection(funcStr, limA, limB, stopMode, val)
            : solveFalsePosition(funcStr, limA, limB, stopMode, val);
          setCalculation(fallback);
          setBackendActive(false);
        }
      }
    };

    executeMethod();
    return () => { isMounted = false; };
  }, [activeTab, funcStr, limA, limB, stopMode, iterations, tolerance]);

  // Valores de la función en los extremos
  const fa = useMemo(() => evaluateMath(funcStr, limA), [funcStr, limA]);
  const fb = useMemo(() => evaluateMath(funcStr, limB), [funcStr, limB]);

  return (
    <div className="layout-container">
      {/* 1. Barra Superior / Vista tabulada con métodos numéricos */}
      <header className="header-tabs-panel">
        <div className="tabs-header-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <span>Vista tabulada con métodos numéricos</span>
          <span style={{
            fontSize: '0.8rem',
            fontWeight: 500,
            padding: '4px 10px',
            borderRadius: '12px',
            background: backendActive ? 'rgba(34, 197, 94, 0.15)' : 'rgba(234, 179, 8, 0.15)',
            color: backendActive ? '#22c55e' : '#eab308',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: backendActive ? '#22c55e' : '#eab308'
            }}></span>
            {backendActive ? 'Backend FastAPI Conectado' : 'Conectando con Backend...'}
          </span>
        </div>
        <div className="tabs-navigation">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'biseccion' ? 'active' : ''}`}
            onClick={() => setActiveTab('biseccion')}
          >
            Método de Bisección
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'falsa-posicion' ? 'active' : ''}`}
            onClick={() => setActiveTab('falsa-posicion')}
          >
            Método de Falsa Posición
          </button>
        </div>
      </header>

      {/* 2. Cuerpo Principal en 2 Columnas (Gráfica a la izquierda, Controles a la derecha) */}
      <main className="main-content-grid">
        {/* Panel Izquierdo: Gráfica con la curva de la función y raíz */}
        <section className="chart-panel">
          <div className="panel-banner-title">
            Gráfica con la curva de la función
          </div>
          <div className="chart-canvas-wrapper">
            <FunctionChart
              funcStr={funcStr}
              a={limA}
              b={limB}
              root={calculation.root}
            />
          </div>
          {/* Pie de gráfica con leyenda explicativa */}
          <div className="chart-legend">
            <div className="legend-item">
              <span className="legend-color-line cyan"></span>
              <span>Curva f(x)</span>
            </div>
            <div className="legend-item">
              <span className="legend-color-line blue-dash"></span>
              <span>Límites [A, B]</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot-root"></span>
              <span>Punto de la Raíz (sobre el eje X)</span>
            </div>
          </div>
        </section>

        {/* Panel Derecho: Bloques de Entrada del Diagrama */}
        <section className="controls-panel">
          {/* Bloque 1: Entrada de texto para la función del método */}
          <div className="control-card">
            <div className="control-card-header">
              Entrada de texto para la función del método
            </div>
            <div className="control-card-body">
              <div className="input-group">
                <label className="field-label">Función f(x)</label>
                <div className="text-input-wrapper">
                  <span className="input-prefix">f(x) =</span>
                  <input
                    type="text"
                    value={funcStr}
                    onChange={(e) => setFuncStr(e.target.value)}
                    placeholder="ej. x^3 - x - 2, cos(x) - x, exp(x) - 3"
                    className="function-text-input"
                  />
                </div>
              </div>
              <div className="presets-row">
                <span className="presets-label">Ejemplos rápidos:</span>
                <button
                  type="button"
                  className="preset-chip"
                  onClick={() => {
                    setFuncStr('x^3 - x - 2');
                    setLimA(1);
                    setLimB(2);
                  }}
                >
                  x³ - x - 2
                </button>
                <button
                  type="button"
                  className="preset-chip"
                  onClick={() => {
                    setFuncStr('cos(x) - x');
                    setLimA(0);
                    setLimB(1);
                  }}
                >
                  cos(x) - x
                </button>
                <button
                  type="button"
                  className="preset-chip"
                  onClick={() => {
                    setFuncStr('exp(x) - 3*x');
                    setLimA(0);
                    setLimB(1);
                  }}
                >
                  e^x - 3x
                </button>
              </div>
            </div>
          </div>

          {/* Bloque 2: Dos entradas numéricas para el límite A y el B */}
          <div className="control-card">
            <div className="control-card-header">
              Dos entradas numéricas para el límite A y el B
            </div>
            <div className="control-card-body">
              <div className="limits-inputs-row">
                <NumberStepper
                  label="Límite A"
                  value={limA}
                  onChange={setLimA}
                  step={0.5}
                />
                <NumberStepper
                  label="Límite B"
                  value={limB}
                  onChange={setLimB}
                  step={0.5}
                />
              </div>

              {/* Verificación de Teorema de Bolzano */}
              <div className="interval-status">
                <span>f(A) = {!isNaN(fa) ? fa.toFixed(4) : 'NaN'}</span>
                <span className="status-separator">|</span>
                <span>f(B) = {!isNaN(fb) ? fb.toFixed(4) : 'NaN'}</span>
                <span className="status-separator">|</span>
                <span className={fa * fb <= 0 ? 'valid-badge' : 'invalid-badge'}>
                  {fa * fb <= 0 ? '✓ Signos opuestos (f(a)·f(b) ≤ 0)' : '⚠ Signos iguales'}
                </span>
              </div>
            </div>
          </div>

          {/* Bloque 3: Switch + Campo para tolerancia o iteraciones en fila compartida */}
          <div className="control-row-split">
            {/* Mitad izquierda: Switch para cambiar entre iteraciones fijas o tolerancia */}
            <div className="control-card half-card">
              <div className="control-card-header">
                Switch para cambiar entre iteraciones fijas o tolerancia
              </div>
              <div className="control-card-body centered-switch">
                <div className="switch-toggle-container">
                  <button
                    type="button"
                    className={`switch-option ${stopMode === 'iter' ? 'active' : ''}`}
                    onClick={() => setStopMode('iter')}
                  >
                    Iteraciones Fijas
                  </button>
                  <button
                    type="button"
                    className={`switch-option ${stopMode === 'tol' ? 'active' : ''}`}
                    onClick={() => setStopMode('tol')}
                  >
                    Tolerancia
                  </button>
                </div>
              </div>
            </div>

            {/* Mitad derecha: Campo para tolerancia o iteraciones */}
            <div className="control-card half-card">
              <div className="control-card-header">
                Campo para tolerancia o iteraciones
              </div>
              <div className="control-card-body">
                {stopMode === 'iter' ? (
                  <NumberStepper
                    label="Máximo de Iteraciones"
                    value={iterations}
                    onChange={(val) => setIterations(Math.max(1, Math.floor(val)))}
                    step={1}
                    min={1}
                    max={200}
                  />
                ) : (
                  <div className="tolerance-field-container">
                    <label className="field-label">Tolerancia (Error ε)</label>
                    <select
                      value={tolerance}
                      onChange={(e) => setTolerance(parseFloat(e.target.value))}
                      className="tolerance-select"
                    >
                      <option value="0.01">0.01 (10⁻²)</option>
                      <option value="0.001">0.001 (10⁻³)</option>
                      <option value="0.0001">0.0001 (10⁻⁴)</option>
                      <option value="0.00001">0.00001 (10⁻⁵)</option>
                      <option value="0.000001">0.000001 (10⁻⁶)</option>
                      <option value="0.00000001">0.00000001 (10⁻⁸)</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tarjeta Informativa de Resultado */}
          <div className="results-card">
            {calculation.error ? (
              <div className="result-alert error">
                <AlertCircle size={20} />
                <span>{calculation.error}</span>
              </div>
            ) : calculation.root !== null ? (
              <div className="result-alert success">
                <CheckCircle2 size={24} className="success-icon" />
                <div className="result-details">
                  <div className="result-main-val">
                    Raíz aproximada: <strong>{calculation.root.toFixed(6)}</strong>
                  </div>
                  <div className="result-sub-info">
                    <span>f(raíz) = {calculation.fRoot.toExponential(4)}</span>
                    <span>•</span>
                    <span>Iteraciones ejecutadas: {calculation.iterations}</span>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </section>
      </main>

      {/* Tabla detallada de iteraciones (desplegable) */}
      {calculation.history && calculation.history.length > 0 && (
        <section className="history-table-container">
          <h3 className="history-title">Tabla de Iteraciones ({activeTab === 'biseccion' ? 'Bisección' : 'Falsa Posición'})</h3>
          <div className="table-responsive">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Iteración</th>
                  <th>A</th>
                  <th>B</th>
                  <th>Raíz (Xr)</th>
                  <th>f(Xr)</th>
                  <th>Error Relativo</th>
                </tr>
              </thead>
              <tbody>
                {calculation.history.map((row) => (
                  <tr key={row.iteration}>
                    <td>{row.iteration}</td>
                    <td>{row.a.toFixed(5)}</td>
                    <td>{row.b.toFixed(5)}</td>
                    <td className="highlight-cell">{row.root.toFixed(6)}</td>
                    <td>{row.fRoot.toExponential(4)}</td>
                    <td>{row.error !== null ? `${(row.error * 100).toFixed(4)}%` : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
