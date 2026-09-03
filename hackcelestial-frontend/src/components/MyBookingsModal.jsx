import { Plane, Train, Building, Tent, Compass, Trash2, Briefcase } from "lucide-react";
import Modal from "./ui/Modal";
import { useBooking } from "../context/BookingContext";

const CATEGORY_ICONS = { flights: Plane, trains: Train, hotels: Building, hostels: Tent, activities: Compass };

export default function MyBookingsModal({ onClose }) {
  const { confirmedBookings, removeBooking } = useBooking();

  return (
    <Modal onClose={onClose} maxWidth="max-w-lg" showCloseButton>
      <div className="p-6 border-b border-border flex items-center gap-2.5">
        <div className="h-9 w-9 rounded-sm bg-brand-dim flex items-center justify-center text-brand">
          <Briefcase className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-display font-medium text-base text-ink">My Bookings</h3>
          <p className="text-xs text-ink-dim">{confirmedBookings.length} confirmed</p>
        </div>
      </div>

      <div className="p-6 overflow-y-auto space-y-3">
        {confirmedBookings.length === 0 ? (
          <p className="text-sm text-ink-faint text-center py-10">No bookings yet — your confirmed trips will show up here.</p>
        ) : (
          confirmedBookings.map((b) => {
            const Icon = CATEGORY_ICONS[b.category] || Plane;
            return (
              <div key={b.id} className="flex items-center gap-3 rounded-sm border border-border bg-surface-sunk p-3.5">
                <div className="h-10 w-10 rounded-sm bg-surface border border-border flex items-center justify-center shrink-0 text-ink-dim">
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-sm text-ink truncate">{b.itemName}</div>
                  <div className="text-xs text-ink-faint">
                    {b.date || "Date pending"} · {b.guests} guest{b.guests > 1 ? "s" : ""}{b.nights ? ` · ${b.nights} nights` : ""}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-semibold text-sm text-ink">₹{b.totalPrice?.toLocaleString()}</div>
                  <button
                    onClick={() => removeBooking(b.id)}
                    className="inline-flex items-center gap-1 text-[11px] text-ink-faint hover:text-status-disrupted transition mt-1"
                  >
                    <Trash2 className="h-3 w-3" /> Cancel
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Modal>
  );
}
