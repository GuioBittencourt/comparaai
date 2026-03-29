"use client";
import { useRef, useCallback } from "react";
import { C, MN } from "../lib/theme";

/* ═══════════════════════════════════════
   CAPTURA ESTÁVEL (SEM IMAGEM PRETA)
   ═══════════════════════════════════════ */
function wait(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

async function cardToCanvas(cardRef) {
  try {
    if (!cardRef) return null;

    const html2canvas = (await import("html2canvas")).default;

    // 🔥 espera renderizar tudo (resolve imagem preta)
    await wait(150);

    const canvas = await html2canvas(cardRef, {
      backgroundColor: "#06090F",
      scale: 2.5,
      useCORS: true,
      logging: false,
    });

    return new Promise((resolve) =>
      canvas.toBlob((blob) => resolve(blob), "image/png")
    );
  } catch (e) {
    console.log("erro ao gerar imagem:", e);
    return null;
  }
}

/* ═══════════════════════════════════════
   SHARE PADRÃO
   ═══════════════════════════════════════ */
async function shareImage(blob, text) {
  const url = "https://comparainvest.vercel.app";

  if (!blob) {
    if (navigator.share) {
      await navigator.share({ text });
    } else {
      await navigator.clipboard?.writeText(text);
      alert("Texto copiado!");
    }
    return;
  }

  const file = new File([blob], "comparainvest.png", {
    type: "image/png",
  });

  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    await navigator.share({
      text,
      files: [file],
    });
  } else if (navigator.share) {
    await navigator.share({ text });
  } else {
    const blobUrl = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = "comparainvest.png";
    a.click();

    URL.revokeObjectURL(blobUrl);
  }
}

/* ═══════════════════════════════════════
   SHARE - FILOSOFIA
   ═══════════════════════════════════════ */
export function PhilosophyShareCard({ philosophy, score, onClose }) {
  const cardRef = useRef(null);
  const p = philosophy;

  const handleShare = useCallback(async () => {
    const blob = await cardToCanvas(cardRef.current);

    const text = `Minha Filosofia

Descobri como eu penso como investidor.

Meu perfil: *${p.name}* (${score}/100)
Faz mais sentido do que eu imaginava.

Veja o seu:

https://comparainvest.vercel.app`;

    await shareImage(blob, text);
  }, [p, score]);

  return (
    <div style={overlay} onClick={onClose}>
      <div style={box} onClick={(e) => e.stopPropagation()}>
        <div ref={cardRef} style={card}>
          <div style={{ fontSize: 12, color: C.textMuted }}>
            MINHA FILOSOFIA
          </div>

          <div style={{ fontSize: 40 }}>{p.icon}</div>

          <div style={{ fontSize: 24, fontWeight: 800, color: p.color }}>
            {p.name}
          </div>

          <div style={{ fontSize: 12, color: C.textDim, marginTop: 6 }}>
            {p.desc}
          </div>

          <div style={{ marginTop: 10, color: p.color }}>
            Score: {score}/100
          </div>
        </div>

        <div style={buttons}>
          <button style={btnPrimary} onClick={handleShare}>
            Compartilhar
          </button>
          <button style={btn} onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   SHARE - BATALHA
   ═══════════════════════════════════════ */
export function BattleShareCard({ ranked, onClose }) {
  const cardRef = useRef(null);
  const winner = ranked[0];

  const handleShare = useCallback(async () => {
    const blob = await cardToCanvas(cardRef.current);

    const text = `Batalha de Ativos

Comparei alguns ações no *COMPARAINVEST* e o resultado chamou atenção:

${winner.symbol} ficou em primeiro lugar.
Nem sempre o mais popular é o melhor.

Veja por conta própria:

https://comparainvest.vercel.app`;

    await shareImage(blob, text);
  }, [ranked, winner]);

  return (
    <div style={overlay} onClick={onClose}>
      <div style={box} onClick={(e) => e.stopPropagation()}>
        <div ref={cardRef} style={card}>
          <div style={{ fontSize: 12, color: C.textMuted }}>
            MELHOR ATIVO
          </div>

          <div style={{ fontSize: 28, fontWeight: 800, color: C.accent }}>
            {winner.symbol}
          </div>

          <div style={{ fontSize: 12, color: C.textDim }}>
            {winner.shortName}
          </div>

          <div style={{ marginTop: 10, color: C.accent }}>
            {winner.wins} vitórias
          </div>
        </div>

        <div style={buttons}>
          <button style={btnPrimary} onClick={handleShare}>
            Compartilhar
          </button>
          <button style={btn} onClick={onClose}>
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
const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.85)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const box = {
  width: "100%",
  maxWidth: 340,
};

const card = {
  background: "#06090F",
  padding: 20,
  borderRadius: 16,
  textAlign: "center",
};

const buttons = {
  display: "flex",
  gap: 8,
  marginTop: 10,
};

const btnPrimary = {
  flex: 1,
  padding: 12,
  borderRadius: 10,
  background: C.accent,
  color: C.bg,
  border: "none",
  cursor: "pointer",
};

const btn = {
  padding: 12,
  borderRadius: 10,
  background: C.cardAlt,
  border: `1px solid ${C.border}`,
  cursor: "pointer",
};
