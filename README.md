# Flight Training

Live: https://pilot-engineer-academy.vercel.app/

GitHub Pages mirror: https://thereallukasbrandt.github.io/Flight-Training/

Vercel project: `pilot-engineer-academy` in `lukebrandt-2817`. The current production release was uploaded directly from this repository. Automatic deployment on GitHub pushes requires adding the GitHub login connection in Vercel and linking this repository. `vercel.json` configures the existing static files without a build step.

## Area II course

`technical.html` is the searchable course library. It contains 14 supplied ACS subjects (A–K and M–O), 89 lesson subsections, and 84 scenario/understanding questions. Each subject has a core explanation, optional deeper reasoning, visual examples, teach-back prompts, references, and a six-question review. Feedback links directly to the relevant subsection. Practice answers stay in the student's browser.

The light course layout uses a persistent outline and lesson rows, with navy, dusk blue, and sunset orange accents. The original F-22 landing visual and six maneuver models remain available.

- `technical/*.json`: rewritten lesson content, quiz answers/explanations, uploaded-source mapping, and current FAA/eCFR references.
- `technical-catalog.js`, `course-outline.js`: small navigation data; full subjects load on demand.
- `technical.js`, `technical.css`, `technical-visuals.js`: course navigation, search, reading, visual models, and practice.
- `tools/build-course-index.mjs`: validates lesson data and creates the outline and full-content search index.
- `tests/technical.test.js`: checks coverage, safe content, quiz review links, source mappings, and generated search/navigation consistency.

Run `npm run build:index` after editing lesson content, then `npm test`. `node tools/prepare-static.mjs /absolute/output/path` creates a static deployment directory. The original presentation/document binaries are not included in the public site.

## Performance changes

The original homepage changed large-image brightness/contrast/drop-shadow filters and a radial mask position on each scroll frame. The revised effect changes only a shared transform and layer opacities, caches geometry on resize, and stops work outside the hero. Google Fonts are now self-hosted with their OFL licenses, replacing the external CSS import. The homepage loads a small maneuver catalog rather than all lesson derivations. Technical lesson JSON loads one subject at a time, and the full-content search index loads only when searching.

These changes remove avoidable rendering and request dependencies. They do not establish a measured frame-rate improvement on every device; the original network timings from the remote test environment are not a benchmark of a student's connection.

Six interactive conceptual lessons: steep turns, combined power-on/power-off stalls, power-off 180, eights on pylons, Dutch rolls, and turns around a point. Aerobatic Maneuvers is reserved for later content.

The homepage uses the existing F-22 artwork with scroll-linked lighting, highlights, and shadows. Colors: midnight navy `#0b1524`, dusk blue `#526b87`, sunset orange `#ee9467`, with neutral text.

## Files

- `index.html`, `app.js`: homepage, search, lighting controls.
- `lesson.html`, `lesson.js`: reusable lesson page and interactive SVG visuals.
- `content.js`: lesson explanations, derivations, assumptions, and primary FAA source links.
- `math-format.js`: semantic MathML for aligned equations, stacked fractions, radicals, and mathematical scripts; rendered natively without an external typesetting script.
- `physics.js`: documented SI-unit teaching models.
- `styles.css`: shared visual styles and responsive layout.
- `tests/physics.test.js`: limiting cases, units, wind kinematics, energy accounting, and damping checks.

No build or installed dependencies. GitHub Pages serves `main` from the repository root. Test with `npm test`; preview with a static HTTP server. Google Fonts are optional, with local fallback fonts.

## Model scope

These are explanatory models, not aircraft-specific performance predictions or procedural checklists. Each lesson separates the compact explanation from expandable derivation and assumptions. The glide model conserves a per-mass energy budget and explicitly accounts for drag losses. Its prescribed speed schedule, chosen drag polar, and illustrative ground-effect factor do not predict a real landing distance or full power-off 180. The Dutch-roll mode shape is illustrative, and is distinguished from the trainer coordination exercise. The pivotal-height derivation is ideal still-air geometry; applying groundspeed in wind follows the FAA approximation. The ground-circle model includes heading/track geometry in uniform wind.

Aircraft procedures, recovery techniques, performance data, and limits must come from the applicable AFM/POH and instruction. References are linked in each lesson.

## Artwork

`assets/f22-raptor.webp` is the existing optimized, transparent AI-assisted interpretation of the user-provided F-22 reference. It is decorative artwork. No new raster assets were created for this revision.
