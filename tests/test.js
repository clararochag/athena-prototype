// Smoke test funcional do protótipo ATHENA via jsdom
const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

const ROOT = "/Users/anaclaragomes/Projects/athena-prototype";
let html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
// remove links externos e substitui scripts por conteúdo inline (na mesma ordem)
html = html.replace(/<link[^>]*>/g, "");
for (const f of ["data.js", "map.js", "app.js"]) {
  const code = fs.readFileSync(path.join(ROOT, f), "utf8");
  html = html.replace(`<script src="${f}"></script>`, () => `<script>\n${code}\n</script>`);
}

const dom = new JSDOM(html, { runScripts: "dangerously", pretendToBeVisual: true });
const w = dom.window;
const d = w.document;
// stubs para APIs não implementadas no jsdom
w.document.execCommand = () => true;

let pass = 0, fail = 0;
function check(name, cond) {
  if (cond) { pass++; console.log("  ✓ " + name); }
  else { fail++; console.log("  ✗ FALHOU: " + name); }
}
function q(sel) { return d.querySelector(sel); }
function qa(sel) { return [...d.querySelectorAll(sel)]; }
function click(el, opts) { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true, ...(opts || {}) })); }
function input(el, val) { el.value = val; el.dispatchEvent(new w.Event("input", { bubbles: true })); }

(async () => {
  await new Promise(r => setTimeout(r, 50));

  console.log("\n[1] Shell e Visão Geral (US08)");
  check("topbar com marca ATHENA", !!q(".brand-name"));
  check("6 cartões de épico", qa(".epico-card").length === 6);
  check("contagem de US no épico E1 (4 US)", qa(".epico-card")[0].textContent.includes("4 US"));
  check("US cancelada não aparece em épicos ativos", !qa(".epico-card")[0].textContent.includes("US-023"));
  check("expansão: E1 aberto lista US-001", qa(".epico-card")[0].textContent.includes("US-001"));

  console.log("\n[2] Expandir/colapsar épico");
  const e2head = qa(".epico-card")[1].querySelector("[data-toggle-epico]");
  click(e2head);
  check("E2 aberto após clique", qa(".epico-card")[1].classList.contains("open"));
  click(e2head);
  check("E2 fechado após segundo clique", !qa(".epico-card")[1].classList.contains("open"));

  console.log("\n[3] Modal Novo Épico (US08)");
  click(q("[data-new-epico]"));
  check("modal aberto", !!q("#epName"));
  input(q("#epName"), "");
  click(q("#epCreate"));
  check("validação: nome obrigatório", q("#epErr").style.display === "block");
  input(q("#epName"), "Pagamentos e Cash-out");
  click(q("#epCreate"));
  check("épico criado aparece com 0 US", qa(".epico-card").length === 7 && d.body.textContent.includes("Pagamentos e Cash-out"));

  console.log("\n[4] Modal Adicionar Requisito (US07)");
  click(q("[data-new-req]"));
  check("modal aberto com select de épico", !!q("#rqEpico"));
  check("radio 'User Story completa' presente", !!qa("input[name=start]")[1]);
  input(q("#rqTitle"), "Cobrança por boleto");
  qa("input[name=start]")[1].click(); // template
  click(q("#rqCreate"));
  check("redirecionado ao editor", !!q("#docPage"));
  check("editor pré-preenchido com template", q("#docPage").textContent.includes("Especificação"));
  check("nova US em rascunho no novo épico", w.ATH.requirements.some(r => r.title === "Cobrança por boleto" && r.status === "RASCUNHO"));

  console.log("\n[5] Editor (US09–US13)");
  check("título editável", !!q("#edTitle"));
  check("indicador de salvamento", q("#saveState").textContent.includes("Salvo"));
  check("acordeão de critérios", !!q("#critHead"));
  click(q("#addCrit"));
  check("novo bloco Dado/Quando/Então adicionado", qa(".crit-block").length === 1);
  click(q("[data-crit-rm]"));
  check("critério removido", qa(".crit-block").length === 0);
  check("gaveta detalhes com dropdown de pasta", !!q("#dwPasta"));
  // submeter → SAGA → AGUARDANDO_REVISAO
  click(q("[data-action='submit']"));
  check("candidata em EM_SUBMISSAO", w.ATH.requirements.find(r => r.title === "Cobrança por boleto").status === "EM_SUBMISSAO");
  await new Promise(r => setTimeout(r, 1700));
  check("após SAGA: AGUARDANDO_REVISAO", w.ATH.requirements.find(r => r.title === "Cobrança por boleto").status === "AGUARDANDO_REVISAO");
  // aprovar
  click(q("[data-action='approve']"));
  check("candidata APROVADA", w.ATH.requirements.find(r => r.title === "Cobrança por boleto").status === "APROVADA");
  // publicar
  click(q("[data-action='publish']"));
  await new Promise(r => setTimeout(r, 50));
  click(q("#cfmOk"));
  check("PUBLICADA com v1", (() => { const r = w.ATH.requirements.find(r => r.title === "Cobrança por boleto"); return r.status === "PUBLICADA" && r.pubVersion === 1; })());
  // editar conteúdo invalida candidata
  const doc = q("#docPage");
  doc.dispatchEvent(new w.Event("input", { bubbles: true }));
  check("edição invalida PUBLICADA → RASCUNHO", w.ATH.requirements.find(r => r.title === "Cobrança por boleto").status === "RASCUNHO");

  console.log("\n[6] Aba Requisitos (US18)");
  click(qa("#mainTabs .tab")[1]);
  check("tabela com colunas esperadas", q("table.req-table").textContent.includes("Estado da candidata") && q("table.req-table").textContent.includes("Versão publicada"));
  check("linhas = 14 ativas (13 originais + nova) sem cancelada", qa("table.req-table tbody tr[data-open-req]").length === 14);
  check("US-023 (cancelada) fora por padrão", !qa("table.req-table")[0].textContent.includes("US-023"));
  // ATIVO off + CANCELADO on → só canceladas (interseção/união por filtro, US18)
  click(qa(".filter-chip")[0]);
  click(qa(".filter-chip")[1]);
  check("com ATIVO off e CANCELADO on, só canceladas", qa("table.req-table tbody tr[data-open-req]").length === 1);
  click(qa(".filter-chip")[1]);
  check("estado vazio exibido (ambos off)", d.body.textContent.includes("Nenhuma história de usuário encontrada para os filtros aplicados"));
  click(qa(".filter-chip")[0]); // volta ao padrão: ATIVO on, CANCELADO off

  console.log("\n[7] Mapa (US14–US17)");
  click(qa("#mainTabs .tab")[2]);
  check("pastas de épicos no canvas", qa(".folder").length === 7);
  check("cartões de US renderizados", qa(".mcard").length === 15);
  check("arestas SVG desenhadas (10 relações)", qa(".edge").length === 10);
  check("cartão cancelado com estilo distinto", qa(".mcard.cancelled").length === 1);
  check("US-017 mostra 'Em submissão'", qa(".mcard").some(m => m.dataset.id === "US-017" && m.textContent.includes("Em submissão")));

  console.log("\n[8] Seleção + gaveta (US15)");
  const card001 = qa(".mcard").find(m => m.dataset.id === "US-001");
  click(card001);
  check("gaveta abre com detalhes", q("#mapDrawer").classList.contains("open"));
  check("gaveta mostra título e contadores", q("#mapDrawer").textContent.includes("Acesso à conta (Login)"));
  check("acordeões Relações/Critérios/Origem", !!q("#accRel") && !!q("#accCrit") && !!q("#accOrig"));
  check("leituras dos extremos (sem duplicar arestas)", q("#mapDrawer").textContent.includes("Depende de") && q("#mapDrawer").textContent.includes("Relacionada a"));

  console.log("\n[9] Conectar relação (US16)");
  const card010 = qa(".mcard").find(m => m.dataset.id === "US-010");
  click(card010);
  click(q("#btnConnect"));
  check("modal de conexão aberto", !!q("#relSearch"));
  // tentativa de duplicata: US-010 já depende de US-009
  input(q("#relSearch"), "US-009");
  click(qa(".sl-item")[0]);
  qa("#relSemWrap input[name=sem]")[0].click();
  click(q("#relCreate"));
  check("duplicata rejeitada", w.ATH.relations.length === 10 && q("#relError").style.display === "block");
  // relação nova válida: US-010 RELACIONADO_A US-030
  input(q("#relSearch"), "US-030");
  click(qa(".sl-item")[0]);
  qa("#relSemWrap input[name=sem]")[2].click();
  check("preview de leitura direcional", q("#relPreview").textContent.includes("está relacionada a US-030"));
  click(q("#relCreate"));
  check("relação criada (11 arestas)", w.ATH.relations.length === 11 && qa(".edge").length === 11);
  check("contagem de relações do cartão atualizada", qa(".mcard").find(m => m.dataset.id === "US-010").textContent.includes("2 relaç"));

  console.log("\n[10] Remover relação + Abrir requisito (US15/US16)");
  const before = w.ATH.relations.length;
  click(q("[data-rmrel]"));
  check("relação removida", w.ATH.relations.length === before - 1);
  click(q("#btnOpen"));
  check("abre editor a partir do mapa", q("#docPage") && w.ATH.ui.currentReq === "US-010");
  click(q("#edBack"));
  check("voltar retorna ao mapa com gaveta", qa(".mcard").length === 15 && q("#mapDrawer").classList.contains("open"));

  console.log("\n[11] Configurações → Pastas (US08)");
  click(qa("#mainTabs .tab")[0]);
  // cria US dentro do épico novo via botão "+" do card (US07: pasta pré-preenchida)
  const e7card = qa(".epico-card").find(c => c.textContent.includes("Pagamentos e Cash-out"));
  click(e7card.querySelector("[data-add-req]"));
  input(q("#rqTitle"), "Reembolso via Pix");
  click(q("#rqCreate"));
  check("US criada dentro do épico novo (pasta pré-preenchida)", w.ATH.requirements.find(r => r.title === "Reembolso via Pix").epicoId === "E7");
  click(q("#edBack")); // volta à visão geral
  click(q("[data-open-settings]"));
  check("modal configurações na aba Pastas", !!q(".pasta-row"));
  const e7row = qa(".pasta-row").find(r => r.textContent.includes("Pagamentos e Cash-out"));
  check("novo épico listado (1 US)", e7row.textContent.includes("1 US"));
  // excluir épico com requisitos → bloqueado
  click(e7row.querySelector("[data-del-epico]"));
  await new Promise(r => setTimeout(r, 50));
  check("exclusão bloqueada com itens dependentes", qa(".pasta-row").length === 7 && d.body.textContent.includes("contém"));
  // renomear
  click(e7row.querySelector("[data-ren-epico]"));
  const inp = q("[data-ren-input]");
  check("input de renomeação", !!inp);
  input(inp, "Pagamentos");
  click(q("[data-save-ren]"));
  check("épico renomeado", qa(".pasta-row").some(r => r.textContent.includes("Pagamentos")));
  // mover US para outro épico via editor (US11)
  click(q("[data-close]"));
  click(qa("#mainTabs .tab")[1]); // aba Requisitos
  const row010 = qa("tr[data-open-req]").find(r => r.textContent.includes("US-010"));
  click(row010.querySelector("td") || row010);
  check("editor aberto para US-010", w.ATH.ui.currentReq === "US-010");
  const pasta = q("#dwPasta");
  pasta.value = "E5"; pasta.dispatchEvent(new w.Event("change", { bubbles: true }));
  check("US movida de épico (US11)", w.ATH.requirements.find(r => r.id === "US-010").epicoId === "E5");
  // cancelar US (US13)
  click(q("[data-action='cancel']"));
  await new Promise(r => setTimeout(r, 50));
  click(q("#cfmOk"));
  check("US-010 CANCELADA", w.ATH.requirements.find(r => r.id === "US-010").situacao === "CANCELADO");
  click(q("#edBack")); // prevView=requisitos
  check("de volta à listagem", !!q("table.req-table"));
  click(qa(".filter-chip")[0]); click(qa(".filter-chip")[1]); // ATIVO off + CANCELADO on
  check("US-010 aparece com tag Cancelada", qa("tr[data-open-req]").some(r => r.textContent.includes("US-010") && r.textContent.includes("Cancelada")));

  console.log(`\n========== RESULTADO: ${pass} ✓ / ${fail} ✗ ==========`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error("ERRO NO TESTE:", e); process.exit(1); });
