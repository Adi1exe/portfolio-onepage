# Portfolio

Plain HTML, CSS and JS. No build step.

- `index.html`: content (name, projects, links, experience, stack)
- `styles.css`: mobile-first; base styles are for phones, `min-width` queries add desktop. Colors (`:root` variables), fonts and animations
- `script.js`: typing title, Pune clock, Last.fm now playing, hover previews, theme reveal
- `data.js`: rolling 53-week GitHub contribution snapshot used when the live endpoint is unavailable
- `update_contributions.py`: refreshes that snapshot through today (`python update_contributions.py`)
- `api/contributions.js`: fetches the latest rolling contribution calendar from GitHub GraphQL when the page loads

## To fill in
- Experience: the ThynkTech line and dates in `index.html` are placeholders.
- Now playing: set `LFM_USER` and `LFM_KEY` at the top of the "Now playing" block in `script.js` (free key at last.fm/api). Without them it shows "Quiet right now".
- Live contributions: add `GITHUB_TOKEN` as a server-side environment variable in Vercel. The token must be allowed to read public GitHub data; do not put it in `index.html` or `script.js`. `GITHUB_USER` is optional and defaults to `Adi1exe`. Redeploy after adding the variables.
- Project previews: the hover cards are small inline SVGs in `index.html` (`<div class="peek">`). Swap each for an `<img>` of a real screenshot if you like.
- Tile images: the front uses `face front-L.png` in light mode and `face front-D.png` in dark mode. The back uses `photo.jpg`; if it is missing, the back shows a placeholder. Edit the teaser lines in `script.js` (`teasers`).
- Typing title: edit `A` and `B` in `script.js`.

## Run / deploy
Open `index.html` in a browser, or run `npx serve`. To deploy, drag the folder into Vercel (it deploys as a static site).
