# Flight Training

An interactive foundation for advanced flight-training topics, created by Lukas Brandt.

Live website: https://thereallukasbrandt.github.io/Flight-Training/

## Current version

- Cinematic F-22 Raptor artwork that banks, moves, and changes scale as you scroll.
- Normal page scrolling with a sticky scene; no scroll hijacking.
- A motion pause control, plus automatic support for the visitor's reduced-motion preference.
- Responsive desktop and mobile layouts.
- One topic collection: **Maneuvers**, with six searchable lesson spaces:
  1. Steep Turns
  2. Power-On / Power-Off Stalls (one combined lesson)
  3. Power-Off 180
  4. Eights on Pylons
  5. Dutch Rolls
  6. Turns Around a Point
- Each space opens a preview of the future Brief / Explore / Apply lesson layout.

The lessons are placeholders. No teaching content or flight guidance is currently published. The F-22 animation is photographic parallax, not a live 3D aircraft model. Card motifs are decorative rather than technical diagrams.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Page structure, navigation, and lesson preview panel |
| `styles.css` | Layout, colors, typography, and responsive styles |
| `app.js` | Lesson list, search, previews, mobile menu, and scroll animation |
| `assets/f22-raptor.webp` | Optimized aircraft artwork with transparency |
| `.nojekyll` | Serves the static files directly through GitHub Pages |

## Make an edit

1. Open the relevant file on GitHub and choose the pencil button.
2. Edit the text or code, then commit the change to `main`.
3. Wait for the Pages deployment to finish, then refresh the live website.

To change the lesson list, edit `const lessons` near the top of `app.js`. Power-on and power-off stalls intentionally share a single entry. Changing a title does not create a lesson; add the briefing and purpose-built interaction when the content is ready.

GitHub Pages publishes `main` from `/(root)`. Commits there automatically update the website. No dependencies or build command are needed. Asset paths are relative so they also work under the `/Flight-Training/` project URL.

For a local preview, serve this folder with a static HTTP server. Google Fonts are optional; fallback fonts are provided. The current website does not collect or store visitor data.

## Aircraft artwork

The user supplied the F-22 reference photograph. The built-in image generation tool produced a transparent foreground interpretation, then it was saved in WebP format for the website. It is decorative artwork.

Generation prompt: Extract only the single F-22 Raptor from the reference, preserving its recognizable geometry, dramatic banking underside view, orientation, silver-gray panels, cockpit, intakes, wings, tail fins, lighting, and surface details. Include the entire aircraft with transparent padding. Remove sky, clouds, vapor, trails, and exhaust haze. Use actual alpha transparency. Add no text, UI, logos, watermarks, border, or background.

## Next steps

Add one complete lesson at a time: a sourced briefing, a purpose-built interactive visualization, and an applied scenario with a guided debrief. Student accounts or shared progress would require an additional backend service.
