import { items } from "../data/items";
import { rpgMissions, rpgPerks } from "../data/rpgCampaign";
import { districts } from "../data/districts";
import { itemAttributeRequirement } from "../systems/runnerProgression";
import { usePlayerNavigation } from "./PlayerNavigation";
import type { GameState } from "../types";

export function UpcomingUnlocks({ state }: { state: GameState }) {
  const nav = usePlayerNavigation();
  const perk = rpgPerks.filter(p => !state.rpg.perks[p.id]).sort((a,b) =>
    ((a.requires ?? []).filter(id => !state.rpg.perks[id]).length - (b.requires ?? []).filter(id => !state.rpg.perks[id]).length) ||
    (Math.max(0,a.requirement-state.rpg.attributes[a.attribute])-Math.max(0,b.requirement-state.rpg.attributes[b.attribute])) || a.requirement-b.requirement)[0];
  const equipment = items.filter(item => state.inventory[item.id] > 0 && ["Weapon","Armor","Cyberware"].includes(item.type)).map(item => ({ item, req: itemAttributeRequirement(item) })).filter(({req}) => state.rpg.attributes[req.attribute] < req.level).sort((a,b) => (a.req.level-state.rpg.attributes[a.req.attribute])-(b.req.level-state.rpg.attributes[b.req.attribute]))[0];
  const districtIndex = rpgMissions.findIndex((m,index) => index > 0 && !state.districts[m.district]?.unlocked);
  const district = districtIndex > 0 ? districts.find(d => d.id === rpgMissions[districtIndex].district) : undefined;
  const completed = districtIndex > 0 ? rpgMissions.slice(0,districtIndex).filter(m => state.rpg.completed[m.id]).length : 0;
  if (!perk && !equipment && !district) return null;
  return <details className="upcoming-unlocks"><summary>Next unlocks{district ? ` · ${district.name}` : perk ? ` · ${perk.name}` : ""}</summary><div className="unlock-grid">
    {perk && <article><small>PERK</small><strong>{perk.name}</strong><span>{perk.attribute} {state.rpg.attributes[perk.attribute]}/{perk.requirement} · {state.rpg.perkPoints}/1 perk points</span>{perk.requires?.some(id => !state.rpg.perks[id]) && <span>Requires {perk.requires.filter(id => !state.rpg.perks[id]).map(id => rpgPerks.find(p => p.id === id)?.name).join(", ")}</span>}<progress aria-label={`${perk.name} attribute requirement`} max={perk.requirement} value={Math.min(perk.requirement,state.rpg.attributes[perk.attribute])}/><button className="secondary-button" disabled={!nav.openCharacter} onClick={() => nav.openCharacter?.("attributes")}>View perks →</button></article>}
    {equipment && <article><small>OWNED GEAR</small><strong>{equipment.item.name}</strong><span>{equipment.req.label} · Current {state.rpg.attributes[equipment.req.attribute]}</span><progress aria-label={`${equipment.item.name} requirement`} max={equipment.req.level} value={state.rpg.attributes[equipment.req.attribute]}/><button className="secondary-button" disabled={!nav.openCharacter} onClick={() => nav.openCharacter?.("attributes")}>Allocate points →</button></article>}
    {district && <article><small>DISTRICT</small><strong>{district.name}</strong><span>Complete {rpgMissions[districtIndex-1].title}</span><span>{completed}/{districtIndex} preceding main jobs cleared</span><progress aria-label={`${district.name} unlock progress`} max={districtIndex} value={completed}/><button className="secondary-button" disabled={!nav.openMissions} onClick={() => nav.openMissions?.()}>Open missions →</button></article>}
  </div></details>;
}
