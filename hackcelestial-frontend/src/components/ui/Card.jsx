import { motion } from "framer-motion";

const RADIUS = { sm: "rounded-sm", md: "rounded-md", lg: "rounded-lg" };

export default function Card({
  as: Comp = motion.div,
  radius = "md",
  interactive = false,
  className = "",
  children,
  ...props
}) {
  const interactiveProps = interactive
    ? { whileHover: { y: -3 }, transition: { duration: 0.25 } }
    : {};

  return (
    <Comp
      className={`bg-surface border border-border shadow-sm ${interactive ? "hover:shadow-md transition-shadow" : ""} ${RADIUS[radius]} ${className}`}
      {...interactiveProps}
      {...props}
    >
      {children}
    </Comp>
  );
}
