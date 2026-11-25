// Warung Kilat — shift state: orders, coins, combos and the clock.
// Nothing here draws or listens; it only holds the numbers and the
// rules that move them, so the kitchen and the renderer stay dumb.

import {
  SHIFT_SECONDS,
  PATIENCE_START,
  PATIENCE_LATE,
  ORDER_EVERY_START,
  ORDER_EVERY_LATE,
  MAX_ORDERS,
  RECIPES,
  DRINK_CHANCE,
  SERVE_BASE_COINS,
  SERVE_FAST_BONUS,
  EXPIRED_PENALTY,
  COMBO_STEP,
  COMBO_CAP,
} from './config.js';

let nextOrderId = 1;

export function createState() {
  return {
    phase: 'title', // title | playing | over
    timeLeft: SHIFT_SECONDS,
    elapsed: 0,
    coins: 0,
    served: 0,
    missed: 0,
    combo: 0,
    bestCombo: 0,
    orders: [],
    orderTimer: 4, // first customer arrives a few seconds in
    pan: [], // ingredient ids waiting in the wok
    board: null, // { ing, chops } on the cutting board
    cooking: null, // { dish, t, dur } while the wok is hot
    plate: null, // recipe id of the finished dish, ready to serve
    trayDrink: false, // a glass of tea waiting beside the plate
    flash: null, // { text, until } floating feedback
    muted: false,
    seed: 1,
  };
}

// A tiny deterministic random source so screenshot states are stable.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function random() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function patienceFor(elapsed) {
  return elapsed > SHIFT_SECONDS / 2 ? PATIENCE_LATE : PATIENCE_START;
}

export function orderEveryFor(elapsed) {
  return elapsed > SHIFT_SECONDS / 2 ? ORDER_EVERY_LATE : ORDER_EVERY_START;
}

export function spawnOrder(state, random) {
  const dish = RECIPES[Math.floor(random() * RECIPES.length)];
  const patience = patienceFor(state.elapsed);
  state.orders.push({
    id: nextOrderId,
    dish: dish.id,
    name: dish.name,
    needs: dish.needs,
    price: dish.price,
    drink: random() < DRINK_CHANCE,
    patience,
    maxPatience: patience,
  });
  nextOrderId += 1;
}

// Advance the clock and the order queue by dt seconds.
export function tickShift(state, dt, random) {
  if (state.phase !== 'playing') return;
  state.elapsed += dt;
  state.timeLeft = Math.max(0, SHIFT_SECONDS - state.elapsed);
  if (state.timeLeft <= 0) {
    state.phase = 'over';
    return;
  }
  state.orderTimer -= dt;
  if (state.orderTimer <= 0 && state.orders.length < MAX_ORDERS) {
    spawnOrder(state, random);
    state.orderTimer = orderEveryFor(state.elapsed);
  }
  for (const order of state.orders) order.patience -= dt;
  const expired = state.orders.filter((o) => o.patience <= 0);
  if (expired.length > 0) {
    state.orders = state.orders.filter((o) => o.patience > 0);
    state.missed += expired.length;
    state.combo = 0;
    state.coins = Math.max(0, state.coins - EXPIRED_PENALTY * expired.length);
    state.flash = { text: `Pesanan hangus! -${EXPIRED_PENALTY * expired.length} koin`, until: state.elapsed + 1.6 };
  }
}

// Serve the plated dish to the best matching order. Returns the order
// served, or null when nothing matches (or the drink is still missing).
export function servePlate(state) {
  if (!state.plate) return null;
  const dish = state.plate;
  const match = state.orders.find(
    (o) => o.dish === dish && (!o.drink || state.trayDrink),
  );
  if (!match) return null;
  const fastShare = Math.max(0, match.patience / match.maxPatience);
  const comboMult = 1 + Math.min(state.combo * COMBO_STEP, COMBO_CAP);
  const earned = Math.round(
    (SERVE_BASE_COINS + match.price * 0.5 + SERVE_FAST_BONUS * fastShare) * comboMult,
  );
  state.coins += earned;
  state.served += 1;
  state.combo += 1;
  state.bestCombo = Math.max(state.bestCombo, state.combo);
  if (match.drink) state.trayDrink = false;
  state.orders = state.orders.filter((o) => o.id !== match.id);
  state.plate = null;
  state.flash = {
    text: `+${earned} koin — ${match.name} tersaji!`,
    until: state.elapsed + 1.6,
  };
  return { order: match, earned };
}

// Stars for the end-of-shift panel: served count decides.
export function shiftStars(state) {
  if (state.served >= 12) return 3;
  if (state.served >= 8) return 2;
  if (state.served >= 4) return 1;
  return 0;
}
