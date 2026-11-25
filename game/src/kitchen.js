// Warung Kilat — the three stations: cutting board, wok and plate.
// Every click or key in the kitchen runs through here, so the rules
// for chopping, cooking and serving live in exactly one place.

import {
  INGREDIENT_BY_ID,
  PAN_CAPACITY,
  COOK_SECONDS,
  CHOPS_NEEDED,
  matchRecipe,
} from './config.js';
import { servePlate } from './state.js';

// An ingredient bin was picked. Chop-first ingredients land on the
// cutting board; the rest go straight into the pan. Tea is a drink:
// it waits on the tray beside the plate.
export function addIngredient(state, ingId, sfx) {
  if (state.phase !== 'playing') return 'idle';
  const ing = INGREDIENT_BY_ID[ingId];
  if (!ing) return 'idle';
  if (ingId === 'teh') {
    if (state.trayDrink) return 'full';
    state.trayDrink = true;
    sfx('pour');
    return 'drink';
  }
  if (ing.chop) {
    if (state.board) return 'full';
    state.board = { ing: ingId, chops: 0 };
    sfx('pick');
    return 'board';
  }
  if (state.pan.length >= PAN_CAPACITY || state.cooking) return 'full';
  state.pan.push(ingId);
  sfx('pick');
  return 'pan';
}

// One chop on the cutting board. When the chops are done the piece
// moves into the pan on its own if there is room.
export function chopBoard(state, sfx) {
  if (state.phase !== 'playing' || !state.board) return 'idle';
  state.board.chops += 1;
  sfx('chop');
  if (state.board.chops < CHOPS_NEEDED) return 'chopping';
  const ing = state.board.ing;
  if (state.pan.length < PAN_CAPACITY && !state.cooking) {
    state.pan.push(ing);
    state.board = null;
    sfx('pick');
    return 'pan';
  }
  return 'ready';
}

// The wok was fired (or Space was pressed). A full pan that matches a
// recipe starts cooking; anything else just rattles.
export function fireWok(state, sfx) {
  if (state.phase !== 'playing' || state.cooking) return 'idle';
  const recipe = matchRecipe(state.pan);
  if (!recipe) {
    sfx('error');
    return 'nomatch';
  }
  state.cooking = { dish: recipe.id, name: recipe.name, t: 0, dur: COOK_SECONDS };
  state.pan = [];
  sfx('sizzle');
  return 'cooking';
}

// Advance the wok's cook bar; when it fills, the dish lands on the plate.
export function tickCooking(state, dt, sfx) {
  if (!state.cooking) return;
  state.cooking.t += dt;
  if (state.cooking.t >= state.cooking.dur) {
    state.plate = state.cooking.dish;
    state.cooking = null;
    sfx('ding');
  }
}

// The finished plate was picked: serve it to its order, or buzz.
export function serveFromPlate(state, sfx) {
  if (state.phase !== 'playing') return 'idle';
  const result = servePlate(state);
  if (result) {
    sfx('serve');
    return 'served';
  }
  sfx('error');
  return 'nomatch';
}
