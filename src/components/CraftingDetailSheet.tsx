import { useEffect, useRef, useState, type ReactNode } from "react";

export function CraftingDetailSheet({ open, onClose, className, children }: { open: boolean; onClose: () => void; className: string; children: ReactNode }) {
  const [mobile,setMobile]=useState(()=>typeof window!=="undefined" && window.matchMedia("(max-width:760px)").matches);
  const panel=useRef<HTMLElement>(null), close=useRef(onClose); close.current=onClose;
  useEffect(()=>{const media=window.matchMedia("(max-width:760px)");const update=()=>setMobile(media.matches);media.addEventListener("change",update);return()=>media.removeEventListener("change",update);},[]);
  useEffect(()=>{
    if(!mobile||!open)return;
    const previous=document.activeElement as HTMLElement|null, overflow=document.body.style.overflow, scroll=window.scrollY;
    document.body.style.overflow="hidden";panel.current?.focus();
    const key=(event:KeyboardEvent)=>{
      if(document.querySelector(".source-popover"))return;
      if(event.key==="Escape"){event.preventDefault();close.current();}
      if(event.key==="Tab"){
        const nodes=Array.from(panel.current?.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input,select,summary,[tabindex="0"]')??[]);
        const first=nodes[0],last=nodes[nodes.length-1];
        if(event.shiftKey&&(document.activeElement===first||document.activeElement===panel.current)){event.preventDefault();last?.focus();}
        else if(!event.shiftKey&&(document.activeElement===last||document.activeElement===panel.current)){event.preventDefault();first?.focus();}
      }
    };
    document.addEventListener("keydown",key);
    return()=>{document.body.style.overflow=overflow;document.removeEventListener("keydown",key);if(previous?.isConnected){window.scrollTo({top:scroll,behavior:"instant"});previous.focus({preventScroll:true});}};
  },[mobile,open]);
  return <div className={`recipe-detail-layer ${open?"recipe-sheet-open":""}`}>
    {mobile&&open&&<button className="recipe-sheet-scrim" aria-label="Close recipe details" onClick={onClose}/>}
    <aside ref={panel} tabIndex={-1} role={mobile&&open?"dialog":undefined} aria-modal={mobile&&open?true:undefined} aria-label="Selected recipe" className={className}>
      <div className="recipe-sheet-toolbar"><strong>Recipe details</strong><button className="secondary-button" onClick={onClose}>Back to recipes</button></div>
      {children}
    </aside>
  </div>;
}
