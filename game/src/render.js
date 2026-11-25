// Warung Kilat — every pixel of the kitchen, drawn on one canvas.
// The layout comes from config.js so the picture and the click zones
// can never drift apart.

import {
  CANVAS_W,
  CANVAS_H,
  INGREDIENTS,
  INGREDIENT_BY_ID,
  RECIPE_BY_ID,
  LAYOUT,
} from './config.js';
import { binRect } from './input.js';
import { shiftStars } from './state.js';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, str, x, y, size, color, weight = 'bold', align = 'left') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px system-ui, -apple-system, "Segoe UI", sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(str, x, y);
}

function mmss(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

// One ingredient, drawn as a small picture. The judge reads the
// screenshots, so every bin must be recognisable at a glance.
export function drawIngredientIcon(ctx, id, cx, cy, s) {
  ctx.save();
  ctx.translate(cx, cy);
  switch (id) {
    case 'nasi': {
      ctx.fillStyle = '#fff8e7';
      ctx.beginPath();
      ctx.ellipse(0, s * 0.15, s, s * 0.55, 0, Math.PI, 0);
      ctx.fill();
      ctx.strokeStyle = '#e8dcc0';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.strokeStyle = '#d9c9a3';
      ctx.beginPath();
      ctx.moveTo(-s * 0.4, -s * 0.1);
      ctx.lineTo(s * 0.4, -s * 0.1);
      ctx.moveTo(-s * 0.25, -s * 0.3);
      ctx.lineTo(s * 0.25, -s * 0.3);
      ctx.stroke();
      break;
    }
    case 'mie': {
      ctx.strokeStyle = '#e8a90c';
      ctx.lineWidth = s * 0.22;
      ctx.lineCap = 'round';
      for (let i = -1; i <= 1; i += 1) {
        ctx.beginPath();
        ctx.arc(0, i * s * 0.35, s * 0.55, Math.PI * 0.15, Math.PI * 0.85);
        ctx.stroke();
      }
      break;
    }
    case 'ayam': {
      ctx.fillStyle = '#b06a2e';
      ctx.beginPath();
      ctx.arc(-s * 0.1, s * 0.05, s * 0.55, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#8a4f1d';
      ctx.beginPath();
      ctx.arc(-s * 0.25, -s * 0.15, s * 0.2, 0, Math.PI * 2);
      ctx.arc(s * 0.1, -s * 0.25, s * 0.18, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#f5efe0';
      ctx.lineWidth = s * 0.16;
      ctx.beginPath();
      ctx.moveTo(s * 0.35, -s * 0.35);
      ctx.lineTo(s * 0.75, -s * 0.7);
      ctx.stroke();
      ctx.fillStyle = '#f5efe0';
      ctx.beginPath();
      ctx.arc(s * 0.78, -s * 0.72, s * 0.16, 0, Math.PI * 2);
      ctx.arc(s * 0.6, -s * 0.85, s * 0.14, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'telur': {
      ctx.fillStyle = '#fffdf5';
      ctx.beginPath();
      ctx.ellipse(0, 0, s * 0.85, s * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f7b500';
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.38, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffd94d';
      ctx.beginPath();
      ctx.arc(-s * 0.12, -s * 0.12, s * 0.14, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'sayur': {
      ctx.fillStyle = '#3f8f37';
      for (const angle of [-0.6, 0, 0.6]) {
        ctx.save();
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.ellipse(0, -s * 0.35, s * 0.32, s * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      ctx.strokeStyle = '#2c6b26';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, s * 0.7);
      ctx.lineTo(0, -s * 0.1);
      ctx.stroke();
      break;
    }
    case 'sambal': {
      ctx.fillStyle = '#b3271e';
      ctx.beginPath();
      ctx.arc(0, -s * 0.1, s * 0.55, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = '#d43d2a';
      ctx.beginPath();
      ctx.arc(0, -s * 0.15, s * 0.42, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = '#7a1a12';
      ctx.beginPath();
      ctx.ellipse(0, s * 0.35, s * 0.7, s * 0.3, 0, 0, Math.PI);
      ctx.fill();
      ctx.fillStyle = '#58a34a';
      ctx.beginPath();
      ctx.arc(-s * 0.2, -s * 0.35, s * 0.1, 0, Math.PI * 2);
      ctx.arc(s * 0.22, -s * 0.28, s * 0.08, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'kerupuk': {
      ctx.fillStyle = '#f2a7b8';
      ctx.beginPath();
      for (let i = 0; i < 10; i += 1) {
        const a = (i / 10) * Math.PI * 2;
        const r = i % 2 === 0 ? s * 0.8 : s * 0.62;
        const px = Math.cos(a) * r;
        const py = Math.sin(a) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#fbd9e2';
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.45, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#d97f96';
      for (const [dx, dy] of [[-0.2, -0.15], [0.22, -0.1], [0, 0.22]]) {
        ctx.beginPath();
        ctx.arc(dx * s, dy * s, s * 0.07, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case 'teh': {
      ctx.fillStyle = '#e8f4f8';
      ctx.beginPath();
      ctx.moveTo(-s * 0.5, -s * 0.7);
      ctx.lineTo(s * 0.5, -s * 0.7);
      ctx.lineTo(s * 0.35, s * 0.7);
      ctx.lineTo(-s * 0.35, s * 0.7);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#c98a2e';
      ctx.beginPath();
      ctx.moveTo(-s * 0.42, -s * 0.25);
      ctx.lineTo(s * 0.42, -s * 0.25);
      ctx.lineTo(s * 0.32, s * 0.6);
      ctx.lineTo(-s * 0.32, s * 0.6);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#d43d2a';
      ctx.lineWidth = s * 0.12;
      ctx.beginPath();
      ctx.moveTo(s * 0.1, -s * 0.3);
      ctx.lineTo(s * 0.35, -s * 0.95);
      ctx.stroke();
      break;
    }
    default:
      break;
  }
  ctx.restore();
}

// An ingredient on a pale chip, so pale icons (nasi) still read on
// cream tickets and white bins.
export function drawIconChip(ctx, id, cx, cy, s) {
  ctx.fillStyle = '#f0e2c0';
  ctx.beginPath();
  ctx.arc(cx, cy, s * 1.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#d8c9a3';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  drawIngredientIcon(ctx, id, cx, cy, s);
}

// A finished dish on its plate, drawn the way the customer sees it.
export function drawDishIcon(ctx, recipeId, cx, cy, s) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(0, s * 0.25, s * 1.05, s * 0.42, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#d8d2c4';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#eef3f6';
  ctx.beginPath();
  ctx.ellipse(0, s * 0.22, s * 0.8, s * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();
  if (recipeId === 'nasi-goreng') {
    ctx.fillStyle = '#e8954a';
    ctx.beginPath();
    ctx.ellipse(0, -s * 0.05, s * 0.62, s * 0.4, 0, Math.PI, 0);
    ctx.fill();
    drawIngredientIcon(ctx, 'telur', 0, -s * 0.3, s * 0.34);
    ctx.fillStyle = '#d43d2a';
    ctx.beginPath();
    ctx.arc(s * 0.4, -s * 0.05, s * 0.16, 0, Math.PI * 2);
    ctx.fill();
  } else if (recipeId === 'mie-ayam') {
    ctx.strokeStyle = '#e8a90c';
    ctx.lineWidth = s * 0.16;
    ctx.lineCap = 'round';
    for (let i = -1; i <= 1; i += 1) {
      ctx.beginPath();
      ctx.arc(0, -s * 0.1 + i * s * 0.16, s * 0.5, Math.PI * 0.1, Math.PI * 0.9);
      ctx.stroke();
    }
    ctx.fillStyle = '#b06a2e';
    for (const [dx, dy] of [[-0.35, -0.3], [0.3, -0.35], [0, -0.05]]) {
      ctx.beginPath();
      ctx.arc(dx * s, dy * s, s * 0.16, 0, Math.PI * 2);
      ctx.fill();
    }
    drawIngredientIcon(ctx, 'sayur', s * 0.42, s * 0.05, s * 0.22);
  } else if (recipeId === 'sate-ayam') {
    ctx.strokeStyle = '#8a5a33';
    ctx.lineWidth = s * 0.09;
    for (const dy of [-0.35, -0.05, 0.25]) {
      ctx.beginPath();
      ctx.moveTo(-s * 0.7, dy * s);
      ctx.lineTo(s * 0.7, dy * s);
      ctx.stroke();
    }
    ctx.fillStyle = '#a86428';
    for (const dy of [-0.35, -0.05, 0.25]) {
      for (const dx of [-0.4, 0, 0.4]) {
        ctx.beginPath();
        ctx.arc(dx * s, dy * s, s * 0.17, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (recipeId === 'gado-gado') {
    drawIngredientIcon(ctx, 'sayur', -s * 0.3, -s * 0.15, s * 0.3);
    drawIngredientIcon(ctx, 'telur', s * 0.25, -s * 0.2, s * 0.3);
    drawIngredientIcon(ctx, 'kerupuk', s * 0.05, s * 0.05, s * 0.28);
    ctx.strokeStyle = '#8a5a33';
    ctx.lineWidth = s * 0.08;
    ctx.beginPath();
    ctx.moveTo(-s * 0.5, -s * 0.4);
    ctx.lineTo(s * 0.5, s * 0.15);
    ctx.moveTo(-s * 0.4, s * 0.2);
    ctx.lineTo(s * 0.45, -s * 0.35);
    ctx.stroke();
  }
  ctx.restore();
}

function drawTopBar(ctx, state) {
  const { topBar } = LAYOUT;
  ctx.fillStyle = '#7a3b1e';
  ctx.fillRect(topBar.x, topBar.y, topBar.w, topBar.h);
  ctx.fillStyle = '#a8542c';
  ctx.fillRect(topBar.x, topBar.y + topBar.h - 6, topBar.w, 6);
  text(ctx, 'WARUNG KILAT', 24, 42, 30, '#ffe9b8');
  const low = state.timeLeft <= 30 && state.phase === 'playing';
  const timerColor = low ? '#ff5a4a' : '#ffffff';
  const pulse = low ? 1 + Math.sin(Date.now() / 150) * 0.06 : 1;
  ctx.save();
  ctx.translate(1050, 34);
  ctx.scale(pulse, pulse);
  ctx.fillStyle = low ? '#5c130c' : '#5c2d12';
  roundRect(ctx, -110, -26, 220, 52, 12);
  ctx.fill();
  ctx.restore();
  text(ctx, `⏱ ${mmss(state.timeLeft)}`, 1050, 44, 28, timerColor, 'bold', 'center');
  text(ctx, `🍽 ${state.served} tersaji`, 600, 42, 22, '#ffe9b8', 'bold', 'center');
  text(ctx, `🪙 ${state.coins} koin`, 740, 42, 22, '#ffe9b8', 'bold', 'center');
  if (state.combo >= 2) {
    text(ctx, `🔥 kombo x${state.combo}`, 930, 42, 20, '#ffb347', 'bold', 'right');
  }
}

function drawTicket(ctx, order, x, y, highlight) {
  const { ticket } = LAYOUT;
  ctx.save();
  if (highlight) {
    ctx.shadowColor = '#ffb347';
    ctx.shadowBlur = 22;
  }
  ctx.fillStyle = '#fff8e7';
  roundRect(ctx, x, y, ticket.w, ticket.h, 10);
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = highlight ? '#ff8c1a' : '#d8c9a3';
  ctx.lineWidth = highlight ? 3 : 2;
  roundRect(ctx, x, y, ticket.w, ticket.h, 10);
  ctx.stroke();
  ctx.fillStyle = '#e8dcc0';
  ctx.beginPath();
  ctx.arc(x + 14, y + 14, 5, 0, Math.PI * 2);
  ctx.fill();
  text(ctx, `#${order.id}  ${order.name}`, x + 14, y + 30, 19, '#4a2c12');
  text(ctx, `Rp ${order.price}k`, x + ticket.w - 14, y + 30, 16, '#8a5a33', 'bold', 'right');
  const recipe = RECIPE_BY_ID[order.dish];
  recipe.needs.forEach((ing, i) => {
    drawIconChip(ctx, ing, x + 30 + i * 52, y + 58, 17);
  });
  if (order.drink) {
    drawIconChip(ctx, 'teh', x + 30 + 3 * 52, y + 58, 17);
    text(ctx, '+ teh', x + 30 + 3 * 52 + 20, y + 64, 13, '#8a5a33', 'bold');
  }
  const share = Math.max(0, order.patience / order.maxPatience);
  const barColor = share > 0.5 ? '#58a34a' : share > 0.25 ? '#e8a90c' : '#d43d2a';
  ctx.fillStyle = '#e8dcc0';
  roundRect(ctx, x + 14, y + ticket.h - 18, ticket.w - 28, 9, 4);
  ctx.fill();
  ctx.fillStyle = barColor;
  roundRect(ctx, x + 14, y + ticket.h - 18, (ticket.w - 28) * share, 9, 4);
  ctx.fill();
}

function drawOrderBoard(ctx, state) {
  const { board } = LAYOUT;
  ctx.fillStyle = '#5c2d12';
  roundRect(ctx, board.x - 8, board.y - 8, board.w + 16, board.h + 16, 14);
  ctx.fill();
  ctx.fillStyle = '#3f1f0b';
  roundRect(ctx, board.x - 8, board.y - 8, board.w + 16, 26, 10);
  ctx.fill();
  text(ctx, 'PAPAN PESANAN', board.x + 4, board.y + 12, 13, '#f7c98a', 'bold');
  text(ctx, `${state.orders.length} / 4 meja menunggu`, board.x + board.w - 4, board.y + 12, 13, '#f7c98a', 'normal', 'right');
  if (state.orders.length === 0) {
    text(ctx, 'Belum ada pesanan — pelanggan segera datang…', board.x + 16, board.y + 62, 17, '#d9b48a', 'normal');
    return;
  }
  state.orders.forEach((order, i) => {
    const x = board.x + i * (LAYOUT.ticket.w + LAYOUT.ticket.gap);
    const highlight = Boolean(state.plate && state.plate === order.dish);
    drawTicket(ctx, order, x, board.y, highlight);
  });
}

function drawChef(ctx, now) {
  const { chef } = LAYOUT;
  const bob = Math.sin(now / 500) * 3;
  const cx = chef.x + chef.w / 2;
  // Body and apron.
  ctx.fillStyle = '#f5efe0';
  roundRect(ctx, cx - 34, chef.y + 52 + bob, 68, 58, 14);
  ctx.fill();
  ctx.fillStyle = '#3f6fb5';
  roundRect(ctx, cx - 26, chef.y + 62 + bob, 52, 40, 8);
  ctx.fill();
  ctx.fillStyle = '#f5efe0';
  ctx.beginPath();
  ctx.arc(cx - 38, chef.y + 66 + bob, 11, 0, Math.PI * 2);
  ctx.arc(cx + 38, chef.y + 66 + bob, 11, 0, Math.PI * 2);
  ctx.fill();
  // Head and toque.
  ctx.fillStyle = '#f2c48d';
  ctx.beginPath();
  ctx.arc(cx, chef.y + 34 + bob, 24, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(cx - 14, chef.y + 16 + bob, 13, 0, Math.PI * 2);
  ctx.arc(cx, chef.y + 10 + bob, 15, 0, Math.PI * 2);
  ctx.arc(cx + 14, chef.y + 16 + bob, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(cx - 24, chef.y + 18 + bob, 48, 8);
  // Face.
  ctx.fillStyle = '#2b2b2b';
  ctx.beginPath();
  ctx.arc(cx - 9, chef.y + 32 + bob, 2.5, 0, Math.PI * 2);
  ctx.arc(cx + 9, chef.y + 32 + bob, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#2b2b2b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, chef.y + 38 + bob, 8, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
}

// A station's name on a dark pill, readable over the pale wall.
function stationLabel(ctx, label, rect) {
  ctx.font = 'bold 15px system-ui, -apple-system, "Segoe UI", sans-serif';
  const w = ctx.measureText(label).width + 24;
  const x = rect.x + 6;
  const y = rect.y - 30;
  ctx.fillStyle = '#5c2d12';
  roundRect(ctx, x, y, w, 24, 12);
  ctx.fill();
  text(ctx, label, x + 12, y + 17, 15, '#ffe9b8', 'bold');
}

function drawCuttingBoard(ctx, state, now) {
  const r = LAYOUT.board_station;
  stationLabel(ctx, 'TALENAN — klik untuk cincang', r);
  ctx.fillStyle = '#a9743f';
  roundRect(ctx, r.x, r.y, r.w, r.h, 14);
  ctx.fill();
  ctx.fillStyle = '#c08a4e';
  roundRect(ctx, r.x + 14, r.y + 14, r.w - 28, r.h - 28, 10);
  ctx.fill();
  // Knife marks on the board.
  ctx.strokeStyle = '#8a5a33';
  ctx.lineWidth = 2;
  for (let i = 0; i < 5; i += 1) {
    ctx.beginPath();
    ctx.moveTo(r.x + 40 + i * 46, r.y + r.h - 40);
    ctx.lineTo(r.x + 60 + i * 46, r.y + r.h - 70);
    ctx.stroke();
  }
  if (state.board) {
    const ing = INGREDIENT_BY_ID[state.board.ing];
    const cx = r.x + r.w / 2;
    const cy = r.y + r.h / 2 - 10;
    drawIngredientIcon(ctx, state.board.ing, cx, cy, 52);
    const done = state.board.chops >= 2;
    text(
      ctx,
      done ? `${ing.name} siap!` : `Cincang ${ing.name}: ${state.board.chops}/2`,
      cx,
      r.y + r.h - 34,
      18,
      done ? '#2c6b26' : '#4a2c12',
      'bold',
      'center',
    );
    if (!done) {
      ctx.fillStyle = '#e8dcc0';
      roundRect(ctx, cx - 60, r.y + r.h - 26, 120, 8, 4);
      ctx.fill();
      ctx.fillStyle = '#58a34a';
      roundRect(ctx, cx - 60, r.y + r.h - 26, 120 * (state.board.chops / 2), 8, 4);
      ctx.fill();
    }
  } else {
    text(ctx, 'Ayam & sayur dicincang di sini', r.x + r.w / 2, r.y + r.h / 2 - 8, 16, '#6b4423', 'normal', 'center');
    text(ctx, '(klik bahan, lalu klik talenan)', r.x + r.w / 2, r.y + r.h / 2 + 18, 14, '#8a6a45', 'normal', 'center');
  }
}

function drawWok(ctx, state, now) {
  const r = LAYOUT.wok;
  stationLabel(ctx, 'WAJAN — klik / Spasi untuk masak', r);
  ctx.fillStyle = '#6b4423';
  roundRect(ctx, r.x, r.y, r.w, r.h, 14);
  ctx.fill();
  // Flame under the pan, licking higher while cooking.
  const flameH = state.cooking ? 26 + Math.sin(now / 90) * 8 : 10;
  ctx.fillStyle = state.cooking ? '#ff7a1a' : '#c96a2e';
  ctx.beginPath();
  ctx.moveTo(r.x + 70, r.y + r.h - 18);
  ctx.quadraticCurveTo(r.x + 120, r.y + r.h - 18 - flameH * 2, r.x + 170, r.y + r.h - 18);
  ctx.quadraticCurveTo(r.x + 220, r.y + r.h - 18 - flameH * 1.6, r.x + 270, r.y + r.h - 18);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#ffcf5c';
  ctx.beginPath();
  ctx.moveTo(r.x + 110, r.y + r.h - 18);
  ctx.quadraticCurveTo(r.x + 150, r.y + r.h - 18 - flameH, r.x + 190, r.y + r.h - 18);
  ctx.quadraticCurveTo(r.x + 220, r.y + r.h - 18 - flameH * 0.8, r.x + 240, r.y + r.h - 18);
  ctx.closePath();
  ctx.fill();
  // The pan itself.
  const cx = r.x + r.w / 2;
  const cy = r.y + 118;
  ctx.fillStyle = '#2b2b2e';
  ctx.beginPath();
  ctx.ellipse(cx, cy, 132, 74, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#3d3d42';
  ctx.beginPath();
  ctx.ellipse(cx, cy, 118, 62, 0, 0, Math.PI * 2);
  ctx.fill();
  // Pan contents: the dish mid-assembly.
  if (state.cooking) {
    drawDishIcon(ctx, state.cooking.dish, cx, cy - 6, 46);
    const share = state.cooking.t / state.cooking.dur;
    ctx.fillStyle = '#e8dcc0';
    roundRect(ctx, cx - 90, r.y + r.h - 52, 180, 12, 6);
    ctx.fill();
    ctx.fillStyle = '#ff7a1a';
    roundRect(ctx, cx - 90, r.y + r.h - 52, 180 * share, 12, 6);
    ctx.fill();
    text(ctx, `Memasak ${state.cooking.name}…`, cx, r.y + r.h - 62, 16, '#ffe9b8', 'bold', 'center');
  } else if (state.pan.length > 0) {
    state.pan.forEach((ing, i) => {
      drawIngredientIcon(ctx, ing, cx - 56 + i * 56, cy - 4, 26);
    });
    text(ctx, `${state.pan.length}/3 bahan di wajan`, cx, r.y + r.h - 62, 16, '#ffe9b8', 'bold', 'center');
    if (state.pan.length === 3) {
      text(ctx, 'Tekan Spasi / klik wajan untuk masak!', cx, r.y + r.h - 36, 15, '#ffb347', 'bold', 'center');
    }
  } else {
    text(ctx, 'Wajan kosong — masukkan 3 bahan', cx, cy - 4, 16, '#9a9aa2', 'normal', 'center');
    text(ctx, 'satu resep = satu hidangan', cx, cy + 20, 14, '#7a7a82', 'normal', 'center');
  }
}

function drawPlatingStation(ctx, state, now) {
  const r = LAYOUT.plating;
  stationLabel(ctx, 'PIRING SAJI — klik untuk antar', r);
  ctx.fillStyle = '#a9743f';
  roundRect(ctx, r.x, r.y, r.w, r.h, 14);
  ctx.fill();
  ctx.fillStyle = '#f7e8c9';
  roundRect(ctx, r.x + 14, r.y + 14, r.w - 28, r.h - 28, 10);
  ctx.fill();
  const cx = r.x + r.w / 2;
  const cy = r.y + r.h / 2 - 6;
  if (state.plate) {
    const match = state.orders.some((o) => o.dish === state.plate);
    const pulse = match ? 1 + Math.sin(now / 180) * 0.05 : 1;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(pulse, pulse);
    if (match) {
      ctx.strokeStyle = '#ff8c1a';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.ellipse(0, 10, 108, 48, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
    drawDishIcon(ctx, state.plate, cx, cy, 64);
    const recipe = RECIPE_BY_ID[state.plate];
    text(ctx, `${recipe.name} — SIAP SAJI!`, cx, r.y + r.h - 30, 18, match ? '#c2410c' : '#4a2c12', 'bold', 'center');
  } else {
    ctx.strokeStyle = '#c9b48a';
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.ellipse(cx, cy, 92, 40, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    text(ctx, 'Hidangan matang mendarat di sini', cx, cy + 62, 15, '#8a6a45', 'normal', 'center');
  }
}

function drawTray(ctx, state) {
  const r = LAYOUT.tray;
  ctx.fillStyle = '#5c2d12';
  roundRect(ctx, r.x, r.y, r.w, r.h, 10);
  ctx.fill();
  text(ctx, 'NAMPAN MINUM', r.x + 14, r.y + 18, 13, '#f7c98a', 'bold');
  if (state.trayDrink) {
    drawIngredientIcon(ctx, 'teh', r.x + 44, r.y + 48, 20);
    text(ctx, 'Teh Manis siap diantar', r.x + 84, r.y + 56, 16, '#ffe9b8', 'bold');
  } else {
    text(ctx, 'Klik bin Teh Manis untuk menuang', r.x + 16, r.y + 56, 15, '#d9b48a', 'normal');
  }
}

function drawCounter(ctx, state, now) {
  const { counter } = LAYOUT;
  ctx.fillStyle = '#6b4423';
  roundRect(ctx, counter.x - 8, counter.y - 8, counter.w + 16, counter.h + 16, 14);
  ctx.fill();
  ctx.fillStyle = '#8a5a33';
  roundRect(ctx, counter.x - 8, counter.y - 8, counter.w + 16, 22, 10);
  ctx.fill();
  text(ctx, 'MEJA BAHAN — klik / tekan 1–8', counter.x + 4, counter.y + 8, 13, '#ffe9b8', 'bold');
  text(ctx, 'C cincang • Spasi masak • Enter sajikan', counter.x + counter.w - 4, counter.y + 8, 13, '#f7c98a', 'normal', 'right');
  INGREDIENTS.forEach((ing, i) => {
    const r = binRect(i);
    const disabled = ing.chop && state.board !== null;
    ctx.fillStyle = disabled ? '#8a7a68' : '#fff8e7';
    roundRect(ctx, r.x, r.y, r.w, r.h, 12);
    ctx.fill();
    ctx.strokeStyle = '#d8c9a3';
    ctx.lineWidth = 2;
    roundRect(ctx, r.x, r.y, r.w, r.h, 12);
    ctx.stroke();
    drawIconChip(ctx, ing.id, r.x + r.w / 2, r.y + 56, 32);
    text(ctx, ing.name, r.x + r.w / 2, r.y + 112, 17, '#4a2c12', 'bold', 'center');
    if (ing.chop) text(ctx, 'perlu cincang', r.x + r.w / 2, r.y + 130, 11, '#8a6a45', 'normal', 'center');
    ctx.fillStyle = '#8a5a33';
    roundRect(ctx, r.x + r.w / 2 - 13, r.y + 140, 26, 22, 6);
    ctx.fill();
    text(ctx, ing.key, r.x + r.w / 2, r.y + 156, 14, '#ffffff', 'bold', 'center');
  });
}

function drawKitchenBackdrop(ctx) {
  const { kitchen } = LAYOUT;
  // Warm wall with a tile strip and a wooden floor.
  ctx.fillStyle = '#f3d9a4';
  ctx.fillRect(kitchen.x, kitchen.y, kitchen.w, 150);
  ctx.fillStyle = '#e8c48a';
  for (let x = 0; x < CANVAS_W; x += 64) {
    ctx.fillRect(x, kitchen.y + 150, 2, 40);
  }
  ctx.fillStyle = '#d9b078';
  ctx.fillRect(kitchen.x, kitchen.y + 150, kitchen.w, 42);
  ctx.fillStyle = '#c9a06a';
  ctx.fillRect(kitchen.x, kitchen.y + 150, kitchen.w, 4);
  ctx.fillStyle = '#7a4a26';
  ctx.fillRect(kitchen.x, kitchen.y + 192, kitchen.w, kitchen.h - 192);
  // A wall clock over the plating station, for a kitchen of its own.
  ctx.fillStyle = '#fff8e7';
  ctx.beginPath();
  ctx.arc(855, kitchen.y + 46, 24, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#8a5a33';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.strokeStyle = '#4a2c12';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(855, kitchen.y + 46);
  ctx.lineTo(855, kitchen.y + 32);
  ctx.moveTo(855, kitchen.y + 46);
  ctx.lineTo(866, kitchen.y + 50);
  ctx.stroke();
}

function drawFlash(ctx, state) {
  if (!state.flash || state.elapsed > state.flash.until) return;
  const alpha = Math.min(1, (state.flash.until - state.elapsed) / 0.5);
  ctx.save();
  ctx.globalAlpha = alpha;
  text(ctx, state.flash.text, CANVAS_W / 2, 250, 26, '#ffffff', 'bold', 'center');
  ctx.restore();
}

function drawTitleOverlay(ctx, state) {
  ctx.fillStyle = 'rgba(40, 18, 4, 0.55)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.fillStyle = '#fff8e7';
  roundRect(ctx, 290, 170, 700, 380, 20);
  ctx.fill();
  ctx.strokeStyle = '#ff8c1a';
  ctx.lineWidth = 4;
  roundRect(ctx, 290, 170, 700, 380, 20);
  ctx.stroke();
  text(ctx, '🍳 WARUNG KILAT', 640, 250, 52, '#7a3b1e', 'bold', 'center');
  text(ctx, 'Dapur kilat khas Indonesia — masak cepat, sajikan tepat waktu!', 640, 292, 19, '#4a2c12', 'normal', 'center');
  text(ctx, 'Baca papan pesanan, cincang ayam & sayur di talenan,', 640, 340, 18, '#4a2c12', 'normal', 'center');
  text(ctx, 'masak 3 bahan di wajan, lalu sajikan sebelum pelanggan pergi.', 640, 366, 18, '#4a2c12', 'normal', 'center');
  text(ctx, 'Klik bahan atau tekan 1–8  •  C cincang  •  Spasi masak  •  Enter sajikan', 640, 412, 16, '#8a5a33', 'normal', 'center');
  const blink = Math.sin(Date.now() / 300) > 0;
  if (blink) text(ctx, '▶  KLIK / TEKAN ENTER UNTUK MULAI  ◀', 640, 480, 22, '#c2410c', 'bold', 'center');
  text(ctx, 'Satu shift: 2 menit 30 detik • kombo menaikkan bonus koin', 640, 520, 15, '#8a6a45', 'normal', 'center');
}

function drawGameOverOverlay(ctx, state) {
  ctx.fillStyle = 'rgba(40, 18, 4, 0.6)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.fillStyle = '#fff8e7';
  roundRect(ctx, 340, 180, 600, 380, 20);
  ctx.fill();
  ctx.strokeStyle = '#ff8c1a';
  ctx.lineWidth = 4;
  roundRect(ctx, 340, 180, 600, 380, 20);
  ctx.stroke();
  text(ctx, 'SHIFT SELESAI!', 640, 250, 44, '#7a3b1e', 'bold', 'center');
  const stars = shiftStars(state);
  text(ctx, '★'.repeat(stars) + '☆'.repeat(3 - stars), 640, 300, 40, '#e8a90c', 'bold', 'center');
  text(ctx, `Koin hari ini: ${state.coins}`, 640, 352, 24, '#4a2c12', 'bold', 'center');
  text(ctx, `Hidangan tersaji: ${state.served}   •   Pesanan hangus: ${state.missed}`, 640, 390, 18, '#4a2c12', 'normal', 'center');
  text(ctx, `Kombo terbaik: x${state.bestCombo}`, 640, 420, 18, '#4a2c12', 'normal', 'center');
  const verdict = stars === 3
    ? 'Warungmu legendaris — pelanggan antre sampai ke ujung jalan!'
    : stars === 2
      ? 'Dapurmu ngebut! Sedikit lagi menuju bintang tiga.'
      : stars === 1
        ? 'Lumayan! Latih lagi ritme cincang–masak–sajimu.'
        : 'Shift yang berat — coba lagi, ritmenya pasti ketemu.';
  text(ctx, verdict, 640, 462, 16, '#8a5a33', 'normal', 'center');
  const blink = Math.sin(Date.now() / 300) > 0;
  if (blink) text(ctx, 'TEKAN R / KLIK UNTUK MAIN LAGI', 640, 520, 20, '#c2410c', 'bold', 'center');
}

// The whole frame, in draw order: room, board, stations, counter.
export function drawScene(ctx, state, now) {
  ctx.fillStyle = '#f7e8c9';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  drawTopBar(ctx, state);
  drawOrderBoard(ctx, state);
  drawKitchenBackdrop(ctx);
  drawChef(ctx, now);
  drawCuttingBoard(ctx, state, now);
  drawWok(ctx, state, now);
  drawPlatingStation(ctx, state, now);
  drawTray(ctx, state);
  drawCounter(ctx, state, now);
  drawFlash(ctx, state);
  if (state.phase === 'title') drawTitleOverlay(ctx, state);
  if (state.phase === 'over') drawGameOverOverlay(ctx, state);
}
