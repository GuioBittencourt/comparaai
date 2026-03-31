"use client";
import { C, MN, FN } from "../lib/theme";
import { BannerFinanceiro, BannerRiqueza } from "./Banners";
import SponsorSlot from "./SponsorSlot";

export default function HomePage({ user, onTrack }) {
  return (
    <div style={{ padding: "32px 28px", maxWidth: 700, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontSize: 42, marginBottom: 12 }}>👋</div>
        <h2 style={{ fontFamily: MN, fontSize: 22, fontWeight: 800, color: C.white, margin: "0 0 8px" }}>
          Olá, {user?.nome}!
        </h2>
        <p style={{ color: C.textDim, fontSize: 14, lineHeight: 1.7 }}>
          O que deseja explorar hoje?
        </p>
      </div>

      <SponsorSlot id="home-top" />

      {/* Investimentos Track */}
      <button
        onClick={() => onTrack("investimentos")}
        style={{
          width: "100%", padding: "28px 24px", marginBottom: 16,
          background: "linear-gradient(135deg, #0D3320 0%, #0D1117 100%)",
          border: `1px solid ${C.accentBorder}`, borderRadius: 18,
          cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 18,
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.accent; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.accentBorder; }}
      >
        <div style={{ fontSize: 38 }}>📈</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: MN, fontSize: 16, fontWeight: 700, color: C.accent, marginBottom: 4 }}>
            Investimentos
          </div>
          <div style={{ fontSize: 13, color: C.textDim, lineHeight: 1.6 }}>
            Descubra sua filosofia de investidor, compare ações, FIIs e renda fixa, monte sua carteira simulada
          </div>
        </div>
        <span style={{ fontSize: 22, color: C.accent }}>→</span>
      </button>

      {/* Educação Track */}
      <button
        onClick={() => onTrack("educacao")}
        style={{
          width: "100%", padding: "28px 24px", marginBottom: 24,
          background: "linear-gradient(135deg, #1a1040 0%, #0D1117 100%)",
          border: `1px solid ${C.purple}40`, borderRadius: 18,
          cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 18,
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.purple; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${C.purple}40`; }}
      >
        <div style={{ fontSize: 38 }}>📚</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: MN, fontSize: 16, fontWeight: 700, color: C.purple, marginBottom: 4 }}>
            Educação Financeira
          </div>
          <div style={{ fontSize: 13, color: C.textDim, lineHeight: 1.6 }}>
            Aprenda a controlar seus gastos, entenda o mercado, cursos e ferramentas práticas
          </div>
        </div>
        <span style={{ fontSize: 22, color: C.purple }}>→</span>
      </button>

      <SponsorSlot id="home-bottom" />

      {/* Quick stats */}
      <div style={{ textAlign: "center", padding: "16px", borderTop: `1px solid ${C.border}`, marginTop: 8 }}>
        <p style={{ fontSize: 11, color: C.textMuted }}>
          comparainvest — Simulação educativa, não constitui recomendação de investimento.
        </p>
      </div>
    </div>
  );
}
