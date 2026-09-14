# Neon // Afterimage

A single-player cyberpunk RPG with an eight-chapter story, tactical combat, character builds, lifepath approaches, and three endings. The existing city economy, operations, crafting, and idle training remain available through district services.

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

Choose a lifepath, open **Journal**, and claim Sable's field kit. The kit supplies and equips a starting sidearm and armor if those slots are empty. Open **Attributes & perks** to spend seven starting attribute points and two perk points, then accept **Dead Drop**.

The five attributes are Body, Reflexes, Intelligence, Technical, and Cool. There are ten functional build perks, a character level cap of 30, and free attribute/perk refunds between missions. Missions and gigs award character XP; each level grants two attribute points and one perk point. The separate idle skill levels are optional training progression.

Main jobs open the next district directly and supply stronger usable weapons. All eight chapters can be completed without idle training, material farming, or purchased healing. Eight local gigs are replayable for XP, credits, and district components; repeat completions award half their initial XP.

Select assault, stealth, netrunner, or a lifepath entrance. Assault is always available; other entrances check attributes or origin. In combat, each action advances a turn. Read the enemy's intent, aim from cover, interrupt charged attacks, manage RAM, and use field injectors. Equipped weapons, upgrades, armor, cyberware, and RPG attributes affect the fight.

Fixer support restores health on deployment and provides two field injectors. Field Medic adds one; protecting the community in three main-job decisions adds another. Defeat offers a free retry. Leaving a mission resets its encounter progress. The game saves unfinished missions, and tactical combat waits for your input while offline.

Main-job choices alter payouts and reputation, build community support, and are recorded permanently in the journal. The finale has three endings, with an epilogue reflecting your earlier decisions and an immediately usable iconic operating system. Main-job rewards can only be claimed once.

## Optional city activities

Open **Map** or **District services** for gathering, crafting, trading, companions, and the original operations campaign. Only one activity runs at a time; starting idle work abandons an unfinished field mission, and starting a field mission stops idle work.

Start with Scavenging for scrap and circuits, Hacking for data and credits, and Cyberware for implant parts. Each district has a guaranteed Scavenging supply route for its crafting components. These routes require the district's entry level in Scavenging; advanced routes also consume scrap. Blueprints and essential vehicle components have crafting recipes, so progression does not depend on rare drops.

Craft and equip a weapon and armor, make medicine, and enable auto-healing before fighting. Operation loadout readiness of 100% meets the gear check, but you must also survive the encounters. Defeat the eight main district operations to complete the campaign and earn an iconic operating system. Progress contains collection rewards, legacy crafting, high-threat operations, and optional level-150 skill prestige.

Any main skill opens districts at levels 20, 40, 60, 80, 100, 120, and 140. Individual activities still require their own skill levels. XP costs rise continuously and activity XP scales with the level and duration of the activity. Pacing checks cover every training level with replenished inputs; gathering, gear preparation, and optional goals add to that time.

The game saves locally every five seconds and when the page is hidden. There are three save slots and save export/import controls. Offline progression observes activity costs, healing, death, and the offline time limit. Existing saves are migrated automatically; districts remain unlocked after prestige.

## Verification limits

The automated suite plays the full RPG campaign with assault, netrunner, and stealth builds using only earned rewards. It also checks tactical actions, approach gates, decision rewards, retries, save migration, paused offline encounters, original operations and resources, and React screen rendering. Browser interaction and visual layout remain unverified because no browser is connected in this environment.
