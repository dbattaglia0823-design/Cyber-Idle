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
    path: "M770 393 L839 393 L894 414 L929 447 L938 506 L918 561 L881 591 L818 599 L767 579 L721 545 L699 505 L711 464 L739 428 Z",
    marker: { x: 850, y: 510 },
    color: "#31f3cf",
    glow: "rgba(49,243,207,0.46)",
    order: 3,
  },
  {
    districtId: "glasslineDistrict",
    path: "M786 603 L871 601 L942 620 L987 665 L1010 735 L1003 806 L977 884 L940 956 L887 1010 L828 1054 L770 1058 L721 1030 L692 978 L681 927 L690 860 L705 790 L714 724 L735 657 Z",
    marker: { x: 836, y: 882 },
    color: "#29c9ff",
    glow: "rgba(41,201,255,0.48)",
    order: 4,
  },
  {
    districtId: "redlineBlocks",
    path: "M431 880 L514 870 L608 871 L680 883 L714 923 L713 979 L701 1043 L700 1115 L666 1190 L603 1240 L515 1268 L422 1264 L354 1236 L324 1180 L330 1122 L312 1066 L315 996 L344 938 L380 905 Z",
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
    path: "M354 348 L444 333 L545 329 L628 340 L700 374 L749 425 L743 494 L719 548 L715 626 L691 704 L647 782 L585 840 L526 873 L463 844 L407 804 L365 746 L335 676 L324 600 L329 521 L342 447 Z",
    marker: { x: 550, y: 700 },
    color: "#ff3546",
    glow: "rgba(255,53,70,0.5)",
    order: 8,
  },
];
