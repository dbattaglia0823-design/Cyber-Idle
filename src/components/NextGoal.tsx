import { recipes } from "../data/recipes";
import { mainJobBalance } from "../data/mainJobBalance";
import { getItem } from "../data/items";
import { skillNames } from "../data/skills";
import { ArrowRight } from "lucide-react";
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
  const suggestedRecipe = recipes.find(recipe => recipe.outputItemId === mainJobBalance.neonRow.weapon);
  const points = state.rpg.attributePoints + state.rpg.perkPoints;
  const content = {
    kit: ["Pick up your starter kit", "Sable has a free weapon, armor, medicine and cyberdeck for you. Claim them in Missions.", "Get starter kit"],
    attributes: ["Make your first attribute choice", "You have starting points to spend. Body improves survivability, Reflexes helps weapons, and Intelligence supports quickhacks. You can refund points between missions.", "Spend starting points"],
    equipment: ["Equip your weapon and armor", "Owned gear only helps when equipped. Select an item in your inventory, check its requirements, then choose Equip.", "Open equipment"],
    prepare: ["Prepare for the first boss", "The field kit gets you started. Craft and upgrade repeatable gear such as " + (getItem(mainJobBalance.neonRow.weapon)?.name ?? "a local weapon") + " before Dead Drop. Review armor and perks too." + (suggestedRecipe ? " Its recipe needs " + skillNames[suggestedRecipe.requiredSkill] + " " + suggestedRecipe.requiredLevel + "; tap missing materials to find sources." : ""), "View suggested recipe"],
    mission: [next?.title ?? "Your next main job", "Prepare local gear, then complete this main job." + (districtName ? " Unlocks " + districtName + "." : " Finish the main story."), "Open missions"],
    briefing: ["Choose your way in", "Assault is always available. Other approaches depend on your attributes or lifepath.", "Return to briefing"],
    combat: ["Your next move is waiting", "Read the enemy intent. Use cover against a charged burst and field injectors when health is low.", "Return to mission"],
    decision: ["Area clear. Collect your rewards", "Choose how the job ends to receive your payout and advance the story. Main-job choices are permanent.", "Finish the job"],
    failed: ["Regroup and try again", "No credits or equipment were lost. Retry with restored health or leave to improve your loadout.", "Review mission"],
    complete: ["The city is open", "Replay local gigs, finish optional district goals and refine your equipment.", "Open missions"],
  }[step];
  const action = step === "prepare" ? () => nav.openCrafting?.(suggestedRecipe?.id) : step === "attributes" ? () => nav.openCharacter?.("attributes") : step === "equipment" ? () => nav.openCharacter?.("gear") : nav.openMissions;
  return <section className="next-goal" aria-label="Your next goal">
    <div><p className="eyebrow">YOUR NEXT GOAL</p><h2>{content[0]}</h2><p>{content[1]}</p>
      {action && <button className="primary-button" onClick={action}>{content[2]}<ArrowRight size={17} /></button>}
      {(step === "attributes" || step === "equipment" || step === "prepare") && nav.openMissions && <button className="journey-skip" onClick={nav.openMissions}>Go to missions</button>}
    </div>
    <details className="journey-preparation"><summary>Prepare for the next job{points > 0 ? " / " + points + " points available" : ""}</summary>
      <ol className="journey-checklist">
        <li><span>{state.rpg.starterClaimed ? "Starter kit collected" : "Collect your free field kit"}</span></li>
        <li><span>Attributes and perks improve your character</span><button onClick={() => nav.openCharacter?.("attributes")}>Review</button></li>
        <li><span>Craft upgrades, then equip them</span><button onClick={() => nav.openCrafting?.()}>Crafting</button><button onClick={() => nav.openCharacter?.("gear")}>Equipment</button></li>
        <li><span>Main jobs open districts. Local gigs earn credits. Skill training is long-term preparation.</span></li>
      </ol>
    </details>
  </section>;
}
