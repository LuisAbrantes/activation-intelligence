# CLAUDE.md — Activation Intelligence
Instruções para os agentes de desenvolvimento implementarem este projeto.

**Quem vai usar este documento:**
- **Agente 1 (Antigravity + Claude Sonnet)** — arquitetura, lógica, integrações, orquestração
- **Agente 2 (Antigravity + Gemini 2.5 Pro)** — componentes de UI, mock data, utilitários visuais

Leia os outros documentos antes de começar:
- `PRD.md` — o que construir e por quê
- `ARCHITECTURE.md` — estrutura de pastas, fluxo de dados, decisões técnicas
- `AGENTS.md` — divisão de tarefas entre os dois agentes de desenvolvimento

---

## O que você está construindo

Uma aplicação React que:
1. Recebe a API key de um merchant AbacatePay (ou usa dados mock)
2. Busca os dados desse merchant via AbacatePay API v2
3. Calcula um Activation Score (0–100) com base em sinais objetivos de uso
4. Usa a **API do Groq** (modelo barato) para gerar diagnóstico e mensagem de outreach
5. Exibe tudo numa interface limpa e funcional

---

## Stack

- React 18 + Vite
- Tailwind CSS
- **Groq API** (`llama-3.3-70b-versatile`) — chamada via fetch do browser
- AbacatePay API v2 (`https://api.abacatepay.com/v2`) — Bearer token
- Vercel (deploy, free tier)

Sem backend. Sem banco de dados. Sem autenticação de usuários.

---

## Regras de implementação

1. **Use mock primeiro.** O `mockData.js` deve funcionar sem nenhuma chave da AbacatePay. Só integre a API real depois de tudo funcionando com mock.

2. **JSON parsing defensivo.** O Groq pode retornar texto extra. Use sempre uma função `safeParseJSON(text)` que tente `JSON.parse` e, em caso de falha, extraia JSON do texto com regex simples antes de lançar erro.

3. **Estados de loading explícitos.** O pipeline tem 4 etapas — exiba status para cada uma:
   - "Buscando dados da AbacatePay..."
   - "Calculando score de ativação..."
   - "Analisando perfil do merchant..."
   - "Gerando mensagem de outreach..."

4. **Erros não quebram a UI.** Cada etapa tem try/catch. Se a AbacatePay API falhar, exibe erro e oferece botão "Tentar com dados mock".

5. **Cores do score:**
   - 0–30: vermelho (`#ef4444`)
   - 31–60: amarelo (`#f59e0b`)
   - 61–80: azul (`#3b82f6`)
   - 81–100: verde (`#22c55e`)

6. **Botão "Copiar" na mensagem de outreach.** É o output mais valioso da ferramenta.

7. **Não exponha API keys.** Use `VITE_GROQ_KEY` e `VITE_ABACATE_KEY` via `import.meta.env`. Nunca hardcode. Documentar no `.env.example`.

8. **CORS:** Se as chamadas para `api.abacatepay.com` falharem por CORS, implementar proxy em `api/proxy.js` conforme `ARCHITECTURE.md`. Não usar workarounds com JSONP.

---

## Ordem de implementação

```
[ ] 1. Criar estrutura de pastas (Agente 1)
[ ] 2. Instalar dependências: react, vite, tailwind (Agente 1)
[ ] 3. mockData.js com perfis Wanderer e Almost There (Agente 2)
[ ] 4. scoreCalculator.js e teste com mock (Agente 1)
[ ] 5. llm.js — chamadas Groq para diagnóstico e outreach (Agente 1)
[ ] 6. abacateClient.js com as 6 chamadas paralelas (Agente 1)
[ ] 7. App.jsx com pipeline completo usando mock (Agente 1)
[ ] 8. Componentes: InputPanel, ScoreCard, DiagnosisCard, ActionCard (Agente 2)
[ ] 9. Teste end-to-end com mock (Agente 1)
[ ] 10. Conectar API real e testar com chave real (Agente 1)
[ ] 11. Deploy no Vercel (Agente 1)
```

---

## Chamada para a Groq API

```js
// src/lib/llm.js
export async function callGroq(systemPrompt, userMessage) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_GROQ_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 1000,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
    }),
  })
  const result = await response.json()
  return safeParseJSON(result.choices[0].message.content)
}
```

Usar `callGroq` duas vezes no pipeline:
1. Com `DIAGNOSIS_SYSTEM_PROMPT` + dados do merchant → retorna diagnóstico JSON
2. Com `OUTREACH_SYSTEM_PROMPT` + diagnóstico → retorna mensagem de outreach JSON

Os system prompts completos estão em `ARCHITECTURE.md`.

---

## AbacatePay API — chamadas necessárias

Base URL: `https://api.abacatepay.com/v2`
Header: `Authorization: Bearer <VITE_ABACATE_KEY>`

```js
// src/lib/abacateClient.js
const [store, customers, checkouts, subscriptions, products, webhooks] =
  await Promise.all([
    get('/store/get'),
    get('/customers/list'),
    get('/checkouts/list'),
    get('/subscriptions/list'),
    get('/products/list'),
    get('/webhooks/list'),
  ])
```

Resposta sempre no envelope: `{ data: {...}, success: true, error: null }`

---

## Activation Score — lógica

```js
// src/lib/scoreCalculator.js
export function calculateScore(data) {
  let score = 0
  if (data.products.length > 0)                              score += 15
  if (data.webhooks.length > 0)                              score += 25
  if (data.checkouts.some(c => c.status === 'PAID'))         score += 20
  if (data.customers.some(c => c.taxId))                     score += 10
  if (data.subscriptions.some(s => s.status === 'PAID'))     score += 20
  if (recentVolume(data.checkouts) > 0)                      score += 10
  return score
}
```

---

## Mock Data profiles

### "Wanderer" — caso mais crítico (score esperado: 15)
```js
{
  store: { name: "Financa Soluções Ltda" },
  products: [{ name: "Plano Básico", price: 4900 }],
  customers: [],
  checkouts: [
    { status: 'PENDING', createdAt: '2026-04-10' },
    { status: 'PENDING', createdAt: '2026-04-11' },
  ],
  subscriptions: [],
  webhooks: [],
}
```

### "Almost There" — quase lá (score esperado: 45)
```js
{
  store: { name: "DevTools LTDA" },
  products: [
    { name: "Pro Monthly", price: 9900, cycle: 'MONTHLY' },
    { name: "Pro Annual", price: 99000, cycle: 'ANNUALLY' },
  ],
  customers: [
    { email: 'joao@empresa.com', taxId: '123.456.789-00' },
    { email: 'maria@startup.com', taxId: null },
  ],
  checkouts: [
    { status: 'PAID', createdAt: '2026-04-20' },
    { status: 'PAID', createdAt: '2026-05-01' },
    { status: 'PENDING', createdAt: '2026-05-08' },
  ],
  subscriptions: [],
  webhooks: [],
}
```

---

## vercel.json

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Cross-Origin-Opener-Policy", "value": "same-origin" },
        { "key": "Cross-Origin-Embedder-Policy", "value": "require-corp" }
      ]
    }
  ]
}
```

## .env.example

```
VITE_GROQ_KEY=gsk_sua-chave-aqui
VITE_ABACATE_KEY=abacate_sua-chave-aqui
```
