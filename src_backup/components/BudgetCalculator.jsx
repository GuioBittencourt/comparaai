"use client";
import { useState, useMemo, useEffect } from "react";
import { C, MN, FN, PAL } from "../lib/theme";
import { numFmt } from "../lib/utils";
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip as RTooltip } from "recharts";
import SponsorSlot from "./SponsorSlot";
import { BannerFinanceiro } from "./Banners";

const PRESET_CATEGORIES = [
  { id: "mercado", label: "Mercado / Alimentação", icon: "🛒", color: C.accent },
  { id: "transporte", label: "Transporte / Gasolina", icon: "⛽", color: C.blue },
  { id: "diversao", label: "Diversão / Lazer", icon: "🎉", color: C.purple },
  { id: "saude", label: "Saúde / Farmácia", icon: "💊", color: C.pink },
  { id: "pets", label: "Pets", icon: "🐾", color: C.yellow },
  { id: "cursos", label: "Cursos e Livros", icon: "📚", color: "#818CF8" },
  { id: "outros", label: "Outros", icon: "📦", color: C.textDim },
];

const HEALTHY_DIST = {
  fixas: { pct: 60, label: "Contas Fixas", color: C.blue, desc: "Aluguel, internet, água, luz, condomínio, plano celular..." },
  diversao: { pct: 10, label: "Diversão", color: C.purple, desc: "Lazer, restaurantes, cinema, viagens curtas..." },
  investLongo: { pct: 10, label: "Investimentos (longo prazo)", color: C.accent, desc: "Ações, FIIs, Tesouro IPCA+, previdência..." },
  investCurto: { pct: 15, label: "Investimentos (curto prazo)", color: C.orange, desc: "Reserva emergência, Tesouro Selic, CDB liquidez..." },
  estudos: { pct: 5, label: "Estudos / Educação", color: "#818CF8", desc: "Cursos, livros, capacitação profissional..." },
};

const STORAGE_KEY = "comparai_gestao";

function loadData() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    if (raw.month !== currentMonth) {
      return { ...raw, month: currentMonth, expenses: [] };
    }
    return raw;
  } catch { return {}; }
}

function saveData(data) {
  try {
    const now = new Date();
    data.month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

/* ═══════════════════════════════════════════════════════════════
   INCOME PROFILE SETUP
   ═══════════════════════════════════════════════════════════════ */
function IncomeSetup({ onComplete, initial }) {
  const [renda, setRenda] = useState(initial?.renda || "");
  const [profissao, setProfissao] = useState(initial?.profissao || "");
  const [fixas, setFixas] = useState(initial?.fixas || "");

  const rendaNum = parseFloat(renda) || 0;
  const fixasNum = parseFloat(fixas) || 0;
  const fixasPct = rendaNum > 0 ? (fixasNum / rendaNum) * 100 : 0;
  const variavel = rendaNum - fixasNum;

  return (
    <div style={{ maxWidth: 480, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>💰</div>
        <h2 style={{ fontFamily: MN, fontSize: 20, fontWeight: 800, color: C.white, margin: "0 0 8px" }}>
          Perfil de Gestão
        </h2>
        <p style={{ color: C.textDim, fontSize: 13, lineHeight: 1.7 }}>
          Configure sua renda e contas fixas pra gente te ajudar a controlar o que sobra.
        </p>
      </div>

      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, marginBottom: 16 }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: C.textMuted, fontFamily: MN, marginBottom: 6 }}>SUA PROFISSÃO / OCUPAÇÃO</div>
          <input value={profissao} onChange={(e) => setProfissao(e.target.value)} placeholder="Ex: Analista de Marketing, Autônomo, CLT..."
            style={{ width: "100%", padding: "12px 16px", background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 14, fontFamily: FN, outline: "none", boxSizing: "border-box" }} />
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: C.textMuted, fontFamily: MN, marginBottom: 6 }}>RENDA LÍQUIDA MENSAL (o que cai na conta)</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: C.textDim, fontSize: 14 }}>R$</span>
            <input value={renda} onChange={(e) => setRenda(e.target.value)} type="number" placeholder="Ex: 5000"
              style={{ flex: 1, padding: "12px 16px", background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 16, fontFamily: MN, outline: "none" }} />
          </div>
          <div style={{ fontSize: 10, color: C.textMuted, marginTop: 4 }}>Depois de descontos da CLT, ou o que sobra depois de pagar despesas da empresa (autônomos).</div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: C.textMuted, fontFamily: MN, marginBottom: 6 }}>TOTAL DE CONTAS FIXAS NO MÊS</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: C.textDim, fontSize: 14 }}>R$</span>
            <input value={fixas} onChange={(e) => setFixas(e.target.value)} type="number" placeholder="Ex: 3000"
              style={{ flex: 1, padding: "12px 16px", background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 16, fontFamily: MN, outline: "none" }} />
          </div>
          <div style={{ fontSize: 10, color: C.textMuted, marginTop: 4 }}>Aluguel, internet, água, luz, condomínio, plano celular, etc.</div>
        </div>

        {/* Live analysis */}
        {rendaNum > 0 && fixasNum > 0 && (
          <div style={{ padding: 16, background: C.cardAlt, borderRadius: 12, border: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: C.textDim }}>Contas fixas:</span>
              <span style={{ fontFamily: MN, fontSize: 13, fontWeight: 700, color: fixasPct > 60 ? C.red : fixasPct > 50 ? C.yellow : C.accent }}>
                {numFmt(fixasPct, 1)}% da renda
              </span>
            </div>
            <div style={{ height: 6, background: C.border, borderRadius: 4, marginBottom: 10, overflow: "hidden" }}>
              <div style={{ width: `${Math.min(100, fixasPct)}%`, height: "100%", borderRadius: 4, background: fixasPct > 60 ? C.red : fixasPct > 50 ? C.yellow : C.accent }} />
            </div>
            {fixasPct > 60 && <div style={{ fontSize: 11, color: C.red, marginBottom: 8 }}>Suas contas fixas estão acima dos 60% recomendados. Considere renegociar ou cortar gastos fixos.</div>}
            {fixasPct <= 60 && fixasPct > 0 && <div style={{ fontSize: 11, color: C.accent, marginBottom: 8 }}>Dentro do limite saudável de 60%.</div>}
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12, color: C.textDim }}>Disponível pra variáveis + investimentos:</span>
              <span style={{ fontFamily: MN, fontSize: 14, fontWeight: 800, color: C.accent }}>R$ {numFmt(variavel, 2)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Healthy distribution reference */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20, marginBottom: 16 }}>
        <div style={{ fontFamily: MN, fontSize: 11, color: C.textDim, marginBottom: 12 }}>DISTRIBUIÇÃO SAUDÁVEL SUGERIDA</div>
        {Object.values(HEALTHY_DIST).map((d) => (
          <div key={d.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
            <div>
              <div style={{ fontSize: 12, color: C.white }}>{d.label}</div>
              <div style={{ fontSize: 10, color: C.textMuted }}>{d.desc}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{ fontFamily: MN, fontSize: 14, fontWeight: 700, color: d.color }}>{d.pct}%</span>
              {rendaNum > 0 && <div style={{ fontSize: 10, color: C.textMuted }}>R$ {numFmt(rendaNum * d.pct / 100, 0)}</div>}
            </div>
          </div>
        ))}
      </div>

      <button onClick={() => {
        if (!renda || !profissao) return;
        onComplete({ renda: rendaNum, profissao: profissao.trim(), fixas: fixasNum });
      }}
        disabled={!renda || !profissao}
        style={{
          width: "100%", padding: "14px", borderRadius: 12, fontSize: 15, fontWeight: 700, fontFamily: FN, cursor: renda && profissao ? "pointer" : "not-allowed", border: "none",
          background: renda && profissao ? C.accent : C.border, color: renda && profissao ? C.bg : C.textMuted,
        }}>
        {initial ? "Salvar alterações" : "Começar a gestão"}
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN GESTÃO ATIVA
   ═══════════════════════════════════════════════════════════════ */
export default function GestaoAtiva({ user }) {
  const [data, setData] = useState(() => loadData());
  const [showAddCat, setShowAddCat] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [selectedCat, setSelectedCat] = useState(null);
  const [expenseValue, setExpenseValue] = useState("");
  const [expenseDesc, setExpenseDesc] = useState("");
  const [customCatName, setCustomCatName] = useState("");
  const [customCatLimit, setCustomCatLimit] = useState("");
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [catLimit, setCatLimit] = useState("");
  const [editProfile, setEditProfile] = useState(false);

  const isPremium = user?.is_premium || user?.is_admin;
  const FREE_MAX_CATEGORIES = 2;

  useEffect(() => { saveData(data); }, [data]);

  const categories = data.categories || [];
  const expenses = data.expenses || [];
  const profile = data.profile;

  // If no profile yet, show setup
  if (!profile || editProfile) {
    return (
      <div>
        <BannerFinanceiro />
        {editProfile && (
          <button onClick={() => setEditProfile(false)} style={{ background: "none", border: "none", color: C.textDim, fontSize: 12, cursor: "pointer", fontFamily: FN, marginBottom: 16 }}>
            ← Voltar
          </button>
        )}
        <IncomeSetup
          initial={profile}
          onComplete={(p) => {
            setData((prev) => ({ ...prev, profile: p }));
            setEditProfile(false);
          }}
        />
      </div>
    );
  }

  const renda = profile.renda || 0;
  const fixas = profile.fixas || 0;
  const variavel = renda - fixas;
  const fixasPct = renda > 0 ? (fixas / renda) * 100 : 0;

  const addCategory = (preset, limit) => {
    if (!isPremium && categories.length >= FREE_MAX_CATEGORIES) return;
    if (categories.find((c) => c.id === preset.id)) return;
    setData((prev) => ({ ...prev, categories: [...(prev.categories || []), { ...preset, limit: parseFloat(limit) || 0 }] }));
    setShowAddCat(false);
    setSelectedPreset(null);
    setCatLimit("");
    setCustomCatName("");
    setCustomCatLimit("");
  };

  const addCustomCategory = () => {
    if (!customCatName.trim() || !customCatLimit) return;
    addCategory({ id: `custom_${Date.now()}`, label: customCatName.trim(), icon: "📌", color: PAL[categories.length % PAL.length] }, customCatLimit);
  };

  const removeCategory = (catId) => {
    setData((prev) => ({ ...prev, categories: (prev.categories || []).filter((c) => c.id !== catId), expenses: (prev.expenses || []).filter((e) => e.categoryId !== catId) }));
  };

  const addExpense = () => {
    if (!selectedCat || !expenseValue) return;
    const exp = { id: Date.now(), categoryId: selectedCat, value: parseFloat(expenseValue) || 0, desc: expenseDesc.trim(), date: new Date().toISOString() };
    setData((prev) => ({ ...prev, expenses: [...(prev.expenses || []), exp] }));
    setExpenseValue("");
    setExpenseDesc("");
    setShowAddExpense(false);
    setSelectedCat(null);
  };

  const removeExpense = (expId) => { setData((prev) => ({ ...prev, expenses: (prev.expenses || []).filter((e) => e.id !== expId) })); };

  const resetMonth = () => { setData((prev) => ({ ...prev, expenses: [] })); };

  const catTotals = useMemo(() => {
    const t = {};
    categories.forEach((c) => { t[c.id] = 0; });
    expenses.forEach((e) => { if (t[e.categoryId] !== undefined) t[e.categoryId] += e.value; });
    return t;
  }, [data]);

  const totalLimit = categories.reduce((s, c) => s + (c.limit || 0), 0);
  const totalSpent = expenses.reduce((s, e) => s + e.value, 0);
  const totalRemaining = totalLimit - totalSpent;
  const spentPctOfRenda = renda > 0 ? (totalSpent / renda) * 100 : 0;

  // Distribution analysis
  const distData = useMemo(() => {
    return [
      { name: "Contas Fixas", value: fixas, fill: C.blue },
      { name: "Gastos Variáveis", value: totalSpent, fill: C.orange },
      { name: "Disponível", value: Math.max(0, renda - fixas - totalSpent), fill: C.accent },
    ].filter((d) => d.value > 0);
  }, [fixas, totalSpent, renda]);

  const monthName = (() => {
    const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    return months[new Date().getMonth()] + " " + new Date().getFullYear();
  })();

  return (
    <div>
      <BannerFinanceiro />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <h2 style={{ fontFamily: MN, fontSize: 18, fontWeight: 800, color: C.white, margin: "0 0 4px" }}>Gestão Ativa</h2>
          <p style={{ color: C.textDim, fontSize: 13 }}>{monthName}</p>
        </div>
        <button onClick={() => setEditProfile(true)} style={{ padding: "6px 14px", borderRadius: 8, fontSize: 10, fontFamily: MN, cursor: "pointer", background: C.cardAlt, color: C.textDim, border: `1px solid ${C.border}` }}>
          Perfil de Gestão →
        </button>
      </div>

      {/* Income profile summary */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 18, marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 10, color: C.textMuted }}>Profissão</div>
            <div style={{ fontSize: 13, color: C.white, fontWeight: 600 }}>{profile.profissao}</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 10, color: C.textMuted }}>Renda Líquida</div>
            <div style={{ fontFamily: MN, fontSize: 15, fontWeight: 800, color: C.accent }}>R$ {numFmt(renda, 0)}</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 10, color: C.textMuted }}>Fixas ({numFmt(fixasPct, 0)}%)</div>
            <div style={{ fontFamily: MN, fontSize: 15, fontWeight: 700, color: fixasPct > 60 ? C.red : C.blue }}>R$ {numFmt(fixas, 0)}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 10, color: C.textMuted }}>Disponível</div>
            <div style={{ fontFamily: MN, fontSize: 15, fontWeight: 800, color: C.accent }}>R$ {numFmt(variavel, 0)}</div>
          </div>
        </div>
      </div>

      {/* Distribution chart */}
      {distData.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 18 }}>
            <div style={{ fontFamily: MN, fontSize: 10, color: C.textMuted, marginBottom: 8, textAlign: "center" }}>SUA DISTRIBUIÇÃO ATUAL</div>
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie data={distData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={55} innerRadius={30} paddingAngle={3} strokeWidth={0}>
                  {distData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Pie>
                <RTooltip contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, fontFamily: MN, fontSize: 10, color: C.text }} formatter={(v) => [`R$ ${numFmt(v, 0)}`]} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
              {distData.map((d) => <span key={d.name} style={{ fontSize: 9, fontFamily: MN, color: d.fill }}>{d.name}: {renda > 0 ? numFmt((d.value / renda) * 100, 0) : 0}%</span>)}
            </div>
          </div>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 18 }}>
            <div style={{ fontFamily: MN, fontSize: 10, color: C.textMuted, marginBottom: 8, textAlign: "center" }}>DISTRIBUIÇÃO SAUDÁVEL</div>
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie data={Object.values(HEALTHY_DIST).map((d) => ({ name: d.label, value: d.pct, fill: d.color }))} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={55} innerRadius={30} paddingAngle={3} strokeWidth={0}>
                  {Object.values(HEALTHY_DIST).map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
              {Object.values(HEALTHY_DIST).map((d) => <span key={d.label} style={{ fontSize: 9, fontFamily: MN, color: d.color }}>{d.pct}%</span>)}
            </div>
          </div>
        </div>
      )}

      {/* Remaining balance */}
      {categories.length > 0 && (
        <div style={{
          background: totalRemaining >= 0 ? "linear-gradient(135deg, #0D3320 0%, #0D1117 100%)" : "linear-gradient(135deg, #3d0d0d 0%, #0D1117 100%)",
          border: `1px solid ${totalRemaining >= 0 ? C.accentBorder : `${C.red}40`}`, borderRadius: 14, padding: 20, marginBottom: 16, textAlign: "center",
        }}>
          <div style={{ fontSize: 10, color: C.textMuted, fontFamily: MN, marginBottom: 4 }}>SALDO DISPONÍVEL (VARIÁVEIS)</div>
          <div style={{ fontFamily: MN, fontSize: 32, fontWeight: 800, color: totalRemaining >= 0 ? C.accent : C.red }}>R$ {numFmt(Math.abs(totalRemaining), 2)}</div>
          {totalRemaining < 0 && <div style={{ fontSize: 11, color: C.red, marginTop: 4 }}>Orçamento estourado!</div>}
          <div style={{ height: 5, background: C.border, borderRadius: 4, marginTop: 10, overflow: "hidden" }}>
            <div style={{ width: `${Math.min(100, totalLimit > 0 ? (totalSpent / totalLimit) * 100 : 0)}%`, height: "100%", borderRadius: 4, background: totalSpent / totalLimit > 0.9 ? C.red : totalSpent / totalLimit > 0.7 ? C.yellow : C.accent, transition: "width 0.3s" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 10 }}>
            <span style={{ fontSize: 11, color: C.textMuted }}>Orçamento: R$ {numFmt(totalLimit, 0)}</span>
            <span style={{ fontSize: 11, color: C.red }}>Gasto: R$ {numFmt(totalSpent, 0)}</span>
          </div>
        </div>
      )}

      {/* Categories header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontFamily: MN, fontSize: 11, color: C.textDim }}>CATEGORIAS ({categories.length})</span>
        <div style={{ display: "flex", gap: 8 }}>
          {categories.length > 0 && <button onClick={resetMonth} style={{ padding: "4px 10px", borderRadius: 6, fontSize: 10, fontFamily: MN, cursor: "pointer", background: `${C.red}15`, color: C.red, border: `1px solid ${C.red}30` }}>Resetar mês</button>}
          <button onClick={() => {
            if (!isPremium && categories.length >= FREE_MAX_CATEGORIES) { alert("Conta gratuita: máx. 2 categorias. Faça upgrade!"); return; }
            setShowAddCat(true);
          }} style={{ padding: "4px 10px", borderRadius: 6, fontSize: 10, fontFamily: MN, cursor: "pointer", background: `${C.accent}15`, color: C.accent, border: `1px solid ${C.accent}30` }}>+ Categoria</button>
        </div>
      </div>

      {/* Category cards */}
      {categories.map((cat) => {
        const spent = catTotals[cat.id] || 0;
        const remaining = cat.limit - spent;
        const pct = cat.limit > 0 ? (spent / cat.limit) * 100 : 0;
        const catExp = expenses.filter((e) => e.categoryId === cat.id).sort((a, b) => new Date(b.date) - new Date(a.date));

        return (
          <div key={cat.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 18 }}>{cat.icon}</span>
                <div>
                  <div style={{ fontFamily: MN, fontSize: 12, fontWeight: 700, color: C.white }}>{cat.label}</div>
                  <div style={{ fontSize: 10, color: C.textMuted }}>Limite: R$ {numFmt(cat.limit, 2)}</div>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: MN, fontSize: 15, fontWeight: 800, color: remaining >= 0 ? cat.color : C.red }}>R$ {numFmt(Math.abs(remaining), 2)}</div>
                <div style={{ fontSize: 9, color: remaining >= 0 ? C.textMuted : C.red }}>{remaining >= 0 ? "restante" : "estourado"}</div>
              </div>
            </div>
            <div style={{ height: 3, background: C.border, borderRadius: 3, marginBottom: 8, overflow: "hidden" }}>
              <div style={{ width: `${Math.min(100, pct)}%`, height: "100%", borderRadius: 3, background: pct > 90 ? C.red : pct > 70 ? C.yellow : cat.color, transition: "width 0.3s" }} />
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: catExp.length > 0 ? 8 : 0 }}>
              <button onClick={() => { setSelectedCat(cat.id); setShowAddExpense(true); }} style={{ padding: "5px 12px", borderRadius: 6, fontSize: 10, fontFamily: MN, cursor: "pointer", background: `${cat.color}15`, color: cat.color, border: `1px solid ${cat.color}30` }}>+ Lançar gasto</button>
              <button onClick={() => removeCategory(cat.id)} style={{ padding: "5px 8px", borderRadius: 6, fontSize: 10, cursor: "pointer", background: "transparent", color: C.textMuted, border: `1px solid ${C.border}` }} onMouseEnter={(e) => e.target.style.color = C.red} onMouseLeave={(e) => e.target.style.color = C.textMuted}>Remover</button>
            </div>
            {catExp.map((exp) => (
              <div key={exp.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "5px 0", borderTop: `1px solid ${C.border}` }}>
                <div><span style={{ fontSize: 11, color: C.text }}>{exp.desc || "Gasto"}</span><span style={{ fontSize: 9, color: C.textMuted, marginLeft: 6 }}>{new Date(exp.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}</span></div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontFamily: MN, fontSize: 11, fontWeight: 600, color: C.red }}>-R$ {numFmt(exp.value, 2)}</span>
                  <button onClick={() => removeExpense(exp.id)} style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 11 }} onMouseEnter={(e) => e.target.style.color = C.red} onMouseLeave={(e) => e.target.style.color = C.textMuted}>×</button>
                </div>
              </div>
            ))}
          </div>
        );
      })}

      {/* Empty state */}
      {categories.length === 0 && (
        <div style={{ textAlign: "center", padding: "32px 20px", background: C.card, border: `1px solid ${C.border}`, borderRadius: 14 }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>💰</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.white, marginBottom: 6 }}>Comece sua gestão ativa</div>
          <div style={{ fontSize: 12, color: C.textDim, maxWidth: 380, margin: "0 auto", lineHeight: 1.7, marginBottom: 16 }}>
            Adicione categorias de despesas variáveis, defina limites mensais e registre cada gasto. No final do mês, reseta e recomeça.
          </div>
          <button onClick={() => setShowAddCat(true)} style={{ padding: "10px 20px", borderRadius: 10, fontSize: 13, fontFamily: MN, cursor: "pointer", background: C.accent, color: C.bg, border: "none", fontWeight: 700 }}>+ Adicionar categoria</button>
        </div>
      )}

      <SponsorSlot id="gestao-bottom" />

      <div style={{ marginTop: 16, textAlign: "center" }}>
        <p style={{ fontSize: 10, color: C.textMuted, lineHeight: 1.6 }}>
          Dados salvos no seu dispositivo. Gastos resetam automaticamente todo início de mês.
          {!isPremium && " Conta gratuita: máx. 2 categorias."}
        </p>
      </div>

      {/* ═══ MODAL: Add Category ═══ */}
      {showAddCat && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }} onClick={() => setShowAddCat(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 400, background: C.card, border: `1px solid ${C.border}`, borderRadius: 18, padding: "24px 22px", maxHeight: "80vh", overflowY: "auto" }}>
            <h3 style={{ fontFamily: MN, fontSize: 15, fontWeight: 800, color: C.white, margin: "0 0 14px" }}>Adicionar Categoria</h3>
            <div style={{ fontSize: 10, color: C.textMuted, fontFamily: MN, marginBottom: 6 }}>SUGERIDAS</div>
            {PRESET_CATEGORIES.filter((p) => !categories.find((c) => c.id === p.id)).map((preset) => (
              <button key={preset.id} onClick={() => setSelectedPreset(preset)} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 12px", marginBottom: 4, background: selectedPreset?.id === preset.id ? `${preset.color}15` : C.cardAlt, border: `1px solid ${selectedPreset?.id === preset.id ? `${preset.color}40` : C.border}`, borderRadius: 8, cursor: "pointer", textAlign: "left" }}>
                <span style={{ fontSize: 16 }}>{preset.icon}</span>
                <span style={{ fontSize: 12, color: C.white }}>{preset.label}</span>
              </button>
            ))}
            {selectedPreset && (
              <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                <input value={catLimit} onChange={(e) => setCatLimit(e.target.value)} type="number" placeholder="Limite R$/mês" style={{ flex: 1, padding: "10px", background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 13, fontFamily: MN, outline: "none" }} autoFocus />
                <button onClick={() => addCategory(selectedPreset, catLimit)} disabled={!catLimit} style={{ padding: "10px 16px", borderRadius: 8, background: catLimit ? C.accent : C.border, color: catLimit ? C.bg : C.textMuted, border: "none", fontSize: 12, fontWeight: 700, fontFamily: FN, cursor: catLimit ? "pointer" : "not-allowed" }}>OK</button>
              </div>
            )}
            <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 12, marginTop: 12 }}>
              <div style={{ fontSize: 10, color: C.textMuted, fontFamily: MN, marginBottom: 6 }}>PERSONALIZADA</div>
              <input value={customCatName} onChange={(e) => setCustomCatName(e.target.value)} placeholder="Nome" style={{ width: "100%", padding: "8px 12px", marginBottom: 6, background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 12, fontFamily: FN, outline: "none", boxSizing: "border-box" }} />
              <div style={{ display: "flex", gap: 8 }}>
                <input value={customCatLimit} onChange={(e) => setCustomCatLimit(e.target.value)} type="number" placeholder="Limite R$/mês" style={{ flex: 1, padding: "8px 12px", background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 12, fontFamily: MN, outline: "none" }} />
                <button onClick={addCustomCategory} disabled={!customCatName || !customCatLimit} style={{ padding: "8px 14px", borderRadius: 8, background: customCatName && customCatLimit ? C.accent : C.border, color: customCatName && customCatLimit ? C.bg : C.textMuted, border: "none", fontSize: 12, fontWeight: 700, cursor: customCatName && customCatLimit ? "pointer" : "not-allowed" }}>Criar</button>
              </div>
            </div>
            <button onClick={() => { setShowAddCat(false); setSelectedPreset(null); }} style={{ width: "100%", marginTop: 14, padding: "8px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 8, color: C.textDim, fontSize: 11, cursor: "pointer" }}>Fechar</button>
          </div>
        </div>
      )}

      {/* ═══ MODAL: Add Expense ═══ */}
      {showAddExpense && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }} onClick={() => setShowAddExpense(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 360, background: C.card, border: `1px solid ${C.border}`, borderRadius: 18, padding: "24px 22px" }}>
            <h3 style={{ fontFamily: MN, fontSize: 15, fontWeight: 800, color: C.white, margin: "0 0 4px" }}>Lançar Gasto</h3>
            <p style={{ fontSize: 11, color: C.textDim, marginBottom: 14 }}>{categories.find((c) => c.id === selectedCat)?.icon} {categories.find((c) => c.id === selectedCat)?.label}</p>
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 10, color: C.textMuted, fontFamily: MN, marginBottom: 4 }}>VALOR</div>
              <input value={expenseValue} onChange={(e) => setExpenseValue(e.target.value)} type="number" placeholder="150.00" style={{ width: "100%", padding: "12px 14px", background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 16, fontFamily: MN, outline: "none", boxSizing: "border-box" }} autoFocus />
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, color: C.textMuted, fontFamily: MN, marginBottom: 4 }}>DESCRIÇÃO (opcional)</div>
              <input value={expenseDesc} onChange={(e) => setExpenseDesc(e.target.value)} placeholder="Ex: Compra no Assaí" style={{ width: "100%", padding: "10px 14px", background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 12, fontFamily: FN, outline: "none", boxSizing: "border-box" }} />
            </div>
            {/* FUTURE: Photo/OCR button - dormant
            <div style={{ marginBottom: 14, padding: 12, background: C.cardAlt, borderRadius: 8, border: `1px dashed ${C.border}`, textAlign: "center" }}>
              <div style={{ fontSize: 10, color: C.textMuted }}>Foto do comprovante (em breve)</div>
            </div>
            */}
            <button onClick={addExpense} disabled={!expenseValue} style={{ width: "100%", padding: "12px", background: expenseValue ? C.accent : C.border, color: expenseValue ? C.bg : C.textMuted, border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, fontFamily: FN, cursor: expenseValue ? "pointer" : "not-allowed", marginBottom: 6 }}>Lançar</button>
            <button onClick={() => { setShowAddExpense(false); setSelectedCat(null); }} style={{ width: "100%", padding: "8px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 8, color: C.textDim, fontSize: 11, cursor: "pointer" }}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}
