import { districtLevelBands } from "./levelBands";
import { districts } from "./districts";
import { trainingXpPerSecond } from "./progressionPacing";
import type { DistrictId, SkillAction, SkillId, RewardBundle } from "../types";

// Each route supplies a small, predictable bill of materials for one profession.
// Old supply IDs stay valid, but no route grants an entire district's components.
type Route = [DistrictId, SkillAction["skillId"], string, string[]];
const routes: Route[] = [
  ["neonRow", "cyberware", "Strip Street Electronics", ["street-coil", "neon-circuit-fragment"]],
  ["neonRow", "vehicleTuning", "Recover Courier Wiring and Lenses", ["redline-wire", "lowgrade-optic-lens"]],
  ["neonRow", "medical", "Calibrate Reflex Chips", ["urban-reflex-chip"]],
  ["neonRow", "hacking", "Decode Discarded Schematics", ["rare-blueprint-fragment"]],
  ["rustYards", "vehicleTuning", "Rebuild Yard Drivetrains", ["engineCore", "chrome-jackal-gearset"]],
  ["rustYards", "scavenging", "Salvage Yard Frames", ["rust-plated-frame"]],
  ["rustYards", "cyberware", "Recondition Salvaged Servos", ["salvaged-servo", "drone-eye"]],
  ["rustYards", "vehicleTuning", "Repair Drone Motors", ["drone-motor", "drone-recovery-kit"]],
  ["underpassMarket", "hacking", "Decrypt Seized Ledgers", ["contraband-chip", "black-ledger-shard"]],
  ["underpassMarket", "scavenging", "Recover Broker Seals", ["ghost-market-token", "smuggler-seal"]],
  ["underpassMarket", "cyberware", "Rebuild Contraband Mod Cores", ["illegal-mod-core"]],
  ["underpassMarket", "cyberware", "Recondition Prototype Neural Cores", ["prototype-neural-core"]],
  ["blacknetQuarter", "hacking", "Decode Abandoned Servers", ["blacknet-cipher", "encrypted-memory-stack"]],
  ["blacknetQuarter", "cyberware", "Build Trace Scramblers", ["trace-scrambler-chip"]],
  ["blacknetQuarter", "hacking", "Isolate Rogue Processes", ["rogue-packet-core", "daemon-fragment"]],
  ["helixWard", "medical", "Compound Clinic Stabilizers", ["stabilizer-compound", "neural-stabilizer-compound"]],
  ["helixWard", "medical", "Culture Surgical Biomaterials", ["medical-gel-matrix", "bioware-thread"]],
  ["helixWard", "cyberware", "Recondition Neural Dampeners", ["neural-dampener"]],
  ["helixWard", "hacking", "Recover Clinic Authorizations", ["helix-authorization"]],
  ["glasslineDistrict", "cyberware", "Recondition Corporate Processors", ["executive-processor", "corporate-optic-lens"]],
  ["glasslineDistrict", "scavenging", "Recover Corporate Alloys", ["glassline-alloy", "stabilized-chrome-frame"]],
  ["glasslineDistrict", "hacking", "Decrypt Corporate Access Chips", ["corporate-access-token", "security-override-chip"]],
  ["glasslineDistrict", "cyberware", "Rebuild Prototype Weapon Cores", ["prototype-weapon-core"]],
  ["redlineBlocks", "cyberware", "Rebuild Armory Mechanisms", ["ballistic-core", "redline-trigger-kit"]],
  ["redlineBlocks", "scavenging", "Recover Armory Fittings", ["reinforced-grip", "armor-breaker-plate"]],
  ["redlineBlocks", "medical", "Compound Combat Stimulants", ["combat-stim-pack"]],
  ["skylineCore", "cyberware", "Restore Executive Processors", ["luxury-processor", "relic-circuit"]],
  ["skylineCore", "cyberware", "Rebuild Apex Neural Cores", ["apex-neural-core"]],
  ["skylineCore", "scavenging", "Recover Executive Chrome", ["legendary-chrome-matrix"]],
  ["skylineCore", "hacking", "Decrypt Executive Credentials", ["skyline-authorization", "boss-data-key"]],
];
const districtIds = Object.keys(districtLevelBands) as DistrictId[];
const seen = new Map<DistrictId, number>();
export const materialSupplyActions: SkillAction[] = routes.map(([district, skill, name, outputs]) => {
  const index = districtIds.indexOf(district), part = seen.get(district) ?? 0;
  seen.set(district, part + 1);
  const specialized = outputs.some(id => /prototype|apex|legendary|relic|boss-data|blueprint/.test(id));
  const durationMs = (specialized ? 40000 : 24000) + index * 3000;
  const costs: Partial<Record<SkillId, RewardBundle>> = {
    scavenging: {},
    cyberware: { scrap: -(6 + index * 2), circuitBoards: -(1 + Math.floor(index / 2)) },
    hacking: { encryptedData: -(4 + index * 2) },
    medical: { cyberwareParts: -(2 + index), encryptedData: -(1 + Math.floor(index / 2)) },
    vehicleTuning: { scrap: -(4 + index * 2), vehicleParts: -(2 + index) },
  };
  const rewards = { ...costs[skill] };
  if (specialized && skill === "cyberware") rewards.cyberwareParts = -(4 + index * 2);
  const level = districtLevelBands[district].entryLevel;
  return {
    id: part === 0 ? "supply-" + district : "supply-" + district + "-" + part,
    skillId: skill, name, district: districts.find(d => d.id === district)!.name, districtReq: district,
    description: (skill === "scavenging" ? "Recover selected materials from local salvage." : "Process basic supplies into specialized local components.") + " Produces only the listed items; all outputs are guaranteed.",
    levelReq: level, durationMs, xpReward: Math.round(trainingXpPerSecond(level) * durationMs / 1000 * 0.6), masteryXpReward: 10,
    rewards, itemRewards: Object.fromEntries(outputs.map(id => [id, 1])), tags: [skill, "supply", skill === "scavenging" ? "salvage" : "processing"],
    simCacheEligible: true, sourceHint: "Focused component processing. Costs are consumed every cycle.",
  };
});

export function districtSupplyItems(district: DistrictId) {
  return materialSupplyActions.filter(action => action.districtReq === district).flatMap(action => Object.keys(action.itemRewards ?? {}));
}

// Used to place legacy recipes in the same progression as the district gear sets.
export const materialStage: Record<string, number> = Object.fromEntries(
  materialSupplyActions.flatMap(action => Object.keys(action.itemRewards ?? {}).map(id => [id, action.levelReq])),
);
Object.assign(materialStage, {
  scrap: 1, circuitBoards: 1, encryptedData: 1, cyberwareParts: 1, vehicleParts: 1,
  armorPlating: 1, fuelCell: 1, navigationChip: 1, engineCore: 20, smugglerCompartment: 40, prototypeDriveUnit: 100,
  "bp-precision-grip": 10, "bp-stabilized-buffer": 10, "bp-scavenger-rig": 20,
  "bp-blacknet-tool": 60, "neural-dampener-blueprint": 80,
  "bp-corporate-cyberware": 100, "bp-prototype-implant": 140,
});
