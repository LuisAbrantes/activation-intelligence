# PRD — Activation Intelligence for AbacatePay
**Versão:** 1.0  
**Autor:** Luis (para demonstração na visita AbacatePay)  
**Data:** 2026-05-12  
**Implementação:** Antigravity (Agente 1: Claude Sonnet / Agente 2: Gemini 2.5 Pro)

---

## 1. Problema

A AbacatePay tem um problema real de ativação: muitos merchants criam conta, integram superficialmente ou nem integram, e abandonam a plataforma antes de processar a primeira transação real. O mini CFO virtual deles já responde **o quê** está acontecendo nos dados financeiros. O que falta é uma camada que responda **por que um merchant não ativou** e **o que fazer a respeito**.

---

## 2. Solução

**Activation Intelligence** — uma ferramenta que analisa o perfil de comportamento de cada merchant na AbacatePay e gera um diagnóstico + mensagem de outreach personalizada para a equipe de CS/growth da AbacatePay (ou para o próprio merchant).

A ferramenta usa a API da AbacatePay como fonte de dados e a **API do Groq** (modelo barato) para raciocínio e geração de texto. Não é uma dashboard. É uma análise que fala e gera ação.

---

## 3. Usuários-alvo

**Primário:** Equipe interna da AbacatePay (growth/CS) — usa para identificar e agir sobre merchants em risco de abandono.  
**Secundário (futuro):** O próprio merchant — recebe um relatório de "saúde da integração" com sugestões.

---

## 4. Funcionalidades do MVP

### 4.1 Coleta de dados do merchant
Usando a API AbacatePay v2 (com a API key do merchant ou de conta de demonstração):
- `GET /store/get` — nome e configuração da loja
- `GET /customers/list` — clientes cadastrados
- `GET /checkouts/list` — checkouts criados e seus status
- `GET /subscriptions/list` — assinaturas
- `GET /products/list` — produtos cadastrados
- `GET /webhooks/list` — se configurou webhooks (sinal forte de integração real)

### 4.2 Cálculo de Activation Score (0–100)

| Sinal | Peso | Justificativa |
|---|---|---|
| Tem produto cadastrado | 15 | Integração mínima |
| Tem webhook configurado | 25 | Sinal mais forte de uso real |
| Tem ao menos 1 checkout completo (PAID) | 20 | Primeira transação real |
| Tem cliente com CPF/taxId | 10 | Uso maduro da API |
| Tem assinatura ativa (PAID) | 20 | Produto recorrente = retenção |
| Volume > R$0 nos últimos 30 dias | 10 | Atividade recente |

### 4.3 Diagnóstico por IA (Groq)
Com base no score e nos dados, o modelo gera em linguagem natural (JSON estruturado):
- Estágio atual do merchant na jornada de ativação
- Os 2–3 gaps mais críticos
- Narrativa explicativa em PT-BR
- Nível de risco de abandono (low / medium / high)

### 4.4 Mensagem de outreach (Groq)
Com base no diagnóstico, o modelo gera:
- Mensagem pronta para WhatsApp ou email, em PT-BR, tom humano
- Recomendação de qual feature da AbacatePay usar em seguida
- Sugestão de cupom de incentivo (sim/não com justificativa)

### 4.5 Interface
- Input: API key do merchant ou toggle "Usar dados mock"
- Output: card com score visual, diagnóstico em prosa, mensagem pronta com botão Copiar
- Deploy: Vercel free tier, zero backend

---

## 5. Fora do escopo (MVP)

- Integração com CRM
- Envio automático de mensagens
- Análise de múltiplos merchants em batch
- Autenticação de usuários
- Histórico de análises

---

## 6. Métricas de sucesso (para a AbacatePay usar após adotar)

- % de contas que chegam ao primeiro checkout completo — baseline vs após uso da ferramenta
- Tempo médio até primeira transação — deve reduzir
- % de merchants com webhook configurado — proxy de integração séria

---

## 7. Stack técnica

- React 18 + Vite + Tailwind CSS
- **Groq API** (`llama-3.3-70b-versatile`) — modelo de linguagem, barato e rápido
- AbacatePay API v2 — fonte de dados
- Vercel — deploy

---

## 8. Riscos

| Risco | Mitigação |
|---|---|
| Merchant não ter API key disponível para demo | Usar mock data com perfis realistas |
| CORS bloqueando chamadas client-side para AbacatePay | Proxy via Vercel Edge Function |
| Groq retornar JSON malformado | safeParseJSON() com fallback por regex |
