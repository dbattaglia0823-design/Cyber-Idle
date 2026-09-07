import type { DistrictId, FactionId } from "../types";

export interface FactionMilestone {
  factionId: FactionId;
  districtId: DistrictId;
  rank: number;
  title: string;
  reward: string;
  requirement: string;
}

export const factionMilestones: FactionMilestone[] = [
  milestone("ghostMarket", "neonRow", 1, "Backroom Introductions", "Starter contraband prices improve.", "Ghost Market rank 1"),
  milestone("ghostMarket", "neonRow", 2, "Courier Marks", "Sable offers safer package contracts.", "Ghost Market rank 2"),
  milestone("ghostMarket", "neonRow", 3, "Market Rumors", "Underpass Market lead becomes clearer.", "Ghost Market rank 3"),
  milestone("ghostMarket", "neonRow", 4, "Private Buyer Whisper", "Black Market private buyer routing improves.", "Ghost Market rank 4"),
  milestone("redlineSaints", "neonRow", 5, "Block Ceasefire", "Neon Row combat operations lose threat pressure.", "Redline Saints rank 5"),

  milestone("chromeJackals", "rustYards", 1, "Yard Pass", "Basic vehicle parts become easier to source.", "Chrome Jackals rank 1"),
  milestone("chromeJackals", "rustYards", 2, "Garage Bay", "Rust housing and garage options unlock sooner.", "Chrome Jackals rank 2"),
  milestone("chromeJackals", "rustYards", 3, "Plate Discount", "Armor plating vendor prices improve.", "Chrome Jackals rank 3"),
  milestone("chromeJackals", "rustYards", 4, "Convoy Trust", "Smuggling contracts gain success support.", "Chrome Jackals rank 4"),
  milestone("chromeJackals", "rustYards", 5, "Fortress Key", "High-tier Rust operations reveal better routes.", "Chrome Jackals rank 5"),

  milestone("ghostMarket", "underpassMarket", 1, "Buyer Screen", "Market listings become safer.", "Ghost Market rank 1"),
  milestone("ghostMarket", "underpassMarket", 2, "Contraband Shelf", "Rare market items appear earlier.", "Ghost Market rank 2"),
  milestone("ghostMarket", "underpassMarket", 3, "Private Auction", "Private bid contracts unlock.", "Ghost Market rank 3"),
  milestone("ghostMarket", "underpassMarket", 4, "Broker Protection", "Underpass housing improves Heat decay.", "Ghost Market rank 4"),
  milestone("ghostMarket", "underpassMarket", 5, "Kingpin Access", "Underpass boss routes gain rare-drop support.", "Ghost Market rank 5"),

  milestone("nullChoir", "blacknetQuarter", 1, "Quiet Handshake", "Trace cleanup jobs become available.", "Null Choir rank 1"),
  milestone("nullChoir", "blacknetQuarter", 2, "Cipher Choir", "Blacknet vendor cipher prices improve.", "Null Choir rank 2"),
  milestone("nullChoir", "blacknetQuarter", 3, "Proxy Shelter", "Blacknet housing gains recovery relevance.", "Null Choir rank 3"),
  milestone("nullChoir", "blacknetQuarter", 4, "Daemon Terms", "Daemon operations reveal safer routes.", "Null Choir rank 4"),
  milestone("nullChoir", "blacknetQuarter", 5, "Deep Static Pass", "Endgame Blacknet chain access improves.", "Null Choir rank 5"),

  milestone("helixOrder", "glasslineDistrict", 1, "Clean Badge", "Corporate supplier access improves.", "Helix Order rank 1"),
  milestone("helixOrder", "glasslineDistrict", 2, "Sterile Referral", "Glassline Ripperdoc prices improve.", "Helix Order rank 2"),
  milestone("helixOrder", "glasslineDistrict", 3, "Audit Shield", "Corporate contract success improves.", "Helix Order rank 3"),
  milestone("helixOrder", "glasslineDistrict", 4, "Prototype Clearance", "Prototype operation routes become clearer.", "Helix Order rank 4"),
  milestone("helixOrder", "glasslineDistrict", 5, "Executive Consent", "Luxury housing requirements ease.", "Helix Order rank 5"),

  milestone("helixOrder", "helixWard", 1, "Clinic Intake", "Basic medical services discount.", "Helix Order rank 1"),
  milestone("helixOrder", "helixWard", 2, "Stabilizer Access", "Advanced stabilizers appear earlier.", "Helix Order rank 2"),
  milestone("helixOrder", "helixWard", 3, "Private Ward", "Helix housing unlocks new recovery tiers.", "Helix Order rank 3"),
  milestone("helixOrder", "helixWard", 4, "Surgical Referral", "Cyberware recovery contracts improve.", "Helix Order rank 4"),
  milestone("helixOrder", "helixWard", 5, "Quietus Override", "Neural Quietus routes gain safety support.", "Helix Order rank 5"),

  milestone("redlineSaints", "redlineBlocks", 1, "Board Access", "Bounty contracts become available.", "Redline Saints rank 1"),
  milestone("redlineSaints", "redlineBlocks", 2, "Crew Corner", "Combat housing opens.", "Redline Saints rank 2"),
  milestone("redlineSaints", "redlineBlocks", 3, "Ring Invite", "Arena operations gain better rewards.", "Redline Saints rank 3"),
  milestone("redlineSaints", "redlineBlocks", 4, "Blood Price", "High-tier bounty chains reveal rare marks.", "Redline Saints rank 4"),
  milestone("redlineSaints", "redlineBlocks", 5, "Block Authority", "Redline threat cleanup improves.", "Redline Saints rank 5"),

  milestone("ghostMarket", "skylineCore", 1, "Concierge Whisper", "Luxury brokers acknowledge you.", "Ghost Market rank 1"),
  milestone("helixOrder", "skylineCore", 2, "Executive Clinic Line", "Premium recovery access improves.", "Helix Order rank 2"),
  milestone("ghostMarket", "skylineCore", 3, "Private Buyer Seal", "High-value market sales improve.", "Ghost Market rank 3"),
  milestone("helixOrder", "skylineCore", 4, "Prototype Lease", "Skyline prototype costs improve.", "Helix Order rank 4"),
  milestone("ghostMarket", "skylineCore", 5, "Blackout Invitation", "Skyline Blackout chain gains elite routing.", "Ghost Market rank 5"),
];

function milestone(factionId: FactionId, districtId: DistrictId, rank: number, title: string, reward: string, requirement: string): FactionMilestone {
  return { factionId, districtId, rank, title, reward, requirement };
}
