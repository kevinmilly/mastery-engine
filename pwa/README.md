# Mastery Engine

A Progressive Web App (PWA) for deliberate, spaced-repetition learning from local markdown curricula files.

## What It Is

Mastery Engine reads structured markdown files from a `curricula/` directory on your device and turns them into a complete study workflow: prereading pretests, contextual reading sessions, and spaced-repetition drill cards — all running locally in the browser with no server required.

## How to Run

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in a Chromium-based browser (Chrome, Edge, Arc). Safari and Firefox do not support the File System Access API required for reading local files.

## How to Use

1. Click **Connect Curricula Folder** on the connection screen.
2. Point the file picker at the `curricula/` directory in this repository (or any directory containing valid curriculum markdown files).
3. Grant read access when prompted — this is a one-time browser permission per session.
4. The Dashboard will load, showing your next recommended reading block and any due drill cards.

## The Four Modes

| Mode | Description |
|------|-------------|
| **Dashboard** | Overview of curricula, next block, streak, momentum arc, and study heatmap. |
| **Pre-Test** | Before reading a new topic, you attempt 1–3 questions cold. Wrong answers are expected — the struggle primes memory (desirable difficulty). |
| **Reader** | Focused markdown reader for a single block. Tracks reading progress and estimated time. |
| **Drill** | Spaced-repetition flashcard session using the FSRS-5 algorithm. Supports chaos mode (all due cards) or focused mode (specific topics). |

## Learning Techniques Implemented

- **Spaced Repetition (FSRS-5)** — Cards are scheduled based on memory decay curves. The Again / Hard / Good / Easy ratings adjust future intervals.
- **Desirable Difficulty / Pre-testing** — New topics begin with a cold pretest. Struggling before reading accelerates learning.
- **Interleaving** — Chaos drill mode mixes cards across topics and tiers.
- **Momentum & Streak Tracking** — A rolling momentum arc and daily streak encourage consistent study.
- **Friction Logging** — When you mark a card "Again", a text prompt captures why you missed it, reinforcing metacognition.
- **Keyboard-first UI** — Space to flip, 1–4 to rate. Minimises friction during drill sessions.

## Curriculum File Format

Each curriculum is a directory inside `curricula/` containing:
- `meta.md` — YAML front matter with `id`, `title`, `description`, `tiers`.
- `<tier>/<topic>/reading.md` — Reading blocks with YAML front matter.
- `<tier>/<topic>/drills.md` — Drill cards in Q&A markdown format.

## Deployment

The app reads curricula directly from the public GitHub repo `kevinmilly/mastery-engine` — no local file access or auth token required.

### Option A: Netlify

- **Drag and drop**: run `npm run build` inside `pwa/`, then drag the `pwa/dist/` folder to [netlify.com/drop](https://netlify.com/drop).
- **Continuous deployment**: connect the repo in the Netlify dashboard and set the base directory to `pwa/`. The included `netlify.toml` handles the rest.

### Option B: Vercel

- **CLI**: run `npx vercel` inside `pwa/`.
- **Dashboard**: connect the repo in the Vercel dashboard — `vercel.json` is already configured.

### Add to Home Screen (iOS)

After deploying, open the URL in Safari on iPhone → Share → Add to Home Screen. The app installs as a PWA and works fully offline after first load.

### Adding New Curricula

1. Push a new curriculum folder to the `curricula/` directory in the GitHub repo.
2. Open the app and tap the **Sync** button (circular arrow icon in the top-right of the nav bar).
3. The app will re-fetch all files and reload the curricula.
