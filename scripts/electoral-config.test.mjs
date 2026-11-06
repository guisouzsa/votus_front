// Regras do Gerador de Cola Eleitoral. Rodar com: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ELECTIONS,
  POSITION_RULES,
  VOTING_ORDER,
  buildBallot,
  buildCustomElection,
  describeBallot,
  expectedDigits,
  getElection,
  getRounds,
  getRunoffPositions,
  getStatesFor,
  validateBallot,
} from "../src/lib/electoralConfig.ts";

const geral2026 = getElection("eleicoes-gerais-2026");
const geral2030 = getElection("eleicoes-gerais-2030");
const municipal = getElection("eleicoes-municipais-2028");
const custom = (base, positions, senateVacancies = 1) => buildCustomElection({ base, positions, senateVacancies });
const labels = (slots) => slots.map((slot) => slot.label);
const digits = (slots) => slots.map((slot) => slot.digits);

test("geral de 2026: seis escolhas na ordem da urna", () => {
  const slots = buildBallot(geral2026, { state: "CE" });
  assert.deepEqual(labels(slots), [
    "Deputado Federal",
    "Deputado Estadual",
    "Senador — 1ª vaga",
    "Senador — 2ª vaga",
    "Governador",
    "Presidente",
  ]);
  assert.deepEqual(digits(slots), [4, 5, 3, 3, 2, 2]);
  assert.deepEqual(slots.map((slot) => slot.order), [1, 2, 3, 4, 5, 6]);
});

test("uma vaga de senador gera um campo, sem indicar vaga", () => {
  const slots = buildBallot(geral2030, { state: "CE" });
  assert.equal(slots.filter((slot) => slot.position === "senador").length, 1);
  assert.ok(labels(slots).includes("Senador"));
  assert.equal(slots.length, 5);
});

test("municipal regular: vereador antes de prefeito", () => {
  const slots = buildBallot(municipal, { state: "CE" });
  assert.deepEqual(labels(slots), ["Vereador", "Prefeito"]);
  assert.deepEqual(digits(slots), [5, 2]);
});

test("apenas prefeito, apenas vereador: um campo só", () => {
  assert.deepEqual(labels(buildBallot(custom("municipal", ["prefeito"]))), ["Prefeito"]);
  assert.deepEqual(labels(buildBallot(custom("municipal", ["vereador"]))), ["Vereador"]);
});

test("apenas presidente, apenas senador", () => {
  assert.deepEqual(labels(buildBallot(custom("general", ["presidente"]))), ["Presidente"]);
  assert.deepEqual(labels(buildBallot(custom("general", ["senador"]))), ["Senador"]);
});

test("presidente e senador saem na ordem da urna, não na ordem marcada", () => {
  const slots = buildBallot(custom("general", ["presidente", "senador"], 2));
  assert.deepEqual(labels(slots), ["Senador — 1ª vaga", "Senador — 2ª vaga", "Presidente"]);
  assert.deepEqual(slots.map((slot) => slot.order), [1, 2, 3]);
});

test("outra combinação permitida: governador e deputado federal", () => {
  assert.deepEqual(labels(buildBallot(custom("general", ["governador", "deputado-federal"]))), ["Deputado Federal", "Governador"]);
});

test("cargo de outro modelo não entra na configuração", () => {
  assert.deepEqual(labels(buildBallot(custom("municipal", ["prefeito", "presidente", "senador"]))), ["Prefeito"]);
});

test("segundo turno municipal: apenas prefeito", () => {
  assert.deepEqual(labels(buildBallot(municipal, { round: 2 })), ["Prefeito"]);
});

test("segundo turno geral: presidente e governador, na ordem da urna", () => {
  assert.deepEqual(labels(buildBallot(geral2026, { round: 2 })), ["Governador", "Presidente"]);
});

test("segundo turno só para presidente ou só para governador", () => {
  assert.deepEqual(labels(buildBallot(geral2026, { round: 2, runoffPositions: ["presidente"] })), ["Presidente"]);
  assert.deepEqual(labels(buildBallot(geral2026, { round: 2, runoffPositions: ["governador"] })), ["Governador"]);
});

test("segundo turno nunca traz cargo proporcional nem senador, mesmo se pedido", () => {
  const slots = buildBallot(geral2026, { round: 2, runoffPositions: ["senador", "deputado-federal", "presidente"] });
  assert.deepEqual(labels(slots), ["Presidente"]);
});

test("sem cargo com segundo turno, não existe a opção de 2º turno", () => {
  assert.deepEqual(getRounds(custom("municipal", ["vereador"])), [1]);
  assert.deepEqual(getRounds(custom("general", ["senador"])), [1]);
  assert.deepEqual(getRounds(custom("municipal", ["prefeito"])), [1, 2]);
  assert.deepEqual(getRunoffPositions(geral2026), ["governador", "presidente"]);
});

test("dígitos: cada cargo com os seus", () => {
  const esperado = { vereador: 5, "deputado-federal": 4, "deputado-estadual": 5, senador: 3, prefeito: 2, governador: 2, presidente: 2 };
  for (const [id, valor] of Object.entries(esperado)) assert.equal(POSITION_RULES[id].digits, valor, id);
});

test("validação: número pela metade é erro; vazio não é", () => {
  const slots = buildBallot(geral2026, { state: "CE" });
  const [federal, estadual] = slots;
  assert.deepEqual(validateBallot(slots, {}), {});
  const erros = validateBallot(slots, { [federal.id]: { numero: "12  " }, [estadual.id]: { numero: "12345" } });
  assert.equal(erros[federal.id], "Preencha os 4 dígitos.");
  assert.equal(erros[estadual.id], undefined);
});

test("validação: mesmo número nas duas vagas do senado é erro", () => {
  const slots = buildBallot(geral2026, { state: "CE" });
  const senado = slots.filter((slot) => slot.position === "senador");
  const repetido = validateBallot(slots, { [senado[0].id]: { numero: "123" }, [senado[1].id]: { numero: "123" } });
  assert.equal(repetido[senado[1].id], "Escolha um número diferente em cada vaga.");
  assert.equal(repetido[senado[0].id], undefined);
  assert.deepEqual(validateBallot(slots, { [senado[0].id]: { numero: "123" }, [senado[1].id]: { numero: "456" } }), {});
});

test("validação: números iguais em cargos diferentes podem", () => {
  const slots = buildBallot(geral2026, { state: "CE" });
  const governador = slots.find((slot) => slot.position === "governador");
  const presidente = slots.find((slot) => slot.position === "presidente");
  assert.deepEqual(validateBallot(slots, { [governador.id]: { numero: "13" }, [presidente.id]: { numero: "13" } }), {});
});

test("voto de legenda: só nos proporcionais, com 2 dígitos", () => {
  const todos = [...buildBallot(geral2026), ...buildBallot(municipal)];
  const comLegenda = [...new Set(todos.filter((slot) => slot.allowsPartyVote).map((slot) => slot.position))].sort();
  assert.deepEqual(comLegenda, ["deputado-estadual", "deputado-federal", "vereador"]);

  const [federal] = buildBallot(geral2026);
  assert.equal(expectedDigits(federal, { numero: "", legenda: true }), 2);
  assert.deepEqual(validateBallot([federal], { [federal.id]: { numero: "13", legenda: true } }), {});

  const senador = buildBallot(geral2026).find((slot) => slot.position === "senador");
  assert.equal(expectedDigits(senador, { numero: "", legenda: true }), 3);
  assert.equal(validateBallot([senador], { [senador.id]: { numero: "13", legenda: true } })[senador.id], "Preencha os 3 dígitos.");
});

test("dados de candidatos: só onde o Votus realmente tem", () => {
  const ofices = (slots) => slots.map((slot) => slot.candidateOffice);
  assert.deepEqual(ofices(buildBallot(geral2026, { state: "CE" })), [
    "deputado-federal",
    "deputado-estadual",
    "senado",
    "senado",
    "governador",
    "presidente",
  ]);
  // Fora do Ceará só Presidente tem candidatos na base.
  assert.deepEqual(ofices(buildBallot(geral2026, { state: "SP" })), [undefined, undefined, undefined, undefined, undefined, "presidente"]);
  // Eleições sem dados nunca consultam.
  for (const election of [municipal, geral2030, custom("general", ["presidente"])]) {
    assert.ok(buildBallot(election, { state: "CE" }).every((slot) => slot.candidateOffice === undefined), election.id);
  }
});

test("Distrito Federal: deputado distrital e sem eleição municipal", () => {
  assert.equal(buildBallot(geral2026, { state: "DF" })[1].label, "Deputado Distrital");
  assert.ok(!getStatesFor("municipal").some(({ uf }) => uf === "DF"));
  assert.ok(getStatesFor("general").some(({ uf }) => uf === "DF"));
  assert.equal(getStatesFor("general").length, 27);
});

test("identificação da colinha", () => {
  assert.equal(describeBallot(geral2026, { round: 1, state: "CE" }), "Eleições 2026 · 1º turno · CE");
  assert.equal(describeBallot(municipal, { round: 2, state: "CE", municipio: " Fortaleza " }), "Eleições 2028 · 2º turno · Fortaleza/CE");
  assert.equal(describeBallot(custom("municipal", ["vereador"]), { round: 1, state: "PE" }), "Eleição suplementar · PE");
});

test("toda eleição configurada é coerente", () => {
  const ids = ELECTIONS.map((election) => election.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const election of ELECTIONS) {
    assert.ok(election.sources.length > 0, `${election.id} sem fonte`);
    assert.ok(election.validation.note, `${election.id} sem situação de validação`);
    const ordem = VOTING_ORDER[election.base];
    const posicoes = election.positions.map(({ position }) => ordem.indexOf(position));
    assert.ok(posicoes.every((p) => p >= 0), `${election.id} com cargo de outro modelo`);
    assert.deepEqual(posicoes, [...posicoes].sort((a, b) => a - b), `${election.id} fora da ordem da urna`);
  }
});
