import type { SignatureBuild } from "../types";

export const signatureBuilds: SignatureBuild[] = [
  {
    id: "chrome-reaper",
    name: "Chrome Reaper",
    description: "Solo plus Techie: heavy combat backed by tuned chrome and upgrade discipline.",
    requiredArchetypes: ["solo", "techie"],
  },
  {
    id: "blacknet-phantom",
    name: "Blacknet Phantom",
    description: "Netrunner plus Ghost: quiet data theft, low Heat, and clean exits.",
    requiredArchetypes: ["netrunner", "ghost"],
  },
  {
    id: "street-broker",
    name: "Street Broker",
    description: "Fixer-led street economy with reputation, contacts, and market leverage.",
    requiredArchetypes: ["fixer"],
  },
  {
    id: "rust-runner",
    name: "Rust Runner",
    description: "Outrider plus Techie: vehicle mastery, scavenging, and garage engineering.",
    requiredArchetypes: ["outrider", "techie"],
  },
  {
    id: "corporate-ghost",
    name: "Corporate Ghost",
    description: "Netrunner, Fixer, and Ghost: clean credentials, quiet jobs, and polished lies.",
    requiredArchetypes: ["netrunner", "fixer", "ghost"],
  },
  {
    id: "redline-enforcer",
    name: "Redline Enforcer",
    description: "Solo plus Fixer: bounty boards, operation pressure, and crew influence.",
    requiredArchetypes: ["solo", "fixer"],
  },
];
