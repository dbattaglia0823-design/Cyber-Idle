import { ICONIC_DROP_CHANCE } from "../systems/bossIconicLoot";
import { bossIconics } from "../data/bossIconics";
import { weaponClasses } from "../data/weaponClasses";
import type { GameState } from "../types";
export function BossIconicPreview({state,missionId}:{state:GameState;missionId:string}) {
 const defs=bossIconics.filter(def=>def.mission===missionId);
 if(!defs.length)return null;
 const progress=state.rpg.bossIconicProgress?.[missionId];
 const recovered=defs.filter(def=>progress?.acquired[def.id]||(state.inventory[def.id]??0)>0).length;
 return <details className="boss-iconic-preview"><summary>★ Possible Iconic rewards · {recovered}/2 recovered</summary>
  <small>{defs[0].boss} · first victory or boss rematch</small>
  <div>{defs.map(def=>{
   const known=!!state.discoveredItems[def.id]||!!progress?.acquired[def.id];
   return <div className={`boss-iconic-row ${known?"known":"unknown"}`} key={def.id}><span aria-hidden="true">{known?"★":"◆"}</span><span><strong>{known?def.name:"Unknown Iconic"}</strong><small>{weaponClasses.find(c=>c.id===def.category)?.name}{known?" · "+def.ability:" · defeat this boss to discover"}</small></span>{progress?.acquired[def.id]&&<b>✓</b>}</div>;
  })}</div>
  <small>{recovered===2?"Both Iconics recovered. Repeat rewards cannot duplicate them.":`Possible, not guaranteed: ${ICONIC_DROP_CHANCE*100}% total per victory (${ICONIC_DROP_CHANCE*100/(2-recovered)}% per missing weapon). No guaranteed drops or bad-luck protection. Failed fights do not count.`}</small>
 </details>;
}
