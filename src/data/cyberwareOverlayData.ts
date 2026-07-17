import type { CyberwareSlot } from "../types";

export interface CyberwareOverlaySlot {
  slotId: CyberwareSlot;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  side: "left" | "right";
  anchorX: number;
  anchorY: number;
}

export const cyberwareOverlaySlots: CyberwareOverlaySlot[] = [
  { slotId: "optics", label: "Optics", x: 3.8, y: 9.2, width: 26.1, height: 17.2, side: "left", anchorX: 30.1, anchorY: 17.9 },
  { slotId: "neural", label: "Neural", x: 69.9, y: 10.1, width: 25.9, height: 16.7, side: "right", anchorX: 69.6, anchorY: 18.0 },
  { slotId: "arms", label: "Arms", x: 3.8, y: 30.4, width: 26.1, height: 17.4, side: "left", anchorX: 30.0, anchorY: 39.4 },
  { slotId: "skin", label: "Skin", x: 69.9, y: 31.3, width: 25.9, height: 17.1, side: "right", anchorX: 69.6, anchorY: 39.5 },
  { slotId: "legs", label: "Legs", x: 3.8, y: 52.1, width: 26.1, height: 17.1, side: "left", anchorX: 30.0, anchorY: 60.6 },
  { slotId: "skeleton", label: "Skeleton", x: 69.9, y: 52.8, width: 25.9, height: 17.1, side: "right", anchorX: 69.6, anchorY: 60.8 },
  { slotId: "operatingSystem", label: "Operating System", x: 3.8, y: 73.4, width: 26.1, height: 17.3, side: "left", anchorX: 30.0, anchorY: 81.9 },
  { slotId: "utility", label: "Utility", x: 69.9, y: 74.2, width: 25.9, height: 17.0, side: "right", anchorX: 69.6, anchorY: 81.9 },
];
