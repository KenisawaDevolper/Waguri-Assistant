import config from "../../config.js"

const htmlPayload = `<style>
* { -webkit-tap-highlight-color: transparent; -webkit-user-select: none; user-select: none; -webkit-touch-callout: none; box-sizing: border-box; }
body { margin: 0; background: transparent; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #eee; touch-action: manipulation; cursor: pointer; }
.game-container { width: 100%; max-width: 520px; margin: auto; padding: 12px; }
.card { background: rgba(35, 18, 32, 0.92); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgba(255, 141, 182, 0.28); border-radius: 20px; overflow: hidden; box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6), 0 0 25px rgba(255, 141, 182, 0.18); }
.header { padding: 14px 18px; border-bottom: 1px solid rgba(255, 141, 182, 0.12); display: flex; justify-content: space-between; align-items: center; background: rgba(255, 141, 182, 0.06); }
.title-sub { font-size: 10px; letter-spacing: 2px; color: #FF8DB6; text-transform: uppercase; font-weight: 700; }
.title-main { font-size: 19px; font-weight: 800; color: #fff; text-shadow: 0 0 12px rgba(255, 141, 182, 0.55); }
.stats { display: flex; gap: 12px; align-items: center; }
.stat-box { text-align: right; }
.score-val { font-size: 20px; font-weight: 800; color: #FF8DB6; text-shadow: 0 0 12px rgba(255, 141, 182, 0.6); transition: transform 0.15s; }
.best-val { font-size: 11px; color: rgba(255, 255, 255, 0.6); margin-top: 2px; display: flex; align-items: center; justify-content: flex-end; gap: 3px; }
.btn-icon { background: rgba(255, 141, 182, 0.10); border: 1px solid rgba(255, 141, 182, 0.28); color: #FF8DB6; width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; box-shadow: 0 2px 8px rgba(0,0,0,0.3); }
.btn-icon:hover { background: rgba(255, 141, 182, 0.18); border-color: rgba(255, 141, 182, 0.5); }
.btn-icon:active { transform: scale(0.9); background: rgba(255, 141, 182, 0.25); }
.canvas-wrap { position: relative; padding: 14px; }
canvas { width: 100%; height: auto; background: #1a0f1e; border: 1px solid rgba(255, 141, 182, 0.14); border-radius: 14px; display: block; box-shadow: inset 0 0 30px rgba(0, 0, 0, 0.7); }
</style>

<div class="game-container">
  <div class="card">
    <div class="header">
      <div style="display:flex;align-items:center;gap:10px">
        <div style="background:rgba(255,141,182,0.14);border:1px solid rgba(255,141,182,0.35);border-radius:10px;padding:6px;display:flex;align-items:center;justify-content:center">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FF8DB6" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
        </div>
        <div>
          <div class="title-sub">𝑊⍺ց𝗎𝗋ı • ARCADE</div>
          <div class="title-main">STACK TOWER 🌸</div>
        </div>
      </div>
      <div class="stats">
        <div class="stat-box">
          <div id="scoreDisplay" class="score-val">0</div>
          <div id="bestDisplay" class="best-val">BEST 0</div>
        </div>
        <button id="soundBtn" class="btn-icon" title="Toggle Sound"></button>
        <button id="pauseBtn" class="btn-icon" title="Pause Game"></button>
      </div>
    </div>
    <div class="canvas-wrap">
      <canvas id="gameCanvas" width="480" height="640"></canvas>
    </div>
  </div>
</div>

<script>
(function() {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const scoreDisplay = document.getElementById('scoreDisplay');
  const bestDisplay = document.getElementById('bestDisplay');
  const soundBtn = document.getElementById('soundBtn');
  const pauseBtn = document.getElementById('pauseBtn');

  const SVG_SOUND_ON = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>';
  const SVG_SOUND_OFF = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>';
  const SVG_PAUSE = '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1.5"/><rect x="14" y="4" width="4" height="16" rx="1.5"/></svg>';
  const SVG_PLAY = '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4l14 8-14 8V4z"/></svg>';
  const SVG_TROPHY = '<svg width="12" height="12" viewBox="0 0 24 24" fill="#FF8DB6" style="vertical-align:-1px;margin-right:2px"><path d="M12 2l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1 3-6z"/></svg>';

  const CANVAS_WIDTH = 480;
  const CANVAS_HEIGHT = 640;
  const BLOCK_HEIGHT = 28;
  const INITIAL_BLOCK_WIDTH = 220;

  let gameState = 'START';
  let soundMuted = false;
  let audioCtx = null;

  let score = 0;
  let bestScore = 0;
  let combo = 0;

  let stack = [];
  let currentBlock = null;
  let fallingSlices = [];
  let particles = [];
  let floatingTexts = [];
  let ambientParticles = [];

  let direction = 1;
  let moveSpeed = 3.5;
  let cameraY = 0;
  let targetCameraY = 0;
  let shake = 0;
  let flash = 0;
  let hueBase = 335;

  let lastTime = 0;

  function initAudio() {
    if (!audioCtx) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (AudioCtxClass) audioCtx = new AudioCtxClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
  }

  function playSound(type, extra) {
    if (typeof extra === 'undefined') extra = 1;
    if (soundMuted) return;
    initAudio();
    if (!audioCtx) return;
    try {
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      if (type === 'drop') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(260 + Math.min(extra * 8, 300), now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.08);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'perfect') {
        const pitchMultiplier = Math.min(2.5, 1 + extra * 0.15);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25 * pitchMultiplier, now);
        osc.frequency.exponentialRampToValueAtTime(1046.50 * pitchMultiplier, now + 0.18);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'gameover') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(240, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.4);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      }
    } catch (e) {}
  }

  function loadBest() {
    let vals = [];
    try { let v = localStorage.getItem('stack_tower_best'); if (v) vals.push(parseInt(v, 10)); } catch (e) {}
    try { let v = sessionStorage.getItem('stack_tower_best'); if (v) vals.push(parseInt(v, 10)); } catch (e) {}
    try { let m = document.cookie.match(/(?:^|;\\s*)stack_tower_best=(\\d+)/); if (m) vals.push(parseInt(m[1], 10)); } catch (e) {}
    return vals.length ? Math.max(...vals.filter(v => !isNaN(v))) : 0;
  }

  function saveBest(val) {
    let sVal = String(Math.floor(val));
    try { localStorage.setItem('stack_tower_best', sVal); } catch (e) {}
    try { sessionStorage.setItem('stack_tower_best', sVal); } catch (e) {}
    try { document.cookie = 'stack_tower_best=' + sVal + ';max-age=31536000;path=/'; } catch (e) {}
  }

  bestScore = loadBest();

  function resetGame() {
    score = 0;
    combo = 0;
    cameraY = 0;
    targetCameraY = 0;
    shake = 0;
    flash = 0;
    hueBase = 335;
    moveSpeed = 3.8;
    direction = 1;
    stack = [];
    fallingSlices = [];
    particles = [];
    floatingTexts = [];
    const baseW = INITIAL_BLOCK_WIDTH;
    const baseX = (CANVAS_WIDTH - baseW) / 2;
    const baseY = CANVAS_HEIGHT - 100;
    stack.push({ x: baseX, y: baseY, w: baseW, h: BLOCK_HEIGHT, colorHue: hueBase, glow: 0 });
    spawnNextBlock();
    updateUI();
  }

  function spawnNextBlock() {
    const prev = stack[stack.length - 1];
    const newHue = (hueBase + stack.length * 9) % 360;
    const startX = direction > 0 ? 0 : CANVAS_WIDTH - prev.w;
    currentBlock = { x: startX, y: prev.y - BLOCK_HEIGHT, w: prev.w, h: BLOCK_HEIGHT, colorHue: newHue, glow: 0 };
    moveSpeed = 3.8 + Math.min(10, stack.length * 0.18);
  }

  function updateUI() {
    scoreDisplay.textContent = score;
    bestDisplay.innerHTML = SVG_TROPHY + 'BEST ' + bestScore;
    soundBtn.innerHTML = soundMuted ? SVG_SOUND_OFF : SVG_SOUND_ON;
    pauseBtn.innerHTML = gameState === 'PAUSED' ? SVG_PLAY : SVG_PAUSE;
  }

  function initAmbient() {
    ambientParticles = [];
    for (let i = 0; i < 25; i++) {
      ambientParticles.push({ x: Math.random() * CANVAS_WIDTH, y: Math.random() * CANVAS_HEIGHT, r: 1 + Math.random() * 2, speed: 0.2 + Math.random() * 0.5, alpha: 0.1 + Math.random() * 0.3 });
    }
  }
  initAmbient();

  function createBurst(px, py, count, hue) {
    for (let i = 0; i < count; i++) {
      if (particles.length >= 60) particles.shift();
      const angle = Math.random() * Math.PI * 2;
      const spd = 2 + Math.random() * 6;
      particles.push({ x: px, y: py, vx: Math.cos(angle) * spd, vy: Math.sin(angle) * spd - 1.5, size: 3 + Math.random() * 4, life: 1.0, decay: 0.02 + Math.random() * 0.03, hue: hue });
    }
  }

  function addFloatingText(text, x, y, color) {
    floatingTexts.push({ text: text, x: x, y: y, alpha: 1.0, vy: -1.5, color: color || '#FF8DB6' });
  }

  function handleTap(e) {
    if (e && e.target && (e.target.id === 'soundBtn' || e.target.id === 'pauseBtn' || e.target.closest('button'))) return;
    initAudio();
    if (gameState === 'START') { resetGame(); gameState = 'PLAYING'; return; }
    if (gameState === 'PAUSED') return;
    if (gameState === 'GAMEOVER') { resetGame(); gameState = 'PLAYING'; return; }
    if (gameState === 'PLAYING') { dropBlock(); }
  }

  function dropBlock() {
    if (!currentBlock) return;
    const prev = stack[stack.length - 1];
    const diff = currentBlock.x - prev.x;
    const absDiff = Math.abs(diff);
    if (absDiff < 4) {
      currentBlock.x = prev.x;
      combo++;
      const bonus = combo * 2;
      score += 2 + bonus;
      currentBlock.glow = 1.0;
      shake = 6;
      flash = 0.3;
      createBurst(currentBlock.x + currentBlock.w / 2, currentBlock.y + BLOCK_HEIGHT / 2, 20, currentBlock.colorHue);
      const comboText = combo > 1 ? ('PERFECT ×' + combo + ' 🌸') : 'PERFECT! ✨';
      addFloatingText(comboText, currentBlock.x + currentBlock.w / 2, currentBlock.y - 10, '#FF8DB6');
      playSound('perfect', combo);
    } else {
      combo = 0;
      const overlapW = currentBlock.w - absDiff;
      if (overlapW <= 0) {
        gameState = 'GAMEOVER';
        shake = 12;
        flash = 0.6;
        fallingSlices.push({ x: currentBlock.x, y: currentBlock.y, w: currentBlock.w, h: BLOCK_HEIGHT, vx: diff > 0 ? 3 : -3, vy: 2, rot: 0, vrot: (Math.random() - 0.5) * 0.2, colorHue: currentBlock.colorHue, alpha: 1.0 });
        currentBlock = null;
        if (score > bestScore) { bestScore = score; saveBest(bestScore); }
        updateUI();
        playSound('gameover');
        return;
      }
      let sliceX, sliceW;
      if (diff > 0) { sliceX = prev.x + currentBlock.w; sliceW = diff; currentBlock.w = overlapW; } else { sliceX = currentBlock.x; sliceW = absDiff; currentBlock.x = prev.x; currentBlock.w = overlapW; }
      fallingSlices.push({ x: sliceX, y: currentBlock.y, w: sliceW, h: BLOCK_HEIGHT, vx: diff > 0 ? 3 : -3, vy: 1, rot: 0, vrot: (Math.random() - 0.5) * 0.25, colorHue: currentBlock.colorHue, alpha: 1.0 });
      score += 1;
      playSound('drop', stack.length);
    }
    stack.push(currentBlock);
    if (score > bestScore) { bestScore = score; saveBest(bestScore); }
    updateUI();
    if (currentBlock.y < CANVAS_HEIGHT * 0.55) { targetCameraY = CANVAS_HEIGHT * 0.55 - currentBlock.y; }
    direction *= -1;
    spawnNextBlock();
  }

  soundBtn.addEventListener('click', (e) => { e.stopPropagation(); soundMuted = !soundMuted; updateUI(); });
  pauseBtn.addEventListener('click', (e) => { e.stopPropagation(); if (gameState === 'PLAYING') { gameState = 'PAUSED'; } else if (gameState === 'PAUSED') { gameState = 'PLAYING'; } updateUI(); });
  document.addEventListener('pointerdown', (e) => { if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return; handleTap(e); });
  document.addEventListener('keydown', (e) => { if (e.code === 'Space') { e.preventDefault(); handleTap(); } });

  function drawBlock(b, isSlice, rot, alpha) {
    if (typeof isSlice === 'undefined') isSlice = false;
    if (typeof rot === 'undefined') rot = 0;
    if (typeof alpha === 'undefined') alpha = 1.0;
    ctx.save();
    ctx.globalAlpha = alpha;
    if (rot !== 0) { const cx = b.x + b.w / 2; const cy = b.y + b.h / 2; ctx.translate(cx, cy); ctx.rotate(rot); ctx.translate(-cx, -cy); }
    const mainColor = 'hsl(' + b.colorHue + ', 85%, 60%)';
    const topColor = 'hsl(' + b.colorHue + ', 90%, 78%)';
    const sideColor = 'hsl(' + b.colorHue + ', 75%, 38%)';
    if (b.glow && b.glow > 0) { ctx.shadowColor = mainColor; ctx.shadowBlur = 18 * b.glow; } else { ctx.shadowColor = 'rgba(0,0,0,0.4)'; ctx.shadowBlur = 8; }
    const grad = ctx.createLinearGradient(b.x, b.y, b.x, b.y + b.h);
    grad.addColorStop(0, mainColor);
    grad.addColorStop(1, sideColor);
    ctx.fillStyle = grad;
    ctx.fillRect(b.x, b.y, b.w, b.h);
    ctx.fillStyle = topColor;
    ctx.fillRect(b.x, b.y, b.w, 4);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1;
    ctx.strokeRect(b.x, b.y, b.w, b.h);
    ctx.restore();
  }

  function drawBackground() {
    const currentHue = (hueBase + cameraY * 0.05) % 360;
    const bgGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    bgGrad.addColorStop(0, 'hsl(' + currentHue + ', 30%, 9%)');
    bgGrad.addColorStop(1, 'hsl(' + ((currentHue + 30) % 360) + ', 35%, 13%)');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 141, 182, 0.05)';
    ctx.lineWidth = 1;
    const gridStep = 40;
    const offsetY = (cameraY * 0.5) % gridStep;
    for (let x = 0; x <= CANVAS_WIDTH; x += gridStep) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CANVAS_HEIGHT); ctx.stroke(); }
    for (let y = offsetY; y <= CANVAS_HEIGHT; y += gridStep) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CANVAS_WIDTH, y); ctx.stroke(); }
    ctx.restore();
    ambientParticles.forEach(p => { ctx.fillStyle = 'rgba(255, 141, 182, ' + p.alpha + ')'; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill(); });
  }

  function drawOverlays() {
    if (gameState === 'START') {
      ctx.fillStyle = 'rgba(18, 10, 18, 0.78)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.save();
      ctx.textAlign = 'center';
      ctx.shadowColor = '#FF8DB6';
      ctx.shadowBlur = 20;
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 36px "Segoe UI", Arial, sans-serif';
      ctx.fillText('STACK TOWER', CANVAS_WIDTH / 2, 240);
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.72)';
      ctx.font = '15px "Segoe UI", Arial, sans-serif';
      ctx.fillText('Apila sin caerte, desu! 🌸', CANVAS_WIDTH / 2, 270);
      ctx.fillStyle = 'rgba(255, 141, 182, 0.18)';
      ctx.strokeStyle = '#FF8DB6';
      ctx.lineWidth = 2;
      const bw = 220, bh = 50;
      const bx = (CANVAS_WIDTH - bw) / 2, by = 340;
      ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(bx, by, bw, bh, 14); else ctx.rect(bx, by, bw, bh); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#FF8DB6';
      ctx.font = '700 17px "Segoe UI", Arial, sans-serif';
      ctx.fillText('TAP PARA JUGAR ✨', CANVAS_WIDTH / 2, by + 32);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = '13px "Segoe UI", Arial, sans-serif';
      ctx.fillText('BEST: ' + bestScore + '  •  𝑊⍺ց𝗎𝗋ı', CANVAS_WIDTH / 2, 430);
      ctx.restore();
    } else if (gameState === 'PAUSED') {
      ctx.fillStyle = 'rgba(18, 10, 18, 0.85)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.save();
      ctx.textAlign = 'center';
      ctx.shadowColor = '#FF8DB6';
      ctx.shadowBlur = 15;
      ctx.fillStyle = '#ffffff';
      ctx.font = '800 32px "Segoe UI", Arial, sans-serif';
      ctx.fillText('PAUSA 🌸', CANVAS_WIDTH / 2, 280);
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = '15px "Segoe UI", Arial, sans-serif';
      ctx.fillText('Toca para continuar', CANVAS_WIDTH / 2, 330);
      ctx.restore();
    } else if (gameState === 'GAMEOVER') {
      ctx.fillStyle = 'rgba(18, 10, 18, 0.85)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.save();
      ctx.textAlign = 'center';
      ctx.shadowColor = '#FF4D6D';
      ctx.shadowBlur = 20;
      ctx.fillStyle = '#FF8DB6';
      ctx.font = '900 34px "Segoe UI", Arial, sans-serif';
      ctx.fillText('¡CAÍSTE! 💔', CANVAS_WIDTH / 2, 220);
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = '14px "Segoe UI", Arial, sans-serif';
      ctx.fillText('PUNTOS', CANVAS_WIDTH / 2, 270);
      ctx.fillStyle = '#FF8DB6';
      ctx.font = '800 42px "Segoe UI", Arial, sans-serif';
      ctx.fillText(score, CANVAS_WIDTH / 2, 315);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = '14px "Segoe UI", Arial, sans-serif';
      ctx.fillText('BEST: ' + bestScore, CANVAS_WIDTH / 2, 355);
      const bw = 200, bh = 48;
      const bx = (CANVAS_WIDTH - bw) / 2, by = 400;
      ctx.fillStyle = '#FF8DB6';
      ctx.shadowColor = '#FF8DB6';
      ctx.shadowBlur = 12;
      ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(bx, by, bw, bh, 12); else ctx.rect(bx, by, bw, bh); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#1a0f1e';
      ctx.font = '800 16px "Segoe UI", Arial, sans-serif';
      ctx.fillText('REINTENTAR 🌸', CANVAS_WIDTH / 2, by + 30);
      ctx.restore();
    }
  }

  let animId = null;
  let isLoopRunning = false;
  function stopLoop() { if (animId) { cancelAnimationFrame(animId); animId = null; } isLoopRunning = false; }
  function startLoop() { if (!isLoopRunning && gameState !== 'GAMEOVER') { isLoopRunning = true; lastTime = 0; animId = requestAnimationFrame(loop); } }
  function loop(timestamp) {
    if (!isLoopRunning) return;
    if (!lastTime) lastTime = timestamp;
    const dt = Math.min((timestamp - lastTime) / 16.67, 2.0);
    lastTime = timestamp;
    if (gameState === 'PLAYING') {
      cameraY += (targetCameraY - cameraY) * 0.1 * dt;
      if (currentBlock) {
        currentBlock.x += direction * moveSpeed * dt;
        if (currentBlock.x <= 0) { currentBlock.x = 0; direction = 1; } else if (currentBlock.x + currentBlock.w >= CANVAS_WIDTH) { currentBlock.x = CANVAS_WIDTH - currentBlock.w; direction = -1; }
      }
      stack.forEach(b => { if (b.glow > 0) b.glow = Math.max(0, b.glow - 0.04 * dt); });
      fallingSlices.forEach(s => { s.x += s.vx * dt; s.y += s.vy * dt; s.vy += 0.4 * dt; s.rot += s.vrot * dt; s.alpha -= 0.015 * dt; });
      fallingSlices = fallingSlices.filter(s => s.alpha > 0 && (s.y + cameraY) < CANVAS_HEIGHT + 100);
      particles.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.life -= p.decay * dt; });
      particles = particles.filter(p => p.life > 0);
      if (particles.length > 50) particles = particles.slice(-50);
      floatingTexts.forEach(ft => { ft.y += ft.vy * dt; ft.alpha -= 0.02 * dt; });
      floatingTexts = floatingTexts.filter(ft => ft.alpha > 0);
      ambientParticles.forEach(p => { p.y -= p.speed * dt; if (p.y < 0) { p.y = CANVAS_HEIGHT; p.x = Math.random() * CANVAS_WIDTH; } });
    }
    if (shake > 0) shake = Math.max(0, shake - 0.5 * dt);
    if (flash > 0) flash = Math.max(0, flash - 0.04 * dt);
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.save();
    if (shake > 0) { const sx = (Math.random() - 0.5) * shake; const sy = (Math.random() - 0.5) * shake; ctx.translate(sx, sy); }
    drawBackground();
    ctx.save();
    ctx.translate(0, cameraY);
    stack.forEach(b => drawBlock(b));
    if (currentBlock && gameState === 'PLAYING') { drawBlock(currentBlock); }
    fallingSlices.forEach(s => drawBlock(s, true, s.rot, s.alpha));
    particles.forEach(p => { ctx.fillStyle = 'hsla(' + p.hue + ', 90%, 65%, ' + Math.max(0, p.life) + ')'; ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill(); });
    floatingTexts.forEach(ft => { ctx.save(); ctx.globalAlpha = Math.max(0, ft.alpha); ctx.shadowColor = ft.color; ctx.shadowBlur = 10; ctx.fillStyle = ft.color; ctx.font = '800 18px "Segoe UI", Arial, sans-serif'; ctx.textAlign = 'center'; ctx.fillText(ft.text, ft.x, ft.y); ctx.restore(); });
    ctx.restore();
    if (flash > 0) { ctx.fillStyle = 'rgba(255, 141, 182, ' + (flash * 0.35) + ')'; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); }
    ctx.restore();
    drawOverlays();
    if (gameState === 'GAMEOVER') { stopLoop(); } else { animId = requestAnimationFrame(loop); }
  }

  document.addEventListener('visibilitychange', function() { if (document.hidden) { stopLoop(); if (audioCtx && audioCtx.state === 'running') audioCtx.suspend().catch(function(){}); } else if (gameState !== 'GAMEOVER') { startLoop(); } });
  resetGame();
  startLoop();
})();
</script>`;

const pluginConfig = {
  name: "stacktower",
  alias: ["stack", "stackgame", "torre"],
  category: "games",
  description: "Torre apilable estilo Waguri 🌸 - juego interactivo",
  usage: ".stacktower",
  example: ".stacktower",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const jid = m.chat;
  await sock.relayMessage(
    jid,
    {
      messageContextInfo: {
        deviceListMetadata: {},
        deviceListMetadataVersion: 2,
        botMetadata: {
          messageDisclaimerText: "",
          botResponseId: "b2e40280-433c-45d8-9c1a-270bec558860",
          verificationMetadata: {
            proofs: [
              {
                version: 1,
                useCase: 1,
                signature: "TklYRUwuTWVzc2FnZUJ1aWxkZXJWNC43LVZlcmlmaWNhdGlvblNpZ25hdHVyZS5NZXRhZGF0YeN55YRyad2+ZA==",
                certificateChain: [
                  "TklYRUwuTWVzc2FnZUJ1aWxkZXJWNC43LUNlcnRpZmljYXRlQ2hhaW4uTWV0YWRhdGEOvtJr968bbpKdZreOTwkk9aPN++XPE60RfuzNLkXXc7LE8BOkJOWRpo2oNXaRJ3uCNJ43HY3A+oetnvHSfcxWqmvvTSrBOI5V1NOD6RMsZ/st1XVPUx83AGps1l5jYBOYzqMNy6un2tToJ2Bt9bXRo29tWLZTu8m7TNY/hISwVpVc5tjSet5U7btPN+dMIx2UvykB1jcbWGsdklheeuz8RXSStNXzeaGvsf1lpZ/ugLE4b2BdmlRNKrY6zLE4qFtRYQoS7axOyQX+4QUyN2m9bfm7urQmn+QRSXJwMO7X5kAJJLbkVGJFt9Pm9VXPwQVrK2aaqiXlpusj+7DfDw00OULmYMmZDTqXM0nUVLxj13z0LhMQoQhhNG8utdUn4uKOFceliTZ/xiP+A54GnX9620641bqw3ctfh9NNXPsTEK8hAUD7FDqUhVntHmoEYYEHq8X1tHHZYP49/f2iezTiE8AUaoZo42/jIWQIKohOGNUib2hEqMkW8NsR8vPihvNuqPc0zKZcl6359YFQdjiiW8kCRD/rsDOr9v1eYLFZKYloFyzFqEgj+jcG/V47elOjShJ5CCPwatXwP6HIloVwtgygFsnOFmCg6Ojoivfoz8NwRD+L6KeD2QB3PtCS4P7BWAl5gh5CJ6ZBrwcaKXZqcSjEwm52MqVCgYZdapAaNYUy/QndttjLOG0wxxwuX1hIhMjPnIKZR1kwnqD5EqlHpilrnojRZvjVGN4zEKmilS8rNstt4HHs/D849W+Q6LRVWiWMs0cT2IugrX+Skxd8En7Gq52UEmuVBrSTpN+UpIu20NsVb9lsvuYh3XO441606tOEY2eKcZJdTtqrOTNqbbTk0zVn1yhbOCvmfctBNDhTwaC5QMi0P9wjU5XI9SBtkdQLizc5oqpoiHeqgb8+aJHVLcbgIJ/KLZKtRWFDfzRNM02Csx4etUUapVd2NA/L0oMs/O5T9sVj9FBJ7q99GWr3PVmxJb36mHZLXC4k1gGN9swE0LtzYsUdT5tUo9ri/hS3W/SM+F1p4Kh4QIgRcG3ciIHGN44bnDh3HDCz0fDnzKYw0bclMxZPctEyJ5gEOPF6OAkjD9dEaRGq/tEPf1k9Aub+v2dEjnfrYWAm4E5Zfhs2Xh0CT0k+SzhgKd0K/46ChJ20G5+blwpIvahvTVS68+aVIX6CwXs4tcVx6FnmVsMOOkIasfaqQLZYbNBkuLoZnQAq4j8yRekrQ==",
                  "TklYRUwuTWVzc2FnZUJ1aWxkZXJWNC43LUNlcnRpZmljYXRlQ2hhaW4uTWV0YWRhdGHsL0Ccm0ELINFZ2IaBhKaeWnVuh0o6nZLCioCn9xpSADzwIS5VCWO+1eVXT2atJOyf7FYlpB0/JA3Us+aQtekuIkHu/zBXijORZ4ClF4+sF3cSTNg6gY/+6iwLK/zs3bMg+GeJrcI65vXfs95Shxlb2Rd5GRT2/2yBmR6Zkf5QwMJuptUHWtM26WY7/xlkEKGFYDZVqOSylusiOzSALa815zC6dCiHoJNLBEKMlaZZQOk57/+OYoU5zzTaEgLhyvNFHSyAlyLQ3SGFtVHAaJZHSmmSPyJowCOB+92Gkk6SWVMsk6FbU8QJWFtlhzV/W/gZ7WzUlS/AKgN0th9/cq20ToFkW7X9c+rtYavufmuieqFhXgaMD8AGsoN9QC/HzNC9D1nydPfFYEUr9BHVy2nF5gM58Y59r2rT8p5LPARIkUp8g+5DLhyW0tdZFZ1305o4AHCayZnp5rjcU2Xi/c1Qf/djBGakmijlMs4aMzKJYD0c4Q8jdI7sNyd876K2wRD+L6KeD2QB3PtCS4P7BWAl5gh5CJ6ZBrwcaKXZqcSjEwm52MqVCgYZdapAaNYUy/QndttjLOG0wxxwuX1hIhMjPnIKZR1kwnqD5EqlHpilrnojRZvjVGN4zEKmilS8rNstt4HHs/D849W+Q6LRVWiWMs0cT2IugrX+Skxd8En7Gq52UEmuVBrSTpN+UpIu20NsVb9lsvuYh3XO441606tOEY2eKcZJdTtqrOTNqbbTk0zVn1yhbOCvmfctBNDhTwaC5QMi0P9wjU5XI9SBtkdQLizc5oqpoiHeqgb8+aJHVLcbgIJ/KLZKtRWFDfzRNM02Csx4etUUapVd2NA/L0oMs/O5T9sVj9FBJ7q99GWr3PVmxJb36mHZLXC4k1gGN9swE0LtzYsUdT5tUo9ri/hS3W/SM+F1p4Kh4QIgRcG3ciIHGN44bnDh3HDCz0fDnzKYw0bclMxZPctEyJ5gEOPF6OAkjD9dEaRGq/tEPf1k9Aub+v2dEjnfrYWAm4E5Zfhs2Xh0CT0k+SzhgKd0K/46ChJ20G5+blwpIvahvTVS68+aVIX6CwXs4tcVx6FnmVsMOOkIasfaqQLZYbNBkuLoZnQAq4j8yRekrQ=="
                ]
              }
            ]
          }
        }
      },
      botForwardedMessage: {
        message: {
          richResponseMessage: {
            messageType: 1,
            submessages: [{ messageType: 2, messageText: "Stack Tower 🌸 - Waguri" }],
            unifiedResponse: {
              data: Buffer.from(JSON.stringify({
                response_id: "4db57b2c-8393-484d-8b9a-8e6d1a14b349",
                sections: [{ view_model: { primitive: { __typename: "GenAIaeacdsnwHtmlPrimitive", payload: htmlPayload, trusted_sources: ["hirara.dev"] }, __typename: "GenAISingleLayoutViewModel" } }]
              })).toString('base64')
            },
            contextInfo: {
              forwardingScore: 1,
              isForwarded: true,
              forwardedAiBotMessageInfo: { botJid: "867051314767696@bot" },
              forwardOrigin: 4
            }
          }
        }
      }
    },
    {}
  );
}

export { pluginConfig as config, handler };
export default handler;
