import type { DistrictId } from "../types";

export const districtProgressionOrder: DistrictId[] = [
  "neonRow",
  "rustYards",
  "underpassMarket",
  "blacknetQuarter",
  "helixWard",
  "glasslineDistrict",
  "redlineBlocks",
  "skylineCore",
];

export const districtProgressionRank = Object.fromEntries(
  districtProgressionOrder.map((districtId, index) => [districtId, index]),
) as Record<DistrictId, number>;

export function compareDistrictProgression(a: DistrictId, b: DistrictId) {
  return districtProgressionRank[a] - districtProgressionRank[b];
}
