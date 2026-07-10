import type { Boss } from "../types";

export const bosses: Boss[] = [
  boss("boss-backstreet-lieutenant", "Backstreet Lieutenant", 130, 12, 1700, 4, ["Burst attack"], { credits: 120, reputation: 8 }, { credits: 45, reputation: 3 }, [{ id: "bp-starter-weapon", name: "Starter Weapon Blueprint", chance: 0.12, quantity: 1 }]),
  boss("boss-junkyard-warden", "Junkyard Warden", 280, 20, 2100, 9, ["Repair phase", "Summon adds"], { vehicleParts: 20, cyberwareParts: 8 }, { vehicleParts: 8, cyberwareParts: 3 }, [{ id: "engineCore", name: "Engine Core", chance: 0.1, quantity: 1 }, { id: "bp-scavenger-rig", name: "Scavenger Rig Blueprint", chance: 0.08, quantity: 1 }]),
  boss("boss-market-enforcer", "Market Enforcer", 360, 24, 1900, 10, ["Shield phase", "Burst attack"], { credits: 300, reputation: 15 }, { credits: 90, reputation: 5 }, [{ id: "market-pass", name: "Market Pass", chance: 0.08, quantity: 1 }]),
  boss("boss-black-ice-avatar", "Black ICE Avatar", 420, 26, 1600, 12, ["Neural shock", "Heat spike"], { encryptedData: 30, reputation: 12 }, { encryptedData: 10, reputation: 4 }, [{ id: "blacknet-cipher", name: "Blacknet Cipher", chance: 0.12, quantity: 1 }, { id: "bp-blacknet-tool", name: "Blacknet Tool Blueprint", chance: 0.08, quantity: 1 }]),
  boss("boss-response-captain", "Armored Response Captain", 620, 34, 1800, 18, ["Shield phase", "Burst attack", "Heat spike"], { credits: 650, reputation: 20 }, { credits: 180, reputation: 6 }, [{ id: "glassline-access-token", name: "Glassline Access Token", chance: 0.08, quantity: 1 }, { id: "bp-corporate-cyberware", name: "Corporate Cyberware Blueprint", chance: 0.06, quantity: 1 }]),
];

function boss(id: string, name: string, hp: number, damage: number, attackSpeedMs: number, armor: number, mechanics: string[], firstClearRewards: Boss["firstClearRewards"], repeatRewards: Boss["repeatRewards"], drops: Boss["drops"]): Boss {
  return {
    id,
    name,
    description: `${name} controls an operation endpoint.`,
    hp,
    damage,
    attackSpeedMs,
    armor,
    accuracy: 0,
    mechanics,
    creditsReward: repeatRewards.credits ?? 0,
    xpReward: Math.ceil(hp / 3),
    reputationReward: repeatRewards.reputation ?? 0,
    drops,
    firstClearRewards,
    repeatRewards,
  } as Boss;
}
