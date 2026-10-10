type SlotSelectorProps = {
  slots: string[];
  selectedSlot?: string;
  onSelect?: (slot: string) => void;
};

export default function SlotSelector({
  slots,
  selectedSlot,
  onSelect,
}: SlotSelectorProps) {
  if (!slots.length) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 text-center">
        <p className="text-sm font-medium text-zinc-800">
          No available slots
        </p>
        <p className="mt-1 text-xs text-zinc-500">
          Try another date or doctor.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-zinc-900">
          Available time slots
        </h3>

        <p className="mt-1 text-xs text-zinc-500">
          Each appointment is 1 hour.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {slots.map((slot) => {
          const selected = selectedSlot === slot;

          return (
            <button
              key={slot}
              onClick={() => onSelect?.(slot)}
              className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                selected
                  ? "border-zinc-900 bg-zinc-900 text-white"
                  : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400 hover:bg-zinc-50"
              }`}
            >
              {slot}
            </button>
          );
        })}
      </div>
    </div>
  );
}