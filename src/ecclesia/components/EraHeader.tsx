import React from 'react';
import type { EraTheme } from '../gameTypes';
import { formatKI } from '../gameEngine';

interface Props {
  theme: EraTheme;
  ki: number;
  lifetimeKI: number;
  passiveKI: number;
}

export function EraHeader({ theme, ki, lifetimeKI, passiveKI }: Props) {
  const s = styles(theme);
  return (
    <header style={s.header}>
      <div style={s.eraBadge}>
        <span style={s.eraEmoji}>✠</span>
        <div>
          <div style={s.eraName}>{theme.name}</div>
          <div style={s.eraSub}>{theme.subtitle}</div>
        </div>
      </div>

      <div style={s.stats}>
        <StatChip label="Kingdom Impact" value={formatKI(ki)} accent={theme.accent} text={theme.text} sub={theme.subtext} />
        <div style={s.divider} />
        <StatChip label="Lifetime KI" value={formatKI(lifetimeKI)} accent={theme.accentDim} text={theme.text} sub={theme.subtext} />
        <div style={s.divider} />
        <StatChip label="Per Second" value={`+${formatKI(passiveKI)}`} accent={theme.accent} text={theme.accentText} sub={theme.subtext} pulse />
      </div>
    </header>
  );
}

function StatChip({ label, value, accent, text, sub, pulse }: {
  label: string; value: string; accent: string; text: string; sub: string; pulse?: boolean;
}) {
  return (
    <div style={{ textAlign: 'center', minWidth: 90 }}>
      <div style={{ fontSize: 11, color: sub, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 2 }}>{label}</div>
      <div style={{
        fontSize: 20,
        fontWeight: 700,
        color: text,
        fontVariantNumeric: 'tabular-nums',
        ...(pulse ? { textShadow: `0 0 12px ${accent}` } : {}),
      }}>
        {value}
      </div>
    </div>
  );
}

function styles(t: EraTheme) {
  return {
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 20px',
      borderBottom: `1px solid ${t.panelBorder}`,
      backgroundColor: t.panelBg,
      flexWrap: 'wrap' as const,
      gap: 12,
    } as React.CSSProperties,
    eraBadge: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      background: t.badgeBg,
      border: `1px solid ${t.panelBorder}`,
      borderRadius: 8,
      padding: '6px 14px',
    } as React.CSSProperties,
    eraEmoji: {
      fontSize: 22,
      color: t.accent,
    } as React.CSSProperties,
    eraName: {
      fontSize: 13,
      fontWeight: 700,
      color: t.badgeText,
      letterSpacing: '0.03em',
    } as React.CSSProperties,
    eraSub: {
      fontSize: 10,
      color: t.subtext,
      marginTop: 1,
    } as React.CSSProperties,
    stats: {
      display: 'flex',
      alignItems: 'center',
      gap: 16,
    } as React.CSSProperties,
    divider: {
      width: 1,
      height: 32,
      background: t.panelBorder,
    } as React.CSSProperties,
  };
}
