import { useEffect, useState } from "react";
import { PauseCircle, Play, PackageCheck, Hammer, Zap, ShieldCheck, ClipboardList, AlertTriangle } from "lucide-react";
import { IdleQueuePanel } from "./IdleQueuePanel";
import { getSkillAction, stopSkillAction } from "../systems/actionProcessing";
import { canCraft, startCraft, stopCraft } from "../systems/craftingProcessing";
import { craftTargetStatus, MAX_CRAFT_TARGET, ownedMaterial } from "../systems/craftAutomation";
import { planPreset, planRecipeSupplies, installSupplyPlan, smartPresetCatalog, type SmartPresetId } from "../systems/smartAutomation";
import { startIdleQueue, pauseIdleQueue } from "../systems/idleQueue";
import { stopCombat, getEnemy } from "../systems/combatProcessing";
import { recipes } from "../data/recipes";
import { getItem } from "../data/items";
import { resourceNames } from "../data/resources";
import { missionById } from "../systems/rpgSystem";
import { usePlayerNavigation } from "./PlayerNavigation";
import type { GameState } from "../types";

type Update = (fn:(state:GameState)=>GameState)=>void;
const itemLabel = (id:string)=>getItem(id)?.name ?? resourceNames[id as keyof typeof resourceNames] ?? id;
const progress = (now:number,at:number,duration:number)=>Math.max(0,Math.min(100,Math.round((now-at)/Math.max(1,duration)*100)));

export function ActivityCenter({ state, onUpdate, onMissions }: { state:GameState; onUpdate:Update; onMissions:()=>void }) {
  const navigation=usePlayerNavigation();
  const [recipeId,setRecipeId]=useState("recipe-basic-med-injector");
  const [quantity,setQuantity]=useState(10);
  const [reserve,setReserve]=useState(true);
  const [planKind,setPlanKind]=useState<"preset"|"recipe">("preset");
  const [presetId,setPresetId]=useState<SmartPresetId>("upgrades");
  useEffect(()=>{
    const requested=navigation.activityRecipeId;
    if(requested && recipes.some(recipe=>recipe.id===requested)){
      setRecipeId(requested);setPlanKind("recipe");
      if (navigation.activityRecipeQuantity && Number.isSafeInteger(navigation.activityRecipeQuantity) && navigation.activityRecipeQuantity<=MAX_CRAFT_TARGET) setQuantity(navigation.activityRecipeQuantity);
    }
  },[navigation.activityRecipeRequest]);
  const selected=recipes.find(recipe=>recipe.id===recipeId)??recipes[0];
  const craft=craftTargetStatus(state);
  const queue=state.idleQueue;
  const currentStep=queue.steps[queue.index];
  const skill=state.activeAction&&getSkillAction(state.activeAction.actionId);
  const enemy=state.currentCombat&&getEnemy(state.currentCombat.enemyId);
  const mission=state.rpg.active&&missionById(state.rpg.active.missionId);
  const now=Date.now();
  const chosenQuantity=Number.isSafeInteger(quantity)&&quantity>=1&&quantity<=MAX_CRAFT_TARGET ? quantity : 0;
  const plan=planKind==="preset" ? planPreset(state,presetId) : planRecipeSupplies(state,selected.id,chosenQuantity);
  const craftable=canCraft(state,selected);
  const currentTarget=currentStep ? itemLabel(currentStep.targetId)+" "+Math.min(currentStep.targetAmount,ownedMaterial(state,currentStep.targetId)).toLocaleString()+" / "+currentStep.targetAmount.toLocaleString() : "";
  return <section className="activity-center" aria-label="Activity Center">
    <header className="activity-center-heading">
      <div><p className="eyebrow">RUNNER OPERATIONS</p><h1>Activity Center</h1><p className="fine">Manage skill work, background crafting and supply targets from one place.</p></div>
      <span className="activity-center-live">{mission?"MISSION":queue.enabled?"QUEUE RUNNING":state.activeAction||state.activeCraft||state.currentCombat?"WORKING":"READY"}</span>
    </header>
    <div className="activity-center-lanes">
      <article className="activity-lane">
        <div className="activity-lane-title"><span><Zap size={17}/> Foreground activity</span><b>{mission?"Manual":queue.enabled?"Automated":skill||enemy?"Active":"Idle"}</b></div>
        <h2>{mission?.title??skill?.name??enemy?.name??"No foreground activity"}</h2>
        <p className="fine">{mission?"Field mission: "+state.rpg.active?.phase:skill?skill.skillId+" training":enemy?"Street Combat":"Choose a skill or start a queue"}</p>
        {state.activeAction&&<div className="activity-meter"><span style={{width:progress(now,state.activeAction.startedAt,state.activeAction.durationMs)+"%"}}/></div>}
        {queue.steps.length>0&&<div className="activity-lane-status"><strong>Queue: {queue.enabled?"Running":queue.index>=queue.steps.length?"Complete":"Paused"} · {Math.min(queue.index+1,queue.steps.length)}/{queue.steps.length}</strong><small>{currentTarget||queue.message}</small></div>}
        <div className="activity-center-actions">
          {mission ? <button type="button" className="primary-button" onClick={onMissions}>Return to mission</button> :
           queue.enabled ? <button type="button" className="secondary-button" onClick={()=>onUpdate(s=>pauseIdleQueue(s))}><PauseCircle size={15}/> Pause queue</button> :
           queue.steps.length>0 ? <button type="button" className="secondary-button" disabled={Boolean(state.currentCombat)} onClick={()=>onUpdate(s=>startIdleQueue(s))}><Play size={15}/> {queue.index>0&&queue.index<queue.steps.length?"Resume queue":"Start queue"}</button> : null}
          {state.activeAction&&<button type="button" className="secondary-button" onClick={()=>onUpdate(stopSkillAction)}>Stop skill</button>}
          {state.currentCombat&&<button type="button" className="secondary-button" onClick={()=>onUpdate(stopCombat)}>Stop combat</button>}
          <button type="button" className="secondary-button" onClick={()=>navigation.openDistrict?.(state.selectedDistrict ?? "neonRow","actions")}>Find skill work</button>
        </div>
      </article>
      <article className="activity-lane">
        <div className="activity-lane-title"><span><Hammer size={17}/> Background crafting</span><b>{craft?"Active":"Idle"}</b></div>
        <h2>{craft?.recipe.name??"No recipe running"}</h2>
        <p className="fine">{craft?.total ? Math.min(craft.completed,craft.total)+"/"+craft.total+" crafted · "+craft.remainingCycles+" cycles remaining" : craft?"Repeats until ingredients run out":"Craft while skills and missions continue."}</p>
        {state.activeCraft&&<div className="activity-meter"><span style={{width:progress(now,state.activeCraft.startedAt,state.activeCraft.durationMs)+"%"}}/></div>}
        {craft&&<div className="activity-lane-status"><ShieldCheck size={15}/> {state.activeCraft?.reserveMaterials?"Ingredients protected from skill spending":"Ingredient protection disabled"}{Object.keys(craft.reserves).length>0&&<small>{Object.entries(craft.reserves).map(([id,n])=>n+" "+itemLabel(id)).join(" · ")}</small>}</div>}
        <div className="activity-center-actions">
          {state.activeCraft&&<button type="button" className="secondary-button" onClick={()=>onUpdate(stopCraft)}>Stop crafting only</button>}
          <button type="button" className="secondary-button" onClick={()=>navigation.openCrafting?.(craft?.recipe.id)}>Browse recipes</button>
        </div>
      </article>
    </div>
    <div className="activity-center-tools">
      <article className="activity-center-tool">
        <div className="activity-tool-heading"><div><p className="eyebrow">CRAFTING CONTROLS</p><h2>Set a crafting target</h2></div><PackageCheck size={18}/></div>
        <div className="activity-control-fields">
          <label>Recipe<select aria-label="Activity Center recipe" value={selected.id} onChange={e=>{setRecipeId(e.target.value);setPlanKind("recipe")}}>{recipes.map(recipe=><option key={recipe.id} value={recipe.id}>{recipe.name}</option>)}</select></label>
          <label>Items to craft<input aria-label="Craft target quantity" type="number" min={1} max={MAX_CRAFT_TARGET} value={quantity} onChange={e=>setQuantity(Number(e.target.value))}/></label>
        </div>
        <label className="activity-check"><input aria-label="Protect crafting ingredients" type="checkbox" checked={reserve} onChange={e=>setReserve(e.target.checked)}/> Protect ingredients needed for this target from automatic skill spending</label>
        <p className="fine">{selected.outputQuantity} items per craft · {chosenQuantity ? Math.ceil(chosenQuantity/selected.outputQuantity):"—"} cycles. {craftable?"First cycle is affordable.":"Missing materials or recipe unlock; review supply plan below."}</p>
        <div className="activity-center-actions">
          <button type="button" className="primary-button" disabled={!chosenQuantity||!craftable} onClick={()=>onUpdate(s=>startCraft(s,selected.id,Date.now(),chosenQuantity,reserve))}>{state.activeCraft?"Replace background craft":"Start targeted craft"}</button>
          <button type="button" className="secondary-button" onClick={()=>setPlanKind("recipe")}>Review missing materials</button>
        </div>
      </article>
      <article className="activity-center-tool">
        <div className="activity-tool-heading"><div><p className="eyebrow">SMART AUTOMATION</p><h2>Suggested supply queues</h2></div><ClipboardList size={18}/></div>
        <div className="activity-preset-buttons">{smartPresetCatalog.map(p=><button type="button" aria-pressed={planKind==="preset"&&presetId===p.id} className={planKind==="preset"&&presetId===p.id?"selected":""} key={p.id} onClick={()=>{setPlanKind("preset");setPresetId(p.id)}}>{p.title}</button>)}<button type="button" aria-pressed={planKind==="recipe"} className={planKind==="recipe"?"selected":""} onClick={()=>setPlanKind("recipe")}>Selected recipe</button></div>
        <h3>{plan.title}</h3><p className="fine">Preview only. Review every step before applying it to your queue.</p>
        <div className="activity-plan-preview">
          {plan.requested.map(entry=><div key={entry.id}><strong>{itemLabel(entry.id)}</strong><small>{Math.min(entry.owned,entry.target).toLocaleString()} / {entry.target.toLocaleString()}</small></div>)}
          {plan.steps.map((step,i)=><div key={i}><span>Step {i+1}: {getSkillAction(step.actionId)?.name}</span><small>Target {step.targetAmount.toLocaleString()} {itemLabel(step.targetId)} · max {step.maxCycles} runs</small></div>)}
          {!plan.steps.length&&<p className="fine">No eligible additional skill gathering needed.</p>}
        </div>
        {plan.unavailable.length>0&&<div className="activity-plan-warning"><AlertTriangle size={15}/><div><strong>Requires manual sourcing</strong>{plan.unavailable.map((entry,i)=><p key={i}>{itemLabel(entry.id)}: {entry.reason}</p>)}</div></div>}
        {queue.steps.length>0&&<p className="fine">Applying replaces the existing {queue.steps.length} queue steps; running automation cannot be replaced.</p>}
        <button type="button" className="primary-button" disabled={queue.enabled||!plan.steps.length} onClick={()=>onUpdate(s=>installSupplyPlan(s,plan))}>Use reviewed plan</button>
      </article>
    </div>
    <IdleQueuePanel state={state} onUpdate={onUpdate}/>
  </section>;
}
