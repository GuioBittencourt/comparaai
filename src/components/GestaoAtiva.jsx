"use client";
import { useState, useMemo, useEffect } from "react";
import { C, MN, FN } from "../lib/theme";
import { numFmt } from "../lib/utils";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RTooltip } from "recharts";
import SponsorSlot from "./SponsorSlot";
import { BannerFinanceiro } from "./Banners";
import UpgradeModal from "./UpgradeModal";

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
const FREE_MAX = 4;

function loadData() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    if (raw.month !== currentMonth) return { ...raw, month: currentMonth, expenses: [] };
    return raw;
  } catch {
    return {};
  }
}

function saveData(data) {
  try {
    const now = new Date();
    data.month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

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
        <h2 style={{ fontFamily: MN, fontSize: 18, fontWeight: 800, color: C.white, margin: "0 0 6px" }}>
          Perfil de Gestão
        </h2>
        <p style={{ color: C.textDim, fontSize: 12, lineHeight: 1.6 }}>
          Configure sua renda e contas fixas.
        </p>
      </div>

      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20, marginBottom: 14 }}>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 10, color: C.textMuted, fontFamily: MN, marginBottom: 4 }}>
            PROFISSÃO / OCUPAÇÃO
          </div>
          <input
            value={profissao}
            onChange={(e) => setProfissao(e.target.value)}
            placeholder="Ex: Analista, CLT, Autônomo..."
            style={{
              width: "100%",
              padding: "10px 14px",
              background: C.cardAlt,
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              color: C.text,
              fontSize: 13,
              fontFamily: FN,
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 10, color: C.textMuted, fontFamily: MN, marginBottom: 4 }}>
            RENDA LÍQUIDA MENSAL
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ color: C.textDim, fontSize: 13 }}>R$</span>
            <input
              value={renda}
              onChange={(e) => setRenda(e.target.value)}
              type="number"
              placeholder="5000"
              style={{
                flex: 1,
                padding: "10px 14px",
                background: C.cardAlt,
                border: `1px solid ${C.border}`,
                borderRadius: 8,
                color: C.text,
                fontSize: 15,
                fontFamily: MN,
                outline: "none",
              }}
            />
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 10, color: C.textMuted, fontFamily: MN, marginBottom: 4 }}>
            TOTAL CONTAS FIXAS
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ color: C.textDim, fontSize: 13 }}>R$</span>
            <input
              value={fixas}
              onChange={(e) => setFixas(e.target.value)}
              type="number"
              placeholder="3000"
              style={{
                flex: 1,
                padding: "10px 14px",
                background: C.cardAlt,
                border: `1px solid ${C.border}`,
                borderRadius: 8,
                color: C.text,
                fontSize: 15,
                fontFamily: MN,
                outline: "none",
              }}
            />
          </div>
        </div>

        {rendaNum > 0 && fixasNum > 0 && (
          <div style={{ padding: 14, background: C.cardAlt, borderRadius: 10, border: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: C.textDim }}>Fixas:</span>
              <span
                style={{
                  fontFamily: MN,
                  fontSize: 12,
                  fontWeight: 700,
                  color: fixasPct > 60 ? C.red : fixasPct > 50 ? C.yellow : C.accent,
                }}
              >
                {numFmt(fixasPct, 1)}% da renda
              </span>
            </div>

            <div style={{ height: 5, background: C.border, borderRadius: 3, marginBottom: 8, overflow: "hidden" }}>
              <div
                style={{
                  width: `${Math.min(100, fixasPct)}%`,
                  height: "100%",
                  borderRadius: 3,
                  background: fixasPct > 60 ? C.red : fixasPct > 50 ? C.yellow : C.accent,
                }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 11, color: C.textDim }}>Disponível:</span>
              <span style={{ fontFamily: MN, fontSize: 13, fontWeight: 800, color: C.accent }}>
                R$ {numFmt(variavel, 0)}
              </span>
            </div>
          </div>
        )}
      </div>

      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, marginBottom: 14 }}>
        <div style={{ fontFamily: MN, fontSize: 10, color: C.textMuted, marginBottom: 8 }}>
          DISTRIBUIÇÃO SAUDÁVEL
        </div>

        {HEALTHY.map((d) => (
          <div
            key={d.label}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "6px 0",
              borderBottom: `1px solid ${C.border}`,
            }}
          >
            <div>
              <div style={{ fontSize: 11, color: C.white }}>{d.label}</div>
              <div style={{ fontSize: 9, color: C.textMuted }}>{d.desc}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{ fontFamily: MN, fontSize: 13, fontWeight: 700, color: d.color }}>
                {d.pct}%
              </span>
              {rendaNum > 0 && (
                <div style={{ fontSize: 9, color: C.textMuted }}>
                  R$ {numFmt((rendaNum * d.pct) / 100, 0)}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => {
          if (renda && profissao) {
            onComplete({
              renda: rendaNum,
              profissao: profissao.trim(),
              fixas: fixasNum,
            });
          }
        }}
        disabled={!renda || !profissao}
        style={{
          width: "100%",
          padding: "12px",
          borderRadius: 10,
          fontSize: 14,
          fontWeight: 700,
          fontFamily: FN,
          border: "none",
          cursor: renda && profissao ? "pointer" : "not-allowed",
          background: renda && profissao ? C.accent : C.border,
          color: renda && profissao ? C.bg : C.textMuted,
        }}
      >
        {initial ? "Salvar alterações" : "Começar gestão"}
      </button>
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
  const [editProfile, setEditProfile] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const isPremium = user?.is_premium || user?.is_admin;

  useEffect(() => {
    saveData(data);
  }, [data]);

  const profile = data.profile;
  const categories = data.categories || [];
  const expenses = data.expenses || [];

  if (!profile || editProfile) {
    return (
      <div>
        <BannerFinanceiro />
        {editProfile && (
          <button
            onClick={() => setEditProfile(false)}
            style={{
              background: "none",
              border: "none",
              color: C.textDim,
              fontSize: 11,
              cursor: "pointer",
              fontFamily: FN,
              marginBottom: 12,
            }}
          >
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

  const addCat = (preset, limit) => {
    if (!isPremium && categories.length >= FREE_MAX) {
      setShowUpgrade(true);
      return;
    }
    if (categories.find((c) => c.id === preset.id)) return;

    setData((p) => ({
      ...p,
      categories: [...(p.categories || []), { ...preset, limit: parseFloat(limit) || 0 }],
    }));

    setShowAddCat(false);
    setSelPreset(null);
    setCatLimit("");
  };

  const addExp = () => {
    if (!selectedCat || !expVal) return;

    setData((p) => ({
      ...p,
      expenses: [
        ...(p.expenses || []),
        {
          id: Date.now(),
          categoryId: selectedCat,
          value: parseFloat(expVal) || 0,
          desc: expDesc.trim(),
          date: new Date().toISOString(),
        },
      ],
    }));

    setExpVal("");
    setExpDesc("");
    setShowAddExp(false);
    setSelectedCat(null);
  };

  const catTotals = {};
  categories.forEach((c) => {
    catTotals[c.id] = 0;
  });
  expenses.forEach((e) => {
    if (catTotals[e.categoryId] !== undefined) catTotals[e.categoryId] += e.value;
  });

  const totalLimit = categories.reduce((s, c) => s + (c.limit || 0), 0);
  const totalSpent = expenses.reduce((s, e) => s + e.value, 0);

  const distData = [
    { name: "Fixas", value: fixas, fill: C.blue },
    { name: "Variáveis", value: totalSpent, fill: C.orange },
    { name: "Disponível", value: Math.max(0, renda - fixas - totalSpent), fill: C.accent },
  ].filter((d) => d.value > 0);

  const month =
    [
      "Janeiro",
      "Fevereiro",
      "Março",
      "Abril",
      "Maio",
      "Junho",
      "Julho",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Dezembro",
    ][new Date().getMonth()] +
    " " +
    new Date().getFullYear();

  return (
    <div>
      {showUpgrade && (
        <UpgradeModal
          onClose={() => setShowUpgrade(false)}
          message={`Na conta gratuita, você pode acompanhar até ${FREE_MAX} categorias. Desbloqueie o Premium para usar categorias sem limite.`}
        />
      )}

      <BannerFinanceiro />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div>
          <h2 style={{ fontFamily: MN, fontSize: 16, fontWeight: 800, color: C.white, margin: 0 }}>
            Gestão Ativa
          </h2>
          <p style={{ color: C.textDim, fontSize: 11, margin: 0 }}>{month}</p>
        </div>
        <button
          onClick={() => setEditProfile(true)}
          style={{
            padding: "5px 12px",
            borderRadius: 6,
            fontSize: 9,
            fontFamily: MN,
            cursor: "pointer",
            background: C.cardAlt,
            color: C.textDim,
            border: `1px solid ${C.border}`,
          }}
        >
          Perfil de Gestão →
        </button>
      </div>

      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <div>
            <div style={{ fontSize: 10, color: C.textMuted, fontFamily: MN, marginBottom: 2 }}>RENDA LÍQUIDA</div>
            <div style={{ fontFamily: MN, fontSize: 18, fontWeight: 800, color: C.white }}>R$ {numFmt(renda, 0)}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: C.textMuted, fontFamily: MN, marginBottom: 2 }}>FIXAS</div>
            <div style={{ fontFamily: MN, fontSize: 16, fontWeight: 700, color: fixasPct > 60 ? C.red : C.text }}>
              R$ {numFmt(fixas, 0)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: C.textMuted, fontFamily: MN, marginBottom: 2 }}>VARIÁVEL</div>
            <div style={{ fontFamily: MN, fontSize: 16, fontWeight: 700, color: C.accent }}>
              R$ {numFmt(variavel, 0)}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: C.textDim }}>Fixas:</span>
            <span
              style={{
                fontFamily: MN,
                fontSize: 12,
                fontWeight: 700,
                color: fixasPct > 60 ? C.red : fixasPct > 50 ? C.yellow : C.accent,
              }}
            >
              {numFmt(fixasPct, 1)}% da renda
            </span>
          </div>
          <div style={{ height: 5, background: C.border, borderRadius: 3, overflow: "hidden" }}>
            <div
              style={{
                width: `${Math.min(100, fixasPct)}%`,
                height: "100%",
                borderRadius: 3,
                background: fixasPct > 60 ? C.red : fixasPct > 50 ? C.yellow : C.accent,
              }}
            />
          </div>
        </div>
      </div>

      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, marginBottom: 12 }}>
        <div style={{ fontFamily: MN, fontSize: 10, color: C.textMuted, marginBottom: 10 }}>DISTRIBUIÇÃO DO MÊS</div>
        {distData.length > 0 && (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={distData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                {distData.map((d, i) => (
                  <Cell key={i} fill={d.fill} />
                ))}
              </Pie>
              <RTooltip formatter={(v) => `R$ ${numFmt(v, 0)}`} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        <button
          onClick={() => setShowAddCat(true)}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            fontSize: 12,
            fontFamily: MN,
            cursor: "pointer",
            background: C.accent,
            color: C.bg,
            border: "none",
            fontWeight: 700,
          }}
        >
          + Adicionar categoria
        </button>

        {categories.length > 0 && (
          <button
            onClick={() => setShowAddExp(true)}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              fontSize: 12,
              fontFamily: MN,
              cursor: "pointer",
              background: C.cardAlt,
              color: C.text,
              border: `1px solid ${C.border}`,
              fontWeight: 700,
            }}
          >
            + Lançar gasto
          </button>
        )}
      </div>

      {showAddCat && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, marginBottom: 12 }}>
          <div style={{ fontFamily: MN, fontSize: 11, color: C.textDim, marginBottom: 10 }}>
            ESCOLHA UMA CATEGORIA
          </div>

          <div style={{ display: "grid", gap: 8, marginBottom: 12 }}>
            {PRESETS.filter((p) => !categories.find((c) => c.id === p.id)).map((preset) => (
              <button
                key={preset.id}
                onClick={() => setSelPreset(preset)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: `1px solid ${selPreset?.id === preset.id ? preset.color : C.border}`,
                  background: selPreset?.id === preset.id ? `${preset.color}10` : C.cardAlt,
                  color: C.text,
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <span style={{ fontSize: 18 }}>{preset.icon}</span>
                <span style={{ fontSize: 12 }}>{preset.label}</span>
              </button>
            ))}
          </div>

          <input
            value={catLimit}
            onChange={(e) => setCatLimit(e.target.value)}
            type="number"
            placeholder="Limite mensal da categoria (opcional)"
            style={{
              width: "100%",
              padding: "10px 12px",
              background: C.cardAlt,
              border: `1px solid ${C.border}`,
              borderRadius: 10,
              color: C.text,
              fontFamily: FN,
              marginBottom: 10,
              boxSizing: "border-box",
            }}
          />

          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => selPreset && addCat(selPreset, catLimit)}
              disabled={!selPreset}
              style={{
                flex: 1,
                padding: "10px 12px",
                borderRadius: 10,
                border: "none",
                cursor: selPreset ? "pointer" : "not-allowed",
                background: selPreset ? C.accent : C.border,
                color: selPreset ? C.bg : C.textMuted,
                fontFamily: MN,
                fontWeight: 700,
              }}
            >
              Salvar categoria
            </button>
            <button
              onClick={() => {
                setShowAddCat(false);
                setSelPreset(null);
                setCatLimit("");
              }}
              style={{
                padding: "10px 12px",
                borderRadius: 10,
                border: `1px solid ${C.border}`,
                cursor: "pointer",
                background: "transparent",
                color: C.textDim,
                fontFamily: MN,
              }}
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {showAddExp && categories.length > 0 && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, marginBottom: 12 }}>
          <div style={{ fontFamily: MN, fontSize: 11, color: C.textDim, marginBottom: 10 }}>
            LANÇAR GASTO
          </div>

          <select
            value={selectedCat || ""}
            onChange={(e) => setSelectedCat(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px",
              background: C.cardAlt,
              border: `1px solid ${C.border}`,
              borderRadius: 10,
              color: C.text,
              fontFamily: FN,
              marginBottom: 10,
              boxSizing: "border-box",
            }}
          >
            <option value="">Selecione a categoria</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>

          <input
            value={expVal}
            onChange={(e) => setExpVal(e.target.value)}
            type="number"
            placeholder="Valor"
            style={{
              width: "100%",
              padding: "10px 12px",
              background: C.cardAlt,
              border: `1px solid ${C.border}`,
              borderRadius: 10,
              color: C.text,
              fontFamily: FN,
              marginBottom: 10,
              boxSizing: "border-box",
            }}
          />

          <input
            value={expDesc}
            onChange={(e) => setExpDesc(e.target.value)}
            placeholder="Descrição (opcional)"
            style={{
              width: "100%",
              padding: "10px 12px",
              background: C.cardAlt,
              border: `1px solid ${C.border}`,
              borderRadius: 10,
              color: C.text,
              fontFamily: FN,
              marginBottom: 10,
              boxSizing: "border-box",
            }}
          />

          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={addExp}
              style={{
                flex: 1,
                padding: "10px 12px",
                borderRadius: 10,
                border: "none",
                cursor: "pointer",
                background: C.accent,
                color: C.bg,
                fontFamily: MN,
                fontWeight: 700,
              }}
            >
              Salvar gasto
            </button>
            <button
              onClick={() => {
                setShowAddExp(false);
                setSelectedCat(null);
                setExpVal("");
                setExpDesc("");
              }}
              style={{
                padding: "10px 12px",
                borderRadius: 10,
                border: `1px solid ${C.border}`,
                cursor: "pointer",
                background: "transparent",
                color: C.textDim,
                fontFamily: MN,
              }}
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {categories.map((cat) => {
        const spent = catTotals[cat.id] || 0;
        const remaining = (cat.limit || 0) - spent;
        const exps = expenses.filter((e) => e.categoryId === cat.id);

        return (
          <div key={cat.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 20 }}>{cat.icon}</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.white }}>{cat.label}</div>
                  <div style={{ fontSize: 10, color: C.textDim }}>
                    Limite: R$ {numFmt(cat.limit || 0, 0)} • Gasto: R$ {numFmt(spent, 0)}
                  </div>
                </div>
              </div>

              <button
                onClick={() =>
                  setData((p) => ({
                    ...p,
                    categories: p.categories.filter((c) => c.id !== cat.id),
                    expenses: p.expenses.filter((e) => e.categoryId !== cat.id),
                  }))
                }
                style={{
                  padding: "4px 8px",
                  borderRadius: 5,
                  fontSize: 9,
                  cursor: "pointer",
                  background: "transparent",
                  color: C.textMuted,
                  border: `1px solid ${C.border}`,
                }}
              >
                Remover
              </button>
            </div>

            <div style={{ height: 6, background: C.border, borderRadius: 4, overflow: "hidden", marginBottom: 8 }}>
              <div
                style={{
                  width: `${cat.limit > 0 ? Math.min(100, (spent / cat.limit) * 100) : 0}%`,
                  height: "100%",
                  background: spent > (cat.limit || 0) ? C.red : cat.color,
                  borderRadius: 4,
                }}
              />
            </div>

            <div style={{ fontSize: 10, color: remaining < 0 ? C.red : C.textDim, marginBottom: exps.length > 0 ? 6 : 0 }}>
              {remaining >= 0 ? `Restante: R$ ${numFmt(remaining, 0)}` : `Estourado em: R$ ${numFmt(Math.abs(remaining), 0)}`}
            </div>

            {exps.map((exp) => (
              <div
                key={exp.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "4px 0",
                  borderTop: `1px solid ${C.border}`,
                }}
              >
                <span style={{ fontSize: 10, color: C.text }}>
                  {exp.desc || "Gasto"}{" "}
                  <span style={{ color: C.textMuted, fontSize: 8 }}>
                    {new Date(exp.date).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                    })}
                  </span>
                </span>
                <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                  <span style={{ fontFamily: MN, fontSize: 10, color: C.red }}>
                    -R$ {numFmt(exp.value, 2)}
                  </span>
                  <button
                    onClick={() =>
                      setData((p) => ({
                        ...p,
                        expenses: p.expenses.filter((e) => e.id !== exp.id),
                      }))
                    }
                    style={{
                      background: "none",
                      border: "none",
                      color: C.textMuted,
                      cursor: "pointer",
                      fontSize: 10,
                    }}
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        );
      })}

      {categories.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "30px 16px",
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 12,
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 8 }}>💰</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.white, marginBottom: 6 }}>
            Comece sua gestão ativa
          </div>
          <div style={{ fontSize: 11, color: C.textDim, lineHeight: 1.6, marginBottom: 14 }}>
            Adicione categorias de despesas variáveis e controle seus gastos.
          </div>
          <button
            onClick={() => setShowAddCat(true)}
            style={{
              padding: "10px 18px",
              borderRadius: 10,
              fontSize: 12,
              fontFamily: MN,
              cursor: "pointer",
              background: C.accent,
              color: C.bg,
              border: "none",
              fontWeight: 700,
            }}
          >
            + Adicionar categoria
          </button>
        </div>
      )}

      <SponsorSlot id="gestao-bottom" />

      <p style={{ textAlign: "center", fontSize: 9, color: C.textMuted, marginTop: 14, lineHeight: 1.5 }}>
        comparainvest — Gestão Ativa. Gastos resetam todo início de mês.
        {!isPremium && ` Conta gratuita: máx. ${FREE_MAX} categorias.`}
      </p>
    </div>
  );
}
