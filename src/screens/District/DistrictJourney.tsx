import { districtEncounterProfiles } from "../../data/tacticalTraits";
import { rpgMissions } from "../../data/rpgCampaign";
import { districts } from "../../data/districts";
import { districtPresentation } from "../../data/districtPresentation";
import { usePlayerNavigation } from "../../components/PlayerNavigation";
import type { DistrictId, GameState } from "../../types";
export function DistrictJourney({ state, districtId }: { state: GameState; districtId: DistrictId }) {
 const nav = usePlayerNavigation();
 const mission = rpgMissions.find(entry => entry.district === districtId)!;
 const done = Boolean(state.rpg.completed[mission.id]);
 const next = rpgMissions[mission.act + 1];
 const destination = next && districts.find(entry => entry.id === next.district);
 return <section className="district-journey" aria-label="District story goal">
  <p className="eyebrow">{districtPresentation[districtId].focus} / {done ? "MAIN JOB COMPLETE" : "STORY PROGRESSION"}</p>
  <h2>{done ? mission.title + " completed" : mission.title}</h2>
  <p>{done ? destination ? destination.name + " is open. You can move on now or stay for optional activities." : "The main story is complete. Local gigs and training remain available." : mission.objective}</p>
  <p className="district-lesson"><strong>Local tactics:</strong> {districtEncounterProfiles[districtId].lesson}</p><div className="journey-actions">{done && destination && state.districts[destination.id]?.unlocked ? <button className="primary-button" onClick={() => nav.openDistrict?.(destination.id)}>Explore {destination.name}</button> : <button className="primary-button" onClick={nav.openMissions}>{state.rpg.starterClaimed ? "Open main jobs" : "Get starter kit"}</button>}<button className="secondary-button" onClick={() => nav.openCrafting?.()}>Prepare gear</button></div>
  <p className="fine">{!done && destination ? "Complete this main job to unlock " + destination.name + ". " : ""}Skills, local gigs and district mastery are optional preparation, not story gates.</p>
 </section>;
}
