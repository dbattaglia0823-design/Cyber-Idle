import { createContext, useContext, useEffect, type ReactNode } from "react";
import { useRememberedState } from "./useUiPreferences";

const Density = createContext({ compact: false, setCompact: (_value: boolean) => {} });
export function DisplayDensityProvider({ children }: { children: ReactNode }) {
  const [compact, setCompact] = useRememberedState("compact-display", false);
  useEffect(() => { document.documentElement.dataset.density = compact ? "compact" : "comfortable"; }, [compact]);
  return <Density.Provider value={{ compact, setCompact }}>{children}</Density.Provider>;
}
export function DisplayDensitySetting() {
  const { compact, setCompact } = useContext(Density);
  return <div className="settings-option-row"><div><h3>Compact display</h3><p className="muted">Smaller cards and less spacing.</p></div><button className={`toggle-button ${compact ? "active" : ""}`} aria-pressed={compact} onClick={() => setCompact(!compact)}>{compact ? "On" : "Off"}</button></div>;
}
