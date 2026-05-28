import type { GameState, UpgradeId, EraId, StaffTypeId } from './gameTypes';
import { ERA_ORDER, ERA_THEMES, UPGRADES, TRADITIONS, STAFF_DEFS } from './gameConstants';

export function calcUpgradeCost(baseCost: number, owned: number): number {
  return Math.ceil(baseCost * Math.pow(1.15, owned));
}

export function calcBulkCost(baseCost: number, owned: number, qty: number): number {
  let total = 0;
  for (let i = 0; i < qty; i++) {
    total += calcUpgradeCost(baseCost, owned + i);
  }
  return total;
}

export function calcPassiveKI(state: GameState): number {
  const { upgrades, staff, subTradition } = state;

  // Per-upgrade base passive
  let total = 0;

  for (const def of UPGRADES) {
    const qty = upgrades[def.id] ?? 0;
    if (qty === 0) continue;

    let perUnit = def.passivePerUnit;

    // Apply sub-tradition multiplier
    if (subTradition) {
      const branch = findBranch(subTradition);
      if (branch?.multipliers[def.id]) {
        perUnit *= branch.multipliers[def.id]!;
      }
    }

    // Apply staff multipliers (stack multiplicatively)
    for (const member of staff) {
      const staffDef = STAFF_DEFS.find(s => s.id === member.typeId);
      if (staffDef?.multipliers[def.id]) {
        perUnit *= staffDef.multipliers[def.id]!;
      }
    }

    total += qty * perUnit;
  }

  // Subtract staff upkeep
  const staffUpkeep = staff.reduce((sum, m) => {
    const def = STAFF_DEFS.find(s => s.id === m.typeId);
    return sum + (def?.costPerTick ?? 0);
  }, 0);

  return Math.max(0, total - staffUpkeep);
}

export function calcUpgradePassive(upgradeId: UpgradeId, qty: number, state: GameState): number {
  if (qty === 0) return 0;
  const def = UPGRADES.find(u => u.id === upgradeId);
  if (!def) return 0;

  let perUnit = def.passivePerUnit;

  if (state.subTradition) {
    const branch = findBranch(state.subTradition);
    if (branch?.multipliers[upgradeId]) perUnit *= branch.multipliers[upgradeId]!;
  }

  for (const member of state.staff) {
    const staffDef = STAFF_DEFS.find(s => s.id === member.typeId);
    if (staffDef?.multipliers[upgradeId]) perUnit *= staffDef.multipliers[upgradeId]!;
  }

  return qty * perUnit;
}

export function resolveEra(lifetimeKI: number): EraId {
  if (lifetimeKI >= 500000) return 'modern';
  if (lifetimeKI >= 50000) return 'reformation';
  if (lifetimeKI >= 5000) return 'monastic';
  return 'apostolic';
}

export function eraIndex(eraId: EraId): number {
  return ERA_ORDER.indexOf(eraId);
}

export function isEraUnlocked(eraId: EraId, lifetimeKI: number): boolean {
  const req = ERA_THEMES[eraId].lifetimeKIRequired;
  if (req === null) return lifetimeKI >= 500000;
  return lifetimeKI >= req;
}

export function nextEraProgress(currentEra: EraId, lifetimeKI: number): { pct: number; nextName: string | null; needed: number } {
  const idx = eraIndex(currentEra);
  const nextEra = ERA_ORDER[idx + 1];
  if (!nextEra) return { pct: 100, nextName: null, needed: 0 };

  const nextTheme = ERA_THEMES[nextEra];
  const req = nextTheme.lifetimeKIRequired ?? 0;
  const prevReq = ERA_THEMES[currentEra].lifetimeKIRequired ?? 0;
  const range = req - prevReq;
  const progress = lifetimeKI - prevReq;
  const pct = Math.min(100, Math.max(0, (progress / range) * 100));
  return { pct, nextName: nextTheme.name, needed: Math.max(0, req - lifetimeKI) };
}

export function findBranch(subTradId: import('./gameTypes').SubTraditionId) {
  for (const trad of TRADITIONS) {
    const branch = trad.branches.find(b => b.id === subTradId);
    if (branch) return branch;
  }
  return null;
}

export function isUpgradeAvailable(upgradeId: UpgradeId, currentEra: EraId): boolean {
  const def = UPGRADES.find(u => u.id === upgradeId);
  if (!def) return false;
  return eraIndex(currentEra) >= eraIndex(def.eraRequired);
}

export function formatKI(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return Math.floor(n).toString();
}

export function initialGameState(): GameState {
  return {
    ki: 0,
    lifetimeKI: 0,
    passiveKI: 0,
    currentEra: 'apostolic',
    tradition: null,
    subTradition: null,
    upgrades: {
      congregation: 0,
      sanctuary: 0,
      spire: 0,
      scriptorium: 0,
      outreach: 0,
      cathedral: 0,
      multisite: 0,
    },
    staff: [],
    tick: 0,
    lastMilestoneNotif: null,
  };
}
