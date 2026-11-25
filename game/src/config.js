// Warung Kilat — recipes, ingredients and tuning in one place.
// Every dish, price and timer the game uses lives here so the rest of
// the code only ever reads constants, never magic numbers.

export const CANVAS_W = 1280;
export const CANVAS_H = 800;

// The whole shift lasts two and a half minutes.
export const SHIFT_SECONDS = 150;

// How long a customer waits before storming off (seconds). The rush
// tightens both numbers once the shift is half over.
export const PATIENCE_START = 45;
export const PATIENCE_LATE = 38;
export const ORDER_EVERY_START = 16;
export const ORDER_EVERY_LATE = 11;
export const MAX_ORDERS = 4;

// Cooking a full pan takes this long (seconds).
export const COOK_SECONDS = 3.5;
// Chops needed before chicken / vegetables can go in the pan.
export const CHOPS_NEEDED = 2;
// A pan holds exactly one recipe: three ingredients.
export const PAN_CAPACITY = 3;

// Coins for serving a dish, plus up to this much again for serving fast.
export const SERVE_BASE_COINS = 20;
export const SERVE_FAST_BONUS = 15;
// Coins lost when an order expires. A wrong pan costs nothing but time.
export const EXPIRED_PENALTY = 10;
// Serving streaks multiply the fast bonus: +25% per combo step, capped.
export const COMBO_STEP = 0.25;
export const COMBO_CAP = 2.0;

// Ingredients on the counter, in bin order. `chop` means it must be
// chopped on the cutting board before it can go in the pan.
export const INGREDIENTS = [
  { id: 'nasi', name: 'Nasi', key: '1', chop: false, color: '#f5efe0' },
  { id: 'mie', name: 'Mie', key: '2', chop: false, color: '#f2c94c' },
  { id: 'ayam', name: 'Ayam', key: '3', chop: true, color: '#c98a4b' },
  { id: 'telur', name: 'Telur', key: '4', chop: false, color: '#f7d774' },
  { id: 'sayur', name: 'Sayur', key: '5', chop: true, color: '#58a34a' },
  { id: 'sambal', name: 'Sambal', key: '6', chop: false, color: '#d43d2a' },
  { id: 'kerupuk', name: 'Kerupuk', key: '7', chop: false, color: '#f2a7b8' },
  { id: 'teh', name: 'Teh Manis', key: '8', chop: false, color: '#c98a2e' },
];

export const INGREDIENT_BY_ID = Object.fromEntries(
  INGREDIENTS.map((ing) => [ing.id, ing]),
);

// The menu: four dishes, each exactly three ingredients, plus a drink
// that is served straight from the counter.
export const RECIPES = [
  {
    id: 'nasi-goreng',
    name: 'Nasi Goreng',
    needs: ['nasi', 'telur', 'sambal'],
    price: 22,
    blurb: 'Nasi + telur + sambal',
  },
  {
    id: 'mie-ayam',
    name: 'Mie Ayam',
    needs: ['mie', 'ayam', 'sayur'],
    price: 25,
    blurb: 'Mie + ayam + sayur',
  },
  {
    id: 'sate-ayam',
    name: 'Sate Ayam',
    needs: ['ayam', 'sambal', 'kerupuk'],
    price: 28,
    blurb: 'Ayam + sambal + kerupuk',
  },
  {
    id: 'gado-gado',
    name: 'Gado-Gado',
    needs: ['sayur', 'telur', 'kerupuk'],
    price: 20,
    blurb: 'Sayur + telur + kerupuk',
  },
];

export const RECIPE_BY_ID = Object.fromEntries(
  RECIPES.map((recipe) => [recipe.id, recipe]),
);

// Roughly one order in three also wants a glass of sweet tea.
export const DRINK_CHANCE = 0.35;

// Screen layout, in canvas pixels. render.js and input.js share these.
export const LAYOUT = {
  topBar: { x: 0, y: 0, w: 1280, h: 64 },
  board: { x: 24, y: 76, w: 1232, h: 104 },
  ticket: { w: 248, h: 96, gap: 16 },
  kitchen: { x: 0, y: 192, w: 1280, h: 372 },
  board_station: { x: 40, y: 300, w: 300, h: 240 },
  wok: { x: 470, y: 280, w: 340, h: 260 },
  plating: { x: 900, y: 300, w: 340, h: 240 },
  chef: { x: 356, y: 196, w: 90, h: 110 },
  counter: { x: 24, y: 580, w: 1232, h: 200 },
  bin: { w: 140, h: 168, gap: 16 },
  tray: { x: 900, y: 192, w: 340, h: 72 },
};

// Small helper: does this exact set of pan ingredients make a recipe?
export function matchRecipe(pan) {
  if (pan.length !== PAN_CAPACITY) return null;
  const sorted = [...pan].sort().join(',');
  return RECIPES.find((r) => [...r.needs].sort().join(',') === sorted) ?? null;
}
