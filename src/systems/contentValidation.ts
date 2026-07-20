import { bosses } from "../data/bosses";
import { combatZones } from "../data/combat";
import { companions } from "../data/companions";
import { cityDistrictOrder } from "../data/cityMap";
import { districtEvents } from "../data/districtEvents";
import { districts } from "../data/districts";
import { factions } from "../data/factions";
import { fixers } from "../data/fixers";
import { housingOptions } from "../data/housing";
import { getItem, items } from "../data/items";
import { jobs } from "../data/jobs";
import { districtLevelBands, majorUnlockLevels, MAX_MAIN_SKILL_LEVEL } from "../data/levelBands";
import { operations } from "../data/operations";
import { percentDropTables } from "../data/percentDrops";
import { recipes } from "../data/recipes";
import { ripperdocClinics } from "../data/ripperdocClinics";
import { ripperdocServices } from "../data/ripperdocs";
import { skillActions } from "../data/skills";
import { storyArcs } from "../data/storyArcs";
import { vehicles } from "../data/vehicles";
import { vendors } from "../data/vendors";
import type { CyberwareSlot, DistrictId, GearSlot, ItemDefinition, RewardBundle, SkillId } from "../types";

const resourceIds = new Set([
  "credits",
  "scrap",
  "circuitBoards",
  "encryptedData",
  "cyberwareParts",
  "reputation",
  "heat",
  "vehicleParts",
  "armorPlating",
  "fuelCell",
  "navigationChip",
  "smugglerCompartment",
  "engineCore",
  "prototypeDriveUnit",
]);

const skillLabels: Record<SkillId, string> = {
  scavenging: "Scavenging",
  hacking: "Hacking",
  cyberware: "Cyberware Engineering",
  combat: "Street Combat",
  vehicleTuning: "Vehicle Tuning",
  blackMarket: "Black Market",
  medical: "Medical Knowledge",
  streetcraft: "Streetcraft",
};

export interface DistrictContentCounts {
  districtId: DistrictId;
  actions: number;
  blacknetActions: number;
  contracts: number;
  combatEnemies: number;
  operations: number;
  ripperdocServices: number;
  marketItems: number;
  housing: number;
  vehicles: number;
  storyArcs: number;
  events: number;
}

export interface ContentValidationReport {
  warnings: string[];
  missingReferences: string[];
  duplicateIds: string[];
  balanceWarnings: string[];
  districtCounts: DistrictContentCounts[];
}

let reported = false;

export function reportContentValidation() {
  if (reported) return;
  reported = true;
  const warnings = validateContent();
  if (warnings.length) console.warn("[district-content-validation]", warnings);
}

export function validateContent() {
  const report = getContentValidationReport();
  return [
    ...report.warnings,
    ...report.missingReferences,
    ...report.duplicateIds,
    ...report.balanceWarnings,
  ];
}

export function getContentValidationReport(): ContentValidationReport {
  const warnings: string[] = [];
  const missingReferences: string[] = [];
  const duplicateIds: string[] = [];
  const balanceWarnings: string[] = [];
  const enemies = combatZones.flatMap((zone) => zone.enemies);
  const enemyIds = new Set(enemies.map((enemy) => enemy.id));
  const bossIds = new Set(bosses.map((boss) => boss.id));
  const itemIds = new Set(items.map((item) => item.id));
  const fixerIds = new Set(fixers.map((fixer) => fixer.id));
  const factionIds = new Set(factions.map((faction) => faction.id));
  const districtIds = new Set(cityDistrictOrder);
  const actionIds = new Set(skillActions.map((action) => action.id));
  const jobIds = new Set(jobs.map((job) => job.id));
  const operationIds = new Set(operations.map((operation) => operation.id));
  const companionIds = new Set(companions.map((companion) => companion.id));
  const recipeIds = new Set(recipes.map((recipe) => recipe.id));

  const districtCounts = cityDistrictOrder.map((districtId) => {
    const actions = skillActions.filter((action) => action.districtReq === districtId);
    const blacknetActions = actions.filter((action) => action.skillId === "hacking");
    const contracts = jobs.filter((job) => job.districtId === districtId);
    const enemies = combatZones.filter((zone) => zoneForDistrict(districtId).includes(zone.id)).flatMap((zone) => zone.enemies);
    const districtOperations = operations.filter((operation) => operation.districtId === districtId);
    const services = ripperdocServices.filter((service) => service.districtId === districtId);
    const districtVendors = vendors.filter((vendor) => vendor.districtId === districtId);
    const marketItems = districtVendors.reduce((sum, vendor) => sum + vendor.inventory.length, 0);
    const housing = housingOptions.filter((option) => option.districtId === districtId);
    const garageVehicles = vehicles.filter((vehicle) => vehicle.districtId === districtId);
    const districtStory = storyArcs.filter((arc) => arc.districtId === districtId);
    const events = districtEvents.filter((event) => event.districtId === districtId);

    warnIfThin(warnings, districtId, "actions", actions.length);
    warnIfThin(warnings, districtId, "contracts", contracts.length);
    warnIfThin(warnings, districtId, "combat enemies", enemies.length);
    warnIfThin(warnings, districtId, "operations", districtOperations.length);
    if (ripperdocClinics.some((clinic) => clinic.districtId === districtId)) warnIfThin(warnings, districtId, "ripperdoc services", services.length);
    if (vendors.some((vendor) => vendor.districtId === districtId)) {
      warnIfThin(warnings, districtId, "market items", marketItems);
    }
    if (housing.length) warnIfThin(warnings, districtId, "housing", housing.length);
    if (districtId === "rustYards") warnIfThin(warnings, districtId, "garage vehicles", garageVehicles.length);

    return {
      districtId,
      actions: actions.length,
      blacknetActions: blacknetActions.length,
      contracts: contracts.length,
      combatEnemies: enemies.length,
      operations: districtOperations.length,
      ripperdocServices: services.length,
      marketItems,
      housing: housing.length,
      vehicles: garageVehicles.length,
      storyArcs: districtStory.length,
      events: events.length,
    };
  });

  duplicateWarnings(duplicateIds, "item", items.map((item) => item.id));
  duplicateWarnings(duplicateIds, "recipe", recipes.map((recipe) => recipe.id));
  duplicateWarnings(duplicateIds, "skill action", skillActions.map((action) => action.id));
  duplicateWarnings(duplicateIds, "operation", operations.map((operation) => operation.id));
  duplicateWarnings(duplicateIds, "job", jobs.map((job) => job.id));
  duplicateWarnings(duplicateIds, "enemy", enemies.map((enemy) => enemy.id));
  duplicateWarnings(duplicateIds, "boss", bosses.map((boss) => boss.id));
  duplicateWarnings(duplicateIds, "housing", housingOptions.map((housing) => housing.id));
  duplicateWarnings(duplicateIds, "vendor", vendors.map((vendor) => vendor.id));
  duplicateWarnings(duplicateIds, "ripperdoc service", ripperdocServices.map((service) => service.id));
  duplicateWarnings(duplicateIds, "ripperdoc clinic", ripperdocClinics.map((clinic) => clinic.id));
  duplicateWarnings(duplicateIds, "vehicle", vehicles.map((vehicle) => vehicle.id));
  duplicateWarnings(duplicateIds, "fixer", fixers.map((fixer) => fixer.id));
  duplicateWarnings(duplicateIds, "companion", companions.map((companion) => companion.id));
  duplicateWarnings(duplicateIds, "story arc", storyArcs.map((arc) => arc.id));
  duplicateWarnings(duplicateIds, "district event", districtEvents.map((event) => event.id));

  skillActions.forEach((action) => {
    if (!skillLabels[action.skillId]) missingReferences.push(`${action.id} uses missing skill ${action.skillId}`);
    if (action.districtReq) validateKnown(missingReferences, districtIds, `${action.id} district`, action.districtReq);
    validateRewardBundle(missingReferences, `${action.id} rewards`, action.rewards);
    if (action.levelReq < 1 || action.levelReq > MAX_MAIN_SKILL_LEVEL) balanceWarnings.push(`${action.id} has level requirement outside 1-${MAX_MAIN_SKILL_LEVEL}`);
    if (!majorUnlockLevels.includes(action.levelReq as (typeof majorUnlockLevels)[number])) {
      balanceWarnings.push(`${action.id} uses non-milestone level requirement ${action.levelReq}`);
    }
    if (action.durationMs < 2000 || action.durationMs > 30000) {
      balanceWarnings.push(`${action.id} base duration should stay between 2s and 30s`);
    }
    if (action.districtReq) {
      const band = districtLevelBands[action.districtReq];
      if (action.levelReq < band.min && action.districtReq !== "neonRow") {
        balanceWarnings.push(`${action.id} is below ${action.districtReq} band ${band.min}-${band.max}`);
      }
      if (action.levelReq > band.max) {
        balanceWarnings.push(`${action.id} is above ${action.districtReq} band ${band.min}-${band.max}`);
      }
    }
    action.rareDrops?.forEach((drop) => {
      validateItemRef(missingReferences, `${action.id} rare drop`, drop.id);
      validateChance(balanceWarnings, `${action.id} rare drop ${drop.id}`, drop.chance);
    });
  });

  operations.forEach((operation) => {
    if (!bossIds.has(operation.bossId)) missingReferences.push(`${operation.id} references missing boss ${operation.bossId}`);
    validateRewardBundle(missingReferences, `${operation.id} completion rewards`, operation.completionRewards);
    validateRewardBundle(missingReferences, `${operation.id} first clear rewards`, operation.firstClearRewards);
    validateRewardBundle(missingReferences, `${operation.id} repeat rewards`, operation.repeatClearRewards);
    Object.keys(operation.requiredItems ?? {}).forEach((itemId) => validateItemRef(missingReferences, `${operation.id} required item`, itemId));
    Object.keys(operation.factionReputation).forEach((factionId) => validateKnown(missingReferences, factionIds, `${operation.id} faction`, factionId));
    Object.keys(operation.fixerTrust ?? {}).forEach((fixerId) => validateKnown(missingReferences, fixerIds, `${operation.id} fixer trust`, fixerId));
    operation.stages.flatMap((stage) => stage.enemyIds).forEach((enemyId) => {
      if (!enemyIds.has(enemyId)) missingReferences.push(`${operation.id} references missing enemy ${enemyId}`);
    });
    operation.rareDrops.forEach((drop) => {
      validateItemRef(missingReferences, `${operation.id} rare drop`, drop.id);
      validateChance(balanceWarnings, `${operation.id} rare drop ${drop.id}`, drop.chance);
    });
  });

  enemies.forEach((enemy) => {
    validateKnown(missingReferences, districtIds, `${enemy.id} preferred district`, enemy.preferredDistrict);
    validateKnown(missingReferences, factionIds, `${enemy.id} faction`, enemy.factionAlignment);
    enemy.drops.forEach((drop) => {
      validateItemRef(missingReferences, `${enemy.id} drop`, drop.id);
      validateChance(balanceWarnings, `${enemy.id} drop ${drop.id}`, drop.chance);
    });
  });

  bosses.forEach((boss) => {
    validateRewardBundle(missingReferences, `${boss.id} first clear rewards`, boss.firstClearRewards);
    validateRewardBundle(missingReferences, `${boss.id} repeat rewards`, boss.repeatRewards);
    boss.drops.forEach((drop) => {
      validateItemRef(missingReferences, `${boss.id} drop`, drop.id);
      validateChance(balanceWarnings, `${boss.id} drop ${drop.id}`, drop.chance);
    });
  });

  recipes.forEach((recipe) => {
    if (!skillLabels[recipe.requiredSkill]) missingReferences.push(`${recipe.id} uses missing skill ${recipe.requiredSkill}`);
    validateItemRef(missingReferences, `${recipe.id} output`, recipe.outputItemId);
    Object.keys(recipe.inputCosts).forEach((itemId) => validateItemRef(missingReferences, `${recipe.id} input`, itemId));
    if (recipe.inputCosts[recipe.outputItemId]) balanceWarnings.push(`${recipe.id} requires its own output ${recipe.outputItemId}`);
    if (recipe.requiredBlueprint) validateItemRef(missingReferences, `${recipe.id} blueprint`, recipe.requiredBlueprint);
    if (recipe.outputQuantity <= 0) balanceWarnings.push(`${recipe.id} has invalid output quantity ${recipe.outputQuantity}`);
    if (recipe.durationMs <= 0) balanceWarnings.push(`${recipe.id} has invalid duration ${recipe.durationMs}`);
  });

  jobs.forEach((job) => {
    validateKnown(missingReferences, fixerIds, `${job.id} fixer`, job.fixerId);
    validateKnown(missingReferences, factionIds, `${job.id} faction`, job.factionId);
    validateRewardBundle(missingReferences, `${job.id} rewards`, job.rewards);
    Object.keys(job.skillXp ?? {}).forEach((skillId) => validateKnown(missingReferences, new Set(Object.keys(skillLabels)), `${job.id} skill XP`, skillId));
    Object.keys(job.factionReputation).forEach((factionId) => validateKnown(missingReferences, factionIds, `${job.id} faction reputation`, factionId));
    Object.keys(job.companionRelationship ?? {}).forEach((companionId) => validateKnown(missingReferences, companionIds, `${job.id} companion`, companionId));
    if (job.rareReward) validateItemRef(missingReferences, `${job.id} rare reward`, job.rareReward);
    job.rareRewardTable?.forEach((drop) => {
      validateItemRef(missingReferences, `${job.id} rare table`, drop.itemId);
      validatePercentChance(balanceWarnings, `${job.id} rare table ${drop.itemId}`, drop.chancePercent);
    });
    if (job.baseSuccessChance <= 0 || job.baseSuccessChance > 1) balanceWarnings.push(`${job.id} has invalid base success chance ${job.baseSuccessChance}`);
  });

  vendors.forEach((vendor) => {
    Object.keys(vendor.factionDiscounts ?? {}).forEach((factionId) => validateKnown(missingReferences, factionIds, `${vendor.id} faction discount`, factionId));
    vendor.inventory.forEach((entry) => {
      validateItemRef(missingReferences, `${vendor.id} inventory`, entry.itemId);
      validateKnown(missingReferences, factionIds, `${vendor.id} inventory rank`, Object.keys(entry.requiredFactionRank ?? {})[0]);
      validateKnown(missingReferences, districtIds, `${vendor.id} inventory district`, entry.requiredDistrictUnlock);
      if (entry.price <= 0) balanceWarnings.push(`${vendor.id} sells ${entry.itemId} for invalid price ${entry.price}`);
    });
  });

  ripperdocServices.forEach((service) => {
    validateRewardBundle(missingReferences, `${service.id} cost`, service.cost);
    Object.keys(service.materialRequirements ?? {}).forEach((itemId) => validateItemRef(missingReferences, `${service.id} material`, itemId));
    validateKnown(missingReferences, factionIds, `${service.id} faction discount`, service.factionDiscount);
    if (service.fixerTrustDiscount) validateKnown(missingReferences, fixerIds, `${service.id} fixer discount`, service.fixerTrustDiscount);
  });

  ripperdocClinics.forEach((clinic) => {
    validateKnown(missingReferences, districtIds, `${clinic.id} district`, clinic.districtId);
    validateKnown(missingReferences, factionIds, `${clinic.id} faction discount`, clinic.factionDiscount);
    clinic.cyberwareInventory.forEach((itemId) => validateItemRef(missingReferences, `${clinic.id} cyberware inventory`, itemId));
  });

  vehicles.forEach((vehicle) => {
    validateRewardBundle(missingReferences, `${vehicle.id} cost`, vehicle.cost);
  });

  housingOptions.forEach((housing) => {
    validateKnown(missingReferences, districtIds, `${housing.id} district`, housing.districtId);
    if (housing.cost <= 0) balanceWarnings.push(`${housing.id} has invalid cost ${housing.cost}`);
  });

  fixers.forEach((fixer) => {
    validateKnown(missingReferences, districtIds, `${fixer.id} district`, fixer.districtId);
    validateKnown(missingReferences, factionIds, `${fixer.id} faction`, fixer.factionId);
    fixer.companionUnlocks.forEach((id) => validateKnown(missingReferences, companionIds, `${fixer.id} companion unlock`, id));
    fixer.housingUnlocks.forEach((id) => validateKnown(missingReferences, new Set(housingOptions.map((housing) => housing.id)), `${fixer.id} housing unlock`, id));
    fixer.districtLeads?.forEach((id) => validateKnown(missingReferences, districtIds, `${fixer.id} district lead`, id));
  });

  districts.forEach((district) => {
    district.associatedFactions.forEach((id) => validateKnown(missingReferences, factionIds, `${district.id} faction`, id));
  });

  companions.forEach((companion) => {
    validateKnown(missingReferences, districtIds, `${companion.id} district`, companion.districtId);
    validateKnown(missingReferences, factionIds, `${companion.id} faction`, companion.factionId);
  });

  storyArcs.forEach((arc) => {
    validateKnown(missingReferences, districtIds, `${arc.id} district`, arc.districtId);
    arc.involvedFixers.forEach((id) => validateKnown(missingReferences, fixerIds, `${arc.id} fixer`, id));
    arc.involvedFactions.forEach((id) => validateKnown(missingReferences, factionIds, `${arc.id} faction`, id));
    arc.involvedCompanions.forEach((id) => validateKnown(missingReferences, companionIds, `${arc.id} companion`, id));
    validateRewardBundle(missingReferences, `${arc.id} rewards`, arc.rewards ?? {});
    const stepIds = new Set(arc.steps.map((step) => step.id));
    duplicateWarnings(duplicateIds, `${arc.id} story step`, arc.steps.map((step) => step.id));
    arc.steps.forEach((step) => {
      validateStoryTarget(missingReferences, arc.id, step.objective.type, step.objective.target, { actionIds, jobIds, enemyIds, fixerIds, operationIds, districtIds, companionIds });
      step.nextStepIds?.forEach((id) => validateKnown(missingReferences, stepIds, `${arc.id}/${step.id} next step`, id));
      validateRewardBundle(missingReferences, `${arc.id}/${step.id} rewards`, step.rewards ?? {});
      step.choices?.forEach((choice) => {
        validateRewardBundle(missingReferences, `${arc.id}/${step.id}/${choice.id} rewards`, choice.rewards ?? {});
        Object.keys(choice.factionReputation ?? {}).forEach((id) => validateKnown(missingReferences, factionIds, `${choice.id} faction`, id));
        Object.keys(choice.fixerTrust ?? {}).forEach((id) => validateKnown(missingReferences, fixerIds, `${choice.id} fixer`, id));
        Object.keys(choice.companionRelationship ?? {}).forEach((id) => validateKnown(missingReferences, companionIds, `${choice.id} companion`, id));
        Object.keys(choice.localStanding ?? {}).forEach((id) => validateKnown(missingReferences, districtIds, `${choice.id} local standing`, id));
      });
    });
  });

  validateItemDefinitions(balanceWarnings, items);

  Object.entries(percentDropTables).forEach(([sourceId, drops]) => {
    if (!enemyIds.has(sourceId) && !bossIds.has(sourceId)) warnings.push(`Percent drop table ${sourceId} is not attached to a known enemy or boss`);
    drops.forEach((drop) => {
      validateItemRef(missingReferences, `${sourceId} percent drop`, drop.itemId);
      validatePercentChance(balanceWarnings, `${sourceId} percent drop ${drop.itemId}`, drop.chancePercent);
      if (drop.minQuantity <= 0 || drop.maxQuantity < drop.minQuantity) balanceWarnings.push(`${sourceId} percent drop ${drop.itemId} has invalid quantity range`);
    });
  });

  return { warnings, missingReferences, duplicateIds, balanceWarnings, districtCounts };
}

function validateItemDefinitions(warnings: string[], definitions: ItemDefinition[]) {
  const gearSlots: Set<GearSlot> = new Set(["weapon", "head", "chest", "hands", "legs", "boots", "accessory1", "accessory2"]);
  const cyberwareSlots: Set<CyberwareSlot> = new Set(["neural", "optics", "arms", "legs", "skin", "skeleton", "operatingSystem", "utility"]);
  definitions.forEach((item) => {
    if (!item.rarity) warnings.push(`${item.id} is missing rarity`);
    if (!item.type) warnings.push(`${item.id} is missing type`);
    if (!item.sourceHint?.trim()) warnings.push(`${item.id} is missing source hint`);
    if ((item.type === "Weapon" || item.type === "Armor") && (!item.slot || !gearSlots.has(item.slot as GearSlot))) warnings.push(`${item.id} has invalid equipment slot ${item.slot ?? "none"}`);
    if (item.type === "Cyberware") {
      if (!item.slot || !cyberwareSlots.has(item.slot as CyberwareSlot)) warnings.push(`${item.id} has invalid cyberware slot ${item.slot ?? "none"}`);
      if (typeof item.instabilityLoad !== "number") warnings.push(`${item.id} cyberware is missing instabilityLoad`);
    }
    if ((item.type === "Weapon" || item.type === "Armor" || item.type === "Cyberware") && !item.requiredLevel) warnings.push(`${item.id} is missing required level`);
    if ((item.type === "Weapon" || item.type === "Armor") && !item.stats && !item.modifiers) warnings.push(`${item.id} equipment has no stats or modifiers`);
    if (item.type === "Cyberware" && !item.modifiers) warnings.push(`${item.id} cyberware has no modifiers`);
  });
}

function warnIfThin(warnings: string[], districtId: DistrictId, category: string, count: number) {
  if (count > 0 && count < 5) warnings.push(`${districtId} has ${count}/5 ${category}`);
}

function duplicateWarnings(warnings: string[], label: string, ids: string[]) {
  const seen = new Set<string>();
  ids.forEach((id) => {
    if (seen.has(id)) warnings.push(`Duplicate ${label} id ${id}`);
    seen.add(id);
  });
}

function validateItemRef(warnings: string[], label: string, id: string) {
  if (!itemExists(id)) warnings.push(`${label} references unknown item/resource ${id}`);
}

function validateRewardBundle(warnings: string[], label: string, rewards: RewardBundle) {
  Object.entries(rewards).forEach(([resource, amount]) => {
    if (!resourceIds.has(resource)) warnings.push(`${label} references unknown reward resource ${resource}`);
    if ((amount ?? 0) < 0) warnings.push(`${label} has negative reward amount for ${resource}`);
  });
}

function validateKnown(warnings: string[], known: Set<string>, label: string, id?: string) {
  if (id && !known.has(id)) warnings.push(`${label} references unknown id ${id}`);
}

function validateChance(warnings: string[], label: string, chance: number) {
  if (chance <= 0 || chance > 1) warnings.push(`${label} has invalid chance ${chance}`);
}

function validatePercentChance(warnings: string[], label: string, chance: number) {
  if (chance <= 0 || chance > 100) warnings.push(`${label} has invalid percent chance ${chance}`);
}

function validateStoryTarget(
  warnings: string[],
  arcId: string,
  type: string,
  target: string,
  refs: {
    actionIds: Set<string>;
    jobIds: Set<string>;
    enemyIds: Set<string>;
    fixerIds: Set<string>;
    operationIds: Set<string>;
    districtIds: Set<string>;
    companionIds: Set<string>;
  },
) {
  const label = `${arcId} story objective`;
  if (type === "completeSkillAction") validateKnown(warnings, refs.actionIds, label, target);
  if (type === "killEnemy") validateKnown(warnings, refs.enemyIds, label, target);
  if (type === "completeOperation") validateKnown(warnings, refs.operationIds, label, target);
  if (type === "completeCompanionInteraction") validateKnown(warnings, refs.companionIds, label, target);
  if (type === "reduceDistrictThreat") validateKnown(warnings, refs.districtIds, label, target);
  if (type === "completeFixerContract" && !refs.jobIds.has(target) && !refs.fixerIds.has(target)) warnings.push(`${label} references unknown contract/fixer ${target}`);
}

function zoneForDistrict(districtId: DistrictId) {
  const zones: Record<DistrictId, string[]> = {
    neonRow: ["neon-row"],
    rustYards: ["rust-yards"],
    underpassMarket: ["underpass-market"],
    blacknetQuarter: ["blacknet-quarter"],
    glasslineDistrict: ["glassline-district"],
    helixWard: [],
    redlineBlocks: ["redline-blocks"],
    skylineCore: [],
  };
  return zones[districtId];
}

function itemExists(id: string) {
  return Boolean(getItem(id)) || resourceIds.has(id);
}
