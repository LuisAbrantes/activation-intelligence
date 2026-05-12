import React, { useState, useMemo } from 'react';
import {
  LayoutDashboard, Download, Trash2, RefreshCw,
  AlertCircle, Clock, CheckCircle2, Phone,
  TrendingUp, TrendingDown, Minus, MessageSquare,
  Filter, X
} from 'lucide-react';
import { getPortfolio, deleteMerchant, recordContact, downloadCSV, getLastContactDate } from '../lib/portfolioStore.js';
import { getContactStatus, getCadence } from '../constants/contactRules.js';
import { getScoreTier } from '../constants/scoring.js';

const RISK_FILTERS = [
  { value: 'all',    label: 'Todos' },
  { value: 'high',   label: 'Crítico',  color: 'red' },
  { value: 'medium', label: 'Atenção',  color: 'amber' },
  { value: 'low',    label: 'Bom',      color: 'blue' },
];

function ContactStatusBadge({ score, merchantId }) {
  const lastContact = getLastContactDate(merchantId);
  const { status, daysOverdue } = getContactStatus(score, lastContact);

  const config = {
    never_contacted: { icon: AlertCircle, text: 'Nunca contatado', bg: 'bg-gray-100', textColor: 'text-gray-600', ring: '' },
    overdue:         { icon: Clock,        text: `${daysOverdue}d atrasado`,  bg: 'bg-red-50',   textColor: 'text-red-700',   ring: 'ring-2 ring-red-200' },
    due_today:       { icon: Phone,        text: 'Contatar hoje',  bg: 'bg-amber-50', textColor: 'text-amber-700', ring: 'ring-2 ring-amber-200' },
    on_track:        { icon: CheckCircle2, text: 'Em dia',         bg: 'bg-green-50', textColor: 'text-green-700', ring: '' },
  };

  const c = config[status];
  const Icon = c.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${c.bg} ${c.textColor} ${c.ring}`}>
      <Icon className="w-3.5 h-3.5" />
      {c.text}
    </span>
  );
}

function ScoreDelta({ history }) {
  if (!history || history.length < 2) return <Minus className="w-4 h-4 text-gray-300" />;
  const prev = history[history.length - 2].score;
  const curr = history[history.length - 1].score;
  const delta = curr - prev;
  if (delta > 0) return <span className="inline-flex items-center gap-0.5 text-xs font-bold text-green-600"><TrendingUp className="w-3.5 h-3.5" />+{delta}</span>;
  if (delta < 0) return <span className="inline-flex items-center gap-0.5 text-xs font-bold text-red-600"><TrendingDown className="w-3.5 h-3.5" />{delta}</span>;
  return <span className="text-xs font-bold text-gray-400">—</span>;
}

function MiniSparkline({ history }) {
  if (!history || history.length < 2) return null;
  const scores = history.slice(-8).map(h => h.score);
  const max = 100;
  const min = 0;
  const w = 80;
  const h = 24;
  const points = scores.map((s, i) => {
    const x = (i / (scores.length - 1)) * w;
    const y = h - ((s - min) / (max - min)) * h;
    return `${x},${y}`;
  }).join(' ');

  const lastScore = scores[scores.length - 1];
  const color = lastScore <= 30 ? '#ef4444' : lastScore <= 60 ? '#f59e0b' : lastScore <= 80 ? '#3b82f6' : '#22c55e';

  return (
    <svg width={w} height={h} className="inline-block">
      <polyline fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={points} />
    </svg>
  );
}

export default function PortfolioDashboard({ onSwitchToAnalysis }) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [riskFilter, setRiskFilter] = useState('all');
  const [contactModal, setContactModal] = useState(null); // merchantId
  const [contactNotes, setContactNotes] = useState('');
  const [contactChannel, setContactChannel] = useState('whatsapp');

  // Re-read localStorage on every render + refreshKey change
  const portfolio = useMemo(() => {
    void refreshKey;
    return getPortfolio();
  }, [refreshKey]);

  const filtered = useMemo(() => {
    if (riskFilter === 'all') return portfolio;
    return portfolio.filter(m => m.latestRiskLevel === riskFilter);
  }, [portfolio, riskFilter]);

  const handleDelete = (id, name) => {
    if (confirm(`Remover "${name}" do portfólio?`)) {
      deleteMerchant(id);
      setRefreshKey(k => k + 1);
    }
  };

  const handleRecordContact = () => {
    if (!contactModal) return;
    recordContact(contactModal, contactChannel, contactNotes);
    setContactModal(null);
    setContactNotes('');
    setRefreshKey(k => k + 1);
  };

  // Stats
  const totalMerchants = portfolio.length;
  const criticalCount = portfolio.filter(m => m.latestScore <= 30).length;
  const overdueCount = portfolio.filter(m => {
    const last = getLastContactDate(m.id);
    const s = getContactStatus(m.latestScore, last);
    return s.status === 'overdue' || s.status === 'never_contacted';
  }).length;

  return (
    <div className="space-y-8">
      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass p-5 rounded-2xl border border-white/40">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Portfólio</p>
          <p className="text-3xl font-black text-gray-900">{totalMerchants}</p>
          <p className="text-xs text-gray-400 font-medium mt-1">merchants analisados</p>
        </div>
        <div className="glass p-5 rounded-2xl border border-red-100">
          <p className="text-xs font-bold text-red-500 uppercase tracking-widest mb-1">Risco Crítico</p>
          <p className="text-3xl font-black text-red-600">{criticalCount}</p>
          <p className="text-xs text-red-400 font-medium mt-1">score ≤ 30</p>
        </div>
        <div className="glass p-5 rounded-2xl border border-amber-100">
          <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">Pendente</p>
          <p className="text-3xl font-black text-amber-600">{overdueCount}</p>
          <p className="text-xs text-amber-400 font-medium mt-1">contato atrasado ou nunca feito</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          {RISK_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setRiskFilter(f.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                riskFilter === f.value
                  ? 'bg-abacate-100 text-abacate-800 ring-2 ring-abacate-300'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => downloadCSV()}
            disabled={totalMerchants === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-40 transition-all"
          >
            <Download className="w-3.5 h-3.5" /> Exportar CSV
          </button>
          <button
            onClick={onSwitchToAnalysis}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-lg bg-abacate-600 text-white hover:bg-abacate-700 transition-all shadow-sm"
          >
            + Nova Análise
          </button>
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="glass p-12 rounded-2xl text-center border border-dashed border-gray-200">
          <LayoutDashboard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-400 mb-2">
            {totalMerchants === 0 ? 'Nenhum merchant analisado ainda' : 'Nenhum resultado para este filtro'}
          </h3>
          <p className="text-sm text-gray-400 font-medium">
            {totalMerchants === 0
              ? 'Execute uma análise na aba "Análise Individual" para começar.'
              : 'Tente outro filtro de risco.'}
          </p>
        </div>
      ) : (
        <div className="glass rounded-2xl border border-white/40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Loja</th>
                  <th className="px-5 py-3.5 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">Score</th>
                  <th className="px-5 py-3.5 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">Evolução</th>
                  <th className="px-5 py-3.5 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">Contato</th>
                  <th className="px-5 py-3.5 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">Cadência</th>
                  <th className="px-5 py-3.5 text-right text-xs font-bold text-gray-500 uppercase tracking-widest">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((m) => {
                  const tier = getScoreTier(m.latestScore);
                  const cadence = getCadence(m.latestScore);
                  return (
                    <tr key={m.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-bold text-gray-900">{m.storeName}</p>
                        <p className="text-xs text-gray-400 font-medium mt-0.5">
                          {m.latestStage} · Analisado {new Date(m.lastAnalyzedAt).toLocaleDateString('pt-BR')}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className={`inline-flex items-center justify-center w-10 h-10 rounded-xl font-black text-lg ${
                          tier.colorKey === 'red' ? 'bg-red-50 text-red-600' :
                          tier.colorKey === 'amber' ? 'bg-amber-50 text-amber-600' :
                          tier.colorKey === 'blue' ? 'bg-blue-50 text-blue-600' :
                          'bg-green-50 text-green-600'
                        }`}>
                          {m.latestScore}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <MiniSparkline history={m.scoreHistory} />
                          <ScoreDelta history={m.scoreHistory} />
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <ContactStatusBadge score={m.latestScore} merchantId={m.id} />
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className="text-xs font-bold text-gray-400">
                          a cada {cadence.intervalDays}d
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => { setContactModal(m.id); setContactChannel('whatsapp'); setContactNotes(''); }}
                            className="p-2 rounded-lg text-gray-400 hover:text-abacate-600 hover:bg-abacate-50 transition-colors"
                            title="Registrar contato"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(m.id, m.storeName)}
                            className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Remover"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Contact Recording Modal */}
      {contactModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Registrar Contato</h3>
              <button onClick={() => setContactModal(null)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Canal</label>
                <div className="flex gap-2">
                  {['whatsapp', 'email', 'phone', 'other'].map(ch => (
                    <button
                      key={ch}
                      onClick={() => setContactChannel(ch)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                        contactChannel === ch
                          ? 'bg-abacate-100 text-abacate-800 ring-2 ring-abacate-300'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {ch === 'other' ? 'Outro' : ch === 'phone' ? 'Ligação' : ch}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Notas (opcional)</label>
                <textarea
                  value={contactNotes}
                  onChange={e => setContactNotes(e.target.value)}
                  placeholder="Ex: Merchant pediu ajuda com webhooks..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-abacate-500/20 focus:border-abacate-500 resize-none"
                  rows={3}
                />
              </div>

              <button
                onClick={handleRecordContact}
                className="w-full py-3 bg-abacate-600 text-white rounded-xl font-bold hover:bg-abacate-700 transition-all shadow-sm"
              >
                Salvar Contato
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
