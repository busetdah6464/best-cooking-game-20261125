// Warung Kilat — mouse and keyboard controls.
// Clicks and keys both end up calling the same kitchen functions, so
// the game plays identically with either hand.

import { INGREDIENTS, LAYOUT } from './config.js';
import { addIngredient, chopBoard, fireWok, serveFromPlate } from './kitchen.js';

function pointIn(x, y, rect) {
  return x >= rect.x && x < rect.x + rect.w && y >= rect.y && y < rect.y + rect.h;
}

// Bin rectangles across the counter, in the same order as INGREDIENTS.
export function binRect(index) {
  const { counter, bin } = LAYOUT;
  return {
    x: counter.x + index * (bin.w + bin.gap),
    y: counter.y + 8,
    w: bin.w,
    h: bin.h,
  };
}

export function bindInput(canvas, state, sfx, hooks) {
  function toCanvas(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    };
  }

  function clickAt(x, y) {
    if (state.phase === 'title') {
      hooks.start();
      return;
    }
    if (state.phase === 'over') {
      hooks.restart();
      return;
    }
    // Cutting board first: chopping is the busiest click in the game.
    if (state.board && pointIn(x, y, LAYOUT.board_station)) {
      chopBoard(state, sfx.play);
      return;
    }
    if (pointIn(x, y, LAYOUT.wok)) {
      fireWok(state, sfx.play);
      return;
    }
    if (pointIn(x, y, LAYOUT.plating)) {
      serveFromPlate(state, sfx.play);
      return;
    }
    // A finished plate can also be served by clicking its order ticket.
    if (state.plate) {
      const { board, ticket } = LAYOUT;
      for (let i = 0; i < state.orders.length; i += 1) {
        const rect = {
          x: board.x + i * (ticket.w + ticket.gap),
          y: board.y,
          w: ticket.w,
          h: ticket.h,
        };
        if (pointIn(x, y, rect)) {
          serveFromPlate(state, sfx.play);
          return;
        }
      }
    }
    for (let i = 0; i < INGREDIENTS.length; i += 1) {
      if (pointIn(x, y, binRect(i))) {
        addIngredient(state, INGREDIENTS[i].id, sfx.play);
        return;
      }
    }
  }

  canvas.addEventListener('pointerdown', (event) => {
    const p = toCanvas(event);
    clickAt(p.x, p.y);
  });

  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    const key = event.key.toLowerCase();
    if (state.phase === 'title' && (key === 'enter' || key === ' ')) {
      event.preventDefault();
      hooks.start();
      return;
    }
    if (state.phase === 'over' && (key === 'r' || key === 'enter')) {
      hooks.restart();
      return;
    }
    if (state.phase !== 'playing') return;
    if (key === ' ') {
      event.preventDefault();
      fireWok(state, sfx.play);
      return;
    }
    if (key === 'enter') {
      serveFromPlate(state, sfx.play);
      return;
    }
    if (key === 'c') {
      chopBoard(state, sfx.play);
      return;
    }
    if (key === 'm') {
      hooks.toggleMute();
      return;
    }
    if (key === 'p') {
      hooks.togglePause();
      return;
    }
    const ing = INGREDIENTS.find((item) => item.key === key);
    if (ing) addIngredient(state, ing.id, sfx.play);
  });
}
