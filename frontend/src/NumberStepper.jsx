import React from 'react';
import { ChevronUp, ChevronDown } from './icons';

export default function NumberStepper({ value, onChange, step = 0.5, min, max, label }) {
  const handleStep = (delta) => {
    const current = parseFloat(value) || 0;
    const nextVal = Math.round((current + delta) * 100000) / 100000;
    if (min !== undefined && nextVal < min) return;
    if (max !== undefined && nextVal > max) return;
    onChange(nextVal);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
      {label && (
        <span style={{ fontSize: '12px', fontWeight: 600, color: '#e0f2fe', textTransform: 'uppercase' }}>
          {label}
        </span>
      )}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#0c4a6e',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          borderRadius: '6px',
          overflow: 'hidden',
          boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.2)'
        }}
      >
        <input
          type="number"
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          style={{
            flex: 1,
            backgroundColor: 'transparent',
            border: 'none',
            color: '#ffffff',
            padding: '8px 12px',
            fontSize: '15px',
            fontWeight: '600',
            outline: 'none',
            width: '100%'
          }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', borderLeft: '1px solid rgba(255, 255, 255, 0.2)' }}>
          <button
            type="button"
            onClick={() => handleStep(step)}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              padding: '2px 8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.15s'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)')}
          >
            <ChevronUp size={14} />
          </button>
          <button
            type="button"
            onClick={() => handleStep(-step)}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              color: '#ffffff',
              padding: '2px 8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.15s'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)')}
          >
            <ChevronDown size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
