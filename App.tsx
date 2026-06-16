import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { GameState, UpgradeId, TraditionId, SubTraditionId, StaffTypeId } from './src/ecclesia/gameTypes';
import { ERA_THEMES, UPGRADES, TRADITIONS, STAFF_DEFS, TICK_INTERVAL_MS, HIRE_COST_BASE } from './src/ecclesia/gameConstants';
import {
  calcUpgradeCost, calcBulkCost, calcPassiveKI, resolveEra, initialGameState, formatKI
} from './src/ecclesia/gameEngine';
import { EraHeader } from './src/ecclesia/components/EraHeader';
import { MilestoneBar } from './src/ecclesia/components/MilestoneBar';
import { BlueprintGrid } from './src/ecclesia/components/BlueprintGrid';
import { UpgradePanel } from './src/ecclesia/components/UpgradePanel';
import { DenomTree } from './src/ecclesia/components/DenomTree';
import { MinistryRoster } from './src/ecclesia/components/MinistryRoster';

let _nextStaffId = 1;
function newStaffId() { return String(_nextStaffId++); }

export default function App() {
  const [gs, setGs] = useState<GameState>(() => initialGameState());
  const [notif, setNotif] = useState<string | null>(null);
  const notifTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevEra = useRef(gs.currentEra);

  const theme = ERA_THEMES[gs.currentEra];

  // --- Passive tick ---
  useEffect(() => {
    const interval = setInterval(() => {
      setGs(prev => {
        const passive = calcPassiveKI(prev);
        const newKI = prev.ki + passive;
        const newLifetime = prev.lifetimeKI + passive;
        const newEra = resolveEra(newLifetime);
        return {
          ...prev,
          ki: newKI,
          lifetimeKI: newLifetime,
          passiveKI: passive,
          currentEra: newEra,
          tick: prev.tick + 1,
        };
      });
    }, TICK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  // --- Era transition notification ---
  useEffect(() => {
    if (gs.currentEra !== prevEra.current) {
      const t = ERA_THEMES[gs.currentEra];
      showNotif(`✠ New Era Unlocked: ${t.name}`);
      prevEra.current = gs.currentEra;
    }
  }, [gs.currentEra]);

  function showNotif(msg: string) {
    setNotif(msg);
    if (notifTimer.current) clearTimeout(notifTimer.current);
    notifTimer.current = setTimeout(() => setNotif(null), 3500);
  }

  // --- Manual click ---
  const handleManualKI = useCallback(() => {
    const clickPower = Math.max(1, gs.passiveKI * 0.1 + 1);
    setGs(prev => ({
      ...prev,
      ki: prev.ki + clickPower,
      lifetimeKI: prev.lifetimeKI + clickPower,
    }));
  }, [gs.passiveKI]);

  // --- Buy upgrade ---
  const handleBuy = useCallback((id: UpgradeId, qty: number) => {
    setGs(prev => {
      const def = UPGRADES.find(u => u.id === id)!;
      const cost = qty === 1
        ? calcUpgradeCost(def.baseCost, prev.upgrades[id])
        : calcBulkCost(def.baseCost, prev.upgrades[id], qty);

      if (prev.ki < cost) return prev;

      const newUpgrades = { ...prev.upgrades, [id]: prev.upgrades[id] + qty };
      const newKI = prev.ki - cost;
      const newPassive = calcPassiveKI({ ...prev, ki: newKI, upgrades: newUpgrades });

      return { ...prev, ki: newKI, upgrades: newUpgrades, passiveKI: newPassive };
    });
  }, []);

  // --- Tradition select ---
  const handleSelectTradition = useCallback((id: TraditionId) => {
    setGs(prev => ({ ...prev, tradition: id, subTradition: null }));
  }, []);

  const handleSelectSubTradition = useCallback((id: SubTraditionId) => {
    setGs(prev => ({ ...prev, subTradition: id }));
    const branch = TRADITIONS.flatMap(t => t.branches).find(b => b.id === id);
    if (branch) showNotif(`Tradition path chosen: ${branch.name}`);
  }, []);

  // --- Hire / Fire staff ---
  const handleHire = useCallback((typeId: StaffTypeId) => {
    setGs(prev => {
      if (prev.staff.length >= 3) return prev;
      if (prev.ki < HIRE_COST_BASE) return prev;
      const alreadyHired = prev.staff.some(m => m.typeId === typeId);
      if (alreadyHired) return prev;
      const newStaff = [...prev.staff, { id: newStaffId(), typeId, hiredAt: prev.tick }];
      return { ...prev, ki: prev.ki - HIRE_COST_BASE, staff: newStaff };
    });
    const def = STAFF_DEFS.find(d => d.id === typeId)!;
    showNotif(`${def.emoji} ${def.name} joined the ministry!`);
  }, []);

  const handleFire = useCallback((memberId: string) => {
    setGs(prev => ({
      ...prev,
      staff: prev.staff.filter(m => m.id !== memberId),
    }));
  }, []);

  const t = theme;

  return (
    <div style={{
      minHeight: '100vh',
      background: t.bg,
      color: t.text,
      fontFamily: '"Inter", system-ui, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      transition: 'background 1.2s, color 0.6s',
    }}>
      {/* Top notification banner */}
      {notif && (
        <div style={{
          position: 'fixed',
          top: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 100,
          background: t.badgeBg,
          border: `1px solid ${t.accent}`,
          borderRadius: 8,
          padding: '8px 20px',
          fontSize: 13,
          fontWeight: 700,
          color: t.badgeText,
          boxShadow: `0 4px 24px ${t.accent}50`,
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          letterSpacing: '0.03em',
        }}>
          {notif}
        </div>
      )}

      <EraHeader
        theme={t}
        ki={gs.ki}
        lifetimeKI={gs.lifetimeKI}
        passiveKI={gs.passiveKI}
      />

      <MilestoneBar
        theme={t}
        currentEra={gs.currentEra}
        lifetimeKI={gs.lifetimeKI}
      />

      {/* Main 3-column layout */}
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '220px 1fr 260px',
        overflow: 'hidden',
        minHeight: 0,
      }}>
        {/* Left panel: Denom Tree + Ministry Roster */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          borderRight: `1px solid ${t.panelBorder}`,
          overflow: 'hidden',
          background: `${t.panelBg}cc`,
        }}>
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <DenomTree
              theme={t}
              state={gs}
              onSelectTradition={handleSelectTradition}
              onSelectSubTradition={handleSelectSubTradition}
            />
          </div>
          <MinistryRoster
            theme={t}
            state={gs}
            onHire={handleHire}
            onFire={handleFire}
          />
        </div>

        {/* Center: Blueprint Grid */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
        }}>
          <BlueprintGrid
            theme={t}
            state={gs}
            onManualKI={handleManualKI}
          />

          {/* Click prompt at bottom */}
          <div style={{
            textAlign: 'center',
            padding: '8px',
            fontSize: 10,
            color: t.subtext,
            letterSpacing: '0.1em',
            borderTop: `1px solid ${t.panelBorder}`,
            background: `${t.panelBg}88`,
          }}>
            CLICK SANCTUARY TO GENERATE MANUAL KI · UPGRADES EARN PASSIVE KI/s
          </div>
        </div>

        {/* Right panel: Upgrades */}
        <div style={{
          borderLeft: `1px solid ${t.panelBorder}`,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          background: `${t.panelBg}cc`,
        }}>
          <UpgradePanel
            theme={t}
            state={gs}
            onBuy={handleBuy}
          />
        </div>
      </div>
    </div>
  );
}
