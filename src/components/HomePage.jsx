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
      <div
        style={{
          background: "linear-gradient(135deg, rgba(0,229,160,0.08) 0%, rgba(13,17,23,1) 100%)",
          border: `1px solid ${C.accentBorder}`,
          borderRadius: 18,
          padding: "22px 20px",
          marginBottom: 20,
        }}
      >
        <div
          style={{
            fontFamily: MN,
            fontSize: 11,
            fontWeight: 700,
            color: C.accent,
            letterSpacing: "1px",
            textTransform: "uppercase",
            marginBottom: 10,
          }}
        >
          Comece por aqui
        </div>

        <div style={{ fontSize: 14, color: C.white, fontWeight: 700, marginBottom: 10 }}>
          Descubra sua filosofia de investidor em menos de 1 minuto.
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: C.textDim }}>1. Descubra sua filosofia de investidor</div>
          <div style={{ fontSize: 12, color: C.textDim }}>2. Compare ativos com mais clareza</div>
          <div style={{ fontSize: 12, color: C.textDim }}>3. Monte sua estratégia com mais confiança</div>
        </div>

        <button
          onClick={() => onTrack("quiz")}
          style={{
            padding: "10px 16px",
            borderRadius: 10,
            fontSize: 12,
            fontWeight: 700,
            fontFamily: MN,
            cursor: "pointer",
            background: C.accent,
            color: C.bg,
            border: "none",
          }}
        >
          Começar agora
        </button>
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
