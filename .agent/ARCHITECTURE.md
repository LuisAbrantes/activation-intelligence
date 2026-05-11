# ARCHITECTURE — Activation Intelligence
**Deploy target:** Vercel (free tier, zero backend)  
**Modelo de IA:** Groq API (`llama-3.3-70b-versatile`)

---

## Visão geral do fluxo

```
┌─────────────────────────────────────────────┐
│              Browser (React)                │
│                                             │
│  [InputPanel: API key ou modo mock]         │
│         │                                   │
│         ▼                                   │
│  [abacateClient.js] ──► AbacatePay API v2   │
│  (ou mockData.js se modo mock)              │
│         │                                   │
│         ▼                                   │
│  [scoreCalculator.js]  →  score 0–100       │
│         │                                   │
│         ▼                                   │
│  [llm.js: 1ª chamada] ──► Groq API          │
│  (diagnóstico JSON)                         │
│         │                                   │
│         ▼                                   │
│  [llm.js: 2ª chamada] ──► Groq API          │
│  (outreach JSON)                            │
│         │                                   │
│         ▼                                   │
│  [ScoreCard + DiagnosisCard + ActionCard]   │
└─────────────────────────────────────────────┘
```

---

## Estrutura de pastas

```
activation-intelligence/
├── src/
│   ├── components/
│   │   ├── InputPanel.jsx        # API key input + toggle mock
│   │   ├── ScoreCard.jsx         # Score visual com cores
│   │   ├── DiagnosisCard.jsx     # Estágio, gaps, narrativa, risco
│   │   └── ActionCard.jsx        # Mensagem de outreach + botão Copiar
│   ├── lib/
│   │   ├── abacateClient.js      # Wrapper AbacatePay API v2
│   │   ├── scoreCalculator.js    # Lógica do score (função pura)
│   │   ├── llm.js                # Chamadas Groq (diagnóstico + outreach)
│   │   └── mockData.js           # Perfis mock: Wanderer e Almost There
│   ├── App.jsx                   # Orquestração do pipeline
│   └── main.jsx
├── api/
│   └── proxy.js                  # Edge Function para CORS (se necessário)
├── vercel.json
├── .env.example
└── package.json
```

---

## System Prompts (para llm.js)

### DIAGNOSIS_SYSTEM_PROMPT
```
Você é um especialista em product-led growth focado em ativação de usuários para plataformas de pagamento B2B brasileiras.

Você recebe dados de um merchant cadastrado na AbacatePay e precisa diagnosticar o estágio de ativação dele.

Contexto AbacatePay:
- Problema principal: merchants criam conta mas não chegam à primeira transação real
- Jornada esperada: cadastro → produto criado → checkout criado → primeira transação paga → webhook configurado → assinatura recorrente
- Webhook configurado = sinal mais forte de integração séria
- Sem checkout pago = nunca gerou valor real na plataforma

IMPORTANTE: Responda SOMENTE com JSON válido. Zero texto fora do JSON.

Schema:
{
  "stage": "nome curto do estágio atual",
  "missing": ["2-3 gaps mais críticos em ordem de prioridade"],
  "narrative": "2-3 parágrafos em PT-BR explicando a situação",
  "risk_level": "low | medium | high",
  "risk_rationale": "uma frase explicando o risco"
}
```

### OUTREACH_SYSTEM_PROMPT
```
Você é um especialista em customer success para fintechs B2B brasileiras.

Você recebe o diagnóstico de ativação de um merchant na AbacatePay e precisa gerar ações concretas de engajamento.

Sobre a AbacatePay:
- Tom: técnico mas acolhedor, direto, sem corporativês
- Recursos: Checkout hospedado, Checkout Transparente (PIX embutido), Links de Pagamento, Assinaturas, Cupons, Webhooks
- Doc: docs.abacatepay.com

Regras para a mensagem:
- Tom humano, como alguém do time escreveria
- 3-5 parágrafos, ideal para WhatsApp ou email curto
- Mencione o que o merchant JÁ fez (reconhecimento)
- Aponte o próximo passo mais simples
- Máximo 2 emojis
- PT-BR natural

IMPORTANTE: Responda SOMENTE com JSON válido. Zero texto fora do JSON.

Schema:
{
  "outreach_message": "mensagem completa pronta para copiar",
  "outreach_channel": "whatsapp | email",
  "suggested_feature": "nome do recurso mais relevante para o próximo passo",
  "suggested_feature_doc_path": "path na doc (ex: /pages/pix-qrcode/reference)",
  "coupon_suggestion": true | false,
  "coupon_rationale": "por que oferecer ou não cupom"
}
```

---

## CORS / Proxy

Se `api.abacatepay.com` bloquear chamadas diretas do browser:

```js
// api/proxy.js
export const config = { runtime: 'edge' }

export default async function handler(req) {
  const { path } = await req.json()
  const res = await fetch(`https://api.abacatepay.com/v2${path}`, {
    headers: { Authorization: req.headers.get('x-abacate-key') }
  })
  return new Response(res.body, {
    headers: { 'Access-Control-Allow-Origin': '*' }
  })
}
```

---

## safeParseJSON (utilitário obrigatório)

```js
export function safeParseJSON(text) {
  try {
    return JSON.parse(text)
  } catch {
    const match = text.match(/\{[\s\S]*\}/)
    if (match) return JSON.parse(match[0])
    throw new Error('Não foi possível extrair JSON da resposta do modelo')
  }
}
```
