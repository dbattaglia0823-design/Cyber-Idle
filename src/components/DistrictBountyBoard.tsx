import { districtBountyOffers } from "../data/districtBounties";
import { gigVariants } from "../data/gigContracts";
import { getItem } from "../data/items";
import { resourceNames } from "../data/resources";
import type { RpgMission } from "../data/rpgCampaign";
import type { GameState } from "../types";

export function DistrictBountyBoard({ state, mission, selectedId, onSelect, disabled = false }: {
  state: GameState;
  mission: RpgMission;
  selectedId?: string;
  onSelect: (id: string | undefined) => void;
  disabled?: boolean;
}) {
  const offers = districtBountyOffers(state, mission);
  if (!offers.length) return null;
  const cycle = offers[0].cycle;
  return <section className="district-bounty-board" aria-label="District bounty board">
    <div className="district-bounty-heading">
      <div><p className="rpg-eyebrow">DISTRICT CONTRACTS / ROTATION {cycle + 1}</p><h3>Bounty board</h3></div>
      <span>3 active offers</span>
    </div>
    <p className="fine">Pick a target or run the regular local gig. Completing a bounty refreshes this district's offers; other districts keep their own boards. No additional runner XP after the first gig clear.</p>
    <div className="district-bounty-options">
      <button type="button" aria-pressed={!selectedId} className={!selectedId ? "selected" : ""} disabled={disabled} onClick={() => onSelect(undefined)}>
        <strong>Regular local gig</strong><small>Standard patrol · normal gig payout and supplies</small>
      </button>
      {offers.map(offer => <button type="button" key={offer.id} aria-pressed={selectedId === offer.id} className={selectedId === offer.id ? "selected" : ""} disabled={disabled} onClick={() => onSelect(offer.id)}>
        <span className="district-bounty-kind">{offer.kind.toUpperCase()}</span>
        <strong>{offer.title}</strong>
        <small>{offer.briefing} · {gigVariants[offer.variant]}</small>
        <em>+{offer.creditBonus.toLocaleString()} credits · +{offer.rewardItemAmount} {getItem(offer.rewardItemId)?.name ?? resourceNames[offer.rewardItemId as keyof typeof resourceNames] ?? offer.rewardItemId}</em>
      </button>)}
    </div>
    {selectedId && offers.some(offer => offer.id === selectedId) && <p className="district-bounty-selected">{offers.find(offer => offer.id === selectedId)!.objective} Reward is guaranteed after completion; your chosen optional gig objective pays separately.</p>}
  </section>;
}
