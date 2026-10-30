import { usePlayerNavigation } from "./PlayerNavigation";
import { ArrowUpRight, Backpack, Cpu, HeartPulse, MessageSquare, SlidersHorizontal, Terminal, TrendingUp, UserRound, Zap } from "lucide-react";

export type CharacterTool = "gear" | "cyberware" | "quickhacks" | "attributes" | "health" | "presets";
export function MainMenu({ onOpen, onCharacter, activeMission, points }: {
  onOpen: (section: "journal" | "progress" | "intel") => void;
  onCharacter: (section: CharacterTool) => void;
  activeMission?: string;
  points: number;
}) {
  const navigation = usePlayerNavigation();
  const tools = [
    { id: "gear", label: "Inventory & loadout", Icon: Backpack },
    { id: "cyberware", label: "Cyberware", Icon: Cpu },
    { id: "quickhacks", label: "Quickhacks", Icon: Zap },
    { id: "attributes", label: "Attributes & perks", Icon: UserRound },
    { id: "health", label: "Health & recovery", Icon: HeartPulse },
    { id: "presets", label: "Loadout presets", Icon: SlidersHorizontal },
  ] as const;
  return <div className="main-menu">
    <header><p className="eyebrow">RUNNER NETWORK</p><h1>Main</h1></header>
    <div className="main-shortcuts">{navigation.openCrafting && <button className="secondary-button" onClick={() => navigation.openCrafting?.()}>Craft gear</button>}{navigation.openIndex && <button className="secondary-button" onClick={navigation.openIndex}>Browse item index</button>}</div>
    <nav className="main-menu-grid" aria-label="Main section selection">
      <button className="main-menu-card main-menu-missions" onClick={() => onOpen("journal")}><MessageSquare /><span><strong>{activeMission ? "Continue mission" : "Missions"}</strong>{activeMission && <small>{activeMission}</small>}</span><ArrowUpRight /></button>
      {tools.map(({ id, label, Icon }) => <button className="main-menu-card" key={id} onClick={() => onCharacter(id)}><Icon /><span><strong>{label}</strong>{id === "attributes" && points > 0 && <small>{points} points available</small>}</span><ArrowUpRight /></button>)}
      <button className="main-menu-card" onClick={() => onOpen("progress")}><TrendingUp /><span><strong>Progress</strong></span><ArrowUpRight /></button>
      <button className="main-menu-card" onClick={() => onOpen("intel")}><Terminal /><span><strong>Field manual</strong></span><ArrowUpRight /></button>
    </nav>
  </div>;
}
