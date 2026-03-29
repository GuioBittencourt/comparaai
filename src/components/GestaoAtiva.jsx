"use client";
import { useState, useMemo, useEffect } from "react";
import { C, MN, FN, PAL } from "../lib/theme";
import { numFmt } from "../lib/utils";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RTooltip } from "recharts";
import SponsorSlot from "./SponsorSlot";
import { BannerFinanceiro } from "./Banners";

const PRESETS = [
  { id: "mercado", label: "Mercado / Alimentação", icon: "🛒", color: C.accent },
  { id: "transporte", label: "Transporte / Gasolina", icon: "⛽", color: C.blue },
  { id: "diversao", label: "Diversão / Lazer", icon: "🎉", color: C.purple },
  { id: "saude", label: "Saúde / Farmácia", icon: "💊", color: C.pink },
  { id: "pets", label: "Pets", icon: "🐾", color: C.yellow },
  { id: "cursos", label: "Cursos e Livros", icon: "📚", color: "#818CF8" },
  { id: "outros", label: "Outros", icon: "📦", color: C.textDim },
];

const HEALTHY = [
  { label: "Contas Fixas", pct: 60, color: C.blue, desc: "Aluguel, internet, água, luz, condomínio, plano celular..." },
  { label: "Diversão", pct: 10, color: C.purple, desc: "Lazer, restaurantes, cinema, viagens curtas..." },
  { label: "Invest. Longo Prazo", pct: 10, color: C.accent, desc: "Ações, FIIs, Tesouro IPCA+, previdência..." },
  { label: "Invest. Curto Prazo", pct: 15, color: C.orange, desc: "Reserva emergência, Tesouro Selic, CDB liquidez..." },
  { label: "Estudos / Educação", pct: 5, color: "#818CF8", desc: "Cursos, livros, capacitação profissional..." },
];

const STORAGE_KEY = "comparai_gestao";
function loadData() { try { const r = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); const n = new Date(); const cm = `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}`; if (r.month !== cm) return { ...r, month: cm, expenses: [] }; return r; } catch { return {}; } }
function saveData(d) { try { const n = new Date(); d.month = `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}`; localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); } catch {} }

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
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontSize: 36, marginBottom: 8 }}>💰</div>
        <h2 style={{ fontFamily: MN, fontSize: 18, fontWeight: 800, color: C.white, margin: "0 0 6px" }}>Perfil de Gestão</h2>
        <p style={{ color: C.textDim, fontSize: 12, lineHeight: 1.6 }}>Configure sua renda e contas fixas.</p>
      </div>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20, marginBottom: 14 }}>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 10, color: C.textMuted, fontFamily: MN, marginBottom: 4 }}>PROFISSÃO / OCUPAÇÃO</div>
          <input value={profissao} onChange={(e) => setProfissao(e.target.value)} placeholder="Ex: Analista, CLT, Autônomo..." style={{ width: "100%", padding: "10px 14px", background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 13, fontFamily: FN, outline: "none", boxSizing: "border-box" }} />
        </div>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 10, color: C.textMuted, fontFamily: MN, marginBottom: 4 }}>RENDA LÍQUIDA MENSAL</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ color: C.textDim, fontSize: 13 }}>R$</span>
            <input value={renda} onChange={(e) => setRenda(e.target.value)} type="number" placeholder="5000" style={{ flex: 1, padding: "10px 14px", background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 15, fontFamily: MN, outline: "none" }} />
          </div>
          <div style={{ fontSize: 9, color: C.textMuted, marginTop: 3 }}>Depois de descontos (CLT) ou despesas da empresa (autônomo).</div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 10, color: C.textMuted, fontFamily: MN, marginBottom: 4 }}>TOTAL CONTAS FIXAS</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ color: C.textDim, fontSize: 13 }}>R$</span>
            <input value={fixas} onChange={(e) => setFixas(e.target.value)} type="number" placeholder="3000" style={{ flex: 1, padding: "10px 14px", background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 15, fontFamily: MN, outline: "none" }} />
          </div>
          <div style={{ fontSize: 9, color: C.textMuted, marginTop: 3 }}>Aluguel, internet, água, luz, condomínio, plano celular, etc.</div>
        </div>
        {rendaNum > 0 && fixasNum > 0 && (
          <div style={{ padding: 14, background: C.cardAlt, borderRadius: 10, border: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span style={{ fontSize: 11, color: C.textDim }}>Fixas:</span><span style={{ fontFamily: MN, fontSize: 12, fontWeight: 700, color: fixasPct > 60 ? C.red : fixasPct > 50 ? C.yellow : C.accent }}>{numFmt(fixasPct, 1)}% da renda</span></div>
            <div style={{ height: 5, background: C.border, borderRadius: 3, marginBottom: 8, overflow: "hidden" }}><div style={{ width: `${Math.min(100, fixasPct)}%`, height: "100%", borderRadius: 3, background: fixasPct > 60 ? C.red : fixasPct > 50 ? C.yellow : C.accent }} /></div>
            {fixasPct > 60 && <div style={{ fontSize: 10, color: C.red, marginBottom: 6 }}>Acima dos 60% recomendados.</div>}
            {fixasPct <= 60 && <div style={{ fontSize: 10, color: C.accent, marginBottom: 6 }}>Dentro do limite saudável.</div>}
            <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: 11, color: C.textDim }}>Disponível:</span><span style={{ fontFamily: MN, fontSize: 13, fontWeight: 800, color: C.accent }}>R$ {numFmt(variavel, 0)}</span></div>
          </div>
        )}
      </div>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, marginBottom: 14 }}>
        <div style={{ fontFamily: MN, fontSize: 10, color: C.textMuted, marginBottom: 8 }}>DISTRIBUIÇÃO SAUDÁVEL</div>
        {HEALTHY.map((d) => (<div key={d.label} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${C.border}` }}><div><div style={{ fontSize: 11, color: C.white }}>{d.label}</div><div style={{ fontSize: 9, color: C.textMuted }}>{d.desc}</div></div><div style={{ textAlign: "right" }}><span style={{ fontFamily: MN, fontSize: 13, fontWeight: 700, color: d.color }}>{d.pct}%</span>{rendaNum > 0 && <div style={{ fontSize: 9, color: C.textMuted }}>R$ {numFmt(rendaNum * d.pct / 100, 0)}</div>}</div></div>))}
      </div>
      <button onClick={() => { if (renda && profissao) onComplete({ renda: rendaNum, profissao: profissao.trim(), fixas: fixasNum }); }} disabled={!renda || !profissao} style={{ width: "100%", padding: "12px", borderRadius: 10, fontSize: 14, fontWeight: 700, fontFamily: FN, border: "none", cursor: renda && profissao ? "pointer" : "not-allowed", background: renda && profissao ? C.accent : C.border, color: renda && profissao ? C.bg : C.textMuted }}>{initial ? "Salvar alterações" : "Começar gestão"}</button>
    </div>
  );
}

export default function GestaoAtiva({ user }) {
  const [data, setData] = useState(() => loadData());
  const [showAddCat, setShowAddCat] = useState(false);
  const [showAddExp, setShowAddExp] = useState(false);
  const [selectedCat, setSelectedCat] = useState(null);
  const [expVal, setExpVal] = useState("");
  const [expDesc, setExpDesc] = useState("");
  const [selPreset, setSelPreset] = useState(null);
  const [catLimit, setCatLimit] = useState("");
  const [customName, setCustomName] = useState("");
  const [customLimit, setCustomLimit] = useState("");
  const [editProfile, setEditProfile] = useState(false);
  const isPremium = user?.is_premium || user?.is_admin;
  const FREE_MAX = 2;
  useEffect(() => { saveData(data); }, [data]);
  const profile = data.profile;
  const categories = data.categories || [];
  const expenses = data.expenses || [];

  if (!profile || editProfile) {
    return (<div><BannerFinanceiro />{editProfile && <button onClick={() => setEditProfile(false)} style={{ background: "none", border: "none", color: C.textDim, fontSize: 11, cursor: "pointer", fontFamily: FN, marginBottom: 12 }}>← Voltar</button>}<IncomeSetup initial={profile} onComplete={(p) => { setData((prev) => ({ ...prev, profile: p })); setEditProfile(false); }} /></div>);
  }

  const renda = profile.renda || 0, fixas = profile.fixas || 0, variavel = renda - fixas, fixasPct = renda > 0 ? (fixas / renda) * 100 : 0;
  const addCat = (preset, limit) => { if (!isPremium && categories.length >= FREE_MAX) { alert("Conta gratuita: máx. 2 categorias. Faça upgrade!"); return; } if (categories.find((c) => c.id === preset.id)) return; setData((p) => ({ ...p, categories: [...(p.categories || []), { ...preset, limit: parseFloat(limit) || 0 }] })); setShowAddCat(false); setSelPreset(null); setCatLimit(""); setCustomName(""); setCustomLimit(""); };
  const addExp = () => { if (!selectedCat || !expVal) return; setData((p) => ({ ...p, expenses: [...(p.expenses || []), { id: Date.now(), categoryId: selectedCat, value: parseFloat(expVal) || 0, desc: expDesc.trim(), date: new Date().toISOString() }] })); setExpVal(""); setExpDesc(""); setShowAddExp(false); setSelectedCat(null); };
  const catTotals = {}; categories.forEach((c) => { catTotals[c.id] = 0; }); expenses.forEach((e) => { if (catTotals[e.categoryId] !== undefined) catTotals[e.categoryId] += e.value; });
  const totalLimit = categories.reduce((s, c) => s + (c.limit || 0), 0);
  const totalSpent = expenses.reduce((s, e) => s + e.value, 0);
  const totalRem = totalLimit - totalSpent;
  const distData = [{ name: "Fixas", value: fixas, fill: C.blue }, { name: "Variáveis", value: totalSpent, fill: C.orange }, { name: "Disponível", value: Math.max(0, renda - fixas - totalSpent), fill: C.accent }].filter((d) => d.value > 0);
  const healthyData = HEALTHY.map((d) => ({ name: d.label, value: d.pct, fill: d.color }));
  const month = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"][new Date().getMonth()] + " " + new Date().getFullYear();

  return (
    <div>
      <BannerFinanceiro />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div><h2 style={{ fontFamily: MN, fontSize: 16, fontWeight: 800, color: C.white, margin: 0 }}>Gestão Ativa</h2><p style={{ color: C.textDim, fontSize: 11, margin: 0 }}>{month}</p></div>
        <button onClick={() => setEditProfile(true)} style={{ padding: "5px 12px", borderRadius: 6, fontSize: 9, fontFamily: MN, cursor: "pointer", background: C.cardAlt, color: C.textDim, border: `1px solid ${C.border}` }}>Perfil de Gestão →</button>
      </div>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <div><div style={{ fontSize: 9, color: C.textMuted }}>Profissão</div><div style={{ fontSize: 12, color: C.white, fontWeight: 600 }}>{profile.profissao}</div></div>
          <div style={{ textAlign: "center" }}><div style={{ fontSize: 9, color: C.textMuted }}>Renda</div><div style={{ fontFamily: MN, fontSize: 14, fontWeight: 800, color: C.accent }}>R$ {numFmt(renda, 0)}</div></div>
          <div style={{ textAlign: "center" }}><div style={{ fontSize: 9, color: C.textMuted }}>Fixas ({numFmt(fixasPct, 0)}%)</div><div style={{ fontFamily: MN, fontSize: 14, fontWeight: 700, color: fixasPct > 60 ? C.red : C.blue }}>R$ {numFmt(fixas, 0)}</div></div>
          <div style={{ textAlign: "right" }}><div style={{ fontSize: 9, color: C.textMuted }}>Disponível</div><div style={{ fontFamily: MN, fontSize: 14, fontWeight: 800, color: C.accent }}>R$ {numFmt(variavel, 0)}</div></div>
        </div>
      </div>
      {distData.length > 0 && (<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14 }}><div style={{ fontFamily: MN, fontSize: 9, color: C.textMuted, textAlign: "center", marginBottom: 6 }}>SUA DISTRIBUIÇÃO</div><ResponsiveContainer width="100%" height={130}><PieChart><Pie data={distData} dataKey="value" cx="50%" cy="50%" outerRadius={48} innerRadius={26} paddingAngle={3} strokeWidth={0}>{distData.map((d, i) => <Cell key={i} fill={d.fill} />)}</Pie><RTooltip contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 6, fontFamily: MN, fontSize: 9, color: C.text }} formatter={(v) => [`R$ ${numFmt(v, 0)}`]} /></PieChart></ResponsiveContainer><div style={{ display: "flex", justifyContent: "center", gap: 6, flexWrap: "wrap" }}>{distData.map((d) => <span key={d.name} style={{ fontSize: 8, fontFamily: MN, color: d.fill }}>{d.name}: {renda > 0 ? numFmt((d.value/renda)*100, 0) : 0}%</span>)}</div></div>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14 }}><div style={{ fontFamily: MN, fontSize: 9, color: C.textMuted, textAlign: "center", marginBottom: 6 }}>SAUDÁVEL</div><ResponsiveContainer width="100%" height={130}><PieChart><Pie data={healthyData} dataKey="value" cx="50%" cy="50%" outerRadius={48} innerRadius={26} paddingAngle={3} strokeWidth={0}>{healthyData.map((d, i) => <Cell key={i} fill={d.fill} />)}</Pie></PieChart></ResponsiveContainer><div style={{ display: "flex", justifyContent: "center", gap: 6, flexWrap: "wrap" }}>{HEALTHY.map((d) => <span key={d.label} style={{ fontSize: 8, fontFamily: MN, color: d.color }}>{d.pct}%</span>)}</div></div>
      </div>)}
      {categories.length > 0 && (<div style={{ background: totalRem >= 0 ? "linear-gradient(135deg,#0D3320,#0D1117)" : "linear-gradient(135deg,#3d0d0d,#0D1117)", border: `1px solid ${totalRem >= 0 ? C.accentBorder : C.red+"40"}`, borderRadius: 12, padding: 18, marginBottom: 12, textAlign: "center" }}><div style={{ fontSize: 9, color: C.textMuted, fontFamily: MN }}>SALDO VARIÁVEIS</div><div style={{ fontFamily: MN, fontSize: 28, fontWeight: 800, color: totalRem >= 0 ? C.accent : C.red }}>R$ {numFmt(Math.abs(totalRem), 2)}</div>{totalRem < 0 && <div style={{ fontSize: 10, color: C.red }}>Orçamento estourado!</div>}<div style={{ height: 4, background: C.border, borderRadius: 3, marginTop: 8, overflow: "hidden" }}><div style={{ width: `${Math.min(100, totalLimit > 0 ? (totalSpent/totalLimit)*100 : 0)}%`, height: "100%", borderRadius: 3, background: totalSpent/totalLimit > 0.9 ? C.red : totalSpent/totalLimit > 0.7 ? C.yellow : C.accent }} /></div><div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 8 }}><span style={{ fontSize: 10, color: C.textMuted }}>Orçamento: R$ {numFmt(totalLimit, 0)}</span><span style={{ fontSize: 10, color: C.red }}>Gasto: R$ {numFmt(totalSpent, 0)}</span></div></div>)}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}><span style={{ fontFamily: MN, fontSize: 10, color: C.textDim }}>CATEGORIAS ({categories.length})</span><div style={{ display: "flex", gap: 6 }}>{categories.length > 0 && <button onClick={() => setData((p) => ({ ...p, expenses: [] }))} style={{ padding: "3px 8px", borderRadius: 5, fontSize: 9, fontFamily: MN, cursor: "pointer", background: `${C.red}15`, color: C.red, border: `1px solid ${C.red}30` }}>Resetar</button>}<button onClick={() => { if (!isPremium && categories.length >= FREE_MAX) { alert("Conta gratuita: máx. 2 categorias."); return; } setShowAddCat(true); }} style={{ padding: "3px 8px", borderRadius: 5, fontSize: 9, fontFamily: MN, cursor: "pointer", background: `${C.accent}15`, color: C.accent, border: `1px solid ${C.accent}30` }}>+ Categoria</button></div></div>
      {categories.map((cat) => { const spent = catTotals[cat.id] || 0; const rem = cat.limit - spent; const pct = cat.limit > 0 ? (spent/cat.limit)*100 : 0; const exps = expenses.filter((e) => e.categoryId === cat.id).sort((a, b) => new Date(b.date) - new Date(a.date)); return (<div key={cat.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, marginBottom: 6 }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}><div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ fontSize: 16 }}>{cat.icon}</span><div><div style={{ fontFamily: MN, fontSize: 11, fontWeight: 700, color: C.white }}>{cat.label}</div><div style={{ fontSize: 9, color: C.textMuted }}>Limite: R$ {numFmt(cat.limit, 2)}</div></div></div><div style={{ textAlign: "right" }}><div style={{ fontFamily: MN, fontSize: 14, fontWeight: 800, color: rem >= 0 ? cat.color : C.red }}>R$ {numFmt(Math.abs(rem), 2)}</div><div style={{ fontSize: 8, color: rem >= 0 ? C.textMuted : C.red }}>{rem >= 0 ? "restante" : "estourado"}</div></div></div><div style={{ height: 3, background: C.border, borderRadius: 2, marginBottom: 6, overflow: "hidden" }}><div style={{ width: `${Math.min(100, pct)}%`, height: "100%", borderRadius: 2, background: pct > 90 ? C.red : pct > 70 ? C.yellow : cat.color }} /></div><div style={{ display: "flex", gap: 6, marginBottom: exps.length > 0 ? 6 : 0 }}><button onClick={() => { setSelectedCat(cat.id); setShowAddExp(true); }} style={{ padding: "4px 10px", borderRadius: 5, fontSize: 9, fontFamily: MN, cursor: "pointer", background: `${cat.color}15`, color: cat.color, border: `1px solid ${cat.color}30` }}>+ Gasto</button><button onClick={() => setData((p) => ({ ...p, categories: p.categories.filter((c) => c.id !== cat.id), expenses: p.expenses.filter((e) => e.categoryId !== cat.id) }))} style={{ padding: "4px 8px", borderRadius: 5, fontSize: 9, cursor: "pointer", background: "transparent", color: C.textMuted, border: `1px solid ${C.border}` }}>Remover</button></div>{exps.map((exp) => (<div key={exp.id} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderTop: `1px solid ${C.border}` }}><span style={{ fontSize: 10, color: C.text }}>{exp.desc || "Gasto"} <span style={{ color: C.textMuted, fontSize: 8 }}>{new Date(exp.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}</span></span><div style={{ display: "flex", gap: 4, alignItems: "center" }}><span style={{ fontFamily: MN, fontSize: 10, color: C.red }}>-R$ {numFmt(exp.value, 2)}</span><button onClick={() => setData((p) => ({ ...p, expenses: p.expenses.filter((e) => e.id !== exp.id) }))} style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 10 }}>×</button></div></div>))}</div>); })}
      {categories.length === 0 && (<div style={{ textAlign: "center", padding: "30px 16px", background: C.card, border: `1px solid ${C.border}`, borderRadius: 12 }}><div style={{ fontSize: 32, marginBottom: 8 }}>💰</div><div style={{ fontSize: 13, fontWeight: 600, color: C.white, marginBottom: 6 }}>Comece sua gestão ativa</div><div style={{ fontSize: 11, color: C.textDim, lineHeight: 1.6, marginBottom: 14 }}>Adicione categorias de despesas variáveis e controle seus gastos.</div><button onClick={() => setShowAddCat(true)} style={{ padding: "10px 18px", borderRadius: 10, fontSize: 12, fontFamily: MN, cursor: "pointer", background: C.accent, color: C.bg, border: "none", fontWeight: 700 }}>+ Adicionar categoria</button></div>)}
      <SponsorSlot id="gestao-bottom" />
      <p style={{ textAlign: "center", fontSize: 9, color: C.textMuted, marginTop: 14, lineHeight: 1.5 }}>comparainvest — Gestão Ativa. Gastos resetam todo início de mês.{!isPremium && " Conta gratuita: máx. 2 categorias."}</p>
      {showAddCat && (<div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }} onClick={() => setShowAddCat(false)}><div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 380, background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: "20px 18px", maxHeight: "80vh", overflowY: "auto" }}><h3 style={{ fontFamily: MN, fontSize: 14, fontWeight: 800, color: C.white, margin: "0 0 12px" }}>Adicionar Categoria</h3>{PRESETS.filter((p) => !categories.find((c) => c.id === p.id)).map((preset) => (<button key={preset.id} onClick={() => setSelPreset(preset)} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "7px 10px", marginBottom: 3, background: selPreset?.id === preset.id ? `${preset.color}15` : C.cardAlt, border: `1px solid ${selPreset?.id === preset.id ? preset.color+"40" : C.border}`, borderRadius: 7, cursor: "pointer", textAlign: "left" }}><span style={{ fontSize: 14 }}>{preset.icon}</span><span style={{ fontSize: 11, color: C.white }}>{preset.label}</span></button>))}{selPreset && (<div style={{ marginTop: 8, display: "flex", gap: 6 }}><input value={catLimit} onChange={(e) => setCatLimit(e.target.value)} type="number" placeholder="Limite R$/mês" style={{ flex: 1, padding: "8px 10px", background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 6, color: C.text, fontSize: 12, fontFamily: MN, outline: "none" }} autoFocus /><button onClick={() => addCat(selPreset, catLimit)} disabled={!catLimit} style={{ padding: "8px 14px", borderRadius: 6, background: catLimit ? C.accent : C.border, color: catLimit ? C.bg : C.textMuted, border: "none", fontSize: 11, fontWeight: 700, cursor: catLimit ? "pointer" : "not-allowed" }}>OK</button></div>)}<div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 10, marginTop: 10 }}><div style={{ fontSize: 9, color: C.textMuted, fontFamily: MN, marginBottom: 4 }}>PERSONALIZADA</div><input value={customName} onChange={(e) => setCustomName(e.target.value)} placeholder="Nome" style={{ width: "100%", padding: "7px 10px", marginBottom: 4, background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 6, color: C.text, fontSize: 11, fontFamily: FN, outline: "none", boxSizing: "border-box" }} /><div style={{ display: "flex", gap: 6 }}><input value={customLimit} onChange={(e) => setCustomLimit(e.target.value)} type="number" placeholder="Limite" style={{ flex: 1, padding: "7px 10px", background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 6, color: C.text, fontSize: 11, fontFamily: MN, outline: "none" }} /><button onClick={() => { if (customName && customLimit) addCat({ id: `c_${Date.now()}`, label: customName.trim(), icon: "📌", color: PAL[categories.length % PAL.length] }, customLimit); }} disabled={!customName || !customLimit} style={{ padding: "7px 12px", borderRadius: 6, background: customName && customLimit ? C.accent : C.border, color: customName && customLimit ? C.bg : C.textMuted, border: "none", fontSize: 11, fontWeight: 700, cursor: customName && customLimit ? "pointer" : "not-allowed" }}>Criar</button></div></div><button onClick={() => { setShowAddCat(false); setSelPreset(null); }} style={{ width: "100%", marginTop: 10, padding: "7px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 6, color: C.textDim, fontSize: 10, cursor: "pointer" }}>Fechar</button></div></div>)}
      {showAddExp && (<div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }} onClick={() => setShowAddExp(false)}><div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 340, background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: "20px 18px" }}><h3 style={{ fontFamily: MN, fontSize: 14, fontWeight: 800, color: C.white, margin: "0 0 4px" }}>Lançar Gasto</h3><p style={{ fontSize: 10, color: C.textDim, marginBottom: 12 }}>{categories.find((c) => c.id === selectedCat)?.icon} {categories.find((c) => c.id === selectedCat)?.label}</p><div style={{ marginBottom: 8 }}><div style={{ fontSize: 9, color: C.textMuted, fontFamily: MN, marginBottom: 3 }}>VALOR</div><input value={expVal} onChange={(e) => setExpVal(e.target.value)} type="number" placeholder="150.00" style={{ width: "100%", padding: "10px 12px", background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 15, fontFamily: MN, outline: "none", boxSizing: "border-box" }} autoFocus /></div><div style={{ marginBottom: 14 }}><div style={{ fontSize: 9, color: C.textMuted, fontFamily: MN, marginBottom: 3 }}>DESCRIÇÃO (opcional)</div><input value={expDesc} onChange={(e) => setExpDesc(e.target.value)} placeholder="Ex: Compra no Assaí" style={{ width: "100%", padding: "8px 12px", background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 11, fontFamily: FN, outline: "none", boxSizing: "border-box" }} /></div><button onClick={addExp} disabled={!expVal} style={{ width: "100%", padding: "10px", background: expVal ? C.accent : C.border, color: expVal ? C.bg : C.textMuted, border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, fontFamily: FN, cursor: expVal ? "pointer" : "not-allowed", marginBottom: 6 }}>Lançar</button><button onClick={() => { setShowAddExp(false); setSelectedCat(null); }} style={{ width: "100%", padding: "7px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 6, color: C.textDim, fontSize: 10, cursor: "pointer" }}>Cancelar</button></div></div>)}
    </div>
  );
}
