// src/hooks/usePipeline.js
// Hook customizado que encapsula toda a lógica do pipeline de análise.
// Mantém o estado, gerencia AbortController, e expõe uma API limpa para o App.

import { useState, useRef, useCallback } from 'react'
import { mockProfiles } from '../lib/mockData.js'
import { calculateScore } from '../lib/scoreCalculator.js'
import { generateDiagnosis, generateOutreach } from '../lib/llm.js'
import { fetchMerchantData } from '../lib/abacateClient.js'
import { INITIAL_PIPELINE_STATE, MOCK_DELAYS } from '../constants/pipeline.js'

/**
 * @param {{ useMock: boolean, mockProfile: string, apiKey: string }} config
 * @returns {{ state, isRunning, isDone, runPipeline, reset }}
 */
export function usePipeline({ useMock, mockProfile, apiKey }) {
  const [state, setState] = useState(INITIAL_PIPELINE_STATE)
  const abortRef = useRef(null)

  const isRunning = state.step >= 0
  const isDone = !isRunning && state.scoreResult !== null

  function setStep(step) {
    setState((prev) => ({ ...prev, step, error: null }))
  }

  function setError(error) {
    setState((prev) => ({
      ...prev,
      error: error.message ?? String(error),
      step: -1,
    }))
  }

  const reset = useCallback(() => {
    // Aborta qualquer requisição em andamento
    abortRef.current?.abort()
    abortRef.current = null
    setState(INITIAL_PIPELINE_STATE)
  }, [])

  const runPipeline = useCallback(async () => {
    // Cancela execução anterior se houver
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    const signal = controller.signal

    setState(INITIAL_PIPELINE_STATE)
    const useRealApi = !useMock

    try {
      // Etapa 0 — Buscar dados
      setStep(0)
      let data
      if (!useRealApi) {
        await new Promise((r) => setTimeout(r, MOCK_DELAYS.fetchData))
        data = mockProfiles[mockProfile]
      } else {
        const key = apiKey.trim()
        if (!key) throw new Error('Informe uma API key da AbacatePay ou ative o modo Mock.')
        data = await fetchMerchantData(key, { signal })
      }

      if (signal.aborted) return
      setState((prev) => ({ ...prev, data }))

      // Etapa 1 — Calcular score
      setStep(1)
      await new Promise((r) => setTimeout(r, MOCK_DELAYS.calculateScore))
      const scoreResult = calculateScore(data)

      if (signal.aborted) return
      setState((prev) => ({ ...prev, scoreResult }))

      // Etapa 2 — Diagnóstico IA
      setStep(2)
      const diagnosis = await generateDiagnosis(scoreResult, data, { signal })

      if (signal.aborted) return
      setState((prev) => ({ ...prev, diagnosis }))

      // Etapa 3 — Outreach IA
      setStep(3)
      const outreach = await generateOutreach(diagnosis, data.store?.name ?? '', { signal })

      if (signal.aborted) return
      setState((prev) => ({ ...prev, outreach, step: -1 }))
    } catch (err) {
      if (err.name === 'AbortError' || signal.aborted) return
      setError(err)
    }
  }, [useMock, mockProfile, apiKey])

  return { state, isRunning, isDone, runPipeline, reset }
}
