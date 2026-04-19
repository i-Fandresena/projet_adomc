const logements = [
  { id: 'L1', nom: 'Studio Horizon', quartier: 'Antaninarenina', loyer: 520, distance: 12, surface: 24, transport: 8.4, securite: 7.6, meuble: true },
  { id: 'L2', nom: 'Residence Kanto', quartier: 'Ankorondrano', loyer: 810, distance: 18, surface: 38, transport: 9.1, securite: 8.2, meuble: true },
  { id: 'L3', nom: 'Loft Saha', quartier: 'Ivandry', loyer: 980, distance: 24, surface: 46, transport: 8.8, securite: 8.7, meuble: false },
  { id: 'L4', nom: 'Appartement Mena', quartier: 'Ambohijatovo', loyer: 640, distance: 10, surface: 31, transport: 8.9, securite: 7.9, meuble: true },
  { id: 'L5', nom: 'Terrasse Parc', quartier: 'Analamahitsy', loyer: 730, distance: 28, surface: 44, transport: 7.8, securite: 8.4, meuble: false },
  { id: 'L6', nom: 'City Nest', quartier: '67 Ha', loyer: 560, distance: 16, surface: 27, transport: 9.3, securite: 7.1, meuble: true },
  { id: 'L7', nom: 'Maison Bel Air', quartier: 'Talatamaty', loyer: 690, distance: 34, surface: 57, transport: 7.2, securite: 8.1, meuble: false },
  { id: 'L8', nom: 'Vista Campus', quartier: 'Ankatso', loyer: 470, distance: 7, surface: 22, transport: 8.2, securite: 6.8, meuble: true },
  { id: 'L9', nom: 'Residence Soa', quartier: 'Anosy', loyer: 890, distance: 14, surface: 49, transport: 9.0, securite: 8.9, meuble: true },
  { id: 'L10', nom: 'Courtyard Aina', quartier: 'Ampefiloha', loyer: 610, distance: 11, surface: 29, transport: 8.5, securite: 7.5, meuble: false },
  { id: 'L11', nom: 'Duplex Nofy', quartier: 'Andranomena', loyer: 1180, distance: 33, surface: 72, transport: 7.6, securite: 8.8, meuble: true },
  { id: 'L12', nom: 'Smart Flat One', quartier: 'Tsaralalana', loyer: 540, distance: 9, surface: 25, transport: 9.2, securite: 7.3, meuble: true },
];

const criteres = {
  loyer: { label: 'Loyer', direction: 'min' },
  distance: { label: 'Distance', direction: 'min' },
  surface: { label: 'Surface', direction: 'max' },
  transport: { label: 'Transport', direction: 'max' },
  securite: { label: 'Securite', direction: 'max' },
};

const state = {
  poids: {
    loyer: 30,
    distance: 20,
    surface: 20,
    transport: 15,
    securite: 15,
  },
  filtres: {
    loyerMax: 1200,
    distanceMax: 35,
    surfaceMin: 20,
    meubleOnly: false,
  },
  comparisonIds: [],
};

const ids = {
  weightSliders: document.getElementById('weight-sliders'),
  weightTotal: document.getElementById('weight-total'),
  resultSummary: document.getElementById('result-summary'),
  housingList: document.getElementById('housing-list'),
  tradeoffMap: document.getElementById('tradeoff-map'),
  badgeCount: document.getElementById('badge-count'),
  badgePareto: document.getElementById('badge-pareto'),
  badgeStrong: document.getElementById('badge-strong'),
  rentMax: document.getElementById('rent-max'),
  rentMaxLabel: document.getElementById('rent-max-label'),
  distanceMax: document.getElementById('distance-max'),
  distanceMaxLabel: document.getElementById('distance-max-label'),
  surfaceMin: document.getElementById('surface-min'),
  surfaceMinLabel: document.getElementById('surface-min-label'),
  furnishedOnly: document.getElementById('furnished-only'),
  exportCsv: document.getElementById('export-csv'),
  exportPdf: document.getElementById('export-pdf'),
  comparisonPanel: document.getElementById('comparison-panel'),
  comparisonStatus: document.getElementById('comparison-status'),
};

let classementCourant = [];

function redistributeWeights(key, nextValue) {
  const newValue = Math.max(0, Math.min(100, Math.round(nextValue)));
  const keys = Object.keys(state.poids);
  const others = keys.filter((k) => k !== key);
  const remainingTarget = 100 - newValue;

  const currentOtherTotal = others.reduce((sum, k) => sum + state.poids[k], 0);
  const next = { ...state.poids, [key]: newValue };

  if (remainingTarget <= 0 || currentOtherTotal <= 0) {
    others.forEach((k) => {
      next[k] = 0;
    });
    state.poids = next;
    return;
  }

  const provisional = others.map((k) => {
    const exact = (state.poids[k] / currentOtherTotal) * remainingTarget;
    return { key: k, floor: Math.floor(exact), remainder: exact - Math.floor(exact) };
  });

  provisional.forEach((entry) => {
    next[entry.key] = entry.floor;
  });

  let missing = 100 - Object.values(next).reduce((a, b) => a + b, 0);
  provisional.sort((a, b) => b.remainder - a.remainder);

  let idx = 0;
  while (missing > 0) {
    next[provisional[idx % provisional.length].key] += 1;
    missing -= 1;
    idx += 1;
  }

  state.poids = next;
}

function computeBounds(items, key) {
  const values = items.map((item) => item[key]);
  return { min: Math.min(...values), max: Math.max(...values) };
}

function normalize(value, key, bounds) {
  const { min, max } = bounds[key];
  if (max === min) return 1;

  if (criteres[key].direction === 'min') {
    return (max - value) / (max - min);
  }

  return (value - min) / (max - min);
}

function evaluerNiveau(score) {
  if (score >= 0.72) return { label: 'Recommande', className: 'good' };
  if (score >= 0.55) return { label: 'A etudier', className: 'ok' };
  return { label: 'Faible adequation', className: 'low' };
}

function filtrerLogements() {
  return logements.filter((logement) => {
    if (logement.loyer > state.filtres.loyerMax) return false;
    if (logement.distance > state.filtres.distanceMax) return false;
    if (logement.surface < state.filtres.surfaceMin) return false;
    if (state.filtres.meubleOnly && !logement.meuble) return false;
    return true;
  });
}

function calculerClassement() {
  const candidates = filtrerLogements();
  if (candidates.length === 0) return [];

  const bounds = {
    loyer: computeBounds(candidates, 'loyer'),
    distance: computeBounds(candidates, 'distance'),
    surface: computeBounds(candidates, 'surface'),
    transport: computeBounds(candidates, 'transport'),
    securite: computeBounds(candidates, 'securite'),
  };

  return candidates
    .map((item) => {
      const norm = {
        loyer: normalize(item.loyer, 'loyer', bounds),
        distance: normalize(item.distance, 'distance', bounds),
        surface: normalize(item.surface, 'surface', bounds),
        transport: normalize(item.transport, 'transport', bounds),
        securite: normalize(item.securite, 'securite', bounds),
      };

      const score =
        norm.loyer * (state.poids.loyer / 100) +
        norm.distance * (state.poids.distance / 100) +
        norm.surface * (state.poids.surface / 100) +
        norm.transport * (state.poids.transport / 100) +
        norm.securite * (state.poids.securite / 100);

      return {
        ...item,
        normalized: norm,
        score,
        niveau: evaluerNiveau(score),
      };
    })
    .sort((a, b) => b.score - a.score)
    .map((item, idx) => ({ ...item, rang: idx + 1 }));
}

function renderSliders() {
  const rows = Object.entries(state.poids)
    .map(([key, value]) => {
      return `
        <div class="slider-item">
          <div class="slider-row">
            <span>${criteres[key].label}</span>
            <b>${value}%</b>
          </div>
          <input type="range" min="0" max="100" step="1" value="${value}" data-weight="${key}" />
        </div>
      `;
    })
    .join('');

  ids.weightSliders.innerHTML = rows;
  ids.weightTotal.textContent = `${Object.values(state.poids).reduce((a, b) => a + b, 0)}%`;

  ids.weightSliders.querySelectorAll('input[data-weight]').forEach((input) => {
    input.addEventListener('input', (event) => {
      const key = event.target.dataset.weight;
      redistributeWeights(key, Number(event.target.value));
      renderAll();
    });
  });
}

function renderMap(data) {
  const svg = ids.tradeoffMap;
  const width = 1000;
  const height = 320;
  const padX = 72;
  const padY = 35;

  if (data.length === 0) {
    svg.innerHTML = '';
    return;
  }

  const loyerMin = Math.min(...data.map((d) => d.loyer));
  const loyerMax = Math.max(...data.map((d) => d.loyer));
  const scoreMin = Math.min(...data.map((d) => d.score));
  const scoreMax = Math.max(...data.map((d) => d.score));

  const x = (v) => padX + ((v - loyerMin) / Math.max(1, loyerMax - loyerMin)) * (width - padX * 1.5);
  const y = (v) => (height - padY) - ((v - scoreMin) / Math.max(1e-6, scoreMax - scoreMin)) * (height - padY * 2);

  const axis = `
    <line x1="${padX}" y1="${height - padY}" x2="${width - 18}" y2="${height - padY}" stroke="#c7b8a7" />
    <line x1="${padX}" y1="${height - padY}" x2="${padX}" y2="${padY / 2}" stroke="#c7b8a7" />
    <text x="${width - 25}" y="${height - 10}" font-size="11" fill="#677786" text-anchor="end">Loyer</text>
    <text x="14" y="${padY}" font-size="11" fill="#677786" transform="rotate(-90 14 ${padY})">Score</text>
  `;

  const points = data
    .map((item) => {
      const px = x(item.loyer);
      const py = y(item.score);
      const radius = 4 + item.score * 3.6;
      return `
        <g>
          <circle cx="${px}" cy="${py}" r="${radius.toFixed(1)}" fill="rgba(15,118,110,0.28)" stroke="#0f766e" />
          <text x="${px + 7}" y="${py - 6}" font-size="10" fill="#354b5a">#${item.rang}</text>
        </g>
      `;
    })
    .join('');

  svg.innerHTML = `${axis}${points}`;
}

function renderList(data) {
  if (data.length === 0) {
    ids.housingList.innerHTML = '<div class="empty">Aucun logement ne correspond aux filtres actifs.</div>';
    ids.resultSummary.textContent = 'Essayez d assouplir les filtres ou de changer les poids.';
    return;
  }

  ids.resultSummary.textContent = `Top actuel: ${data[0].nom} (${(data[0].score * 100).toFixed(1)}%).`;

  ids.housingList.innerHTML = data
    .map((item) => {
      const scorePct = (item.score * 100).toFixed(1);
      const progress = Math.max(2, Math.round(item.score * 100));
      const isCompared = state.comparisonIds.includes(item.id);
      return `
        <article class="housing-card">
          <div class="housing-top">
            <div>
              <h3 class="housing-title">#${item.rang} ${item.nom}</h3>
              <p class="housing-meta">${item.quartier} · ${item.meuble ? 'Meuble' : 'Non meuble'} · ${item.distance} min campus</p>
            </div>
            <div>
              <span class="badge ${item.niveau.className}">${item.niveau.label}</span>
              <div style="margin-top:6px;text-align:right;">
                <button class="compare-btn ${isCompared ? 'off' : 'on'}" data-compare-id="${item.id}">
                  ${isCompared ? 'Retirer' : 'Comparer'}
                </button>
              </div>
            </div>
          </div>

          <div class="metric-grid">
            <div class="metric"><span>Loyer</span><strong>${item.loyer} EUR</strong></div>
            <div class="metric"><span>Surface</span><strong>${item.surface} m2</strong></div>
            <div class="metric"><span>Transport</span><strong>${item.transport}/10</strong></div>
            <div class="metric"><span>Securite</span><strong>${item.securite}/10</strong></div>
            <div class="metric"><span>Score SAW</span><strong>${scorePct}%</strong></div>
          </div>

          <div class="progress-track"><div class="progress-fill" style="width:${progress}%"></div></div>
        </article>
      `;
    })
    .join('');

  ids.housingList.querySelectorAll('button[data-compare-id]').forEach((button) => {
    button.addEventListener('click', () => {
      toggleComparison(button.dataset.compareId);
    });
  });
}

function toggleComparison(id) {
  if (!id) return;

  if (state.comparisonIds.includes(id)) {
    state.comparisonIds = state.comparisonIds.filter((currentId) => currentId !== id);
    renderAll();
    return;
  }

  if (state.comparisonIds.length >= 3) {
    alert('Maximum 3 logements en comparaison.');
    return;
  }

  state.comparisonIds = [...state.comparisonIds, id];
  renderAll();
}

function renderComparison(data) {
  const compared = state.comparisonIds
    .map((id) => data.find((item) => item.id === id))
    .filter((item) => Boolean(item));

  if (compared.length === 0) {
    ids.comparisonStatus.textContent = 'Selectionnez des logements depuis le classement.';
    ids.comparisonPanel.innerHTML = '<div class="empty">Aucune comparaison active.</div>';
    return;
  }

  ids.comparisonStatus.textContent = `${compared.length}/3 logement(s) selectionne(s).`;

  ids.comparisonPanel.innerHTML = compared
    .map((item) => {
      return `
        <article class="comparison-item">
          <div class="comparison-item-top">
            <div>
              <h4 class="comparison-name">${item.nom}</h4>
              <p class="comparison-meta">${item.quartier} · Rang #${item.rang}</p>
            </div>
            <span class="badge ${item.niveau.className}">${(item.score * 100).toFixed(1)}%</span>
          </div>
          <div class="comparison-grid">
            <div><span>Loyer</span><strong>${item.loyer} EUR</strong></div>
            <div><span>Distance</span><strong>${item.distance} min</strong></div>
            <div><span>Surface</span><strong>${item.surface} m2</strong></div>
            <div><span>Transport</span><strong>${item.transport}/10</strong></div>
            <div><span>Securite</span><strong>${item.securite}/10</strong></div>
          </div>
        </article>
      `;
    })
    .join('');
}

function exportCsv(data) {
  if (data.length === 0) {
    alert('Aucune donnee a exporter.');
    return;
  }

  const headers = ['Rang', 'Logement', 'Quartier', 'Loyer_EUR', 'Distance_min', 'Surface_m2', 'Transport_10', 'Securite_10', 'Meuble', 'Score_pct'];
  const rows = data.map((item) => [
    item.rang,
    item.nom,
    item.quartier,
    item.loyer,
    item.distance,
    item.surface,
    item.transport,
    item.securite,
    item.meuble ? 'Oui' : 'Non',
    (item.score * 100).toFixed(2),
  ]);

  const csvContent = [headers.join(';'), ...rows.map((row) => row.join(';'))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'classement-logements-saw.csv';
  link.click();
  URL.revokeObjectURL(url);
}

function exportPdf(data) {
  if (data.length === 0) {
    alert('Aucune donnee a exporter.');
    return;
  }

  const rows = data
    .map((item) => `<tr><td>${item.rang}</td><td>${item.nom}</td><td>${item.quartier}</td><td>${item.loyer} EUR</td><td>${item.distance} min</td><td>${item.surface} m2</td><td>${(item.score * 100).toFixed(1)}%</td></tr>`)
    .join('');

  const popup = window.open('', '_blank', 'width=980,height=760');
  if (!popup) return;

  popup.document.write(`
    <html>
      <head>
        <title>Rapport logements SAW</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #17242f; }
          h1 { margin-bottom: 10px; }
          .meta { color: #5f707e; margin-bottom: 14px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #d7c7b5; padding: 8px; font-size: 12px; }
          th { background: #f4ece2; text-align: left; }
        </style>
      </head>
      <body>
        <h1>Rapport de classement logements - SAW</h1>
        <p class="meta">Genere le ${new Date().toLocaleString('fr-FR')}</p>
        <table>
          <thead>
            <tr><th>Rang</th><th>Logement</th><th>Quartier</th><th>Loyer</th><th>Distance</th><th>Surface</th><th>Score</th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </body>
    </html>
  `);
  popup.document.close();
  popup.focus();
  popup.print();
}

function renderBadges(data) {
  ids.badgeCount.textContent = `${data.length} logements analyses`;
  const strong = data.filter((item) => item.niveau.className === 'good').length;
  ids.badgeStrong.textContent = `${strong} recommandations fortes`;

  // Approximation du front de compromis: meilleurs scores dans chaque quartile de loyer.
  const quartiles = new Set();
  data.forEach((item) => {
    const q = Math.floor(item.loyer / 200);
    if (!quartiles.has(q)) quartiles.add(q);
  });
  ids.badgePareto.textContent = `${quartiles.size} zones de compromis`;
}

function renderAll() {
  renderSliders();

  ids.rentMaxLabel.textContent = `${state.filtres.loyerMax}`;
  ids.distanceMaxLabel.textContent = `${state.filtres.distanceMax}`;
  ids.surfaceMinLabel.textContent = `${state.filtres.surfaceMin}`;

  const classement = calculerClassement();
  classementCourant = classement;

  // Nettoie automatiquement les selections de comparaison qui ne sont plus dans les filtres.
  state.comparisonIds = state.comparisonIds.filter((id) => classement.some((item) => item.id === id));

  renderMap(classement);
  renderList(classement);
  renderBadges(classement);
  renderComparison(classement);
}

function applyPreset(name) {
  if (name === 'balanced') {
    state.poids = { loyer: 30, distance: 20, surface: 20, transport: 15, securite: 15 };
  }
  if (name === 'budget') {
    state.poids = { loyer: 50, distance: 25, surface: 10, transport: 8, securite: 7 };
  }
  if (name === 'comfort') {
    state.poids = { loyer: 15, distance: 10, surface: 30, transport: 15, securite: 30 };
  }
  renderAll();
}

function wireEvents() {
  ids.rentMax.addEventListener('input', (event) => {
    state.filtres.loyerMax = Number(event.target.value);
    renderAll();
  });

  ids.distanceMax.addEventListener('input', (event) => {
    state.filtres.distanceMax = Number(event.target.value);
    renderAll();
  });

  ids.surfaceMin.addEventListener('input', (event) => {
    state.filtres.surfaceMin = Number(event.target.value);
    renderAll();
  });

  ids.furnishedOnly.addEventListener('change', (event) => {
    state.filtres.meubleOnly = event.target.checked;
    renderAll();
  });

  document.querySelectorAll('.preset-btn').forEach((button) => {
    button.addEventListener('click', () => applyPreset(button.dataset.preset));
  });

  ids.exportCsv.addEventListener('click', () => exportCsv(classementCourant));
  ids.exportPdf.addEventListener('click', () => exportPdf(classementCourant));
}

wireEvents();
renderAll();
