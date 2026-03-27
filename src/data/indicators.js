export const IND_ACOES = [
  { key: "priceToBook", label: "P/VP", unit: "x", short: "P/VP", dir: "lower", src: "STATUS", fmt: "x", tip: "Preço sobre Valor Patrimonial. Abaixo de 1x pode indicar desconto." },
  { key: "priceEarnings", label: "P/L", unit: "x", short: "P/L", dir: "lower", src: "STATUS", fmt: "x", tip: "Quantos anos de lucro para pagar o investimento. Quanto menor, mais barato." },
  { key: "priceToEbit", label: "P/Ebit", unit: "x", short: "P/Ebit", dir: "lower", src: "STATUS", fmt: "x", tip: "Preço sobre lucro operacional. Desconsidera impostos e juros." },
  { key: "evToEbit", label: "EV/EBIT", unit: "x", short: "EV/EBIT", dir: "lower", src: "STATUS", fmt: "x", tip: "Valor da firma (com dívidas) sobre EBIT. Mais completo que P/L." },
  { key: "netMargin", label: "Margem Líquida", unit: "%", short: "Marg.Líq", dir: "higher", src: "STATUS", fmt: "pct", tip: "Percentual do faturamento que sobra como lucro. Quanto maior, melhor." },
  { key: "roe", label: "ROE", unit: "%", short: "ROE", dir: "higher", src: "STATUS", fmt: "pct", tip: "Retorno sobre Patrimônio. Acima de 15% é considerado bom." },
  { key: "netIncome", label: "Lucro Líquido", unit: "R$ bilhões", short: "Lucro", dir: "higher", src: "FUNDAMENTUS", fmt: "bi", tip: "Lucro final após deduções. Empresas lucrativas são mais seguras." },
  { key: "grossDebt", label: "Dívida Bruta", unit: "R$ bilhões", short: "Dív.Bruta", dir: "lower", src: "TRADE MAP", fmt: "bi", tip: "Total de dívidas. Quanto menor, menos risco financeiro." },
  { key: "equity", label: "Patrimônio Líq.", unit: "R$ bilhões", short: "PL", dir: "higher", src: "TRADE MAP", fmt: "bi", tip: "Bens menos dívidas. Quanto maior, mais sólida." },
  { key: "debtToEquity", label: "DB/PL", unit: "x", short: "DB/PL", dir: "lower", src: "TRADE MAP", fmt: "x", tip: "Dívida sobre Patrimônio. Acima de 1x = dívida supera patrimônio." },
  { key: "cagr", label: "CAGR Lucro", unit: "%", short: "CAGR", dir: "higher", src: "STATUS", fmt: "pct", tip: "Crescimento anual composto do lucro em 5 anos. Acima de 10% é positivo." },
  { key: "dividendYield", label: "Dividend Yield", unit: "%", short: "DY", dir: "higher", src: "STATUS", fmt: "pct", tip: "Percentual pago em dividendos em 12 meses. Acima de 6% é bom." },
];

export const IND_FIIS = [
  { key: "vacancy", label: "Vacância Física", unit: "%", short: "Vacânc.", dir: "lower", src: "FII INFO", fmt: "pct", tip: "Percentual de imóveis desocupados. Quanto menor, melhor." },
  { key: "equity", label: "Patrimônio Líquido", unit: "R$ milhões", short: "PL", dir: "higher", src: "CVM", fmt: "mi", tip: "Valor dos ativos menos obrigações. Fundos maiores são mais diversificados." },
  { key: "assets", label: "Ativos Imobilizados", unit: "R$ milhões", short: "Imob.", dir: "higher", src: "CVM", fmt: "mi", tip: "Valor dos imóveis físicos do fundo." },
  { key: "debt", label: "Dívida", unit: "R$ milhões", short: "Dívida", dir: "lower", src: "CVM", fmt: "mi", tip: "Total de dívidas (CRIs, debêntures). Mais risco com juros altos." },
  { key: "pvp", label: "P/VP", unit: "x", short: "P/VP", dir: "lower", src: "STATUS", fmt: "x", tip: "Abaixo de 1x = desconto, acima de 1x = ágio sobre o patrimônio." },
  { key: "dy12m", label: "DY 12 Meses", unit: "% a.a.", short: "DY 12M", dir: "higher", src: "STATUS", fmt: "pct", tip: "Dividend Yield acumulado em 12 meses. Acima de 8% é atrativo." },
  { key: "returnYTD", label: "Retorno no Ano", unit: "%", short: "Ret.Ano", dir: "higher", src: "STATUS", fmt: "pct", tip: "Valorização da cota + proventos no ano corrente." },
  { key: "risk", label: "Risco", unit: "0–100", short: "Risco", dir: "lower", src: "ANÁLISE", fmt: "score", tip: "Score 0–100: volatilidade, vacância e alavancagem. Abaixo de 30 é conservador." },
  { key: "liquidity", label: "Liquidez Diária", unit: "R$ milhões/dia", short: "Liq.", dir: "higher", src: "B3", fmt: "money", tip: "Volume médio negociado por dia. Acima de R$ 1 milhão/dia é boa liquidez." },
  { key: "portfolioQual", label: "Qualidade Portfólio", unit: "0–100", short: "Qual.", dir: "higher", src: "ANÁLISE", fmt: "score", tip: "Score 0–100: localização, inquilinos e diversificação. Acima de 80 é excelente." },
  { key: "distHistory", label: "Histórico Proventos", unit: "0–100", short: "Hist.", dir: "higher", src: "STATUS", fmt: "score", tip: "Score 0–100: consistência dos proventos em 24 meses. Acima de 85 é estável." },
];
