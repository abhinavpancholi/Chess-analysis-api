# Chess Analysis — Frontend

Phase 7: a React + Vite dashboard for the Chess Analysis API.

## Setup

```bash
cd frontend
npm install
cp .env.example .env
# edit .env and set VITE_API_URL to your Railway backend domain
npm run dev
```

If `VITE_API_URL` is unset or the API is unreachable, the dashboard falls
back to mock data automatically (`src/mock/mockData.js`), so the UI is
always demoable without the backend running.

## What's here (Phase 7, part 1)

- **Rating rail** — a row of cards, one per time control (bullet / blitz /
  rapid / daily), each with current rating, delta, and a sparkline.
- **Games list** — a scoresheet-style list of recent games: result marker,
  color played, opponent, opening, format, date, and rating change.

Both pull from `/analytics/rating-trend` and `/games/` via
`src/api/client.js`.

## Design system

Chess-flavored classic: warm parchment background, walnut/brass/oxblood
accents (wins read brass/gold, losses read oxblood), `Fraunces` for
display type, `Inter` for body copy, `IBM Plex Mono` for all numbers and
notation-adjacent labels (ratings, deltas, dates, time controls) — tabular
figures throughout so numbers align like a scoreboard.

Tokens live in `src/styles/tokens.css` — adjust colors/type/spacing there
and the whole app follows.

## Next up

- Game detail view with a board replay (`react-chessboard` + `chess.js`
  stepping through the PGN)
- Openings and by-color analytics pages
- Sync flow wired to `/games/ingest` + job polling
- Auth (login/register) screens
