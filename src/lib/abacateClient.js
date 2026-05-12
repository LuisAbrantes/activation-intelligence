// src/lib/abacateClient.js
// Wrapper para a AbacatePay API v2.
// Em dev, usa o proxy do Vite. Em prod, usa a serverless function /api/abacate.
// A API key nunca é exposta no browser — tudo passa pelo backend.

import { fetchJSON } from './httpClient.js'

const isDev = import.meta.env.DEV

/**
 * Faz um GET autenticado para a AbacatePay API.
 * - Em dev: usa o proxy do Vite (vite.config.js) que reescreve /api/abacate → api.abacatepay.com
 * - Em prod: usa a serverless function /api/abacate que faz o relay com a key do servidor
 *
 * @param {string} path — ex: '/store/get'
 * @param {string} [apiKey] — opcional, só precisa em dev ou se o user fornecer manualmente
 * @param {{ signal?: AbortSignal }} [options]
 * @returns {Promise<any>} — campo `data` da resposta
 */
async function get(path, apiKey, { signal } = {}) {
  let json

  if (isDev) {
    // Dev: Vite proxy reescreve o path, passamos Bearer direto
    json = await fetchJSON(`/api/abacate${path}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    }, { timeoutMs: 10000, signal })
  } else {
    // Prod: serverless function faz o relay; key fica no servidor
    const headers = { 'Content-Type': 'application/json' }
    // Se o user forneceu key manualmente, passamos via header
    if (apiKey) headers['x-abacate-key'] = apiKey

    json = await fetchJSON('/api/abacate', {
      method: 'POST',
      headers,
      body: JSON.stringify({ path }),
    }, { timeoutMs: 10000, signal })
  }

  // Envelope esperado: { data: {...}, success: true, error: null }
  if (!json.success) {
    throw new Error(`AbacatePay ${path}: ${json.error ?? 'erro desconhecido'}`)
  }

  return json.data
}

/**
 * Busca os dados do merchant via 6 chamadas paralelas.
 * @param {string} [apiKey] — chave fornecida pelo usuário (opcional em prod)
 * @param {{ signal?: AbortSignal }} [options]
 * @returns {Promise<{store, customers, checkouts, subscriptions, products, webhooks}>}
 */
export async function fetchMerchantData(apiKey, { signal } = {}) {
  const opts = { signal }

  const [store, customers, checkouts, subscriptions, products, webhooks] =
    await Promise.all([
      get('/store/get', apiKey, opts),
      get('/customers/list', apiKey, opts),
      get('/checkouts/list', apiKey, opts),
      get('/subscriptions/list', apiKey, opts),
      get('/products/list', apiKey, opts),
      get('/webhooks/list', apiKey, opts),
    ])

  return {
    store: store ?? {},
    customers: Array.isArray(customers) ? customers : [],
    checkouts: Array.isArray(checkouts) ? checkouts : [],
    subscriptions: Array.isArray(subscriptions) ? subscriptions : [],
    products: Array.isArray(products) ? products : [],
    webhooks: Array.isArray(webhooks) ? webhooks : [],
  }
}
