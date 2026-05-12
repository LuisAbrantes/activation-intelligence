// api/abacate.js
// Vercel Edge Function — relay seguro para a AbacatePay API.
// A ABACATE_KEY fica como env var do Vercel, nunca exposta no browser.
// Aceita POST com { path } no body, ou o frontend pode passar sua própria key via header.

export const config = { runtime: 'edge' }

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Método não permitido' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const { path } = await req.json()

    if (!path) {
      return new Response(JSON.stringify({ error: 'Campo "path" é obrigatório' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Prioridade: header do request > env var do servidor
    const apiKey = req.headers.get('x-abacate-key') || process.env.ABACATE_KEY

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key não fornecida e ABACATE_KEY não configurada no servidor' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const upstream = await fetch(`https://api.abacatepay.com/v2${path}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    })

    const data = await upstream.text()

    return new Response(data, {
      status: upstream.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: `Proxy AbacatePay erro: ${err.message}` }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
