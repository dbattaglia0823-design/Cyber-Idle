import type { DistrictEventDefinition } from "../types";

export const districtEvents: DistrictEventDefinition[] = [
  event("event-neon-row-open", "neonRow", "Neon Row Welcome Ping", "District available", "Local channels mark you as a fresh runner with access to starter vendors and backroom clinics.", ["Starter economy visible", "Low threat baseline"]),
  event("event-rust-unlocked", "rustYards", "Rust Gate Opens", "District unlock", "Chrome Jackals spot your salvage work and open the yard routes.", ["Vehicle parts vendors visible", "Garage progression begins"]),
  event("event-underpass-unlocked", "underpassMarket", "Market Lanterns Lit", "District unlock", "Ghost Market brokers invite you under the concrete for contraband trading.", ["Black market vendor visible", "Higher Heat economy"]),
  event("event-blacknet-unlocked", "blacknetQuarter", "Trace Mesh Access", "District unlock", "Null Choir relays open encrypted doors into Blacknet Quarter.", ["Data broker visible", "Trace storm hooks enabled"]),
  event("event-glassline-unlocked", "glasslineDistrict", "Corporate Badge Spoofed", "District unlock", "Glassline scanners accept your credentials long enough to work the clean towers.", ["Corporate supplier visible", "High payout jobs"]),
  event("event-helix-unlocked", "helixWard", "Helix Triage Window", "District unlock", "Helix Ward clinics register your profile for Neural Instability treatment.", ["Clinic vendor visible", "Advanced ripperdoc services"]),
  event("event-redline-unlocked", "redlineBlocks", "Bounty Boards Wake", "District unlock", "Redline Saints boards start posting harder fights and weapon listings.", ["Arms dealer visible", "Bounty access tokens"]),
  event("event-skyline-unlocked", "skylineCore", "Skyline Permit Burned", "District unlock", "Skyline Core opens its luxury elevators and expensive late-game brokers.", ["Luxury broker visible", "Major credit sinks"]),
  event("event-lockdown", "neonRow", "District Lockdown", "Threat reaches Lockdown", "Security pressure spikes across a district, disturbing vendors, jobs, and travel.", ["Vendor prices surge", "Job success drops", "Heat gain rises"], "Warning"),
  event("event-price-surge", "underpassMarket", "Vendor Price Surge", "Threat reaches Hostile", "Underpass brokers raise prices while crews fight over supply routes.", ["Black market prices rise", "Rare inventory hook"]),
  event("event-trace-storm", "blacknetQuarter", "Blacknet Trace Storm", "High Heat or threat", "Trace daemons flood local relays, making data work richer but more dangerous.", ["Hacking rewards hook", "Extra Heat risk"]),
  event("event-ripperdoc-window", "helixWard", "Ripperdoc Discount Window", "Low threat", "Helix clinics briefly lower rates after a safer week.", ["Ripperdoc discount hook"]),
];

function event(
  id: string,
  districtId: DistrictEventDefinition["districtId"],
  name: string,
  trigger: string,
  description: string,
  effects: string[],
  logCategory: DistrictEventDefinition["logCategory"] = "World",
): DistrictEventDefinition {
  return { id, districtId, name, trigger, description, effects, logCategory };
}
