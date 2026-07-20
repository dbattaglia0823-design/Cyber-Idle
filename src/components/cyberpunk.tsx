import type { ReactNode } from "react";

export function NeonPanel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <article className={`panel neon-panel ${className}`}>{children}</article>;
}

export function CyberpunkProgressBar({ value, label }: { value: number; label?: string }) {
  return (
    <div className="progress-wrap">
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </div>
      {label && <span>{label}</span>}
    </div>
  );
}

export function ThreatMeter({ value, tier }: { value: number; tier: string }) {
  return (
    <div className="threat-meter">
      <span>{tier}</span>
      <CyberpunkProgressBar value={value} />
    </div>
  );
}

export function FactionBadge({ label }: { label: string }) {
  return <span className="faction-badge">{label}</span>;
}

export function RequirementList({ items }: { items: string[] }) {
  return <p className="fine">Requirements: {items.length ? items.join(", ") : "None"}</p>;
}

export function ModifierList({ items }: { items: string[] }) {
  return <p className="fine">Modifiers: {items.length ? items.join(", ") : "None"}</p>;
}

export function ActivityCard({ children, locked = false, className = "" }: { children: ReactNode; locked?: boolean; className?: string }) {
  return <article className={`action-card vertical hologram-card ${className} ${locked ? "locked-card" : ""}`}>{children}</article>;
}

export function LockedOverlay({ text }: { text: string }) {
  return <div className="locked-overlay">{text}</div>;
}

export function TerminalLog({ children }: { children: ReactNode }) {
  return <div className="terminal-log">{children}</div>;
}
