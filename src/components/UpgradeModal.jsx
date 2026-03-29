"use client";
import { C, MN, FN } from "../lib/theme";

const WA_PREMIUM = "https://wa.me/5512988890312?text=Ol%C3%A1%20vim%20pelo%20comparainvest.%20Quero%20saber%20sobre%20o%20plano%20Premium!";

export default function UpgradeModal({ onClose, message }) {
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center",
      justifyContent: "center", zIndex: 1000, padding: 20,
    }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: "100%", maxWidth: 420, background: C.card,
        border: `1px solid ${C.accentBorder}`, borderRadius: 20,
        padding: "36px 28px", textAlign: "center",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${C.accent}, ${C.purple})` }} />

        <div style={{ fontSize: 48, marginBottom: 12 }}>⭐</div>
        <h3 style={{ fontFamily: MN, fontSize: 18, fontWeight: 800, color: C.white, margin: "0 0 8px" }}>
          Recurso Premium
        </h3>
        <p style={{ fontSize: 13, color: C.textDim, lineHeight: 1.7, marginBottom: 24 }}>
          {message || "Essa funcionalidade está disponível para usuários Premium. Faça upgrade para desbloquear!"}
        </p>

        <div style={{
          background: C.cardAlt, borderRadius: 14, padding: "18px 20px",
          border: `1px solid ${C.border}`, marginBottom: 20, textAlign: "left",
        }}>
          <div style={{ fontFamily: MN, fontSize: 12, fontWeight: 700, color: C.accent, marginBottom: 10 }}>
            ✅ O que você ganha no Premium:
          </div>
          {[
            "Comparações ilimitadas de ativos",
            "Sem limite de ativos por comparação",
            "Carteira fictícia completa com projeções",
            "Simulador de cenários macro",
            "Todas as features futuras incluídas",
          ].map((item) => (
            <div key={item} style={{ fontSize: 12, color: C.textDim, padding: "4px 0", display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ color: C.accent }}>•</span> {item}
            </div>
          ))}
        </div>

        <a href={WA_PREMIUM} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", display: "block" }}>
          <button style={{
            width: "100%", padding: "14px", background: C.accent, color: C.bg,
            border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700,
            fontFamily: FN, cursor: "pointer", marginBottom: 10,
          }}>
            💬 Quero ser Premium — Falar no WhatsApp
          </button>
        </a>

        <button onClick={onClose} style={{
          background: "none", border: "none", color: C.textMuted,
          fontSize: 12, cursor: "pointer", fontFamily: FN, padding: "8px",
        }}>
          Continuar com conta gratuita
        </button>
      </div>
    </div>
  );
}
