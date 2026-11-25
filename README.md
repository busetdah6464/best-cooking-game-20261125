# Warung Kilat — Best Cooking Game

[![make.fun](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/busetdah6464/best-cooking-game-20261125/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/busetdah6464/best-cooking-game-20261125/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)

**Warung Kilat** is an original cooking game built for the [make.fun best cooking game bounty](https://make.fun/bounty/best-cooking-game-20261125-0137). You run a small Indonesian street-food warung during a dinner rush: read the order board, chop and cook in the wok, assemble each dish on the plate, and serve it before the customer's patience runs out.

## How to play

- **Order board (top):** customer tickets show the dish and drink they want, with a patience bar.
- **Counter (bottom):** click an ingredient bin — or press keys `1`–`8` — to send it to the kitchen. Chicken and vegetables must be chopped on the cutting board first (click the board, or press `C`).
- **Wok (centre):** once the pan holds exactly one recipe's ingredients, press `Space` or click the wok to start cooking. When the cook bar fills, the dish lands on the plate.
- **Serve:** click the finished plate, then click the matching order ticket (or press `Enter` to serve the oldest matching order). Serving a drink is one click on the tea bin.
- **Shift timer:** 150 seconds. Serve fast for a patience bonus and build a combo; a wrong dish or an expired order costs coins.

## Dishes

| Dish | Recipe |
| --- | --- |
| Nasi Goreng | Nasi + Telur + Sambal |
| Mie Ayam | Mie + Ayam (chopped) + Sayur (chopped) |
| Sate Ayam | Ayam (chopped) + Sambal + Kerupuk |
| Gado-Gado | Sayur (chopped) + Telur + Kerupuk |
| Teh Manis | Teh (drink, served straight from the counter) |

## Run it

Open `game/index.html` in a desktop browser, or serve the folder with any static server:

```sh
node serve.ts   # serves game/ at http://localhost:8080
```

No network requests, no build step — the game is plain static files under `game/`.

## Layout

- `main.ts` — the entry program: copies `game/` and `screenshots/` to `/output` and writes `dossier.json` with the kit's `buildDossier`.
- `game/index.html` — page shell and canvas.
- `game/src/config.js` — recipes, ingredients and tuning.
- `game/src/state.js` — shift state, orders, scoring and combos.
- `game/src/kitchen.js` — chopping board, wok and plating logic.
- `game/src/input.js` — mouse and keyboard controls.
- `game/src/render.js` — all canvas drawing: kitchen, order board, counter, chef.
- `game/src/audio.js` — tiny synthesised sound effects (WebAudio, no files).
- `game/src/shots.js` — deterministic screenshot states (`?shot=start|play|serve|end`).
- `game/src/main.js` — game loop and boot.
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged.
- `screenshots/` — real renders of this game's own code.
