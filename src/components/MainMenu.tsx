import { ArrowUpRight, Backpack, Cpu, HeartPulse, MessageSquare, SlidersHorizontal, Terminal, TrendingUp, UserRound, Zap } from "lucide-react";

export type CharacterTool = "gear" | "cyberware" | "quickhacks" | "attributes" | "health" | "presets";
export function MainMenu({ onOpen, onCharacter, activeMission, points }: {
  onOpen: (section: "journal" | "progress" | "intel") => void;
  onCharacter: (section: CharacterTool) => void;
  activeMission?: string;
  points: number;
}) {
  const tools = [
    { id: "gear", label: "Inventory & loadout", description: "Equip, upgrade and manage your gear.", Icon: Backpack },
    { id: "cyberware", label: "Cyberware", description: "Manage implants and your cyberdeck.", Icon: Cpu },
    { id: "quickhacks", label: "Quickhacks", description: "Craft and install combat programs.", Icon: Zap },
    { id: "attributes", label: "Attributes & perks", description: points ? points + " points available to spend." : "Shape your stats and abilities.", Icon: UserRound },
    { id: "health", label: "Health & recovery", description: "Manage healing and recovery.", Icon: HeartPulse },
    { id: "presets", label: "Loadout presets", description: "Save and switch equipment sets.", Icon: SlidersHorizontal },
  ] as const;
  return <div className="main-menu">
    <header><p className="eyebrow">RUNNER NETWORK</p><h1>Main</h1><p>Choose a section to get started.</p></header>
    <nav className="main-menu-grid" aria-label="Main section selection">
      <button className="main-menu-card main-menu-missions" onClick={() => onOpen("journal")}><MessageSquare /><span><strong>{activeMission ? "Continue mission" : "Missions"}</strong><small>{activeMission ?? "Main jobs, replayable local gigs and fixer services."}</small></span><ArrowUpRight /></button>
      {tools.map(({ id, label, description, Icon }) => <button className="main-menu-card" key={id} onClick={() => onCharacter(id)}><Icon /><span><strong>{label}</strong><small>{description}</small></span><ArrowUpRight /></button>)}
      <button className="main-menu-card" onClick={() => onOpen("progress")}><TrendingUp /><span><strong>Progress</strong><small>District goals, milestones and unlocks.</small></span><ArrowUpRight /></button>
      <button className="main-menu-card" onClick={() => onOpen("intel")}><Terminal /><span><strong>Field manual</strong><small>Learn the city's systems and controls.</small></span><ArrowUpRight /></button>
    </nav>
  </div>;
}
