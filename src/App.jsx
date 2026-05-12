import { useState } from 'react'
import { ShieldCheck, CheckCircle2, Circle, ArrowRight } from 'lucide-react'

import { usePipeline } from './hooks/usePipeline.js'
import { PIPELINE_STEPS } from './constants/pipeline.js'

import ErrorBoundary from './components/ui/ErrorBoundary.jsx'
import InputPanel from './components/InputPanel.jsx'
import ScoreCard from './components/ScoreCard.jsx'
import DiagnosisCard from './components/DiagnosisCard.jsx'
import ActionCard from './components/ActionCard.jsx'

export default function App() {
  const [apiKey, setApiKey] = useState('')
  const [useMock, setUseMock] = useState(true)
  const [mockProfile, setMockProfile] = useState('wanderer')

  const { state, isRunning, isDone, runPipeline, reset } = usePipeline({
    useMock,
    mockProfile,
    apiKey,
  })

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-abacate-200 selection:text-abacate-900">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-12 text-center md:text-left flex flex-col md:flex-row items-center md:items-start gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-abacate-400 to-abacate-600 rounded-2xl flex items-center justify-center shadow-lg shadow-abacate-500/20 transform rotate-3">
            <span className="text-4xl filter drop-shadow-sm">🥑</span>
          </div>
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">
              Activation <span className="text-abacate-600">Intelligence</span>
            </h1>
            <p className="text-lg text-gray-500 mt-2 font-medium">
              Diagnóstico de integração e ações de outreach guiadas por IA.
            </p>
          </div>
        </header>

        <InputPanel 
          apiKey={apiKey}
          setApiKey={setApiKey}
          useMock={useMock}
          setUseMock={setUseMock}
          mockProfile={mockProfile}
          setMockProfile={(val) => { setMockProfile(val); reset(); }}
          onAnalyze={runPipeline}
          loading={isRunning}
        />

        {/* Status das etapas */}
        {(isRunning || state.error) && (
          <div className="glass p-8 rounded-2xl shadow-sm border border-gray-200 mb-8 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex items-center gap-2 mb-6">
              <ShieldCheck className="w-5 h-5 text-abacate-600" />
              <h3 className="text-lg font-bold text-gray-900">Processamento em tempo real</h3>
            </div>
            
            <div className="relative">
              <div className="absolute left-3.5 top-2 bottom-2 w-0.5 bg-gray-100"></div>
              <div className="space-y-6 relative">
                {PIPELINE_STEPS.map((label, i) => {
                  const done = state.step > i || isDone
                  const active = state.step === i
                  
                  return (
                    <div key={i} className={`flex items-start gap-4 transition-all duration-300 ${active ? 'scale-[1.02]' : ''}`}>
                      <div className="bg-white relative z-10">
                        {done ? (
                          <CheckCircle2 className="w-7 h-7 text-abacate-500 bg-white" />
                        ) : active ? (
                          <div className="w-7 h-7 rounded-full border-2 border-abacate-500 border-t-transparent animate-spin bg-white"></div>
                        ) : (
                          <Circle className="w-7 h-7 text-gray-200 bg-white" />
                        )}
                      </div>
                      <div className="pt-0.5">
                        <p className={`font-semibold text-lg ${done ? 'text-gray-900' : active ? 'text-abacate-700' : 'text-gray-400'}`}>
                          {label}
                        </p>
                        {active && <p className="text-sm text-abacate-600/80 font-medium">Processando...</p>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Erro */}
        {state.error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-2xl mb-8 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-in fade-in slide-in-from-top-4">
            <div>
              <h3 className="text-red-800 font-bold text-lg mb-1">Erro na Análise</h3>
              <p className="text-red-700 font-medium">
                {state.error}
              </p>
            </div>
            <button
              onClick={runPipeline}
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-red-600 border border-red-200 hover:bg-red-50 hover:border-red-300 rounded-xl font-bold transition-colors shadow-sm whitespace-nowrap"
            >
              Tentar com Mock <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Resultado Visual */}
        {isDone && (
          <ErrorBoundary>
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                  <ScoreCard score={state.scoreResult.score} />
                </div>
                <div className="md:col-span-2">
                  <DiagnosisCard diagnosis={state.diagnosis} />
                </div>
              </div>
              <ActionCard action={state.outreach} />
            </div>
          </ErrorBoundary>
        )}
      </div>
    </div>
  )
}
