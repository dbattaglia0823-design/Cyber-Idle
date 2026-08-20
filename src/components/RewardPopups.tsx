import { useState } from "react";
import type { RewardPopupGroup } from "../types";

export function RewardPopupContainer({ popups, now, onDismiss }: { popups: RewardPopupGroup[]; now: number; onDismiss: (id: string) => void }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const visible = popups.filter((popup) => popup.expiresAt > now).slice(0, 2);
  if (!visible.length) return null;
  return (
    <aside className="reward-popup-stack" aria-live="polite" aria-label="Reward notifications">
      {visible.map((popup) => (
        <RewardPopupCard
          key={popup.id}
          popup={popup}
          expanded={expandedId === popup.id}
          onToggle={() => setExpandedId((current) => current === popup.id ? null : popup.id)}
          onDismiss={() => onDismiss(popup.id)}
        />
      ))}
    </aside>
  );
}

function RewardPopupCard({ popup, expanded, onToggle, onDismiss }: { popup: RewardPopupGroup; expanded: boolean; onToggle: () => void; onDismiss: () => void }) {
  const prominent = ["rare", "blueprint", "level", "achievement", "warning"].includes(popup.category);
  const shownLines = expanded ? popup.lines : [];
  return (
    <article className={`reward-popup reward-popup-${popup.category} ${prominent ? "prominent" : "compact"} ${expanded ? "expanded" : ""}`}>
      <button className="reward-popup-main" type="button" onClick={onToggle} aria-expanded={expanded}>
        <span className="reward-popup-badge">{labelForCategory(popup.category)}</span>
        <strong>{popup.title}{(popup.completionCount ?? 1) > 1 ? ` ×${popup.completionCount}` : ""}</strong>
        <span className="reward-popup-lines">
          {shownLines.map((line) => <em className={`reward-line reward-line-${line.category}`} key={line.id}>{line.label}</em>)}
        </span>
        {!expanded && <span className="reward-popup-summary">{popup.category === "warning" ? "Alert" : "Complete"} • Click for details</span>}
      </button>
      <button className="reward-popup-dismiss" type="button" onClick={onDismiss} aria-label={`Dismiss ${popup.title}`}>×</button>
    </article>
  );
}

function labelForCategory(category: RewardPopupGroup["category"]) {
  if (category === "xp") return "XP";
  if (category === "mastery") return "MST";
  if (category === "rare") return "RARE";
  if (category === "blueprint") return "BP";
  if (category === "level") return "LEVEL";
  if (category === "neural") return "NI";
  if (category === "achievement") return "ACH";
  return category.toUpperCase();
}
