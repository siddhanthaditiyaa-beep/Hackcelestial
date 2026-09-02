import { motion } from "framer-motion";
import BookingNode from "./BookingNode";

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

export default function ItineraryRail({
  bookings,
  atRiskIds,
  impact,
  selectedId,
  onSelect,
}) {
  const byId = Object.fromEntries(bookings.map((b) => [b.id, b]));

  const cascadeOrder = impact
    ? [impact.directImpact, ...impact.downstreamImpacts]
    : [];

  return (
    <motion.div className="space-y-4" variants={listVariants} initial="hidden" animate="visible">
      {bookings.map((booking, idx) => {
        const parentId = booking.dependsOn[0];
        const prevId = idx > 0 ? bookings[idx - 1].id : null;
        const isBranch = parentId && parentId !== prevId;
        const cascadeIdx = cascadeOrder.indexOf(booking.id);

        return (
          <BookingNode
            key={booking.id}
            booking={booking}
            parentTitle={parentId ? byId[parentId]?.title : null}
            isBranch={isBranch}
            isProactivelyAtRisk={atRiskIds.includes(booking.id)}
            cascadeDelay={cascadeIdx >= 0 ? cascadeIdx * 0.18 : 0}
            isSelected={selectedId === booking.id}
            onSelect={onSelect}
          />
        );
      })}
    </motion.div>
  );
}
