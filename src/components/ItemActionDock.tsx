import { useEffect, useRef, useState, type ReactNode } from "react";

export function ItemActionDock({ name, children }: { name: string; children: ReactNode }) {
  const anchor = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const dock = anchor.current?.querySelector(".item-action-dock");
    if (!dock || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => document.documentElement.style.setProperty("--item-dock-height", `${dock.getBoundingClientRect().height}px`));
    observer.observe(dock);
    return () => { observer.disconnect(); document.documentElement.style.removeProperty("--item-dock-height"); };
  }, []);
  useEffect(() => {
    const panel = anchor.current?.closest(".runner-item-inspector");
    if (!panel || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: "-100px 0px -110px 0px" });
    observer.observe(panel);
    return () => observer.disconnect();
  }, []);
  return <div ref={anchor} className={`item-action-anchor ${visible ? "dock-visible" : ""}`}><div className="inventory-actions item-action-dock" aria-label={`Actions for ${name}`}><strong className="dock-item-name">{name}</strong>{children}</div></div>;
}
