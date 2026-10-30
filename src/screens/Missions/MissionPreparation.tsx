import { mainJobBalance } from "../../data/mainJobBalance";
import { recipes } from "../../data/recipes";
import { getItem } from "../../data/items";
import { usePlayerNavigation } from "../../components/PlayerNavigation";
import { equippedDeck, installedQuickhacks, deckCapacity } from "../../systems/quickhackSystem";
import { calculateMaxHP } from "../../systems/healthSystem";
import { fieldInjectorCount } from "../../systems/rpgSystem";
import type { GameState } from "../../types";
import type { RpgMission } from "../../data/rpgCampaign";
export function MissionPreparation({ state, mission }: { state: GameState; mission: RpgMission }) {
  const nav = usePlayerNavigation(), profile = mainJobBalance[mission.district];
  const weapon = getItem(state.equippedGear.weapon ?? ""), armor = getItem(state.equippedGear.chest ?? "");
  const deck = equippedDeck(state), hacks = installedQuickhacks(state);
  const points = state.rpg.attributePoints + state.rpg.perkPoints;
  const checks = [
    { label: "Weapon", value: weapon?.name ?? "Unarmed", missing: !weapon, section: "gear" as const },
    { label: "Chest armor", value: armor?.name ?? "None equipped", missing: !armor, section: "gear" as const },
    { label: "Cyberdeck", value: deck?.name ?? "None equipped", missing: !deck, section: "quickhacks" as const },
    { label: "Quickhacks", value: hacks.length ? hacks.map(h => h.name).join(", ") : "None installed", missing: !hacks.length, section: "quickhacks" as const },
  ];
  return <section className="mission-preparation" aria-label="Mission preparation">
    <div className="preparation-heading"><strong>Deployment loadout</strong><span className={checks.some(c => c.missing) ? "prep-warning" : "prep-ready"}>{checks.some(c => c.missing) ? "Preparation gaps" : "Loadout ready"}</span></div>
    <div className="preparation-grid">{checks.map(check => <button key={check.label} className={`preparation-check ${check.missing ? "missing" : "ready"}`} disabled={!nav.openCharacter} onClick={() => nav.openCharacter?.(check.section)}><small>{check.label}</small><strong>{check.value}</strong><span>{check.missing ? "Equip →" : "Manage →"}</span></button>)}</div>
    <p className="fine">Deploy with {calculateMaxHP(state)} HP · {fieldInjectorCount(state)} injectors · {hacks.length}/{deckCapacity(deck)} program slots</p>
    {points > 0 && <button className="secondary-button" disabled={!nav.openCharacter} onClick={() => nav.openCharacter?.("attributes")}>{points} unspent points →</button>}
    <details><summary>Suggested local gear · optional</summary><div className="journey-actions">{[profile.weapon, profile.armor].map(id => { const recipe = recipes.find(entry => entry.outputItemId === id); return recipe && <button key={id} className="secondary-button" disabled={!nav.openCrafting} onClick={() => nav.openCrafting?.(recipe.id)}>{getItem(id)?.name} recipe →</button>; })}</div></details>
  </section>;
}
