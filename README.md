# ATHENA — Protótipo navegável de alta fidelidade

Protótipo de front-end das telas do épico **"Organização, Épicos e Rastreabilidade"** do projeto ATHENA (gestão de requisitos de software — UFLA/Sistemas Distribuídos).

**Como rodar:** abra `index.html` no navegador (Chrome/Safari/Edge). Sem build, sem dependências — HTML/CSS/JS puro, dados mockados em memória (`data.js`).

> As fontes Inter/Newsreader vêm do Google Fonts; sem internet, o sistema usa fontes do SO.

## Telas implementadas (user stories do PDF)

| Tela | US | O que testar |
|---|---|---|
| **Visão geral** — cartões expansíveis de épicos | US08 | Expandir/colapsar épicos, contador "X US", US cancelada não aparece nos épicos ativos |
| **Modal Novo Épico** | US08 | Validação de nome obrigatório, aparece imediato com "0 US" |
| **Modal Adicionar Requisito** | US07 | Título + Pasta/Épico (pré-preenchido se acionado de dentro de um épico) + "Em branco" / "User Story completa" (editor abre com template) |
| **Configurações → Pastas** | US08 | Renomear épico inline, excluir épico (bloqueado se contém requisitos) |
| **Editor de requisitos** | US09–US13 | Toolbar WYSIWYG, auto-save ("Alterações pendentes…" → "Salvo"), título editável no cabeçalho, critérios Dado/Quando/Então, gaveta **Detalhes** com dropdown de pasta (US11), menu … com **Cancelar US** |
| **Ciclo de vida da candidata** | US11/US13/US28 | RASCUNHO → EM_SUBMISSÃO (SAGA) → AGUARDANDO_REVISÃO → APROVADA → PUBLICADA; rejeição exige justificativa; editar APROVADA/PUBLICADA invalida a candidata; cancelar/reativar US |
| **Aba Requisitos** | US18 | Filtros independentes: situação (ATIVO/CANCELADO), estado da candidata, publicação, épico + busca global; empty state; US cancelada com tag "Cancelada" |
| **Mapa** | US14 | Quadro infinito: pan (arrastar), zoom (roda/botões), épicos como pastas, cartões com ID/título/status/relações, US cancelada tracejada, status de projeção |
| **Painel lateral do Mapa** | US15 | Clique num cartão: detalhes, acordeões Relações / Critérios de aceite / Origem, botões **Centralizar no mapa** e **Abrir requisito** (duplo clique também abre) |
| **Grafo de relações** | US17 | Arestas com setas (DEPENDE_DE / BLOQUEIA) e sem seta (RELACIONADO_A), etiqueta centralizada, hover destaca cartão + arestas, tooltip com leitura direcional ("US-001 depende de US-002") |
| **Modal + Conectar relação** | US16 | Busca por código/nome, escolha de semântica com preview de leitura, validação de duplicatas ("leituras inversas representam a mesma aresta"), leituras dos extremos na gaveta (Depende de / É pré-requisito de / Bloqueia / Bloqueada por) |

## Extras de contexto
- **Avatar menu** com **Modo escuro/claro** (US23), notificações (US25 — mock), perfil do usuário.
- **Deep links**: `index.html#mapa`, `#requisitos`, `#editor/US-001`.

## Arquivos
- `index.html` — shell
- `styles.css` — design system (dark/light, tokens CSS)
- `data.js` — dados mockados (projeto, épicos, requisitos, relações, template US)
- `map.js` — canvas infinito, grafo de relações, gaveta lateral, modal de conexão
- `app.js` — shell, Visão Geral, Requisitos, Editor, modais, ciclo de vida
- `tests/test.js` — smoke test funcional (59 checks, roda com jsdom: `npm i jsdom && node tests/test.js`)

## Notas de fidelidade ao documento
- Leituras inversas **não** duplicam arestas (seção 5.4 do Livro de Arquitetura).
- Situação ATIVO/CANCELADO é independente do estado da candidata (US08/US13).
- Cancelar US exige confirmação e remove das listagens ativas, preservando histórico (US13).
- O mapa informa estado da projeção ("atualizada · há instantes") — não anuncia tempo real (US14).
- Papéis cumulativos exibidos em Configurações → Membros (US26 — estático).
