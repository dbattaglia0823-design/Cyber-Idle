import { Crosshair, Cpu, HeartPulse, Shield, Skull, Swords, UserRound, Zap } from "lucide-react";
import { useEffect, useRef } from "react";

export interface CombatPulse {
  id: string;
  action: string;
  damage: number;
  taken: number;
  blocked: number;
  healing: number;
  interrupted: boolean;
  defeated?: boolean;
}

// Presentation only: event keys restart short CSS effects, without timers or combat delays.
export function CombatScene({ target, pulse, incoming, aimed = false, danger = false, status = "Ready", melee = false }: {
  target: string; pulse?: CombatPulse; incoming?: { id: string; amount: number };
  aimed?: boolean; danger?: boolean; status?: string; melee?: boolean;
}) {
  const scene = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const header = document.querySelector(".topbar");
    if (!header || typeof ResizeObserver === "undefined") return;
    const update = () => scene.current?.style.setProperty("--combat-top", `${header.getBoundingClientRect().height + 8}px`);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(header);
    return () => observer.disconnect();
  }, []);
  const hack = pulse?.action.startsWith("quickhack:") || pulse?.action === "hack" || pulse?.action === "disrupt";
  const guarding = pulse?.action === "cover" || pulse?.action === "aim" || pulse?.action === "overclock";
  const attack = Boolean(pulse && pulse.damage > 0);
  const recoil = incoming?.amount ?? pulse?.taken ?? 0;
  const Icon = hack ? Cpu : melee ? Swords : Crosshair;
  return <div ref={scene} className={`combat-scene ${danger ? "threat-charging" : ""} ${aimed ? "shot-primed" : ""}`} aria-label="Combat animation">
    <div key={`runner-${pulse?.id ?? "ready"}`} className={`scene-fighter scene-runner ${attack ? "scene-firing" : ""} ${!incoming && recoil > 0 ? "scene-wounded" : ""} ${guarding ? "scene-guarding" : ""}`} aria-hidden="true">
      <UserRound size={40}/><span>RUNNER</span>{guarding && <Shield className="scene-shield" size={64}/>}
      {pulse && pulse.healing > 0 && <b className="scene-number scene-heal">+{pulse.healing}</b>}
      {recoil > 0 && <b key={incoming?.id ?? pulse?.id} className="scene-number scene-incoming">−{recoil}</b>}
      {pulse && pulse.blocked > 0 && <small className="scene-blocked">{pulse.blocked} blocked</small>}
    </div>
    <div className="scene-lane" aria-hidden="true">
      <Icon size={20}/><span>{pulse?.interrupted ? "Counter interrupted" : status}</span>
      {pulse && <div key={pulse.id} className={`scene-exchange ${hack ? "scene-hack" : melee ? "scene-melee" : "scene-shot"}`}>
        {attack && <><i className="scene-projectile"/><i className="scene-impact"/></>}
        {pulse.interrupted && <Zap className="scene-interrupt" size={20}/>}
        {pulse.action === "heal" && <HeartPulse className="scene-heal-ring" size={40}/>}
      </div>}
      {incoming && incoming.amount > 0 && <i key={incoming.id} className="scene-counter"/>}
      {!incoming && pulse && pulse.taken > 0 && <i key={`counter-${pulse.id}`} className="scene-counter"/>}
    </div>
    <div key={`target-${pulse?.id ?? "ready"}`} className={`scene-fighter scene-hostile ${attack ? "scene-struck" : ""} ${pulse?.defeated ? "scene-defeated" : ""}`} aria-hidden="true">
      <Skull size={40}/><span>{pulse?.defeated ? "NEUTRALIZED" : "HOSTILE"}</span>
      {attack && <b className="scene-number scene-outgoing">−{pulse!.damage}</b>}
      {aimed && <Crosshair className="scene-reticle" size={68}/>}
    </div>
    <div className="scene-target-name">{target}</div>
  </div>;
}
