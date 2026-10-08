# Campaign polish and verification

## Shared implementation

District presentation lives in src/data/districtPresentation.ts; tactical profiles and counter descriptions live in src/data/tacticalTraits.ts. The resolver in src/systems/tacticalTraits.ts supplies both combat rules and visible intent. Keep those in sync when changing attacks.

MissionPreparation, TacticalEncounter, EnemyPresentation, MissionDebrief and CampaignFinale share the mission flow. DistrictNavigation contains the extracted skill/activity navigation. Optional encounter artwork can replace the shared silhouette without duplicating combat markup.

| District | Lesson | Boss escalation |
| --- | --- | --- |
| Neon Row | Aim, cover and interrupts | Existing introductory boss |
| Rust Yards | Aim or hack through plating | Alternating exposed and sealed plating |
| Underpass Market | Cover prevents bleed; injectors clear it | More frequent lacerating attacks |
| Blacknet Quarter | Cover prevents RAM disruption | More frequent, stronger RAM drain |
| Helix Ward | Overheat or interrupts suppress repair | Stronger periodic repairs |
| Glassline District | Hack through shields or time shots | Longer shield uptime |
| Redline Blocks | Attack during recovery; cover bursts | Consecutive burst turns |
| Skyline Core | Apply earlier counters to paired traits | Rotating bastion, recovery and assault phases |

New bleed fields are optional and normalized on load. Field combat still waits offline. No new currency, reward tier, skill structure or separate endgame was added. Local gigs retain their optional payouts and rare unique drops.

## Verification completed October 8, 2026

- Full automated suite: 141 passing tests.
- Production TypeScript/Vite build passes; the existing large application bundle advisory remains.
- Content audit: 280 recipes and 150 actions, no missing references, duplicate IDs, skill reward, crafting XP or material timing errors.
- Automated stage-equipment combat runs cover every main job, with existing tests also covering all three approaches.
- Economy tests verify reachable crafting and upgrade inputs before each district's own boss. They use plentiful quantities of reachable supplies; they do not measure real-world gathering time or human difficulty.
- Browser combat: all eight main jobs completed at 393 x 852, including decisions and reward receipts; Skyline ending persisted after reload. No browser runtime errors or debrief horizontal overflow.
- Layout checks at 320, 393 and 1280 pixels covered all districts' combat and crafting source dialogs, combat touch targets, viewport bounds and recipe back navigation.
- Active plating and shield counters also appear beside intent, near the mobile combat controls.

Browser checks use desktop Edge/Chromium with mobile viewport sizes. Physical iPhone Safari testing remains a separate release check.
