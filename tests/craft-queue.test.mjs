import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createInitialState } from "../src/systems/gameState.ts";
import { startCraft, stopCraft, enqueueCraft, processCrafting, pauseCraftQueue, resumeCraftQueue } from "../src/systems/craftingProcessing.ts";
import { addQueuedCraft, removeQueuedCraft, moveQueuedCraft, clearCraftQueue, MAX_CRAFT_QUEUE } from "../src/systems/craftQueue.ts";
import { startSkillAction } from "../src/systems/actionProcessing.ts";
import { processParallelWork } from "../src/systems/parallelWork.ts";
import { applyOfflineProgress } from "../src/systems/offlineProgress.ts";
import { normalizeSave } from "../src/systems/saveSystem.ts";
import { CraftQueuePanel } from "../src/components/CraftQueuePanel.tsx";
import { ActivityCenter } from "../src/components/ActivityCenter.tsx";
import { CraftingPanel } from "../src/App.tsx";

const jacket="recipe-scrap-jacket",med="recipe-basic-med-injector",gel="recipe-medical-gel";
function stock(scrap=80,parts=8) {
 const s=createInitialState(1000);s.resources.scrap=scrap;s.resources.cyberwareParts=parts;s.resources.credits=1000;return s;
}
test("a selected next recipe queues without replacing or resetting the active craft",()=>{
 let state=startCraft(stock(),jacket,1000,2,true);
 const previous=state.activeCraft;
 state=enqueueCraft(state,med,3,false,1200);
 assert.equal(state.activeCraft.recipeId,jacket);
 assert.deepEqual(state.activeCraft,previous);
 assert.equal(state.craftQueue.entries.length,1);
 assert.deepEqual(state.craftQueue.entries[0].targetQuantity,3);
 assert.equal(state.craftQueue.entries[0].reserveMaterials,false);
 assert.equal(state.craftQueue.paused,false);
});
test("queued recipes run sequentially, honor separate targets, and leave no phantom active craft",()=>{
 let state=startCraft(stock(),jacket,1000,2,true);
 state=enqueueCraft(state,med,2,true);
 state=processCrafting(state,150000);
 assert.equal(state.inventory["scrap-jacket"],2);
 assert.equal(state.inventory["basic-med-injector"],2);
 assert.equal(state.activeCraft,null);
 assert.equal(state.craftQueue.entries.length,0);
 assert.equal(state.craftQueue.completedCycles,4);
});
test("a queued craft starts on the exact completion boundary, not when a resumed tab wakes",()=>{
 let state=startCraft(stock(),jacket,1000,1);
 state=enqueueCraft(state,med,1);
 const boundary=state.activeCraft.startedAt+state.activeCraft.durationMs;
 state=processCrafting(state,100000,1);
 assert.equal(state.activeCraft.recipeId,med);
 assert.equal(state.activeCraft.startedAt,boundary);
 assert.equal(state.inventory["scrap-jacket"],1);
 assert.equal(state.inventory["basic-med-injector"]??0,0);
 state=processCrafting(state,100000,1);
 assert.equal(state.inventory["basic-med-injector"],1);
 assert.equal(state.activeCraft,null);
});
test("multi-output craft targets round up safely before transitioning",()=>{
 let state=startCraft(stock(),gel,1000,3);
 state=enqueueCraft(state,jacket,1);
 state=processCrafting(state,200000);
 assert.equal(state.inventory["medical-gel"],4);
 assert.equal(state.inventory["scrap-jacket"],1);
 assert.equal(state.craftQueue.completedCycles,3);
 assert.equal(state.activeCraft,null);
});
test("continuous crafting transitions when materials run out, with a remaining independent recipe",()=>{
 let state=startCraft(stock(12,1),med,1000);
 state=enqueueCraft(state,jacket,1);
 state=processCrafting(state,100000);
 assert.equal(state.inventory["basic-med-injector"],1);
 assert.equal(state.inventory["scrap-jacket"],1);
 assert.equal(state.craftQueue.entries.length,0);
 assert.equal(state.activeCraft,null);
});
test("targeted crafts pause on shortages without skipping or erasing completed quantity",()=>{
 let state=startCraft(stock(10,1),jacket,1000,3);
 state=enqueueCraft(state,med,1);
 state=processCrafting(state,100000);
 assert.equal(state.inventory["scrap-jacket"],1);
 assert.equal(state.inventory["basic-med-injector"]??0,0);
 assert.equal(state.activeCraft,null);
 assert.equal(state.craftQueue.paused,true);
 assert.equal(state.craftQueue.entries.length,1);
 assert.equal(state.craftQueue.blockedCraft.recipeId,jacket);
 assert.equal(state.craftQueue.blockedCraft.completedQuantity,1);
 const original=state;
 const stillBlocked=resumeCraftQueue(state,200000);
 assert.equal(stillBlocked.craftQueue.paused,true);
 assert.equal(stillBlocked.craftQueue.blockedCraft.completedQuantity,1);
 assert.equal(original.inventory["scrap-jacket"],1);
 const funded={...state,resources:{...state.resources,scrap:22}};
 state=resumeCraftQueue(funded,200000);
 assert.equal(state.activeCraft.startedAt,200000);
 assert.equal(state.activeCraft.completedQuantity,1);
 state=processCrafting(state,300000);
 assert.equal(state.inventory["scrap-jacket"],3);
 assert.equal(state.inventory["basic-med-injector"],1);
 assert.equal(state.craftQueue.entries.length,0);
});
test("unaffordable upcoming recipes stay in the queue until explicitly resumed",()=>{
 let state=startCraft(stock(10,0),jacket,1000,1);
 state=enqueueCraft(state,med,1);
 state=processCrafting(state,100000);
 assert.equal(state.inventory["scrap-jacket"],1);
 assert.equal(state.inventory["basic-med-injector"]??0,0);
 assert.equal(state.craftQueue.paused,true);
 assert.equal(state.craftQueue.entries.length,1);
 assert.match(state.craftQueue.message,/Queued craft waiting/);
 state=resumeCraftQueue({...state,resources:{...state.resources,scrap:2,cyberwareParts:1}},200000);
 assert.equal(state.activeCraft.recipeId,med);
 state=processCrafting(state,300000);
 assert.equal(state.inventory["basic-med-injector"],1);
});
test("pause-upcoming does not cancel the current recipe; resume starts only afterward",()=>{
 let state=startCraft(stock(),jacket,1000,1);
 state=enqueueCraft(state,med,1);
 state=pauseCraftQueue(state);
 assert.equal(state.activeCraft.recipeId,jacket);
 state=processCrafting(state,100000);
 assert.equal(state.inventory["scrap-jacket"],1);
 assert.equal(state.inventory["basic-med-injector"]??0,0);
 assert.equal(state.activeCraft,null);
 assert.equal(state.craftQueue.entries.length,1);
 state=resumeCraftQueue(state,200000);
 assert.equal(state.activeCraft.recipeId,med);
 state=processCrafting(state,300000);
 assert.equal(state.inventory["basic-med-injector"],1);
});
test("stopping a craft preserves in-progress target for later resume when queue has items",()=>{
 let state=startCraft(stock(),jacket,1000,3);
 state=enqueueCraft(state,med,1);
 state=processCrafting(state,1000+state.activeCraft.durationMs,1);
 assert.equal(state.activeCraft.completedQuantity,1);
 state=stopCraft(state);
 assert.equal(state.activeCraft,null);
 assert.equal(state.craftQueue.paused,true);
 assert.equal(state.craftQueue.blockedCraft.completedQuantity,1);
 state=resumeCraftQueue(state,200000);
 state=processCrafting(state,300000);
 assert.equal(state.inventory["scrap-jacket"],3);
 assert.equal(state.inventory["basic-med-injector"],1);
});
test("queue supports safe limits, reorder, remove and clear without touching live work",()=>{
 const original=startCraft(stock(),jacket,1000,1);
 let state=original;
 for(let i=0;i<MAX_CRAFT_QUEUE;i++)state=enqueueCraft(state,i%2===0?med:gel,i+1);
 assert.equal(state.craftQueue.entries.length,MAX_CRAFT_QUEUE);
 assert.equal(enqueueCraft(state,med,1),state);
 assert.equal(enqueueCraft(state,"recipe-invalid",1),state);
 assert.equal(enqueueCraft(state,med,-1),state);
 const ids=state.craftQueue.entries.map(x=>x.id);
 state=moveQueuedCraft(state,ids[0],1);
 assert.equal(state.craftQueue.entries[1].id,ids[0]);
 assert.equal(moveQueuedCraft(state,ids[0],1_000),state);
 state=removeQueuedCraft(state,ids[2]);
 assert.equal(state.craftQueue.entries.length,MAX_CRAFT_QUEUE-1);
 assert.equal(removeQueuedCraft(state,"missing"),state);
 state=clearCraftQueue(state);
 assert.equal(state.craftQueue.entries.length,0);
 assert.equal(state.activeCraft.recipeId,jacket);
 assert.equal(original.craftQueue.entries.length,0);
});
test("adding to an idle crafting lane starts the recipe immediately",()=>{
 let state=stock();
 state=enqueueCraft(state,jacket,2,true,1000);
 assert.equal(state.activeCraft.recipeId,jacket);
 assert.equal(state.activeCraft.targetQuantity,2);
 assert.equal(state.craftQueue.entries.length,0);
});
test("queued crafting advances across offline time with accurate mixed-recipe completion counts",()=>{
 let state=stock(50,5);
 state=startSkillAction(state,"scav-alley-scrap-run",1000);
 state=startCraft(state,jacket,1000,2);
 state=enqueueCraft(state,med,2);
 const offline=applyOfflineProgress(state,120000);
 assert.equal(offline.inventory["scrap-jacket"],2);
 assert.equal(offline.inventory["basic-med-injector"],2);
 assert.equal(offline.activeCraft,null);
 assert.equal(offline.craftQueue.completedCycles,4);
 assert.ok(offline.offlineRecap.completions>=4);
 assert.ok(offline.activeAction || offline.idleQueue.enabled===false);
});
test("queued recipes continue alongside skills through live parallel time ordering",()=>{
 let state=stock(50,2);
 state=startSkillAction(state,"scav-alley-scrap-run",1000);
 state=startCraft(state,jacket,1000,1,true);
 state=enqueueCraft(state,med,2,true);
 const after=processParallelWork(state,120000);
 assert.equal(after.inventory["scrap-jacket"],1);
 assert.equal(after.inventory["basic-med-injector"],2);
 assert.equal(after.craftQueue.completedCycles,3);
 assert.equal(after.activeCraft,null);
});
test("saving preserves queued recipes and blocked targets, old saves receive an empty queue",()=>{
 let state=startCraft(stock(10,1),jacket,1000,2);
 state=enqueueCraft(state,med,1);
 state=processCrafting(state,100000);
 const saved=normalizeSave(JSON.parse(JSON.stringify(state)));
 assert.equal(saved.craftQueue.blockedCraft.completedQuantity,1);
 assert.equal(saved.craftQueue.entries[0].recipeId,med);
 assert.equal(saved.craftQueue.paused,true);
 const resumed=resumeCraftQueue({...saved,resources:{...saved.resources,scrap:12}},200000);
 assert.equal(resumed.activeCraft.completedQuantity,1);
 const old={...stock()};delete old.craftQueue;
 assert.deepEqual(normalizeSave(old).craftQueue.entries,[]);
});
test("invalid saved crafting queue records are sanitized and cannot turn invalid targets into unlimited crafting",()=>{
 const base=stock();
 const bad={...base,craftQueue:{nextId:-300,paused:true,entries:[
   {id:"c1",recipeId:jacket,targetQuantity:2,reserveMaterials:true},
   {id:"c2",recipeId:jacket,targetQuantity:-9,reserveMaterials:true},
   {id:"c1",recipeId:med,targetQuantity:1,reserveMaterials:false},
   {id:"c3",recipeId:"bad-recipe",targetQuantity:1},
   {id:"c4",recipeId:med,targetQuantity:2001},
 ],blockedCraft:{recipeId:"bad-recipe",startedAt:1000,durationMs:2,targetQuantity:5},
 message:"bad",completedCycles:-200}};
 const normalized=normalizeSave(bad);
 assert.equal(normalized.craftQueue.entries.length,2);
 assert.equal(normalized.craftQueue.entries[0].id,"c1");
 assert.equal(normalized.craftQueue.entries[1].recipeId,med);
 assert.equal(normalized.craftQueue.blockedCraft,null);
 assert.equal(normalized.craftQueue.completedCycles,0);
 assert.equal(normalized.craftQueue.nextId>=3,true);
});
test("Crafting screen renders a usable Add to Queue button and queue management panel",()=>{
 let state=startCraft(stock(),jacket,1000,2);
 state=enqueueCraft(state,med,3);
 const html=renderToStaticMarkup(createElement(CraftingPanel,{state,onCraft(){},onStopCraft(){},onCraftQueueUpdate(){}}));
 assert.match(html,/Add to Queue/);
 assert.match(html,/Crafting queue/);
 assert.match(html,/Basic Med Injector/);
 assert.match(html,/Move Basic Med Injector earlier/);
 assert.match(html,/Remove Basic Med Injector from crafting queue/);
 assert.match(html,/Clear upcoming/);
 const center=renderToStaticMarkup(createElement(ActivityCenter,{state,onUpdate(){},onMissions(){}}));
 assert.match(center,/Crafting queue/);
 assert.match(center,/Basic Med Injector/);
 assert.match(center,/2 \/ 2 crafted|2 items|Make 3 items/);
});
test("the queue panel supports an empty state without affecting the active craft",()=>{
 const state=startCraft(stock(),jacket,1000,2);
 const html=renderToStaticMarkup(createElement(CraftQueuePanel,{state,onUpdate(){}}));
 assert.match(html,/Crafting now: Scrap Jacket/);
 assert.match(html,/0 \/ 8 upcoming/);
});
