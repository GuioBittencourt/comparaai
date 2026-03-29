"use client";
import { useState } from "react";
import { C, MN, FN } from "../lib/theme";
import { BannerFinanceiro } from "./Banners";
import SponsorSlot from "./SponsorSlot";
import BudgetCalculator from "./BudgetCalculator";

export default function EducationHub({ onBack, user }) {
  const [subTab, setSubTab] = useState("hub");

  if (subTab === "budget") {
    return (
      <div style={{ padding: "24px 28px", maxWidth: 700, margin: "0 auto" }}>
        <button onClick={() => setSubTab("hub")} style={{ background: "none", border: "none", color: C.textDim, fontSize: 12, cursor: "pointer", fontFamily: FN, marginBottom: 20 }}>
          ← Voltar à Educação Financeira
        </button>
        <BudgetCalculator user={user} />
      </div>
    );
  }

  return (
    <div style={{ padding: "24px 28px", maxWidth: 700, margin: "0 auto" }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: C.textDim, fontSize: 12, cursor: "pointer", fontFamily: FN, marginBottom: 20 }}>
        ← Voltar ao início
      </button>

      <BannerFinanceiro />

      <h2 style={{ fontFamily: MN, fontSize: 20, fontWeight: 800, color: C.white, margin: "0 0 8px" }}>Educação Financeira</h2>
      <p style={{ color: C.textDim, fontSize: 13, lineHeight: 1.7, marginBottom: 28 }}>Aprenda a cuidar do seu dinheiro e faça ele trabalhar pra você.</p>

      <SponsorSlot id="edu-top" />

      <button onClick={() => setSubTab("budget")} style={{
        width: "100%", textAlign: "left", cursor: "pointer",
        background: "linear-gradient(135deg, #0D3320 0%, #0D1117 100%)",
        border: `1px solid ${C.accentBorder}`, borderRadius: 16,
        padding: "20px 22px", marginBottom: 16, display: "flex", alignItems: "center", gap: 16,
      }}>
        <div style={{ fontSize: 32 }}>💰</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: MN, fontSize: 14, fontWeight: 700, color: C.accent }}>Gestão Ativa</span>
            <span style={{ fontSize: 9, padding: "2px 8px", borderRadius: 4, background: `${C.accent}15`, color: C.accent, fontFamily: MN }}>Disponível</span>
          </div>
          <p style={{ fontSize: 12, color: C.textDim, margin: "4px 0 0", lineHeight: 1.6 }}>Gerencie despesas variáveis, defina limites mensais e acompanhe a saúde financeira do seu orçamento.</p>
        </div>
        <span style={{ color: C.accent, fontSize: 18 }}>→</span>
      </button>

      {[
        { icon: "🌱", title: "Conceitos Básicos", desc: "Renda fixa vs variável, juros compostos, inflação, Selic.", level: "Iniciante", color: C.green, tag: "Em breve" },
        { icon: "📊", title: "Análise de Investimentos", desc: "Indicadores fundamentalistas, balanços, comparação de empresas e FIIs.", level: "Intermediário", color: C.blue, tag: "Em breve" },
        { icon: "🧠", title: "Estratégias Avançadas", desc: "Cenários macro, marcação a mercado, hedge, diversificação.", level: "Avançado", color: C.purple, tag: "Em breve" },
      ].map((c) => (
        <div key={c.title} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: "20px 22px", marginBottom: 12, display: "flex", alignItems: "center", gap: 16, opacity: 0.6 }}>
          <div style={{ fontSize: 32 }}>{c.icon}</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontFamily: MN, fontSize: 14, fontWeight: 700, color: C.white }}>{c.title}</span>
              <span style={{ fontSize: 9, padding: "2px 8px", borderRadius: 4, background: `${c.color}15`, color: c.color, fontFamily: MN }}>{c.level}</span>
              <span style={{ fontSize: 9, padding: "2px 8px", borderRadius: 4, background: `${C.yellow}15`, color: C.yellow, fontFamily: MN }}>{c.tag}</span>
            </div>
            <p style={{ fontSize: 12, color: C.textDim, margin: "4px 0 0", lineHeight: 1.6 }}>{c.desc}</p>
          </div>
        </div>
      ))}

      <SponsorSlot id="edu-bottom" />
      <div style={{ textAlign: "center", padding: 20, marginTop: 12 }}><p style={{ fontSize: 11, color: C.textMuted }}>Cursos, e-book e ferramentas em desenvolvimento.</p></div>
    </div>
  );
}
