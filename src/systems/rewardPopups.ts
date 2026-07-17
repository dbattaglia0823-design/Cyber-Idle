import { getItem } from "../data/items";
import { resourceNames } from "../data/resources";
import { skillNames } from "../data/skills";
import type { GameState, RewardBundle, RewardPopupCategory, RewardPopupGroup, RewardPopupLine, SkillId } from "../types";

type RewardPopupInput = {
  title: string;
  category?: RewardPopupCategory;
  xp?: Partial<Record<SkillId, number>>;
  masteryXp?: number;
  poolXp?: number;
  resources?: RewardBundle;
  items?: Record<string, number>;
  rareDrops?: string[];
  blueprints?: string[];
  levelUps?: string[];
  masteryLevelUps?: string[];
  reputation?: Record<string, number>;
  heat?: number;
  neuralInstability?: number;
  warnings?: string[];
  story?: string[];
  achievements?: string[];
  durationMs?: number;
};

const categoryDuration: Record<RewardPopupCategory, number> = {
  xp: 2600,
  mastery: 2600,
  resource: 2600,
  credits: 2600,
  item: 3000,
  rare: 4800,
  blueprint: 5000,
  level: 5000,
  reputation: 3200,
  heat: 3600,
  neural: 3600,
  achievement: 5200,
  story: 4800,
  warning: 4500,
};

export function emitRewardPopupGroup(state: GameState, input: RewardPopupInput) {
  const now = Date.now();
  const lines = compactLines(buildRewardLines(input));
  if (!lines.length && !input.title) return;
  const category = input.category ?? prominentCategory(lines);
  const popup: RewardPopupGroup = {
    id: `reward-${now}-${Math.random().toString(36).slice(2, 8)}`,
    title: input.title,
    category,
    lines: lines.slice(0, 6),
    createdAt: now,
    expiresAt: now + (input.durationMs ?? categoryDuration[category]),
  };
  state.rewardPopups = mergeRecentPopup(state.rewardPopups ?? [], popup).slice(0, 8);
}

export function emitSummaryPopup(state: GameState, title: string, lines: string[], category: RewardPopupCategory = "story") {
  emitRewardPopupGroup(state, {
    title,
    category,
    story: lines.slice(0, 5),
    durationMs: category === "warning" ? 4500 : 5000,
  });
}

function buildRewardLines(input: RewardPopupInput): RewardPopupLine[] {
  const lines: RewardPopupLine[] = [];
  Object.entries(input.xp ?? {}).forEach(([skillId, amount]) => {
    if (!amount) return;
    lines.push(line(`${signed(amount)} ${skillNames[skillId as SkillId]} XP`, "xp", amount));
  });
  if (input.masteryXp) lines.push(line(`${signed(input.masteryXp)} Mastery XP`, "mastery", input.masteryXp));
  if (input.poolXp) lines.push(line(`${signed(input.poolXp)} Mastery Pool XP`, "mastery", input.poolXp));
  Object.entries(input.resources ?? {}).forEach(([id, amount]) => {
    if (!amount) return;
    const category = id === "credits" ? "credits" : id === "heat" ? "heat" : id === "reputation" ? "reputation" : "resource";
    lines.push(line(`${signed(amount)} ${resourceNames[id as keyof typeof resourceNames] ?? id}`, category, amount));
  });
  Object.entries(input.items ?? {}).forEach(([id, amount]) => {
    if (!amount) return;
    const item = getItem(id);
    const category = item?.type === "Blueprint" ? "blueprint" : item?.rarity && ["Rare", "Epic", "Legendary", "Prototype", "Relic"].includes(item.rarity) ? "rare" : "item";
    lines.push(line(`${signed(amount)} ${item?.name ?? id}`, category, amount));
  });
  (input.rareDrops ?? []).forEach((name) => lines.push(line(`Rare Drop: ${name}`, "rare")));
  (input.blueprints ?? []).forEach((name) => lines.push(line(`Blueprint Found: ${name}`, "blueprint")));
  (input.levelUps ?? []).forEach((text) => lines.push(line(`Level Up: ${text}`, "level")));
  (input.masteryLevelUps ?? []).forEach((text) => lines.push(line(`Mastery Level Up: ${text}`, "level")));
  Object.entries(input.reputation ?? {}).forEach(([name, amount]) => {
    if (!amount) return;
    lines.push(line(`${signed(amount)} ${name} Reputation`, "reputation", amount));
  });
  if (input.heat) lines.push(line(`Heat ${signed(input.heat)}`, input.heat > 0 ? "heat" : "resource", input.heat));
  if (input.neuralInstability) lines.push(line(`Neural Instability ${signed(input.neuralInstability)}`, input.neuralInstability > 0 ? "neural" : "resource", input.neuralInstability));
  (input.achievements ?? []).forEach((text) => lines.push(line(`Achievement: ${text}`, "achievement")));
  (input.story ?? []).forEach((text) => lines.push(line(text, input.category ?? "story")));
  (input.warnings ?? []).forEach((text) => lines.push(line(text, "warning")));
  return lines;
}

function compactLines(lines: RewardPopupLine[]) {
  const merged = new Map<string, RewardPopupLine>();
  lines.forEach((entry) => {
    const key = `${entry.category}:${entry.label.replace(/^[-+]\d+ /, "")}`;
    const existing = merged.get(key);
    if (entry.amount === undefined) {
      merged.set(`${key}:${merged.size}`, entry);
      return;
    }
    if (!existing || existing.amount === undefined) {
      merged.set(key, entry);
      return;
    }
    const amount = existing.amount + entry.amount;
    existing.amount = amount;
    existing.label = entry.label.replace(/^[-+]\d+/, signed(amount));
  });
  return [...merged.values()];
}

function prominentCategory(lines: RewardPopupLine[]): RewardPopupCategory {
  const order: RewardPopupCategory[] = ["level", "achievement", "blueprint", "rare", "warning", "neural", "heat", "item", "credits", "resource", "xp", "mastery", "reputation", "story"];
  return order.find((category) => lines.some((line) => line.category === category)) ?? "resource";
}

function mergeRecentPopup(existing: RewardPopupGroup[], popup: RewardPopupGroup) {
  const previous = existing.find((entry) => entry.title === popup.title && popup.createdAt - entry.createdAt < 600);
  if (!previous) return [popup, ...existing.filter((entry) => entry.expiresAt > popup.createdAt)];
  previous.lines = compactLines([...popup.lines, ...previous.lines]).slice(0, 6);
  previous.category = prominentCategory(previous.lines);
  previous.expiresAt = Math.max(previous.expiresAt, popup.expiresAt);
  return [...existing];
}

function line(label: string, category: RewardPopupCategory, amount?: number): RewardPopupLine {
  return {
    id: `${category}-${label}`,
    label,
    category,
    amount,
  };
}

function signed(value: number) {
  return `${value > 0 ? "+" : ""}${value}`;
}
