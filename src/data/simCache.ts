export const simCacheTypes = [
  {
    id: "basic",
    itemId: "basic-sim-cache",
    name: "Basic Sim Cache",
    minutesPerItem: 5,
    supports: ["skill actions", "crafting"],
  },
  { id: "combat", itemId: "combat-sim-cache", name: "Combat Sim Cache", minutesPerItem: 5, supports: ["combat farming"] },
  { id: "blacknet", itemId: "blacknet-sim-cache", name: "Blacknet Sim Cache", minutesPerItem: 5, supports: ["hacking actions"] },
  { id: "fixer", itemId: "fixer-sim-cache", name: "Fixer Sim Cache", minutesPerItem: 5, supports: ["repeatable fixer jobs"] },
] as const;
