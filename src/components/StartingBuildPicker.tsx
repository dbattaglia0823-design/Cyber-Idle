import { startingBuilds, applyStartingBuild } from "../systems/rpgSystem";
import { attributeDefinitions } from "../data/rpgCampaign";
import type { GameState } from "../types";
export function StartingBuildPicker({state,onUpdate,onCustomize}:{state:GameState;onUpdate:(fn:(s:GameState)=>GameState)=>void;onCustomize:()=>void}) {
  return <section className="starting-build-picker" aria-label="Choose a starting build"><h3>Choose your starting build</h3><div className="starting-build-options">{Object.entries(startingBuilds).map(([id,build])=><button className="secondary-button" key={id} disabled={Boolean(state.rpg.active)} onClick={()=>onUpdate(s=>applyStartingBuild(s,id as keyof typeof startingBuilds))}><strong>{build.name}</strong><span>{attributeDefinitions.filter(a=>build.points[a.id]>0).map(a=>a.name+" +"+build.points[a.id]).join(" · ")}</span></button>)}</div><button className="rpg-text-button" onClick={onCustomize}>Customize points</button><p className="fine">Uses 7 points · Free refunds outside missions</p></section>;
}
