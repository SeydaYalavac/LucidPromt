export function clampMapScale(scale: number) {
  return Math.min(4, Math.max(1, scale));
}
