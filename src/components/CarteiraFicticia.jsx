"use client";
import { useState, useMemo } from "react";
import { C, MN, FN, PAL } from "../lib/theme";
import { fmtBRL, numFmt } from "../lib/utils";
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip as RTooltip, BarChart, Bar, XAxis, YAxis } from "recharts";
import { DB_A } from "../data/acoes";
import { DB_F } from "../data/fiis";
import UpgradeModal from "./UpgradeModal";
import SponsorSlot from "./SponsorSlot";

const ALL_ASSETS = { ...DB_A, ...DB_F };

const CATEGORIES = {
  rf: { label: "Renda Fixa", icon: "🏦", color: C.blue },
  fii: { label: "FIIs", icon: "🏢", color: C.accent },
  acoes: { label: "Ações", icon: "📈", color: C.orange },
  cripto: { label: "Cripto", icon: "₿", color: C.purple },
};

const PROJECTIONS = [1, 5, 10, 20, 30];

// Average annual returns for projection
const RATES = { rf: 0.1275, fii: 0.11, acoes: 0.12, cripto: 0.15 };

function getCategory(symbol) {
  if (DB_A[symbol]) return "acoes";
  if (DB_F[symbol]) return "fii";
  return "rf";
}

export default function CarteiraFicticia({ user, onGoCompare }) {
  const [assets, setAssets] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [showUpgrade, setShowUpgrade] = useState(false);

  // Load cart from localStorage (populated by long press in comparator)
  useState(() => {
    try {
      const cart = JSON.parse(localStorage.getItem("comparai_cart") || "[]");
      if (cart.length > 0) setAssets(cart);
    } catch {}
  });
  const [rfManual, setRfManual] = useState([]);
  const [rfName, setRfName] = useState("");
  const [rfValue, setRfValue] = useState("");

  const isPremium = user?.is_premium || user?.is_admin;

  const addAsset = (symbol) => {
    if (assets.find((a) => a.symbol === symbol)) return;
    setAssets((prev) => [...prev, { symbol, value: 0, category: getCategory(symbol) }]);
    setShowAdd(false);
    setSearchQ("");
  };

  const addRfManual = () => {
    if (!rfName.trim() || !rfValue) return;
    const id = `RF_${Date.now()}`;
    setAssets((prev) => [...prev, { symbol: id, customName: rfName.trim(), value: parseFloat(rfValue) || 0, category: "rf" }]);
    setRfName("");
    setRfValue("");
  };

  const updateValue = (symbol, val) => {
    setAssets((prev) => prev.map((a) => a.symbol === symbol ? { ...a, value: parseFloat(val) || 0 } : a));
  };

  const removeAsset = (symbol) => {
    setAssets((prev) => prev.filter((a) => a.symbol !== symbol));
  };

  const totalMensal = useMemo(() => assets.reduce((s, a) => s + a.value, 0), [assets]);

  const allocByCategory = useMemo(() => {
    const alloc = { rf: 0, fii: 0, acoes: 0, cripto: 0 };
    assets.forEach((a) => { alloc[a.category] = (alloc[a.category] || 0) + a.value; });
    return alloc;
  }, [assets]);

  const allocPct = useMemo(() => {
    if (totalMensal === 0) return { rf: 0, fii: 0, acoes: 0, cripto: 0 };
    return Object.fromEntries(Object.entries(allocByCategory).map(([k, v]) => [k, Math.round((v / totalMensal) * 100)]));
  }, [allocByCategory, totalMensal]);

  const pieData = useMemo(() => {
    return Object.entries(allocByCategory)
      .filter(([_, v]) => v > 0)
      .map(([k, v]) => ({ name: CATEGORIES[k].label, value: v, fill: CATEGORIES[k].color }));
  }, [allocByCategory]);

  // Weighted average return rate
  const weightedRate = useMemo(() => {
    if (totalMensal === 0) return 0.12;
    let weighted = 0;
    Object.entries(allocByCategory).forEach(([cat, val]) => {
      weighted += (val / totalMensal) * (RATES[cat] || 0.10);
    });
    return weighted;
  }, [allocByCategory, totalMensal]);

  // Compound interest projections
  const projections = useMemo(() => {
    const monthlyRate = weightedRate / 12;
    return PROJECTIONS.map((years) => {
      const months = years * 12;
      // FV = PMT * [(1+i)^n - 1] / i
      const patrimonio = totalMensal > 0
        ? totalMensal * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate)
        : 0;
      const rendaPassiva = patrimonio * 0.01; // 1% ao mês
      return { years, patrimonio, rendaPassiva };
    });
  }, [totalMensal, weightedRate]);

  // Suggested allocation from philosophy
  const suggested = user?.philosophy_allocation || { rf: 60, fii: 25, acoes: 15, cripto: 0 };

  const searchResults = useMemo(() => {
    if (searchQ.length < 1) return [];
    const q = searchQ.toUpperCase();
    return Object.values(ALL_ASSETS)
      .filter((a) => !assets.find((x) => x.symbol === a.symbol))
      .filter((a) => a.symbol.includes(q) || a.shortName.toUpperCase().includes(q))
      .slice(0, 8);
  }, [searchQ, assets]);

  if (!isPremium && assets.length >= 3) {
    // Free users can only add 2 assets to carteira (show upgrade after)
  }

  return (
    <div>
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} message="Monte sua carteira completa com ativos ilimitados. Faça upgrade para Premium!" />}

      <h2 style={{ fontFamily: MN, fontSize: 18, fontWeight: 800, color: C.white, margin: "0 0 8px" }}>💼 Minha Carteira Fictícia</h2>
      <p style={{ color: C.textDim, fontSize: 13, marginBottom: 24, lineHeight: 1.7 }}>
        Monte sua carteira simulada, defina valores mensais e veja as projeções de patrimônio e renda passiva.
        {user?.philosophy && <span style={{ color: C.accent }}> Sua filosofia: {user.philosophy}</span>}
      </p>

      {/* Add assets section */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20, marginBottom: 16 }}>
        <div style={{ fontFamily: MN, fontSize: 12, color: C.textDim, marginBottom: 12 }}>ADICIONAR ATIVOS</div>

        {/* Search for stocks/FIIs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <input
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            placeholder="Buscar ação ou FII... (ex: ITUB4, HGLG11)"
            style={{ flex: 1, padding: "10px 14px", background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 13, fontFamily: FN, outline: "none" }}
          />
        </div>

        {searchResults.length > 0 && (
          <div style={{ background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 10, maxHeight: 180, overflowY: "auto", marginBottom: 12 }}>
            {searchResults.map((r) => (
              <button key={r.symbol} onClick={() => {
                if (!isPremium && assets.length >= 3) { setShowUpgrade(true); return; }
                addAsset(r.symbol);
              }}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "8px 14px", background: "transparent", border: "none", borderBottom: `1px solid ${C.border}`, cursor: "pointer", color: C.text, fontFamily: FN, fontSize: 12, textAlign: "left" }}
                onMouseEnter={(e) => e.currentTarget.style.background = C.card}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <span><span style={{ fontFamily: MN, fontWeight: 700, color: C.white, marginRight: 8 }}>{r.symbol}</span>{r.shortName}</span>
                <span style={{ color: C.accent, fontSize: 11 }}>+ Adicionar</span>
              </button>
            ))}
          </div>
        )}

        {/* Manual RF entry */}
        <div style={{ fontSize: 11, color: C.textMuted, fontFamily: MN, marginBottom: 8, marginTop: 8 }}>OU ADICIONAR RENDA FIXA MANUALMENTE:</div>
        <div style={{ display: "flex", gap: 8 }}>
          <input value={rfName} onChange={(e) => setRfName(e.target.value)} placeholder="Ex: Tesouro Selic 2029"
            style={{ flex: 1, padding: "10px 14px", background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 12, fontFamily: FN, outline: "none" }} />
          <input value={rfValue} onChange={(e) => setRfValue(e.target.value)} placeholder="R$/mês" type="number"
            style={{ width: 100, padding: "10px 14px", background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 12, fontFamily: MN, outline: "none" }} />
          <button onClick={addRfManual} style={{ padding: "10px 16px", borderRadius: 10, background: `${C.blue}15`, color: C.blue, border: `1px solid ${C.blue}30`, fontSize: 12, fontFamily: MN, cursor: "pointer" }}>+</button>
        </div>
      </div>

      {/* Asset list with value inputs */}
      {assets.length > 0 && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20, marginBottom: 16 }}>
          <div style={{ fontFamily: MN, fontSize: 12, color: C.textDim, marginBottom: 12 }}>MEUS ATIVOS ({assets.length})</div>
          {assets.map((a, i) => {
            const info = ALL_ASSETS[a.symbol];
            const cat = CATEGORIES[a.category];
            return (
              <div key={a.symbol} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: i < assets.length - 1 ? `1px solid ${C.border}` : "none" }}>
                <span style={{ fontSize: 16 }}>{cat.icon}</span>
                <div style={{ flex: 1 }}>
                  <span style={{ fontFamily: MN, fontWeight: 700, color: C.white, fontSize: 13 }}>{a.customName || a.symbol}</span>
                  {info && <span style={{ color: C.textDim, fontSize: 11, marginLeft: 8 }}>{info.shortName}</span>}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 11, color: C.textMuted }}>R$</span>
                  <input value={a.value || ""} onChange={(e) => updateValue(a.symbol, e.target.value)} type="number" placeholder="0"
                    style={{ width: 80, padding: "6px 10px", background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 13, fontFamily: MN, outline: "none", textAlign: "right" }} />
                  <span style={{ fontSize: 10, color: C.textMuted }}>/mês</span>
                </div>
                <button onClick={() => removeAsset(a.symbol)} style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 14 }}
                  onMouseEnter={(e) => e.target.style.color = C.red} onMouseLeave={(e) => e.target.style.color = C.textMuted}>×</button>
              </div>
            );
          })}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
            <span style={{ fontFamily: MN, fontSize: 13, fontWeight: 700, color: C.white }}>Total mensal:</span>
            <span style={{ fontFamily: MN, fontSize: 16, fontWeight: 800, color: C.accent }}>R$ {numFmt(totalMensal, 0)}/mês</span>
          </div>
        </div>
      )}

      {/* Allocation comparison */}
      {totalMensal > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          {/* Sua alocação */}
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20 }}>
            <div style={{ fontFamily: MN, fontSize: 11, color: C.textDim, marginBottom: 12, textAlign: "center" }}>📊 SUA ALOCAÇÃO</div>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={65} innerRadius={35} paddingAngle={3} strokeWidth={0}>
                    {pieData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                  </Pie>
                  <Legend wrapperStyle={{ fontFamily: MN, fontSize: 9 }} />
                  <RTooltip contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, fontFamily: MN, fontSize: 11, color: C.text }} formatter={(v) => [`R$ ${numFmt(v, 0)}`]} />
                </PieChart>
              </ResponsiveContainer>
            ) : null}
            <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 8 }}>
              {Object.entries(allocPct).filter(([_, v]) => v > 0).map(([k, v]) => (
                <span key={k} style={{ fontSize: 11, fontFamily: MN, color: CATEGORIES[k].color }}>{CATEGORIES[k].label}: {v}%</span>
              ))}
            </div>
          </div>

          {/* Sugerida pela filosofia */}
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20 }}>
            <div style={{ fontFamily: MN, fontSize: 11, color: C.textDim, marginBottom: 12, textAlign: "center" }}>🎯 SUGERIDA ({user?.philosophy || "padrão"})</div>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={Object.entries(suggested).filter(([_, v]) => v > 0).map(([k, v]) => ({ name: CATEGORIES[k]?.label || k, value: v, fill: CATEGORIES[k]?.color || C.textMuted }))}
                  dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={65} innerRadius={35} paddingAngle={3} strokeWidth={0}
                >
                  {Object.entries(suggested).filter(([_, v]) => v > 0).map(([k], i) => <Cell key={i} fill={CATEGORIES[k]?.color || C.textMuted} />)}
                </Pie>
                <Legend wrapperStyle={{ fontFamily: MN, fontSize: 9 }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 8 }}>
              {Object.entries(suggested).filter(([_, v]) => v > 0).map(([k, v]) => (
                <span key={k} style={{ fontSize: 11, fontFamily: MN, color: CATEGORIES[k]?.color || C.textMuted }}>{CATEGORIES[k]?.label || k}: {v}%</span>
              ))}
            </div>
          </div>
        </div>
      )}

      <SponsorSlot id="carteira-middle" />

      {/* Projections */}
      {totalMensal > 0 && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, marginBottom: 16 }}>
          <div style={{ fontFamily: MN, fontSize: 12, color: C.textDim, marginBottom: 4, textAlign: "center" }}>🔮 PROJEÇÕES — JUROS COMPOSTOS</div>
          <div style={{ fontSize: 11, color: C.textMuted, textAlign: "center", marginBottom: 20 }}>
            Investindo R$ {numFmt(totalMensal, 0)}/mês | Retorno médio estimado: {numFmt(weightedRate * 100, 1)}% a.a.
          </div>

          {/* Projections table */}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 500 }}>
              <thead>
                <tr>
                  {["Prazo", "Patrimônio Acumulado", "Renda Passiva/mês (1%)", "Total Investido"].map((h) => (
                    <th key={h} style={{ padding: "10px 12px", borderBottom: `1px solid ${C.border}`, textAlign: "right", fontFamily: MN, fontSize: 9, color: C.textMuted, textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {projections.map((p) => {
                  const invested = totalMensal * p.years * 12;
                  return (
                    <tr key={p.years}>
                      <td style={{ padding: "12px", borderBottom: `1px solid ${C.border}`, fontFamily: MN, fontSize: 13, fontWeight: 700, color: C.white, textAlign: "right" }}>{p.years} {p.years === 1 ? "ano" : "anos"}</td>
                      <td style={{ padding: "12px", borderBottom: `1px solid ${C.border}`, fontFamily: MN, fontSize: 14, fontWeight: 800, color: C.accent, textAlign: "right" }}>R$ {numFmt(p.patrimonio, 0)}</td>
                      <td style={{ padding: "12px", borderBottom: `1px solid ${C.border}`, fontFamily: MN, fontSize: 13, fontWeight: 700, color: C.green, textAlign: "right" }}>R$ {numFmt(p.rendaPassiva, 0)}/mês</td>
                      <td style={{ padding: "12px", borderBottom: `1px solid ${C.border}`, fontFamily: MN, fontSize: 12, color: C.textDim, textAlign: "right" }}>R$ {numFmt(invested, 0)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Bar chart visualization */}
          <div style={{ marginTop: 20 }}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={projections.map((p) => ({ name: `${p.years}a`, patrimonio: Math.round(p.patrimonio), renda: Math.round(p.rendaPassiva) }))} margin={{ left: 20, right: 10 }}>
                <XAxis dataKey="name" tick={{ fill: C.textDim, fontSize: 11, fontFamily: MN }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: C.textMuted, fontSize: 9, fontFamily: MN }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1e6 ? `${(v/1e6).toFixed(1)}M` : v >= 1e3 ? `${(v/1e3).toFixed(0)}k` : v} />
                <RTooltip contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, fontFamily: MN, fontSize: 11, color: C.text }} formatter={(v) => [`R$ ${numFmt(v, 0)}`]} />
                <Bar dataKey="patrimonio" name="Patrimônio" fill={C.accent} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Renda passiva highlight */}
      {totalMensal > 0 && projections.length > 0 && (
        <div style={{
          background: "linear-gradient(135deg, #0D3320 0%, #0D1117 100%)",
          border: `1px solid ${C.accentBorder}`, borderRadius: 16, padding: 24, marginBottom: 16, textAlign: "center",
        }}>
          <div style={{ fontSize: 11, color: C.textMuted, fontFamily: MN, marginBottom: 8 }}>EM 30 ANOS DE DISCIPLINA</div>
          <div style={{ fontFamily: MN, fontSize: 32, fontWeight: 800, color: C.accent }}>R$ {numFmt(projections[projections.length - 1].rendaPassiva, 0)}/mês</div>
          <div style={{ fontSize: 13, color: C.textDim, marginTop: 4 }}>de renda passiva, com patrimônio de</div>
          <div style={{ fontFamily: MN, fontSize: 20, fontWeight: 700, color: C.white, marginTop: 4 }}>R$ {numFmt(projections[projections.length - 1].patrimonio, 0)}</div>
          <div style={{ fontSize: 11, color: C.textMuted, marginTop: 12 }}>Investindo apenas R$ {numFmt(totalMensal, 0)}/mês com juros compostos</div>
        </div>
      )}

      <SponsorSlot id="carteira-bottom" />

      {/* Empty state */}
      {assets.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 20px" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>💼</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: C.white, marginBottom: 8 }}>Sua carteira está vazia</div>
          <div style={{ fontSize: 13, color: C.textDim, maxWidth: 400, margin: "0 auto", lineHeight: 1.7, marginBottom: 20 }}>
            Adicione ações, FIIs e renda fixa acima, defina quanto pretende investir em cada por mês, e veja as projeções de patrimônio e renda passiva com juros compostos.
          </div>
          <button onClick={onGoCompare} style={{ padding: "12px 24px", borderRadius: 12, fontSize: 13, fontFamily: MN, cursor: "pointer", background: `${C.accent}15`, color: C.accent, border: `1px solid ${C.accent}30` }}>
            ⚔️ Ir para o Comparador
          </button>
        </div>
      )}

      {/* Disclaimer */}
      {totalMensal > 0 && (
        <p style={{ textAlign: "center", fontSize: 10, color: C.textMuted, lineHeight: 1.6, marginTop: 16 }}>
          Simulação educativa baseada em juros compostos com taxa Selic atual e média histórica Ibovespa/IFIX. Renda passiva estimada a 1% a.m.
          Não constitui recomendação de investimento. Resultados reais podem variar.
        </p>
      )}
    </div>
  );
}
