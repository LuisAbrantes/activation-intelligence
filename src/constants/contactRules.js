// src/constants/contactRules.js
// Cadência de contato por tier de risco do Activation Score.

/**
 * Regras de cadência: quantos dias entre contatos por faixa de score.
 * Scores mais baixos = mais urgência = contatos mais frequentes.
 */
export const CONTACT_CADENCE = [
  { maxScore: 30,  label: 'Risco Crítico',       intervalDays: 3,  color: 'red' },
  { maxScore: 60,  label: 'Atenção Necessária',   intervalDays: 7,  color: 'amber' },
  { maxScore: 80,  label: 'Bom Progresso',        intervalDays: 14, color: 'blue' },
  { maxScore: 100, label: 'Ativado com Sucesso',  intervalDays: 30, color: 'green' },
];

/**
 * Returns the cadence rule for a given score.
 */
export function getCadence(score) {
  return CONTACT_CADENCE.find((c) => score <= c.maxScore) ?? CONTACT_CADENCE[CONTACT_CADENCE.length - 1];
}

/**
 * Given a score and a lastContactDate (ISO string), returns the contact status.
 * @returns {{ status: 'overdue' | 'due_today' | 'on_track' | 'never_contacted', daysOverdue: number, nextContactDate: string }}
 */
export function getContactStatus(score, lastContactDate) {
  if (!lastContactDate) {
    return { status: 'never_contacted', daysOverdue: 0, nextContactDate: null };
  }

  const cadence = getCadence(score);
  const lastDate = new Date(lastContactDate);
  const nextDate = new Date(lastDate);
  nextDate.setDate(nextDate.getDate() + cadence.intervalDays);

  const now = new Date();
  const diffMs = now.getTime() - nextDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays > 0) {
    return { status: 'overdue', daysOverdue: diffDays, nextContactDate: nextDate.toISOString() };
  }
  if (diffDays === 0) {
    return { status: 'due_today', daysOverdue: 0, nextContactDate: nextDate.toISOString() };
  }
  return { status: 'on_track', daysOverdue: diffDays, nextContactDate: nextDate.toISOString() };
}
