import type { DistrictId } from "../types";

export interface CityMapOverlayRegion {
  districtId: DistrictId;
  path: string;
  marker: { x: number; y: number };
  color: string;
  glow: string;
  order: number;
}

export const cityMapOverlayRegions: CityMapOverlayRegion[] = [
  {
    districtId: "neonRow",
    path: "M208 124 L300 72 L415 76 L464 108 L476 168 L530 222 L510 326 L444 358 L438 404 L334 404 L246 374 L208 320 L170 304 L146 232 L154 166 Z",
    marker: { x: 320, y: 255 },
    color: "#ff3fb6",
    glow: "rgba(255,63,182,0.48)",
    order: 1,
  },
  {
    districtId: "rustYards",
    path: "M552 176 L626 134 L806 154 L926 232 L920 330 L862 382 L760 420 L642 392 L570 350 L526 262 Z",
    marker: { x: 746, y: 292 },
    color: "#ff9f2e",
    glow: "rgba(255,159,46,0.48)",
    order: 2,
  },
  {
    districtId: "underpassMarket",
    path: "M782 400 L896 380 L970 424 L1000 512 L980 594 L918 650 L808 660 L736 620 L692 552 L714 468 Z",
    marker: { x: 885, y: 520 },
    color: "#31f3cf",
    glow: "rgba(49,243,207,0.46)",
    order: 3,
  },
  {
    districtId: "glasslineDistrict",
    path: "M776 720 L916 700 L996 786 L986 932 L920 1028 L802 1064 L700 1002 L646 904 L674 800 Z",
    marker: { x: 836, y: 882 },
    color: "#29c9ff",
    glow: "rgba(41,201,255,0.48)",
    order: 4,
  },
  {
    districtId: "redlineBlocks",
    path: "M390 824 L564 790 L704 808 L760 942 L726 1168 L598 1236 L420 1222 L310 1120 L288 974 L326 878 Z",
    marker: { x: 562, y: 1088 },
    color: "#ff4d4d",
    glow: "rgba(255,77,77,0.48)",
    order: 5,
  },
  {
    districtId: "helixWard",
    path: "M80 854 L242 810 L342 868 L400 988 L346 1100 L236 1182 L90 1134 L30 1046 L36 918 Z",
    marker: { x: 225, y: 990 },
    color: "#54f08a",
    glow: "rgba(84,240,138,0.46)",
    order: 6,
  },
  {
    districtId: "blacknetQuarter",
    path: "M72 456 L236 374 L386 420 L422 560 L388 720 L282 806 L112 780 L44 682 L32 556 Z",
    marker: { x: 180, y: 615 },
    color: "#bc5cff",
    glow: "rgba(188,92,255,0.48)",
    order: 7,
  },
  {
    districtId: "skylineCore",
    path: "M432 428 L618 432 L738 546 L686 706 L562 816 L422 766 L332 660 L334 516 Z",
    marker: { x: 550, y: 700 },
    color: "#ff3546",
    glow: "rgba(255,53,70,0.5)",
    order: 8,
  },
];
