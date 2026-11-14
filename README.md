# Neon // Afterimage

A single-player cyberpunk RPG with an eight-chapter story, tactical combat, character builds, lifepath approaches, and three endings. The existing city economy, crafting, and idle training remain available through district services.

## Run

Use Node.js 24 or newer for the included tests. Install dependencies with `npm install`, then run `npm run dev` and open the local URL printed by Vite. In Windows PowerShell, use `npm.cmd` if script execution is restricted.

- `npm run build` creates the production site in `dist`.
- `npm test` checks progression, resources, combat, recovery, offline progress, saving, endgame rewards, and React rendering.
- `npm run audit` checks content references and ingredient availability against recipe stages.

## Publish to GitHub Pages

The repository includes .github/workflows/deploy.yml, which tests, builds, and deploys the compiled dist directory whenever changes reach main.

1. Commit and push the updated project, including the workflow and Vite configuration, to GitHub.
2. In the repository, open **Settings > Pages** and set **Build and deployment > Source** to **GitHub Actions**.
3. Open **Actions > Deploy game to GitHub Pages**. If needed, choose **Run workflow** on main after changing the Pages setting.
4. Wait for both build and deploy to succeed, then open https://dbattaglia0823-design.github.io/Cyber-Idle/ on your phone.

Do not publish the repository root as a static site: its HTML references TypeScript source that needs Vite compilation. Production asset URLs use /Cyber-Idle/; local development continues to use /. If you rename the repository, update the production base in vite.config.ts.

## Start the RPG campaign

Choose a lifepath, open **Missions**, and claim Sable's field kit. The kit supplies and equips a starting sidearm and armor if those slots are empty. Open **Character** to spend seven starting attribute points and two perk points, then accept **Dead Drop**.

The five attributes are Body, Reflexes, Intelligence, Technical, and Cool. There are ten functional build perks, a character level cap of 30, and free attribute/perk refunds between missions. Main jobs and the first clear of each district's local gig award runner XP. Repeat gigs, skill actions, crafting, Street Combat and Sim Caches award skill progress, supplies, credits or loot without endlessly leveling the runner. At character level 30 the lifetime budget is **49 attribute points and 16 perk points**. Early levels grant one attribute point each, with extras at levels 5, 7, ..., 29; perks accrue every other level.

Main jobs unlock districts and award credits, crafting supplies, and local blueprints. Crafting is the main source of regular equipment. Local gigs pay credits and rotate small material rewards. Every unlocked district also has a **bounty board** in Missions → Local gigs: choose a named wanted target, courier interception, or sabotage assignment. Each offer changes its enemy pattern and difficulty, and awards the clearly previewed bonus credits, extra district crafting materials, and a small reputation/standing reward on completion. The three offers rotate after completing a bounty in that district; other districts' boards remain unchanged. Standard gigs and their optional clean/precision/disruption objectives remain available. Bounties use the same existing mission combat and rare-drop protection; **no extra runner XP** is earned after the gig's first clear. Each completed gig has a 5% chance to drop one unique item from its district pool. Craftable gear is excluded from these drops, and stronger unique gear appears only in later districts. Reward previews list guaranteed supplies and rare drop chances separately. Main jobs no longer replace your equipped weapon or hand out software; the finale retains one unique OS trophy. Existing inventory is preserved.

Select assault, stealth, netrunner, or a lifepath entrance. Assault is always available; other entrances check attributes or origin. In combat, each action advances a turn. Read the enemy's intent, aim from cover, interrupt charged attacks, manage RAM, and use field injectors. Each attribute unlocks a tactical ability at 8 points: Body Breach Strike (heavy piercing interrupt), Reflexes Double Tap (burst damage), Intelligence System Override (RAM-powered weaken), Technical Emergency Patch (heal and cover), and Cool Ghost Step (evade and prime aim). Signature abilities have 3–4-turn cooldowns that persist across patrols and save reloads. Equipped weapons, upgrades, armor, cyberware, and RPG attributes affect the fight.

**Equipment identity and upgrades:** Power, Rapid and Precision variants retain their different damage, tempo and aiming tradeoffs. Every weapon class now has a distinct tactical trait that becomes active at weapon **+3**, such as pistol Quickdraw, shotgun Breach Shells, SMG Suppressive Volley, or smart-weapon linked hacks. Reaching **+6** reinforces damage and **+9** perfects attack speed. These milestones use the existing upgrade materials, item levels and Technical requirements; nothing new must be earned or converted.

The ten named five-piece armor sets grant **2/3/5-piece bonuses**, calculated from worn head, chest, hands, legs and boots only. Light sets emphasize dodge and speed, heavy sets protection, and specialty sets tactical roles. Mixing partial sets can activate bonuses from both. The Equipment screen shows active and locked set tiers, individual upgrade milestones, and full-loadout **projected idle DPS, field hit, maximum HP, armor, and field mitigation** when replacing or upgrading an item. These previews do not modify the save or assume that locked items are equippable.

Fixer support restores health on deployment and provides two field injectors. Field Medic adds one; protecting the community in three main-job decisions adds another. Defeat offers a free retry. Leaving a mission resets its encounter progress. The game saves unfinished missions, and tactical combat waits for your input while offline.

Main-job choices alter payouts and reputation, build community support, and are recorded permanently in the journal. The finale has three endings, with an epilogue reflecting your earlier decisions and an immediately usable iconic operating system. Main-job rewards can only be claimed once.

## Optional city activities

Open **Map** or **District services** for gathering, crafting, trading, companions, and optional skill training. One **foreground** activity (skill work, street combat or field mission) runs at a time; starting another foreground activity stops or pauses the previous foreground activity. **Crafting is independent background work**: it continues while a skill trains, while street combat runs, or while a main job/local gig awaits decisions. Starting a different recipe replaces the current background recipe only; Stop Crafting never interrupts the foreground action. Crafting still consumes its normal materials per completed cycle and stops safely if materials run out.

The collapsed **Idle activity queue** on the City tab lets you configure up to eight ordered skill activities. Select each action, a guaranteed output (resource or item), an **absolute stock target**, and a maximum number of repetitions. Starting the queue uses the first eligible action, moves on exactly when its target is met, skips already-satisfied targets, and finishes automatically. The queue pauses rather than bypassing locked content, insufficient input materials, or a chosen Heat safety threshold. You can reorder, remove, pause, reset, and resume steps. Manually starting combat, missions, or another skill pauses automation without cancelling your separate background craft.

Both the queue and crafting progress while offline, subject to the existing offline time cap. When the two lanes share materials, completions are processed in time order so the same input cannot be spent twice. Old saves get an empty, disabled queue; existing items, equipped gear, skill levels, mission and crafting progress are preserved.

Start with Scavenging for scrap and circuits, Hacking for data and credits, and Cyberware for implant parts. Each district has a guaranteed Scavenging supply route for its crafting components. These routes require the district's entry level in Scavenging; advanced routes also consume scrap. Blueprints and essential vehicle components have crafting recipes, so progression does not depend on rare drops.

Start by choosing a build and opening Dead Drop; the starter kit lets you try the opening encounter immediately. For more power, complete a Neon Row local gig, upgrade your sidearm, or gather materials and craft a rifle. The first gig clear grants runner XP, while repeats provide cash, materials, standing and rare-loot opportunities. Craft and equip stronger gear, make medicine, and enable auto-healing before harder idle combat. Progress contains mission completion, collection rewards, legacy crafting, and optional level-150 skill prestige. Contracts and operations have been retired. Their exclusive loot is available through mission and local-gig rewards. Existing saves retain earned items and historical records, while any running retired activity is canceled without additional costs or rewards.

Main jobs open districts in story order; local gigs and skill training never bypass that sequence. Individual activities still require their own skill levels. XP costs rise continuously and activity XP scales with the level and duration of the activity. Pacing checks cover every training level with replenished inputs; gathering, gear preparation, and optional goals add to that time.

The game saves locally every five seconds and when the page is hidden. There are three save slots and save export/import controls. Offline progression observes activity costs, healing, death, and the offline time limit. Existing saves are migrated automatically; districts remain unlocked after prestige.

## Verification limits

The automated suite plays the full RPG campaign with assault, netrunner, and stealth builds using only earned rewards. It also checks tactical actions, approach gates, decision rewards, retries, save migration, paused offline encounters, retired-activity migration and resource availability, and React screen rendering. Browser interaction and visual layout remain unverified because no browser is connected in this environment.
