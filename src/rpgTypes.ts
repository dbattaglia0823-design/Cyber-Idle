export type AttributeId = "body" | "reflexes" | "intelligence" | "technical" | "cool";
export type MissionApproach = "assault" | "ghost" | "netrunner" | "lifepath";
export type TacticalAction = "attack" | "aim" | "cover" | "hack" | "disrupt" | "burnout" | "heal" | "overclock";
export type GigRisk = "standard" | "dangerous" | "elite";
export interface RpgEncounter {
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
  quickhackVersion?: number;
  quickhackLoadouts?: Record<string, string[]>;
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
