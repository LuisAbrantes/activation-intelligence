// src/lib/httpClient.js
// Wrapper de fetch com timeout, melhor tratamento de erro,
// e suporte a AbortController para cancelamento externo.

/**
 * Fetch com timeout automático e tratamento de erro padronizado.
 *
 * @param {string} url
 * @param {RequestInit} options — opções padrão do fetch
 * @param {{ timeoutMs?: number, signal?: AbortSignal }} extra
 * @returns {Promise<Response>}
 */
export async function safeFetch(url, options = {}, { timeoutMs = 15000, signal } = {}) {
  const controller = new AbortController()

  // Encadeia o signal externo (se houver) com o timeout interno
  if (signal) {
    signal.addEventListener('abort', () => controller.abort(signal.reason))
  }

  const timeout = setTimeout(() => {
    controller.abort(new DOMException('Timeout de requisição excedido', 'TimeoutError'))
  }, timeoutMs)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })

    return response
  } catch (err) {
    if (err.name === 'AbortError' || err.name === 'TimeoutError') {
      throw new Error(`Requisição para ${url} excedeu o timeout de ${timeoutMs / 1000}s`)
    }
    throw err
  } finally {
    clearTimeout(timeout)
  }
}

/**
 * safeFetch + parse JSON + validação de status.
 *
 * @param {string} url
 * @param {RequestInit} options
 * @param {{ timeoutMs?: number, signal?: AbortSignal }} extra
 * @returns {Promise<any>}
 */
export async function fetchJSON(url, options = {}, extra = {}) {
  const response = await safeFetch(url, options, extra)

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new Error(`HTTP ${response.status}: ${body || response.statusText}`)
  }

  return response.json()
}
