import React from 'react';
import type { EraTheme, GameState, StaffTypeId } from '../gameTypes';
import { STAFF_DEFS, MAX_STAFF, HIRE_COST_BASE } from '../gameConstants';
import { formatKI } from '../gameEngine';

interface Props {
  theme: EraTheme;
  state: GameState;
  onHire: (typeId: StaffTypeId) => void;
  onFire: (memberId: string) => void;
}

export function MinistryRoster({ theme, state, onHire, onFire }: Props) {
  const t = theme;
  const s = styles(t);
  const slotsUsed = state.staff.length;
  const canHire = slotsUsed < MAX_STAFF;

  const hiredTypeIds = new Set(state.staff.map(m => m.typeId));

  return (
    <div style={s.panel}>
      <div style={s.titleRow}>
        <span style={s.title}>Ministry Roster</span>
        <span style={s.slots}>{slotsUsed}/{MAX_STAFF} slots</span>
      </div>

      {/* Active staff */}
      {state.staff.length > 0 && (
        <div style={s.activeSection}>
          {state.staff.map(member => {
            const def = STAFF_DEFS.find(d => d.id === member.typeId)!;
            return (
              <div key={member.id} style={s.memberRow}>
                <span style={{ fontSize: 20 }}>{def.emoji}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={s.memberName}>{def.name}</div>
                  <div style={s.memberCost}>-{def.costPerTick} KI/s upkeep</div>
                </div>
                <button style={s.fireBtn} onClick={() => onFire(member.id)}>✕</button>
              </div>
            );
          })}
        </div>
      )}

      {/* Hire section */}
      {canHire && (
        <div style={s.hireSection}>
          <div style={s.hireSectionTitle}>Available to Hire</div>
          {STAFF_DEFS.map(def => {
            const alreadyHired = hiredTypeIds.has(def.id);
            const hireCost = HIRE_COST_BASE;
            const canAfford = state.ki >= hireCost && !alreadyHired && canHire;

            return (
              <div key={def.id} style={{ ...s.hireRow, opacity: alreadyHired ? 0.4 : 1 }}>
                <span style={{ fontSize: 18 }}>{def.emoji}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={s.hireName}>{def.name}</div>
                  <div style={s.hireDesc}>{def.desc}</div>
                </div>
                <button
                  style={{
                    ...s.hireBtn,
                    ...(canAfford ? s.hireBtnActive : {}),
                  }}
                  onClick={() => canAfford && onHire(def.id)}
                  disabled={!canAfford}
                >
                  {alreadyHired ? 'Active' : `${formatKI(hireCost)} KI`}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {!canHire && (
        <div style={s.fullNotice}>
          Roster full — fire a minister to hire another.
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
      overflow: 'hidden',
      borderTop: `1px solid ${t.panelBorder}`,
    } as React.CSSProperties,

    titleRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px 16px 8px',
      borderBottom: `1px solid ${t.panelBorder}`,
    } as React.CSSProperties,

    title: {
      fontSize: 11,
      fontWeight: 700,
      color: t.subtext,
      letterSpacing: '0.1em',
      textTransform: 'uppercase' as const,
    } as React.CSSProperties,

    slots: {
      fontSize: 10,
      background: `${t.accent}22`,
      border: `1px solid ${t.accentDim}`,
      borderRadius: 10,
      padding: '2px 8px',
      color: t.accentText,
      fontWeight: 700,
    } as React.CSSProperties,

    activeSection: {
      padding: '6px 10px',
      display: 'flex',
      flexDirection: 'column' as const,
      gap: 4,
      borderBottom: `1px solid ${t.panelBorder}`,
    } as React.CSSProperties,

    memberRow: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '6px 8px',
      borderRadius: 6,
      background: `${t.accent}15`,
      border: `1px solid ${t.accent}40`,
    } as React.CSSProperties,

    memberName: {
      fontSize: 11,
      fontWeight: 700,
      color: t.text,
    } as React.CSSProperties,

    memberCost: {
      fontSize: 9,
      color: t.subtext,
      marginTop: 1,
    } as React.CSSProperties,

    fireBtn: {
      width: 22,
      height: 22,
      borderRadius: '50%',
      border: `1px solid ${t.panelBorder}`,
      background: 'transparent',
      cursor: 'pointer',
      color: t.subtext,
      fontSize: 10,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    } as React.CSSProperties,

    hireSection: {
      padding: '6px 10px',
      display: 'flex',
      flexDirection: 'column' as const,
      gap: 4,
      flex: 1,
      overflowY: 'auto' as const,
    } as React.CSSProperties,

    hireSectionTitle: {
      fontSize: 9,
      color: t.subtext,
      fontWeight: 600,
      letterSpacing: '0.08em',
      textTransform: 'uppercase' as const,
      marginBottom: 2,
    } as React.CSSProperties,

    hireRow: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '5px 6px',
      borderRadius: 6,
      border: `1px solid ${t.panelBorder}`,
      background: `${t.panelBg}88`,
    } as React.CSSProperties,

    hireName: {
      fontSize: 10,
      fontWeight: 600,
      color: t.text,
    } as React.CSSProperties,

    hireDesc: {
      fontSize: 9,
      color: t.subtext,
      lineHeight: 1.3,
    } as React.CSSProperties,

    hireBtn: {
      fontSize: 9,
      padding: '3px 7px',
      borderRadius: 5,
      border: `1px solid ${t.panelBorder}`,
      background: 'transparent',
      color: t.subtext,
      cursor: 'not-allowed',
      whiteSpace: 'nowrap' as const,
      flexShrink: 0,
    } as React.CSSProperties,

    hireBtnActive: {
      border: `1px solid ${t.accent}`,
      background: `${t.accent}22`,
      color: t.accentText,
      cursor: 'pointer',
    } as React.CSSProperties,

    fullNotice: {
      padding: '10px 16px',
      fontSize: 10,
      color: t.subtext,
      textAlign: 'center' as const,
      fontStyle: 'italic',
    } as React.CSSProperties,
  };
}
