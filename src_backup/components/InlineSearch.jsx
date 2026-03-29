"use client";
import { useState, useEffect, useRef } from "react";
import { C, MN, FN, PAL } from "../lib/theme";
import { fmtBRL } from "../lib/utils";

export default function InlineSearch({ index, onSelect, sectorLock, selected, placeholder, db }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const box = useRef(null);
  const timer = useRef(null);

  useEffect(() => {
    const h = (e) => { if (box.current && !box.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const doSearch = (v) => {
    if (timer.current) clearTimeout(timer.current);
    if (v.length < 1) { setResults([]); setOpen(false); return; }
    timer.current = setTimeout(() => {
      const u = v.toUpperCase();
      const r = Object.values(db).filter((x) => {
        if (sectorLock && x.sector !== sectorLock) return false;
        if (selected.includes(x.symbol)) return false;
        return x.symbol.includes(u) || x.shortName.toUpperCase().includes(u);
      });
      setResults(r.slice(0, 10));
      setOpen(true);
    }, 120);
  };

  return (
    <div ref={box} style={{ position: "relative" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 12, padding: "0 16px" }}>
        <span style={{ fontFamily: MN, fontSize: 13, fontWeight: 700, color: PAL[index % PAL.length], minWidth: 22 }}>{index + 1}.</span>
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); doSearch(e.target.value); }}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder={placeholder}
          style={{ flex: 1, padding: "12px 0", background: "transparent", border: "none", outline: "none", color: C.text, fontSize: 13, fontFamily: FN }}
        />
        {sectorLock && (
          <span style={{ fontSize: 9, color: C.textMuted, fontFamily: MN, whiteSpace: "nowrap", padding: "4px 8px", background: `${C.accent}10`, borderRadius: 6, border: `1px solid ${C.accent}20` }}>
            {sectorLock}
          </span>
        )}
      </div>
      {open && results.length > 0 && (
        <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 50, background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, maxHeight: 220, overflowY: "auto", boxShadow: "0 12px 40px rgba(0,0,0,0.5)" }}>
          {results.map((r) => (
            <button
              key={r.symbol}
              onClick={() => { onSelect(r.symbol); setQ(""); setOpen(false); setResults([]); }}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "10px 16px", background: "transparent", border: "none", borderBottom: `1px solid ${C.border}`, cursor: "pointer", color: C.text, fontFamily: FN, fontSize: 12, textAlign: "left" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = C.cardAlt; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              <div>
                <span style={{ fontFamily: MN, fontWeight: 700, color: C.white, marginRight: 8 }}>{r.symbol}</span>
                <span style={{ color: C.textDim, fontSize: 11 }}>{r.shortName}</span>
              </div>
              <span style={{ fontFamily: MN, fontSize: 11, color: C.textDim }}>{fmtBRL(r.regularMarketPrice)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
