/**
 * Tabs for the `scope` filter of GET /bookings.
 * @param {{value: string, onChange: function(string): void,
 *     options: Array<{value: string, label: string}>}} props
 */
export default function BookingScopeTabs({ value, onChange, options }) {
  return (
    <div
      className="inline-flex self-start rounded-lg bg-suprafata p-1 ring-1 ring-bordura"
      role="tablist"
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={option.value === value}
          onClick={() => onChange(option.value)}
          className={`rounded-md px-4 py-1.5 text-sm ${
            option.value === value
              ? 'bg-principala font-bold text-white'
              : 'text-text-secundar hover:text-text'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
