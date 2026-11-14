import { useState } from "react";
import { skillActions, skillNames } from "../data/skills";
import { getItem } from "../data/items";
import { resourceNames } from "../data/resources";
import { recipes } from "../data/recipes";
import { addIdleQueueStep, idleQueueOwned, idleQueueTargets, MAX_IDLE_QUEUE_STEPS, MAX_IDLE_QUEUE_RUNS, moveIdleQueueStep, pauseIdleQueue, removeIdleQueueStep, resetIdleQueue, setIdleQueueHeatLimit, startIdleQueue } from "../systems/idleQueue";
import { stopCraft } from "../systems/craftingProcessing";
import type { GameState } from "../types";

const targetName = (id: string) => getItem(id)?.name ?? resourceNames[id as keyof typeof resourceNames] ?? id;

export function IdleQueuePanel({ state, onUpdate }: { state: GameState; onUpdate: (update: (current: GameState) => GameState) => void }) {
  const queue = state.idleQueue;
  const [actionId, setActionId] = useState("scav-alley-scrap-run");
  const [targetId, setTargetId] = useState("");
  const [targetAmount, setTargetAmount] = useState(50);
  const [maxCycles, setMaxCycles] = useState(200);
  const available = skillActions.filter(action =>
    (!action.districtReq || state.districts[action.districtReq]?.unlocked) && idleQueueTargets(action).length > 0);
  const action = available.find(entry => entry.id === actionId) ?? available[0];
  const outputs = action ? idleQueueTargets(action) : [];
  const target = outputs.includes(targetId) ? targetId : outputs[0] ?? "";
  const craft = state.activeCraft && recipes.find(recipe => recipe.id === state.activeCraft?.recipeId);
  const activeStep = queue.steps[queue.index];
  return <details className="idle-queue-panel">
    <summary>
      <span><strong>Idle activity queue</strong><small>{queue.enabled ? `Running · step ${queue.index + 1}/${queue.steps.length}` : queue.steps.length ? `${queue.steps.length} steps configured · paused` : "Build a sequence of resource targets"}{craft ? ` · Background craft: ${craft.name}` : ""}</small></span>
      <span className="idle-queue-status">{queue.enabled ? "RUNNING" : "CONFIGURE"}</span>
    </summary>
    <div className="idle-queue-content">
      <p className="fine">Queue up to {MAX_IDLE_QUEUE_STEPS} skill actions. Each runs until its resource or item stock reaches the absolute target, then switches to the next action. The queue stops on locked work, missing inputs, high Heat, or the per-step run limit. Manually starting another foreground activity pauses automation.</p>
      <section className="idle-background-craft" aria-label="Background crafting status">
        <strong>Independent crafting</strong>
        {craft && state.activeCraft
          ? <><p>{craft.name} · {Math.max(0, Math.min(100, Math.round((Date.now() - state.activeCraft.startedAt) / Math.max(1, state.activeCraft.durationMs) * 100)))}% of current craft cycle. Continues during skill work, combat, and missions.</p><button type="button" className="secondary-button" onClick={() => onUpdate(stopCraft)}>Stop crafting only</button></>
          : <p>No active craft. Start any recipe from Crafting; it will run alongside this queue and other activities.</p>}
      </section>
      {queue.message && <p className="idle-queue-message" role="status">{queue.message}</p>}
      <div className="idle-queue-steps">
        {queue.steps.map((step, index) => {
          const item = skillActions.find(a => a.id === step.actionId);
          const owned = idleQueueOwned(state, step.targetId);
          return <article key={step.id} className={queue.enabled && queue.index === index ? "current" : ""}>
            <div><span className="idle-queue-step-number">{index + 1}</span><strong>{item?.name ?? step.actionId}</strong><small>{targetName(step.targetId)} · {Math.min(owned,step.targetAmount).toLocaleString()} / {step.targetAmount.toLocaleString()} · {step.cycles}/{step.maxCycles} runs</small></div>
            <div className="idle-queue-step-buttons">
              <button type="button" disabled={queue.enabled || index === 0} aria-label={`Move ${item?.name ?? step.actionId} earlier`} onClick={() => onUpdate(state => moveIdleQueueStep(state,step.id,-1))}>↑</button>
              <button type="button" disabled={queue.enabled || index === queue.steps.length - 1} aria-label={`Move ${item?.name ?? step.actionId} later`} onClick={() => onUpdate(state => moveIdleQueueStep(state,step.id,1))}>↓</button>
              <button type="button" disabled={queue.enabled} aria-label={`Remove ${item?.name ?? step.actionId}`} onClick={() => onUpdate(state => removeIdleQueueStep(state,step.id))}>×</button>
            </div>
          </article>;
        })}
        {!queue.steps.length && <p className="fine">No steps yet. Add your first activity below.</p>}
      </div>
      <div className="idle-queue-builder">
        <label>Skill action<select aria-label="Queued skill action" value={action?.id ?? ""} disabled={queue.enabled || !available.length} onChange={e => {setActionId(e.target.value);setTargetId("");}}>
          {available.map(a => <option key={a.id} value={a.id}>{skillNames[a.skillId]} · {a.name} {state.skills[a.skillId].level < a.levelReq ? "(locked)" : ""}</option>)}
        </select></label>
        <label>Stock target<select aria-label="Queued resource target" value={target} disabled={queue.enabled || !target} onChange={e => setTargetId(e.target.value)}>
          {outputs.map(id => <option key={id} value={id}>{targetName(id)} · owned {idleQueueOwned(state,id).toLocaleString()}</option>)}
        </select></label>
        <label>Target amount<input aria-label="Queue target amount" type="number" min={1} max={1_000_000_000} step={1} value={targetAmount} disabled={queue.enabled} onChange={e => setTargetAmount(Number(e.target.value))} /></label>
        <label>Maximum cycles<input aria-label="Maximum queue cycles" type="number" min={1} max={MAX_IDLE_QUEUE_RUNS} step={1} value={maxCycles} disabled={queue.enabled} onChange={e => setMaxCycles(Number(e.target.value))} /></label>
        <button type="button" className="secondary-button" disabled={queue.enabled || queue.steps.length >= MAX_IDLE_QUEUE_STEPS || !action || !target || !Number.isSafeInteger(targetAmount) || targetAmount < 1 || !Number.isSafeInteger(maxCycles) || maxCycles < 1 || maxCycles > MAX_IDLE_QUEUE_RUNS} onClick={() => onUpdate(state => addIdleQueueStep(state, action.id, target, targetAmount, maxCycles))}>Add queue step</button>
      </div>
      <div className="idle-queue-controls">
        <label>Heat safety stop <strong>{queue.heatLimit}</strong><input aria-label="Queue Heat safety threshold" type="range" min={10} max={99} step={5} value={queue.heatLimit} onChange={e => onUpdate(state => setIdleQueueHeatLimit(state,Number(e.target.value)))} /></label>
        {queue.enabled ? <button type="button" className="primary-button" onClick={() => onUpdate(state => pauseIdleQueue(state))}>Pause queue</button> : <button type="button" className="primary-button" disabled={!queue.steps.length} onClick={() => onUpdate(state => startIdleQueue(state))}>{queue.index > 0 && queue.index < queue.steps.length ? "Resume queue" : "Start queue"}</button>}
        <button type="button" className="secondary-button" disabled={queue.enabled || !queue.steps.length} onClick={() => onUpdate(resetIdleQueue)}>Reset progress</button>
      </div>
      <p className="fine">A paused queue leaves its current skill working. Crafting continues independently until stopped or its next craft cannot afford materials. Offline automation obeys the normal time cap.</p>
    </div>
  </details>;
}
