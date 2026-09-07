const portraitFiles = import.meta.glob<string>("../assets/Enemies/**/*.png", {
  eager: true,
  import: "default",
  query: "?url",
});

const portrait = (path: string) => portraitFiles[path];

const enemyPortraits: Record<string, string> = {
  // Neon Row
  "street-punk": portrait("../assets/Enemies/NeonRow/StreetPunk.png"),
  "boosted-thug": portrait("../assets/Enemies/NeonRow/BoostedThug.png"),
  "scrap-drone": portrait("../assets/Enemies/NeonRow/ScrapDrone.png"),
  "neon-lookout": portrait("../assets/Enemies/NeonRow/NeonLookout.png"),
  "clinic-shaker": portrait("../assets/Enemies/NeonRow/ClinicShaker.png"),
  "hardened-street-punk": portrait("../assets/Enemies/NeonRow/HardenedStreetPunk.png"),
  "chrome-plated-boosted-thug": portrait("../assets/Enemies/NeonRow/Chrome-PlatedBoostedThug.png"),
  "neon-row-kill-team": portrait("../assets/Enemies/NeonRow/NeonRowKillTeam.png"),

  // Rust Yards
  "yard-raider": portrait("../assets/Enemies/RustYards/YardRaider.png"),
  "scrap-hound": portrait("../assets/Enemies/RustYards/ScrapHound.png"),
  "chopshop-spotter": portrait("../assets/Enemies/RustYards/ChopshopSpotter.png"),
  "mag-clamp-loader": portrait("../assets/Enemies/RustYards/Mag-ClampLoader.png"),
  "jackal-roadboss": portrait("../assets/Enemies/RustYards/JackalRoadboss.png"),

  // Underpass Market
  "market-cutthroat": portrait("../assets/Enemies/UnderpassMarket/MarketCutthroat.png"),
  "ledger-thief": portrait("../assets/Enemies/UnderpassMarket/LedgerThief.png"),
  "tunnel-gunner": portrait("../assets/Enemies/UnderpassMarket/TunnelGunner.png"),
  "contraband-sawbones": portrait("../assets/Enemies/UnderpassMarket/ContrabandSawbones.png"),
  "ghost-market-factor": portrait("../assets/Enemies/UnderpassMarket/GhostMarketFactor.png"),

  // Blacknet Quarter
  "trace-avatar": portrait("../assets/Enemies/BlacknetQuarter/TraceAvatar.png"),
  "packet-wraith": portrait("../assets/Enemies/BlacknetQuarter/PacketWraith.png"),
  "choir-proxy": portrait("../assets/Enemies/BlacknetQuarter/ChoirProxy.png"),
  "daemon-butcher": portrait("../assets/Enemies/BlacknetQuarter/DaemonButcher.png"),
  "null-oracle-shell": portrait("../assets/Enemies/BlacknetQuarter/NullOracleShell.png"),

  // Helix Ward
  "helix-clinic-orderly": portrait("../assets/Enemies/HelixWard/ClinicOrderly.png"),
  "helix-sterile-drone": portrait("../assets/Enemies/HelixWard/SterileResponseDrone.png"),
  "failed-augment-patient": portrait("../assets/Enemies/HelixWard/FeedbackOperative.png"),
  "trauma-suppression-unit": portrait("../assets/Enemies/HelixWard/TraumaSuppressionUnit.png"),
  "helix-recovery-marshal": portrait("../assets/Enemies/HelixWard/HelixRecoveryMarshal.png"),

  // Glassline District (filenames intentionally preserve the supplied spelling)
  "corp-response-guard": portrait("../assets/Enemies/GlasslineDistrict/CorpResponseGaurd.png"),
  "glassline-auditor": portrait("../assets/Enemies/GlasslineDistrict/GlasslineAuditor.png"),
  "sterile-drone": portrait("../assets/Enemies/GlasslineDistrict/SterileDrone.png"),
  "executive-bodyguard": portrait("../assets/Enemies/GlasslineDistrict/ExecutiveBodygaurd.png"),
  "prototype-handler": portrait("../assets/Enemies/GlasslineDistrict/PrototypeHandler.png"),

  // Redline Blocks
  "redline-brawler": portrait("../assets/Enemies/RedlineBlocks/RedlineBrawler.png"),
  "bounty-scout": portrait("../assets/Enemies/RedlineBlocks/BountyScout.png"),
  "saints-shotcaller": portrait("../assets/Enemies/RedlineBlocks/SaintsShotcaller.png"),
  "bloodsport-chrome": portrait("../assets/Enemies/RedlineBlocks/BloodsportChrome.png"),
  "redline-executioner": portrait("../assets/Enemies/RedlineBlocks/RedlineExecutioner.png"),

  // Skyline Core
  "skyline-access-guard": portrait("../assets/Enemies/SkylineCore/SkylineGatekeeper.png"),
  "executive-transit-sentinel": portrait("../assets/Enemies/SkylineCore/ExecutiveTransitWarden.png"),
  "luxury-asset-reclaimer": portrait("../assets/Enemies/SkylineCore/LuxuryAssetReclaimer.png"),
  "private-vault-custodian": portrait("../assets/Enemies/SkylineCore/PrivateVaultCustodian.png"),
  "skyline-apex-marshal": portrait("../assets/Enemies/SkylineCore/SkylineApexMarshal.png"),
};

export function enemyPortraitFor(enemyId: string) {
  return enemyPortraits[enemyId];
}

export const enemyPortraitIds = Object.freeze(Object.keys(enemyPortraits));
