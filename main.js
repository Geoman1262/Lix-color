// Color by Number - standalone main.js
// This file is intentionally self-contained so it can load even if style.css is missing.

const STORAGE_KEY = "color-by-number-game-v2";

const DEFAULT_STATE = {
  playerLevel: 1,
  brushLevel: 1,
  coins: 0,
  completedImages: []
};

const IMAGES = [
  { id: 1, name: "Starter Flower", stage: 1, baseReward: 25, colors: 5 },
  { id: 2, name: "Little House", stage: 2, baseReward: 45, colors: 10 },
  { id: 3, name: "Sunset", stage: 3, baseReward: 70, colors: 20 },
  { id: 4, name: "Forest", stage: 4, baseReward: 110, colors: 40 },
  { id: 5, name: "City", stage: 5, baseReward: 170, colors: 75 }
];

const BRUSH = {
  1: { multiplier: 1.0, cost: 0 },
  2: { multiplier: 1.1, cost: 300 },
  3: { multiplier: 1.5, cost: 1000 },
  4: { multiplier: 1.9, cost: 2500 },
  5: { multiplier: 2.3, cost: 6000 },
  6: { multiplier: 2.7, cost: 15000 },
  7: { multiplier: 3.1, cost: 40000 },
  8: { multiplier: 3.5, cost: 100000 },
  9: { multiplier: 3.9, cost: 250000 },
  10: { multiplier: 4.3, cost: 700000 }
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATE };
    return {
      ...DEFAULT_STATE,
      ...JSON.parse(raw)
    };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

let state = loadState();

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn("Save failed:", error);
  }
}

function getBrush() {
  return BRUSH[state.brushLevel] || BRUSH[1];
}

function rewardFor(image) {
  return Math.floor(image.baseReward * getBrush().multiplier);
}

function upgradeBrush() {
  const next = state.brushLevel + 1;
  if (!BRUSH[next]) {
    alert("Brush is already at MAX level.");
    return;
  }

  const cost = BRUSH[next].cost;

  if (state.coins < cost) {
    alert(`You need ${cost.toLocaleString()} Coins.`);
    return;
  }

  state.coins -= cost;
  state.brushLevel = next;
  saveState();
  render();
}

function completeImage(id) {
  const image = IMAGES.find(item => item.id === id);
  if (!image || state.completedImages.includes(id)) return;

  const reward = rewardFor(image);

  state.coins += reward;
  state.completedImages.push(id);
  state.playerLevel = Math.min(100, state.completedImages.length + 1);

  saveState();
  render();

  alert(`Image completed!\n\n+${reward.toLocaleString()} Coins`);
}

function makeNumbers(count) {
  let html = "";
  const visible = Math.min(count, 35);

  for (let i = 1; i <= visible; i++) {
    html += `<span>${i}</span>`;
  }

  return html;
}

function injectStyles() {
  if (document.getElementById("cbn-inline-style")) return;

  const style = document.createElement("style");
  style.id = "cbn-inline-style";
  style.textContent = `
    *{box-sizing:border-box}
    body{margin:0;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#f3f5f8;color:#111827}
    button{border:0;border-radius:12px;padding:12px 18px;font-weight:700;cursor:pointer}
    .cbn-game{max-width:1100px;margin:auto;padding:24px}
    .cbn-header{display:flex;align-items:center;justify-content:space-between;gap:20px}
    .cbn-header h1{margin:0;font-size:32px}
    .cbn-header p{margin:8px 0;color:#667085}
    .cbn-coins{background:#111827;color:#fff;padding:14px 22px;border-radius:999px;font-weight:800}
    .cbn-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin:25px 0}
    .cbn-stat,.cbn-brush,.cbn-card{background:#fff;border:1px solid #e4e7ec;border-radius:18px}
    .cbn-stat{padding:18px}
    .cbn-stat span{display:block;color:#667085;font-size:13px}
    .cbn-stat strong{display:block;font-size:25px;margin-top:6px}
    .cbn-brush{display:flex;align-items:center;gap:20px;padding:22px}
    .cbn-brush-icon{font-size:55px}
    .cbn-brush-content{flex:1}
    .cbn-brush-content h2{margin:0}
    .cbn-brush-content p{color:#667085}
    .cbn-upgrade{background:#111827;color:#fff}
    .cbn-max{font-weight:800}
    .cbn-title{margin-top:35px}
    .cbn-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
    .cbn-card{padding:14px}
    .cbn-preview{height:190px;border-radius:14px;background:linear-gradient(135deg,#dbeafe,#fce7f3);display:flex;align-items:center;justify-content:center}
    .cbn-numbers{width:90%;display:flex;flex-wrap:wrap;justify-content:center;gap:7px}
    .cbn-numbers span{width:29px;height:29px;display:grid;place-items:center;background:rgba(255,255,255,.85);border-radius:8px;font-size:11px;font-weight:800}
    .cbn-card h3{margin:14px 0 5px}
    .cbn-card p{color:#667085;margin:0 0 12px}
    .cbn-reward{font-weight:800;font-size:18px;margin-bottom:12px}
    .cbn-complete{width:100%;background:#111827;color:#fff}
    .cbn-done{font-weight:800;padding:12px 0}
    .cbn-footer{text-align:center;color:#98a2b3;padding:35px 0}
    @media(max-width:800px){.cbn-grid{grid-template-columns:repeat(2,1fr)}}
    @media(max-width:600px){.cbn-game{padding:16px}.cbn-header{flex-direction:column;align-items:flex-start}.cbn-stats{grid-template-columns:1fr}.cbn-grid{grid-template-columns:1fr}}
  `;
  document.head.appendChild(style);
}

function render() {
  injectStyles();

  const app = document.getElementById("app");

  if (!app) {
    console.error("Missing #app element in index.html");
    return;
  }

  const brush = getBrush();
  const next = BRUSH[state.brushLevel + 1];

  const upgrade = next
    ? `<button class="cbn-upgrade" id="cbn-upgrade">Upgrade · ${next.cost.toLocaleString()} 🪙</button>`
    : `<div class="cbn-max">MAX LEVEL</div>`;

  app.innerHTML = `
    <main class="cbn-game">
      <header class="cbn-header">
        <div>
          <h1>Color by Number</h1>
          <p>Find every number, complete the picture and earn Coins.</p>
        </div>
        <div class="cbn-coins">🪙 ${state.coins.toLocaleString()}</div>
      </header>

      <section class="cbn-stats">
        <div class="cbn-stat"><span>Player Level</span><strong>${state.playerLevel}</strong></div>
        <div class="cbn-stat"><span>Brush Level</span><strong>${state.brushLevel}</strong></div>
        <div class="cbn-stat"><span>Reward Multiplier</span><strong>×${brush.multiplier.toFixed(1)}</strong></div>
      </section>

      <section class="cbn-brush">
        <div class="cbn-brush-icon">🖌️</div>
        <div class="cbn-brush-content">
          <h2>Brush Level ${state.brushLevel}</h2>
          <p>All eligible rewards are multiplied by <strong>×${brush.multiplier.toFixed(1)}</strong>.</p>
          ${upgrade}
        </div>
      </section>

      <h2 class="cbn-title">Pictures</h2>

      <section class="cbn-grid">
        ${IMAGES.map(image => {
          const done = state.completedImages.includes(image.id);
          const reward = rewardFor(image);

          return `
            <article class="cbn-card">
              <div class="cbn-preview">
                <div class="cbn-numbers">${makeNumbers(image.colors)}</div>
              </div>

              <h3>${image.name}</h3>
              <p>Stage ${image.stage} · ${image.colors} colors</p>

              ${
                done
                  ? `<div class="cbn-done">✓ Completed</div>`
                  : `
                    <div class="cbn-reward">🪙 ${reward.toLocaleString()}</div>
                    <button class="cbn-complete" data-image-id="${image.id}">
                      Complete Image
                    </button>
                  `
              }
            </article>
          `;
        }).join("")}
      </section>

      <footer class="cbn-footer">
        Color by Number · Prototype
      </footer>
    </main>
  `;

  const upgradeButton = document.getElementById("cbn-upgrade");
  if (upgradeButton) {
    upgradeButton.addEventListener("click", upgradeBrush);
  }

  document.querySelectorAll(".cbn-complete").forEach(button => {
    button.addEventListener("click", () => {
      completeImage(Number(button.dataset.imageId));
    });
  });
}

render();
