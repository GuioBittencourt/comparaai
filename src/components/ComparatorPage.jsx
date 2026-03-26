"use client";
import { useState, useMemo } from "react";
import { C, MN, FN, PAL } from "@/lib/theme";
import { fmtBRL } from "@/lib/utils";
import { rankAll } from "@/lib/engine";
import InlineSearch from "./InlineSearch";
import AssetDetail from "./AssetDetail";
import RankingResults from "./RankingResults";
import SponsorSlot from "./SponsorSlot";

export default function ComparatorPage({ db, indicators, assetLabel, searchPlaceholder, shortcuts, onSearch, banner }) {
  const [selected, setSelected] = useState([]);
  const [sectorLock, setSectorLock] = useState(null);

  const addAsset = (sym) => {
    if (selected.includes(sym)) return;
    const a = db[sym];
    if (!a) return;
    if (selected.length === 0) {
      setSectorLock(a.sector);
      setSelected([sym]);
    } else {
      setSelected((p) => [...p, sym]);
    }
    if (onSearch) onSearch(sym);
  };

  const removeAsset = (sym) => {
    const next = selected.filter((s) => s !== sym);
    setSelected(next);
    if (next.length === 0) setSectorLock(null);
  };

  const resetAll = () => { setSelected([]); setSectorLock(null); };

  const ranked = useMemo(() => (selected.length >= 2 ? rankAll(selected, db, indicators) : []), [selected, db, indicators]);

  return (
    <div>
      {/* WhatsApp banner */}
      {banner}

      {/* Sector lock */}
      {sectorLock && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, padding: "10px 16px", background: `${C.accent}08`, border: `1px solid ${C.accent}20`, borderRadius: 12, flexWrap: "wrap" }}>
          <span style={{ fontSize: 14 }}>🔒</span>
          <span style={{ fontSize: 12, color: C.accent, fontFamily: MN, fontWeight: 600 }}>{sectorLock}</span>
          <span style={{ fontSize: 11, color: C.textDim }}>— apenas {assetLabel}s deste segmento</span>
          <button onClick={resetAll} style={{ marginLeft: "auto", padding: "5px 14px", borderRadius: 8, fontSize: 11, fontWeight: 600, fontFamily: MN, cursor: "pointer", background: `${C.red}15`, color: C.red, border: `1px solid ${C.red}30` }}>Limpar</button>
        </div>
      )}

      {/* Selected items list + search */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 8 }}>
        {selected.map((sym, i) => (
          <div key={sym} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 14px", background: C.card, border: `1px solid ${C.border}`, borderRadius: 12 }}>
            <span style={{ fontFamily: MN, fontSize: 12, fontWeight: 700, color: PAL[i % PAL.length], minWidth: 22 }}>{i + 1}.</span>
            <span style={{ fontFamily: MN, fontWeight: 700, color: C.white, fontSize: 13 }}>{sym}</span>
            <span style={{ color: C.textDim, fontSize: 11, flex: 1 }}>{db[sym]?.shortName}</span>
            <span style={{ fontFamily: MN, fontSize: 11, color: C.textDim }}>{fmtBRL(db[sym]?.regularMarketPrice)}</span>
            <button
              onClick={() => removeAsset(sym)}
              style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 16, lineHeight: 1, padding: "0 2px" }}
              onMouseEnter={(e) => { e.target.style.color = C.red; }}
              onMouseLeave={(e) => { e.target.style.color = C.textMuted; }}
            >×</button>
          </div>
        ))}
        <InlineSearch
          index={selected.length}
          onSelect={addAsset}
          sectorLock={sectorLock}
          selected={selected}
          db={db}
          placeholder={selected.length === 0 ? searchPlaceholder : sectorLock ? `Adicionar ${selected.length + 1}º ${assetLabel} de ${sectorLock}...` : `Buscar...`}
        />
      </div>

      {/* Asset detail cards - show immediately when selected (BEFORE comparison) */}
      {selected.length >= 1 && ranked.length === 0 && (
        <div style={{ marginTop: 16 }}>
          {selected.map((sym, i) => (
            <AssetDetail key={sym} asset={db[sym]} indicators={indicators} color={PAL[i % PAL.length]} />
          ))}
        </div>
      )}

      {/* Prompt to add more */}
      {selected.length === 1 && (
        <div style={{ textAlign: "center", padding: 20, color: C.textDim, fontSize: 13 }}>
          Adicione o 2º {assetLabel} de <strong style={{ color: C.white }}>{sectorLock}</strong> para comparar
        </div>
      )}

      {/* Empty state */}
      {selected.length === 0 && (
        <div style={{ textAlign: "center", padding: "50px 20px" }}>
          <div style={{ fontSize: 42, marginBottom: 10 }}>⚔️</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: C.white, marginBottom: 8 }}>Comparador de {assetLabel}s</div>
          <div style={{ fontSize: 13, color: C.textDim, maxWidth: 500, margin: "0 auto", lineHeight: 1.7 }}>
            Busque o primeiro {assetLabel}. O segmento trava e você adiciona quantos quiser.
            O sistema compara <strong style={{ color: C.accent }}>{indicators.length} indicadores</strong> e ranqueia do melhor ao pior.
          </div>
          {shortcuts && (
            <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap", marginTop: 20 }}>
              {shortcuts.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    const first = Object.values(db).find((a) => a.sector === s);
                    if (first) addAsset(first.symbol);
                  }}
                  style={{ padding: "6px 14px", borderRadius: 8, fontSize: 11, fontFamily: MN, cursor: "pointer", background: C.cardAlt, color: C.textDim, border: `1px solid ${C.border}`, transition: "all 0.2s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.accentBorder; e.currentTarget.style.color = C.accent; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textDim; }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sponsor slot after comparator */}
      <SponsorSlot id="comparator-bottom" />

      {/* Ranking results */}
      {ranked.length >= 2 && <RankingResults ranked={ranked} selected={selected} indicators={indicators} label={assetLabel} />}
    </div>
  );
}
