// Warung Kilat — deterministic screenshot states.
// Opening the game with ?shot=cover|start|play|serve|end freezes the shift
// at a hand-picked moment, so the screenshots are stable renders of
// the game's own code: kitchen, order board, ingredients on the
// counter, one dish mid-assembly, the timer and a plate ready to serve.

import { RECIPE_BY_ID } from './config.js';

function order(id, recipeId, patience, maxPatience, drink = false) {
  const recipe = RECIPE_BY_ID[recipeId];
  return {
    id,
    dish: recipeId,
    name: recipe.name,
    needs: recipe.needs,
    price: recipe.price,
    drink,
    patience,
    maxPatience,
  };
}

// Set the state for one named shot and freeze its clock. Returns true
// when the name is a known shot, false otherwise.
export function applyShot(state, name) {
  if (name === 'start') {
    state.phase = 'title';
    state.timeLeft = 150;
    state.elapsed = 0;
    state.coins = 0;
    state.orders = [
      order(1, 'nasi-goreng', 38, 45),
      order(2, 'mie-ayam', 30, 45, true),
    ];
    state.pan = ['nasi', 'telur'];
    state.board = null;
    state.cooking = null;
    state.plate = null;
    state.trayDrink = false;
    return true;
  }
  if (name === 'play') {
    state.phase = 'playing';
    state.timeLeft = 135;
    state.elapsed = 15;
    state.coins = 85;
    state.combo = 3;
    state.served = 4;
    state.orders = [
      order(1, 'mie-ayam', 32, 45),
      order(2, 'nasi-goreng', 24, 45, true),
      order(3, 'sate-ayam', 40, 45),
    ];
    state.pan = ['nasi', 'telur'];
    state.board = { ing: 'ayam', chops: 1 };
    state.cooking = null;
    state.plate = null;
    state.trayDrink = true;
    return true;
  }
  if (name === 'cover') {
    // The cover: everything at once — a plate ready to serve, the
    // next dish already mid-assembly in the wok, chicken on the board,
    // three tickets on the order board and the shift timer running.
    state.phase = 'playing';
    state.timeLeft = 108;
    state.elapsed = 42;
    state.coins = 120;
    state.combo = 2;
    state.served = 6;
    state.orders = [
      order(4, 'nasi-goreng', 28, 45),
      order(5, 'gado-gado', 36, 45),
      order(6, 'mie-ayam', 18, 38, true),
    ];
    state.pan = ['mie', 'ayam'];
    state.board = { ing: 'sayur', chops: 1 };
    state.cooking = null;
    state.plate = 'nasi-goreng';
    state.trayDrink = true;
    return true;
  }
  if (name === 'serve') {
    state.phase = 'playing';
    state.timeLeft = 108;
    state.elapsed = 42;
    state.coins = 120;
    state.combo = 2;
    state.served = 6;
    state.orders = [
      order(4, 'nasi-goreng', 28, 45),
      order(5, 'gado-gado', 36, 45),
      order(6, 'mie-ayam', 18, 38, true),
    ];
    state.pan = [];
    state.board = null;
    state.cooking = null;
    state.plate = 'nasi-goreng';
    state.trayDrink = false;
    return true;
  }
  if (name === 'end') {
    state.phase = 'over';
    state.timeLeft = 0;
    state.elapsed = 150;
    state.coins = 340;
    state.served = 12;
    state.missed = 1;
    state.bestCombo = 5;
    state.orders = [];
    state.pan = [];
    state.board = null;
    state.cooking = null;
    state.plate = null;
    state.trayDrink = false;
    return true;
  }
  return false;
}
