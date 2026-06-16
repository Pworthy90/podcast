import React from 'react';
import type { EraTheme, GameState, UpgradeId } from '../gameTypes';
import { UPGRADES } from '../gameConstants';
import { calcUpgradeCost, calcBulkCost, calcUpgradePassive, isUpgradeAvailable, formatKI } from '../gameEngine';

interface Props {
  theme: EraTheme;
  state: GameState;
  onBuy: (id: UpgradeId, qty: number) => void;
}

export function UpgradePanel({ theme, state, onBuy }: Props) {
  const t = theme;
  const s = styles(t);

  return (
    <div style={s.panel}>
      <div style={s.title}>Structures & Ministry</div>
      <div style={s.list}>
        {UPGRADES.map(def => {
          const available = isUpgradeAvailable(def.id, state.currentEra);
          const owned = state.upgrades[def.id];
          const cost1 = calcUpgradeCost(def.baseCost, owned);
          const cost10 = calcBulkCost(def.baseCost, owned, 10);
          const canAfford1 = state.ki >= cost1;
          const canAfford10 = state.ki >= cost10;
          const passive = calcUpgradePassive(def.id, owned, state);

          if (!available) {
            return (
              <div key={def.id} style={s.lockedRow}>
                <span style={{ fontSize: 18, opacity: 0.3 }}>{def.emoji}</span>
                <div>
                  <div style={s.lockedName}>{def.name}</div>
                  <div style={s.lockedHint}>Unlocks in {def.eraRequired} era</div>
                </div>
              </div>
            );
          }

          return (
            <div key={def.id} style={s.row}>
              <div style={s.rowTop}>
                <span style={s.emoji}>{def.emoji}</span>
                <div style={s.info}>
                  <div style={s.name}>
                    {def.name}
                    {owned > 0 && <span style={s.owned}> ×{owned}</span>}
                  </div>
                  <div style={s.desc}>{def.desc}</div>
                  {owned > 0 && (
                    <div style={s.passiveTag}>+{formatKI(passive)} KI/s</div>
                  )}
                </div>
              </div>
              <div style={s.btnRow}>
                <BuyBtn
                  label={`${formatKI(cost1)} KI`}
                  sublabel="×1"
                  canAfford={canAfford1}
                  onClick={() => onBuy(def.id, 1)}
                  theme={t}
                />
                <BuyBtn
                  label={`${formatKI(cost10)} KI`}
                  sublabel="×10"
                  canAfford={canAfford10}
                  onClick={() => onBuy(def.id, 10)}
                  theme={t}
                  dim
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BuyBtn({ label, sublabel, canAfford, onClick, theme: t, dim }: {
  label: string; sublabel: string; canAfford: boolean; onClick: () => void; theme: EraTheme; dim?: boolean;
}) {
  return (
    <button
      onClick={canAfford ? onClick : undefined}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '5px 10px',
        borderRadius: 6,
        border: `1px solid ${canAfford ? t.accent : t.panelBorder}`,
        background: canAfford ? (dim ? `${t.accentDim}44` : `${t.accent}22`) : 'transparent',
        cursor: canAfford ? 'pointer' : 'not-allowed',
        opacity: canAfford ? 1 : 0.4,
        minWidth: 68,
        transition: 'all 0.15s',
      }}
    >
      <span style={{ fontSize: 10, color: canAfford ? t.accentText : t.subtext, fontWeight: 700 }}>{sublabel}</span>
      <span style={{ fontSize: 10, color: canAfford ? t.text : t.subtext, fontVariantNumeric: 'tabular-nums' }}>{label}</span>
    </button>
  );
}

function styles(t: EraTheme) {
  return {
    panel: {
      display: 'flex',
      flexDirection: 'column' as const,
      height: '100%',
      overflow: 'hidden',
    } as React.CSSProperties,

    title: {
      padding: '10px 16px 8px',
      fontSize: 11,
      fontWeight: 700,
      color: t.subtext,
      letterSpacing: '0.1em',
      textTransform: 'uppercase' as const,
      borderBottom: `1px solid ${t.panelBorder}`,
      flexShrink: 0,
    } as React.CSSProperties,

    list: {
      flex: 1,
      overflowY: 'auto' as const,
      padding: '8px 10px',
      display: 'flex',
      flexDirection: 'column' as const,
      gap: 6,
    } as React.CSSProperties,

    row: {
      background: `${t.panelBg}bb`,
      border: `1px solid ${t.panelBorder}`,
      borderRadius: 8,
      padding: '8px 10px',
      display: 'flex',
      flexDirection: 'column' as const,
      gap: 6,
    } as React.CSSProperties,

    rowTop: {
      display: 'flex',
      gap: 8,
      alignItems: 'flex-start',
    } as React.CSSProperties,

    emoji: {
      fontSize: 22,
      lineHeight: 1,
      flexShrink: 0,
    } as React.CSSProperties,

    info: {
      flex: 1,
      minWidth: 0,
    } as React.CSSProperties,

    name: {
      fontSize: 12,
      fontWeight: 700,
      color: t.text,
    } as React.CSSProperties,

    owned: {
      color: t.accent,
      fontWeight: 700,
    } as React.CSSProperties,

    desc: {
      fontSize: 10,
      color: t.subtext,
      lineHeight: 1.4,
      marginTop: 2,
    } as React.CSSProperties,

    passiveTag: {
      display: 'inline-block',
      marginTop: 3,
      fontSize: 9,
      background: `${t.accent}22`,
      border: `1px solid ${t.accentDim}`,
      borderRadius: 4,
      padding: '1px 5px',
      color: t.accentText,
      fontWeight: 600,
    } as React.CSSProperties,

    btnRow: {
      display: 'flex',
      gap: 6,
    } as React.CSSProperties,

    lockedRow: {
      display: 'flex',
      gap: 8,
      alignItems: 'center',
      padding: '8px 10px',
      borderRadius: 8,
      border: `1px dashed ${t.panelBorder}`,
      opacity: 0.5,
    } as React.CSSProperties,

    lockedName: {
      fontSize: 11,
      color: t.subtext,
      fontWeight: 600,
    } as React.CSSProperties,

    lockedHint: {
      fontSize: 9,
      color: t.subtext,
      opacity: 0.6,
    } as React.CSSProperties,
  };
}
