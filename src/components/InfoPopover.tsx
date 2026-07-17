import { Info } from "lucide-react";

export function InfoButton({ open, onToggle, label = "Screen help" }: { open: boolean; onToggle: () => void; label?: string }) {
  return (
    <button className={`info-button ${open ? "active" : ""}`} type="button" onClick={onToggle} aria-expanded={open} aria-label={label}>
      <Info size={17} />
    </button>
  );
}

export function ScreenHelpPanel({ title, lines, onClose }: { title: string; lines: string[]; onClose: () => void }) {
  return (
    <div className="info-popover">
      <button className="sim-cache-scrim" aria-label="Close help" onClick={onClose} />
      <section className="info-popover-panel">
        <p className="eyebrow">Help</p>
        <h3>{title}</h3>
        <ul>
          {lines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
