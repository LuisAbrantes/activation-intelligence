// src/lib/portfolioStore.js
// Manages the CS team's merchant portfolio using localStorage.
// Each entry stores the full analysis result + contact history.

const STORAGE_KEY = 'activation_intelligence_portfolio';

function getAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAll(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

/**
 * Generates a stable ID from the store name (slug).
 */
function merchantId(storeName) {
  return storeName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// ─── Public API ────────────────────────────────────────────────────────────────

/**
 * Save an analysis result to the portfolio.
 * If the merchant already exists, adds to their history.
 */
export function saveAnalysis({ data, scoreResult, diagnosis, outreach }) {
  const entries = getAll();
  const storeName = data?.store?.name ?? 'Loja Desconhecida';
  const id = merchantId(storeName);
  const now = new Date().toISOString();

  const snapshot = {
    score: scoreResult.score,
    breakdown: scoreResult.breakdown,
    riskLevel: diagnosis?.risk_level ?? 'unknown',
    stage: diagnosis?.stage ?? '',
    analyzedAt: now,
  };

  const existing = entries.find((e) => e.id === id);

  if (existing) {
    existing.latestScore = scoreResult.score;
    existing.latestRiskLevel = diagnosis?.risk_level ?? 'unknown';
    existing.latestStage = diagnosis?.stage ?? '';
    existing.lastAnalyzedAt = now;
    existing.diagnosis = diagnosis;
    existing.outreach = outreach;
    existing.scoreHistory.push(snapshot);
  } else {
    entries.push({
      id,
      storeName,
      latestScore: scoreResult.score,
      latestRiskLevel: diagnosis?.risk_level ?? 'unknown',
      latestStage: diagnosis?.stage ?? '',
      lastAnalyzedAt: now,
      diagnosis,
      outreach,
      scoreHistory: [snapshot],
      contacts: [],
    });
  }

  saveAll(entries);
  return id;
}

/**
 * Get the full portfolio sorted by score (ascending = highest priority first).
 */
export function getPortfolio() {
  return getAll().sort((a, b) => a.latestScore - b.latestScore);
}

/**
 * Get a single merchant entry by ID.
 */
export function getMerchant(id) {
  return getAll().find((e) => e.id === id) ?? null;
}

/**
 * Delete a merchant from the portfolio.
 */
export function deleteMerchant(id) {
  const entries = getAll().filter((e) => e.id !== id);
  saveAll(entries);
}

/**
 * Record a contact made by the CS team.
 */
export function recordContact(id, channel, notes) {
  const entries = getAll();
  const merchant = entries.find((e) => e.id === id);
  if (!merchant) return;

  merchant.contacts.push({
    date: new Date().toISOString(),
    channel, // 'whatsapp' | 'email' | 'phone' | 'other'
    notes,
  });

  saveAll(entries);
}

/**
 * Get the date of the last contact for a merchant.
 */
export function getLastContactDate(id) {
  const merchant = getAll().find((e) => e.id === id);
  if (!merchant || merchant.contacts.length === 0) return null;
  return merchant.contacts[merchant.contacts.length - 1].date;
}

/**
 * Export the entire portfolio as a CSV string.
 */
export function exportToCSV() {
  const entries = getPortfolio();
  if (entries.length === 0) return '';

  const headers = ['Loja', 'Score', 'Risco', 'Estágio', 'Última Análise', 'Último Contato', 'Total Contatos'];
  const rows = entries.map((e) => {
    const lastContact = e.contacts.length > 0
      ? new Date(e.contacts[e.contacts.length - 1].date).toLocaleDateString('pt-BR')
      : 'Nunca';
    return [
      e.storeName,
      e.latestScore,
      e.latestRiskLevel,
      e.latestStage,
      new Date(e.lastAnalyzedAt).toLocaleDateString('pt-BR'),
      lastContact,
      e.contacts.length,
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Trigger a CSV file download in the browser.
 */
export function downloadCSV() {
  const csv = exportToCSV();
  if (!csv) return;

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `portfolio_cs_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
