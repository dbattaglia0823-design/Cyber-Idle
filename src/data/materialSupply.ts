import { districtSpecificMaterials } from "./districtMastery";
import { districtLevelBands } from "./levelBands";
import { districts } from "./districts";
import { pacedActionXp } from "./progressionPacing";
import type { DistrictId, SkillAction } from "../types";

// Every district has a repeatable supply route before its equipment tier unlocks.
// Rare combat drops remain a shortcut; essential components never depend on luck.
const routes: Array<{ district: DistrictId; name: string; description: string; extra?: string[] }> = [
  { district: "neonRow", name: "Strip Street Electronics", description: "Recover reusable coils, lenses, wire, and implant circuits from discarded street electronics.", extra: ["rare-blueprint-fragment"] },
  { district: "rustYards", name: "Dismantle Yard Machinery", description: "Strip decommissioned engines and drones for workshop components.", extra: ["drone-eye", "drone-recovery-kit"] },
  { district: "underpassMarket", name: "Sort Seized Contraband", description: "Work a broker's salvage bench for a share of recovered chips, seals, and modification cores.", extra: ["prototype-neural-core"] },
  { district: "blacknetQuarter", name: "Recover Abandoned Servers", description: "Recover memory stacks and isolated code fragments from disconnected Blacknet servers." },
  { district: "helixWard", name: "Reclaim Clinic Supplies", description: "Sort sterile surplus, reusable dampeners, and approved biomaterials for the clinic.", extra: ["neural-stabilizer-compound"] },
  { district: "glasslineDistrict", name: "Salvage Corporate Hardware", description: "Dismantle retired corporate equipment under a salvage permit.", extra: ["stabilized-chrome-frame", "prototype-weapon-core"] },
  { district: "redlineBlocks", name: "Recover Armory Components", description: "Reclaim combat hardware and medical supplies from decommissioned crew armories." },
  { district: "skylineCore", name: "Recover Executive Prototypes", description: "Restore discarded executive prototypes and recover their rare cores and authorization modules.", extra: ["boss-data-key"] },
];

export const materialSupplyActions: SkillAction[] = routes.map((route, index) => ({
  id: `supply-${route.district}`,
  skillId: "scavenging",
  name: route.name,
  district: districts.find(district => district.id === route.district)!.name,
  districtReq: route.district,
  description: `${route.description} Every listed component is guaranteed on completion.`,
  levelReq: districtLevelBands[route.district].entryLevel,
  durationMs: 10000 + index * 2000,
  xpReward: pacedActionXp(districtLevelBands[route.district].entryLevel, 10000 + index * 2000, 40 + index * 110),
  masteryXpReward: 10,
  rewards: index === 0 ? { scrap: 2, circuitBoards: 1 } : { scrap: -(6 + index * 2) },
  itemRewards: Object.fromEntries([...districtSpecificMaterials[route.district], ...(route.extra ?? [])].map(id => [id, 1])),
  tags: ["scavenging", "salvage", "supply"],
  simCacheEligible: true,
  sourceHint: "Guaranteed district components. Repeat to resupply crafting.",
}));

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
