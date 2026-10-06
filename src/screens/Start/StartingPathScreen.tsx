import { useState } from "react";
import { startingPaths } from "../../data/startingPaths";
import type { StartingPathId } from "../../types";
import type { SaveSlotId, SaveSlotSummary } from "../../systems/saveSystem";
import corporateDefectorPathImage from "../../assets/starting-paths/CorporateDefector.png";
import outriderPathImage from "../../assets/starting-paths/Outrider.png";
import streetbornPathImage from "../../assets/starting-paths/Streetborn.png";
export const startingPathImages: Record<StartingPathId, string> = {
  outrider: outriderPathImage,
  streetborn: streetbornPathImage,
  corporateDefector: corporateDefectorPathImage,
};
export function StartingPathScreen({
  activeSaveSlot,
  saveSlots,
  onChoose,
  onSwitchSave,
  onNewSave,
}: {
  activeSaveSlot: SaveSlotId;
  saveSlots: SaveSlotSummary[];
  onChoose: (pathId: StartingPathId) => void;
  onSwitchSave: (slot: SaveSlotId) => void;
  onNewSave: (slot: SaveSlotId) => void;
}) {
  const [selectedPath, setSelectedPath] = useState<StartingPathId>("streetborn");
  const selected = startingPaths.find((path) => path.id === selectedPath) ?? startingPaths[0];
  return (
    <div className="app-shell path-screen">
      <main className="path-select-main">
        <section className="path-save-slots">
          {saveSlots.map((slot) => (
            <button key={slot.slot} className={activeSaveSlot === slot.slot ? "active" : ""} onClick={() => (slot.exists ? onSwitchSave(slot.slot) : onNewSave(slot.slot))}>
              <span>Slot {slot.slot}{activeSaveSlot === slot.slot ? " / Active" : ""}</span>
              <strong>{slot.exists ? startingPaths.find((path) => path.id === slot.startingPath)?.name ?? "No Path" : "Empty"}</strong>
            </button>
          ))}
        </section>
        <section className="path-hero">
          <div>
            <p className="eyebrow">01 / CHOOSE YOUR ORIGIN</p>
            <h1>Choose Your Lifepath</h1>
            <p className="muted">Choose the background you like. Every lifepath can use weapons, quickhacks and crafting. Your origin adds bonuses and special story approaches, and is permanent for this save.</p>
          </div>
          <div className="path-selected-chip">
            <StartingPathBadge pathId={selected.id} name={selected.name} />
            <span>{selected.name}</span>
          </div>
        </section>
        <div className="start-roadmap" aria-label="First steps"><span><b>1</b> Choose an origin</span><span><b>2</b> Collect your free field kit</span><span><b>3</b> Prepare for Dead Drop</span></div>
        <section className="path-choice-grid">
          {startingPaths.map((path) => (
            <article className={`path-choice-card ${selectedPath === path.id ? "selected" : ""}`} key={path.id} onClick={() => setSelectedPath(path.id)}>
              <button className="path-image-button" type="button" aria-label={`Select ${path.name}`} aria-pressed={selectedPath === path.id}>
                <img src={startingPathImages[path.id]} alt="" />
                <span className="path-image-vignette" />
                <strong>{path.name}</strong>
              </button>
              <div className="path-choice-copy">
                <p className="eyebrow">Origin Profile</p>
                <h2>{path.name}</h2>
                <p className="muted">{path.theme}</p>
                <div className="path-trait-list">
                  <div>
                    <span>Advantages</span>
                    {path.bonuses.map((bonus) => <p key={bonus}>{bonus}</p>)}
                  </div>
                  <div>
                    <span>Complications</span>
                    {path.penalties.map((penalty) => <p key={penalty}>{penalty}</p>)}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>
        <section className="path-lockbar">
          <div>
            <p className="eyebrow">Selected</p>
            <h2>{selected.name}</h2>
            <p className="muted">{selected.theme}</p>
          </div>
          <button className="primary-button" onClick={() => onChoose(selected.id)}>Lock In {selected.name}</button>
        </section>
      </main>
    </div>
  );
}

export function StartingPathBadge({ pathId, name }: { pathId: StartingPathId; name: string }) {
  return (
    <span className="starting-path-badge" title={name} aria-label={name}>
      <img src={startingPathImages[pathId]} alt="" />
    </span>
  );
}

