import { useMemo, useState, type CSSProperties } from "react";
import mapImage from "../assets/maps/Map.png";
import { factions } from "../data/factions";
import { cityDistrictOrder, districtCompletionBreakdown, districtCompletionPercent, getDistrict } from "../data/cityMap";
import { cityMapOverlayRegions } from "../data/cityMapOverlayData";
import { skillNames } from "../data/skills";
import { districtActivitySummaries } from "../systems/districtActivityMap";
import { threatTier } from "../systems/districtThreat";
import type { DistrictId, GameState, SkillId } from "../types";

interface DistrictMapProps {
  state: GameState;
  activeDistrictId: DistrictId | null;
  activeActivityName?: string;
  onOpenDistrict: (districtId: DistrictId) => void;
}

export function DistrictMap({ state, activeDistrictId, activeActivityName, onOpenDistrict }: DistrictMapProps) {
  const firstUnlocked = cityDistrictOrder.find((id) => state.districts[id]?.unlocked) ?? "neonRow";
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictId>(state.selectedDistrict ?? firstUnlocked);
  const [expanded, setExpanded] = useState(false);
  const sortedRegions = useMemo(() => [...cityMapOverlayRegions].sort((a, b) => a.order - b.order), []);

  const selectDistrict = (districtId: DistrictId) => {
    setSelectedDistrict(districtId);
    setExpanded(false);
  };

  return (
    <section className="city-image-shell">
      <div className="city-image-header">
        <div>
          <p className="eyebrow">Metro Grid / Live Overlay</p>
          <h2>City Map</h2>
        </div>
        <span className="warning-badge">{cityDistrictOrder.filter((id) => state.districts[id]?.unlocked).length}/{cityDistrictOrder.length} open</span>
      </div>

      <div className="city-image-stage">
        <img className="city-map-art" src={mapImage} alt="Cyberpunk city district map" />
        <svg className="city-map-overlay" viewBox="0 0 1122 1402" preserveAspectRatio="xMidYMid meet" aria-label="District selection overlay">
          <defs>
            <filter id="imageMapGlow" x="-35%" y="-35%" width="170%" height="170%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {sortedRegions.map((region) => {
            const district = getDistrict(region.districtId);
            const unlocked = Boolean(state.districts[region.districtId]?.unlocked);
            const selected = selectedDistrict === region.districtId;
            const active = activeDistrictId === region.districtId;
            const threat = state.districtThreat[region.districtId]?.level ?? 0;
            return (
              <g
                key={region.districtId}
                className={`image-map-region ${unlocked ? "open" : "locked"} ${selected ? "selected" : ""} ${active ? "active" : ""} ${threat >= 75 ? "high-threat" : ""}`}
                style={{ "--district-color": region.color, "--district-glow": region.glow } as CSSProperties}
                role="button"
                tabIndex={0}
                aria-label={`${district?.name ?? region.districtId} ${unlocked ? "open" : "locked"}`}
                onClick={() => selectDistrict(region.districtId)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    selectDistrict(region.districtId);
                  }
                }}
              >
                <path className="image-map-hit" d={region.path} />
                <path className="image-map-outline" d={region.path} filter="url(#imageMapGlow)" />
                {(active || threat >= 75) && <circle className="image-map-marker" cx={region.marker.x} cy={region.marker.y} r="10" />}
              </g>
            );
          })}
        </svg>

      </div>

      <CityMapBottomDrawer
        state={state}
        districtId={selectedDistrict}
        active={activeDistrictId === selectedDistrict}
        activeActivityName={activeActivityName}
        expanded={expanded}
        onToggleExpanded={() => setExpanded((value) => !value)}
        onEnter={() => onOpenDistrict(selectedDistrict)}
      />
    </section>
  );
}

function CityMapBottomDrawer({
  state,
  districtId,
  active,
  activeActivityName,
  expanded,
  onToggleExpanded,
  onEnter,
}: {
  state: GameState;
  districtId: DistrictId;
  active: boolean;
  activeActivityName?: string;
  expanded: boolean;
  onToggleExpanded: () => void;
  onEnter: () => void;
}) {
  const district = getDistrict(districtId)!;
  const unlocked = Boolean(state.districts[districtId]?.unlocked);
  const completion = unlocked ? districtCompletionPercent(state, districtId) : 0;
  const breakdown = districtCompletionBreakdown(state, districtId);
  const threat = state.districtThreat[districtId]?.level ?? 0;
  const dominantFaction = district.associatedFactions[0];
  const factionName = factions.find((faction) => faction.id === dominantFaction)?.name ?? "Contested";
  const summaries = districtActivitySummaries(state, districtId);
  const compactSummaries = summaries.slice(0, 5);
  const mainRequirement = district.unlockRequirements[0] ?? "Unknown access requirement";
  const mainRequirementMet = requirementMet(state, mainRequirement);

  return (
    <aside className={`city-map-drawer ${expanded ? "expanded" : ""} ${unlocked ? "open" : "locked"}`}>
      <button className="drawer-grip" aria-label={expanded ? "Collapse district details" : "Expand district details"} onClick={onToggleExpanded} />
      <div className="drawer-primary">
        <div>
          <div className="drawer-title-row">
            <h3>{district.name}</h3>
            <span className={`district-state-badge ${unlocked ? "open" : "locked"}`}>{unlocked ? "Open" : "Locked"}</span>
          </div>
          <p className="fine">
            {completion}% complete / {threatTier(threat)} threat / {factionName} / Standing {state.districtStanding[districtId]?.standing ?? 0}
          </p>
          {!unlocked && <p className={`fine ${mainRequirementMet ? "success-text" : "danger-text"}`}>{requirementHint(state, mainRequirement)}</p>}
          {active && <p className="fine active-text">Active: {activeActivityName ?? "Activity running"}</p>}
        </div>
        <div className="drawer-actions">
          <button className="secondary-button" onClick={onToggleExpanded}>{expanded ? "Less" : unlocked ? "District Info" : "Requirements"}</button>
          <button className="primary-button" disabled={!unlocked} onClick={onEnter}>{unlocked ? "Enter District" : "Locked"}</button>
        </div>
      </div>

      <div className="drawer-summary-strip">
        {compactSummaries.map((summary) => (
          <span key={summary.id} title={summary.summary}>{summary.label} <b>{summary.available}/{summary.available + summary.locked}</b></span>
        ))}
      </div>

      {expanded && (
        <div className="drawer-expanded">
          <div>
            <p className="eyebrow">Requirements</p>
            <div className="mini-list">
              {district.unlockRequirements.map((requirement) => {
                const met = requirementMet(state, requirement);
                return <span key={requirement} className={met ? "met" : "missing"}>{requirementHint(state, requirement)}</span>;
              })}
            </div>
          </div>
          <div>
            <p className="eyebrow">Completion</p>
            <div className="mini-list">
              {Object.entries(breakdown).filter(([key]) => key !== "total").map(([key, value]) => <span key={key}>{titleCase(key)} {value}%</span>)}
            </div>
          </div>
          <div>
            <p className="eyebrow">Activities</p>
            <div className="mini-list">
              {summaries.map((summary) => <span key={summary.id}>{summary.label}: {summary.summary}</span>)}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

function requirementHint(state: GameState, requirement: string) {
  const skillMatch = requirement.match(/^(Scavenging|Hacking|Cyberware Engineering|Street Combat|Vehicle Tuning|Black Market Trading|Medical Knowledge|Streetcraft) level (\d+)/i);
  if (skillMatch) {
    const [, label, target] = skillMatch;
    const skillId = (Object.entries(skillNames).find(([, name]) => name.toLowerCase() === label.toLowerCase())?.[0] ?? null) as SkillId | null;
    if (skillId) return `${label} ${state.skills[skillId].level}/${target}`;
  }
  const reputationMatch = requirement.match(/^Reputation (\d+)/i);
  if (reputationMatch) return `Reputation ${state.resources.reputation}/${reputationMatch[1]}`;
  return requirement;
}

function requirementMet(state: GameState, requirement: string) {
  const normalized = requirement.replace(/^or\s+/i, "");
  const skillMatch = normalized.match(/^(Scavenging|Hacking|Cyberware Engineering|Street Combat|Vehicle Tuning|Black Market Trading|Medical Knowledge|Streetcraft) level (\d+)/i);
  if (skillMatch) {
    const [, label, target] = skillMatch;
    const skillId = (Object.entries(skillNames).find(([, name]) => name.toLowerCase() === label.toLowerCase())?.[0] ?? null) as SkillId | null;
    return skillId ? state.skills[skillId].level >= Number(target) : false;
  }
  const reputationMatch = normalized.match(/^Reputation (\d+)/i);
  if (reputationMatch) return state.resources.reputation >= Number(reputationMatch[1]);
  return false;
}

function titleCase(value: string) {
  return value.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase());
}
