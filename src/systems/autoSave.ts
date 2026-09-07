import { saveGame, type SaveSlotId } from "./saveSystem";
import type { GameState } from "../types";

// Read the latest state when the timer fires. Restarting a five-second timer on
// every 200ms game tick prevents it from ever firing during active gameplay.
export function startAutoSave(readCurrent: () => { state: GameState; slot: SaveSlotId }) {
  const persist = () => {
    const { state, slot } = readCurrent();
    saveGame(state, slot);
  };
  const onHidden = () => { if (document.visibilityState === "hidden") persist(); };
  const timer = window.setInterval(persist, 5000);
  window.addEventListener("pagehide", persist);
  document.addEventListener("visibilitychange", onHidden);
  return () => {
    window.clearInterval(timer);
    window.removeEventListener("pagehide", persist);
    document.removeEventListener("visibilitychange", onHidden);
  };
}
