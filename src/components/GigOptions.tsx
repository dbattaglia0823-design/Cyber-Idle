import { gigContracts, gigVariants, type GigContractId } from "../data/gigContracts";
import type { GameState } from "../types";
import type { RpgMission } from "../data/rpgCampaign";
export function GigOptions({state,mission,payout,value,onChange}:{state:GameState;mission:RpgMission;payout:number;value:GigContractId;onChange:(value:GigContractId)=>void}){
 const variant=(state.rpg.completed[mission.id]?.clears??0)%3;
 return <section className="gig-contract-options" aria-label="Optional gig contract"><p className="fine">Next patrol: {gigVariants[variant]}</p><label>Optional objective<select value={value} onChange={e=>onChange(e.target.value as GigContractId)}>{Object.entries(gigContracts).map(([id,c])=><option value={id} key={id}>{c.name}</option>)}</select></label>{value!=="none"&&<p>{gigContracts[value].objective} · +{Math.round(payout*.25).toLocaleString()} credits on success. Base rewards are kept if missed.</p>}<small>Unique loot: 5% per clear; guaranteed within {10-(state.rpg.gigDryStreak?.[mission.id]??0)} more clears without a drop.</small></section>;
}
