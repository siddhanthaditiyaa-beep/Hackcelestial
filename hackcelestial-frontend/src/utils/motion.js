export const EASE_OUT = [0.16, 1, 0.3, 1];

export const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: EASE_OUT },
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.35, ease: EASE_OUT },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.97 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.4, ease: EASE_OUT },
};

export function stagger(i, base = 0.04) {
  return { transition: { duration: 0.45, ease: EASE_OUT, delay: i * base } };
}

export const hoverLift = { y: -3 };
