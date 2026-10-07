import { mainJobBalance } from "../../data/mainJobBalance";
import { districtEncounterProfiles } from "../../data/tacticalTraits";
import { recipes } from "../../data/recipes";
import { getItem } from "../../data/items";
import { usePlayerNavigation } from "../../components/PlayerNavigation";
import type { GameState } from "../../types";
import type { RpgMission } from "../../data/rpgCampaign";
export function MissionPreparation({ state, mission }: { state: GameState; mission: RpgMission }) {
 const nav = usePlayerNavigation();
 const profile = mainJobBalance[mission.district];
 return <section className="mission-preparation" aria-label="Mission preparation"><strong>{mission.sideGig ? "Optional local gig" : "Before you deploy"}</strong>
 <p>{districtEncounterProfiles[mission.district].lesson}</p>
 <p>{state.equippedGear.weapon && state.equippedGear.chest ? "Weapon and armor equipped." : "Equip a weapon and chest armor."} {state.rpg.attributePoints + state.rpg.perkPoints > 0 ? "You have unspent attribute or perk points." : "Your points are allocated."}</p>
 <div className="journey-actions">{[profile.weapon,profile.armor].map(id => { const recipe = recipes.find(entry => entry.outputItemId === id); return recipe && <button key={id} className="secondary-button" onClick={() => nav.openCrafting?.(recipe.id)}>Recipe: {getItem(id)?.name}</button>; })}<button className="secondary-button" onClick={() => nav.openCharacter?.("gear")}>Review equipment</button><button className="secondary-button" onClick={() => nav.openCharacter?.("attributes")}>Attributes &amp; perks</button></div>
 <p className="fine">Suggested local gear, not an entry requirement. Comparable equipment works too. {mission.sideGig ? "Gigs rotate local materials and credits without advancing the story." : "Main jobs open the next district; training and gigs help you prepare."}</p>
 </section>;
}
