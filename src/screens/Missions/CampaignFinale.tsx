import { rpgMissions } from "../../data/rpgCampaign";
import { campaignEpilogue } from "../../systems/rpgSystem";
import type { GameState } from "../../types";
export const endingNames: Record<string, string> = { free: "A City of Voices", own: "The New Sovereign", erase: "A Beautiful Silence" };
export function CampaignFinale({ state }: { state: GameState }) {
 if (!state.rpg.ending) return null;
 return <section className="campaign-finale" aria-label="Campaign ending"><p className="eyebrow">AFTERIMAGE / CAMPAIGN COMPLETE</p><h2>{endingNames[state.rpg.ending] ?? "Your city. Your legacy."}</h2><p>{campaignEpilogue(state)}</p><p className="finale-score">{rpgMissions.filter(m => state.rpg.completed[m.id]).length} / 8 main jobs completed</p><details><summary>Your decisions across the city</summary><ol>{rpgMissions.map(mission => { const outcome = state.rpg.completed[mission.id]?.outcome; return <li key={mission.id}><strong>{mission.title}</strong><span>{mission.choices.find(choice => choice.id === outcome)?.label ?? "Not completed"}</span></li>; })}</ol></details><p className="fine">Your save continues. Revisit districts, craft remaining equipment and replay local gigs. Your ending and story decisions stay recorded.</p></section>;
}
