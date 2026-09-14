import { useState } from "react";
import { Check, LockKeyhole, Sparkles } from "lucide-react";
import { attributeDefinitions, rpgPerks } from "../data/rpgCampaign";
import { buyRpgPerk, canBuyRpgPerk } from "../systems/rpgSystem";
import type { AttributeId } from "../rpgTypes";
import type { GameState } from "../types";

export function PerkTrees({ state, onUpdate }: { state: GameState; onUpdate: (fn: (s: GameState) => GameState) => void }) {
  const [selected, setSelected] = useState<AttributeId>("body");
  const attribute = attributeDefinitions.find(entry => entry.id === selected)!;
  const perks = rpgPerks.filter(perk => perk.attribute === selected);
  return <section className={`perk-tree perk-tree-${selected}`} aria-label="Attribute perk trees">
    <div className="perk-tree-heading"><div><p className="rpg-eyebrow">BUILD SPECIALIZATION</p><h3>Attribute perk trees</h3><p>Follow prerequisites to specialize, or combine branches. Each perk costs one point; capstones require both branches.</p></div><strong>{state.rpg.perkPoints}<small>AVAILABLE POINTS</small></strong></div>
    <div className="perk-tree-tabs" role="tablist" aria-label="Choose an attribute tree">{attributeDefinitions.map(entry => <button key={entry.id} id={`tree-tab-${entry.id}`} role="tab" aria-selected={selected === entry.id} aria-controls="attribute-tree-panel" onClick={() => setSelected(entry.id)}><span>{entry.name}</span><b>{state.rpg.attributes[entry.id]} / 20</b><small>{rpgPerks.filter(perk => perk.attribute === entry.id && state.rpg.perks[perk.id]).length} / {rpgPerks.filter(perk => perk.attribute === entry.id).length} learned</small></button>)}</div>
    <div id="attribute-tree-panel" role="tabpanel" aria-labelledby={`tree-tab-${selected}`}><div className="perk-tree-summary"><h3>{attribute.name}</h3><p>{attribute.description}</p></div>
      {[5, 9, 12, 15, 20].map(tier => <div className={`perk-tree-tier ${state.rpg.attributes[selected] >= tier ? "unlocked" : "locked"}`} key={tier}><div className="perk-tier-marker"><b>{tier}</b><span>{tier === 20 ? "CAPSTONE" : `${attribute.name.toUpperCase()} REQUIRED`}</span></div><div className="rpg-perk-grid">{perks.filter(perk => perk.requirement === tier).map(perk => {
        const owned = Boolean(state.rpg.perks[perk.id]), available = canBuyRpgPerk(state, perk.id);
        return <button className={`${owned ? "owned" : available ? "available" : "locked"} ${tier === 20 ? "perk-capstone" : ""}`} key={perk.id} disabled={!available} onClick={() => onUpdate(s => buyRpgPerk(s, perk.id))}>
          <span>{owned ? <Check size={18} /> : available ? <Sparkles size={18} /> : <LockKeyhole size={18} />}<small>{owned ? "LEARNED" : "1 PERK POINT"}</small></span><strong>{perk.name}</strong><p>{perk.description}</p>
          {perk.requires?.length ? <div className="perk-prerequisites">{perk.requires.map(id => <small className={state.rpg.perks[id] ? "met" : "unmet"} key={id}>{state.rpg.perks[id] ? "✓" : "↳"} {rpgPerks.find(parent => parent.id === id)?.name}</small>)}</div> : <small>Branch entry · no prerequisite</small>}
        </button>;
      })}</div></div>)}
    </div>
  </section>;
}
