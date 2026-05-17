/**
 * AmbientOrbs — Fixed background glow orbs that give liquid-glass surfaces
 * something colourful to refract. Without these the glass effect looks dead.
 *
 * Orbs drift slowly via CSS keyframes (60s+ cycles) so refraction inside
 * cards never looks static, but motion is subtle enough to avoid distraction.
 * Pure CSS, GPU-only (transform + filter). Place once in layout.
 */
export function AmbientOrbs() {
  return (
    <div className="ambient-orbs" aria-hidden="true">
      <div className="ambient-orb ambient-orb-primary" />
      <div className="ambient-orb ambient-orb-secondary" />
      <div className="ambient-orb ambient-orb-tertiary" />
      <div className="ambient-orb ambient-orb-cyan" />
      <div className="ambient-orb ambient-orb-pink" />
      <div className="ambient-orb ambient-orb-amber" />
      <div className="ambient-grid" />
      <div className="ambient-noise" />
      <div className="ambient-vignette" />
    </div>
  );
}
