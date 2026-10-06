import { useEffect, useRef } from "react";
import { districts } from "../data/districts";
import { recipes } from "../data/recipes";
import { skillActions, skillNames } from "../data/skills";
import { usePlayerNavigation } from "./PlayerNavigation";
import { getItem } from "../data/items";
import { resourceNames } from "../data/resources";
import { bestItemSources, itemDisplayName } from "../systems/itemSourceLookup";
import type { ReactNode } from "react";
import type { GameState, ResourceId } from "../types";

export function ClickableItemRequirement({
  state,
  itemId,
  required,
  onOpen,
  warning,
}: {
  state: GameState;
  itemId: string;
  required: number;
  onOpen: (itemId: string, usedAmount: number) => void;
  warning?: boolean;
}) {
  const owned = itemId in resourceNames ? state.resources[itemId as ResourceId] ?? 0 : state.inventory[itemId] ?? 0;
  const rarity = getItem(itemId)?.rarity ?? "Common";
  const hasRequired = owned >= required;
  return (
    <button className={`requirement-chip rarity-${rarity.toLowerCase()} ${warning || !hasRequired ? "missing" : "met"}`} aria-label={`Find sources for ${itemDisplayName(itemId)}. Owned ${owned}, needed ${required}.`} type="button" onClick={() => onOpen(itemId, required)}>
      <span>{itemDisplayName(itemId)}</span>
      <strong>{owned.toLocaleString()} / {required.toLocaleString()}</strong>
    </button>
  );
}

export function RequirementBulletList({
  title,
  children,
  warning,
}: {
  title: string;
  children: ReactNode;
  warning?: boolean;
}) {
  return (
    <div className={`requirement-section ${warning ? "warning" : ""}`}>
      <p className="fine requirement-title">{title}</p>
      <div className="requirement-list">{children}</div>
    </div>
  );
}

export function ItemSourcePopover({
  state,
  itemId,
  usedAmount,
  onClose,
}: {
  state: GameState;
  itemId: string;
  usedAmount: number;
  onClose: () => void;
}) {
  const navigation = usePlayerNavigation();
  const panel = useRef<HTMLElement>(null);
  const close = useRef(onClose); close.current = onClose;
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.focus();
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); close.current(); }
      if (event.key === "Tab") {
        const nodes = Array.from(panel.current?.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input, select, [tabindex="0"]') ?? []);
        const first = nodes[0], last = nodes[nodes.length - 1];
        if (event.shiftKey && (document.activeElement === first || document.activeElement === panel.current)) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && (document.activeElement === last || document.activeElement === panel.current)) { event.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener("keydown", key);
    return () => { document.body.style.overflow = overflow; document.removeEventListener("keydown", key); if (previous?.isConnected) previous.focus({ preventScroll: true }); };
  }, []);
  const item = getItem(itemId);
  const owned = itemId in resourceNames ? state.resources[itemId as ResourceId] ?? 0 : state.inventory[itemId] ?? 0;
  const sources = bestItemSources(itemId, state);
  return (
    <div className="source-popover">
      <button className="sim-cache-scrim" aria-label="Close source details" onClick={onClose} />
      <section ref={panel} tabIndex={-1} role="dialog" aria-modal="true" aria-label={`Sources for ${itemDisplayName(itemId)}`} className="source-popover-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Item Source</p>
            <h3>{itemDisplayName(itemId)}</h3>
          </div>
          <button className="secondary-button" onClick={onClose}>Close</button>
        </div>
        <div className="inventory-grid">
          <SourceMetric label="Owned" value={owned.toLocaleString()} />
          <SourceMetric label="Still needed" value={Math.max(0, usedAmount - owned).toLocaleString()} />
          <SourceMetric label="Type" value={item?.type ?? (itemId in resourceNames ? "Resource" : "Unknown")} />
          <SourceMetric label="Rarity" value={item?.rarity ?? "Common"} />
        </div>
        <div className="source-list">
          {!sources.length && <p className="muted">No source is recorded yet. Explore districts and check their vendors for new supplies.</p>}
          {sources.map((source, index) => {
            const recipe = source.type === "Crafting recipe" ? recipes.find(entry => entry.name === source.name) : undefined;
            const action = skillActions.find(entry => entry.name === source.name && !entry.tags?.includes("supply"));
            const district = source.districtId;
            const canVisit = district && state.districts[district]?.unlocked;
            const route = recipe && navigation.openCrafting ? { label: "View recipe", go: () => navigation.openCrafting?.(recipe.id) }
              : action && canVisit && navigation.openDistrict ? { label: "Open " + skillNames[action.skillId], go: () => navigation.openDistrict?.(district, "skill-" + action.skillId) }
              : source.type === "Mission reward" && navigation.openMissions ? { label: "Open missions", go: navigation.openMissions }
              : source.name === "Netrunner exchange" && navigation.openCharacter ? { label: "Open quickhacks", go: () => navigation.openCharacter?.("quickhacks") }
              : canVisit && navigation.openDistrict && ["Vendor", "Ripperdoc"].includes(source.type) ? { label: "Visit " + (source.type === "Vendor" ? "market" : "ripperdoc"), go: () => navigation.openDistrict?.(district, source.type === "Vendor" ? "market" : "ripperdoc") } : null;
            return (
            <article className={`source-entry ${source.unlocked ? "" : "locked"}`} key={`${source.type}-${source.name}-${index}`}>
              <div>
                <p className="eyebrow">{source.type}{source.districtId ? ` / ${districts.find(entry => entry.id === source.districtId)?.name ?? source.districtId}` : ""}</p>
                <strong>{source.name}</strong>
                <span>{source.detail}</span>
                {!source.unlocked && <em>{source.requirement || "Locked"}</em>}
              </div>
              {route && <button className="secondary-button" onClick={() => { onClose(); route.go(); }}>{route.label}</button>}
            </article>
          ); })}
        </div>
      </section>
    </div>
  );
}

function SourceMetric({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="resource-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
