import armorIcon from "../assets/inventory/Armor.png";
import assaultRifleIcon from "../assets/inventory/AssaultRifle.png";
import bladesIcon from "../assets/inventory/Blades.png";
import bluntIcon from "../assets/inventory/Blunt.png";
import bootsIcon from "../assets/inventory/Boots.png";
import cyberwareIcon from "../assets/inventory/Cyberware.png";
import handsIcon from "../assets/inventory/Hands.png";
import heavyIcon from "../assets/inventory/Heavy.png";
import helmetIcon from "../assets/inventory/Helmet.png";
import iconicCyberwareIcon from "../assets/inventory/IconicCyberware.png";
import legsArmorIcon from "../assets/inventory/Legs.png";
import pistolIcon from "../assets/inventory/Pistol.png";
import shotgunIcon from "../assets/inventory/Shotgun.png";
import smartIcon from "../assets/inventory/Smart.png";
import smgIcon from "../assets/inventory/SMG.png";
import sniperIcon from "../assets/inventory/Sniper.png";
import techIcon from "../assets/inventory/Tech.png";
import armorPlatingIcon from "../assets/materials/ArmorPlating.png";
import circuitBoardsIcon from "../assets/materials/CircuitBoards.png";
import creditsIcon from "../assets/materials/Credits.png";
import cyberwarePartsIcon from "../assets/materials/CyberwareParts.png";
import encryptedDataIcon from "../assets/materials/EncryptedData.png";
import engineCoreIcon from "../assets/materials/EngineCore.png";
import fuelCellIcon from "../assets/materials/FuelCell.png";
import navigationChipIcon from "../assets/materials/NavigationChip.png";
import prototypeDriveUnitIcon from "../assets/materials/PrototypeDriveUnit.png";
import scrapIcon from "../assets/materials/Scrap.png";
import smugglerCompartmentIcon from "../assets/materials/SmugglerCompartment.png";
import vehiclePartsIcon from "../assets/materials/VehicleParts.png";
import type { CyberwareSlot, GearSlot, ItemDefinition, ItemType, WeaponClassId } from "../types";

type EquipmentIconInfo = {
  label: string;
  title: string;
  className: string;
  src?: string;
};

const weaponClassIcons: Record<WeaponClassId, EquipmentIconInfo> = {
  pistols: icon("PST", "Pistol", "weapon", pistolIcon),
  smgs: icon("SMG", "SMG", "weapon", smgIcon),
  shotguns: icon("SG", "Shotgun", "weapon", shotgunIcon),
  assaultRifles: icon("AR", "Assault rifle", "weapon", assaultRifleIcon),
  sniperRifles: icon("SR", "Sniper rifle", "weapon", sniperIcon),
  blades: icon("BLD", "Blade", "melee", bladesIcon),
  bluntWeapons: icon("BLT", "Blunt weapon", "melee", bluntIcon),
  techWeapons: icon("TEC", "Tech weapon", "tech", techIcon),
  smartWeapons: icon("SMT", "Smart weapon", "tech", smartIcon),
  heavyWeapons: icon("HVY", "Heavy weapon", "heavy", heavyIcon),
  cyberdeckWeapons: icon("NET", "Cyberdeck weapon", "net", cyberwareIcon),
  exoticWeapons: icon("EXO", "Exotic weapon", "exotic", iconicCyberwareIcon),
};

const gearSlotIcons: Record<GearSlot, EquipmentIconInfo> = {
  weapon: icon("WPN", "Weapon slot", "weapon"),
  head: icon("HD", "Head armor", "armor", helmetIcon),
  chest: icon("CH", "Chest armor", "armor", armorIcon),
  hands: icon("HN", "Hand armor", "armor", handsIcon),
  legs: icon("LG", "Leg armor", "armor", legsArmorIcon),
  boots: icon("BT", "Boots", "armor", bootsIcon),
  accessory1: icon("ACC", "Accessory", "accessory"),
  accessory2: icon("ACC", "Accessory", "accessory"),
};

const cyberwareSlotIcons: Record<CyberwareSlot, EquipmentIconInfo> = {
  neural: icon("NEU", "Neural cyberware", "cyberware", cyberwareIcon),
  optics: icon("OPT", "Optics cyberware", "cyberware", cyberwareIcon),
  arms: icon("ARM", "Arm cyberware", "cyberware", cyberwareIcon),
  legs: icon("LEG", "Leg cyberware", "cyberware", cyberwareIcon),
  skin: icon("SKN", "Skin cyberware", "cyberware", cyberwareIcon),
  skeleton: icon("SKL", "Skeleton cyberware", "cyberware", cyberwareIcon),
  operatingSystem: icon("OS", "Operating system", "cyberware", cyberwareIcon),
  utility: icon("UTIL", "Utility cyberware", "cyberware", cyberwareIcon),
};

const itemTypeIcons: Partial<Record<ItemType, EquipmentIconInfo>> = {
  Resource: icon("RES", "Resource", "resource"),
  Material: icon("MAT", "Material", "material"),
  Component: icon("CMP", "Component", "material"),
  WeaponAttachment: icon("ATT", "Weapon attachment", "attachment"),
  WeaponMod: icon("MOD", "Weapon mod", "mod"),
  Armor: icon("ARM", "Armor", "armor"),
  Cyberware: icon("CYB", "Cyberware", "cyberware"),
  Consumable: icon("CON", "Consumable", "consumable"),
  Blueprint: icon("BP", "Blueprint", "blueprint"),
  Quest: icon("QST", "Quest item", "quest"),
};

const materialItemIcons: Record<string, EquipmentIconInfo> = {
  credits: icon("CR", "Credits", "resource", creditsIcon),
  scrap: icon("MAT", "Scrap", "material", scrapIcon),
  circuitBoards: icon("MAT", "Circuit Boards", "material", circuitBoardsIcon),
  encryptedData: icon("MAT", "Encrypted Data", "material", encryptedDataIcon),
  cyberwareParts: icon("MAT", "Cyberware Parts", "material", cyberwarePartsIcon),
  vehicleParts: icon("MAT", "Vehicle Parts", "material", vehiclePartsIcon),
  engineCore: icon("MAT", "Engine Core", "material", engineCoreIcon),
  armorPlating: icon("MAT", "Armor Plating", "material", armorPlatingIcon),
  fuelCell: icon("MAT", "Fuel Cell", "material", fuelCellIcon),
  navigationChip: icon("MAT", "Navigation Chip", "material", navigationChipIcon),
  smugglerCompartment: icon("MAT", "Smuggler Compartment", "material", smugglerCompartmentIcon),
  prototypeDriveUnit: icon("MAT", "Prototype Drive Unit", "material", prototypeDriveUnitIcon),
};

export function equipmentIconForItem(item?: ItemDefinition, fallbackSlot?: GearSlot | CyberwareSlot, fallbackKind?: "gear" | "cyberware"): EquipmentIconInfo | null {
  if (item?.id && materialItemIcons[item.id]) return materialItemIcons[item.id];
  if (item?.type === "Weapon" && item.weaponClass) return weaponClassIcons[item.weaponClass];
  if (item?.type === "Cyberware" && item.rarity === "Prototype") return { ...(cyberwareSlotIcons[item.slot as CyberwareSlot] ?? itemTypeIcons.Cyberware ?? icon("CYB", "Cyberware", "cyberware")), src: iconicCyberwareIcon, className: "cyberware" };
  if (item?.type === "Cyberware" && item.slot) return cyberwareSlotIcons[item.slot as CyberwareSlot] ?? itemTypeIcons.Cyberware ?? null;
  if (item?.slot && item.type === "Armor") return gearSlotIcons[item.slot as GearSlot] ?? itemTypeIcons.Armor ?? null;
  if (item?.type && itemTypeIcons[item.type]) return itemTypeIcons[item.type] ?? null;
  if (fallbackKind === "gear" && fallbackSlot && fallbackSlot in gearSlotIcons) return gearSlotIcons[fallbackSlot as GearSlot];
  if (fallbackKind === "cyberware" && fallbackSlot && fallbackSlot in cyberwareSlotIcons) return cyberwareSlotIcons[fallbackSlot as CyberwareSlot];
  if (fallbackSlot && fallbackSlot in cyberwareSlotIcons) return cyberwareSlotIcons[fallbackSlot as CyberwareSlot];
  if (fallbackSlot && fallbackSlot in gearSlotIcons) return gearSlotIcons[fallbackSlot as GearSlot];
  return null;
}

function icon(label: string, title: string, className: string, src?: string): EquipmentIconInfo {
  return { label, title, className, src };
}
