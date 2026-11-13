import { useEffect, useRef, useState, type ReactNode } from "react";

type CraftingDetailSheetProps = {
  open: boolean;
  onClose: () => void;
  className: string;
  children: ReactNode;
  title?: string;
  backLabel?: string;
  dialogLabel?: string;
  modalOnDesktop?: boolean;
};

export function CraftingDetailSheet({
  open,
  onClose,
  className,
  children,
  title = "Recipe details",
  backLabel = "Back to recipes",
  dialogLabel = "Selected recipe",
  modalOnDesktop = false,
}: CraftingDetailSheetProps) {
  const [mobile, setMobile] = useState(() => typeof window !== "undefined" && window.matchMedia("(max-width:760px)").matches);
  const isModal = mobile || modalOnDesktop;
  const panel = useRef<HTMLElement>(null);
  const close = useRef(onClose);
  close.current = onClose;

  useEffect(() => {
    const media = window.matchMedia("(max-width:760px)");
    const update = () => setMobile(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!isModal || !open) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    const scroll = window.scrollY;
    document.body.style.overflow = "hidden";
    panel.current?.focus();

    const key = (event: KeyboardEvent) => {
      // A source popover or native upgrade dialog should handle its own keys first.
      if (document.querySelector(".source-popover, dialog[open]")) return;
      if (event.key === "Escape") {
        event.preventDefault();
        close.current();
      }
      if (event.key === "Tab") {
        const nodes = Array.from(panel.current?.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input,select,summary,[tabindex="0"]') ?? []);
        const first = nodes[0], last = nodes[nodes.length - 1];
        if (event.shiftKey && (document.activeElement === first || document.activeElement === panel.current)) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && (document.activeElement === last || document.activeElement === panel.current)) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", key);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", key);
      if (previous?.isConnected) {
        window.scrollTo({ top: scroll, behavior: "instant" });
        previous.focus({ preventScroll: true });
      }
    };
  }, [isModal, open]);

  return <div className={`recipe-detail-layer ${modalOnDesktop ? "inventory-detail-layer " : ""}${open ? "recipe-sheet-open" : ""}`}>
    {isModal && open && <button className="recipe-sheet-scrim" aria-label={`Close ${title.toLowerCase()}`} onClick={onClose} />}
    <aside ref={panel} tabIndex={-1} role={isModal && open ? "dialog" : undefined} aria-modal={isModal && open ? true : undefined} aria-label={dialogLabel} className={className}>
      <div className="recipe-sheet-toolbar"><strong>{title}</strong><button className="secondary-button" onClick={onClose}>{backLabel}</button></div>
      {children}
    </aside>
  </div>;
}
