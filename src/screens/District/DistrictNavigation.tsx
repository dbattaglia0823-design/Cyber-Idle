import { BrainCircuit } from "lucide-react";
import { skillDescriptions } from "../../data/skills";
import type { GameState, SkillId } from "../../types";
import type { DistrictActivityCategory, DistrictCategorySummary } from "../../systems/districtActivityMap";
export type DistrictHubCategory = DistrictActivityCategory | `skill-${SkillId}`;
export interface DistrictSkillTab { id: DistrictHubCategory; skillId: SkillId; label: string; count: number; available: number }
export function DistrictSkillGrid({ state, tabs, onOpen }: { state: GameState; tabs: DistrictSkillTab[]; onOpen: (category: DistrictHubCategory) => void }) {
  if (!tabs.length) return null;
  return (
    <article className="panel district-skill-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Skill Work</p>
          <h2>Train by Specialty</h2>
        </div>
        <BrainCircuit size={22} />
      </div>
      <div className="activity-category-grid">
        {tabs.map((tab) => (
          <button className="category-card skill-category-card" key={tab.id} onClick={() => onOpen(tab.id)}>
            <span className="eyebrow">Level {state.skills[tab.skillId].level}</span>
            <strong>{tab.label}</strong>
            <small>{skillDescriptions[tab.skillId]}</small>
            <span>{tab.available} available / {tab.count} total</span>
          </button>
        ))}
      </div>
    </article>
  );
}
export function DistrictActivityGrid({ summaries, onOpen }: { summaries: DistrictCategorySummary[]; onOpen: (category: DistrictHubCategory) => void }) {
  return (
    <div className="activity-category-grid">
      {summaries.map((summary) => (
        <button className="category-card" key={summary.id} onClick={() => onOpen(summary.id)}>
          <span className="eyebrow">{summary.reward}</span>
          <strong>{summary.label}</strong>
          <small>{summary.summary}</small>
          <span>{summary.available} available / {summary.locked} locked</span>
          {summary.warning && <b className="warning-badge">{summary.warning}</b>}
        </button>
      ))}
    </div>
  );
}
