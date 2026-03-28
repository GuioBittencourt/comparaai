"use client";
import { C, MN, FN, PAL } from "../lib/theme";
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip as RTooltip } from "recharts";
import SponsorSlot from "./SponsorSlot";

export default function PhilosophyResult({ result, onContinue }) {
  const p = result.philosophy;
  const data = [
    { name: "Renda Fixa", value: p.rf, fill: C.blue },
    { name: "FIIs", value: p.fii, fill: C.accent },
    { name: "Ações", value: p.acoes, fill: C.orange },
    ...(p.cripto > 0 ? [{ name: "Cripto", value: p.cripto, fill: C.purple }] : []),
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 520 }}>

        {/* Philosophy Card */}
        <div style={{
          background: C.card, border: `1px solid ${p.color}40`, borderRadius: 20,
          padding: "36px 28px", textAlign: "center", marginBottom: 20,
          position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${p.color}, transparent)` }} />

          <div style={{ fontSize: 56, marginBottom: 8 }}>{p.icon}</div>
          <div style={{ fontFamily: MN, fontSize: 11, color: C.textMuted, textTransform: "uppercase", letterSpacing: "2px", marginBottom: 4 }}>
            Sua filosofia de investidor
          </div>
          <h1 style={{ fontFamily: MN, fontSize: 32, fontWeight: 800, color: p.color, margin: "0 0 8px" }}>
            {p.name}
          </h1>
          <p style={{ fontSize: 14, color: C.textDim, lineHeight: 1.7, maxWidth: 400, margin: "0 auto 16px" }}>
            {p.desc}
          </p>

          {/* Score */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "8px 16px", background: `${p.color}10`, borderRadius: 20,
            border: `1px solid ${p.color}30`,
          }}>
            <span style={{ fontFamily: MN, fontSize: 13, fontWeight: 700, color: p.color }}>
              Score de risco: {result.score}/100
            </span>
          </div>
        </div>

        {/* Allocation Chart */}
        <div style={{
          background: C.card, border: `1px solid ${C.border}`, borderRadius: 20,
          padding: "28px", marginBottom: 20,
        }}>
          <div style={{ fontFamily: MN, fontSize: 12, color: C.textDim, textAlign: "center", marginBottom: 16, textTransform: "uppercase", letterSpacing: "1.5px" }}>
            Balanceamento sugerido
          </div>

          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} innerRadius={50} paddingAngle={3} strokeWidth={0}>
                {data.map((d, i) => <Cell key={i} fill={d.fill} />)}
              </Pie>
              <Legend wrapperStyle={{ fontFamily: MN, fontSize: 11 }} />
              <RTooltip
                contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, fontFamily: MN, fontSize: 12, color: C.text }}
                formatter={(v) => [`${v}%`]}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Allocation details */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 10, marginTop: 16 }}>
            {data.map((d) => (
              <div key={d.name} style={{ padding: "10px", background: `${d.fill}10`, borderRadius: 10, border: `1px solid ${d.fill}25`, textAlign: "center" }}>
                <div style={{ fontFamily: MN, fontSize: 22, fontWeight: 800, color: d.fill }}>{d.value}%</div>
                <div style={{ fontSize: 11, color: C.textDim, marginTop: 2 }}>{d.name}</div>
              </div>
            ))}
          </div>
        </div>

        <SponsorSlot id="quiz-result" />

        {/* CTA */}
        <button
          onClick={onContinue}
          style={{
            width: "100%", padding: "16px", background: C.accent, color: C.bg,
            border: "none", borderRadius: 14, fontSize: 16, fontWeight: 700,
            fontFamily: FN, cursor: "pointer", marginBottom: 12,
          }}
        >
          Montar minha carteira →
        </button>

        {/* Refazer quiz */}
        {onRefazer && (
          <button
            onClick={onRefazer}
            style={{
              width: "100%", padding: "12px", background: "transparent",
              border: `1px solid ${C.border}`, borderRadius: 12, fontSize: 13,
              color: C.textDim, fontFamily: FN, cursor: "pointer", marginBottom: 12,
            }}
          >
            Refazer o quiz de filosofia
          </button>
        )}

        {/* Disclaimer */}
        <p style={{ textAlign: "center", fontSize: 10, color: C.textMuted, lineHeight: 1.6 }}>
          Simulação educativa baseada nas suas respostas. Não constitui recomendação de investimento.
          Consulte um profissional antes de investir.
        </p>
      </div>
    </div>
  );
}
