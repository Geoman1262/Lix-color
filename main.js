import "./style.css";

const STORAGE = "cbn-game-v1";

const defaultState = {
  playerLevel: 1,
  brushLevel: 1,
  coins: 0,
  completedImages: [],
  currentImageId: 1
};

const images = [
  { id: 1, name: "Starter Flower", stage: 1, baseReward: 25, colors: 5 },
  { id: 2, name: "Little House", stage: 2, baseReward: 45, colors: 10 },
  { id: 3, name: "Sunset", stage: 3, baseReward: 70, colors: 20 },
  { id: 4, name: "Forest", stage: 4, baseReward: 110, colors: 40 },
  { id: 5, name: "City", stage: 5, baseReward: 170, colors: 75 }
];

const brush = {
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

function load() {
  try {
    return { ...defaultState, ...JSON.parse(localStorage.getItem(STORAGE) || "{}") };
  } catch {
    return { ...defaultState };
  }
}

let state = load();

function save() {
  localStorage.setItem(STORAGE, JSON.stringify(state));
}

function rewardFor(image) {
  return Math.floor(image.baseReward * brush[state.brushLevel].multiplier);
}

function upgrade() {
  if (state.brushLevel >= 10) return;
  const next = state.brushLevel + 1;
  const cost = brush[next].cost;
  if (state.coins < cost) {
    alert(`You need ${cost.toLocaleString()} coins.`);
    return;
  }
  state.coins -= cost;
  state.brushLevel = next;
  save();
  render();
}

function completeImage(id) {
  const image = images.find(x => x.id === id);
  if (!image || state.completedImages.includes(id)) return;

  const reward = rewardFor(image);
  state.coins += reward;
  state.completedImages.push(id);
  state.playerLevel = Math.min(100, 1 + state.completedImages.length);
  save();
  render();
}

function render() {
  const b = brush[state.brushLevel];
  const next = brush[state.brushLevel + 1];

  document.querySelector("#app").innerHTML = `
    <main class="shell">
      <header class="topbar">
        <div>
          <h1>Color by Number</h1>
          <p>Find the numbers. Complete the picture. Earn Coins.</p>
        </div>
        <div class="coins">🪙 ${state.coins.toLocaleString()}</div>
      </header>

      <section class="stats">
        <div><span>Player Level</span><strong>${state.playerLevel}</strong></div>
        <div><span>Brush Level</span><strong>${state.brushLevel}</strong></div>
        <div><span>Multiplier</span><strong>×${b.multiplier.toFixed(1)}</strong></div>
      </section>

      <section class="brush-card">
        <div class="brush-icon">🖌️</div>
        <div class="brush-info">
          <h2>Brush Level ${state.brushLevel}</h2>
          <p>Your global reward multiplier is <b>×${b.multiplier.toFixed(1)}</b>.</p>
          ${
            next
              ? `<button id="upgrade">Upgrade for ${next.cost.toLocaleString()} 🪙</button>`
              : `<span class="max">MAX LEVEL</span>`
          }
        </div>
      </section>

      <h2 class="section-title">Pictures</h2>
      <section class="grid">
        ${images.map(image => {
          const done = state.completedImages.includes(image.id);
          const reward = rewardFor(image);
          return `
            <article class="image-card ${done ? "done" : ""}">
              <div class="art">
                <div class="number-cloud">
                  ${Array.from({length: Math.min(image.colors, 20)}, (_, i) =>
                    `<span>${(i % image.colors) + 1}</span>`).join("")}
                </div>
              </div>
              <h3>${image.name}</h3>
              <p>Stage ${image.stage} · ${image.colors} colors</p>
              <strong>${done ? "✓ Completed" : `Reward: ${reward.toLocaleString()} 🪙`}</strong>
              ${
                done
                  ? `<button disabled>Completed</button>`
                  : `<button class="complete" data-id="${image.id}">Complete Image</button>`
              }
            </article>
          `;
        }).join("")}
      </section>

      <footer>
        <small>Prototype economy • Rewards are calculated from Base Reward × Brush Multiplier.</small>
      </footer>
    </main>
  `;

  document.querySelector("#upgrade")?.addEventListener("click", upgrade);
  document.querySelectorAll(".complete").forEach(btn => {
    btn.addEventListener("click", () => completeImage(Number(btn.dataset.id)));
  });
}

render();