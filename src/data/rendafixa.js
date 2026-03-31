const TYPES_RF = {
  "Tesouro Direto": ["SELIC2029", "SELIC2027", "IPCA2035", "IPCA2029", "IPCA2045", "PRE2027", "PRE2031"],
  "CDB Pós-fixado": ["CDB_INTER_POS", "CDB_NUBANK_POS", "CDB_BTG_POS", "CDB_XP_POS"],
  "CDB Prefixado": ["CDB_INTER_PRE", "CDB_DAYCOVAL_PRE", "CDB_MASTER_PRE", "CDB_ABC_PRE"],
};

export const getSectorRF = (s) => { for (const [k, v] of Object.entries(TYPES_RF)) if (v.includes(s)) return k; return null; };
export { TYPES_RF };

export const IND_RF = [
  { key: "rentBruta", label: "Rentabilidade Bruta", unit: "% a.a.", short: "Rent.Bruta", dir: "higher", fmt: "pct", tip: "Retorno anual antes de impostos." },
  { key: "rentLiquida", label: "Rentabilidade Líquida", unit: "% a.a.", short: "Rent.Líq", dir: "higher", fmt: "pct", tip: "Retorno real após IR. LCI/LCA são isentas." },
  { key: "prazo", label: "Prazo", unit: "meses", short: "Prazo", dir: "neutral", fmt: "meses", tip: "Tempo até o vencimento." },
  { key: "liquidez", label: "Liquidez", unit: "dias", short: "Liq.", dir: "lower", fmt: "liq", tip: "D+0 = resgate no mesmo dia. Venc = só no vencimento." },
  { key: "risco", label: "Risco", unit: "1-5", short: "Risco", dir: "lower", fmt: "risco", tip: "1 = Tesouro. 3 = CDB com FGC. 5 = sem garantia." },
  { key: "minimo", label: "Valor Mínimo", unit: "R$", short: "Mín.", dir: "lower", fmt: "brl", tip: "Menor valor pra investir." },
  { key: "indexador", label: "Indexador", unit: "", short: "Index.", dir: "neutral", fmt: "text", tip: "Selic/CDI = pós. IPCA = inflação. Pré = travado." },
  { key: "irEfetivo", label: "IR Efetivo", unit: "%", short: "IR", dir: "lower", fmt: "pct", tip: "Imposto de renda pela tabela regressiva." },
];

export const MACRO_SIGNALS = [
  { signal: "green", type: "Pós-fixados (CDI/Selic)", text: "Selic em 14,75% e com tendência de queda. Pós-fixados ainda pagam muito bem. Janela se fechando." },
  { signal: "green", type: "Prefixados", text: "Taxas pré de 14-16% a.a. historicamente altas. Se a Selic cair como esperado, quem travou agora ganha acima do mercado." },
  { signal: "green", type: "IPCA+", text: "Tesouro IPCA+ pagando juro real de 6%+. Historicamente alto. Excelente pra carregar até o vencimento." },
];

export const DB_RF = {
  SELIC2029: { symbol: "SELIC2029", shortName: "Tesouro Selic 2029", sector: "Tesouro Direto", regularMarketPrice: 14.75, rentBruta: 14.75, rentLiquida: 12.54, prazo: 48, liquidez: 1, risco: 1, minimo: 30, indexador: "Selic", irEfetivo: 15.0, about: "Título pós-fixado que acompanha a Selic. Liquidez D+1. O mais seguro do mercado.", alerta: null, ri: "https://www.tesourodireto.com.br" },
  SELIC2027: { symbol: "SELIC2027", shortName: "Tesouro Selic 2027", sector: "Tesouro Direto", regularMarketPrice: 14.75, rentBruta: 14.75, rentLiquida: 12.54, prazo: 24, liquidez: 1, risco: 1, minimo: 30, indexador: "Selic", irEfetivo: 15.0, about: "Selic com vencimento mais curto. Liquidez D+1. Seguro e previsível.", alerta: null, ri: "https://www.tesourodireto.com.br" },
  IPCA2035: { symbol: "IPCA2035", shortName: "Tesouro IPCA+ 2035", sector: "Tesouro Direto", regularMarketPrice: 11.42, rentBruta: 11.42, rentLiquida: 9.71, prazo: 120, liquidez: 1, risco: 2, minimo: 30, indexador: "IPCA + 6.42%", irEfetivo: 15.0, about: "Protege contra inflação + juro real de 6,42%. Sofre marcação a mercado se vender antes.", alerta: "marcacao", ri: "https://www.tesourodireto.com.br" },
  IPCA2029: { symbol: "IPCA2029", shortName: "Tesouro IPCA+ 2029", sector: "Tesouro Direto", regularMarketPrice: 10.85, rentBruta: 10.85, rentLiquida: 9.22, prazo: 48, liquidez: 1, risco: 2, minimo: 30, indexador: "IPCA + 5.65%", irEfetivo: 15.0, about: "Proteção inflacionária com prazo médio. Juro real de 5,65%.", alerta: "marcacao", ri: "https://www.tesourodireto.com.br" },
  IPCA2045: { symbol: "IPCA2045", shortName: "Tesouro IPCA+ 2045", sector: "Tesouro Direto", regularMarketPrice: 11.80, rentBruta: 11.80, rentLiquida: 10.03, prazo: 240, liquidez: 1, risco: 2, minimo: 30, indexador: "IPCA + 6.60%", irEfetivo: 15.0, about: "Maior juro real disponível. Prazo longo = mais volátil na marcação. Ideal pra aposentadoria.", alerta: "marcacao", ri: "https://www.tesourodireto.com.br" },
  PRE2027: { symbol: "PRE2027", shortName: "Tesouro Prefixado 2027", sector: "Tesouro Direto", regularMarketPrice: 14.50, rentBruta: 14.50, rentLiquida: 12.33, prazo: 24, liquidez: 1, risco: 2, minimo: 30, indexador: "Prefixado", irEfetivo: 15.0, about: "Taxa travada em 14,50%. Se a Selic cair, você ganha mais que o mercado.", alerta: "marcacao", ri: "https://www.tesourodireto.com.br" },
  PRE2031: { symbol: "PRE2031", shortName: "Tesouro Prefixado 2031", sector: "Tesouro Direto", regularMarketPrice: 14.80, rentBruta: 14.80, rentLiquida: 12.58, prazo: 72, liquidez: 1, risco: 2, minimo: 30, indexador: "Prefixado", irEfetivo: 15.0, about: "Taxa mais alta (14,80%). Prazo longo, aposta na queda dos juros.", alerta: "marcacao", ri: "https://www.tesourodireto.com.br" },
  CDB_INTER_POS: { symbol: "CDB_INTER_POS", shortName: "CDB Inter 100% CDI", sector: "CDB Pós-fixado", regularMarketPrice: 14.65, rentBruta: 14.65, rentLiquida: 12.45, prazo: 12, liquidez: 0, risco: 3, minimo: 100, indexador: "100% CDI", irEfetivo: 17.5, about: "CDB Inter com liquidez diária. 100% CDI. FGC até R$250 mil.", alerta: null, ri: "https://www.bancointer.com.br" },
  CDB_NUBANK_POS: { symbol: "CDB_NUBANK_POS", shortName: "CDB Nubank 100% CDI", sector: "CDB Pós-fixado", regularMarketPrice: 14.65, rentBruta: 14.65, rentLiquida: 12.45, prazo: 12, liquidez: 0, risco: 3, minimo: 1, indexador: "100% CDI", irEfetivo: 17.5, about: "CDB Nubank. Liquidez diária, sem mínimo. FGC.", alerta: null, ri: "https://nubank.com.br" },
  CDB_BTG_POS: { symbol: "CDB_BTG_POS", shortName: "CDB BTG 110% CDI", sector: "CDB Pós-fixado", regularMarketPrice: 16.12, rentBruta: 16.12, rentLiquida: 13.70, prazo: 24, liquidez: 720, risco: 3, minimo: 1000, indexador: "110% CDI", irEfetivo: 15.0, about: "CDB BTG 110% CDI. Liquidez no vencimento (2 anos). FGC.", alerta: "travado", ri: "https://www.btgpactual.com" },
  CDB_XP_POS: { symbol: "CDB_XP_POS", shortName: "CDB XP 108% CDI", sector: "CDB Pós-fixado", regularMarketPrice: 15.82, rentBruta: 15.82, rentLiquida: 13.45, prazo: 36, liquidez: 1080, risco: 3, minimo: 5000, indexador: "108% CDI", irEfetivo: 15.0, about: "CDB XP 108% CDI. 3 anos sem liquidez. FGC.", alerta: "travado", ri: "https://www.xpi.com.br" },
  CDB_INTER_PRE: { symbol: "CDB_INTER_PRE", shortName: "CDB Inter Pré 15,2%", sector: "CDB Prefixado", regularMarketPrice: 15.20, rentBruta: 15.20, rentLiquida: 12.92, prazo: 24, liquidez: 720, risco: 3, minimo: 100, indexador: "Prefixado", irEfetivo: 15.0, about: "CDB Inter prefixado 15,2%. Taxa travada. FGC.", alerta: "travado", ri: "https://www.bancointer.com.br" },
  CDB_DAYCOVAL_PRE: { symbol: "CDB_DAYCOVAL_PRE", shortName: "CDB Daycoval Pré 15,5%", sector: "CDB Prefixado", regularMarketPrice: 15.50, rentBruta: 15.50, rentLiquida: 13.18, prazo: 36, liquidez: 1080, risco: 3, minimo: 1000, indexador: "Prefixado", irEfetivo: 15.0, about: "CDB Daycoval 15,5%. Prazo 3 anos. FGC.", alerta: "travado", ri: "https://daycoval.com.br" },
  CDB_MASTER_PRE: { symbol: "CDB_MASTER_PRE", shortName: "CDB Master Pré 16,0%", sector: "CDB Prefixado", regularMarketPrice: 16.00, rentBruta: 16.00, rentLiquida: 13.60, prazo: 48, liquidez: 1440, risco: 4, minimo: 5000, indexador: "Prefixado", irEfetivo: 15.0, about: "CDB Master 16%. Taxa alta, banco menor. FGC protege até R$250 mil.", alerta: "travado", ri: "https://www.bancomaster.com.br" },
  CDB_ABC_PRE: { symbol: "CDB_ABC_PRE", shortName: "CDB ABC Pré 15,0%", sector: "CDB Prefixado", regularMarketPrice: 15.00, rentBruta: 15.00, rentLiquida: 12.75, prazo: 24, liquidez: 720, risco: 3, minimo: 1000, indexador: "Prefixado", irEfetivo: 15.0, about: "CDB ABC 15%. Banco sólido. FGC. 2 anos.", alerta: "travado", ri: "https://ri.abcbrasil.com.br" },
};

export function fmtRF(v, fmt) {
  if (v == null) return "—";
  const numFmt = (v, d = 2) => Number(v).toLocaleString("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d });
  switch (fmt) {
    case "pct": return `${numFmt(v)}%`;
    case "meses": return `${v} meses`;
    case "liq": return v === 0 ? "D+0 (diária)" : v === 1 ? "D+1" : v >= 720 ? "No vencimento" : `D+${v}`;
    case "risco": return ["", "Muito baixo", "Baixo", "Médio (FGC)", "Médio-alto", "Alto"][v] || `${v}`;
    case "brl": return `R$ ${numFmt(v, 0)}`;
    case "text": return v;
    default: return numFmt(v);
  }
}
