import { districtEncounterProfiles } from "../data/tacticalTraits";
import { recipes } from "../data/recipes";
import { mainJobBalance } from "../data/mainJobBalance";
import { getItem } from "../data/items";

import { ArrowRight, Crosshair, Shield, Cpu, HeartPulse } from "lucide-react";
import { rpgMissions } from "../data/rpgCampaign";
import { districts } from "../data/districts";
import { usePlayerNavigation } from "./PlayerNavigation";
import { playerJourneyStep } from "../screens/Start/playerJourney";
import type { GameState } from "../types";
export function NextGoal({ state }: { state: GameState }) {
  const nav = usePlayerNavigation();
  const step = playerJourneyStep(state);
  const next = rpgMissions.find(mission => !state.rpg.completed[mission.id]);
  const nextDistrict = next && rpgMissions[next.act + 1]?.district;
  const districtName = districts.find(d => d.id === nextDistrict)?.name;
  const suggestedRecipe = recipes.find(recipe => recipe.outputItemId === mainJobBalance[next?.district ?? "neonRow"].weapon);
  const firstJob = !state.rpg.completed[rpgMissions[0].id];
  const starterWeapon = state.equippedGear.weapon === "rpg-weapon-0";

  const content = {
    kit: ["Pick up your starter kit", "Your free gear is ready.", "Get starter kit"],
    attributes: ["Choose your starting build", "Starter gear equipped. Pick a build or assign your 7 points.", "Choose a build"],
    equipment: ["Equip your weapon and armor", "Select gear, then tap Equip.", "Open equipment"],
    mission: [next?.title ?? "Your next main job", firstJob ? "Your kit is ready. Try the first mission or a Neon Row gig for supplies and first-clear runner XP. Craft stronger equipment if you need it; retries are free." : (next ? districtEncounterProfiles[next.district].lesson : "Prepare local gear, then complete this main job.") + (districtName ? " Unlocks " + districtName + "." : " Finish the main story."), "Open missions"],
    briefing: ["Choose your way in", "Assault is always available. Other approaches depend on your attributes or lifepath.", "Return to briefing"],
    combat: ["Your next move is waiting", "Read the enemy intent. Use cover against a charged burst and field injectors when health is low.", "Return to mission"],
    decision: ["Area clear. Collect your rewards", "Choose how the job ends to receive your payout and advance the story. Main-job choices are permanent.", "Finish the job"],
    failed: ["Regroup and try again", "No credits or equipment were lost. Retry with restored health or leave to improve your loadout.", "Review mission"],
    complete: ["The city is open", "Replay local gigs, finish optional district goals and refine your equipment.", "Open missions"],
  }[step];
  const action = step === "attributes" ? () => nav.openCharacter?.("attributes") : step === "equipment" ? () => nav.openCharacter?.("gear") : nav.openMissions;
  return <section className="next-goal" aria-label="Your next goal">
    <div>{step === "attributes" && <div className="starter-gear-receipt" aria-label="Starter kit received"><span><Crosshair size={16}/>Sidearm</span><span><Shield size={16}/>Armor</span><span><Cpu size={16}/>Cyberdeck</span><span><HeartPulse size={16}/>5 injectors</span></div>}<p className="eyebrow">YOUR NEXT GOAL</p><h2>{content[0]}</h2><p>{content[1]}</p>
      {action && <button className="primary-button" onClick={action}>{content[2]}<ArrowRight size={17} /></button>}
      {(step === "attributes" || step === "equipment") && nav.openMissions && <button className="journey-skip" onClick={nav.openMissions}>Go to missions</button>}
      {step === "mission" && firstJob && starterWeapon && nav.openCrafting && suggestedRecipe && <button className="journey-skip" onClick={() => nav.openCrafting?.(suggestedRecipe.id)}>Optional: craft {getItem(mainJobBalance.neonRow.weapon)?.name ?? "a rifle"}</button>}
    </div>
  </section>;
}
