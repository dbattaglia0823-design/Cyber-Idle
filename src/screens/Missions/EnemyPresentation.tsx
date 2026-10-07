import { useId } from "react";
import { encounterArtwork, districtAccents } from "../../data/districtPresentation";
import type { RpgMission } from "../../data/rpgCampaign";
export function EnemyPresentation({ mission, index }: { mission: RpgMission; index: number }) {
 const art = encounterArtwork[mission.id + ":" + index];
 const gradientId = useId();
 return <div className={"enemy-portrait enemy-portrait-" + mission.district} style={{color:districtAccents[mission.district]}} aria-label={mission.enemies[index]}>
      {art ? <img className="rpg-enemy-silhouette encounter-art" src={art.src} alt={art.alt} /> : <svg className="rpg-enemy-silhouette" viewBox="0 0 220 240" role="img" aria-label={mission.enemies[index]}><defs><linearGradient id={gradientId} x2="0" y2="1"><stop stopColor="#8f3548"/><stop offset="1" stopColor="#221e2b"/></linearGradient></defs><path d="M85 25 110 15 137 26 145 71 129 89 94 89 76 70Z" fill={"url(#" + gradientId + ")"} stroke="currentColor"/><path d="M82 49 139 49 134 60 89 60Z" fill="#f4e16c"/><path d="M74 98 96 91 127 91 151 98 174 132 164 210 56 210 45 131Z" fill={"url(#" + gradientId + ")"} stroke="#be5264"/><path d="M80 103 110 122 143 103 132 155 89 155Z" fill="#432a39" stroke="currentColor"/><path d="M48 111 27 131 20 191 44 202 64 149M170 112 193 131 202 191 176 202 159 149" fill="#332330" stroke="#93455a"/><path d="M58 218H165M10 8H42M10 8V40M210 8H178M210 8V40M10 232H42M10 232V200M210 232H178M210 232V200" fill="none" stroke="currentColor"/><path d="M110 1V240M0 119H220" stroke="#ff657525" strokeDasharray="3 6"/></svg>}
<span className="enemy-portrait-code">{mission.district === "skylineCore" ? "APEX" : mission.district.replace(/([A-Z])/g, " $1").toUpperCase()} / {String(index + 1).padStart(2,"0")}</span></div>;
}
