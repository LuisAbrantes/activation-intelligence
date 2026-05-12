# Activation Intelligence — AbacatePay

O **Activation Intelligence** é uma ferramenta de Customer Success e Vendas B2B para analisar o engajamento e a saúde da integração dos lojistas na plataforma AbacatePay.

## O que a aplicação faz? (Modelo de Negócio)

O objetivo principal é **identificar se um lojista está extraindo o máximo de valor da AbacatePay** e **fornecer insumos prontos para a equipe comercial abordá-lo**.

Em vez de um humano analisar manualmente o painel do cliente, a aplicação:
1. Puxa os dados reais da loja.
2. Calcula um **Score de Ativação (0 a 100)** baseado no uso de recursos (webhooks, checkouts, assinaturas).
3. Usa uma Inteligência Artificial para analisar esses dados e escrever um e-mail personalizado com dicas de melhoria.

### Diagrama Visual do Fluxo

```mermaid
sequenceDiagram
    actor CS as Equipe Comercial / CS
    participant App as App (Activation Intelligence)
    participant API as AbacatePay (Base de Dados)
    participant AI as Inteligência Artificial

    CS->>App: 1. Insere a API Key do Lojista (ou usa Mock)
    App->>API: 2. Busca dados (Vendas, Clientes, Produtos)
    API-->>App: Retorna os dados brutos
    App->>App: 3. Calcula o "Score de Ativação"
    App->>AI: 4. Envia o Score + Dados para Análise
    AI-->>App: Retorna o diagnóstico e o rascunho do e-mail
    App-->>CS: 5. Exibe a nota e o e-mail pronto na tela
```

### Resumo de Valor
* **Para a AbacatePay:** Aumenta o volume processado, garantindo que os clientes terminem o setup e vendam mais.
* **Para a Equipe de CS:** Economiza horas de análise de contas e redação de e-mails, entregando contatos ("outreach") mais quentes e direcionados.
