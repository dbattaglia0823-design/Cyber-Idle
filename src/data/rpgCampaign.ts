import type { AttributeId } from "../rpgTypes";
import type { ActiveModifiers, DistrictId, StartingPathId } from "../types";

export const attributeDefinitions: Array<{ id: AttributeId; name: string; description: string; bonusDescription: string; bonuses: Partial<ActiveModifiers> }> = [
  { id: "body", name: "Body", description: "More health, stronger direct attacks and better healing.", bonusDescription: "+2% max HP and +1% healing per point above 3.", bonuses: { combatMaxHp: 0.02, healingReceived: 0.01 } },
  { id: "reflexes", name: "Reflexes", description: "Stronger weapon attacks and aimed shots. Strike before the counterattack.", bonusDescription: "+1% weapon damage and +0.5% attack speed per point above 3.", bonuses: { combatDamage: 0.01, combatAttackSpeed: 0.005 } },
  { id: "intelligence", name: "Intelligence", description: "More RAM and quickhack damage. Open netrunner routes.", bonusDescription: "+1% hacking XP and +0.5% job success per point above 3. RAM and quickhack damage also scale with Intelligence.", bonuses: { skillXp: { hacking: 0.01 }, jobSuccessChance: 0.005 } },
  { id: "technical", name: "Technical", description: "Better field medicine and damage reduction. Improve your crafting efficiency.", bonusDescription: "+1% armor, 1% lower crafting costs and 1% lower upgrade credit costs per point above 3. Each point unlocks another upgrade level.", bonuses: { combatDefense: 0.01, craftingCostReduction: 0.01, upgradeCostReduction: 0.01 } },
  { id: "cool", name: "Cool", description: "Stronger opening attacks and cover. Open silent infiltration routes.", bonusDescription: "+0.25% damage reduction and 1% lower heat gain per point above 3.", bonuses: { damageReduction: 0.0025, heatGain: -0.01 } },
];
export const rpgPerks: Array<{ id: string; name: string; attribute: AttributeId; requirement: number; description: string; modifiers?: Partial<ActiveModifiers> }> = [
  { id: "adrenaline", name: "Adrenaline", attribute: "body", requirement: 5, description: "+30% weapon damage while below half health. Also +3% weapon damage in all combat.", modifiers: { combatDamage: 0.03 } },
  { id: "second-wind", name: "Second Wind", attribute: "body", requirement: 9, description: "Recover 20% health after each encounter. Also +5% max HP.", modifiers: { combatMaxHp: 0.05 } },
  { id: "deadeye", name: "Deadeye", attribute: "reflexes", requirement: 5, description: "Aimed attacks deal another 40% damage. Also +3% weapon damage in all combat.", modifiers: { combatDamage: 0.03 } },
  { id: "finisher", name: "Finisher", attribute: "reflexes", requirement: 9, description: "Weapon attacks execute enemies below 25% health. Also +3% attack speed in idle combat.", modifiers: { combatAttackSpeed: 0.03 } },
  { id: "ram-recycler", name: "RAM Recycler", attribute: "intelligence", requirement: 5, description: "Regenerate 2 RAM per turn instead of 1. Also +5% hacking XP.", modifiers: { skillXp: { hacking: 0.05 } } },
  { id: "synapse", name: "Synapse Burn", attribute: "intelligence", requirement: 9, description: "+40% quickhack damage. Also +2% job success.", modifiers: { jobSuccessChance: 0.02 } },
  { id: "field-medic", name: "Field Medic", attribute: "technical", requirement: 5, description: "One extra field injector per mission. Also +10% healing received.", modifiers: { healingReceived: 0.1 } },
  { id: "reactive-armor", name: "Reactive Armor", attribute: "technical", requirement: 9, description: "Take 20% less damage during missions. Also +5% armor.", modifiers: { combatDefense: 0.05 } },
  { id: "ambush", name: "Ambush", attribute: "cool", requirement: 5, description: "+60% damage on the first turn of each encounter. Also 5% lower heat gain.", modifiers: { heatGain: -0.05 } },
  { id: "vanishing-point", name: "Vanishing Point", attribute: "cool", requirement: 9, description: "Taking cover also primes an aimed shot. Also +3% damage reduction in all combat.", modifiers: { damageReduction: 0.03 } },
  { id: "tinkerer", name: "Tinkerer", attribute: "technical", requirement: 5, description: "Unlock two extra equipment upgrade levels and reduce upgrade credit costs by 10%.", modifiers: { upgradeCostReduction: 0.1 } },
];

export interface RpgMission {
  id: string; title: string; district: DistrictId; fixer: string; act: number; sideGig?: boolean;
  tagline: string; briefing: string; location: string; objective: string; enemies: string[];
  reveal: string; reward: number; xp: number; lifepath: StartingPathId; pathLine: string;
  choices: Array<{ id: string; label: string; detail: string; response: string; reputation: number; bonusCredits: number }>;
}

const cases: Array<Omit<RpgMission, "choices" | "reward" | "xp">> = [
  { id: "dead-drop", title: "Dead Drop", district: "neonRow", fixer: "Sable Quinn", act: 0,
    tagline: "A routine pickup. A heartbeat inside the package.", location: "Lowglow / abandoned maglev platform",
    briefing: "A courier went dark under the maglev. Recover her shard before the collection crew does. My client says it's payroll. My client is lying. Get her out if you can.",
    objective: "Find the courier and recover the shard.", enemies: ["Collection Crew Lookout", "Chrome Debt Collector"],
    reveal: "The shard contains a live neural imprint. The courier begs you to keep it out of corporate hands. Sable offers you a choice: help her disappear or deliver the package as contracted.",
    lifepath: "streetborn", pathLine: "You know the collector's old crew. Call in a street debt and bypass the lookout." },
  { id: "burning-rubber", title: "Burning Rubber", district: "rustYards", fixer: "Dex Riven", act: 1,
    tagline: "Nothing leaves the yards without somebody getting paid.", location: "Brakeyard / impound stack 09",
    briefing: "The courier needs wheels and a clean identity. I have both, locked in an impound convoy. The Jackals say we can take the rig if we leave its passengers behind. I want a better answer.",
    objective: "Intercept the convoy and open the passenger container.", enemies: ["Impound Gunner", "Convoy Marshal"],
    reveal: "The container holds workers marked for memory extraction. Their transport records would buy you a favor with the company. Or you can erase the manifest and let them walk.",
    lifepath: "outrider", pathLine: "Use your convoy signals to redirect the escort and slip past the gunner." },
  { id: "ghost-price", title: "The Ghost Price", district: "underpassMarket", fixer: "Mara Voss", act: 2,
    tagline: "Every secret has a seller. Every seller has a price.", location: "Underpass / floodgate auction hall",
    briefing: "A broker is auctioning the courier's original memories. Get into the exchange and find the buyer list. Keep your eyes open: half the crowd is selling something they can't afford to lose.",
    objective: "Access the auction vault and secure the buyer list.", enemies: ["Auction House Enforcer", "Broker's Armored Proxy"],
    reveal: "The buyer list links city officials to the imprint program. Leaking it would protect the next victims. Selling it quietly would give you leverage and a much larger payout.",
    lifepath: "corporateDefector", pathLine: "Quote the exchange's escrow policy and enter as a compliance auditor." },
  { id: "choir-of-static", title: "Choir of Static", district: "blacknetQuarter", fixer: "Nyra Vale", act: 3,
    tagline: "Someone in the network remembers being human.", location: "Blacknet / relay cathedral",
    briefing: "Your shard is answering a signal from the old relay. It knows your name. I can get you inside, but once the intrusion starts you'll have to decide which voices to trust.",
    objective: "Reach the relay core and identify the imprint signal.", enemies: ["Relay Security Drone", "Black ICE Custodian"],
    reveal: "A trapped collective asks you to copy its identities before the server is purged. The corporation wants the same data to rebuild its behavioral models.",
    lifepath: "corporateDefector", pathLine: "Reuse an obsolete corporate maintenance certificate to bypass the outer relay." },
  { id: "borrowed-time", title: "Borrowed Time", district: "helixWard", fixer: "Iris Kade", act: 4,
    tagline: "The treatment works. That was never the problem.", location: "Helix / after-hours recovery ward",
    briefing: "The courier's implant is burning out. The stabilizer exists, but the patent holder would rather lose a patient than a subscription. Bring me the formula. I'll keep her alive until you do.",
    objective: "Recover the stabilizer formula from the restricted ward.", enemies: ["Clinic Recovery Agent", "Biotech Security Chief"],
    reveal: "You have the formula and a list of untreated patients. The neighborhood clinic can distribute it freely. The patent holder will pay for an exclusive return and look away from your intrusion.",
    lifepath: "streetborn", pathLine: "A night nurse recognizes your neighborhood connection and opens the service entrance." },
  { id: "hostile-takeover", title: "Hostile Takeover", district: "glasslineDistrict", fixer: "Iris Kade", act: 5,
    tagline: "The boardroom is just another battlefield.", location: "Glassline / archive tower 44",
    briefing: "We found the imprint program's architect. She's willing to testify if you extract her from the tower. Security has orders to keep her, dead or alive. She has orders to keep the evidence.",
    objective: "Reach the architect and recover the program's root credentials.", enemies: ["Corporate Response Agent", "Executive Exosuit"],
    reveal: "The architect admits she approved the early trials. Protecting her gets the victims their testimony. Delivering her to a rival board gives you credentials and a private payout.",
    lifepath: "corporateDefector", pathLine: "Use boardroom protocol to schedule a false emergency evacuation." },
  { id: "no-kings", title: "No Kings Below", district: "redlineBlocks", fixer: "Mara Voss", act: 6,
    tagline: "The city is choosing sides. So are you.", location: "Redline / barricaded freight boulevard",
    briefing: "Skyline has cut power to the blocks. Crews are fighting over emergency generators while an executive convoy drives through untouched. Break the blockade. Give us a route to the tower.",
    objective: "Disable the blockade and secure the freight elevator.", enemies: ["Blockade Heavy", "Redline Siege Commander"],
    reveal: "The commandeered generator can restore power to the shelters or run the private elevator straight to Skyline. You can still reach the tower either way; the people below will remember who got the lights.",
    lifepath: "outrider", pathLine: "Navigate an old freight tunnel and emerge behind the first barricade." },
  { id: "afterimage", title: "Afterimage", district: "skylineCore", fixer: "Sable Quinn", act: 7,
    tagline: "You came here for a payday. You stayed for a name.", location: "Skyline / executive neural observatory",
    briefing: "The root server is above the clouds. Everything we've done ends here: the courier, the missing people, the voices in the relay. No client this time. This is your call.",
    objective: "Reach the root server and decide the future of the imprint network.", enemies: ["Apex Response Sentinel", "The Executive Afterimage"],
    reveal: "The network offers three exits: free the stored identities, take ownership of the system, or destroy the root and every copy. Your allies are listening. The city is waiting.",
    lifepath: "streetborn", pathLine: "The building's night crew recognizes your name and clears a path through the service levels." },
];

const decisionLabels = [
  ["Hide the courier", "Deliver the neural imprint"],
  ["Erase the passenger manifest", "Sell the transport records"],
  ["Leak the buyer list", "Sell the list privately"],
  ["Save the trapped identities", "Return the behavioral archive"],
  ["Release the stabilizer formula", "Return the exclusive patent"],
  ["Protect the architect's testimony", "Hand her to the rival board"],
  ["Restore power to the shelters", "Power the executive elevator"],
];

export const rpgMissions: RpgMission[] = cases.map(entry => ({
  ...entry, reward: 350 + entry.act * 250, xp: 350 + entry.act * 160,
  choices: entry.act === 7 ? [
    { id: "free", label: "Free the identities", detail: "+20 reputation. Return control to the people inside the network.", response: "For one impossible second, every screen in the city shows a different face. Then the voices go quiet. They finally belong to themselves.", reputation: 20, bonusCredits: 0 },
    { id: "own", label: "Take the throne", detail: "+2,000 credits. Keep the system and become its new operator.", response: "The skyline opens its doors. Your name replaces the old administrator. Far below, the city keeps moving. You can feel every heartbeat.", reputation: -10, bonusCredits: 2000 },
    { id: "erase", label: "Burn the root", detail: "+10 reputation. End the program permanently, at the cost of every stored imprint.", response: "The tower goes dark. No backup answers. The city will never know how many lives ended in that silence, only that the disappearances stop.", reputation: 10, bonusCredits: 0 },
  ] : [
    { id: "protect", label: decisionLabels[entry.act][0], detail: "+12 reputation. Standard payout. After three community decisions, allies supply an extra field injector on every deployment.", response: `${entry.fixer}: "It costs something to do right in this city. I'll make sure they remember what you did."`, reputation: 12, bonusCredits: 0 },
    { id: "profit", label: decisionLabels[entry.act][1], detail: `+${200 + entry.act * 100} credits, −4 reputation. Hand the leverage to the paying client.`, response: `${entry.fixer}: "Transfer cleared. Keep the receipt. In this city, a clean conscience is the one thing nobody sells."`, reputation: -4, bonusCredits: 200 + entry.act * 100 },
  ],
}));

export const rpgSideGigs: RpgMission[] = cases.map(entry => ({
  ...entry, id: `gig-${entry.id}`, title: ["Missing in Lowglow", "Repo Midnight", "A Quiet Delivery", "Signal Thief", "Clinic Night Shift", "Paper Trail", "Shelter Run", "Penthouse Exit"][entry.act],
  sideGig: true, tagline: "Local work. Immediate consequences.",
  briefing: `${entry.fixer}: "A local contact needs an extraction from ${entry.location.split(" / ")[1]}. Clear their pursuer and get them to a safe pickup. The field kit is on me."`,
  objective: "Clear the pursuit and extract your contact.", enemies: [entry.enemies[0]],
  reveal: "Your contact reaches the pickup. The fixer confirms the transfer. The district has one less missing-person report tonight.",
  reward: 250 + entry.act * 150, xp: 180 + entry.act * 50,
  choices: [{ id: "extract", label: "Confirm safe extraction", detail: "+4 reputation. Collect payment, field supplies, and reduce Heat by 15. This gig can be replayed.", response: "Another name crossed off the missing list. Your fixer leaves the channel open for the next call.", reputation: 4, bonusCredits: 0 }],
}));
export const allRpgMissions = [...rpgMissions, ...rpgSideGigs];
