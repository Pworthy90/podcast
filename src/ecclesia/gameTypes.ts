export type EraId = 'apostolic' | 'monastic' | 'reformation' | 'modern';
export type TraditionId = 'liturgical' | 'reformation_trad' | 'heritage';
export type SubTraditionId =
  | 'orthodox' | 'catholic'
  | 'reformed' | 'methodist'
  | 'blackchurch' | 'pentecostal';
export type UpgradeId = 'congregation' | 'sanctuary' | 'spire' | 'scriptorium' | 'outreach' | 'cathedral' | 'multisite';
export type StaffTypeId = 'choirmaster' | 'intern' | 'organizer' | 'chronicler';

export interface EraTheme {
  id: EraId;
  name: string;
  subtitle: string;
  bg: string;
  panelBg: string;
  panelBorder: string;
  accent: string;
  accentDim: string;
  accentText: string;
  text: string;
  subtext: string;
  badgeBg: string;
  badgeText: string;
  progressFill: string;
  lifetimeKIRequired: number | null;
}

export interface UpgradeDef {
  id: UpgradeId;
  name: string;
  emoji: string;
  baseCost: number;
  passivePerUnit: number;
  desc: string;
  eraRequired: EraId;
}

export interface TraditionBranch {
  id: SubTraditionId;
  name: string;
  bonus: string;
  multipliers: Partial<Record<UpgradeId, number>>;
  passiveBonus: number;
}

export interface TraditionDef {
  id: TraditionId;
  name: string;
  emoji: string;
  desc: string;
  eraRequired: EraId;
  branches: TraditionBranch[];
}

export interface StaffDef {
  id: StaffTypeId;
  name: string;
  emoji: string;
  costPerTick: number;
  multipliers: Partial<Record<UpgradeId, number>>;
  desc: string;
}

export interface StaffMember {
  id: string;
  typeId: StaffTypeId;
  hiredAt: number;
}

export interface GameState {
  ki: number;
  lifetimeKI: number;
  passiveKI: number;
  currentEra: EraId;
  tradition: TraditionId | null;
  subTradition: SubTraditionId | null;
  upgrades: Record<UpgradeId, number>;
  staff: StaffMember[];
  tick: number;
  lastMilestoneNotif: string | null;
}
