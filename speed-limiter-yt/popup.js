function formatRate(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return "1.00x";
  return `${num.toFixed(2)}x`;
}

function setActivePreset(rate) {
  const buttons = document.querySelectorAll('button[data-rate]');
  buttons.forEach((btn) => {
    const r = Number(btn.getAttribute('data-rate'));
    if (Math.abs(r - rate) < 1e-6) btn.classList.add('active');
    else btn.classList.remove('active');
  });
}

function updateUI(rate) {
  const valueEl = document.getElementById('speedValue');
  const rangeEl = document.getElementById('speedRange');
  valueEl.textContent = formatRate(rate);
  rangeEl.value = String(rate);
  setActivePreset(rate);
}

function persist(rate) {
  chrome.storage.sync.set({ maxRate: rate });
}

document.addEventListener('DOMContentLoaded', () => {
  const rangeEl = document.getElementById('speedRange');
  const resetBtn = document.getElementById('resetBtn');

  // Load stored values
  chrome.storage.sync.get({ maxRate: 1 }, (data) => {
    const rate = Number(data.maxRate);
    const initialRate = Number.isFinite(rate) && rate > 0 ? rate : 1;
    updateUI(initialRate);
  });

  rangeEl.addEventListener('input', (e) => {
    const rate = Number(e.target.value);
    updateUI(rate);
    persist(rate);
  });

  document.querySelectorAll('button[data-rate]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const rate = Number(btn.getAttribute('data-rate'));
      updateUI(rate);
      persist(rate);
    });
  });

  resetBtn.addEventListener('click', () => {
    const rate = 1;
    updateUI(rate);
    persist(rate);
  });
});


