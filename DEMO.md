# Roteiro de demonstração (~4 min) — Protótipo ATHENA

> Pré-requisito: abrir `index.html` no navegador (ou o link ao vivo, se publicado).
> Dica: pressione `Cmd +` / `Cmd -` para ajustar o zoom da tela antes de começar.

## 1. Visão Geral — épicos (US08) · ~40s
- **"14 requisitos em 6 épicos · 10 relações ativas"** no cabeçalho: contexto do projeto em uma linha.
- Expandir **"Organização de projetos"** (clicar no cartão): lista as US do épico com ID, título e estado.
- Mostrar o **contador "4 US"** de "Autenticação e Conta" e apontar que a US-023 (cancelada) **não aparece** nos épicos ativos — ela está apenas na aba Requisitos (US13).
- Clicar em **"Novo Épico"** → digitar "Pagamentos e Cash-out" → Criar: aparece imediatamente com "0 US".

## 2. Adicionar Requisito com template (US07) · ~30s
- Dentro do novo épico, clicar no **"+"** do cartão (pasta pré-preenchida — US07).
- Título: "Reembolso via Pix" → selecionar **"User Story completa"** → Adicionar.
- Editor abre com o template INVEST: seções Especificação, Campos e comportamento, Regras de negócio.

## 3. Editor + ciclo de vida (US09–US13) · ~60s
- Digitar algo no texto: indicador muda para **"Alterações pendentes…"** e volta a **"Salvo"** (auto-save, US09).
- Abrir **"Detalhes"** (gaveta US11): tipo, estado da candidata, versão publicada, dropdown **Pasta** para mover entre épicos.
- Clicar **"Submeter revisão"** → badge **Em submissão** (SAGA) → após ~1,5s vira **Aguardando revisão** com toast "lote de revisão aberto".
- **Aprovar** → **Publicar v1** (modal de confirmação) → toast "publicada no Livro".
- Menu **"…"** → **Cancelar US** (US13): modal de confirmação explica que a US fica com tag "Cancelada" na aba Requisitos.

## 4. Aba Requisitos (US18) · ~30s
- Filtros **independentes**: ligar o chip **CANCELADO** e desligar **ATIVO** → só a US cancelada aparece.
- Situação (ATIVO/CANCELADO) **não se mistura** com estado da candidata nem com publicação — colunas separadas.
- Empty state: desligar os dois chips → "Nenhuma história de usuário encontrada para os filtros aplicados".

## 5. Mapa — telas centrais do épico (US14–US17) · ~80s
- **Arrastar** com o mouse (pan) e dar **zoom** com a roda / botões + ajustar.
- Épicos como **pastas**; cartões mostram ID, título, estado e **nº de relações**; a US cancelada aparece **tracejada**.
- Arestas com **setas** (DEPENDE_DE / BLOQUEIA) e **sem seta** (RELACIONADO_A), com **etiqueta centralizada**.
- Passar o mouse num cartão: arestas conectadas **ganham destaque**, o resto esmaece (US17).
- Passar o mouse numa aresta: tooltip com a **leitura direcional** ("US-028 depende de US-009").

## 6. Gaveta lateral + Conectar relação (US15/US16) · ~50s
- Clicar em **US-016**: gaveta com detalhes e acordeões **Relações / Critérios de aceite / Origem**.
- Relações mostram **leituras dos extremos**: "Depende de US-009" e "É pré-requisito de US-028" — sem arestas duplicadas.
- **"+ Conectar relação"** → buscar "US-030" → escolher **DEPENDE_DE** → preview: "Esta US depende de US-030" → Conectar: aresta nova aparece no mapa e o contador sobe.
- Tentar conectar a **mesma US de novo** → mensagem: já existe (leituras inversas = mesma aresta).
- Botão **"Centralizar no mapa"** (câmera anima até a US) e **"Abrir requisito"** (pula pro editor).

## Fechamento (~10s)
- Menu do avatar → **Modo escuro/claro** (US23).
- Frase-chave: *"Cada clique demonstrado corresponde a um critério de aceitação das user stories US07, US08 e US13–US18 do documento."*

## Se o professor perguntar (arguição provável)
- **"Por que US cancelada não some da tabela?"** → Cancelamento preserva histórico para auditoria; o Livro corrente e as listagens ativas é que a excluem (US13/US27).
- **"Por que 'Depende de' e 'É pré-requisito de' aparecem separados?"** → São leituras da mesma aresta; o catálogo normaliza duplicações (seção 5.4).
- **"O que é a SAGA de 1,5s?"** → Protótipo simula a orquestração Requisitos → Rastreabilidade (retrato) → Revisões (lote) descrita no Livro de Arquitetura.
- **"IA onde entra?"** → Fora do escopo destas telas: sugestões chegam via agente externo MCP e sempre exigem confirmação humana (US29).
