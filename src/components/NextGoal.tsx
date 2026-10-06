import { ArrowRight, Check } from "lucide-react";
import { rpgMissions } from "../data/rpgCampaign";
import { districts } from "../data/districts";
import { usePlayerNavigation } from "./PlayerNavigation";
import type { GameState } from "../types";

export function NextGoal({ state }: { state: GameState }) {
  const nav = usePlayerNavigation();
  const next = rpgMissions.find(mission => !state.rpg.completed[mission.id]);
  const active = state.rpg.active;
  const district = next && districts.find(entry => entry.id === next.district);
  const following = next && rpgMissions[next.act + 1];
  const reward = following ? "Opens " + districts.find(entry => entry.id === following.district)?.name : "Completes the main story";
  const points = state.rpg.attributePoints + state.rpg.perkPoints;
  const title = !state.rpg.starterClaimed ? "Pick up your starter kit" : active ? "Continue your field mission" : next ? next.title : "The city is open";
  return <section className="next-goal" aria-label="Your next goal">
    <div><p className="eyebrow">YOUR NEXT GOAL{district ? " / " + district.name : ""}</p><h2>{title}</h2>
      <p>{!state.rpg.starterClaimed ? "Open Missions and claim Sable's free weapon, armor, medicine and cyberdeck." : active ? "Your mission is paused until you choose an action. Return when you're ready." : next ? "Prepare local gear, then finish this main job. " + reward + "." : "Replay local gigs, finish district goals and refine your equipment."}</p>
      {nav.openMissions && <button className="primary-button" onClick={nav.openMissions}>{active ? "Return to mission" : !state.rpg.starterClaimed ? "Get starter kit" : "Open missions"}<ArrowRight size={17} /></button>}
    </div>
    <ol className="journey-checklist" aria-label="Preparation checklist">
      <li>{state.rpg.starterClaimed && <Check size={16} />}<span>{state.rpg.starterClaimed ? "Starter kit collected" : "Collect your starter kit"}</span></li>
      <li><span>{points ? points + " attribute / perk points available" : "Review attributes and perks"}</span>{nav.openCharacter && <button onClick={() => nav.openCharacter?.("attributes")}>Review</button>}</li>
      <li><span>Craft gear, then equip it</span>{nav.openCrafting && <button onClick={() => nav.openCrafting?.()}>Crafting</button>}</li>
      <li><span>Main jobs open districts; local gigs fund upgrades</span></li>
    </ol>
  </section>;
}
