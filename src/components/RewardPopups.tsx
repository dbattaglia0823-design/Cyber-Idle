import type { RewardPopupGroup } from "../types";

export function RewardPopupContainer({ popups, now, onDismiss }: { popups: RewardPopupGroup[]; now: number; onDismiss: (id: string) => void }) {
  const visible = popups.filter((popup) => popup.expiresAt > now).slice(0, 5);
  if (!visible.length) return null;
  return (
    <aside className="reward-popup-stack" aria-live="polite" aria-label="Reward notifications">
      {visible.map((popup) => (
        <button className={`reward-popup reward-popup-${popup.category}`} key={popup.id} onClick={() => onDismiss(popup.id)}>
          <span className="reward-popup-badge">{labelForCategory(popup.category)}</span>
          <strong>{popup.title}</strong>
          <span className="reward-popup-lines">
            {popup.lines.map((line) => (
              <em className={`reward-line reward-line-${line.category}`} key={line.id}>
                {line.label}
              </em>
            ))}
          </span>
        </button>
      ))}
    </aside>
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
