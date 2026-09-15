import { useRef } from "react";
import { ChevronDown, Check } from "lucide-react";

/** In-flow navigation keeps full labels readable without a modal or sideways scrolling. */
export function MobileSectionMenu<T extends string>({ label, value, options, onChange }: {
  label: string;
  value: T;
  options: ReadonlyArray<{ id: T; label: string }>;
  onChange: (value: T) => void;
}) {
  const disclosure = useRef<HTMLDetailsElement>(null);
  return <details className="mobile-section-menu" ref={disclosure}>
    <summary><span><small>{label}</small><strong>{options.find(option => option.id === value)?.label}</strong></span><ChevronDown size={20} /></summary>
    <nav aria-label={label}>{options.map(option => <button key={option.id} type="button" aria-current={value === option.id ? "page" : undefined} onClick={() => {
      onChange(option.id);
      if (disclosure.current) {
        disclosure.current.open = false;
        disclosure.current.querySelector("summary")?.focus();
      }
    }}><span>{option.label}</span>{value === option.id && <Check size={16} />}</button>)}</nav>
  </details>;
}
