import type { StartingPath } from "../types";

export const startingPaths: StartingPath[] = [
  {
    id: "outrider",
    name: "Outrider",
    theme: "Wasteland runner, smuggler, and vehicle-focused survivor.",
    bonuses: ["+10% vehicle job speed", "+5% scavenging rewards", "-5% Heat from smuggling-style jobs"],
    penalties: ["-5% hacking XP", "+5% prices in corporate district shops", "Slower trust gain with corporate fixers"],
    modifiers: {
      vehicleJobSpeed: 0.1,
      scavengingRewards: 0.05,
      smugglingHeat: -0.05,
      hackingXp: -0.05,
      corporatePrices: 0.05,
      corporateTrustGain: -0.05,
    },
  },
  {
    id: "streetborn",
    name: "Streetborn",
    theme: "City native, gang-connected street merc, and alleywise survivor.",
    bonuses: ["+10% Street Combat XP", "+5% Reputation gain", "+5% trust gain with street fixers and gangs", "Better black market prices"],
    penalties: ["+5% Heat gain from illegal actions", "-5% corporate job success chance", "Slower access to high-tier corporate cyberware"],
    modifiers: {
      combatXp: 0.1,
      reputationGain: 0.05,
      streetTrustGain: 0.05,
      gangTrustGain: 0.05,
      blackMarketPrices: -0.05,
      heatGain: 0.05,
      corporateJobSuccess: -0.05,
    },
  },
  {
    id: "corporateDefector",
    name: "Corporate Defector",
    theme: "Former corporate insider with technical knowledge and dangerous access.",
    bonuses: ["+10% Hacking XP", "+5% Cyberware Engineering XP", "+5% rewards from data theft and corporate jobs", "Starts with extra Credits"],
    penalties: ["-5% gang trust gain", "+5% Heat from street crimes", "+5% Neural Instability gain from prototype cyberware"],
    modifiers: {
      hackingXp: 0.1,
      cyberwareXp: 0.05,
      dataTheftRewards: 0.05,
      corporateJobRewards: 0.05,
      gangTrustGain: -0.05,
      heatGain: 0.05,
      neuralInstabilityGain: 0.05,
    },
    startingCredits: 1000,
  },
];
