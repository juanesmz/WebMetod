import React, { useRef, useEffect } from 'react';
import { evaluateMath } from './mathUtils';

export default function FunctionChart({ funcStr, a, b, root }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Ajustar resolución retina / nitidez
    const width = canvas.parentElement.clientWidth || 600;
    const height = canvas.parentElement.clientHeight || 450;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.scale(dpr, dpr);

    // Padding
    const pad = 48;
    const plotW = width - pad * 2;
    const plotH = height - pad * 2;

    // Determinar rango X
    let minX = Math.min(a, b);
    let maxX = Math.max(a, b);
    if (minX === maxX) {
      minX -= 1;
      maxX += 1;
    }
    const xMargin = Math.max(0.5, (maxX - minX) * 0.25);
    minX -= xMargin;
    maxX += xMargin;

    // Si hay raíz, asegurar que esté dentro de los límites visuales
    if (root !== null && !isNaN(root)) {
      if (root < minX) minX = root - xMargin;
      if (root > maxX) maxX = root + xMargin;
    }

    // Muestreo para obtener valores Y y encontrar minY, maxY
    const steps = 300;
    const pts = [];
    let minY = Infinity;
    let maxY = -Infinity;

    for (let i = 0; i <= steps; i++) {
      const x = minX + (i / steps) * (maxX - minX);
      const y = evaluateMath(funcStr, x);
      pts.push({ x, y });
      if (!isNaN(y) && isFinite(y)) {
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }

    // Manejo de rango Y
    if (!isFinite(minY) || !isFinite(maxY) || minY === maxY) {
      minY = -5;
      maxY = 5;
    } else {
      // Incluir el 0 en el rango visible
      if (minY > 0) minY = -0.5 * Math.abs(maxY);
      if (maxY < 0) maxY = 0.5 * Math.abs(minY);

      // Clamp para evitar valores disparados por asíntotas
      const maxRange = 1000;
      if (maxY - minY > maxRange) {
        minY = Math.max(minY, -50);
        maxY = Math.min(maxY, 50);
      }
      const yMargin = Math.max(0.2, (maxY - minY) * 0.15);
      minY -= yMargin;
      maxY += yMargin;
    }

    // Funciones de mapeo de coordenadas mundo a pantalla
    const mapX = (x) => pad + ((x - minX) / (maxX - minX)) * plotW;
    const mapY = (y) => pad + plotH - ((y - minY) / (maxY - minY)) * plotH;

    // Fondo oscuro elegante tipo Blueprint (#0f2b3c)
    ctx.fillStyle = '#0f2b3c';
    ctx.fillRect(0, 0, width, height);

    // Cuadrícula sutil
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
    ctx.lineWidth = 1;

    // Líneas verticales de cuadrícula
    const numTicksX = 8;
    ctx.font = '11px sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.textAlign = 'center';

    for (let i = 0; i <= numTicksX; i++) {
      const val = minX + (i / numTicksX) * (maxX - minX);
      const px = mapX(val);
      ctx.beginPath();
      ctx.moveTo(px, pad);
      ctx.lineTo(px, height - pad);
      ctx.stroke();
      ctx.fillText(val.toFixed(2), px, height - pad + 18);
    }

    // Líneas horizontales de cuadrícula
    const numTicksY = 6;
    ctx.textAlign = 'right';
    for (let i = 0; i <= numTicksY; i++) {
      const val = minY + (i / numTicksY) * (maxY - minY);
      const py = mapY(val);
      ctx.beginPath();
      ctx.moveTo(pad, py);
      ctx.lineTo(width - pad, py);
      ctx.stroke();
      ctx.fillText(val.toFixed(2), pad - 8, py + 4);
    }

    // Eje X (Y = 0)
    if (minY <= 0 && maxY >= 0) {
      const zeroY = mapY(0);
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.lineWidth = 1.75;
      ctx.moveTo(pad, zeroY);
      ctx.lineTo(width - pad, zeroY);
      ctx.stroke();
    }

    // Eje Y (X = 0)
    if (minX <= 0 && maxX >= 0) {
      const zeroX = mapX(0);
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.lineWidth = 1.75;
      ctx.moveTo(zeroX, pad);
      ctx.lineTo(zeroX, height - pad);
      ctx.stroke();
    }

    // Área o líneas guía de los límites [a, b]
    const pA = mapX(a);
    const pB = mapX(b);

    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;

    // Línea vertical A
    ctx.beginPath();
    ctx.moveTo(pA, pad);
    ctx.lineTo(pA, height - pad);
    ctx.stroke();

    // Línea vertical B
    ctx.beginPath();
    ctx.moveTo(pB, pad);
    ctx.lineTo(pB, height - pad);
    ctx.stroke();
    ctx.restore();

    // Etiquetas A y B
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`A = ${a}`, pA, pad - 8);
    ctx.fillText(`B = ${b}`, pB, pad - 8);

    // Dibujar Curva f(x)
    ctx.beginPath();
    ctx.strokeStyle = '#22d3ee'; // Cian brillante
    ctx.lineWidth = 2.5;

    let drawing = false;
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      if (isNaN(p.y) || !isFinite(p.y) || p.y < minY * 2 || p.y > maxY * 2) {
        drawing = false;
        continue;
      }
      const cx = mapX(p.x);
      const cy = mapY(p.y);

      if (!drawing) {
        ctx.moveTo(cx, cy);
        drawing = true;
      } else {
        ctx.lineTo(cx, cy);
      }
    }
    ctx.stroke();

    // Dibujar Punto de la Raíz sobre el Eje X (Y = 0)
    if (root !== null && !isNaN(root)) {
      const rx = mapX(root);
      const ry = mapY(0); // Exactamente sobre el eje de abscisas

      // Halo brillante de color contrastante (Naranja/Rojo Neón #f97316 / #ff3366)
      ctx.beginPath();
      ctx.arc(rx, ry, 10, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 68, 68, 0.35)';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(rx, ry, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#ff2a5f';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Tooltip/Etiqueta flotante con el valor de la raíz
      ctx.fillStyle = '#ff2a5f';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      const labelText = `Raíz: ${root.toFixed(5)}`;
      const textMetrics = ctx.measureText(labelText);
      const textW = textMetrics.width + 14;

      // Caja de fondo
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = '#ff2a5f';
      ctx.lineWidth = 1;
      const boxY = ry > height - 60 ? ry - 32 : ry + 12;
      ctx.strokeRect(rx - textW / 2, boxY, textW, 22);
      ctx.fillRect(rx - textW / 2, boxY, textW, 22);

      // Texto de raíz
      ctx.fillStyle = '#ffffff';
      ctx.fillText(labelText, rx, boxY + 15);
    }
  }, [funcStr, a, b, root]);

  return (
    <div style={{ width: '100%', height: '100%', minHeight: '380px', position: 'relative' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', borderRadius: '4px' }} />
    </div>
  );
}
