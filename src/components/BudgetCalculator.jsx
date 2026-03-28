"use client";
import { useState, useMemo, useEffect } from "react";
import { C, MN, FN, PAL } from "../lib/theme";
import { numFmt } from "../lib/utils";
import SponsorSlot from "./SponsorSlot";
import { BannerFinanceiro } from "./Banners";

const PRESET_CATEGORIES = [
  { id: "mercado", label: "Mercado / Alimentação", icon: "🛒", color: C.accent },
  { id: "transporte", label: "Transporte / Gasolina", icon: "⛽", color: C.blue },
  { id: "diversao", label: "Diversão / Lazer", icon: "🎉", color: C.purple },
  { id: "saude", label: "Saúde / Farmácia", icon: "💊", color: C.pink },
  { id: "roupas", label: "Roupas / Pessoal", icon: "👕", color: C.orange },
  { id: "pets", label: "Pets", icon: "🐾", color: C.yellow },
  { id: "educacao", label: "Educação / Cursos", icon: "📚", color: "#818CF8" },
  { id: "outros", label: "Outros", icon: "📦", color: C.textDim },
];

const STORAGE_KEY = "comparai_budget";

function loadBudget() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    // Reset if new month
    if (raw.month !== currentMonth) {
      return { month: currentMonth, categories: [], expenses: [] };
    }
    return raw;
  } catch { return { month: "", categories: [], expenses: [] }; }
}

function saveBudget(data) {
  try {
    const now = new Date();
    data.month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

export default function BudgetCalculator({ user }) {
  const [budget, setBudget] = useState(() => loadBudget());
  const [showAddCat, setShowAddCat] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [selectedCat, setSelectedCat] = useState(null);
  const [expenseValue, setExpenseValue] = useState("");
  const [expenseDesc, setExpenseDesc] = useState("");
  const [customCatName, setCustomCatName] = useState("");
  const [customCatLimit, setCustomCatLimit] = useState("");
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [catLimit, setCatLimit] = useState("");

  const isPremium = user?.is_premium || user?.is_admin;
  const FREE_MAX_CATEGORIES = 2;

  // Save on every change
  useEffect(() => { saveBudget(budget); }, [budget]);

  const addCategory = (preset, limit) => {
    if (!isPremium && budget.categories.length >= FREE_MAX_CATEGORIES) return;
    const exists = budget.categories.find((c) => c.id === preset.id);
    if (exists) return;
    setBudget((prev) => ({
      ...prev,
      categories: [...prev.categories, { ...preset, limit: parseFloat(limit) || 0 }],
    }));
    setShowAddCat(false);
    setSelectedPreset(null);
    setCatLimit("");
    setCustomCatName("");
    setCustomCatLimit("");
  };

  const addCustomCategory = () => {
    if (!customCatName.trim() || !customCatLimit) return;
    const id = `custom_${Date.now()}`;
    addCategory({ id, label: customCatName.trim(), icon: "📌", color: PAL[budget.categories.length % PAL.length] }, customCatLimit);
  };

  const removeCategory = (catId) => {
    setBudget((prev) => ({
      ...prev,
      categories: prev.categories.filter((c) => c.id !== catId),
      expenses: prev.expenses.filter((e) => e.categoryId !== catId),
    }));
  };

  const addExpense = () => {
    if (!selectedCat || !expenseValue) return;
    const expense = {
      id: Date.now(),
      categoryId: selectedCat,
      value: parseFloat(expenseValue) || 0,
      desc: expenseDesc.trim() || "",
      date: new Date().toISOString(),
      // FUTURE: photoUrl will go here when OCR is implemented
    };
    setBudget((prev) => ({ ...prev, expenses: [...prev.expenses, expense] }));
    setExpenseValue("");
    setExpenseDesc("");
    setShowAddExpense(false);
    setSelectedCat(null);
  };

  const removeExpense = (expId) => {
    setBudget((prev) => ({ ...prev, expenses: prev.expenses.filter((e) => e.id !== expId) }));
  };

  const resetMonth = () => {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    setBudget({ month: currentMonth, categories: budget.categories, expenses: [] });
  };

  // Calculations
  const catTotals = useMemo(() => {
    const totals = {};
    budget.categories.forEach((c) => { totals[c.id] = 0; });
    budget.expenses.forEach((e) => { if (totals[e.categoryId] !== undefined) totals[e.categoryId] += e.value; });
    return totals;
  }, [budget]);

  const totalLimit = useMemo(() => budget.categories.reduce((s, c) => s + (c.limit || 0), 0), [budget.categories]);
  const totalSpent = useMemo(() => budget.expenses.reduce((s, e) => s + e.value, 0), [budget.expenses]);
  const totalRemaining = totalLimit - totalSpent;

  const monthName = (() => {
    const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    return months[new Date().getMonth()] + " " + new Date().getFullYear();
  })();

  return (
    <div>
      <BannerFinanceiro />

      <h2 style={{ fontFamily: MN, fontSize: 18, fontWeight: 800, color: C.white, margin: "0 0 4px" }}>Controle de Gastos</h2>
      <p style={{ color: C.textDim, fontSize: 13, marginBottom: 20, lineHeight: 1.7 }}>
        {monthName} — Controle suas despesas variáveis do mês
      </p>

      {/* Summary card */}
      {budget.categories.length > 0 && (
        <div style={{
          background: totalRemaining >= 0 ? "linear-gradient(135deg, #0D3320 0%, #0D1117 100%)" : "linear-gradient(135deg, #3d0d0d 0%, #0D1117 100%)",
          border: `1px solid ${totalRemaining >= 0 ? C.accentBorder : `${C.red}40`}`,
          borderRadius: 16, padding: 24, marginBottom: 20, textAlign: "center",
        }}>
          <div style={{ fontSize: 11, color: C.textMuted, fontFamily: MN, marginBottom: 4 }}>SALDO DISPONÍVEL NO MÊS</div>
          <div style={{ fontFamily: MN, fontSize: 36, fontWeight: 800, color: totalRemaining >= 0 ? C.accent : C.red }}>
            R$ {numFmt(Math.abs(totalRemaining), 2)}
          </div>
          {totalRemaining < 0 && <div style={{ fontSize: 12, color: C.red, marginTop: 4 }}>Você estourou o orçamento!</div>}
          <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 12 }}>
            <div>
              <div style={{ fontSize: 10, color: C.textMuted }}>Orçamento</div>
              <div style={{ fontFamily: MN, fontSize: 14, color: C.white }}>R$ {numFmt(totalLimit, 2)}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: C.textMuted }}>Gasto</div>
              <div style={{ fontFamily: MN, fontSize: 14, color: C.red }}>R$ {numFmt(totalSpent, 2)}</div>
            </div>
          </div>
          {/* Progress bar */}
          <div style={{ height: 6, background: C.border, borderRadius: 4, marginTop: 14, overflow: "hidden" }}>
            <div style={{
              width: `${Math.min(100, totalLimit > 0 ? (totalSpent / totalLimit) * 100 : 0)}%`,
              height: "100%", borderRadius: 4,
              background: totalSpent / totalLimit > 0.9 ? C.red : totalSpent / totalLimit > 0.7 ? C.yellow : C.accent,
              transition: "width 0.4s ease",
            }} />
          </div>
        </div>
      )}

      {/* Categories */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ fontFamily: MN, fontSize: 12, color: C.textDim }}>MINHAS CATEGORIAS ({budget.categories.length})</span>
        <div style={{ display: "flex", gap: 8 }}>
          {budget.categories.length > 0 && (
            <button onClick={resetMonth} style={{ padding: "4px 12px", borderRadius: 6, fontSize: 10, fontFamily: MN, cursor: "pointer", background: `${C.red}15`, color: C.red, border: `1px solid ${C.red}30` }}>
              Resetar mês
            </button>
          )}
          <button onClick={() => {
            if (!isPremium && budget.categories.length >= FREE_MAX_CATEGORIES) {
              alert("Conta gratuita permite até 2 categorias. Faça upgrade para Premium!");
              return;
            }
            setShowAddCat(true);
          }} style={{ padding: "4px 12px", borderRadius: 6, fontSize: 10, fontFamily: MN, cursor: "pointer", background: `${C.accent}15`, color: C.accent, border: `1px solid ${C.accent}30` }}>
            + Categoria
          </button>
        </div>
      </div>

      {/* Category cards */}
      {budget.categories.map((cat) => {
        const spent = catTotals[cat.id] || 0;
        const remaining = cat.limit - spent;
        const pct = cat.limit > 0 ? (spent / cat.limit) * 100 : 0;
        const catExpenses = budget.expenses.filter((e) => e.categoryId === cat.id).sort((a, b) => new Date(b.date) - new Date(a.date));

        return (
          <div key={cat.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 18, marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 20 }}>{cat.icon}</span>
                <div>
                  <div style={{ fontFamily: MN, fontSize: 13, fontWeight: 700, color: C.white }}>{cat.label}</div>
                  <div style={{ fontSize: 10, color: C.textMuted }}>Limite: R$ {numFmt(cat.limit, 2)}</div>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: MN, fontSize: 16, fontWeight: 800, color: remaining >= 0 ? cat.color : C.red }}>
                  R$ {numFmt(Math.abs(remaining), 2)}
                </div>
                <div style={{ fontSize: 10, color: remaining >= 0 ? C.textMuted : C.red }}>
                  {remaining >= 0 ? "restante" : "estourado"}
                </div>
              </div>
            </div>

            {/* Mini progress */}
            <div style={{ height: 4, background: C.border, borderRadius: 3, marginBottom: 10, overflow: "hidden" }}>
              <div style={{
                width: `${Math.min(100, pct)}%`, height: "100%", borderRadius: 3,
                background: pct > 90 ? C.red : pct > 70 ? C.yellow : cat.color,
                transition: "width 0.3s ease",
              }} />
            </div>

            {/* Add expense button */}
            <div style={{ display: "flex", gap: 8, marginBottom: catExpenses.length > 0 ? 10 : 0 }}>
              <button onClick={() => { setSelectedCat(cat.id); setShowAddExpense(true); }}
                style={{ padding: "6px 14px", borderRadius: 8, fontSize: 11, fontFamily: MN, cursor: "pointer", background: `${cat.color}15`, color: cat.color, border: `1px solid ${cat.color}30` }}>
                + Lançar gasto
              </button>
              <button onClick={() => removeCategory(cat.id)}
                style={{ padding: "6px 10px", borderRadius: 8, fontSize: 11, cursor: "pointer", background: "transparent", color: C.textMuted, border: `1px solid ${C.border}` }}
                onMouseEnter={(e) => e.target.style.color = C.red} onMouseLeave={(e) => e.target.style.color = C.textMuted}>
                Remover
              </button>
            </div>

            {/* Expense list */}
            {catExpenses.map((exp) => (
              <div key={exp.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0", borderTop: `1px solid ${C.border}` }}>
                <div>
                  <span style={{ fontSize: 12, color: C.text }}>{exp.desc || "Gasto"}</span>
                  <span style={{ fontSize: 10, color: C.textMuted, marginLeft: 8 }}>
                    {new Date(exp.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontFamily: MN, fontSize: 12, fontWeight: 600, color: C.red }}>-R$ {numFmt(exp.value, 2)}</span>
                  <button onClick={() => removeExpense(exp.id)} style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 12 }}
                    onMouseEnter={(e) => e.target.style.color = C.red} onMouseLeave={(e) => e.target.style.color = C.textMuted}>×</button>
                </div>
              </div>
            ))}
          </div>
        );
      })}

      {/* Empty state */}
      {budget.categories.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 20px", background: C.card, border: `1px solid ${C.border}`, borderRadius: 16 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>💰</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: C.white, marginBottom: 8 }}>Comece a controlar seus gastos</div>
          <div style={{ fontSize: 13, color: C.textDim, maxWidth: 400, margin: "0 auto", lineHeight: 1.7, marginBottom: 20 }}>
            Adicione categorias de despesas variáveis (mercado, gasolina, diversão...), defina um limite mensal pra cada uma, e registre seus gastos. No final do mês, reseta e começa de novo.
          </div>
          <button onClick={() => setShowAddCat(true)} style={{ padding: "12px 24px", borderRadius: 12, fontSize: 13, fontFamily: MN, cursor: "pointer", background: C.accent, color: C.bg, border: "none", fontWeight: 700 }}>
            + Adicionar primeira categoria
          </button>
        </div>
      )}

      <SponsorSlot id="budget-bottom" />

      {/* ═══════════ MODAL: Add Category ═══════════ */}
      {showAddCat && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }} onClick={() => setShowAddCat(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 420, background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: "28px 24px", maxHeight: "85vh", overflowY: "auto" }}>
            <h3 style={{ fontFamily: MN, fontSize: 16, fontWeight: 800, color: C.white, margin: "0 0 16px" }}>Adicionar Categoria</h3>

            {/* Presets */}
            <div style={{ fontSize: 11, color: C.textMuted, fontFamily: MN, marginBottom: 8 }}>CATEGORIAS SUGERIDAS</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
              {PRESET_CATEGORIES.filter((p) => !budget.categories.find((c) => c.id === p.id)).map((preset) => (
                <button key={preset.id} onClick={() => setSelectedPreset(preset)}
                  style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
                    background: selectedPreset?.id === preset.id ? `${preset.color}15` : C.cardAlt,
                    border: `1px solid ${selectedPreset?.id === preset.id ? `${preset.color}40` : C.border}`,
                    borderRadius: 10, cursor: "pointer", textAlign: "left",
                  }}>
                  <span style={{ fontSize: 18 }}>{preset.icon}</span>
                  <span style={{ fontSize: 13, color: C.white }}>{preset.label}</span>
                </button>
              ))}
            </div>

            {/* Limit input for preset */}
            {selectedPreset && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: C.textMuted, fontFamily: MN, marginBottom: 4 }}>LIMITE MENSAL PARA {selectedPreset.label.toUpperCase()}</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <input value={catLimit} onChange={(e) => setCatLimit(e.target.value)} type="number" placeholder="Ex: 1000"
                    style={{ flex: 1, padding: "10px 14px", background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 14, fontFamily: MN, outline: "none" }}
                    autoFocus />
                  <button onClick={() => addCategory(selectedPreset, catLimit)}
                    disabled={!catLimit}
                    style={{ padding: "10px 20px", borderRadius: 10, background: catLimit ? C.accent : C.border, color: catLimit ? C.bg : C.textMuted, border: "none", fontSize: 13, fontWeight: 700, fontFamily: FN, cursor: catLimit ? "pointer" : "not-allowed" }}>
                    Adicionar
                  </button>
                </div>
              </div>
            )}

            {/* Custom category */}
            <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 16, marginTop: 8 }}>
              <div style={{ fontSize: 11, color: C.textMuted, fontFamily: MN, marginBottom: 8 }}>OU CRIAR CATEGORIA PERSONALIZADA</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <input value={customCatName} onChange={(e) => setCustomCatName(e.target.value)} placeholder="Nome da categoria"
                  style={{ padding: "10px 14px", background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 13, fontFamily: FN, outline: "none" }} />
                <div style={{ display: "flex", gap: 8 }}>
                  <input value={customCatLimit} onChange={(e) => setCustomCatLimit(e.target.value)} type="number" placeholder="Limite R$/mês"
                    style={{ flex: 1, padding: "10px 14px", background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 13, fontFamily: MN, outline: "none" }} />
                  <button onClick={addCustomCategory}
                    disabled={!customCatName.trim() || !customCatLimit}
                    style={{ padding: "10px 20px", borderRadius: 10, background: customCatName && customCatLimit ? C.accent : C.border, color: customCatName && customCatLimit ? C.bg : C.textMuted, border: "none", fontSize: 13, fontWeight: 700, fontFamily: FN, cursor: customCatName && customCatLimit ? "pointer" : "not-allowed" }}>
                    Criar
                  </button>
                </div>
              </div>
            </div>

            <button onClick={() => { setShowAddCat(false); setSelectedPreset(null); }} style={{ width: "100%", marginTop: 16, padding: "10px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 10, color: C.textDim, fontSize: 12, cursor: "pointer", fontFamily: FN }}>
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* ═══════════ MODAL: Add Expense ═══════════ */}
      {showAddExpense && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }} onClick={() => setShowAddExpense(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 380, background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: "28px 24px" }}>
            <h3 style={{ fontFamily: MN, fontSize: 16, fontWeight: 800, color: C.white, margin: "0 0 4px" }}>Lançar Gasto</h3>
            <p style={{ fontSize: 12, color: C.textDim, marginBottom: 16 }}>
              {budget.categories.find((c) => c.id === selectedCat)?.icon} {budget.categories.find((c) => c.id === selectedCat)?.label}
            </p>

            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: C.textMuted, fontFamily: MN, marginBottom: 4 }}>VALOR</div>
              <input value={expenseValue} onChange={(e) => setExpenseValue(e.target.value)} type="number" placeholder="Ex: 150.00"
                style={{ width: "100%", padding: "12px 16px", background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 16, fontFamily: MN, outline: "none" }}
                autoFocus />
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: C.textMuted, fontFamily: MN, marginBottom: 4 }}>DESCRIÇÃO (opcional)</div>
              <input value={expenseDesc} onChange={(e) => setExpenseDesc(e.target.value)} placeholder="Ex: Compra no Assaí"
                style={{ width: "100%", padding: "10px 14px", background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 13, fontFamily: FN, outline: "none" }} />
            </div>

            {/* FUTURE: Photo/receipt upload button - dormant for now
            <div style={{ marginBottom: 16, padding: 14, background: C.cardAlt, borderRadius: 10, border: `1px dashed ${C.border}`, textAlign: "center" }}>
              <div style={{ fontSize: 11, color: C.textMuted }}>📷 Foto do comprovante (em breve)</div>
            </div>
            */}

            <button onClick={addExpense}
              disabled={!expenseValue}
              style={{ width: "100%", padding: "14px", background: expenseValue ? C.accent : C.border, color: expenseValue ? C.bg : C.textMuted, border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700, fontFamily: FN, cursor: expenseValue ? "pointer" : "not-allowed", marginBottom: 8 }}>
              Lançar gasto
            </button>

            <button onClick={() => { setShowAddExpense(false); setSelectedCat(null); }} style={{ width: "100%", padding: "10px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 10, color: C.textDim, fontSize: 12, cursor: "pointer", fontFamily: FN }}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Info text */}
      <div style={{ marginTop: 20, textAlign: "center" }}>
        <p style={{ fontSize: 10, color: C.textMuted, lineHeight: 1.6 }}>
          Os dados ficam salvos no seu dispositivo. Todo início de mês os gastos resetam automaticamente, mantendo suas categorias e limites.
          {!isPremium && " Conta gratuita: máx. 2 categorias. Faça upgrade para ilimitado."}
        </p>
      </div>
    </div>
  );
}
