import type { GameState } from "../types";
import type { AttributeId } from "../rpgTypes";
import { attributePreview } from "../systems/attributePreview";

export function AttributePreview({ state, attribute }: { state: GameState; attribute: AttributeId }) {
  if (state.rpg.attributes[attribute] >= 20) return null;
  const changes = attributePreview(state, attribute);
  return <ul className="attribute-preview" aria-label="Next point preview">
    {changes.map(change => <li key={change.label}><span>{change.label}</span><b>{change.before} → {change.after}{change.unit}</b></li>)}
    {!changes.length && <li>Next point improves passive bonuses above.</li>}
  </ul>;
}
