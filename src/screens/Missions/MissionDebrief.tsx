import { CampaignFinale } from "./CampaignFinale";
import { useState } from "react";
import { recipes } from "../../data/recipes";
import { getItem } from "../../data/items";
import { districts } from "../../data/districts";
import { rpgMissions } from "../../data/rpgCampaign";
import { missionById } from "../../systems/rpgSystem";
import { usePlayerNavigation } from "../../components/PlayerNavigation";
import type { GameState } from "../../types";
export function MissionDebrief({ before, after, onContinue }: { before: GameState; after: GameState; onContinue: () => void }) {
 const nav = usePlayerNavigation();
 // Keep this receipt stable if background world updates or later spending occur.
 const [settled] = useState(after);
 after = settled;
 const available = (state: GameState, recipe: typeof recipes[number]) => state.skills[recipe.requiredSkill].level >= recipe.requiredLevel && (!recipe.requiredDistrict || state.districts[recipe.requiredDistrict]?.unlocked) && (!recipe.requiredBlueprint || state.unlockedBlueprints[recipe.requiredBlueprint]);
 const newlyAvailable = recipes.filter(recipe => available(after, recipe) && !available(before, recipe));
 const mission = missionById(before.rpg.active!.missionId)!;
 const result = after.rpg.completed[mission.id];
 const next = !mission.sideGig && rpgMissions[mission.act + 1];
 const district = next && districts.find(d => d.id === next.district);
 const loot = Object.entries(after.inventory).map(([id, count]) => ({ id, count: count - (before.inventory[id] ?? 0) })).filter(entry => entry.count > 0);
 const levels = after.rpg.level - before.rpg.level;
 return <section className="mission-debrief" aria-label="Mission rewards" tabIndex={-1}>
  <p className="eyebrow">{mission.sideGig ? "GIG COMPLETE" : "BOSS DEFEATED / MAIN JOB COMPLETE"}</p><h2>{mission.title}</h2>
  <p>{mission.choices.find(choice => choice.id === result?.outcome)?.response}</p>
  {!mission.sideGig && mission.act === 7 && <CampaignFinale state={after} />}
  <div className="debrief-rewards"><div><span>Credits received</span><strong>+{(after.resources.credits - before.resources.credits).toLocaleString()}</strong></div><div><span>Character XP</span><strong>+{before.rpg.completed[mission.id] ? Math.round(mission.xp * .5) : mission.xp}</strong></div>{levels > 0 && <div><span>Runner level {after.rpg.level}</span><strong>+{levels * 2} attribute / +{levels} perk points</strong></div>}</div>

  {district && <div className="district-unlocked"><p className="eyebrow">DISTRICT UNLOCKED</p><h3>{district.name}</h3><p>Your main job opened the route. Your previous districts remain available for training, crafting and local gigs.</p></div>}
  <div className="journey-actions">{district && nav.openDistrict && <button className="primary-button" onClick={() => nav.openDistrict?.(district.id)}>Explore {district.name}</button>}<button className={district ? "secondary-button" : "primary-button"} onClick={onContinue}>{mission.sideGig ? "Back to local gigs" : next ? "Next main job" : "Review your ending"}</button>{levels > 0 && nav.openCharacter && <button className="secondary-button" onClick={() => nav.openCharacter?.("attributes")}>Spend new points</button>}</div>
  {loot.length > 0 && <details className="debrief-loot"><summary>Added to inventory / {loot.length} item types</summary><div>{loot.map(({id,count}) => <span key={id} className={"rarity-" + (getItem(id)?.rarity ?? "Common").toLowerCase()}>{getItem(id)?.name ?? id} <b>+{count}</b></span>)}</div></details>}
  {newlyAvailable.length > 0 && <details className="debrief-recipes"><summary>{newlyAvailable.length} new recipes available to inspect</summary><p>Material costs still apply. Open a recipe to see what you need.</p><div className="journey-actions">{newlyAvailable.map(recipe => <button className="secondary-button" key={recipe.id} onClick={() => nav.openCrafting?.(recipe.id)}>{recipe.name}</button>)}</div></details>}
 </section>;
}
