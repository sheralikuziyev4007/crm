const STEPS = [1, 2, 5, 10, 20, 50, 100];
const TARGET_TICKS = 4;

/** Clean axis ticks from 0: max 7 → [0, 2, 4, 6, 8] */
export function niceTicks(max: number): number[] {
  const step = STEPS.find((s) => max / s <= TARGET_TICKS) ?? STEPS[STEPS.length - 1];
  const top = Math.max(step, Math.ceil(max / step) * step);
  return Array.from({ length: top / step + 1 }, (_, i) => i * step);
}
