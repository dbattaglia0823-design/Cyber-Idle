import { Radio } from "lucide-react";
import type { ReactNode } from "react";
import cityArt from "../assets/maps/Map.png";
import "./rpg.css";

/** The same card header for Main, the city map, and every district. */
export function NetworkHero({ title, eyebrow, description, actions, status, progress }: {
  title: [string, string];
  eyebrow: string;
  description: ReactNode;
  actions: ReactNode;
  status?: ReactNode;
  progress: { label: string; value: number; maximum: number; suffix: string; note: string };
}) {
  const percent = Math.max(0, Math.min(100, progress.value / Math.max(1, progress.maximum) * 100));
  return <>
    <header className="rpg-masthead">
      <div><Radio size={15} /><span>NEON CITY / MERCENARY NETWORK</span><b>CONNECTED</b></div>
      <span>{status}</span>
    </header>
    <div className="rpg-hero" style={{ backgroundImage: `linear-gradient(90deg,#0b0d13 15%,#0b0d13d9 48%,#0b0d1322),url(${cityArt})` }}>
      <div className="network-hero-copy">
        <p className="rpg-eyebrow">{eyebrow}</p>
        <h1>{title[0]}<span>//</span><br />{title[1]}</h1>
        <p className="rpg-hero-copy">{description}</p>
        <div className="rpg-hero-actions">{actions}</div>
      </div>
      <div className="rpg-hero-location">
        <span>{progress.label}</span>
        <strong>{progress.value}<small>{progress.suffix}</small></strong>
        <div className="rpg-bar" role="progressbar" aria-label={progress.label} aria-valuemin={0} aria-valuemax={progress.maximum} aria-valuenow={progress.value}><i style={{ width: `${percent}%` }} /></div>
        <p>{progress.note}</p>
      </div>
    </div>
  </>;
}
