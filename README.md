# Flight Training

Live: https://thereallukasbrandt.github.io/Flight-Training/

Six interactive conceptual lessons: steep turns, combined power-on/power-off stalls, power-off 180, eights on pylons, Dutch rolls, and turns around a point. Aerobatic Maneuvers is reserved for later content.

The homepage uses the existing F-22 artwork with scroll-linked lighting, highlights, and shadows. Colors: midnight navy `#0b1524`, dusk blue `#526b87`, sunset orange `#ee9467`, with neutral text.

## Files

- `index.html`, `app.js`: homepage, search, lighting controls.
- `lesson.html`, `lesson.js`: reusable lesson page and interactive SVG visuals.
- `content.js`: lesson explanations, derivations, assumptions, and primary FAA source links.
- `physics.js`: documented SI-unit teaching models.
- `styles.css`: shared visual styles and responsive layout.
- `tests/physics.test.js`: limiting cases, units, wind kinematics, energy accounting, and damping checks.

No build or installed dependencies. GitHub Pages serves `main` from the repository root. Test with `npm test`; preview with a static HTTP server. Google Fonts are optional, with local fallback fonts.

## Model scope

These are explanatory models, not aircraft-specific performance predictions or procedural checklists. Each lesson separates the compact explanation from expandable derivation and assumptions. The glide model conserves a per-mass energy budget and explicitly accounts for drag losses. Its prescribed speed schedule, chosen drag polar, and illustrative ground-effect factor do not predict a real landing distance or full power-off 180. The Dutch-roll mode shape is illustrative, and is distinguished from the trainer coordination exercise. The pivotal-height derivation is ideal still-air geometry; applying groundspeed in wind follows the FAA approximation. The ground-circle model includes heading/track geometry in uniform wind.

Aircraft procedures, recovery techniques, performance data, and limits must come from the applicable AFM/POH and instruction. References are linked in each lesson.

## Artwork

`assets/f22-raptor.webp` is the existing optimized, transparent AI-assisted interpretation of the user-provided F-22 reference. It is decorative artwork. No new raster assets were created for this revision.
