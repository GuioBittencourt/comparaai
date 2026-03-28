"use client";
import { C, MN, FN, WA_FINANCEIRO, WA_RIQUEZA } from "../lib/theme";

export function BannerFinanceiro() {
  return (
    <a href={WA_FINANCEIRO} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", display: "block", marginBottom: 20 }}>
      <div style={{
        background: "linear-gradient(135deg, #0D3320 0%, #0D1117 100%)",
        border: `1px solid ${C.accentBorder}`,
        borderRadius: 14, padding: "16px 20px",
        display: "flex", alignItems: "center", gap: 14,
        cursor: "pointer", transition: "all 0.2s",
      }}>
        <span style={{ fontSize: 28 }}>💰</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: MN, fontSize: 13, fontWeight: 700, color: C.accent }}>
            Diagnóstico Financeiro Gratuito
          </div>
          <div style={{ fontSize: 11, color: C.textDim, marginTop: 2 }}>
            Saúde financeira + sobrar grana todo mês — fale com um especialista
          </div>
        </div>
        <span style={{ fontSize: 20, color: C.accent }}>→</span>
      </div>
    </a>
  );
}

export function BannerRiqueza() {
  return (
    <a href={WA_RIQUEZA} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", display: "block", marginBottom: 20 }}>
      <div style={{
        background: "linear-gradient(135deg, #1a1040 0%, #0D1117 100%)",
        border: `1px solid ${C.purple}40`,
        borderRadius: 14, padding: "16px 20px",
        display: "flex", alignItems: "center", gap: 14,
        cursor: "pointer", transition: "all 0.2s",
      }}>
        <span style={{ fontSize: 28 }}>🚀</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: MN, fontSize: 13, fontWeight: 700, color: C.purple }}>
            Diagnóstico da Riqueza Gratuito
          </div>
          <div style={{ fontSize: 11, color: C.textDim, marginTop: 2 }}>
            Alavanque seu patrimônio já existente — consultoria gratuita
          </div>
        </div>
        <span style={{ fontSize: 20, color: C.purple }}>→</span>
      </div>
    </a>
  );
}
