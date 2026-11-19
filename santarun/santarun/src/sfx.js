// Tiny synthesized sound effects (WebAudio) so no audio files are needed.
export function tone(scene, f0, f1, dur, type = 'square', vol = 0.07, delay = 0) {
    const ctx = scene.sound && scene.sound.context;
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();
    const t = ctx.currentTime + delay;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t + dur);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    g.connect(ctx.destination);
    o.start(t);
    o.stop(t + dur);
}
export const sfx = {
    jump:    s => tone(s, 280, 620, 0.16, 'square', 0.06),
    land:    s => tone(s, 140, 50, 0.09, 'triangle', 0.12),
    step:    s => tone(s, 90, 60, 0.04, 'triangle', 0.05),
    collect: s => { tone(s, 880, 880, 0.08, 'square', 0.06); tone(s, 1320, 1320, 0.14, 'square', 0.06, 0.07); },
    die:     s => tone(s, 400, 60, 0.5, 'sawtooth', 0.08),
    shoot:   s => { tone(s, 1300, 500, 0.12, 'sawtooth', 0.035); tone(s, 700, 1400, 0.08, 'sine', 0.04); },
    hit:     s => tone(s, 320, 140, 0.08, 'square', 0.06),
    kill:    s => { tone(s, 520, 90, 0.22, 'square', 0.07); },
    hurt:    s => tone(s, 240, 70, 0.28, 'sawtooth', 0.1),
    win:     s => [523, 659, 784, 1047].forEach((f, i) => tone(s, f, f, 0.18, 'square', 0.06, i * 0.14)),
};