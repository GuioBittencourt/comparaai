"use client";
import { useRef, useCallback } from "react";
import { C, MN, FN } from "../lib/theme";

function cardToCanvas(cardRef) {
  return new Promise(async (resolve) => {
    try {
      const mod = await import("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.esm.js");
      const html2canvas = mod.default;
      const canvas = await html2canvas(cardRef, { backgroundColor: "#06090F", scale: 2, useCORS: true });
      canvas.toBlob((blob) => resolve(blob), "image/png");
    } catch (e) {
      console.log("html2canvas failed, using fallback:", e);
      resolve(null);
    }
  });
}

async function shareImage(blob, text) {
  if (!blob) {
    // Fallback: share text only
    if (navigator.share) {
      await navigator.share({ text, url: "https://comparainvest.vercel.app" });
    } else {
      await navigator.clipboard?.writeText(text + "\n\nhttps://comparainvest.vercel.app");
      alert("Link copiado!");
    }
    return;
  }

  const file = new File([blob], "compara-ai.png", { type: "image/png" });

  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    await navigator.share({ text, files: [file], url: "https://comparainvest.vercel.app" });
  } else if (navigator.share) {
    await navigator.share({ text, url: "https://comparainvest.vercel.app" });
  } else {
    // Desktop fallback: download image
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "compara-ai.png";
    a.click();
    URL.revokeObjectURL(url);
  }
}

// ═══════════════════════════════════════════════
// PHILOSOPHY SHARE CARD
// ═══════════════════════════════════════════════
export function PhilosophyShareCard({ philosophy, score, allocation, onClose }) {
  const cardRef = useRef(null);
  const p = philosophy;

  const handleShare = useCallback(async () => {
    const blob = await cardToCanvas(cardRef.current);
    const text = `Minha filosofia de investidor é ${p.name}! Score: ${score}/100\n\nDescubra a sua no comparainvest`;
    await shareImage(blob, text);
  }, [p, score]);

  const allocData = [
    { label: "Renda Fixa", pct: allocation?.rf || 0, color: C.blue },
    { label: "FIIs", pct: allocation?.fii || 0, color: C.accent },
    { label: "Ações", pct: allocation?.acoes || 0, color: C.orange },
    ...(allocation?.cripto > 0 ? [{ label: "Cripto", pct: allocation.cripto, color: C.purple }] : []),
  ];

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 360 }}>
        {/* The card that gets captured */}
        <div ref={cardRef} style={{ background: "#06090F", borderRadius: 20, overflow: "hidden", border: `1px solid ${p.color}40` }}>
          {/* Header gradient */}
          <div style={{ height: 4, background: `linear-gradient(90deg, ${p.color}, transparent)` }} />
          <div style={{ padding: "28px 24px", textAlign: "center" }}>
            <div style={{ fontSize: 10, color: C.textMuted, fontFamily: MN, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 12 }}>MINHA FILOSOFIA DE INVESTIDOR</div>
            <div style={{ fontSize: 48, marginBottom: 4 }}>{p.icon}</div>
            <div style={{ fontFamily: MN, fontSize: 28, fontWeight: 800, color: p.color }}>{p.name}</div>
            <div style={{ fontSize: 12, color: C.textDim, marginTop: 6, lineHeight: 1.6, maxWidth: 280, margin: "6px auto 16px" }}>{p.desc}</div>
            {/* Score bar */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", background: `${p.color}10`, borderRadius: 20, border: `1px solid ${p.color}25`, marginBottom: 16 }}>
              <span style={{ fontFamily: MN, fontSize: 12, fontWeight: 700, color: p.color }}>Score: {score}/100</span>
            </div>
            {/* Allocation bars */}
            <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 16 }}>
              {allocData.filter((a) => a.pct > 0).map((a) => (
                <div key={a.label} style={{ padding: "8px 12px", background: `${a.color}10`, borderRadius: 8, border: `1px solid ${a.color}20`, textAlign: "center", minWidth: 60 }}>
                  <div style={{ fontFamily: MN, fontSize: 16, fontWeight: 800, color: a.color }}>{a.pct}%</div>
                  <div style={{ fontSize: 8, color: C.textMuted, marginTop: 2 }}>{a.label}</div>
                </div>
              ))}
            </div>
            {/* Branding */}
            <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
              <span style={{ fontFamily: MN, fontSize: 14, fontWeight: 800, color: C.white }}>compara<span style={{ color: C.accent }}>invest</span></span>
              <div style={{ fontSize: 9, color: C.textMuted, marginTop: 2 }}>Descubra sua filosofia em comparainvest.vercel.app</div>
            </div>
          </div>
        </div>

        {/* Share buttons */}
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <button onClick={handleShare} style={{ flex: 1, padding: "12px", borderRadius: 12, fontSize: 13, fontWeight: 700, fontFamily: FN, cursor: "pointer", background: C.accent, color: C.bg, border: "none" }}>
            Compartilhar
          </button>
          <button onClick={onClose} style={{ padding: "12px 20px", borderRadius: 12, fontSize: 12, fontFamily: FN, cursor: "pointer", background: C.cardAlt, color: C.textDim, border: `1px solid ${C.border}` }}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// BATTLE SHARE CARD
// ═══════════════════════════════════════════════
export function BattleShareCard({ ranked, label, onClose }) {
  const cardRef = useRef(null);
  const medals = ["🥇", "🥈", "🥉"];
  const winner = ranked[0];
  const total = ranked.length * (ranked.length - 1) / 2;

  const handleShare = useCallback(async () => {
    const blob = await cardToCanvas(cardRef.current);
    const podium = ranked.slice(0, 3).map((r, i) => `${medals[i]} ${r.symbol}`).join(" ");
    const text = `Batalha de ${label}s no comparainvest!\n${podium}\n${winner.symbol} venceu ${winner.wins} de ${total} duelos!\n\nCompare você também:`;
    await shareImage(blob, text);
  }, [ranked, label, winner, total]);

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 360 }}>
        <div ref={cardRef} style={{ background: "#06090F", borderRadius: 20, overflow: "hidden", border: `1px solid ${C.accentBorder}` }}>
          <div style={{ height: 4, background: `linear-gradient(90deg, ${C.accent}, ${C.blue}, ${C.purple})` }} />
          <div style={{ padding: "24px 20px", textAlign: "center" }}>
            <div style={{ fontSize: 10, color: C.textMuted, fontFamily: MN, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 10 }}>BATALHA DE {label.toUpperCase()}S</div>
            {/* Podium */}
            <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 8, marginBottom: 16, height: 120 }}>
              {ranked.length >= 2 && (
                <div style={{ textAlign: "center", width: 80 }}>
                  <div style={{ fontSize: 24 }}>{medals[1]}</div>
                  <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "10px 10px 0 0", padding: "12px 8px", height: 60, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <div style={{ fontFamily: MN, fontSize: 12, fontWeight: 800, color: C.white }}>{ranked[1].symbol}</div>
                    <div style={{ fontFamily: MN, fontSize: 10, color: C.textDim }}>{ranked[1].wins}V</div>
                  </div>
                </div>
              )}
              <div style={{ textAlign: "center", width: 90 }}>
                <div style={{ fontSize: 28 }}>{medals[0]}</div>
                <div style={{ background: C.card, border: `1px solid ${C.accentBorder}`, borderRadius: "10px 10px 0 0", padding: "12px 8px", height: 80, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <div style={{ fontFamily: MN, fontSize: 14, fontWeight: 800, color: C.accent }}>{ranked[0].symbol}</div>
                  <div style={{ fontFamily: MN, fontSize: 11, color: C.accent }}>{ranked[0].wins}V</div>
                  <div style={{ fontSize: 8, color: C.textDim }}>{ranked[0].shortName}</div>
                </div>
              </div>
              {ranked.length >= 3 && (
                <div style={{ textAlign: "center", width: 80 }}>
                  <div style={{ fontSize: 22 }}>{medals[2]}</div>
                  <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "10px 10px 0 0", padding: "12px 8px", height: 45, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <div style={{ fontFamily: MN, fontSize: 12, fontWeight: 800, color: C.white }}>{ranked[2].symbol}</div>
                    <div style={{ fontFamily: MN, fontSize: 10, color: C.textDim }}>{ranked[2].wins}V</div>
                  </div>
                </div>
              )}
            </div>
            {/* Stats */}
            <div style={{ padding: "10px 14px", background: C.card, borderRadius: 10, border: `1px solid ${C.border}`, marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: C.textDim }}>{ranked.length} ativos comparados em {ranked[0]?.points !== undefined ? Object.keys(ranked[0]).filter((k) => !["symbol", "shortName", "wins", "points", "rank", "sector", "about", "ri", "regularMarketPrice"].includes(k)).length : "?"} indicadores</div>
              <div style={{ fontFamily: MN, fontSize: 13, fontWeight: 700, color: C.accent, marginTop: 4 }}>{winner.symbol} venceu {winner.wins} de {total} duelos</div>
            </div>
            {/* Branding */}
            <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 10 }}>
              <span style={{ fontFamily: MN, fontSize: 14, fontWeight: 800, color: C.white }}>compara<span style={{ color: C.accent }}>invest</span></span>
              <div style={{ fontSize: 9, color: C.textMuted, marginTop: 2 }}>Compare ativos em comparainvest.vercel.app</div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <button onClick={handleShare} style={{ flex: 1, padding: "12px", borderRadius: 12, fontSize: 13, fontWeight: 700, fontFamily: FN, cursor: "pointer", background: C.accent, color: C.bg, border: "none" }}>
            Compartilhar
          </button>
          <button onClick={onClose} style={{ padding: "12px 20px", borderRadius: 12, fontSize: 12, fontFamily: FN, cursor: "pointer", background: C.cardAlt, color: C.textDim, border: `1px solid ${C.border}` }}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
