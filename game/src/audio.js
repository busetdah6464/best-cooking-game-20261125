// Warung Kilat — tiny synthesised sound effects.
// No audio files ship with the game: every blip is a WebAudio
// oscillator, created lazily on the first player interaction so the
// game also stays silent (and error-free) in a headless screenshot run.

export function createSfx() {
  let ctx = null;
  let muted = false;

  function ensure() {
    if (ctx || muted) return ctx;
    try {
      const AC = window.AudioContext ?? window.webkitAudioContext;
      ctx = AC ? new AC() : null;
    } catch {
      ctx = null;
    }
    return ctx;
  }

  function tone(freq, dur, type = 'sine', gain = 0.08, when = 0) {
    const ac = ensure();
    if (!ac) return;
    const t0 = ac.currentTime + when;
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(gain, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(g);
    g.connect(ac.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  function play(name) {
    if (muted) return;
    switch (name) {
      case 'pick':
        tone(520, 0.07, 'triangle');
        break;
      case 'chop':
        tone(180, 0.06, 'square', 0.06);
        tone(140, 0.05, 'square', 0.05, 0.03);
        break;
      case 'sizzle':
        tone(900, 0.25, 'sawtooth', 0.02);
        tone(1200, 0.2, 'sawtooth', 0.015, 0.08);
        break;
      case 'ding':
        tone(880, 0.18, 'sine');
        tone(1318, 0.25, 'sine', 0.06, 0.1);
        break;
      case 'serve':
        tone(660, 0.09, 'triangle');
        tone(880, 0.09, 'triangle', 0.07, 0.09);
        tone(1108, 0.16, 'triangle', 0.07, 0.18);
        break;
      case 'pour':
        tone(300, 0.12, 'sine', 0.05);
        tone(420, 0.1, 'sine', 0.04, 0.08);
        break;
      case 'error':
        tone(160, 0.15, 'square', 0.05);
        break;
      case 'start':
        tone(523, 0.1, 'triangle');
        tone(659, 0.1, 'triangle', 0.07, 0.1);
        tone(784, 0.2, 'triangle', 0.07, 0.2);
        break;
      default:
        break;
    }
  }

  return {
    play,
    setMuted(value) {
      muted = value;
    },
    get muted() {
      return muted;
    },
  };
}
