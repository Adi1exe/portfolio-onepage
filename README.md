# Portfolio

Plain HTML, CSS and JS. No build step.

- `index.html`: content (name, projects, links, experience, stack)
- `styles.css`: mobile-first; base styles are for phones, `min-width` queries add desktop. Colors (`:root` variables), fonts and animations
- `script.js`: typing title, Pune clock, Last.fm now playing, hover previews, theme reveal
- `data.js`: GitHub contributions snapshot
- `update_contributions.py`: refreshes `data.js` (`python update_contributions.py`)

## To fill in
- Experience: the ThynkTech line and dates in `index.html` are placeholders.
- Now playing: set `LFM_USER` and `LFM_KEY` at the top of the "Now playing" block in `script.js` (free key at last.fm/api). Without them it shows "Quiet right now".
- Project previews: the hover cards are small inline SVGs in `index.html` (`<div class="peek">`). Swap each for an `<img>` of a real screenshot if you like.
- Photo: save your picture as `photo.jpg` next to `index.html` (square works best). Until then the back of the tile shows a placeholder. Edit the teaser lines in `script.js` (`teasers`).
- Typing title: edit `A` and `B` in `script.js`.

## Run / deploy
Open `index.html` in a browser, or run `npx serve`. To deploy, drag the folder into Vercel (it deploys as a static site).
