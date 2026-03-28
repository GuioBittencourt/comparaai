export const C = {
  bg: "#06090F", card: "#0D1117", cardAlt: "#131922",
  border: "#1B2433", borderLight: "#253044",
  accent: "#00E5A0", accentDim: "rgba(0,229,160,0.08)", accentBorder: "rgba(0,229,160,0.25)",
  blue: "#38BDF8", purple: "#A78BFA", pink: "#F472B6",
  orange: "#FB923C", yellow: "#FBBF24", green: "#34D399", red: "#F87171",
  text: "#E2E8F0", textDim: "#64748B", textMuted: "#3E4C5E", white: "#F8FAFC",
};

export const PAL = [C.accent, C.blue, C.purple, C.pink, C.orange, C.yellow, "#818CF8", "#FB7185", "#2DD4BF", "#E879F9"];
export const FN = "'Outfit',sans-serif";
export const MN = "'JetBrains Mono',monospace";

export const WA_FINANCEIRO = "https://wa.me/5512988890312?text=Ol%C3%A1%20vim%20pelo%20compara.ai.%20Quero%20meu%20Diagn%C3%B3stico%20Financeiro";
export const WA_RIQUEZA = "https://wa.me/5512988890312?text=Ol%C3%A1%20vim%20pelo%20compara.ai.%20Quero%20meu%20Diagn%C3%B3stico%20da%20Riqueza!%20";

export const inputStyle = {
  width: "100%", padding: "12px 16px", background: C.cardAlt,
  border: `1px solid ${C.border}`, borderRadius: 10, color: C.text,
  fontSize: 14, fontFamily: FN, outline: "none", boxSizing: "border-box",
};
export const labelStyle = { fontSize: 12, color: C.textDim, marginBottom: 4, display: "block", fontFamily: MN };
export const btnPrimary = {
  width: "100%", padding: "14px", background: C.accent, color: C.bg,
  border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700,
  fontFamily: FN, cursor: "pointer",
};
export const btnSecondary = {
  width: "100%", padding: "12px", background: "transparent",
  border: `1px solid ${C.border}`, borderRadius: 12, fontSize: 13,
  color: C.textDim, fontFamily: FN, cursor: "pointer",
};
