"use client";
import { C, MN, FN } from "../lib/theme";
import { BannerFinanceiro } from "./Banners";
import SponsorSlot from "./SponsorSlot";

export default function EducationHub({ onBack }) {
  return (
    <div style={{ padding: "24px 28px", maxWidth: 700, margin: "0 auto" }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: C.textDim, fontSize: 12, cursor: "pointer", fontFamily: FN, marginBottom: 20 }}>
        ← Voltar ao início
      </button>

      <BannerFinanceiro />

      <h2 style={{ fontFamily: MN, fontSize: 20, fontWeight: 800, color: C.white, margin: "0 0 8px" }}>
        📚 Educação Financeira
      </h2>
      <p style={{ color: C.textDim, fontSize: 13, lineHeight: 1.7, marginBottom: 28 }}>
        Aprenda a cuidar do seu dinheiro e faça ele trabalhar pra você.
      </p>

      <SponsorSlot id="edu-top" />

      {/* Course cards */}
      {[
        { icon: "🌱", title: "Conceitos Básicos", desc: "Renda fixa vs variável, juros compostos, inflação, Selic. O essencial pra começar.", level: "Iniciante", color: C.green },
        { icon: "📊", title: "Análise de Investimentos", desc: "Indicadores fundamentalistas, como ler balanços, comparar empresas e FIIs.", level: "Intermediário", color: C.blue },
        { icon: "🧠", title: "Estratégias Avançadas", desc: "Cenários macro, marcação a mercado, hedge, diversificação global.", level: "Avançado", color: C.purple },
        { icon: "💰", title: "Controle de Gastos", desc: "Ferramenta prática pra controlar despesas variáveis e sobrar grana todo mês.", level: "Prático", color: C.orange, soon: false, tag: "Em breve" },
      ].map((c) => (
        <div key={c.title} style={{
          background: C.card, border: `1px solid ${C.border}`, borderRadius: 16,
          padding: "20px 22px", marginBottom: 12, display: "flex", alignItems: "center", gap: 16,
          opacity: c.tag ? 0.6 : 1,
        }}>
          <div style={{ fontSize: 32 }}>{c.icon}</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontFamily: MN, fontSize: 14, fontWeight: 700, color: C.white }}>{c.title}</span>
              <span style={{ fontSize: 9, padding: "2px 8px", borderRadius: 4, background: `${c.color}15`, color: c.color, fontFamily: MN }}>{c.level}</span>
              {c.tag && <span style={{ fontSize: 9, padding: "2px 8px", borderRadius: 4, background: `${C.yellow}15`, color: C.yellow, fontFamily: MN }}>{c.tag}</span>}
            </div>
            <p style={{ fontSize: 12, color: C.textDim, margin: "4px 0 0", lineHeight: 1.6 }}>{c.desc}</p>
          </div>
        </div>
      ))}

      <SponsorSlot id="edu-bottom" />

      <div style={{ textAlign: "center", padding: 20, marginTop: 12 }}>
        <p style={{ fontSize: 11, color: C.textMuted }}>Conteúdos em desenvolvimento — em breve cursos, e-book e ferramentas práticas.</p>
      </div>
    </div>
  );
}
