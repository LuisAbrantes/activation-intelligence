// api/groq.js
// Vercel Edge Function — relay seguro para a Groq API.
// A GROQ_KEY fica como env var do Vercel, nunca exposta no browser.

export const config = { runtime: 'edge' }

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Método não permitido' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const apiKey = process.env.GROQ_KEY
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'GROQ_KEY não configurada no servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const body = await req.json()

    const upstream = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
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
    return new Response(JSON.stringify({ error: `Proxy Groq erro: ${err.message}` }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
