import type { RewardPopupGroup } from "../types";

export function RewardPopupContainer({ popups, now, onDismiss, combatActive = false }: { combatActive?: boolean; popups: RewardPopupGroup[]; now: number; onDismiss: (id: string) => void }) {
  const visible = popups.filter((popup) => popup.expiresAt > now && (!combatActive || ["rare", "level", "warning", "blueprint"].includes(popup.category))).slice(0, combatActive ? 1 : 2);
  if (!visible.length) return null;
  return (
    <aside className="reward-popup-stack" aria-live="polite" aria-label="Reward notifications">
      {visible.map((popup) => (
        <button aria-label={`Dismiss ${popup.skill ? popup.skill.name + " level " + popup.skill.level + ": " : ""}${popup.title}`} className={`reward-popup reward-popup-${popup.category}${popup.skill ? " reward-popup-skill" : ""}`} key={popup.id} onClick={() => onDismiss(popup.id)}>
          {popup.skill ? <span className="reward-popup-skill-heading">{popup.skill.name} <b>Lv {popup.skill.level}</b></span> : <span className="reward-popup-badge">{labelForCategory(popup.category)}</span>}
          <strong>{popup.title}</strong>
          <span className="reward-popup-lines">
            {[...popup.lines].sort((a, b) => Number(["rare", "level", "blueprint"].includes(b.category)) - Number(["rare", "level", "blueprint"].includes(a.category))).slice(0, 3).map((line) => (
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
