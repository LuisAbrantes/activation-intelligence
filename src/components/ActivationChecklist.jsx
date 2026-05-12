import React from 'react';
import { Check, X } from 'lucide-react';
import { SCORE_WEIGHTS } from '../constants/scoring.js';

const CHECKLIST_ITEMS = [
  { key: 'hasProduct',            label: 'Produto cadastrado',           icon: '📦' },
  { key: 'hasWebhook',            label: 'Webhook configurado',          icon: '🔗' },
  { key: 'hasPaidCheckout',       label: 'Checkout pago',                icon: '💳' },
  { key: 'hasCustomerWithTaxId',  label: 'Cliente com CPF/CNPJ',         icon: '👤' },
  { key: 'hasPaidSubscription',   label: 'Assinatura ativa',             icon: '🔄' },
  { key: 'hasRecentVolume',       label: 'Volume nos últimos 30 dias',   icon: '📈' },
];

export default function ActivationChecklist({ breakdown }) {
  if (!breakdown) return null;

  const completedCount = CHECKLIST_ITEMS.filter(item => breakdown[item.key]).length;

  return (
    <div className="mt-6 pt-6 border-t border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
          Checklist de Ativação
        </h4>
        <span className="text-xs font-bold text-gray-400">
          {completedCount}/{CHECKLIST_ITEMS.length}
        </span>
      </div>
      
      <div className="space-y-2.5">
        {CHECKLIST_ITEMS.map(({ key, label, icon }) => {
          const done = breakdown[key];
          const weight = SCORE_WEIGHTS[key];
          
          return (
            <div
              key={key}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all duration-300 ${
                done
                  ? 'bg-abacate-50/60 border border-abacate-100'
                  : 'bg-red-50/40 border border-red-100/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-base">{icon}</span>
                <span className={`text-sm font-semibold ${done ? 'text-gray-700' : 'text-gray-500'}`}>
                  {label}
                </span>
              </div>
              
              <div className="flex items-center gap-2.5">
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                  done 
                    ? 'bg-abacate-100 text-abacate-700' 
                    : 'bg-red-100/60 text-red-400'
                }`}>
                  +{weight} pts
                </span>
                {done ? (
                  <div className="w-5 h-5 rounded-full bg-abacate-500 flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full bg-red-200/60 flex items-center justify-center">
                    <X className="w-3 h-3 text-red-400" strokeWidth={3} />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
