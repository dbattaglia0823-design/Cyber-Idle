import { ArrowDown, ArrowUp, ListOrdered, Play, Trash2 } from "lucide-react";
import { getRecipe, pauseCraftQueue, resumeCraftQueue } from "../systems/craftingProcessing";
import { clearCraftQueue, MAX_CRAFT_QUEUE, moveQueuedCraft, removeQueuedCraft } from "../systems/craftQueue";
import { ownedMaterial } from "../systems/craftAutomation";
import { scaledCraftingCosts } from "../systems/craftingCosts";
import { getItem } from "../data/items";
import { resourceNames } from "../data/resources";
import type { GameState } from "../types";

type Update = (fn: (state: GameState) => GameState) => void;
const label = (id: string) => getItem(id)?.name ?? resourceNames[id as keyof typeof resourceNames] ?? id;
const quantityLabel = (amount?: number) => amount ? `Make ${amount} items` : "Repeat until inputs run out";

export function CraftQueuePanel({ state, onUpdate, compact = false }: { state: GameState; onUpdate: Update; compact?: boolean }) {
  const queue = state.craftQueue;
  const current = state.activeCraft;
  const blocked = queue.blockedCraft;
  const activeRecipe = current && getRecipe(current.recipeId);
  const missing = blocked && getRecipe(blocked.recipeId);
  const waiting = !current && !blocked && queue.entries[0] && getRecipe(queue.entries[0].recipeId);
  const waitingRecipe = missing ?? waiting;
  const missingInputs = waitingRecipe
    ? Object.entries(scaledCraftingCosts(state, waitingRecipe)).filter(([id, count]) => ownedMaterial(state, id) < count)
    : [];
  return <section className={compact ? "craft-recipe-queue compact" : "craft-recipe-queue"} aria-label="Crafting queue">
    <div className="craft-queue-heading">
      <div><p className="eyebrow">BACKGROUND PRODUCTION</p><h3><ListOrdered size={17}/> Crafting queue</h3></div>
      <small>{queue.entries.length} / {MAX_CRAFT_QUEUE} upcoming</small>
    </div>
    {current && <div className="craft-queue-current"><strong>Crafting now: {activeRecipe?.name ?? current.recipeId}</strong>
      <small>{current.targetQuantity ? `${current.completedQuantity ?? 0} / ${current.targetQuantity} produced` : "Continuous crafting"} · {queue.paused ? "Upcoming queue paused" : "Next recipe starts automatically"}</small>
    </div>}
    {!current && blocked && <p className="craft-queue-warning">Current recipe paused: {getRecipe(blocked.recipeId)?.name ?? blocked.recipeId}{blocked.targetQuantity ? ` · ${blocked.completedQuantity ?? 0}/${blocked.targetQuantity} complete` : ""}. Resume when ready.</p>}
    {!current && !blocked && queue.entries.length > 0 && <p className="fine">No craft running. Resume to start the next queued recipe.</p>}
    {queue.entries.length > 0 && <ol className="craft-queue-entries">{queue.entries.map((entry, index) => <li key={entry.id}>
      <div><span className="craft-queue-index">{index + 1}</span><strong>{getRecipe(entry.recipeId)?.name ?? entry.recipeId}</strong><small>{quantityLabel(entry.targetQuantity)} · {entry.reserveMaterials ? "Protect ingredients" : "No ingredient reserve"}</small></div>
      {!compact && <div className="craft-queue-buttons">
        <button type="button" aria-label={`Move ${getRecipe(entry.recipeId)?.name ?? entry.recipeId} earlier`} disabled={index === 0} onClick={() => onUpdate(s => moveQueuedCraft(s, entry.id, -1))}><ArrowUp size={15}/></button>
        <button type="button" aria-label={`Move ${getRecipe(entry.recipeId)?.name ?? entry.recipeId} later`} disabled={index === queue.entries.length - 1} onClick={() => onUpdate(s => moveQueuedCraft(s, entry.id, 1))}><ArrowDown size={15}/></button>
        <button type="button" aria-label={`Remove ${getRecipe(entry.recipeId)?.name ?? entry.recipeId} from crafting queue`} onClick={() => onUpdate(s => removeQueuedCraft(s, entry.id))}><Trash2 size={15}/></button>
      </div>}
    </li>)}</ol>}
    {!compact && queue.message && <p className="fine craft-queue-message" role="status">{queue.message}</p>}
    {!compact && missingInputs.length > 0 && <p className="craft-queue-warning">Missing for next craft: {missingInputs.map(([id, count]) => `${label(id)} ${ownedMaterial(state,id)}/${count}`).join(" · ")}</p>}
    <div className="craft-queue-controls">
      {queue.paused && (queue.entries.length > 0 || blocked) && !current &&
        <button type="button" className="primary-button" onClick={() => onUpdate(s => resumeCraftQueue(s))}><Play size={15}/> Resume crafting queue</button>}
      {!queue.paused && current && queue.entries.length > 0 &&
        <button type="button" className="secondary-button" onClick={() => onUpdate(pauseCraftQueue)}>Pause upcoming queue</button>}
      {!current && !queue.paused && queue.entries.length > 0 &&
        <button type="button" className="primary-button" onClick={() => onUpdate(s => resumeCraftQueue(s))}>Start next craft</button>}
      {!compact && (queue.entries.length > 0 || blocked) &&
        <button type="button" className="secondary-button" onClick={() => onUpdate(clearCraftQueue)}>Clear upcoming</button>}
    </div>
    {!compact && <p className="fine">Queued recipes run one at a time, alongside skills and missions. Targets advance when complete; continuous recipes advance when materials run out. Missing materials pause the queue, preserving unfinished targets.</p>}
  </section>;
}
