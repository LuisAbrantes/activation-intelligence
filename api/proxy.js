// api/proxy.js
// Vercel Edge Function para contornar CORS nas chamadas client-side para api.abacatepay.com
// Ativado quando VITE_USE_PROXY=true no .env

export const config = { runtime: 'edge' }

export default async function handler(req) {
  // Aceitar apenas POST
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Método não permitido' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { path } = await req.json()
  const apiKey = req.headers.get('x-abacate-key')

  if (!path || !apiKey) {
    return new Response(JSON.stringify({ error: 'path e x-abacate-key são obrigatórios' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const upstream = await fetch(`https://api.abacatepay.com/v2${path}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  })

  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
