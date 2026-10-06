import { createContext, useContext } from "react";
import type { DistrictId } from "../types";
import type { CharacterTool } from "./MainMenu";

// Navigation requests change only the visible screen, never the game state.
export const PlayerNavigation = createContext<{
  openDistrict?: (id: DistrictId, category?: string) => void;
  openCrafting?: (recipeId?: string) => void;
  openMissions?: () => void;
  openCharacter?: (section: CharacterTool) => void;
  openIndex?: () => void;
  recipeId?: string | null;
  recipeRequest?: number;
}>({});
export const usePlayerNavigation = () => useContext(PlayerNavigation);
export function revealDetail(selector: string) {
  if (!window.matchMedia("(max-width: 760px)").matches) return;
  requestAnimationFrame(() => {
    const panel = document.querySelector<HTMLElement>(selector);
    panel?.scrollIntoView({ block: "start", behavior: "auto" });
    panel?.focus({ preventScroll: true });
  });
}
