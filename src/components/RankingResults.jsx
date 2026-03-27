"use client";
import { useMemo } from "react";
import { XAxis, YAxis, Tooltip as RTooltip, ResponsiveContainer, BarChart, Bar, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend } from "recharts";
import { C, MN, FN, PAL } from "../lib/theme";
import { fmtInd } from "../lib/utils";
import InfoTip from "./InfoTip";

export default function RankingResults({ ranked, selected, indicators, label }) {
  const medals = ["🥇", "🥈", "🥉"];
  const totalD = selected.length * (selected.length - 1) / 2;

  const radarData = useMemo(() => {
    return indicators
      .filter((ind) => ranked.every((r) => r[ind.key] != null && !isNaN(r[ind.key])))
      .map((ind) => {
        const vals = ranked.map((r) => r[ind.key]);
        const mn = Math.min(...vals), mx = Math.max(...vals);
        const entry = { indicator: ind.short };
        ranked.forEach((r) => {
          let n = mx === mn ? 50 : ((r[ind.key] - mn) / (mx - mn)) * 100;
          if (ind.dir === "lower") n = 100 - n;
          entry[r.symbol] = Math.round(n);
        });
        return entry;
      });
  }, [ranked, indicators]);

  return (
    <div style={{ marginTop: 24 }}>
      {/* Winner */}
      <div style={{ background: C.card, border: `1px solid ${C.accentBorder}`, borderRadius: 16, padding: 28, textAlign: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 10, color: C.textMuted, textTransform: "uppercase", letterSpacing: "2px", fontFamily: MN, marginBottom: 10 }}>Melhor {label} do setor</div>
        <div style={{ fontSize: 36, marginBottom: 2 }}>🏆</div>
        <div style={{ fontFamily: MN, fontSize: 26, fontWeight: 800, color: C.accent }}>{ranked[0]?.symbol}</div>
        <div style={{ fontSize: 12, color: C.textDim, marginTop: 2 }}>{ranked[0]?.shortName}</div>
        <div style={{ fontFamily: MN, fontSize: 13, color: C.accent, marginTop: 6 }}>{ranked[0]?.wins} vitórias de {totalD} duelos</div>
      </div>

      {/* Podium */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginBottom: 20 }}>
        {ranked.map((r, i) => (
          <div key={r.symbol} style={{ background: C.card, border: `1px solid ${i === 0 ? C.accentBorder : C.border}`, borderRadius: 14, padding: "12px 18px", textAlign: "center", minWidth: 100, position: "relative", overflow: "hidden" }}>
            {i === 0 && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: C.accent }} />}
            <div style={{ fontSize: 18 }}>{i < 3 ? medals[i] : <span style={{ fontFamily: MN, fontSize: 13, color: C.textMuted }}>{i + 1}º</span>}</div>
            <div style={{ fontFamily: MN, fontSize: 14, fontWeight: 800, color: i === 0 ? C.accent : C.white, marginTop: 2 }}>{r.symbol}</div>
            <div style={{ fontSize: 9, color: C.textDim, marginTop: 1 }}>{r.shortName}</div>
            <div style={{ fontFamily: MN, fontSize: 15, fontWeight: 800, color: i === 0 ? C.accent : PAL[(i + 1) % PAL.length], marginTop: 4 }}>
              {r.wins}V <span style={{ fontSize: 10, fontWeight: 400, color: C.textMuted }}>{r.points}pts</span>
            </div>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20, marginBottom: 16 }}>
        <ResponsiveContainer width="100%" height={Math.max(160, ranked.length * 40)}>
          <BarChart data={ranked} layout="vertical" margin={{ left: 65, right: 20, top: 5, bottom: 5 }}>
            <XAxis type="number" tick={{ fill: C.textMuted, fontSize: 10, fontFamily: MN }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="symbol" tick={{ fill: C.white, fontSize: 11, fontFamily: MN, fontWeight: 700 }} axisLine={false} tickLine={false} width={60} />
            <RTooltip contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, fontFamily: MN, fontSize: 11, color: C.text }} formatter={(v) => [`${v} pts`]} />
            <Bar dataKey="points" radius={[0, 8, 8, 0]}>
              {ranked.map((r, i) => <Cell key={r.symbol} fill={i === 0 ? C.accent : PAL[(i + 1) % PAL.length]} fillOpacity={i === 0 ? 1 : 0.65} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Radar */}
      {radarData.length >= 3 && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20, marginBottom: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: C.textMuted, textTransform: "uppercase", letterSpacing: "1.5px", fontFamily: MN, marginBottom: 12, textAlign: "center" }}>Perfil Comparativo</div>
          <ResponsiveContainer width="100%" height={Math.min(380, Math.max(280, ranked.length * 55))}>
            <RadarChart data={radarData}>
              <PolarGrid stroke={C.border} />
              <PolarAngleAxis dataKey="indicator" tick={{ fill: C.textDim, fontSize: 8, fontFamily: MN }} />
              <PolarRadiusAxis tick={false} domain={[0, 100]} axisLine={false} />
              {ranked.map((r, i) => (
                <Radar key={r.symbol} name={r.symbol} dataKey={r.symbol} stroke={PAL[i % PAL.length]} fill={PAL[i % PAL.length]} fillOpacity={0.06} strokeWidth={2} />
              ))}
              <Legend wrapperStyle={{ fontFamily: MN, fontSize: 10 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Comparison Table */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, overflow: "visible" }}>
        <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border}` }}>
          <span style={{ fontSize: 10, fontWeight: 600, color: C.textMuted, textTransform: "uppercase", letterSpacing: "1.5px", fontFamily: MN }}>
            Tabela Comparativa — {indicators.length} Indicadores
          </span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 500 }}>
            <thead>
              <tr>
                <th style={{ padding: "10px 12px", borderBottom: `1px solid ${C.border}`, textAlign: "left", fontFamily: MN, fontSize: 9, color: C.textMuted, textTransform: "uppercase", minWidth: 150, background: C.card }}>Indicador</th>
                <th style={{ padding: "10px 6px", borderBottom: `1px solid ${C.border}`, textAlign: "center", fontFamily: MN, fontSize: 9, color: C.textMuted }}>Unid.</th>
                <th style={{ padding: "10px 6px", borderBottom: `1px solid ${C.border}`, textAlign: "center", fontFamily: MN, fontSize: 9, color: C.textMuted }}>Crit.</th>
                {ranked.map((r, i) => (
                  <th key={r.symbol} style={{ padding: "10px 12px", borderBottom: `1px solid ${C.border}`, textAlign: "right", fontFamily: MN, fontSize: 11, color: PAL[i % PAL.length], fontWeight: 700 }}>
                    {i === 0 ? "🏆 " : ""}{r.symbol}
                  </th>
                ))}
                <th style={{ padding: "10px 12px", borderBottom: `1px solid ${C.border}`, textAlign: "center", fontFamily: MN, fontSize: 9, color: C.textMuted }}>Melhor</th>
              </tr>
            </thead>
            <tbody>
              {indicators.map((ind) => {
                const vals = ranked.map((r) => ({ sym: r.symbol, val: r[ind.key] })).filter((x) => x.val != null && !isNaN(x.val));
                let bestSym = null;
                if (vals.length >= 2) {
                  bestSym = ind.dir === "lower"
                    ? vals.reduce((a, b) => (a.val < b.val ? a : b)).sym
                    : vals.reduce((a, b) => (a.val > b.val ? a : b)).sym;
                }
                return (
                  <tr key={ind.key}>
                    <td style={{ padding: "9px 12px", borderBottom: `1px solid ${C.border}`, fontSize: 11, color: C.text, background: C.card, position: "relative" }}>
                      <span style={{ display: "flex", alignItems: "center" }}>
                        {ind.label}
                        <InfoTip text={ind.tip} />
                      </span>
                      <span style={{ fontSize: 8, color: C.textMuted }}>{ind.src}</span>
                    </td>
                    <td style={{ padding: "9px 6px", borderBottom: `1px solid ${C.border}`, textAlign: "center", fontSize: 9, color: C.textMuted, fontFamily: MN }}>{ind.unit}</td>
                    <td style={{ padding: "9px 6px", borderBottom: `1px solid ${C.border}`, textAlign: "center", fontSize: 9, color: C.textMuted, fontFamily: MN }}>{ind.dir === "lower" ? "↓" : "↑"}</td>
                    {ranked.map((r) => {
                      const v = r[ind.key];
                      const best = r.symbol === bestSym;
                      return (
                        <td key={r.symbol} style={{ padding: "9px 12px", borderBottom: `1px solid ${C.border}`, textAlign: "right", fontFamily: MN, fontSize: 11, color: best ? C.accent : C.text, fontWeight: best ? 700 : 400, background: best ? `${C.accent}08` : "transparent" }}>
                          {fmtInd(v, ind.fmt)}
                        </td>
                      );
                    })}
                    <td style={{ padding: "9px 12px", borderBottom: `1px solid ${C.border}`, textAlign: "center", fontFamily: MN, fontSize: 10, fontWeight: 700, color: C.accent }}>{bestSym || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
