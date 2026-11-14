import { getItem } from "../data/items";
import { calculatePlayerCombatStats } from "../systems/balanceFormulas";
import { equippedArmorSetProgress, armorSetIdentity, weaponClassIdentity } from "../systems/equipmentIdentity";
import { tacticalStats } from "../systems/rpgSystem";
import type { GameState, GearSlot, CyberwareSlot } from "../types";

export interface BuildSnapshot {
  idleDps: number;
  maxHp: number;
  armor: number;
  fieldDamage: number;
  fieldMitigation: number;
}

// Calculate complete, actual-loadout output. Never mutate player state or
// overwrite the equipped item in a save just to display a comparison.
export function buildSnapshot(state: GameState): BuildSnapshot {
  const idle = calculatePlayerCombatStats(state), field = tacticalStats(state);
  return {
    idleDps: idle.damage * 1000 / idle.attackSpeedMs,
    maxHp: idle.maxHp,
    armor: idle.armor,
    fieldDamage: field.damage,
    fieldMitigation: field.mitigation * 100,
  };
}
export function withPreviewEquipped(state: GameState, itemId: string): GameState {
  const item = getItem(itemId);
  if (item?.type === "Weapon" || item?.type === "Armor") {
    return { ...state, equippedGear: { ...state.equippedGear, [item.slot as GearSlot]: itemId } };
  }
  if (item?.type === "Cyberware") {
    return { ...state, equippedCyberware: { ...state.equippedCyberware, [item.slot as CyberwareSlot]: itemId } };
  }
  return state;
}

const metrics: Array<{ key: keyof BuildSnapshot; label: string; unit: string; precision: number }> = [
  { key: "idleDps", label: "Idle DPS", unit: "", precision: 1 },
  { key: "fieldDamage", label: "Field hit", unit: "", precision: 0 },
  { key: "maxHp", label: "Maximum HP", unit: "", precision: 0 },
  { key: "armor", label: "Armor", unit: "", precision: 0 },
  { key: "fieldMitigation", label: "Field mitigation", unit: "%", precision: 1 },
];
const display = (n: number, precision: number) => Number(n.toFixed(precision)).toLocaleString();

function SnapshotDifference({ before, after }: { before: BuildSnapshot; after: BuildSnapshot }) {
  return <div className="equipment-impact-grid">{metrics.map(metric => {
    const delta = after[metric.key] - before[metric.key];
    const neutral = Math.abs(delta) < Math.pow(10, -metric.precision) / 2;
    return <span key={metric.key}><small>{metric.label}</small><strong>{display(after[metric.key], metric.precision)}{metric.unit}</strong><em className={neutral ? "same" : delta > 0 ? "better" : "worse"}>{neutral ? "No change" : `${delta > 0 ? "+" : ""}${display(delta, metric.precision)}${metric.unit}`}</em></span>;
  })}</div>;
}

export function EquipmentImpact({ state, itemId }: { state: GameState; itemId: string }) {
  const item = getItem(itemId);
  if (!item || !["Armor", "Weapon", "Cyberware"].includes(item.type)) return null;
  const preview = withPreviewEquipped(state, itemId);
  const original = equippedArmorSetProgress(state), after = equippedArmorSetProgress(preview);
  const set = item.type === "Armor" ? after.find(entry => entry.name === item.setName) : undefined;
  const previousCount = original.find(entry => entry.name === item.setName)?.count ?? 0;
  return <section className="equipment-impact" aria-label="Equipment build comparison">
    <h3>Build comparison</h3><p className="fine">Projected if equipped instead of your current {item.type.toLowerCase()} in this slot. Idle DPS is estimated before enemy defenses; field hit uses current weapon and build.</p>
    <SnapshotDifference before={buildSnapshot(state)} after={buildSnapshot(preview)} />
    {set && <p className="equipment-set-preview"><strong>{set.name}: {previousCount}/5 → {set.count}/5</strong> · {set.identity}{set.nextTier && ` · next bonus at ${set.nextTier} pieces`}</p>}
  </section>;
}

export function EquipmentUpgradeImpact({ state, itemId }: { state: GameState; itemId: string }) {
  const level = state.upgradeLevels[itemId] ?? 0;
  const item = getItem(itemId);
  if (!item || level >= (item.maxUpgradeLevel ?? 0)) return null;
  const equipped = [...Object.values(state.equippedGear), ...Object.values(state.equippedCyberware)].includes(itemId);
  if (!equipped) return <p className="fine">Equip this item to see its effect on overall combat statistics; the stat table above previews this item's next upgrade.</p>;
  const projected = { ...state, upgradeLevels: { ...state.upgradeLevels, [itemId]: level + 1 } };
  return <section className="equipment-impact" aria-label="Upgrade build comparison">
    <h3>Equipped build impact</h3>
    <SnapshotDifference before={buildSnapshot(state)} after={buildSnapshot(projected)} />
  </section>;
}

export function ArmorSetStatus({ state, itemId }: { state: GameState; itemId?: string }) {
  const selected = itemId && getItem(itemId)?.setName;
  const equipped = equippedArmorSetProgress(state);
  const selectedName = selected && selected in armorSetIdentity ? selected as keyof typeof armorSetIdentity : undefined;
  const names = [...new Set([...equipped.map(x => x.name), ...(selectedName ? [selectedName] : [])])];
  if (!names.length) return null;
  return <section className="equipment-set-list" aria-label="Armor set bonuses">
    <h3>Armor set bonuses</h3>
    {names.map(name => {
      const count = equipped.find(x => x.name === name)?.count ?? 0;
      const profile = armorSetIdentity[name];
      const tiers = [[2, "2 pieces", profile.two], [3, "3 pieces", profile.three], [5, "5 pieces", profile.five]] as const;
      return <article className="equipment-set-row" key={name}>
        <strong>{name} · {count}/5 equipped</strong><small>{profile.identity}</small>
        <div>{tiers.map(([tier, label, modifiers]) => <span className={count >= tier ? "set-active" : "set-locked"} key={tier}>
          <b>{label} {count >= tier ? "ACTIVE" : "LOCKED"}</b>
          <small>{formatSetBonuses(modifiers)}</small>
        </span>)}</div>
      </article>;
    })}
  </section>;
}
function formatSetBonuses(modifiers: Record<string, unknown>) {
  const names: Record<string, string> = { combatDamage: "damage", combatDefense: "defense", combatAttackSpeed: "attack speed", combatMaxHp: "HP", dodgeChance: "dodge", damageReduction: "damage reduction", healingReceived: "healing", heatGain: "Heat gained" };
  return Object.entries(modifiers).map(([key, value]) => `${Number(value) > 0 ? "+" : ""}${Number((Number(value) * 100).toFixed(1))}% ${names[key] ?? key}`).join(" · ");
}

export function WeaponTuningStatus({ state, itemId }: { state: GameState; itemId: string }) {
  const item = getItem(itemId);
  if (item?.type !== "Weapon" || !item.weaponClass) return null;
  const level = state.upgradeLevels[itemId] ?? 0;
  const profile = weaponClassIdentity[item.weaponClass];
  const stages = [
    { required: 3, title: profile.name, detail: profile.description },
    { required: 6, title: "Reinforced tuning", detail: "+1.2% combat damage" },
    { required: 9, title: "Perfected tuning", detail: "+1.2% attack speed" },
  ];
  return <section className="weapon-tuning-status" aria-label="Weapon upgrade identities">
    <h3>{profile.name} · Weapon tuning</h3>
    <p className="fine">Upgrades use existing materials and Technical requirements. Effects apply while this weapon is equipped.</p>
    {stages.map(stage => <p key={stage.required} className={level >= stage.required ? "tuning-active" : "tuning-locked"}>
      <strong>+{stage.required} {stage.title} {level >= stage.required ? "ACTIVE" : "LOCKED"}</strong>
      <small>{stage.detail}</small>
    </p>)}
  </section>;
}
