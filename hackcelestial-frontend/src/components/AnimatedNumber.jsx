import { useEffect, useState, useRef } from "react";

export default function AnimatedNumber({ value, duration = 700, suffix = "", format }) {
  const [display, setDisplay] = useState(value);
  const startRef = useRef(null);
  const fromRef = useRef(value);
  const displayRef = useRef(value);

  useEffect(() => {
    fromRef.current = displayRef.current;
    startRef.current = null;
    const from = fromRef.current;
    const delta = value - from;

    let raf;
    const step = (ts) => {
      if (startRef.current === null) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = Math.round(from + delta * eased);
      displayRef.current = next;
      setDisplay(next);
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration]);

  return <span className="tabular-nums">{format ? format(display) : `${display}${suffix}`}</span>;
}
