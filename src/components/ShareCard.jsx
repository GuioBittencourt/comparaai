"use client";
import { useRef, useCallback } from "react";
import { C, MN, FN } from "../lib/theme";

/* ═══════════════════════════════════════
   CAPTURA DE IMAGEM (QUALIDADE ALTA)
   ═══════════════════════════════════════ */
async function cardToCanvas(cardRef) {
  try {
    if (!cardRef) return null;

    const html2canvas = (await import("html2canvas")).default;

    const canvas = await html2canvas(cardRef, {
      backgroundColor: "#06090F",
      scale: window.devicePixelRatio * 2,
      useCORS: true,
      logging: false,
      width: 360,
      height: cardRef.offsetHeight,
      foreignObjectRendering: true,
    });

    return await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/png")
    );
  } catch (e) {
    console.log("html2canvas error:", e);
    return null;
  }
}

/* ═══════════════════════════════════════
   SHARE ENGINE
   ═══════════════════════════════════════ */
async function shareImage(blob, text) {
  const urlBase = "https://comparainvest.vercel.app";

  try {
    if (!blob) {
      if (navigator.share) {
        await navigator.share({ text, url: urlBase });
      } else {
        await navigator.clipboard?.writeText(text + "\n\n" + urlBase);
        alert("Link copiado!");
      }
      return;
    }

    const file = new File([blob], "comparainvest.png", {
      type: "image/png",
    });

    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({ text, files: [file], url: urlBase });
    } else if (navigator.share) {
      await navigator.share({ text, url: urlBase });
    } else {
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "comparainvest.png";
      a.click();

      await navigator.clipboard?.writeText(text + "\n\n" + urlBase);

      URL.revokeObjectURL(url);
    }
  } catch (err) {
    console.log("share error:", err);
  }
}

/* ═══════════════════════════════════════
   PHILOSOPHY SHARE CARD
   ═══════════════════════════════════════ */
export function PhilosophyShareCard({
  philosophy,
  score,
  allocation,
  onClose,
}) {
  const cardRef = useRef(null);
  const p = philosophy;

  const handleShare = useCallback(async () => {
    if (!cardRef.current) return;

    const blob = await cardToCanvas(cardRef.current);

    const text = `Descobri como eu penso como investidor.

Meu perfil: ${p.name} (${score}/100)

Faz mais sentido do que eu imaginava.

Veja o seu:

https://comparainvest.vercel.app`;

    await shareImage(blob, text);
  }, [p, score]);

  const allocData = [
    { label: "Renda Fixa", pct: allocation?.rf || 0, color: C.blue },
    { label: "FIIs", pct: allocation?.fii || 0, color: C.accent },
    { label: "Ações", pct: allocation?.acoes || 0, color: C.orange },
    ...(allocation?.cripto > 0
      ? [{ label: "Cripto", pct: allocation.cripto, color: C.purple }]
      : []),
  ];

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div ref={cardRef} style={cardStyle(p.color)}>
          <div style={gradientTop(p.color)} />

          <div style={contentStyle}>
            <div style={labelStyle}>ANÁLISE DE PERFIL</div>

            <div style={{ fontSize: 48 }}>{p.icon}</div>

            <div style={{ ...titleStyle, color: p.color }}>{p.name}</div>

            <div style={descStyle}>{p.desc}</div>

            <div style={scoreStyle(p.color)}>Score {score}/100</div>

            <div style={allocWrap}>
              {allocData
                .filter((a) => a.pct > 0)
                .map((a) => (
                  <div key={a.label} style={allocItem(a.color)}>
                    {a.label} {a.pct}%
                  </div>
                ))}
            </div>

            <div style={ctaSmall}>Descubra seu perfil gratuitamente</div>
            <div style={ctaMain}>comparainvest.vercel.app</div>
          </div>
        </div>

        <div style={btnRow}>
          <button style={btnPrimary} onClick={handleShare}>
            Compartilhar
          </button>
          <button style={btnSecondary} onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   BATTLE SHARE CARD
   ═══════════════════════════════════════ */
export function BattleShareCard({ ranked = [], label, onClose }) {
  const cardRef = useRef(null);

  if (!ranked || ranked.length === 0) return null;

  const winner = ranked[0];
  const medals = ["🥇", "🥈", "🥉"];
  const total =
    ranked.length > 1
      ? (ranked.length * (ranked.length - 1)) / 2
      : 0;

  const handleShare = useCallback(async () => {
    if (!cardRef.current) return;

    const blob = await cardToCanvas(cardRef.current);

    const text = `Comparei alguns ${label}s e o resultado chamou atenção.

${winner.symbol} ficou em primeiro lugar.

Nem sempre o mais popular é o melhor.

Veja por conta própria:

https://comparainvest.vercel.app`;

    await shareImage(blob, text);
  }, [ranked, label, winner]);

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div ref={cardRef} style={cardStyle(C.accent)}>
          <div style={gradientTop(C.accent)} />

          <div style={contentStyle}>
            <div style={labelStyle}>
              MELHOR {label.toUpperCase()} DO SETOR
            </div>

            <div style={winnerStyle}>{winner.symbol}</div>

            <div style={subStyle}>{winner.shortName}</div>

            <div style={winsStyle}>
              {winner.wins} vitórias de {total} duelos
            </div>

            <div style={{ marginTop: 14 }}>
              {ranked.slice(0, 3).map((r, i) => (
                <div key={i}>
                  {medals[i]} {r.symbol}
                </div>
              ))}
            </div>

            <div style={ctaSmall}>Compare ativos gratuitamente</div>
            <div style={ctaMain}>comparainvest.vercel.app</div>
          </div>
        </div>

        <div style={btnRow}>
          <button style={btnPrimary} onClick={handleShare}>
            Compartilhar
          </button>
          <button style={btnSecondary} onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   STYLES
   ═══════════════════════════════════════ */
const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.85)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
  padding: 16,
};

const modalStyle = {
  width: "100%",
  maxWidth: 360,
};

const cardStyle = (color) => ({
  background: "#06090F",
  borderRadius: 20,
  overflow: "hidden",
  border: `1px solid ${color}40`,
});

const gradientTop = (color) => ({
  height: 4,
  background: `linear-gradient(90deg, ${color}, transparent)`,
});

const contentStyle = {
  padding: "28px 24px",
  textAlign: "center",
};

const labelStyle = {
  fontSize: 10,
  letterSpacing: "2px",
  color: C.textMuted,
  fontFamily: MN,
};

const titleStyle = {
  fontSize: 26,
  fontWeight: 800,
  fontFamily: MN,
};

const descStyle = {
  fontSize: 12,
  color: C.textDim,
  marginTop: 8,
};

const scoreStyle = (color) => ({
  marginTop: 12,
  fontWeight: 700,
  color,
});

const allocWrap = {
  marginTop: 14,
  display: "flex",
  justifyContent: "center",
  gap: 6,
  flexWrap: "wrap",
};

const allocItem = (color) => ({
  padding: "6px 10px",
  borderRadius: 8,
  background: `${color}15`,
  fontSize: 10,
});

const winnerStyle = {
  fontSize: 30,
  fontWeight: 800,
  color: C.accent,
  marginTop: 8,
};

const subStyle = {
  fontSize: 12,
  color: C.textDim,
};

const winsStyle = {
  marginTop: 8,
  fontSize: 12,
  color: C.accent,
};

const ctaSmall = {
  marginTop: 16,
  fontSize: 11,
  color: C.textMuted,
};

const ctaMain = {
  fontSize: 12,
  fontWeight: 700,
  color: C.white,
};

const btnRow = {
  display: "flex",
  gap: 8,
  marginTop: 12,
};

const btnPrimary = {
  flex: 1,
  padding: "12px",
  borderRadius: 12,
  fontWeight: 700,
  background: C.accent,
  color: C.bg,
  border: "none",
  cursor: "pointer",
};

const btnSecondary = {
  padding: "12px 20px",
  borderRadius: 12,
  background: C.cardAlt,
  border: `1px solid ${C.border}`,
  cursor: "pointer",
};
