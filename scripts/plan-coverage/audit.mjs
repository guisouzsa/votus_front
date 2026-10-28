// Auditoria SOMENTE LEITURA das propostas do comparador x planos oficiais (TSE).
// Gera src/data/planCoverage.json (cobertura por assunto + conferência dos
// trechos), usado pela página /ComparadorPropostasPage. Nada aqui grava no
// banco nem na API.
//
// Como refazer (numa pasta de trabalho fora do repositório):
//   1. Planos registrados no TSE (cópia do Votus no Supabase), um por candidato:
//      curl -D <id>.headers -o <id>.pdf .../votus-documents/candidates/proposals/<id>.pdf
//      pdftotext -enc UTF-8 <id>.pdf <id>.txt        (poppler; mantém \f entre páginas)
//      ou, sem poppler: pypdf, juntando o texto de cada página com \f
//   2. Páginas de onde a importação extraiu as propostas (CANDS[].siteUrl):
//      curl -o site_lula.html https://lula.com.br/propostas/
//      curl -o site_flavio.html https://www.flaviobolsonaro.com.br/plano-de-governo/leitura
//   3. proposals.json: GET /api/presidential-proposal-comparison/proposals
//      (ou exportação das tabelas government_plan_*, só leitura)
//   4. node audit.mjs -> planCoverage.json (copiar para src/data/) e audit_result.json
//
// Metodologia: ver o bloco "method" gravado no JSON e a lista SUBJECTS abaixo
// (termos buscados por assunto, públicos na própria página).
import fs from 'node:fs';

const norm = (s) => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
const htmlText = (h) => {
  const m = h.match(/<main[\s\S]*?<\/main>/i);
  return (m ? m[0] : h).replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#8211;|&ndash;/g, '–').replace(/\s+/g, ' ').trim();
};

const CANDS = {
  LULA: { id: '280002542548', plan: '280002542548.txt', site: 'site_lula.html', siteUrl: 'https://lula.com.br/propostas/' },
  'FLAVIO BOLSONARO': { id: '280002551544', plan: '280002551544.txt', site: 'site_flavio.html', siteUrl: 'https://www.flaviobolsonaro.com.br/plano-de-governo/leitura' },
};
for (const c of Object.values(CANDS)) {
  const rawPages = fs.readFileSync(c.plan, 'utf8').split('\f');
  // Sumário/índice: linhas com pontilhado até o número da página. Ficam fora
  // da contagem (o nome de um tema no sumário não é menção ao assunto).
  c.indexPages = rawPages.map((p, i) => [i + 1, (p.match(/\.{8,}/g) || []).length]).filter(([, n]) => n >= 5).map(([i]) => i);
  c.pages = rawPages.map((p) => p.replace(/\s+/g, ' ').trim());
  c.pagesNorm = c.pages.map(norm);
  c.planNorm = c.pagesNorm.join(' ');
  c.siteText = htmlText(fs.readFileSync(c.site, 'utf8'));
  c.siteNorm = norm(c.siteText);
}

// ---------- 1. Auditoria das propostas armazenadas ----------
const proposals = JSON.parse(fs.readFileSync('proposals.json', 'utf8'));
const pageOf = (c, needle) => { const n = norm(needle); const i = c.pagesNorm.findIndex((p) => p.includes(n)); return i < 0 ? null : i + 1; };
const tokens = (s) => new Set(norm(s).replace(/[^a-z0-9 ]/g, ' ').split(' ').filter((w) => w.length > 3));
const jacc = (a, b) => { const A = tokens(a), B = tokens(b); const i = [...A].filter((x) => B.has(x)).length; return i / (A.size + B.size - i || 1); };

const rows = proposals.map((p) => {
  const c = CANDS[p.candidate];
  const ex = p.source_excerpt;
  return {
    id: p.id, candidate: p.candidate, theme: p.theme, title: p.title,
    excerpt_present: !!ex,
    excerpt_in_source_page: ex ? c.siteNorm.includes(norm(ex)) : null,
    excerpt_in_tse_plan_page: ex ? pageOf(c, ex) : null,
    source_url: p.source_url,
    source_url_is_configured_source: p.source_url.replace(/\/$/, '') === c.siteUrl.replace(/\/$/, ''),
  };
});
const dups = [];
for (let i = 0; i < proposals.length; i++) for (let j = i + 1; j < proposals.length; j++) {
  const a = proposals[i], b = proposals[j];
  if (a.candidate === b.candidate && jacc(a.title + ' ' + a.description, b.title + ' ' + b.description) >= 0.6) dups.push([a.id, b.id, a.title, b.title]);
}

// ---------- 2. Comparação site x plano TSE (shingles de 8 palavras) ----------
const shingles = (s) => { const w = norm(s).replace(/[^a-z0-9 ]/g, ' ').split(' ').filter(Boolean); const set = new Set(); for (let i = 0; i + 8 <= w.length; i++) set.add(w.slice(i, i + 8).join(' ')); return set; };
const siteVsPlan = {};
for (const [name, c] of Object.entries(CANDS)) {
  const S = shingles(c.siteText), P = shingles(c.pages.join(' '));
  const inter = [...S].filter((x) => P.has(x)).length;
  siteVsPlan[name] = { site_chars: c.siteText.length, plan_chars: c.pages.join(' ').length, plan_pages: c.pages.length,
    site_text_found_in_plan_pct: +(100 * inter / (S.size || 1)).toFixed(1), plan_text_covered_by_site_pct: +(100 * inter / (P.size || 1)).toFixed(1) };
}

// ---------- 3. Matriz de cobertura temática (texto integral dos planos TSE) ----------
// Cada assunto: termos buscados (sem acento, minúsculas, início de palavra).
const SUBJECTS = [
  ['educacao-basica', 'Educação básica', 'Educação', ['educacao basica', 'ensino fundamental', 'ensino medio', 'alfabetiza', 'creche', 'escola']],
  ['ensino-tecnico', 'Ensino técnico e profissionalizante', 'Educação', ['ensino tecnico', 'educacao profissional', 'profissionalizante', 'institutos federais', 'qualificacao profissional', 'curso tecnico']],
  ['ensino-superior', 'Ensino superior e pesquisa', 'Educação', ['universidade', 'ensino superior', 'pos-graduacao', 'pos graduacao', 'capes', 'cnpq']],
  ['livros-leitura', 'Livros, leitura e bibliotecas', 'Educação', ['livro', 'leitura', 'biblioteca', 'leitor']],
  ['saude-sus', 'Saúde pública e SUS', 'Saúde', ['sus', 'saude publica', 'atencao primaria', 'atencao basica', 'hospita', 'medicamento', 'vacina']],
  ['seguranca', 'Segurança pública', 'Segurança', ['seguranca publica', 'policia', 'crime organizado', 'faccao', 'faccoes', 'homicidio', 'violencia']],
  ['trabalho-renda', 'Trabalho, emprego e renda', 'Economia', ['emprego', 'salario minimo', 'trabalhador', 'desemprego', 'renda']],
  ['economia-impostos', 'Economia, impostos e contas públicas', 'Economia', ['imposto', 'tributa', 'tributo', 'inflacao', 'juros', 'divida publica', 'fiscal']],
  ['habitacao', 'Habitação', 'Cidades', ['moradia', 'habitacao', 'habitacional', 'casa propria', 'minha casa']],
  ['saneamento', 'Saneamento', 'Cidades', ['saneamento', 'esgoto', 'agua potavel']],
  ['infraestrutura', 'Infraestrutura e mobilidade', 'Cidades', ['rodovia', 'ferrovia', 'porto', 'aeroporto', 'mobilidade', 'transporte publico']],
  ['meio-ambiente', 'Meio ambiente e clima', 'Meio ambiente', ['meio ambiente', 'climatic', 'mudanca do clima', 'mudancas do clima', 'desmatamento', 'amazonia', 'emissoes', 'biodiversidade']],
  ['agricultura', 'Agricultura e desenvolvimento rural', 'Meio ambiente', ['agricultura', 'agricultor', 'agropecuari', 'agronegocio', 'reforma agraria', 'produtor rural']],
  ['energia', 'Energia', 'Economia', ['energia', 'petroleo', 'combustive', 'renovave', 'eletrica']],
  ['ciencia-tecnologia', 'Ciência, tecnologia e inovação', 'Ciência', ['ciencia', 'tecnologia', 'inovacao', 'inteligencia artificial', 'pesquisa cientifica']],
  ['assistencia-pobreza', 'Assistência social e combate à pobreza', 'Direitos sociais', ['bolsa familia', 'pobreza', 'fome', 'assistencia social', 'cadunico', 'cadastro unico']],
  ['previdencia', 'Previdência', 'Direitos sociais', ['previdencia', 'aposentad', 'inss']],
  ['criancas-jovens', 'Crianças, adolescentes e juventude', 'Direitos sociais', ['crianca', 'adolescente', 'infancia', 'juventude', 'jovens']],
  ['mulheres', 'Mulheres', 'Direitos sociais', ['mulher', 'feminicidio', 'violencia domestica', 'igualdade de genero']],
  ['igualdade-racial', 'Igualdade racial', 'Direitos sociais', ['racismo', 'igualdade racial', 'populacao negra', 'quilombola']],
  ['povos-indigenas', 'Povos indígenas', 'Direitos sociais', ['indigena', 'povos originarios']],
  ['pessoa-deficiencia', 'Pessoas com deficiência', 'Direitos sociais', ['pessoa com deficiencia', 'pessoas com deficiencia', 'acessibilidade', 'pcd']],
  ['transparencia-corrupcao', 'Transparência e combate à corrupção', 'Instituições', ['corrupcao', 'transparencia', 'integridade']],
  ['instituicoes-democracia', 'Democracia e instituições', 'Instituições', ['democracia', 'democratic', 'constituicao', 'liberdade de expressao', 'supremo']],
  ['defesa-soberania', 'Defesa e soberania', 'Instituições', ['soberania', 'forcas armadas', 'defesa nacional']],
  ['cultura', 'Cultura', 'Cultura e esporte', ['cultura', 'cultural', 'artista', 'patrimonio historico']],
  ['esporte', 'Esporte e lazer', 'Cultura e esporte', ['esporte', 'esportiv', 'lazer']],
];
const termRe = (t) => new RegExp('(^|[^a-z0-9])' + t.replace(/[-]/g, '[- ]') + '[a-z]*', 'g');
const snippet = (raw, rawNorm, idx, len) => {
  // posição aproximada no texto original (mesmo comprimento após normalização NFD+remoção de acentos)
  const start = Math.max(0, idx - 140), end = Math.min(raw.length, idx + len + 160);
  return (start > 0 ? '…' : '') + raw.slice(start, end).trim() + (end < raw.length ? '…' : '');
};
const coverage = [];
for (const [slug, label, group, terms] of SUBJECTS) {
  const entry = { slug, label, group, terms, candidates: {} };
  for (const [name, c] of Object.entries(CANDS)) {
    let occurrences = 0; const pages = []; const excerpts = [];
    c.pagesNorm.forEach((pn, i) => {
      if (c.indexPages.includes(i + 1)) return;
      let found = 0, firstIdx = -1, firstLen = 0;
      for (const t of terms) { const re = termRe(t); let m; while ((m = re.exec(pn))) { found++; if (firstIdx < 0) { firstIdx = m.index + m[1].length; firstLen = m[0].length; } } }
      if (found) { occurrences += found; pages.push(i + 1); if (excerpts.length < 3 && c.pages[i].length === pn.length) excerpts.push({ page: i + 1, text: snippet(c.pages[i], pn, firstIdx, firstLen) }); }
    });
    // propostas armazenadas que tratam do assunto (mesmos termos em título/descrição/trecho)
    const stored = proposals.filter((p) => p.candidate === name && terms.some((t) => termRe(t).test(norm(p.title + ' ' + p.description + ' ' + (p.source_excerpt || '')))));
    entry.candidates[name] = { plan_pages_with_mention: pages.length, occurrences, pages, excerpts, stored_proposals: stored.map((p) => p.id) };
  }
  coverage.push(entry);
}

// ---------- 3b. Cada proposta x plano TSE (para propostas sem trecho, ex.: texto literal do site) ----------
// Palavras de ligação e de discurso ficam fora das contagens; a lista é pública
// no JSON (method.ignored_words) para qualquer um conferir.
const STOPWORDS = ('a o e de da do das dos em no na nos nas um uma uns umas para por com sem sob sobre que se ao aos as os ou mais menos como entre ate apos antes pelo pela pelos pelas seu sua seus suas este esta estes estas esse essa isso isto aquele aquela ja nao sim muito muita muitos muitas todo toda todos todas cada outro outra outros outras ser sao foi foram sera serao tem ter temos tera tambem quando onde qual quais quem mas porem pois assim bem ainda so apenas desde durante mesmo mesma nosso nossa nossos nossas forma meio partir sendo seja sejam modo vez vezes fazer feito faz pode podem deve devem havera houve hoje agora contra tanto tanta tantos tantas').split(' ');
const DISCOURSE = ('vamos vamo continuar continuaremos seguiremos queremos estamos avancar avancaremos retomar retomamos alem disso proximo atual mandato mandatos presidente lula flavio bolsonaro governo programa plano capitulo aqui dentro primeiro lugar pontos percentuais brasil brasileiro brasileira brasileiros brasileiras pais').split(' ');
const IGNORED = new Set([...STOPWORDS, ...DISCOURSE]);
const contentWords = (s) => norm(s).replace(/[^a-z0-9 ]/g, ' ').split(' ').filter((w) => w.length > 3 && !IGNORED.has(w) && !/^\d+$/.test(w));

for (const c of Object.values(CANDS)) c.pageWordSets = c.pages.map((p) => new Set(contentWords(p)));
const planMatch = (p) => {
  const c = CANDS[p.candidate];
  const literalPage = (text) => { const n = norm(text); if (n.length < 12) return null; const i = c.pagesNorm.findIndex((pg, k) => !c.indexPages.includes(k + 1) && pg.includes(n)); return i < 0 ? null : i + 1; };
  const words = [...new Set(contentWords(`${p.title} ${p.description}`))];
  let best = null, share = 0;
  c.pageWordSets.forEach((set, i) => {
    if (c.indexPages.includes(i + 1)) return;
    const s = words.filter((w) => set.has(w)).length / (words.length || 1);
    if (s > share) { share = s; best = i + 1; }
  });
  return { title_in_plan_page: literalPage(p.title), text_in_plan_page: literalPage(p.description), closest_plan_page: best, shared_words_pct: Math.round(100 * share) };
};
const matches = Object.fromEntries(proposals.map((p) => [p.id, planMatch(p)]));

// ---------- 3c. Palavras-chave de cada plano (expressões de duas palavras) ----------
// Conta pares de palavras seguidas (sem as palavras ignoradas) em cada página
// do plano, fora sumário/índice. Entram os pares que aparecem em ao menos 3
// páginas; ordem = número de ocorrências.
const keywords = {};
const bigramsOf = (c) => {
  const count = new Map(), pages = new Map();
  c.pages.forEach((pg, i) => {
    if (c.indexPages.includes(i + 1)) return;
    const w = contentWords(pg);
    for (let k = 0; k + 1 < w.length; k++) {
      if (w[k] === w[k + 1]) continue;
      const b = `${w[k]} ${w[k + 1]}`;
      count.set(b, (count.get(b) || 0) + 1);
      if (!pages.has(b)) pages.set(b, new Set());
      pages.get(b).add(i + 1);
    }
  });
  return { count, pages };
};
// Grafia com acento: a primeira ocorrência do par no texto original da página.
const displayForm = (c, bigram, page) => {
  const [a, b] = bigram.split(' ');
  const raw = c.pages[page - 1];
  const re = /[A-Za-zÀ-ÿ0-9]+/g; const toks = []; let m;
  while ((m = re.exec(raw))) toks.push(m[0]);
  const kept = toks.filter((t) => { const n = norm(t); return n.length > 3 && !IGNORED.has(n) && !/^\d+$/.test(n); });
  for (let k = 0; k + 1 < kept.length; k++) if (norm(kept[k]) === a && norm(kept[k + 1]) === b) return `${kept[k].toLowerCase()} ${kept[k + 1].toLowerCase()}`;
  return bigram;
};
const bigramIndex = {};
for (const [name, c] of Object.entries(CANDS)) bigramIndex[name] = bigramsOf(c);
for (const [name, c] of Object.entries(CANDS)) {
  const { count, pages } = bigramIndex[name];
  keywords[c.id] = [...count.entries()]
    .filter(([b]) => pages.get(b).size >= 3)
    .sort((x, y) => y[1] - x[1] || x[0].localeCompare(y[0]))
    .slice(0, 20)
    .map(([b, n]) => { const pg = [...pages.get(b)].sort((x, y) => x - y); return { term: displayForm(c, b, pg[0]), occurrences: n, pages: pg }; });
}
// Expressões presentes nos dois planos (ao menos 2 páginas em cada).
const [nameA, nameB] = Object.keys(CANDS);
const sharedKeywords = [...bigramIndex[nameA].count.keys()]
  .filter((b) => bigramIndex[nameA].pages.get(b).size >= 2 && bigramIndex[nameB].pages.get(b)?.size >= 2)
  .map((b) => ({ b, total: bigramIndex[nameA].count.get(b) + bigramIndex[nameB].count.get(b) }))
  .sort((x, y) => y.total - x.total || x.b.localeCompare(y.b))
  .slice(0, 15)
  .map(({ b }) => ({
    term: displayForm(CANDS[nameA], b, [...bigramIndex[nameA].pages.get(b)][0]),
    candidates: Object.fromEntries([nameA, nameB].map((n) => [CANDS[n].id, { occurrences: bigramIndex[n].count.get(b), pages: [...bigramIndex[n].pages.get(b)].sort((x, y) => x - y) }])),
  }));

fs.writeFileSync('audit_result.json', JSON.stringify({ generated_at: new Date().toISOString(), siteVsPlan, proposals: rows, plan_matches: matches, duplicates: dups, coverage, keywords, sharedKeywords }, null, 2));

// ---------- 4. Arquivo para o front (src/data/planCoverage.json) ----------
const headersDate = (id) => { try { return (fs.readFileSync(id + '.headers', 'utf8').match(/last-modified:\s*(.+)/i) || [])[1]?.trim() ?? null; } catch { return null; } };
const front = {
  generated_at: new Date().toISOString(),
  method: {
    unit: 'páginas do plano oficial com ao menos um dos termos buscados (sem contar sumário e índice)',
    search: 'texto extraído do PDF, comparado sem acentos e sem diferenciar maiúsculas; termo casado no início de palavra',
    stored_proposals: 'propostas extraídas e armazenadas no Votus cujo título, resumo ou trecho contém algum dos termos',
    plan_match: 'para cada proposta: página do plano TSE em que o título ou o texto aparecem iguais (sem acentos e maiúsculas) e, à parte, a página com mais palavras da proposta em comum (percentual das palavras da proposta presentes na página). Palavras em comum não provam que a proposta está no plano, nem a falta delas prova que não está',
    keywords: 'pares de palavras seguidas mais repetidos em cada plano, fora sumário e índice, presentes em ao menos 3 páginas; palavras de ligação e de discurso ignoradas (lista em ignored_words)',
    ignored_words: [...IGNORED].sort(),
  },
  documents: Object.fromEntries(Object.entries(CANDS).map(([name, c]) => [c.id, {
    name,
    plan_pdf_url: `https://bibpgfltcdrgbxvvnixn.supabase.co/storage/v1/object/public/votus-documents/candidates/proposals/${c.id}.pdf`,
    plan_pdf_last_modified: headersDate(c.id),
    plan_pages: c.pages.filter((p) => p !== '').length,
    index_pages: c.indexPages,
    extraction_source_url: c.siteUrl,
    extraction_source_text_found_in_plan_pct: siteVsPlan[name].site_text_found_in_plan_pct,
  }])),
  subjects: coverage.map((e) => ({
    slug: e.slug, label: e.label, group: e.group, terms: e.terms,
    candidates: Object.fromEntries(Object.entries(e.candidates).map(([name, v]) => [CANDS[name].id, {
      plan_pages: v.pages, excerpts: v.excerpts, stored_proposal_ids: v.stored_proposals,
    }])),
  })),
  proposal_checks: Object.fromEntries(rows.map((r) => [r.id, {
    excerpt_in_plan_page: r.excerpt_in_tse_plan_page, excerpt_in_extraction_source: r.excerpt_in_source_page, ...matches[r.id],
  }])),
  // Mesma conferência por "<external_id>|<título normalizado>", para quando a
  // API não devolve o id da proposta (endpoints por tema).
  proposal_checks_by_key: Object.fromEntries(rows.map((r) => [`${CANDS[r.candidate].id}|${norm(r.title)}`, {
    excerpt_in_plan_page: r.excerpt_in_tse_plan_page, excerpt_in_extraction_source: r.excerpt_in_source_page, ...matches[r.id],
  }])),
  keywords,
  shared_keywords: sharedKeywords,
  duplicates: dups.map(([a, b]) => [a, b]),
};
fs.writeFileSync('planCoverage.json', JSON.stringify(front, null, 1));

// ---------- resumo ----------
console.log('== Site x plano TSE'); console.log(siteVsPlan);
const by = (k) => rows.reduce((a, r) => { const key = r.candidate + ' | ' + k(r); a[key] = (a[key] || 0) + 1; return a; }, {});
console.log('\n== Trechos (source_excerpt)'); console.log(by((r) => r.excerpt_present ? (r.excerpt_in_source_page ? 'trecho confere com a página-fonte' : 'trecho NÃO encontrado na página-fonte') : 'sem trecho'));
console.log(by((r) => r.excerpt_present ? (r.excerpt_in_tse_plan_page ? 'trecho encontrado no plano TSE' : 'trecho NÃO está no plano TSE') : 'sem trecho'));
console.log('fonte = página configurada:', by((r) => r.source_url_is_configured_source));
console.log('\n== Possíveis duplicatas (similaridade >= 0.6):', dups.length); dups.slice(0, 8).forEach((d) => console.log('  ', d[0], d[1], '|', d[2], '||', d[3]));
console.log('\n== Propostas x plano TSE (título/texto iguais | % palavras em comum na página mais próxima)');
for (const [name] of Object.entries(CANDS)) {
  const ms = proposals.filter((p) => p.candidate === name).map((p) => matches[p.id]);
  const lit = ms.filter((m) => m.title_in_plan_page || m.text_in_plan_page).length;
  const bands = [[50, 101], [30, 50], [0, 30]].map(([lo, hi]) => ms.filter((m) => m.shared_words_pct >= lo && m.shared_words_pct < hi).length);
  console.log(name.padEnd(18), `${ms.length} propostas | ${lit} com título ou texto igual no plano | ≥50%: ${bands[0]}  30–49%: ${bands[1]}  <30%: ${bands[2]}`);
}
console.log('\n== Palavras-chave'); for (const [id, list] of Object.entries(keywords)) console.log(id, list.map((k) => `${k.term}(${k.occurrences})`).join(', '));
console.log('em comum:', sharedKeywords.map((k) => k.term).join(', '));
console.log('\n== Matriz de cobertura (páginas do plano TSE com menção | propostas armazenadas)');
for (const e of coverage) {
  const L = e.candidates.LULA, F = e.candidates['FLAVIO BOLSONARO'];
  console.log(e.label.padEnd(42), 'Lula', String(L.plan_pages_with_mention).padStart(3), 'pág |', String(L.stored_proposals.length).padStart(2), 'prop   ||  Flávio', String(F.plan_pages_with_mention).padStart(3), 'pág |', String(F.stored_proposals.length).padStart(2), 'prop');
}
