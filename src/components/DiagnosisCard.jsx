import React from 'react';
import { AlertCircle, CheckCircle2, ShieldAlert, Sparkles, Target } from 'lucide-react';

export default function DiagnosisCard({ diagnosis }) {
  if (!diagnosis) return null;

  const { stage, missing, narrative, risk_level, risk_rationale } = diagnosis;

  const getRiskColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'low': return 'bg-green-50 text-green-700 border-green-200 ring-green-500/20';
      case 'medium': return 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20';
      case 'high': return 'bg-red-50 text-red-700 border-red-200 ring-red-500/20';
      default: return 'bg-slate-50 text-slate-700 border-slate-200 ring-slate-500/20';
    }
  };

  const getRiskLabel = (level) => {
    switch (level?.toLowerCase()) {
      case 'low': return 'Baixo';
      case 'medium': return 'Médio';
      case 'high': return 'Alto';
      default: return level || 'Indefinido';
    }
  };

  const getRiskIcon = (level) => {
    switch (level?.toLowerCase()) {
      case 'low': return <CheckCircle2 className="w-4 h-4 mr-1.5" />;
      case 'medium': return <AlertCircle className="w-4 h-4 mr-1.5" />;
      case 'high': return <ShieldAlert className="w-4 h-4 mr-1.5" />;
      default: return null;
    }
  };

  return (
    <div className="glass p-8 rounded-2xl mb-8 border border-white/40 shadow-sm transition-all duration-300 hover:shadow-lg">
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2.5 rounded-xl">
            <Sparkles className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Diagnóstico de Integração</h2>
        </div>
        
        {risk_level && (
          <div className="flex flex-col items-end">
            <span className={`flex items-center px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ring-2 ring-offset-2 ${getRiskColor(risk_level)}`}>
              {getRiskIcon(risk_level)}
              Risco: {getRiskLabel(risk_level)}
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-4 space-y-6">
          <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-100">
            <h3 className="flex items-center text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
              <Target className="w-4 h-4 mr-2" />
              Estágio Atual
            </h3>
            <p className="text-lg font-semibold text-gray-900">{stage}</p>
          </div>

          {missing && missing.length > 0 && (
            <div className="bg-red-50/50 p-5 rounded-2xl border border-red-100">
              <h3 className="text-xs font-bold text-red-800 uppercase tracking-widest mb-3">Gaps Identificados</h3>
              <ul className="space-y-3">
                {missing.map((item, index) => (
                  <li key={index} className="flex items-start text-red-900/80 text-sm font-medium">
                    <span className="text-red-500 mr-2.5 mt-0.5 shrink-0">
                      <AlertCircle className="w-4 h-4" />
                    </span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="md:col-span-8 space-y-6">
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Análise Detalhada</h3>
            <div className="text-slate-700 whitespace-pre-wrap leading-relaxed bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-white/60 shadow-sm font-medium text-[15px]">
              {narrative}
            </div>
          </div>

          {risk_rationale && (
            <div className="flex items-start bg-amber-50/50 border border-amber-100 p-5 rounded-2xl">
              <ShieldAlert className="w-5 h-5 text-amber-600 mr-3 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-amber-800 uppercase tracking-widest mb-1">Motivo do Risco</h4>
                <p className="text-sm font-medium text-amber-900/80 leading-relaxed">
                  {risk_rationale}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
