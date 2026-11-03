import type { DistrictId } from "../types";
// Promote existing Street Combat targets; IDs remain stable for saved fights and logs.
export const streetBosses: { district: DistrictId; enemyId: string; name: string; legacyMission: string; identity: string; hp: number; damage: number; shielded?: boolean }[] = [
 {district:"neonRow",hp:320,damage:24,enemyId:"neon-row-kill-team",name:"Neon Row Kill Team Leader",legacyMission:"dead-drop",identity:"Coordinated street volleys; smart targeting and disruption break the formation."},
 {district:"rustYards",hp:560,damage:50,enemyId:"jackal-roadboss",name:"Jackal Roadboss",legacyMission:"burning-rubber",identity:"Welded convoy plating; tech and heavy impact crack the armor."},
 {district:"underpassMarket",hp:1200,damage:90,shielded:true,enemyId:"ghost-market-factor",name:"Ghost Market Factor",legacyMission:"ghost-price",identity:"Shielded market enforcer; precise fire and blades exploit its close-range blind spot."},
 {district:"blacknetQuarter",hp:2000,damage:120,enemyId:"null-oracle-shell",name:"Null Oracle Shell",legacyMission:"choir-of-static",identity:"Digital shell; neural and cyberdeck attacks expose the real process."},
 {district:"helixWard",hp:2400,damage:140,enemyId:"helix-ward-patrol-5",name:"Helix Security Captain",legacyMission:"borrowed-time",identity:"Biotech security armor; tech and smart targeting defeat the clinic interlocks."},
 {district:"glasslineDistrict",hp:3200,damage:180,shielded:true,enemyId:"prototype-handler",name:"Prototype Handler",legacyMission:"hostile-takeover",identity:"Shielded corporate prototype; tech and blacknet targeting disrupt its defense grid."},
 {district:"redlineBlocks",hp:3600,damage:220,enemyId:"redline-executioner",name:"Redline Executioner",legacyMission:"no-kings",identity:"Armored bounty hunter; heavy and armor-piercing attacks break the execution armor."},
 {district:"skylineCore",hp:8000,damage:260,shielded:true,enemyId:"skyline-core-patrol-5",name:"Skyline Security Commander",legacyMission:"afterimage",identity:"Executive shield command; exotic, sniper and neural weapons counter the skyline defense network."},
];
export function streetBoss(enemyId:string) { return streetBosses.find(boss=>boss.enemyId===enemyId); }
