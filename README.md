# Flight Training

An interactive foundation for advanced flight-training topics, created by Lukas Brandt.

## What is here

- Dark flight-deck interface with a responsive layout.
- Interactive heading display, with keyboard-accessible controls.
- Searchable topic spaces and category filters.
- Accessible previews for future lessons.
- Clear planned-content labels. No training lessons are published yet.

## How the website works

GitHub stores the source files. GitHub Pages publishes `index.html` as the website. This version uses HTML, CSS, and browser JavaScript, so no installation or build command is needed.

To publish: open repository Settings > Pages, select Deploy from a branch, choose main and /(root), then Save. GitHub shows the live URL when deployment completes. Later commits to main automatically update the website.

Official setup: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## Make an edit

1. Open `index.html` on GitHub and choose the pencil button.
2. Edit the text or code, then commit the change to main.
3. Wait for the Pages deployment to finish, then refresh the live website.

The site is intentionally self-contained for the initial setup. To rename or add topic spaces, find `const topics` near the bottom of `index.html`. Each topic has a title, category, description, type, and visual. These are placeholders rather than complete lessons. Changing a card title does not create a lesson.

To preview locally, download `index.html` and open it in your browser. Optional Google Fonts require an internet connection; fallback fonts are provided.

## Next steps

Add one complete module at a time: a sourced explanation, a purpose-built interaction, and an applied scenario. As the project grows, split styles, scripts, and module content into separate files. Student accounts or shared progress would require an additional backend service; the current version does not collect or store visitor data.
