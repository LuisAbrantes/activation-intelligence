# AGENTS — Divisão de trabalho entre os agentes de desenvolvimento
Este documento define como dividir o trabalho entre os dois agentes de código no Antigravity.

**Agente 1:** Antigravity com Claude Sonnet  
**Agente 2:** Antigravity com Gemini 2.5 Pro

---

## Agente 1 — Claude Sonnet (lógica e integrações)

Responsável por tudo que envolve lógica de negócio, integrações com APIs externas e orquestração.

**Arquivos:**
- `src/lib/abacateClient.js` — 6 chamadas paralelas para a AbacatePay API v2
- `src/lib/scoreCalculator.js` — lógica do Activation Score (função pura)
- `src/lib/llm.js` — duas chamadas para a Groq API (diagnóstico + outreach), com safeParseJSON
- `src/App.jsx` — pipeline completo: fetch → score → diagnóstico → outreach → render
- `api/proxy.js` — Edge Function para CORS se necessário
- `vercel.json` — headers e configuração de deploy
- `.env.example` — documentação das variáveis

**Prompt de entrada para o Agente 1:**
```
Leia CLAUDE.md, PRD.md e ARCHITECTURE.md.
Implemente todos os arquivos da seção "Agente 1" de AGENTS.md.
Use mock data (importado de src/lib/mockData.js) para testar o pipeline completo antes de conectar a API real.
Não implemente os componentes de UI — isso fica para o Agente 2.
Crie um App.jsx que renderize apenas texto simples (console.log ou <pre>) para validar que o pipeline funciona.
```

---

## Agente 2 — Gemini 2.5 Pro (UI e mock data)

Responsável pelos componentes visuais e pelos dados de teste.

**Arquivos:**
- `src/lib/mockData.js` — dois perfis realistas (Wanderer e Almost There), ver specs em CLAUDE.md
- `src/components/InputPanel.jsx` — campo de API key + toggle "Usar dados mock"
- `src/components/ScoreCard.jsx` — score visual (0–100) com cores por faixa, ver CLAUDE.md
- `src/components/DiagnosisCard.jsx` — estágio, lista de gaps, narrativa, badge de risco
- `src/components/ActionCard.jsx` — mensagem de outreach com botão "Copiar", feature sugerida, badge de cupom

**Prompt de entrada para o Agente 2:**
```
Leia CLAUDE.md, PRD.md e ARCHITECTURE.md.
Implemente todos os arquivos da seção "Agente 2" de AGENTS.md.
Os componentes recebem dados via props — não fazem nenhuma chamada de API.
Use Tailwind CSS para estilização.
Regras de cor do score estão em CLAUDE.md.
O botão "Copiar" do ActionCard usa navigator.clipboard.writeText().
```

---

## Ordem de execução recomendada

1. Rodar **Agente 1** primeiro — ele cria o pipeline e valida que os dados fluem corretamente
2. Rodar **Agente 2** depois — ele constrói a UI sobre o pipeline já funcionando
3. Agente 1 integra os componentes no App.jsx final (substituindo o <pre> de validação)
