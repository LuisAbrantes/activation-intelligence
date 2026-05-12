import React, { useState } from 'react';
import { Send, FileText, Gift, Lightbulb, Copy, Check, ExternalLink } from 'lucide-react';

export default function ActionCard({ action }) {
  const [copied, setCopied] = useState(false);

  if (!action) return null;

  const {
    outreach_message,
    outreach_channel,
    suggested_feature,
    suggested_feature_doc_path,
    coupon_suggestion,
    coupon_rationale
  } = action;

  const handleCopy = () => {
    if (outreach_message) {
      navigator.clipboard.writeText(outreach_message)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(err => console.error("Falha ao copiar:", err));
    }
  };

  return (
    <div className="glass p-8 rounded-2xl border border-white/40 shadow-sm transition-all duration-300 hover:shadow-lg">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-emerald-100 p-2.5 rounded-xl">
          <Send className="w-5 h-5 text-emerald-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Plano de Ação (Outreach)</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100 shadow-inner">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-blue-800 uppercase tracking-widest">Próximo Passo Recomendado</h3>
          </div>
          <p className="text-blue-900 font-semibold text-lg leading-snug mb-2">
            {suggested_feature}
          </p>
          {suggested_feature_doc_path && (
            <a href="#" className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-white/60 px-3 py-1.5 rounded-lg hover:bg-white transition-colors border border-blue-200">
              <FileText className="w-3.5 h-3.5" />
              {suggested_feature_doc_path}
              <ExternalLink className="w-3 h-3 ml-0.5 opacity-50" />
            </a>
          )}
        </div>

        <div className={`p-6 rounded-2xl border shadow-inner ${coupon_suggestion ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2">
              <Gift className={`w-4 h-4 ${coupon_suggestion ? 'text-emerald-600' : 'text-slate-400'}`} />
              <h3 className={`text-xs font-bold uppercase tracking-widest ${coupon_suggestion ? 'text-emerald-800' : 'text-slate-500'}`}>
                Incentivo de Cupom
              </h3>
            </div>
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${coupon_suggestion ? 'bg-emerald-200/50 text-emerald-800 border border-emerald-200' : 'bg-slate-200/50 text-slate-500 border border-slate-200'}`}>
              {coupon_suggestion ? 'Recomendado' : 'Não Aplicável'}
            </span>
          </div>
          <p className={`text-sm font-medium leading-relaxed ${coupon_suggestion ? 'text-emerald-900/80' : 'text-slate-500'}`}>
            {coupon_rationale}
          </p>
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-xl ring-1 ring-slate-800">
        <div className="flex justify-between items-center px-6 py-4 bg-slate-800/50 border-b border-slate-700/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
            </div>
            <h3 className="text-sm font-semibold text-slate-300 ml-2 tracking-wide">
              Mensagem Sugerida <span className="opacity-50 font-normal">({outreach_channel || 'WhatsApp'})</span>
            </h3>
          </div>
          
          <button
            onClick={handleCopy}
            className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider py-2 px-4 rounded-lg transition-all duration-300 focus:outline-none ${
              copied 
                ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/50' 
                : 'bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copiado
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copiar
              </>
            )}
          </button>
        </div>
        
        <div className="p-6 overflow-x-auto">
          <pre className="text-slate-300 font-mono text-[13px] leading-relaxed whitespace-pre-wrap selection:bg-emerald-500/30 selection:text-white">
            {outreach_message}
          </pre>
        </div>
      </div>
    </div>
  );
}
