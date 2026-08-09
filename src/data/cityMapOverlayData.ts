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
    path: "M320 70 L438 66 L445 126 L514 174 L522 222 L553 284 L563 324 L517 341 L459 343 L407 356 L342 366 L286 397 L235 381 L208 345 L201 305 L151 286 L133 249 L153 207 L196 162 L243 113 Z",
    marker: { x: 320, y: 255 },
    color: "#ff3fb6",
    glow: "rgba(255,63,182,0.48)",
    order: 1,
  },
  {
    districtId: "rustYards",
    path: "M558 164 L630 146 L749 153 L822 177 L919 245 L941 292 L918 351 L860 406 L796 408 L724 383 L650 374 L597 355 L562 328 L548 290 L519 238 Z",
    marker: { x: 746, y: 292 },
    color: "#ff9f2e",
    glow: "rgba(255,159,46,0.48)",
    order: 2,
  },
  {
    districtId: "underpassMarket",
    path: "M706 402 L770 382 L850 390 L915 418 L944 455 L949 512 L936 563 L965 598 L981 635 L957 675 L907 697 L851 688 L800 658 L757 619 L713 584 L684 539 L681 491 L691 446 Z",
    marker: { x: 850, y: 510 },
    color: "#31f3cf",
    glow: "rgba(49,243,207,0.46)",
    order: 3,
  },
  {
    districtId: "glasslineDistrict",
    path: "M758 610 L816 624 L873 658 L935 679 L982 708 L1013 758 L1021 819 L1008 884 L989 945 L963 1008 L918 1054 L860 1081 L797 1085 L748 1068 L718 1028 L692 982 L686 925 L697 868 L708 810 L719 750 L729 690 Z",
    marker: { x: 836, y: 882 },
    color: "#29c9ff",
    glow: "rgba(41,201,255,0.48)",
    order: 4,
  },
  {
    districtId: "redlineBlocks",
    path: "M428 893 L475 876 L552 872 L627 865 L685 885 L700 920 L692 980 L688 1030 L720 1080 L765 1122 L810 1160 L842 1183 L805 1212 L739 1235 L674 1257 L603 1272 L523 1285 L450 1282 L390 1264 L365 1230 L370 1180 L390 1125 L420 1070 L425 1015 L418 960 Z",
    marker: { x: 562, y: 1088 },
    color: "#ff4d4d",
    glow: "rgba(255,77,77,0.48)",
    order: 5,
  },
  {
    districtId: "helixWard",
    path: "M118 848 L190 828 L258 839 L315 875 L367 930 L401 992 L409 1039 L372 1092 L323 1153 L270 1205 L218 1220 L162 1193 L103 1149 L63 1096 L42 1038 L46 974 L66 918 Z",
    marker: { x: 225, y: 990 },
    color: "#54f08a",
    glow: "rgba(84,240,138,0.46)",
    order: 6,
  },
  {
    districtId: "blacknetQuarter",
    path: "M201 407 L265 414 L289 449 L310 506 L345 570 L348 640 L326 701 L289 759 L232 801 L162 814 L99 796 L48 755 L25 695 L35 626 L61 554 L91 494 L135 438 Z",
    marker: { x: 180, y: 615 },
    color: "#bc5cff",
    glow: "rgba(188,92,255,0.48)",
    order: 7,
  },
  {
    districtId: "skylineCore",
    path: "M365 425 L445 398 L535 395 L620 410 L680 442 L718 485 L732 535 L724 585 L711 635 L700 690 L675 745 L640 800 L595 848 L540 875 L486 856 L430 820 L388 770 L355 710 L338 645 L337 575 L344 505 Z",
    marker: { x: 550, y: 700 },
    color: "#ff3546",
    glow: "rgba(255,53,70,0.5)",
    order: 8,
  },
];
