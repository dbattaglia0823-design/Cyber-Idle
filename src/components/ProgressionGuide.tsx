import { rpgMissions } from "../data/rpgCampaign";
import { useState } from "react";
import { ArrowRight, Boxes, Check, Crosshair, LockKeyhole, Radio, Wrench, Zap } from "lucide-react";
import { districts } from "../data/districts";
import { districtLevelBands } from "../data/levelBands";
import { materialSupplyActions } from "../data/materialSupply";
import { recipes } from "../data/recipes";
import { getItem } from "../data/items";
import { skillActions, skillNames, skillOrder } from "../data/skills";
import { actionXpRewardWithMastery, canStartSkillAction } from "../systems/actionProcessing";
import { canCraft, adjustCraftingCosts } from "../systems/craftingProcessing";
import { adjustedActionDurationMs } from "../systems/modifiers";
import { xpForNextLevel } from "../systems/formulas";
import { campaignProgress } from "../systems/endgameProgress";
import type { DistrictId, GameState, SkillId } from "../types";
import "./progression-guide.css";

export function ProgressionGuide({ state, onStartSkill, onCraft, onOpenDistrict }: {
  state: GameState; onStartSkill: (id: string) => void; onCraft: (id: string) => void;
  onOpenDistrict: (id: DistrictId) => void;
}) {
  const [trainingSkill, setTrainingSkill] = useState<SkillId>("scavenging");
  const ordered = [...districts].sort((a, b) => districtLevelBands[a.id].entryLevel - districtLevelBands[b.id].entryLevel);
  const next = ordered.find(district => !state.districts[district.id]?.unlocked);
  const unlocked = ordered.filter(district => state.districts[district.id]?.unlocked).length;
  const highest = Math.max(...Object.values(state.skills).map(skill => skill.level));
  const target = next ? districtLevelBands[next.id].entryLevel : 150;
  const previous = next ? Math.max(1, ...ordered.filter(d => state.districts[d.id]?.unlocked).map(d => districtLevelBands[d.id].entryLevel)) : 140;
  const percent = rpgMissions.filter(m => state.rpg.completed[m.id]).length / rpgMissions.length * 100;
  const supply = [...materialSupplyActions].reverse().find(action => canStartSkillAction(state, action));
  const xpRate = (action: typeof skillActions[number]) => actionXpRewardWithMastery(state, action) * 60000 / adjustedActionDurationMs(state, action.durationMs, action.id, [action.skillId, ...(action.tags ?? [])]);
  const training = skillActions.filter(action => action.skillId === trainingSkill && canStartSkillAction(state, action))
    .sort((a, b) => xpRate(b) - xpRate(a))[0];
  const skill = state.skills[trainingSkill];
  const minutes = training ? Math.max(0, xpForNextLevel(skill.level) - skill.xp) / xpRate(training) : 0;
  const starterIds = ["recipe-street-knife", "recipe-padded-street-vest", "recipe-basic-med-injector"];
  const starter = starterIds.map(id => recipes.find(recipe => recipe.id === id)!).find(recipe =>
    (state.inventory[recipe.outputItemId] ?? 0) < (recipe.outputItemId === "basic-med-injector" ? 5 : 1));
  const craft = starter ?? [...recipes].reverse().find(recipe => canCraft(state, recipe) &&
    ["Armor", "Weapon", "Cyberware"].includes(getItem(recipe.outputItemId)?.type ?? "") && !(state.inventory[recipe.outputItemId] > 0))
    ?? recipes.find(recipe => recipe.id === "recipe-basic-med-injector")!;
  const costs = Object.entries(adjustCraftingCosts(state, craft));
  const ready = canCraft(state, craft);
  const campaign = { cleared: rpgMissions.filter(m => state.rpg.completed[m.id]).length, total: rpgMissions.length };
  return <section className="runner-guide" aria-label="Progression guide">
    <div className="runner-guide-hero">
      <div className="runner-guide-intro">
        <span className="runner-guide-kicker"><Radio size={14} /> RUNNER NETWORK / NEXT OBJECTIVE</span>
        <h2>{next ? `Open ${next.name}` : "Own your place in the city"}</h2>
        <p>{next ? "Complete main jobs to open districts. Replay local gigs for credits and Heat relief; train skills for equipment and tougher fights." : "Complete the main missions, replay local gigs for loot, and improve your equipment."}</p>
        <div className="runner-guide-stats"><span><Zap size={14} /> Highest skill <b>{highest}</b></span><span><Crosshair size={14} /> Main jobs <b>{campaign.cleared}/{campaign.total}</b></span></div>
      </div>
      <div className="runner-guide-meter" role="progressbar" aria-label="Main story progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(percent)}>
        <svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="51" /><circle cx="60" cy="60" r="51" pathLength="100" strokeDasharray={`${percent} 100`} /></svg>
        <div><strong>{unlocked}<small>/ 8</small></strong><span>DISTRICTS OPEN</span></div>
      </div>
    </div>
    <nav className="runner-route" aria-label="District progression">
      {ordered.map((district, index) => {
        const open = state.districts[district.id]?.unlocked;
        return <button key={district.id} className={`${open ? "is-open" : ""} ${next?.id === district.id ? "is-next" : ""}`} disabled={!open} onClick={() => onOpenDistrict(district.id)} title={open ? `Explore ${district.name}` : district.unlockRequirements.join(", ")}>
          <span className="runner-route-node">{open ? <Check size={13} /> : <LockKeyhole size={12} />}</span>
          <span><small>0{index + 1} / LV {districtLevelBands[district.id].entryLevel}</small><strong>{district.name}</strong></span>
        </button>;
      })}
    </nav>
    <div className="runner-guide-cards">
      <article><div className="runner-guide-card-label"><Boxes size={18} /><span>01 / GATHER</span><em>Guaranteed</em></div>
        <h3>{supply?.name ?? "Resupply your workshop"}</h3>
        <p>{supply ? `${Object.keys(supply.itemRewards ?? {}).length} component types per cycle. Check the listed processing costs.` : "Train Scavenging in Neon Row to build your material reserves."}</p>
        <div className="runner-guide-tags">{supply && Object.entries(supply.rewards).map(([id, amount]) => <span key={id}>{amount! < 0 ? "Uses " : "+"}{Math.abs(amount!)} {getItem(id)?.name ?? id}</span>)}</div>
        <button disabled={!supply || state.activeAction?.actionId === supply.id} onClick={() => supply && onStartSkill(supply.id)}>{state.activeAction?.actionId === supply?.id ? "Gathering…" : "Gather components"}<ArrowRight size={15} /></button>
      </article>
      <article><div className="runner-guide-card-label"><Wrench size={18} /><span>02 / PREPARE</span><em>{ready ? "Ready to craft" : "Collect materials"}</em></div>
        <h3>{craft.name}</h3><p>Build a weapon and armor, then stock medicine. Equip gear and enable auto-healing before combat.</p>
        <div className="runner-guide-tags">{costs.map(([id, amount]) => {
          const owned = id in state.resources ? state.resources[id as keyof GameState["resources"]] : state.inventory[id] ?? 0;
          return <span className={owned < amount ? "is-missing" : ""} key={id}>{getItem(id)?.name ?? id} {Math.floor(owned)}/{amount}</span>;
        })}</div>
        <button disabled={!ready || state.activeCraft?.recipeId === craft.id} onClick={() => onCraft(craft.id)}>{state.activeCraft?.recipeId === craft.id ? "Crafting…" : ready ? "Craft equipment / supplies" : "Materials needed"}<ArrowRight size={15} /></button>
      </article>
      <article><div className="runner-guide-card-label"><Zap size={18} /><span>03 / ADVANCE</span><em>LV {skill.level}</em></div>
        <label className="runner-training-label">Train <select value={trainingSkill} onChange={event => setTrainingSkill(event.target.value as SkillId)}>{skillOrder.filter(id => id !== "combat").map(id => <option key={id} value={id}>{skillNames[id]}</option>)}</select></label>
        <h3>{training?.name ?? "Gather required inputs"}</h3><p>{skill.level >= 150 ? "Skill complete. Prestige is available in Main / Progress." : training ? `${Math.round(xpRate(training)).toLocaleString()} XP/min · about ${Math.max(1, Math.ceil(minutes))} min to your next level while supplied.` : "Visit an unlocked district to check action costs and requirements."}</p>
        <button disabled={!training || skill.level >= 150 || state.activeAction?.actionId === training.id} onClick={() => training && onStartSkill(training.id)}>{state.activeAction?.actionId === training?.id ? "Training…" : "Train best available action"}<ArrowRight size={15} /></button>
      </article>
    </div>
    <p className="runner-guide-footnote">One activity runs at a time. Starting a new activity replaces the current one. Supply routes require their listed Scavenging level.</p>
  </section>;
}
