"use client";
import { C, MN, FN } from "@/lib/theme";
import { fmtBRL, fmtInd } from "@/lib/utils";

export default function AssetDetail({ asset, indicators, color }) {
  if (!asset) return null;

  return (
    <div style={{
      background: C.card, border: `1px solid ${C.border}`, borderRadius: 16,
      padding: 24, marginBottom: 16, position: "relative", overflow: "hidden",
      animation: "fadeUp 0.4s ease forwards",
    }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${color}, transparent)` }} />

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div>
          <div style={{ fontFamily: MN, fontSize: 22, fontWeight: 800, color: C.white }}>{asset.symbol}</div>
          <div style={{ fontSize: 13, color: C.textDim, marginTop: 2 }}>{asset.shortName}</div>
          {asset.sector && <div style={{ fontSize: 11, color: color, fontFamily: MN, marginTop: 4 }}>{asset.sector}</div>}
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: MN, fontSize: 22, fontWeight: 800, color: C.white }}>{fmtBRL(asset.regularMarketPrice)}</div>
        </div>
      </div>

      {/* About */}
      {asset.about && (
        <div style={{
          padding: "12px 14px", background: C.cardAlt, borderRadius: 10,
          fontSize: 12, color: C.textDim, lineHeight: 1.7, marginBottom: 16,
          border: `1px solid ${C.border}`,
        }}>
          📋 {asset.about}
        </div>
      )}

      {/* Key indicators grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 10, marginBottom: 16 }}>
        {indicators.slice(0, 8).map((ind) => {
          const val = asset[ind.key];
          if (val == null || isNaN(val)) return null;
          return (
            <div key={ind.key} style={{ padding: "8px 10px", background: C.cardAlt, borderRadius: 8, border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 9, color: C.textMuted, textTransform: "uppercase", fontFamily: MN, letterSpacing: "0.5px" }}>{ind.label}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text, fontFamily: MN, marginTop: 2 }}>{fmtInd(val, ind.fmt)}</div>
            </div>
          );
        })}
      </div>

      {/* RI Link */}
      {asset.ri && (
        <a
          href={asset.ri}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "10px 14px", background: C.cardAlt, borderRadius: 10,
            border: `1px solid ${C.border}`, textDecoration: "none",
            fontSize: 12, color: C.accent, fontFamily: MN,
            transition: "border-color 0.2s",
          }}
        >
          📄 Ver relatórios e RI da empresa →
        </a>
      )}
    </div>
  );
}
