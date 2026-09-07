import { Radio } from "lucide-react";
import type { ReactNode } from "react";
import cityArt from "../assets/maps/Map.png";

export function NetworkHeader({ eyebrow, title, description, status, actions }: {
  eyebrow: string;
  title: string;
  description: string;
  status?: ReactNode;
  actions?: ReactNode;
}) {
  return <>
    <div className="network-masthead">
      <span><Radio size={14} /> NEON CITY / MERCENARY NETWORK</span>
      <span className="network-status">{status ?? "CONNECTED"}</span>
    </div>
    <header className="network-header" style={{ backgroundImage: `linear-gradient(90deg, #0b0d13 20%, #0b0d13e8 55%, #0b0d1380), url(${cityArt})` }}>
      <div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="network-description">{description}</p></div>
      {actions && <div className="network-header-actions">{actions}</div>}
    </header>
  </>;
}
