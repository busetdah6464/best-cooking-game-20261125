// Warung Kilat — game loop and boot.
// Owns the clock, the animation frame and the start/restart hooks;
// the rules live in state.js and kitchen.js, the picture in render.js.

import { CANVAS_W, CANVAS_H } from './config.js';
import { createState, tickShift, mulberry32 } from './state.js';
import { tickCooking } from './kitchen.js';
import { createSfx } from './audio.js';
import { bindInput } from './input.js';
import { drawScene } from './render.js';
import { applyShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = CANVAS_W;
canvas.height = CANVAS_H;

const params = new URLSearchParams(window.location.search);
const shotName = params.get('shot');
const shotMode = Boolean(shotName);

const state = createState();
const sfx = createSfx();
const random = mulberry32(20261125);

let paused = false;
let lastNow = performance.now();
// In shot mode the animation clock is frozen, so every render of the
// same shot looks the same.
const frozenNow = 1200;

function startShift() {
  // Reset in place: input.js closed over this same object.
  const fresh = createState();
  for (const key of Object.keys(state)) delete state[key];
  Object.assign(state, fresh);
  state.phase = 'playing';
  sfx.play('start');
}

function restartShift() {
  startShift();
}

bindInput(canvas, state, sfx, {
  start: startShift,
  restart: restartShift,
  toggleMute() {
    state.muted = !state.muted;
    sfx.setMuted(state.muted);
  },
  togglePause() {
    paused = !paused;
  },
});

// Debug handle for play-testing (read-only view of the live state).
window.__warung = { get state() { return state; } };

if (shotMode) {
  if (applyShot(state, shotName)) {
    state.frozen = true;
  } else {
    state.phase = 'playing';
  }
}

function frame(now) {
  const dt = Math.min(0.1, (now - lastNow) / 1000);
  lastNow = now;
  const animNow = state.frozen ? frozenNow : now;
  if (!paused && !state.frozen && state.phase === 'playing') {
    tickShift(state, dt, random);
    tickCooking(state, dt, sfx.play);
  }
  drawScene(ctx, state, animNow);
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
