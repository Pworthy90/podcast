import React from 'react';
import type { EraTheme, GameState } from '../gameTypes';
import { formatKI } from '../gameEngine';

interface Props {
  theme: EraTheme;
  state: GameState;
  onManualKI: () => void;
}

export function BlueprintGrid({ theme, state, onManualKI }: Props) {
  const { upgrades } = state;
  const t = theme;

  const hasSpire = upgrades.spire > 0;
  const hasOutreachPanel = upgrades.outreach > 5;
  const hasCathedral = upgrades.cathedral > 0;
  const hasMultisite = upgrades.multisite > 0;
  const sanctuaryScale = Math.min(3, 1 + (upgrades.sanctuary / 10));
  const congregationDots = Math.min(20, upgrades.congregation);

  const s = styles(t);

  return (
    <div style={s.wrapper}>
      <div style={s.gridLines} />

      <div style={s.sceneContainer}>
        {/* Multi-site campus blocks (background) */}
        {hasMultisite && (
          <div style={s.multisiteRow}>
            {Array.from({ length: Math.min(upgrades.multisite, 4) }).map((_, i) => (
              <div key={i} style={s.campusBlock}>
                <div style={s.campusRoof} />
                <div style={s.campusBody}>
                  <span style={{ fontSize: 12 }}>🏘️</span>
                </div>
                <div style={{ fontSize: 9, color: t.subtext, marginTop: 2, textAlign: 'center' }}>
                  Campus {i + 1}
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={s.buildingRow}>
          {/* Outreach / Food Pantry panel */}
          {hasOutreachPanel && (
            <div style={s.outreachPanel}>
              <div style={s.outreachRoof} />
              <div style={s.outreachBody}>
                <div style={{ fontSize: 18, marginBottom: 4 }}>🤲</div>
                <div style={s.panelLabel}>Food Pantry</div>
                <div style={s.panelSub}>Outreach ×{upgrades.outreach}</div>
              </div>
            </div>
          )}

          {/* Main sanctuary building */}
          <div style={s.sanctuaryWrapper} onClick={onManualKI} title="Click to generate KI">
            {/* Spire */}
            {hasSpire && (
              <div style={s.spireAssembly}>
                <div style={s.spireShaft} />
                <div style={s.spireCross}>
                  <div style={s.crossVert} />
                  <div style={s.crossHoriz} />
                </div>
              </div>
            )}

            {/* Cathedral wings */}
            {hasCathedral && (
              <>
                <div style={{ ...s.cathedralWing, left: -38 }} />
                <div style={{ ...s.cathedralWing, right: -38 }} />
              </>
            )}

            {/* Roof */}
            <div style={{
              ...s.roof,
              borderLeftWidth: 40 + sanctuaryScale * 15,
              borderRightWidth: 40 + sanctuaryScale * 15,
              borderBottomWidth: 30 + sanctuaryScale * 8,
              borderBottomColor: t.accent,
            }} />

            {/* Body */}
            <div style={{
              ...s.sanctuaryBody,
              width: 120 + sanctuaryScale * 30,
              height: 80 + sanctuaryScale * 20,
            }}>
              {/* Congregation dots */}
              <div style={s.dotGrid}>
                {Array.from({ length: congregationDots }).map((_, i) => (
                  <div key={i} style={{ ...s.dot, opacity: 0.6 + (i % 3) * 0.1 }} />
                ))}
              </div>
              {/* Arched window */}
              <div style={s.archWindow}>
                <div style={s.archTop} />
                <div style={s.archPane} />
              </div>
              {/* Door */}
              <div style={s.door} />

              <div style={s.clickHint}>+ KI</div>
            </div>

            {/* Foundation steps */}
            <div style={s.stepBase1} />
            <div style={s.stepBase2} />
          </div>

          {/* Scriptorium side */}
          {upgrades.scriptorium > 0 && (
            <div style={s.scriptoriumPanel}>
              <div style={s.scriptoriumRoof} />
              <div style={s.scriptoriumBody}>
                <div style={{ fontSize: 18, marginBottom: 4 }}>📜</div>
                <div style={s.panelLabel}>Scriptorium</div>
                <div style={s.panelSub}>×{upgrades.scriptorium}</div>
              </div>
            </div>
          )}
        </div>

        {/* Ground line */}
        <div style={s.groundLine} />

        {/* Stats overlay */}
        <div style={s.statsOverlay}>
          <span style={s.statBadge}>🙏 ×{upgrades.congregation}</span>
          <span style={s.statBadge}>⛪ ×{upgrades.sanctuary}</span>
          {hasSpire && <span style={s.statBadge}>🗼 ×{upgrades.spire}</span>}
          {hasCathedral && <span style={s.statBadge}>🏰 ×{upgrades.cathedral}</span>}
        </div>
      </div>
    </div>
  );
}

function styles(t: EraTheme) {
  const accent = t.accent;
  const dim = t.accentDim;
  const border = t.panelBorder;

  return {
    wrapper: {
      flex: 1,
      position: 'relative' as const,
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'flex-end',
      overflow: 'hidden',
      cursor: 'default',
      minHeight: 280,
    } as React.CSSProperties,

    gridLines: {
      position: 'absolute' as const,
      inset: 0,
      backgroundImage: `linear-gradient(${border}44 1px, transparent 1px), linear-gradient(90deg, ${border}44 1px, transparent 1px)`,
      backgroundSize: '40px 40px',
      opacity: 0.5,
    } as React.CSSProperties,

    sceneContainer: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      position: 'relative' as const,
      zIndex: 1,
      paddingBottom: 20,
    } as React.CSSProperties,

    multisiteRow: {
      display: 'flex',
      gap: 12,
      marginBottom: 12,
      alignItems: 'flex-end',
    } as React.CSSProperties,

    campusBlock: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
    } as React.CSSProperties,

    campusRoof: {
      width: 0,
      height: 0,
      borderLeft: '18px solid transparent',
      borderRight: '18px solid transparent',
      borderBottom: `16px solid ${dim}`,
    } as React.CSSProperties,

    campusBody: {
      width: 36,
      height: 28,
      background: t.panelBg,
      border: `1px solid ${border}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    } as React.CSSProperties,

    buildingRow: {
      display: 'flex',
      alignItems: 'flex-end',
      gap: 8,
      position: 'relative' as const,
    } as React.CSSProperties,

    outreachPanel: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      marginBottom: 0,
    } as React.CSSProperties,

    outreachRoof: {
      width: 0,
      height: 0,
      borderLeft: '30px solid transparent',
      borderRight: '30px solid transparent',
      borderBottom: `22px solid ${dim}88`,
    } as React.CSSProperties,

    outreachBody: {
      width: 60,
      height: 70,
      background: t.panelBg,
      border: `1px solid ${border}`,
      borderTop: `2px solid ${dim}`,
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 6,
    } as React.CSSProperties,

    scriptoriumPanel: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
    } as React.CSSProperties,

    scriptoriumRoof: {
      width: 0,
      height: 0,
      borderLeft: '28px solid transparent',
      borderRight: '28px solid transparent',
      borderBottom: `20px solid ${accent}66`,
    } as React.CSSProperties,

    scriptoriumBody: {
      width: 56,
      height: 66,
      background: t.panelBg,
      border: `1px solid ${border}`,
      borderTop: `2px solid ${accent}66`,
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 4,
    } as React.CSSProperties,

    panelLabel: {
      fontSize: 9,
      color: t.accentText,
      textAlign: 'center' as const,
      fontWeight: 600,
      letterSpacing: '0.05em',
    } as React.CSSProperties,

    panelSub: {
      fontSize: 9,
      color: t.subtext,
      textAlign: 'center' as const,
    } as React.CSSProperties,

    sanctuaryWrapper: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      cursor: 'pointer',
      position: 'relative' as const,
      userSelect: 'none' as const,
      transition: 'filter 0.1s',
    } as React.CSSProperties,

    spireAssembly: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      position: 'relative' as const,
    } as React.CSSProperties,

    spireShaft: {
      width: 4,
      height: 50,
      background: `linear-gradient(to bottom, ${accent}, ${dim})`,
      boxShadow: `0 0 8px ${accent}80`,
    } as React.CSSProperties,

    spireCross: {
      position: 'absolute' as const,
      top: 10,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 20,
      height: 20,
    } as React.CSSProperties,

    crossVert: {
      position: 'absolute' as const,
      width: 3,
      height: 16,
      background: accent,
      boxShadow: `0 0 6px ${accent}`,
    } as React.CSSProperties,

    crossHoriz: {
      position: 'absolute' as const,
      width: 12,
      height: 3,
      background: accent,
      top: 4,
      boxShadow: `0 0 6px ${accent}`,
    } as React.CSSProperties,

    cathedralWing: {
      position: 'absolute' as const,
      bottom: 18,
      width: 36,
      height: 50,
      background: t.panelBg,
      border: `1px solid ${border}`,
      borderTop: `2px solid ${accent}50`,
    } as React.CSSProperties,

    roof: {
      width: 0,
      height: 0,
      borderLeftStyle: 'solid',
      borderRightStyle: 'solid',
      borderBottomStyle: 'solid',
      borderLeftColor: 'transparent',
      borderRightColor: 'transparent',
    } as React.CSSProperties,

    sanctuaryBody: {
      background: t.panelBg,
      border: `2px solid ${accent}`,
      boxShadow: `0 0 20px ${accent}30, inset 0 0 30px ${dim}20`,
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'flex-end',
      position: 'relative' as const,
      overflow: 'hidden',
      padding: 8,
      transition: 'width 0.5s, height 0.5s',
    } as React.CSSProperties,

    dotGrid: {
      position: 'absolute' as const,
      top: 8,
      left: 8,
      right: 8,
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: 4,
    } as React.CSSProperties,

    dot: {
      width: 5,
      height: 5,
      borderRadius: '50%',
      background: accent,
    } as React.CSSProperties,

    archWindow: {
      position: 'absolute' as const,
      top: 12,
      right: 14,
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
    } as React.CSSProperties,

    archTop: {
      width: 14,
      height: 7,
      borderRadius: '7px 7px 0 0',
      background: `${accent}40`,
      border: `1px solid ${accent}80`,
      borderBottom: 'none',
    } as React.CSSProperties,

    archPane: {
      width: 14,
      height: 12,
      background: `${accent}20`,
      border: `1px solid ${accent}80`,
      borderTop: 'none',
    } as React.CSSProperties,

    door: {
      width: 16,
      height: 22,
      background: dim,
      borderRadius: '8px 8px 0 0',
      border: `1px solid ${accent}60`,
      marginBottom: 0,
    } as React.CSSProperties,

    clickHint: {
      position: 'absolute' as const,
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      fontSize: 11,
      color: `${accent}60`,
      fontWeight: 700,
      letterSpacing: '0.1em',
      pointerEvents: 'none' as const,
    } as React.CSSProperties,

    stepBase1: {
      width: '110%',
      height: 6,
      background: dim,
      opacity: 0.7,
    } as React.CSSProperties,

    stepBase2: {
      width: '125%',
      height: 5,
      background: dim,
      opacity: 0.4,
    } as React.CSSProperties,

    groundLine: {
      width: '80%',
      height: 2,
      background: `linear-gradient(90deg, transparent, ${border}, transparent)`,
      marginTop: 2,
    } as React.CSSProperties,

    statsOverlay: {
      display: 'flex',
      gap: 6,
      marginTop: 10,
      flexWrap: 'wrap' as const,
      justifyContent: 'center',
    } as React.CSSProperties,

    statBadge: {
      fontSize: 10,
      background: `${t.panelBg}cc`,
      border: `1px solid ${border}`,
      borderRadius: 4,
      padding: '2px 6px',
      color: t.subtext,
    } as React.CSSProperties,
  };
}
