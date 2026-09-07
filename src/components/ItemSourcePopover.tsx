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
    <button className={`requirement-chip rarity-${rarity.toLowerCase()} ${warning || !hasRequired ? "missing" : "met"}`} type="button" onClick={() => onOpen(itemId, required)}>
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
  const item = getItem(itemId);
  const owned = itemId in resourceNames ? state.resources[itemId as ResourceId] ?? 0 : state.inventory[itemId] ?? 0;
  const sources = bestItemSources(itemId, state);
  return (
    <div className="source-popover">
      <button className="sim-cache-scrim" aria-label="Close source details" onClick={onClose} />
      <section className="source-popover-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Item Source</p>
            <h3>{itemDisplayName(itemId)}</h3>
          </div>
          <button className="secondary-button" onClick={onClose}>Close</button>
        </div>
        <div className="inventory-grid">
          <SourceMetric label="Owned" value={owned.toLocaleString()} />
          <SourceMetric label="Used Here" value={usedAmount.toLocaleString()} />
          <SourceMetric label="Type" value={item?.type ?? (itemId in resourceNames ? "Resource" : "Unknown")} />
          <SourceMetric label="Rarity" value={item?.rarity ?? "Common"} />
        </div>
        <div className="source-list">
          {sources.map((source, index) => (
            <article className={`source-entry ${source.unlocked ? "" : "locked"}`} key={`${source.type}-${source.name}-${index}`}>
              <div>
                <p className="eyebrow">{source.type}{source.districtId ? ` / ${source.districtId}` : ""}</p>
                <strong>{source.name}</strong>
                <span>{source.detail}</span>
                {!source.unlocked && <em>{source.requirement || "Locked"}</em>}
              </div>
              <button className="secondary-button" disabled={!source.unlocked || !source.goLabel}>{source.unlocked ? source.goLabel ?? "Known" : "Locked"}</button>
            </article>
          ))}
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
