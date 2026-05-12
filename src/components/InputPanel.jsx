import React from 'react';
import { Key, Play, TestTube2, CheckCircle2, Store, Loader2, KeyRound } from 'lucide-react';

export default function InputPanel({ 
  apiKey, 
  setApiKey, 
  useMock, 
  setUseMock, 
  mockProfile, 
  setMockProfile, 
  onAnalyze, 
  loading 
}) {
  return (
    <div className="glass p-8 rounded-2xl mb-8 border border-white/40 shadow-sm transition-all duration-300">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-abacate-100 p-2.5 rounded-xl">
            <KeyRound className="w-5 h-5 text-abacate-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Fonte de Dados</h2>
            <p className="text-sm font-medium text-gray-500">Conecte sua API ou use simulações prontas</p>
          </div>
        </div>
      </div>
      
      <div className="space-y-8">
        {/* API Key Input */}
        <div className={`transition-all duration-500 ${useMock ? 'opacity-40 pointer-events-none filter grayscale' : 'opacity-100'}`}>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2.5">
            AbacatePay API Key
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Key className="w-4 h-4 text-slate-400 group-focus-within:text-abacate-500 transition-colors" />
            </div>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              disabled={useMock || loading}
              placeholder="abacate_live_..."
              className="w-full pl-11 pr-12 py-3.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-abacate-500/20 focus:border-abacate-500 transition-all shadow-sm disabled:bg-slate-50 font-mono text-sm placeholder:font-sans placeholder:text-slate-400 text-slate-700"
            />
            {apiKey && !useMock && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 animate-in zoom-in duration-300">
                <CheckCircle2 className="w-5 h-5 text-abacate-500" />
              </div>
            )}
          </div>
        </div>

        {/* Mode Toggle & Mock Selector */}
        <div className="p-6 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${useMock ? 'bg-abacate-100 text-abacate-600' : 'bg-slate-200 text-slate-500'} transition-colors`}>
                <TestTube2 className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm">Modo de Teste (Mock Data)</p>
                <p className="text-xs font-medium text-slate-500 mt-0.5">Teste a ferramenta sem consumir a API oficial</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={useMock}
                onChange={(e) => setUseMock(e.target.checked)}
                disabled={loading}
                className="sr-only peer"
              />
              <div className="w-12 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-abacate-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-abacate-500"></div>
            </label>
          </div>

          {useMock && (
            <div className="pt-5 border-t border-slate-200/60 animate-in fade-in slide-in-from-top-4 duration-300">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2.5">
                Selecionar Perfil Simulado
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Store className="w-4 h-4 text-slate-400 group-focus-within:text-abacate-500 transition-colors" />
                </div>
                <select
                  value={mockProfile}
                  onChange={(e) => setMockProfile(e.target.value)}
                  disabled={loading}
                  className="w-full pl-11 pr-10 py-3.5 bg-white border border-slate-200 rounded-xl appearance-none focus:outline-none focus:ring-4 focus:ring-abacate-500/20 focus:border-abacate-500 shadow-sm font-medium text-slate-700 transition-all cursor-pointer"
                >
                  <option value="wanderer">Wanderer (Risco Alto, Score: ~15)</option>
                  <option value="almostThere">Almost There (Risco Médio, Score: ~45)</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <button
          onClick={onAnalyze}
          disabled={loading || (!useMock && !apiKey)}
          className={`w-full flex items-center justify-center gap-2.5 py-4 px-6 rounded-xl font-bold text-white transition-all duration-300 ${
            loading || (!useMock && !apiKey) 
              ? 'bg-slate-300 shadow-none cursor-not-allowed opacity-70' 
              : 'bg-abacate-600 hover:bg-abacate-700 shadow-lg hover:shadow-xl hover:shadow-abacate-600/20 hover:-translate-y-0.5 ring-offset-2 focus:ring-4 focus:ring-abacate-500/30 outline-none'
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="tracking-wide">Analisando o Merchant...</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-white/20" />
              <span className="tracking-wide">Gerar Diagnóstico e Outreach</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
