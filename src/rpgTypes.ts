export interface IconicCombatMemory { weaponId: string; hits: number; guard?: number; weakHits?: number; ramWard?: boolean; heals?: number; marked?: boolean; retaliation?: boolean; momentum?: number; tempoCharges?: number; burnDamage?: number; burnTicks?: number }
export interface BossIconicProgress { victories: number; dryStreak: number; acquired: Record<string, boolean> }
export type AttributeId = "body" | "reflexes" | "intelligence" | "technical" | "cool";
export type MissionApproach = "assault" | "ghost" | "netrunner" | "lifepath";
export type TacticalAction = "attack" | "aim" | "cover" | "hack" | "disrupt" | "burnout" | "heal" | "overclock" | `quickhack:${string}`;
export type GigRisk = "standard" | "dangerous" | "elite";
export interface RpgEncounter {
  bossReplay?: boolean;
  iconicMemory?: IconicCombatMemory;
  gigVariant?: number;
  contract?: { id: "none" | "clean" | "precision" | "disruption"; injectors: number; interrupts: number; aimedHits: number };
  feedback?: { damage: number; taken: number; blocked: number; healing: number; interrupted: boolean; target?: string; defeated?: boolean; action: string };
  playerBleedTurns?: number;
  playerBleedDamage?: number;
  burnDamage?: number;
  burnTurns?: number;
  weaken?: number;
  weakenTurns?: number;
  gigRisk?: GigRisk;
  missionId: string;
  phase: "briefing" | "combat" | "decision" | "failed";
  approach: MissionApproach | null;
  enemyIndex: number;
  enemyHp: number;
  enemyMaxHp: number;
  turn: number;
  ram: number;
  meds: number;
  aimed: boolean;
  log: string[];
}
export interface RpgState {
  iconicLootSeed?: number;
  bossIconicProgress?: Record<string, BossIconicProgress>;
  activityXpFraction?: number;
  gigDryStreak?: Record<string, number>;
  quickhackVersion?: number;
  quickhackLoadouts?: Record<string, string[]>;
  campaignXpVersion?: number;
  attributeProgressionVersion?: number;
  level: number;
  xp: number;
  attributes: Record<AttributeId, number>;
  attributePoints: number;
  perkPoints: number;
  perks: Record<string, boolean>;
  completed: Record<string, { outcome: string; approach: MissionApproach; clears: number }>;
  active: RpgEncounter | null;
  ending: string | null;
  streetCred: number;
  starterClaimed: boolean;
}
