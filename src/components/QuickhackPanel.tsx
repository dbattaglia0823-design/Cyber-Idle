import { quickhacks } from "../data/quickhacks";
import { getItem } from "../data/items";
import { canCraftQuickhack, craftQuickhack, deckCapacity, equippedDeck, installedQuickhacks, installQuickhack, removeQuickhack } from "../systems/quickhackSystem";
import { equipItem } from "../systems/equipmentSystem";
import { meetsItemAttributeRequirement, itemAttributeRequirement } from "../systems/runnerProgression";
import { maxRam } from "../systems/rpgSystem";
import type { GameState } from "../types";
export function QuickhackPanel({ state, onUpdate }: { state: GameState; onUpdate: (fn: (s: GameState) => GameState) => void }) {
  const deck = equippedDeck(state), installed = installedQuickhacks(state), locked = Boolean(state.rpg.active);
  const decks = Object.keys(state.inventory).map(getItem).filter(item => item && state.inventory[item.id] > 0 && deckCapacity(item) > 0);
  return <section className="stack" aria-label="Cyberdeck and quickhacks">
    <article className="panel"><p className="eyebrow">COMBAT SOFTWARE</p><h2>{deck?.name ?? "Equip a cyberdeck"}</h2><p>Install owned programs in your operating-system cyberdeck. Programs are reusable; each cast spends RAM in turn-based mission combat. Idle hacking jobs continue to use their own skill system.</p>
    <div className="runner-vitals"><span>RAM CAPACITY<strong>{maxRam(state)}</strong></span><span>PROGRAM SLOTS<strong>{installed.length} / {deckCapacity(deck)}</strong></span><span>RAM PER TURN<strong>{deck ? state.rpg.perks["ram-recycler"] ? 2 : 1 : 0}</strong></span></div>
    <p className="muted">RAM refills for each enemy. Recover RAM grants 3 extra RAM while taking cover. Intelligence increases capacity and damage; Synapse boosts damage and RAM Recycler improves recovery.</p>
    {locked && <p className="rpg-choice-warning">Return to the clinic before changing your deck, programs, or presets.</p>}
    <div className="inventory-filter-row">{decks.map(item => item && <button key={item.id} disabled={locked || !meetsItemAttributeRequirement(state, item)} title={itemAttributeRequirement(item).label} aria-pressed={deck?.id === item.id} className={deck?.id === item.id ? "active" : ""} onClick={() => onUpdate(s => equipItem(s, item.id))}>{item.name} / {deckCapacity(item)} slots</button>)}</div>
    {!decks.length && <p className="muted">Claim your field kit in Missions for an Entry Cyberdeck and two installed programs. More decks are available through district services.</p>}
    <div className="rpg-button-row">{installed.map(h => <button key={h.id} disabled={locked} onClick={() => onUpdate(s => removeQuickhack(s, h.id))}>{h.name} / {h.ram} RAM / Remove</button>)}</div>
    </article>
    <article className="panel"><p className="eyebrow">LIBRARY / CRAFTING</p><h2>Quickhacks</h2><p className="muted">Craft with credits and Encrypted Data from district hacking. Short Circuit and Reboot Optics come with your field kit; Synapse Burnout is also awarded by a completed mission from act 3 onward. Each deck remembers its installed programs.</p>
    <p>Available: {state.resources.credits.toLocaleString()} credits / {state.resources.encryptedData.toLocaleString()} Encrypted Data</p>
    <div className="rpg-attribute-grid">{quickhacks.map(h => { const owned = state.inventory[h.id] > 0, active = installed.some(i => i.id === h.id); return <article key={h.id}><p className="eyebrow">{h.ram} RAM / {owned ? "OWNED" : "NOT OWNED"}</p><h3>{h.name}</h3><p>{h.description}</p><p>Craft: {h.cost.credits} credits + {h.cost.encryptedData} Encrypted Data / Technical {h.technical}</p><button disabled={!canCraftQuickhack(state, h.id)} onClick={() => onUpdate(s => craftQuickhack(s, h.id))}>{owned ? "In library" : "Craft program"}</button><button disabled={locked || !owned || !deck || (!active && installed.length >= deckCapacity(deck))} onClick={() => onUpdate(s => active ? removeQuickhack(s, h.id) : installQuickhack(s, h.id))}>{active ? "Remove from deck" : !deck ? "Equip a cyberdeck first" : installed.length >= deckCapacity(deck) ? "Deck full" : "Install on deck"}</button></article>; })}</div>
    </article>
  </section>;
}
