import React from 'react';
import type { EraTheme, EraId } from '../gameTypes';
import { nextEraProgress } from '../gameEngine';
import { formatKI } from '../gameEngine';

interface Props {
  theme: EraTheme;
  currentEra: EraId;
  lifetimeKI: number;
}

export function MilestoneBar({ theme, currentEra, lifetimeKI }: Props) {
  const { pct, nextName, needed } = nextEraProgress(currentEra, lifetimeKI);
  const s = styles(theme);

  return (
    <div style={s.container}>
      <div style={s.labelRow}>
        <span style={s.label}>
          {nextName ? `Next Era: ${nextName}` : '⚜ Final Era Reached'}
        </span>
        {nextName && (
          <span style={s.needed}>
            {formatKI(needed)} KI remaining · {pct.toFixed(1)}%
          </span>
        )}
      </div>
      <div style={s.track}>
        <div
          style={{
            ...s.fill,
            width: `${pct}%`,
            background: theme.progressFill,
            boxShadow: `0 0 8px ${theme.accent}80`,
          }}
        />
        {[25, 50, 75].map(mark => (
          <div
            key={mark}
            style={{
              position: 'absolute',
              left: `${mark}%`,
              top: 0,
              bottom: 0,
              width: 1,
              background: `${theme.panelBorder}`,
              opacity: 0.5,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function styles(t: EraTheme) {
  return {
    container: {
      padding: '8px 20px 10px',
      borderBottom: `1px solid ${t.panelBorder}`,
      background: t.panelBg,
    } as React.CSSProperties,
    labelRow: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: 5,
    } as React.CSSProperties,
    label: {
      fontSize: 11,
      fontWeight: 600,
      color: t.accentText,
      letterSpacing: '0.06em',
      textTransform: 'uppercase' as const,
    } as React.CSSProperties,
    needed: {
      fontSize: 11,
      color: t.subtext,
    } as React.CSSProperties,
    track: {
      height: 6,
      background: t.panelBorder,
      borderRadius: 3,
      overflow: 'hidden',
      position: 'relative' as const,
    } as React.CSSProperties,
    fill: {
      height: '100%',
      borderRadius: 3,
      transition: 'width 0.4s ease',
    } as React.CSSProperties,
  };
}
