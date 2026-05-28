import React, { useState } from 'react';
import type { EraTheme, GameState, TraditionId, SubTraditionId } from '../gameTypes';
import { TRADITIONS } from '../gameConstants';
import { eraIndex } from '../gameEngine';

interface Props {
  theme: EraTheme;
  state: GameState;
  onSelectTradition: (id: TraditionId) => void;
  onSelectSubTradition: (id: SubTraditionId) => void;
}

export function DenomTree({ theme, state, onSelectTradition, onSelectSubTradition }: Props) {
  const t = theme;
  const [expanded, setExpanded] = useState<TraditionId | null>(null);
  const s = styles(t);

  const currentEraIdx = eraIndex(state.currentEra);

  return (
    <div style={s.panel}>
      <div style={s.title}>Denominational Tree</div>
      <div style={s.list}>
        {TRADITIONS.map(trad => {
          const unlocked = currentEraIdx >= eraIndex(trad.eraRequired);
          const isSelected = state.tradition === trad.id;
          const isExpanded = expanded === trad.id;

          return (
            <div key={trad.id}>
              <button
                style={{
                  ...s.tradBtn,
                  ...(isSelected ? s.tradBtnActive : {}),
                  ...(unlocked ? {} : s.tradBtnLocked),
                }}
                onClick={() => {
                  if (!unlocked) return;
                  if (isSelected && isExpanded) {
                    setExpanded(null);
                  } else {
                    setExpanded(trad.id);
                    onSelectTradition(trad.id);
                  }
                }}
                disabled={!unlocked}
              >
                <span style={{ fontSize: 16 }}>{trad.emoji}</span>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={s.tradName}>{trad.name}</div>
                  <div style={s.tradDesc}>{trad.desc}</div>
                </div>
                {unlocked && (
                  <span style={{ ...s.chevron, transform: isExpanded ? 'rotate(90deg)' : 'none' }}>›</span>
                )}
                {!unlocked && (
                  <span style={s.lockIcon}>🔒</span>
                )}
              </button>

              {isExpanded && unlocked && (
                <div style={s.branchList}>
                  {trad.branches.map(branch => {
                    const isBranchSelected = state.subTradition === branch.id;
                    return (
                      <button
                        key={branch.id}
                        style={{
                          ...s.branchBtn,
                          ...(isBranchSelected ? s.branchBtnActive : {}),
                        }}
                        onClick={() => onSelectSubTradition(branch.id)}
                      >
                        <div style={s.branchConnector} />
                        <div style={{ flex: 1 }}>
                          <div style={s.branchName}>{branch.name}</div>
                          <div style={s.branchBonus}>{branch.bonus}</div>
                        </div>
                        {isBranchSelected && (
                          <span style={{ color: t.accent, fontSize: 14 }}>✓</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {state.subTradition && (
        <div style={s.activeTag}>
          <span style={{ color: t.accentText, fontSize: 10, fontWeight: 700 }}>Active Path</span>
          <span style={{ color: t.accent, fontSize: 10 }}>
            {TRADITIONS.flatMap(tr => tr.branches).find(b => b.id === state.subTradition)?.name}
          </span>
        </div>
      )}
    </div>
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
      padding: '8px',
      display: 'flex',
      flexDirection: 'column' as const,
      gap: 4,
    } as React.CSSProperties,

    tradBtn: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '8px 10px',
      borderRadius: 7,
      border: `1px solid ${t.panelBorder}`,
      background: 'transparent',
      cursor: 'pointer',
      transition: 'all 0.15s',
      textAlign: 'left' as const,
    } as React.CSSProperties,

    tradBtnActive: {
      border: `1px solid ${t.accent}`,
      background: `${t.accent}18`,
    } as React.CSSProperties,

    tradBtnLocked: {
      opacity: 0.4,
      cursor: 'not-allowed',
    } as React.CSSProperties,

    tradName: {
      fontSize: 12,
      fontWeight: 700,
      color: t.text,
    } as React.CSSProperties,

    tradDesc: {
      fontSize: 10,
      color: t.subtext,
    } as React.CSSProperties,

    chevron: {
      fontSize: 16,
      color: t.accent,
      fontWeight: 700,
      transition: 'transform 0.2s',
      display: 'inline-block',
    } as React.CSSProperties,

    lockIcon: {
      fontSize: 12,
      opacity: 0.5,
    } as React.CSSProperties,

    branchList: {
      marginLeft: 16,
      display: 'flex',
      flexDirection: 'column' as const,
      gap: 3,
      marginBottom: 4,
    } as React.CSSProperties,

    branchBtn: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '6px 10px',
      borderRadius: 6,
      border: `1px solid ${t.panelBorder}`,
      background: `${t.panelBg}88`,
      cursor: 'pointer',
      transition: 'all 0.15s',
      position: 'relative' as const,
    } as React.CSSProperties,

    branchBtnActive: {
      border: `1px solid ${t.accent}`,
      background: `${t.accent}20`,
    } as React.CSSProperties,

    branchConnector: {
      width: 8,
      height: 1,
      background: t.panelBorder,
      flexShrink: 0,
    } as React.CSSProperties,

    branchName: {
      fontSize: 11,
      fontWeight: 600,
      color: t.text,
    } as React.CSSProperties,

    branchBonus: {
      fontSize: 9,
      color: t.accent,
      marginTop: 1,
    } as React.CSSProperties,

    activeTag: {
      borderTop: `1px solid ${t.panelBorder}`,
      padding: '8px 12px',
      display: 'flex',
      justifyContent: 'space-between',
      flexShrink: 0,
    } as React.CSSProperties,
  };
}
