const DEFAULT_ACCOUNT = { email: 'groupe.logement@adomc.demo', password: 'adomc2026' };
const SESSION_KEY = 'adomc-logement-session';
const USERS_KEY = 'adomc-logement-users';
const SCENARIOS_KEY = 'adomc-logement-scenarios';
const THEME_KEY = 'adomc-logement-theme';

const CRITERIA = {
  rent: { label: 'Loyer', direction: 'min' },
  travel: { label: 'Distance', direction: 'min' },
  surface: { label: 'Surface', direction: 'max' },
  safety: { label: 'Securite', direction: 'max' },
  internet: { label: 'Internet', direction: 'max' },
};

const SYSTEM_WEIGHTS = {
  rent: 35,
  travel: 20,
  surface: 20,
  safety: 15,
  internet: 10,
};

const DEFAULT_WEIGHTS = {
  rent: 30,
  travel: 20,
  surface: 20,
  safety: 15,
  internet: 15,
};

const PRESETS = [
  {
    label: 'Equilibre',
    description: 'Compromis general entre cout, distance et confort.',
    weights: { rent: 30, travel: 20, surface: 20, safety: 15, internet: 15 },
    filters: { budgetMax: 1200, travelMax: 40, surfaceMin: 25, city: 'Tous', furnishedOnly: false, recommendedOnly: false },
  },
  {
    label: 'Budget',
    description: 'Maximiser la maitrise du loyer.',
    weights: { rent: 52, travel: 23, surface: 10, safety: 8, internet: 7 },
    filters: { budgetMax: 850, travelMax: 45, surfaceMin: 18, city: 'Tous', furnishedOnly: false, recommendedOnly: false },
  },
  {
    label: 'Confort',
    description: 'Prioriser surface, securite et qualite internet.',
    weights: { rent: 15, travel: 10, surface: 30, safety: 25, internet: 20 },
    filters: { budgetMax: 1700, travelMax: 35, surfaceMin: 35, city: 'Tous', furnishedOnly: false, recommendedOnly: false },
  },
  {
    label: 'Mobilite',
    description: 'Favoriser les logements proches et bien connectes.',
    weights: { rent: 22, travel: 38, surface: 14, safety: 10, internet: 16 },
    filters: { budgetMax: 1300, travelMax: 25, surfaceMin: 22, city: 'Tous', furnishedOnly: true, recommendedOnly: false },
  },
];

const state = {
  activeSection: 'overview',
  weights: { ...DEFAULT_WEIGHTS },
  budgetMax: 1200,
  travelMax: 40,
  surfaceMin: 25,
  city: 'Tous',
  furnishedOnly: false,
  recommendedOnly: false,
  showCatalog: false,
  sortKey: 'rank',
  sortDirection: 'asc',
  pageSize: 10,
  currentPage: 1,
  selectedIds: [],
  scenarios: [],
  shareStatus: '',
  showDominated: true,
  paretoRentCap: 1200,
  sensitivityCriterion: 'rent',
  sensitivityFocusId: '',
  sensitivityReferenceId: '',
  autoCompared: false,
  guideNotes: [
    'Bienvenue: utilisez le pre-guide pour generer une configuration adaptee au profil locataire.',
    'Le dashboard charge un catalogue massif pour faciliter la comparaison de modeles.',
  ],
};

const citySeeds = [
  { city: 'Antananarivo', country: 'Madagascar', rentFactor: 0.85, travelBias: 0.9, safety: 7.0, internet: 7.1 },
  { city: 'Nairobi', country: 'Kenya', rentFactor: 1.1, travelBias: 1.0, safety: 6.8, internet: 7.4 },
  { city: 'Mombasa', country: 'Kenya', rentFactor: 0.98, travelBias: 1.12, safety: 6.4, internet: 6.9 },
  { city: 'Casablanca', country: 'Maroc', rentFactor: 1.15, travelBias: 0.85, safety: 7.2, internet: 7.6 },
  { city: 'Rabat', country: 'Maroc', rentFactor: 1.06, travelBias: 0.89, safety: 7.5, internet: 7.8 },
  { city: 'Dakar', country: 'Senegal', rentFactor: 0.95, travelBias: 1.1, safety: 6.9, internet: 6.8 },
  { city: 'Abidjan', country: 'Cote d Ivoire', rentFactor: 0.92, travelBias: 1.08, safety: 6.6, internet: 6.7 },
  { city: 'Paris', country: 'France', rentFactor: 1.95, travelBias: 0.8, safety: 7.8, internet: 8.9 },
  { city: 'Lyon', country: 'France', rentFactor: 1.45, travelBias: 0.78, safety: 8.1, internet: 8.8 },
  { city: 'Marseille', country: 'France', rentFactor: 1.28, travelBias: 0.94, safety: 7.0, internet: 8.5 },
  { city: 'Bruxelles', country: 'Belgique', rentFactor: 1.4, travelBias: 0.82, safety: 7.7, internet: 8.6 },
  { city: 'Amsterdam', country: 'Pays-Bas', rentFactor: 1.62, travelBias: 0.74, safety: 8.2, internet: 9.0 },
  { city: 'Berlin', country: 'Allemagne', rentFactor: 1.32, travelBias: 0.79, safety: 7.9, internet: 8.8 },
  { city: 'Madrid', country: 'Espagne', rentFactor: 1.26, travelBias: 0.9, safety: 7.4, internet: 8.2 },
  { city: 'Lisbon', country: 'Portugal', rentFactor: 1.22, travelBias: 0.86, safety: 7.8, internet: 8.3 },
  { city: 'Rome', country: 'Italie', rentFactor: 1.31, travelBias: 1.0, safety: 6.9, internet: 8.1 },
  { city: 'Istanbul', country: 'Turquie', rentFactor: 1.0, travelBias: 1.15, safety: 6.6, internet: 7.0 },
  { city: 'Athens', country: 'Grece', rentFactor: 1.05, travelBias: 1.02, safety: 6.8, internet: 7.6 },
  { city: 'Dubai', country: 'Emirats', rentFactor: 1.72, travelBias: 0.92, safety: 8.5, internet: 8.9 },
  { city: 'Doha', country: 'Qatar', rentFactor: 1.66, travelBias: 0.96, safety: 8.4, internet: 8.7 },
  { city: 'Montreal', country: 'Canada', rentFactor: 1.35, travelBias: 0.88, safety: 8.3, internet: 8.7 },
  { city: 'Toronto', country: 'Canada', rentFactor: 1.53, travelBias: 0.9, safety: 8.0, internet: 8.8 },
  { city: 'Vancouver', country: 'Canada', rentFactor: 1.62, travelBias: 0.86, safety: 8.4, internet: 8.9 },
  { city: 'Mexico City', country: 'Mexique', rentFactor: 1.05, travelBias: 1.25, safety: 6.2, internet: 6.9 },
  { city: 'Bogota', country: 'Colombie', rentFactor: 0.92, travelBias: 1.2, safety: 6.3, internet: 6.8 },
  { city: 'Sao Paulo', country: 'Bresil', rentFactor: 1.12, travelBias: 1.3, safety: 6.0, internet: 7.0 },
  { city: 'Buenos Aires', country: 'Argentine', rentFactor: 0.97, travelBias: 1.05, safety: 6.5, internet: 7.2 },
  { city: 'Bangkok', country: 'Thailande', rentFactor: 0.9, travelBias: 1.2, safety: 6.5, internet: 7.8 },
  { city: 'Jakarta', country: 'Indonesie', rentFactor: 0.84, travelBias: 1.3, safety: 5.9, internet: 6.5 },
  { city: 'Kuala Lumpur', country: 'Malaisie', rentFactor: 0.98, travelBias: 1.0, safety: 7.1, internet: 8.0 },
  { city: 'Singapore', country: 'Singapore', rentFactor: 2.15, travelBias: 0.7, safety: 9.2, internet: 9.4 },
  { city: 'Seoul', country: 'Coree du Sud', rentFactor: 1.5, travelBias: 0.76, safety: 8.7, internet: 9.4 },
  { city: 'Tokyo', country: 'Japon', rentFactor: 1.75, travelBias: 0.72, safety: 8.9, internet: 9.2 },
  { city: 'Sydney', country: 'Australie', rentFactor: 1.88, travelBias: 0.95, safety: 8.2, internet: 8.6 },
  { city: 'Auckland', country: 'Nouvelle Zelande', rentFactor: 1.68, travelBias: 0.92, safety: 8.5, internet: 8.5 },
];

const planSeeds = [
  { code: 'Micro', modelType: 'Studio', surface: 16, rentBase: 320, furnishedRate: 0.88, travelBase: 15 },
  { code: 'Compact', modelType: 'Studio', surface: 19, rentBase: 380, furnishedRate: 0.82, travelBase: 17 },
  { code: 'Studio', modelType: 'Studio', surface: 24, rentBase: 470, furnishedRate: 0.75, travelBase: 19 },
  { code: 'Studio+', modelType: 'Studio', surface: 28, rentBase: 560, furnishedRate: 0.7, travelBase: 20 },
  { code: 'OneBed', modelType: 'Appartement', surface: 32, rentBase: 610, furnishedRate: 0.6, travelBase: 22 },
  { code: 'OneBed+', modelType: 'Appartement', surface: 38, rentBase: 760, furnishedRate: 0.5, travelBase: 24 },
  { code: 'TwoBed', modelType: 'Appartement', surface: 46, rentBase: 920, furnishedRate: 0.45, travelBase: 27 },
  { code: 'Family', modelType: 'Appartement', surface: 58, rentBase: 1180, furnishedRate: 0.35, travelBase: 30 },
  { code: 'Loft', modelType: 'Loft', surface: 68, rentBase: 1370, furnishedRate: 0.42, travelBase: 25 },
  { code: 'Duplex', modelType: 'Duplex', surface: 82, rentBase: 1650, furnishedRate: 0.3, travelBase: 33 },
  { code: 'TownHouse', modelType: 'Maison', surface: 96, rentBase: 1920, furnishedRate: 0.25, travelBase: 35 },
  { code: 'Penthouse', modelType: 'Premium', surface: 112, rentBase: 2280, furnishedRate: 0.2, travelBase: 29 },
];

const districtSeeds = [
  { district: 'Centre', rentFactor: 1.18, travelBias: 0.75, safetyDelta: 0.4, internetDelta: 0.35, furnishedDelta: 0.08 },
  { district: 'Residentiel', rentFactor: 1.03, travelBias: 0.95, safetyDelta: 0.25, internetDelta: 0.12, furnishedDelta: 0.03 },
  { district: 'Peripherie', rentFactor: 0.86, travelBias: 1.22, safetyDelta: -0.25, internetDelta: -0.15, furnishedDelta: -0.05 },
];

const rankingColumns = [
  { key: 'rank', label: 'Rang' },
  { key: 'name', label: 'Logement' },
  { key: 'city', label: 'Ville' },
  { key: 'district', label: 'Zone' },
  { key: 'modelType', label: 'Modele' },
  { key: 'rent', label: 'Loyer' },
  { key: 'surface', label: 'Surface' },
  { key: 'travel', label: 'Distance' },
  { key: 'safety', label: 'Securite' },
  { key: 'internet', label: 'Internet' },
  { key: 'furnished', label: 'Meuble' },
  { key: 'weightedScore', label: 'Score' },
  { key: 'recommendationLevel', label: 'Avis' },
];

let dataset = [];
let currentRanking = [];
let currentFiltered = [];
let currentSorted = [];
let currentDisplay = [];
let ranges = { rentMin: 300, rentMax: 2600, travelMax: 90, surfaceMax: 120 };

function getEl(id) {
  return document.getElementById(id);
}

const els = {
  loginScreen: getEl('login-screen'),
  appShell: getEl('app-shell'),
  loginForm: getEl('login-form'),
  loginEmail: getEl('login-email'),
  loginPassword: getEl('login-password'),
  loginMessage: getEl('login-message'),
  sessionBadge: getEl('session-badge'),
  themeToggle: getEl('theme-toggle'),
  logoutBtn: getEl('logout-btn'),
  sidebarNav: getEl('sidebar-nav'),
  sections: Array.from(document.querySelectorAll('.section')),
  overviewCards: getEl('overview-cards'),
  guideForm: getEl('guide-form'),
  applyGuide: getEl('apply-guide'),
  guideNotes: getEl('guide-notes'),
  weightSliders: getEl('weight-sliders'),
  weightTotal: getEl('weight-total'),
  presetRow: getEl('preset-row'),
  budgetMax: getEl('budget-max'),
  travelMax: getEl('travel-max'),
  surfaceMin: getEl('surface-min'),
  budgetLabel: getEl('budget-label'),
  travelLabel: getEl('travel-label'),
  surfaceLabel: getEl('surface-label'),
  cityFilter: getEl('city-filter'),
  furnishedOnly: getEl('furnished-only'),
  recommendedOnly: getEl('recommended-only'),
  resetFilters: getEl('reset-filters'),
  scenarioName: getEl('scenario-name'),
  saveScenario: getEl('save-scenario'),
  scenarioList: getEl('scenario-list'),
  showDominated: getEl('show-dominated'),
  paretoCap: getEl('pareto-cap'),
  paretoCapLabel: getEl('pareto-cap-label'),
  paretoSvg: getEl('pareto-svg'),
  radarSvg: getEl('radar-svg'),
  rankingSummary: getEl('ranking-summary'),
  shareStatus: getEl('share-status'),
  shareConfig: getEl('share-config'),
  exportPdf: getEl('export-pdf'),
  exportCsv: getEl('export-csv'),
  showCatalog: getEl('show-catalog'),
  pageSize: getEl('page-size'),
  rankingHeadRow: getEl('ranking-head-row'),
  rankingBody: getEl('ranking-body'),
  prevPage: getEl('prev-page'),
  nextPage: getEl('next-page'),
  pageIndicator: getEl('page-indicator'),
  comparisonAdd: getEl('comparison-add'),
  comparisonAddBtn: getEl('comparison-add-btn'),
  comparisonClear: getEl('comparison-clear'),
  comparisonList: getEl('comparison-list'),
  sensitivityCriterion: getEl('sensitivity-criterion'),
  sensitivityFocus: getEl('sensitivity-focus'),
  sensitivityReference: getEl('sensitivity-reference'),
  sensitivitySvg: getEl('sensitivity-svg'),
  sensitivitySummary: getEl('sensitivity-summary'),
  calcsList: getEl('calcs-list'),
};

function ensureDefaultUser() {
  if (typeof window === 'undefined') return;
  const raw = window.localStorage.getItem(USERS_KEY);
  const parsedUsers = raw ? safeParse(raw, []) : [];
  const users = Array.isArray(parsedUsers) ? parsedUsers : [];
  if (!users.some((user) => String(user.email).toLowerCase() === DEFAULT_ACCOUNT.email.toLowerCase())) {
    users.push({ email: DEFAULT_ACCOUNT.email, password: DEFAULT_ACCOUNT.password });
    window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
}

function safeParse(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function getSession() {
  return window.localStorage.getItem(SESSION_KEY);
}

function setSession(email) {
  window.localStorage.setItem(SESSION_KEY, email);
}

function clearSession() {
  window.localStorage.removeItem(SESSION_KEY);
}

function applyTheme(themeName) {
  const theme = themeName === 'minimal' ? 'minimal' : 'corporate';
  if (theme === 'minimal') {
    document.body.setAttribute('data-theme', 'minimal');
  } else {
    document.body.removeAttribute('data-theme');
  }

  if (els.themeToggle) {
    if (theme === 'minimal') {
      els.themeToggle.innerHTML = '<i class="fa-solid fa-building"></i> Theme Corporate';
    } else {
      els.themeToggle.innerHTML = '<i class="fa-solid fa-palette"></i> Theme Minimal';
    }
  }
}

function initTheme() {
  const savedTheme = window.localStorage.getItem(THEME_KEY) || 'corporate';
  applyTheme(savedTheme);
}

function toggleTheme() {
  const isMinimal = document.body.getAttribute('data-theme') === 'minimal';
  const next = isMinimal ? 'corporate' : 'minimal';
  applyTheme(next);
  window.localStorage.setItem(THEME_KEY, next);
}

function showApp(sessionEmail) {
  els.loginScreen.classList.add('hidden');
  els.appShell.classList.remove('hidden');
  els.sessionBadge.textContent = `Session: ${sessionEmail}`;
}

function showLogin() {
  els.appShell.classList.add('hidden');
  els.loginScreen.classList.remove('hidden');
}

function initAuth() {
  ensureDefaultUser();
  const session = getSession();
  if (session) {
    showApp(session);
  } else {
    showLogin();
  }

  els.loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const email = String(els.loginEmail.value || '').trim().toLowerCase();
    const password = String(els.loginPassword.value || '');
    const users = safeParse(window.localStorage.getItem(USERS_KEY), []);
    const match = users.find((user) => String(user.email).toLowerCase() === email && user.password === password);
    if (!match) {
      els.loginMessage.textContent = 'Identifiants invalides.';
      return;
    }
    setSession(email);
    els.loginMessage.textContent = '';
    showApp(email);
    renderAll();
  });

  els.logoutBtn.addEventListener('click', () => {
    clearSession();
    showLogin();
  });
}

function generateDataset() {
  const listings = [];
  let id = 1;

  citySeeds.forEach((citySeed, cityIndex) => {
    planSeeds.forEach((planSeed, planIndex) => {
      districtSeeds.forEach((districtSeed, districtIndex) => {
        const wave = ((cityIndex * 17 + planIndex * 11 + districtIndex * 13) % 11) - 5;
        const quality = ((cityIndex * 13 + planIndex * 7 + districtIndex * 9) % 9) - 4;

        const rent = Math.round((planSeed.rentBase * citySeed.rentFactor * districtSeed.rentFactor) + wave * 13 + quality * 9);
        const surface = Math.max(14, Math.round(planSeed.surface + quality * 2.1 + (cityIndex % 4) + districtIndex));
        const travel = Math.max(6, Math.round((planSeed.travelBase * citySeed.travelBias * districtSeed.travelBias) + wave));
        const safety = clampNumber(citySeed.safety + districtSeed.safetyDelta + quality * 0.24 + (planIndex % 3) * 0.12, 4.2, 9.8, 1);
        const internet = clampNumber(citySeed.internet + districtSeed.internetDelta + (planIndex % 4) * 0.2 - (cityIndex % 6) * 0.08, 5.0, 9.9, 1);
        const furnishedChance = planSeed.furnishedRate + districtSeed.furnishedDelta + ((cityIndex + planIndex) % 6) * 0.025;
        const furnished = furnishedChance > 0.56;

        listings.push({
          id: `H${id}`,
          name: `${planSeed.code} ${districtSeed.district}`,
          modelType: planSeed.modelType,
          district: districtSeed.district,
          city: citySeed.city,
          country: citySeed.country,
          rent,
          surface,
          travel,
          safety,
          internet,
          furnished,
        });

        id += 1;
      });
    });
  });

  return listings;
}

function clampNumber(value, min, max, decimals = 0) {
  const limited = Math.min(max, Math.max(min, value));
  if (decimals === 0) return Math.round(limited);
  return Number(limited.toFixed(decimals));
}

function computeRanges() {
  const rents = dataset.map((item) => item.rent);
  const travels = dataset.map((item) => item.travel);
  const surfaces = dataset.map((item) => item.surface);
  ranges = {
    rentMin: Math.min(...rents),
    rentMax: Math.max(...rents),
    travelMax: Math.max(...travels),
    surfaceMax: Math.max(...surfaces),
  };

  state.budgetMax = Math.min(1200, ranges.rentMax);
  state.travelMax = Math.min(40, ranges.travelMax);
  state.surfaceMin = Math.max(18, Math.floor(ranges.surfaceMax * 0.2));
  state.paretoRentCap = state.budgetMax;
}

function initControls() {
  els.budgetMax.min = String(ranges.rentMin);
  els.budgetMax.max = String(ranges.rentMax);
  els.budgetMax.value = String(state.budgetMax);

  els.travelMax.min = '5';
  els.travelMax.max = String(ranges.travelMax);
  els.travelMax.value = String(state.travelMax);

  els.surfaceMin.min = '15';
  els.surfaceMin.max = String(ranges.surfaceMax);
  els.surfaceMin.value = String(state.surfaceMin);

  els.paretoCap.min = String(ranges.rentMin);
  els.paretoCap.max = String(ranges.rentMax);
  els.paretoCap.value = String(state.paretoRentCap);

  const uniqueCities = ['Tous', ...Array.from(new Set(dataset.map((item) => item.city))).sort((a, b) => a.localeCompare(b))];
  els.cityFilter.innerHTML = uniqueCities.map((city) => `<option value="${city}">${city}</option>`).join('');

  const pageSizes = [];
  for (let i = 5; i <= 50; i += 5) pageSizes.push(i);
  els.pageSize.innerHTML = pageSizes.map((value) => `<option value="${value}">${value}</option>`).join('');
  els.pageSize.value = String(state.pageSize);

  els.sensitivityCriterion.innerHTML = Object.entries(CRITERIA)
    .map(([key, value]) => `<option value="${key}">${value.label}</option>`)
    .join('');

  renderPresetButtons();
  renderRankingHeader();
  loadScenarios();
}

function renderPresetButtons() {
  els.presetRow.innerHTML = PRESETS.map((preset, index) => `<button type="button" data-preset-index="${index}">${preset.label}</button>`).join('');
  els.presetRow.querySelectorAll('button[data-preset-index]').forEach((button) => {
    button.addEventListener('click', () => {
      applyPreset(Number(button.dataset.presetIndex));
    });
  });
}

function renderWeightSliders() {
  els.weightSliders.innerHTML = Object.entries(state.weights)
    .map(([key, value]) => {
      return `
        <div class="slider-item">
          <div class="slider-row"><span>${CRITERIA[key].label}</span><strong>${value}%</strong></div>
          <input type="range" min="0" max="100" value="${value}" data-weight="${key}" />
        </div>
      `;
    })
    .join('');

  const total = Object.values(state.weights).reduce((sum, value) => sum + value, 0);
  els.weightTotal.textContent = `${total}%`;

  els.weightSliders.querySelectorAll('input[data-weight]').forEach((input) => {
    input.addEventListener('input', (event) => {
      const key = event.target.dataset.weight;
      redistributeWeights(key, Number(event.target.value));
      state.currentPage = 1;
      renderAll();
    });
  });
}

function redistributeWeights(key, nextValue) {
  const clamped = Math.max(0, Math.min(100, Math.round(nextValue)));
  const keys = Object.keys(state.weights);
  const others = keys.filter((currentKey) => currentKey !== key);
  const remainingTarget = 100 - clamped;
  const currentTotal = others.reduce((sum, currentKey) => sum + state.weights[currentKey], 0);

  const next = { ...state.weights, [key]: clamped };

  if (remainingTarget <= 0 || currentTotal <= 0) {
    others.forEach((currentKey) => {
      next[currentKey] = 0;
    });
    state.weights = next;
    return;
  }

  const allocations = others.map((currentKey) => {
    const exact = (state.weights[currentKey] / currentTotal) * remainingTarget;
    const floored = Math.floor(exact);
    return {
      key: currentKey,
      value: floored,
      remainder: exact - floored,
    };
  });

  allocations.forEach((entry) => {
    next[entry.key] = entry.value;
  });

  let missing = 100 - Object.values(next).reduce((sum, value) => sum + value, 0);
  allocations.sort((a, b) => b.remainder - a.remainder);
  let cursor = 0;
  while (missing > 0) {
    next[allocations[cursor % allocations.length].key] += 1;
    cursor += 1;
    missing -= 1;
  }

  state.weights = next;
}

function normalizeValue(value, min, max, direction) {
  if (max === min) return 1;
  if (direction === 'min') return (max - value) / (max - min);
  return (value - min) / (max - min);
}

function computeFullRanking(weights) {
  const rentMin = Math.min(...dataset.map((item) => item.rent));
  const rentMax = Math.max(...dataset.map((item) => item.rent));
  const travelMin = Math.min(...dataset.map((item) => item.travel));
  const travelMax = Math.max(...dataset.map((item) => item.travel));
  const surfaceMin = Math.min(...dataset.map((item) => item.surface));
  const surfaceMax = Math.max(...dataset.map((item) => item.surface));
  const safetyMin = Math.min(...dataset.map((item) => item.safety));
  const safetyMax = Math.max(...dataset.map((item) => item.safety));
  const internetMin = Math.min(...dataset.map((item) => item.internet));
  const internetMax = Math.max(...dataset.map((item) => item.internet));

  const normalized = dataset.map((item) => {
    const normalizedScores = {
      rent: normalizeValue(item.rent, rentMin, rentMax, 'min'),
      travel: normalizeValue(item.travel, travelMin, travelMax, 'min'),
      surface: normalizeValue(item.surface, surfaceMin, surfaceMax, 'max'),
      safety: normalizeValue(item.safety, safetyMin, safetyMax, 'max'),
      internet: normalizeValue(item.internet, internetMin, internetMax, 'max'),
    };

    const weightedScore =
      normalizedScores.rent * (weights.rent / 100) +
      normalizedScores.travel * (weights.travel / 100) +
      normalizedScores.surface * (weights.surface / 100) +
      normalizedScores.safety * (weights.safety / 100) +
      normalizedScores.internet * (weights.internet / 100);

    const recommendationScore =
      normalizedScores.rent * (SYSTEM_WEIGHTS.rent / 100) +
      normalizedScores.travel * (SYSTEM_WEIGHTS.travel / 100) +
      normalizedScores.surface * (SYSTEM_WEIGHTS.surface / 100) +
      normalizedScores.safety * (SYSTEM_WEIGHTS.safety / 100) +
      normalizedScores.internet * (SYSTEM_WEIGHTS.internet / 100);

    let recommendationLevel = 'Faible adequation';
    if (recommendationScore >= 0.7) recommendationLevel = 'Recommande';
    else if (recommendationScore >= 0.55) recommendationLevel = 'A etudier';

    return {
      ...item,
      normalizedScores,
      weightedScore,
      recommendationScore,
      recommendationLevel,
      isParetoOptimal: false,
    };
  });

  markParetoOptimal(normalized);

  return normalized
    .sort((a, b) => b.weightedScore - a.weightedScore)
    .map((item, index) => ({ ...item, rank: index + 1 }));
}

function markParetoOptimal(items) {
  for (let i = 0; i < items.length; i += 1) {
    let dominated = false;
    for (let j = 0; j < items.length; j += 1) {
      if (i === j) continue;
      if (dominates(items[j], items[i])) {
        dominated = true;
        break;
      }
    }
    items[i].isParetoOptimal = !dominated;
  }
}

function dominates(a, b) {
  const betterOrEqual =
    a.rent <= b.rent &&
    a.travel <= b.travel &&
    a.surface >= b.surface &&
    a.safety >= b.safety &&
    a.internet >= b.internet;

  const strictlyBetter =
    a.rent < b.rent ||
    a.travel < b.travel ||
    a.surface > b.surface ||
    a.safety > b.safety ||
    a.internet > b.internet;

  return betterOrEqual && strictlyBetter;
}

function applyFilters(ranking) {
  return ranking.filter((item) => {
    if (item.rent > state.budgetMax) return false;
    if (item.travel > state.travelMax) return false;
    if (item.surface < state.surfaceMin) return false;
    if (state.city !== 'Tous' && item.city !== state.city) return false;
    if (state.furnishedOnly && !item.furnished) return false;
    if (state.recommendedOnly && item.recommendationLevel !== 'Recommande') return false;
    return true;
  });
}

function sortRanking(items) {
  const sorted = [...items].sort((left, right) => {
    if (state.sortKey === 'rank') return left.rank - right.rank;
    if (state.sortKey === 'name') return left.name.localeCompare(right.name);
    if (state.sortKey === 'city') return left.city.localeCompare(right.city);
    if (state.sortKey === 'district') return left.district.localeCompare(right.district);
    if (state.sortKey === 'modelType') return left.modelType.localeCompare(right.modelType);
    if (state.sortKey === 'furnished') return Number(left.furnished) - Number(right.furnished);
    if (state.sortKey === 'recommendationLevel') return left.recommendationLevel.localeCompare(right.recommendationLevel);
    return Number(left[state.sortKey]) - Number(right[state.sortKey]);
  });

  if (state.sortDirection === 'desc') sorted.reverse();
  return sorted;
}

function updateRankingContext() {
  currentRanking = computeFullRanking(state.weights);
  currentFiltered = applyFilters(currentRanking);
  const source = state.showCatalog ? currentRanking : currentFiltered;
  currentSorted = sortRanking(source);

  const totalPages = Math.max(1, Math.ceil(currentSorted.length / state.pageSize));
  state.currentPage = Math.min(state.currentPage, totalPages);
  const start = (state.currentPage - 1) * state.pageSize;
  currentDisplay = currentSorted.slice(start, start + state.pageSize);

  state.selectedIds = state.selectedIds.filter((id) => currentRanking.some((item) => item.id === id));

  const focusFallback = currentFiltered[0]?.id || currentRanking[0]?.id || '';
  const referenceFallback = currentFiltered[1]?.id || currentRanking[1]?.id || focusFallback;

  if (!state.autoCompared && state.selectedIds.length === 0 && currentFiltered.length > 0) {
    state.selectedIds = currentFiltered.slice(0, 2).map((item) => item.id);
    state.autoCompared = true;
  }

  if (!currentRanking.some((item) => item.id === state.sensitivityFocusId)) state.sensitivityFocusId = focusFallback;
  if (!currentRanking.some((item) => item.id === state.sensitivityReferenceId)) state.sensitivityReferenceId = referenceFallback;
}

function setActiveSection(section) {
  state.activeSection = section;
  els.sections.forEach((node) => {
    node.classList.toggle('active', node.id === `section-${section}`);
  });
  els.sidebarNav.querySelectorAll('.nav-btn').forEach((button) => {
    button.classList.toggle('active', button.dataset.section === section);
  });
}

function renderOverview() {
  const recommended = currentFiltered.filter((item) => item.recommendationLevel === 'Recommande').length;
  const pareto = currentFiltered.filter((item) => item.isParetoOptimal).length;
  const compared = state.selectedIds.length;
  const avgScore = currentFiltered.length > 0
    ? (currentFiltered.reduce((sum, item) => sum + item.weightedScore, 0) / currentFiltered.length) * 100
    : 0;

  els.overviewCards.innerHTML = `
    <div class="stat-card"><i class="fa-solid fa-earth-africa stat-icon"></i><p class="stat-label">Catalogue total</p><strong>${dataset.length}</strong></div>
    <div class="stat-card"><i class="fa-solid fa-sliders stat-icon"></i><p class="stat-label">Logements filtres</p><strong>${currentFiltered.length}</strong></div>
    <div class="stat-card"><i class="fa-solid fa-chart-line stat-icon"></i><p class="stat-label">Pareto optimaux</p><strong>${pareto}</strong></div>
    <div class="stat-card"><i class="fa-solid fa-circle-check stat-icon"></i><p class="stat-label">Recommandes</p><strong>${recommended}</strong></div>
    <div class="stat-card"><i class="fa-solid fa-scale-balanced stat-icon"></i><p class="stat-label">Comparaison active</p><strong>${compared}/3</strong></div>
    <div class="stat-card"><i class="fa-solid fa-gauge-high stat-icon"></i><p class="stat-label">Score moyen filtre</p><strong>${avgScore.toFixed(1)}%</strong></div>
  `;
}

function renderGuideNotes() {
  if (state.guideNotes.length === 0) {
    els.guideNotes.innerHTML = '<div class="empty">Aucune configuration guide appliquee pour le moment.</div>';
    return;
  }

  els.guideNotes.innerHTML = `<ul>${state.guideNotes.map((note) => `<li>${note}</li>`).join('')}</ul>`;
}

function applyGuideProfile() {
  const profile = getEl('guide-profile').value;
  const priority = getEl('guide-priority').value;
  const budget = Math.max(200, Number(getEl('guide-budget').value || 900));
  const distance = Math.max(5, Number(getEl('guide-distance').value || 35));
  const furnished = getEl('guide-furnished').checked;
  const nightSafety = getEl('guide-night').checked;

  let nextWeights = { ...DEFAULT_WEIGHTS };

  if (priority === 'budget') nextWeights = { rent: 50, travel: 20, surface: 12, safety: 10, internet: 8 };
  if (priority === 'comfort') nextWeights = { rent: 15, travel: 10, surface: 34, safety: 25, internet: 16 };
  if (priority === 'safety') nextWeights = { rent: 18, travel: 12, surface: 20, safety: 34, internet: 16 };
  if (priority === 'mobility') nextWeights = { rent: 20, travel: 36, surface: 14, safety: 12, internet: 18 };

  if (profile === 'student') {
    nextWeights.rent += 8;
    nextWeights.travel += 6;
    nextWeights.surface -= 6;
  }
  if (profile === 'family') {
    nextWeights.surface += 9;
    nextWeights.safety += 6;
    nextWeights.rent -= 7;
  }
  if (profile === 'roommates') {
    nextWeights.surface += 7;
    nextWeights.internet += 5;
    nextWeights.travel -= 4;
  }
  if (profile === 'young-worker') {
    nextWeights.travel += 5;
    nextWeights.internet += 3;
  }

  if (nightSafety) {
    nextWeights.safety += 8;
    nextWeights.rent -= 3;
  }

  nextWeights = normalizeWeights(nextWeights);
  state.weights = nextWeights;

  state.budgetMax = Math.min(ranges.rentMax, budget);
  state.travelMax = Math.min(ranges.travelMax, distance);
  state.surfaceMin = profile === 'family' ? Math.max(35, state.surfaceMin) : state.surfaceMin;
  state.furnishedOnly = furnished;

  state.guideNotes = [
    `Profil applique: ${profile}`,
    `Priorite principale: ${priority}`,
    `Budget max adapte a ${state.budgetMax} EUR`,
    `Distance max fixee a ${state.travelMax} min`,
  ];

  if (nightSafety) state.guideNotes.push('Securite renforcee dans la ponderation.');
  if (furnished) state.guideNotes.push('Filtre meuble active.');

  state.currentPage = 1;
  renderAll();
}

function normalizeWeights(weights) {
  const keys = Object.keys(weights);
  const total = keys.reduce((sum, key) => sum + weights[key], 0);
  if (total <= 0) return { ...DEFAULT_WEIGHTS };

  const result = {};
  const remainders = [];
  keys.forEach((key) => {
    const exact = (weights[key] / total) * 100;
    const floored = Math.floor(exact);
    result[key] = floored;
    remainders.push({ key, remainder: exact - floored });
  });

  let missing = 100 - Object.values(result).reduce((sum, value) => sum + value, 0);
  remainders.sort((a, b) => b.remainder - a.remainder);
  let index = 0;
  while (missing > 0) {
    result[remainders[index % remainders.length].key] += 1;
    index += 1;
    missing -= 1;
  }

  return result;
}

function applyPreset(index) {
  const preset = PRESETS[index];
  if (!preset) return;
  state.weights = { ...preset.weights };
  state.budgetMax = preset.filters.budgetMax;
  state.travelMax = preset.filters.travelMax;
  state.surfaceMin = preset.filters.surfaceMin;
  state.city = preset.filters.city;
  state.furnishedOnly = preset.filters.furnishedOnly;
  state.recommendedOnly = preset.filters.recommendedOnly;
  state.currentPage = 1;
  state.guideNotes = [`Preset applique: ${preset.label}`, preset.description];
  renderAll();
}

function loadScenarios() {
  const parsed = safeParse(window.localStorage.getItem(SCENARIOS_KEY), []);
  state.scenarios = Array.isArray(parsed) ? parsed : [];
}

function saveScenarios() {
  window.localStorage.setItem(SCENARIOS_KEY, JSON.stringify(state.scenarios));
}

function saveScenario() {
  const name = String(els.scenarioName.value || '').trim();
  if (!name) return;

  const scenario = {
    id: String(Date.now()),
    name,
    weights: { ...state.weights },
    filters: {
      budgetMax: state.budgetMax,
      travelMax: state.travelMax,
      surfaceMin: state.surfaceMin,
      city: state.city,
      furnishedOnly: state.furnishedOnly,
      recommendedOnly: state.recommendedOnly,
    },
  };

  state.scenarios = [scenario, ...state.scenarios].slice(0, 12);
  saveScenarios();
  els.scenarioName.value = '';
  renderScenarios();
}

function loadScenario(id) {
  const scenario = state.scenarios.find((item) => item.id === id);
  if (!scenario) return;
  state.weights = { ...scenario.weights };
  state.budgetMax = scenario.filters.budgetMax;
  state.travelMax = scenario.filters.travelMax;
  state.surfaceMin = scenario.filters.surfaceMin;
  state.city = scenario.filters.city;
  state.furnishedOnly = scenario.filters.furnishedOnly;
  state.recommendedOnly = scenario.filters.recommendedOnly;
  state.currentPage = 1;
  renderAll();
}

function removeScenario(id) {
  state.scenarios = state.scenarios.filter((item) => item.id !== id);
  saveScenarios();
  renderScenarios();
}

function renderScenarios() {
  if (state.scenarios.length === 0) {
    els.scenarioList.innerHTML = '<div class="empty">Aucun scenario sauvegarde.</div>';
    return;
  }

  els.scenarioList.innerHTML = state.scenarios
    .map((scenario) => {
      return `
        <div class="scenario-item">
          <span>${scenario.name}</span>
          <div>
            <button type="button" data-load-scenario="${scenario.id}">Charger</button>
            <button type="button" data-remove-scenario="${scenario.id}">Supprimer</button>
          </div>
        </div>
      `;
    })
    .join('');

  els.scenarioList.querySelectorAll('button[data-load-scenario]').forEach((button) => {
    button.addEventListener('click', () => loadScenario(button.dataset.loadScenario));
  });
  els.scenarioList.querySelectorAll('button[data-remove-scenario]').forEach((button) => {
    button.addEventListener('click', () => removeScenario(button.dataset.removeScenario));
  });
}

function renderFilters() {
  els.budgetMax.value = String(state.budgetMax);
  els.travelMax.value = String(state.travelMax);
  els.surfaceMin.value = String(state.surfaceMin);
  els.budgetLabel.textContent = String(state.budgetMax);
  els.travelLabel.textContent = String(state.travelMax);
  els.surfaceLabel.textContent = String(state.surfaceMin);
  els.cityFilter.value = state.city;
  els.furnishedOnly.checked = state.furnishedOnly;
  els.recommendedOnly.checked = state.recommendedOnly;
  els.showCatalog.checked = state.showCatalog;
  els.pageSize.value = String(state.pageSize);
  els.showDominated.checked = state.showDominated;
  els.paretoCap.value = String(state.paretoRentCap);
  els.paretoCapLabel.textContent = String(state.paretoRentCap);
}

function renderRankingHeader() {
  els.rankingHeadRow.innerHTML = `${rankingColumns
    .map((column) => `<th><button type="button" data-sort-key="${column.key}">${column.label}</button></th>`)
    .join('')}<th>Comparer</th>`;

  els.rankingHeadRow.querySelectorAll('button[data-sort-key]').forEach((button) => {
    button.addEventListener('click', () => {
      const key = button.dataset.sortKey;
      if (state.sortKey === key) {
        state.sortDirection = state.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        state.sortKey = key;
        state.sortDirection = key === 'rank' ? 'asc' : 'desc';
      }
      updateSortHeaderVisuals();
      state.currentPage = 1;
      renderAll();
    });
  });

  updateSortHeaderVisuals();
}

function updateSortHeaderVisuals() {
  els.rankingHeadRow.querySelectorAll('button[data-sort-key]').forEach((button) => {
    const active = button.dataset.sortKey === state.sortKey;
    button.classList.toggle('sort-active', active);
    button.classList.toggle('sort-asc', active && state.sortDirection === 'asc');
    button.classList.toggle('sort-desc', active && state.sortDirection === 'desc');
  });
}

function toggleComparison(id) {
  if (state.selectedIds.includes(id)) {
    state.selectedIds = state.selectedIds.filter((currentId) => currentId !== id);
    renderAll();
    return;
  }

  if (state.selectedIds.length >= 3) {
    alert('Maximum 3 logements en comparaison.');
    return;
  }

  state.selectedIds = [...state.selectedIds, id];
  renderAll();
}

function renderRanking() {
  updateSortHeaderVisuals();

  const totalPages = Math.max(1, Math.ceil(currentSorted.length / state.pageSize));
  els.pageIndicator.textContent = `Page ${state.currentPage} / ${totalPages}`;
  els.prevPage.disabled = state.currentPage <= 1;
  els.nextPage.disabled = state.currentPage >= totalPages;

  if (currentDisplay.length === 0) {
    els.rankingBody.innerHTML = `<tr><td colspan="${rankingColumns.length + 1}"><div class="empty">Aucun logement a afficher.</div></td></tr>`;
  } else {
    els.rankingBody.innerHTML = currentDisplay
      .map((item) => {
        const badgeClass = item.recommendationLevel === 'Recommande'
          ? 'good'
          : item.recommendationLevel === 'A etudier'
            ? 'ok'
            : 'low';

        const selected = state.selectedIds.includes(item.id);

        return `
          <tr class="${selected ? 'row-selected' : ''}">
            <td>${item.rank}</td>
            <td>${item.name}</td>
            <td>${item.city}</td>
            <td>${item.district}</td>
            <td>${item.modelType}</td>
            <td>${item.rent} EUR</td>
            <td>${item.surface} m2</td>
            <td>${item.travel} min</td>
            <td>${item.safety.toFixed(1)}/10</td>
            <td>${item.internet.toFixed(1)}/10</td>
            <td>${item.furnished ? 'Oui' : 'Non'}</td>
            <td>${(item.weightedScore * 100).toFixed(1)}%</td>
            <td><span class="badge ${badgeClass}">${item.recommendationLevel}</span></td>
            <td><button type="button" class="compare-chip ${selected ? 'on' : ''}" data-compare-id="${item.id}">${selected ? 'Retirer' : 'Comparer'}</button></td>
          </tr>
        `;
      })
      .join('');
  }

  els.rankingBody.querySelectorAll('button[data-compare-id]').forEach((button) => {
    button.addEventListener('click', () => toggleComparison(button.dataset.compareId));
  });

  const sourceLabel = state.showCatalog ? 'catalogue complet' : 'catalogue filtre';
  els.rankingSummary.textContent = `${currentSorted.length} logement(s) visibles dans le ${sourceLabel}.`;
  els.shareStatus.textContent = state.shareStatus;
}

function renderComparison() {
  const selected = state.selectedIds
    .map((id) => currentRanking.find((item) => item.id === id))
    .filter((item) => Boolean(item));

  const addable = currentRanking.filter((item) => !state.selectedIds.includes(item.id));
  els.comparisonAdd.innerHTML = ['<option value="">Choisir</option>', ...addable.map((item) => `<option value="${item.id}">${item.name}</option>`)].join('');

  if (selected.length === 0) {
    els.comparisonList.innerHTML = '<div class="empty">Selectionnez jusqu a 3 logements depuis le tableau.</div>';
    return;
  }

  els.comparisonList.innerHTML = selected
    .map((item) => {
      const badgeClass = item.recommendationLevel === 'Recommande'
        ? 'good'
        : item.recommendationLevel === 'A etudier'
          ? 'ok'
          : 'low';
      return `
        <article class="comparison-item">
          <div class="comp-top">
            <h3>${item.name}</h3>
            <span class="badge ${badgeClass}">${(item.weightedScore * 100).toFixed(1)}%</span>
          </div>
          <p class="muted">${item.city}, ${item.country} · ${item.district} · ${item.modelType}</p>
          <div class="comp-grid">
            <div><span>Loyer</span>${item.rent} EUR</div>
            <div><span>Distance</span>${item.travel} min</div>
            <div><span>Surface</span>${item.surface} m2</div>
            <div><span>Securite</span>${item.safety.toFixed(1)}/10</div>
            <div><span>Internet</span>${item.internet.toFixed(1)}/10</div>
          </div>
        </article>
      `;
    })
    .join('');
}

function renderPareto() {
  const baseSource = currentFiltered.length > 0 ? currentFiltered : currentRanking;
  let source = baseSource
    .filter((item) => item.rent <= state.paretoRentCap)
    .filter((item) => state.showDominated || item.isParetoOptimal);

  if (source.length === 0) {
    source = baseSource.filter((item) => state.showDominated || item.isParetoOptimal);
  }

  if (source.length === 0) {
    els.paretoSvg.innerHTML = '';
    return;
  }

  const width = 1000;
  const height = 320;
  const padX = 68;
  const padY = 34;

  const minRent = Math.min(...source.map((item) => item.rent));
  const maxRent = Math.max(...source.map((item) => item.rent));
  const minPerf = Math.min(...source.map((item) => getPerformance(item)));
  const maxPerf = Math.max(...source.map((item) => getPerformance(item)));

  const x = (value) => padX + ((value - minRent) / Math.max(1, maxRent - minRent)) * (width - padX * 1.4);
  const y = (value) => (height - padY) - ((value - minPerf) / Math.max(0.001, maxPerf - minPerf)) * (height - padY * 2);

  const axis = `
    <line x1="${padX}" y1="${height - padY}" x2="${width - 16}" y2="${height - padY}" stroke="#ccbba6" />
    <line x1="${padX}" y1="${height - padY}" x2="${padX}" y2="${padY / 2}" stroke="#ccbba6" />
    <text x="${width - 18}" y="${height - 12}" font-size="11" fill="#617180" text-anchor="end">Loyer</text>
    <text x="16" y="${padY}" font-size="11" fill="#617180" transform="rotate(-90 16 ${padY})">Attractivite</text>
  `;

  const circles = source.map((item) => {
    const cx = x(item.rent);
    const cy = y(getPerformance(item));
    const color = item.isParetoOptimal ? '#1d8750' : '#647c8f';
    const radius = item.isParetoOptimal ? 5.4 : 4.1;
    return `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="${color}" fill-opacity="0.52" stroke="${color}" />`;
  }).join('');

  els.paretoSvg.innerHTML = `${axis}${circles}`;
}

function getPerformance(item) {
  return (
    item.normalizedScores.surface * 0.35 +
    item.normalizedScores.safety * 0.35 +
    item.normalizedScores.internet * 0.3
  ) * 100;
}

function renderRadar() {
  const target = state.selectedIds.length > 0
    ? currentRanking.find((item) => item.id === state.selectedIds[0])
    : (currentFiltered[0] || currentRanking[0]);

  if (!target) {
    els.radarSvg.innerHTML = '';
    return;
  }

  const centerX = 210;
  const centerY = 160;
  const radius = 108;
  const labels = ['Loyer', 'Distance', 'Surface', 'Securite', 'Internet'];
  const values = [
    target.normalizedScores.rent,
    target.normalizedScores.travel,
    target.normalizedScores.surface,
    target.normalizedScores.safety,
    target.normalizedScores.internet,
  ];

  const angles = [
    -Math.PI / 2,
    -Math.PI / 2 + (2 * Math.PI) / 5,
    -Math.PI / 2 + (4 * Math.PI) / 5,
    -Math.PI / 2 + (6 * Math.PI) / 5,
    -Math.PI / 2 + (8 * Math.PI) / 5,
  ];

  const rings = [0.25, 0.5, 0.75, 1]
    .map((ratio) => {
      const points = angles
        .map((angle) => `${centerX + Math.cos(angle) * radius * ratio},${centerY + Math.sin(angle) * radius * ratio}`)
        .join(' ');
      return `<polygon points="${points}" fill="none" stroke="#d9cab8" stroke-dasharray="3 3" />`;
    })
    .join('');

  const axes = angles
    .map((angle, index) => {
      const lx = centerX + Math.cos(angle) * (radius + 20);
      const ly = centerY + Math.sin(angle) * (radius + 20);
      const ax = centerX + Math.cos(angle) * radius;
      const ay = centerY + Math.sin(angle) * radius;
      return `
        <line x1="${centerX}" y1="${centerY}" x2="${ax}" y2="${ay}" stroke="#ccbca8" />
        <text x="${lx}" y="${ly}" font-size="11" text-anchor="middle" fill="#617180">${labels[index]}</text>
      `;
    })
    .join('');

  const polygonPoints = angles
    .map((angle, index) => {
      const ratio = values[index];
      return `${centerX + Math.cos(angle) * radius * ratio},${centerY + Math.sin(angle) * radius * ratio}`;
    })
    .join(' ');

  els.radarSvg.innerHTML = `
    ${rings}
    ${axes}
    <polygon points="${polygonPoints}" fill="rgba(15,118,110,0.25)" stroke="#0f766e" stroke-width="2" />
    <text x="16" y="20" font-size="12" fill="#334f61">Profil: ${target.name}</text>
  `;
}

function buildSensitivityData() {
  if (currentRanking.length === 0) return [];

  const focus = currentRanking.find((item) => item.id === state.sensitivityFocusId) || currentRanking[0];
  const reference = currentRanking.find((item) => item.id === state.sensitivityReferenceId) || currentRanking[1] || focus;

  const points = [];
  for (let value = 0; value <= 100; value += 10) {
    const weights = redistributeForSensitivity(state.weights, state.sensitivityCriterion, value);
    const ranking = computeFullRanking(weights);
    const top = ranking[0];
    const focusScore = ranking.find((item) => item.id === focus.id)?.weightedScore || 0;
    const referenceScore = ranking.find((item) => item.id === reference.id)?.weightedScore || 0;

    points.push({
      weight: value,
      focusScore: focusScore * 100,
      referenceScore: referenceScore * 100,
      topScore: top.weightedScore * 100,
      focusRank: ranking.find((item) => item.id === focus.id)?.rank || ranking.length,
    });
  }

  return points;
}

function redistributeForSensitivity(baseWeights, key, value) {
  const copy = { ...baseWeights };
  const keys = Object.keys(copy);
  const others = keys.filter((currentKey) => currentKey !== key);
  copy[key] = value;
  const target = 100 - value;
  const totalOthers = others.reduce((sum, currentKey) => sum + copy[currentKey], 0);
  if (target <= 0 || totalOthers <= 0) {
    others.forEach((currentKey) => {
      copy[currentKey] = 0;
    });
    return copy;
  }

  const mapped = others.map((currentKey) => {
    const exact = (baseWeights[currentKey] / totalOthers) * target;
    return { key: currentKey, floor: Math.floor(exact), remainder: exact - Math.floor(exact) };
  });

  mapped.forEach((entry) => {
    copy[entry.key] = entry.floor;
  });

  let missing = 100 - Object.values(copy).reduce((sum, val) => sum + val, 0);
  mapped.sort((a, b) => b.remainder - a.remainder);
  let cursor = 0;
  while (missing > 0) {
    copy[mapped[cursor % mapped.length].key] += 1;
    cursor += 1;
    missing -= 1;
  }

  return copy;
}

function renderSensitivity() {
  const points = buildSensitivityData();
  if (points.length === 0) {
    els.sensitivitySvg.innerHTML = '';
    els.sensitivitySummary.innerHTML = '<div class="empty">Aucune donnee pour sensibilite.</div>';
    return;
  }

  const width = 1000;
  const height = 320;
  const padX = 68;
  const padY = 34;

  const x = (value) => padX + (value / 100) * (width - padX * 1.4);
  const y = (value) => (height - padY) - (value / 100) * (height - padY * 2);

  const axis = `
    <line x1="${padX}" y1="${height - padY}" x2="${width - 16}" y2="${height - padY}" stroke="#ccbba6" />
    <line x1="${padX}" y1="${height - padY}" x2="${padX}" y2="${padY / 2}" stroke="#ccbba6" />
  `;

  const makePath = (key) => points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${x(point.weight)} ${y(point[key])}`)
    .join(' ');

  els.sensitivitySvg.innerHTML = `
    ${axis}
    <path d="${makePath('focusScore')}" fill="none" stroke="#0f766e" stroke-width="2.4" />
    <path d="${makePath('referenceScore')}" fill="none" stroke="#d26438" stroke-width="2" />
    <path d="${makePath('topScore')}" fill="none" stroke="#4a6373" stroke-width="1.9" stroke-dasharray="5 4" />
  `;

  const bestRank = Math.min(...points.map((point) => point.focusRank));
  const worstRank = Math.max(...points.map((point) => point.focusRank));
  const wins = points.filter((point) => point.focusScore >= point.referenceScore).length;
  const maxGap = Math.max(...points.map((point) => point.focusScore - point.referenceScore));

  els.sensitivitySummary.innerHTML = `
    <div class="stat-card"><p>Meilleur rang focus</p><strong>#${bestRank}</strong></div>
    <div class="stat-card"><p>Pire rang focus</p><strong>#${worstRank}</strong></div>
    <div class="stat-card"><p>Points favorables</p><strong>${wins}/11</strong></div>
    <div class="stat-card"><p>Ecart max</p><strong>${maxGap.toFixed(2)} pts</strong></div>
  `;
}

function renderCalcDetails() {
  const top = (currentFiltered.length > 0 ? currentFiltered : currentRanking).slice(0, 3);
  if (top.length === 0) {
    els.calcsList.innerHTML = '<div class="empty">Aucun detail disponible.</div>';
    return;
  }

  els.calcsList.innerHTML = top
    .map((item) => {
      return `
        <article class="calc-item">
          <h3>${item.name} - ${item.city}</h3>
          <div class="calc-grid">
            <div>Loyer: ${item.normalizedScores.rent.toFixed(3)} x ${(state.weights.rent / 100).toFixed(2)}</div>
            <div>Distance: ${item.normalizedScores.travel.toFixed(3)} x ${(state.weights.travel / 100).toFixed(2)}</div>
            <div>Surface: ${item.normalizedScores.surface.toFixed(3)} x ${(state.weights.surface / 100).toFixed(2)}</div>
            <div>Securite: ${item.normalizedScores.safety.toFixed(3)} x ${(state.weights.safety / 100).toFixed(2)}</div>
            <div>Internet: ${item.normalizedScores.internet.toFixed(3)} x ${(state.weights.internet / 100).toFixed(2)}</div>
            <div><strong>Score global: ${(item.weightedScore * 100).toFixed(2)}%</strong></div>
          </div>
        </article>
      `;
    })
    .join('');
}

function exportCsv() {
  const source = currentSorted;
  if (source.length === 0) {
    alert('Aucun logement a exporter.');
    return;
  }

  const headers = ['Rang', 'Logement', 'Ville', 'Pays', 'Loyer_EUR', 'Distance_min', 'Surface_m2', 'Securite_10', 'Internet_10', 'Score_pct', 'Avis'];
  const rows = source.map((item) => [
    item.rank,
    item.name,
    item.city,
    item.country,
    item.rent,
    item.travel,
    item.surface,
    item.safety.toFixed(1),
    item.internet.toFixed(1),
    (item.weightedScore * 100).toFixed(2),
    item.recommendationLevel,
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

function exportPdf() {
  const source = currentSorted;
  if (source.length === 0) {
    alert('Aucun logement a exporter.');
    return;
  }

  const rows = source.map((item) => `
    <tr>
      <td>${item.rank}</td>
      <td>${item.name}</td>
      <td>${item.city}</td>
      <td>${item.rent} EUR</td>
      <td>${item.travel} min</td>
      <td>${item.surface} m2</td>
      <td>${(item.weightedScore * 100).toFixed(1)}%</td>
    </tr>
  `).join('');

  const popup = window.open('', '_blank', 'width=1020,height=780');
  if (!popup) return;

  popup.document.write(`
    <html>
      <head>
        <title>Rapport SAW Logement</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; }
          h1 { margin: 0 0 8px; }
          p { color: #555; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; }
          th, td { border: 1px solid #ddd; padding: 8px; font-size: 12px; text-align: left; }
          th { background: #f4f4f4; }
        </style>
      </head>
      <body>
        <h1>Rapport classement logements - SAW</h1>
        <p>Genere le ${new Date().toLocaleString('fr-FR')}</p>
        <table>
          <thead>
            <tr><th>Rang</th><th>Logement</th><th>Ville</th><th>Loyer</th><th>Distance</th><th>Surface</th><th>Score</th></tr>
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

function shareConfiguration() {
  const params = new URLSearchParams({
    w_rent: String(state.weights.rent),
    w_travel: String(state.weights.travel),
    w_surface: String(state.weights.surface),
    w_safety: String(state.weights.safety),
    w_internet: String(state.weights.internet),
    f_budget: String(state.budgetMax),
    f_travel: String(state.travelMax),
    f_surface: String(state.surfaceMin),
    f_city: state.city,
    f_furnished: state.furnishedOnly ? '1' : '0',
    f_reco: state.recommendedOnly ? '1' : '0',
  });

  const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  navigator.clipboard.writeText(url)
    .then(() => {
      state.shareStatus = 'Lien de configuration copie.';
      renderRanking();
    })
    .catch(() => {
      state.shareStatus = `Copie impossible. Lien: ${url}`;
      renderRanking();
    });
}

function loadConfigurationFromUrl() {
  const params = new URLSearchParams(window.location.search);
  if (![...params.keys()].some((key) => key.startsWith('w_') || key.startsWith('f_'))) return;

  const parsed = {
    rent: Number(params.get('w_rent') ?? state.weights.rent),
    travel: Number(params.get('w_travel') ?? state.weights.travel),
    surface: Number(params.get('w_surface') ?? state.weights.surface),
    safety: Number(params.get('w_safety') ?? state.weights.safety),
    internet: Number(params.get('w_internet') ?? state.weights.internet),
  };

  const sum = Object.values(parsed).reduce((acc, value) => acc + value, 0);
  if (sum === 100) {
    state.weights = parsed;
  }

  state.budgetMax = Number(params.get('f_budget') ?? state.budgetMax);
  state.travelMax = Number(params.get('f_travel') ?? state.travelMax);
  state.surfaceMin = Number(params.get('f_surface') ?? state.surfaceMin);
  state.city = params.get('f_city') ?? state.city;
  state.furnishedOnly = params.get('f_furnished') === '1';
  state.recommendedOnly = params.get('f_reco') === '1';
  state.shareStatus = 'Configuration chargee depuis URL.';
}

function renderSensitivitySelectors() {
  const options = currentRanking.map((item) => `<option value="${item.id}">${item.name}</option>`).join('');
  els.sensitivityFocus.innerHTML = options;
  els.sensitivityReference.innerHTML = options;

  if (state.sensitivityFocusId) els.sensitivityFocus.value = state.sensitivityFocusId;
  if (state.sensitivityReferenceId) els.sensitivityReference.value = state.sensitivityReferenceId;
  els.sensitivityCriterion.value = state.sensitivityCriterion;
}

function renderAll() {
  if (els.appShell.classList.contains('hidden')) return;

  updateRankingContext();
  renderOverview();
  renderGuideNotes();
  renderWeightSliders();
  renderFilters();
  renderScenarios();
  renderPareto();
  renderRadar();
  renderRanking();
  renderComparison();
  renderSensitivitySelectors();
  renderSensitivity();
  renderCalcDetails();
}

function wireEvents() {
  els.sidebarNav.querySelectorAll('.nav-btn').forEach((button) => {
    button.addEventListener('click', () => setActiveSection(button.dataset.section));
  });

  if (els.themeToggle) {
    els.themeToggle.addEventListener('click', toggleTheme);
  }

  els.applyGuide.addEventListener('click', applyGuideProfile);
  els.saveScenario.addEventListener('click', saveScenario);

  els.budgetMax.addEventListener('input', (event) => {
    state.budgetMax = Number(event.target.value);
    state.currentPage = 1;
    if (state.paretoRentCap > state.budgetMax) state.paretoRentCap = state.budgetMax;
    renderAll();
  });

  els.travelMax.addEventListener('input', (event) => {
    state.travelMax = Number(event.target.value);
    state.currentPage = 1;
    renderAll();
  });

  els.surfaceMin.addEventListener('input', (event) => {
    state.surfaceMin = Number(event.target.value);
    state.currentPage = 1;
    renderAll();
  });

  els.cityFilter.addEventListener('change', (event) => {
    state.city = event.target.value;
    state.currentPage = 1;
    renderAll();
  });

  els.furnishedOnly.addEventListener('change', (event) => {
    state.furnishedOnly = event.target.checked;
    state.currentPage = 1;
    renderAll();
  });

  els.recommendedOnly.addEventListener('change', (event) => {
    state.recommendedOnly = event.target.checked;
    state.currentPage = 1;
    renderAll();
  });

  els.resetFilters.addEventListener('click', () => {
    const preset = PRESETS[0].filters;
    state.budgetMax = preset.budgetMax;
    state.travelMax = preset.travelMax;
    state.surfaceMin = preset.surfaceMin;
    state.city = preset.city;
    state.furnishedOnly = false;
    state.recommendedOnly = false;
    state.currentPage = 1;
    renderAll();
  });

  els.showDominated.addEventListener('change', (event) => {
    state.showDominated = event.target.checked;
    renderPareto();
  });

  els.paretoCap.addEventListener('input', (event) => {
    state.paretoRentCap = Number(event.target.value);
    renderFilters();
    renderPareto();
  });

  els.showCatalog.addEventListener('change', (event) => {
    state.showCatalog = event.target.checked;
    state.currentPage = 1;
    renderAll();
  });

  els.pageSize.addEventListener('change', (event) => {
    state.pageSize = Number(event.target.value);
    state.currentPage = 1;
    renderAll();
  });

  els.prevPage.addEventListener('click', () => {
    state.currentPage = Math.max(1, state.currentPage - 1);
    renderAll();
  });

  els.nextPage.addEventListener('click', () => {
    const totalPages = Math.max(1, Math.ceil(currentSorted.length / state.pageSize));
    state.currentPage = Math.min(totalPages, state.currentPage + 1);
    renderAll();
  });

  els.comparisonAddBtn.addEventListener('click', () => {
    const id = els.comparisonAdd.value;
    if (!id) return;
    toggleComparison(id);
  });

  els.comparisonClear.addEventListener('click', () => {
    state.selectedIds = [];
    renderAll();
  });

  els.sensitivityCriterion.addEventListener('change', (event) => {
    state.sensitivityCriterion = event.target.value;
    renderSensitivity();
  });

  els.sensitivityFocus.addEventListener('change', (event) => {
    state.sensitivityFocusId = event.target.value;
    renderSensitivity();
  });

  els.sensitivityReference.addEventListener('change', (event) => {
    state.sensitivityReferenceId = event.target.value;
    renderSensitivity();
  });

  els.exportCsv.addEventListener('click', exportCsv);
  els.exportPdf.addEventListener('click', exportPdf);
  els.shareConfig.addEventListener('click', shareConfiguration);
}

function bootstrap() {
  initTheme();
  dataset = generateDataset();
  computeRanges();
  initControls();
  loadConfigurationFromUrl();
  initAuth();
  wireEvents();
  renderAll();
}

bootstrap();
