"use client";
import { useRef, useCallback } from "react";
import { C, MN } from "../lib/theme";

/* ═══════════════════════════════════════
   CAPTURA (ANTI-IMAGEM PRETA)
   ═══════════════════════════════════════ */
function wait(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

async function cardToCanvas(cardRef) {
  try {
    if (!cardRef) return null;

    const html2canvas = (await import("html2canvas")).default;

    await wait(150);

    const canvas = await html2canvas(cardRef, {
      backgroundColor: "#06090F",
      scale: 2.5,
      useCORS: true,
    });

    return new Promise((resolve) =>
      canvas.toBlob((blob) => resolve(blob), "image/png")
    );
  } catch (e) {
    console.log(e);
    return null;
  }
}

/* ═══════════════════════════════════════
   SHARE
   ═══════════════════════════════════════ */
async function shareImage(blob, text) {
  if (!blob) {
    await navigator.share?.({ text });
    return;
  }

  const file = new File([blob], "comparainvest.png", {
    type: "image/png",
  });

  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ text, files: [file] });
  } else {
    await navigator.share?.({ text });
  }
}

/* ═══════════════════════════════════════
   FILOSOFIA (mantido)
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
    <Wrapper onClose={onClose}>
      <div ref={cardRef} style={card}>
        <div style={title}>MINHA FILOSOFIA</div>
        <div style={{ fontSize: 42 }}>{p.icon}</div>
        <div style={{ ...big, color: p.color }}>{p.name}</div>
        <div style={desc}>{p.desc}</div>
        <div style={{ marginTop: 10, color: p.color }}>
          Score: {score}/100
        </div>
      </div>

      <Buttons onShare={handleShare} onClose={onClose} />
    </Wrapper>
  );
}

/* ═══════════════════════════════════════
   🔥 BATALHA (VOLTA DO PODIUM BONITO)
   ═══════════════════════════════════════ */
export function BattleShareCard({ ranked, onClose }) {
  const cardRef = useRef(null);

  const medals = ["🥇", "🥈", "🥉"];
  const top3 = ranked.slice(0, 3);
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
    <Wrapper onClose={onClose}>
      <div ref={cardRef} style={card}>
        <div style={title}>BATALHA DE ATIVOS</div>

        {/* 🏆 PODIUM */}
        <div style={{ marginTop: 10 }}>
          {top3.map((r, i) => (
            <div
              key={r.symbol}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 6,
                fontFamily: MN,
              }}
            >
              <span style={{ fontSize: 16 }}>
                {medals[i]} {r.symbol}
              </span>

              <span style={{ color: C.textDim }}>
                {r.wins}V
              </span>
            </div>
          ))}
        </div>

        {/* 🧠 FRASE */}
        <div style={{ marginTop: 12, fontSize: 12, color: C.textDim }}>
          Nem sempre o mais popular é o melhor
        </div>

        {/* 🏆 VENCEDOR */}
        <div style={{ marginTop: 10, fontSize: 13 }}>
          <strong>{winner.symbol}</strong> em 1º lugar
        </div>
      </div>

      <Buttons onShare={handleShare} onClose={onClose} />
    </Wrapper>
  );
}

/* ═══════════════════════════════════════
   COMPONENTES AUXILIARES
   ═══════════════════════════════════════ */

function Wrapper({ children, onClose }) {
  return (
    <div style={overlay} onClick={onClose}>
      <div style={box} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

function Buttons({ onShare, onClose }) {
  return (
    <div style={buttons}>
      <button style={btnPrimary} onClick={onShare}>
        Compartilhar
      </button>
      <button style={btn} onClick={onClose}>
        Fechar
      </button>
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

const title = {
  fontSize: 11,
  color: C.textMuted,
  fontFamily: MN,
  letterSpacing: "1px",
};

const big = {
  fontSize: 24,
  fontWeight: 800,
};

const desc = {
  fontSize: 12,
  color: C.textDim,
  marginTop: 6,
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
