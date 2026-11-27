import { ButtonLink } from '../../components/ui';

const PRICE = new Intl.NumberFormat('ro-RO', { maximumFractionDigits: 2 });

/** "60 lei / oră" or "Gratuit". */
function priceText(pricePerHour) {
  return pricePerHour === 0
    ? 'Gratuit'
    : `${PRICE.format(pricePerHour)} lei / oră`;
}

/**
 * The chosen slot's price and "Continuă": fixed above the phone bar, a card
 * under the list on desktop (Figma).
 * @param {{slot: Object, pricePerHour: ?number}} props `pricePerHour` from
 *     GET /facilities; without it the slot's own price is shown
 */
export default function SelectionBar({ slot, pricePerHour }) {
  return (
    <div className="fixed inset-x-0 bottom-[65px] z-10 flex items-center justify-between gap-4 bg-suprafata px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.08)] md:static md:rounded-2xl md:px-5 md:py-4 md:shadow-sm md:ring-1 md:ring-bordura">
      <p className="text-base font-bold">
        {pricePerHour === null
          ? `${PRICE.format(slot.price)} lei`
          : priceText(pricePerHour)}
      </p>
      {/* TODO(CB-19): screen 03 reads the chosen slot from ?interval=. */}
      <ButtonLink
        to={`/facilitati/${slot.facilityId}?interval=${slot.id}`}
        className="px-10"
      >
        Continuă
      </ButtonLink>
    </div>
  );
}
