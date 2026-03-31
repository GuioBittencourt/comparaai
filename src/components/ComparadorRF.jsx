"use client";
import { useState, useMemo } from "react";
import { C, MN, FN, PAL } from "../lib/theme";
import { fmtBRL } from "../lib/utils";
import { DB_RF, IND_RF, MACRO_SIGNALS, TYPES_RF, fmtRF } from "../data/rendafixa";
import { rankAll } from "../lib/engine";
import RankingResults from "./RankingResults";
import SponsorSlot from "./SponsorSlot";
import UpgradeModal from "./UpgradeModal";
import { BannerRiqueza } from "./Banners";

const FREE_MAX_ASSETS = 2;
const FREE_MAX_COMP = 2;

export default function ComparadorRF({ user, onSearch }) {
  const [selected, setSelected] = useState([]);
  const [typeLock, setTypeLock] = useState(null);
  const [searchQ, setSearchQ] = useState("");
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [upgradeMsg, setUpgradeMsg] = useState("");

  const isPremium = user?.is_premium || user?.is_admin;

  const getWeeklyCount = () => {
    try {
      const d = JSON.parse(localStorage.getItem("comparai_weekly_rf") || "{}");
      const now = new Date();
      const ws = new Date(now.setDate(now.getDate() - now.getDay())).toISOString().slice(0, 10);
      return d.week === ws ? (d.count || 0) : 0;
    } catch { return 0; }
  };
  const incWeekly = () => {
    try {
      const now = new Date();
      const ws = new Date(now.setDate(now.getDate() - now.getDay())).toISOString().slice(0, 10);
      const d = JSON.parse(localStorage.getItem("comparai_weekly_rf") || "{}");
      localStorage.setItem("comparai_weekly_rf", JSON.stringify({ week: ws, count: d.week === ws ? (d.count || 0) + 1 : 1 }));
    } catch {}
  };

  const addAsset = (sym) => {
    if (selected.includes(sym)) return;
    const a = DB_RF[sym];
    if (!a) return;
    if (!isPremium && selected.length >= FREE_MAX_ASSETS) {
      setUpgradeMsg(`Conta gratuita: máx. ${FREE_MAX_ASSETS} títulos. Faça upgrade!`);
      setShowUpgrade(true); return;
    }
    if (!isPremium && selected.length === 1) {
      if (getWeeklyCount() >= FREE_MAX_COMP) {
        setUpgradeMsg(`Você usou suas ${FREE_MAX_COMP} comparações RF da semana. Upgrade!`);
        setShowUpgrade(true); return;
      }
      incWeekly();
    }
    if (selected.length === 0) { setTypeLock(a.sector); setSelected([sym]); }
    else { setSelected((p) => [...p, sym]); }
    setSearchQ("");
    if (onSearch) onSearch(sym);
  };

  const removeAsset = (sym) => { const n = selected.filter((s) => s !== sym); setSelected(n); if (n.length === 0) setTypeLock(null); };
  const resetAll = () => { setSelected([]); setTypeLock(null); };

  const ranked = useMemo(() => {
    if (selected.length < 2) return [];
    const assets = selected.map((s) => DB_RF[s]).filter(Boolean);
    const scores = {};
    assets.forEach((a) => { scores[a.symbol] = { wins: 0, points: 0 }; });
    for (let i = 0; i < assets.length; i++) {
      for (let j = i + 1; j < assets.length; j++) {
        let sA = 0, sB = 0;
        for (const ind of IND_RF) {
          if (ind.dir === "neutral") continue;
          const vA = assets[i][ind.key], vB = assets[j][ind.key];
          if (vA == null || vB == null || isNaN(vA) || isNaN(vB)) continue;
          const better = ind.dir === "lower" ? (vA < vB ? "A" : vA > vB ? "B" : null) : (vA > vB ? "A" : vA < vB ? "B" : null);
          if (better === "A") sA++; if (better === "B") sB++;
        }
        if (sA > sB) scores[assets[i].symbol].wins++;
        if (sB > sA) scores[assets[j].symbol].wins++;
        scores[assets[i].symbol].points += sA;
        scores[assets[j].symbol].points += sB;
      }
    }
    return Object.entries(scores).sort((a, b) => b[1].wins - a[1].wins || b[1].points - a[1].points).map(([sym, sc]) => ({ ...DB_RF[sym], wins: sc.wins, points: sc.points }));
  }, [selected]);

  const results = useMemo(() => {
    if (searchQ.length < 1) return [];
    const q = searchQ.toUpperCase();
    return Object.values(DB_RF).filter((a) => {
      if (typeLock && a.sector !== typeLock) return false;
      if (selected.includes(a.symbol)) return false;
      return a.symbol.toUpperCase().includes(q) || a.shortName.toUpperCase().includes(q) || a.indexador.toUpperCase().includes(q);
    }).slice(0, 8);
  }, [searchQ, typeLock, selected]);

  const weeklyRem = isPremium ? "∞" : Math.max(0, FREE_MAX_COMP - getWeeklyCount());

  return (
    <div>
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} message={upgradeMsg} />}

      <BannerRiqueza />

      {/* Macro signals */}
      <div style={{ marginBottom: 16 }}>
        {MACRO_SIGNALS.map((m, i) => (
          <div key={i} style={{ display: "flex", gap: 10, padding: "10px 14px", marginBottom: 6, background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, alignItems: "flex-start" }}>
            <span style={{ fontSize: 14 }}>{m.signal === "green" ? "🟢" : m.signal === "yellow" ? "🟡" : "🔴"}</span>
            <div>
              <div style={{ fontFamily: MN, fontSize: 11, fontWeight: 700, color: C.white }}>{m.type}</div>
              <div style={{ fontSize: 11, color: C.textDim, lineHeight: 1.5, marginTop: 2 }}>{m.text}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Free bar */}
      {!isPremium && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", marginBottom: 14, borderRadius: 10, background: `${C.yellow}08`, border: `1px solid ${C.yellow}20` }}>
          <span style={{ fontSize: 11, color: C.yellow }}>⚡ Conta gratuita — {weeklyRem} comparações RF restantes | Máx. {FREE_MAX_ASSETS} títulos</span>
          <button onClick={() => { setUpgradeMsg(""); setShowUpgrade(true); }} style={{ padding: "4px 12px", borderRadius: 6, fontSize: 10, fontWeight: 600, fontFamily: MN, cursor: "pointer", background: `${C.accent}15`, color: C.accent, border: `1px solid ${C.accent}30` }}>⭐ Premium</button>
        </div>
      )}

      {/* Type lock */}
      {typeLock && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, padding: "10px 16px", background: `${C.accent}08`, border: `1px solid ${C.accent}20`, borderRadius: 12 }}>
          <span style={{ fontSize: 14 }}>🔒</span>
          <span style={{ fontSize: 12, color: C.accent, fontFamily: MN, fontWeight: 600 }}>{typeLock}</span>
          <button onClick={resetAll} style={{ marginLeft: "auto", padding: "5px 14px", borderRadius: 8, fontSize: 11, fontWeight: 600, fontFamily: MN, cursor: "pointer", background: `${C.red}15`, color: C.red, border: `1px solid ${C.red}30` }}>Limpar</button>
        </div>
      )}

      {/* Selected */}
      {selected.map((sym, i) => {
        const a = DB_RF[sym];
        return (
          <div key={sym} style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 14px", marginBottom: 4, background: C.card, border: `1px solid ${C.border}`, borderRadius: 12 }}>
            <span style={{ fontFamily: MN, fontSize: 12, fontWeight: 700, color: PAL[i % PAL.length], minWidth: 22 }}>{i + 1}.</span>
            <span style={{ fontFamily: MN, fontWeight: 700, color: C.white, fontSize: 12, flex: 1 }}>{a?.shortName}</span>
            <span style={{ fontSize: 10, color: C.textDim, fontFamily: MN }}>{a?.indexador}</span>
            <button onClick={() => removeAsset(sym)} style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 16 }}>×</button>
          </div>
        );
      })}

      {/* Search */}
      <div style={{ marginTop: 4, marginBottom: 8 }}>
        <input value={searchQ} onChange={(e) => setSearchQ(e.target.value)}
          placeholder={selected.length === 0 ? "Buscar renda fixa... (ex: Selic, IPCA, CDB)" : `Adicionar mais ${typeLock}...`}
          style={{ width: "100%", padding: "10px 14px", background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 12, fontFamily: FN, outline: "none", boxSizing: "border-box" }} />
      </div>

      {results.length > 0 && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, maxHeight: 200, overflowY: "auto", marginBottom: 12 }}>
          {results.map((r) => (
            <button key={r.symbol} onClick={() => addAsset(r.symbol)}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "8px 14px", background: "transparent", border: "none", borderBottom: `1px solid ${C.border}`, cursor: "pointer", color: C.text, fontFamily: FN, fontSize: 11, textAlign: "left" }}
              onMouseEnter={(e) => e.currentTarget.style.background = C.cardAlt} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
              <span><span style={{ fontFamily: MN, fontWeight: 700, color: C.white, marginRight: 6 }}>{r.shortName}</span></span>
              <span style={{ fontSize: 10, color: C.accent, fontFamily: MN }}>{r.rentBruta}% a.a.</span>
            </button>
          ))}
        </div>
      )}

      {/* Asset detail */}
      {selected.length >= 1 && ranked.length === 0 && selected.map((sym, i) => {
        const a = DB_RF[sym];
        if (!a) return null;
        return (
          <div key={sym} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 18, marginBottom: 10, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: PAL[i % PAL.length] }} />
            <div style={{ fontFamily: MN, fontSize: 15, fontWeight: 800, color: C.white, marginBottom: 2 }}>{a.shortName}</div>
            <div style={{ fontSize: 11, color: PAL[i % PAL.length], fontFamily: MN, marginBottom: 8 }}>{a.sector} — {a.indexador}</div>
            <div style={{ padding: "10px 12px", background: C.cardAlt, borderRadius: 8, fontSize: 11, color: C.textDim, lineHeight: 1.6, marginBottom: 10, border: `1px solid ${C.border}` }}>{a.about}</div>
            {a.alerta === "marcacao" && (
              <div style={{ padding: "8px 12px", background: `${C.yellow}10`, border: `1px solid ${C.yellow}25`, borderRadius: 8, fontSize: 10, color: C.yellow, lineHeight: 1.5, marginBottom: 8 }}>
                Marcação a mercado: se vender antes do vencimento, o preço pode variar com a Selic.
              </div>
            )}
            {a.alerta === "travado" && (
              <div style={{ padding: "8px 12px", background: `${C.red}10`, border: `1px solid ${C.red}25`, borderRadius: 8, fontSize: 10, color: C.red, lineHeight: 1.5, marginBottom: 8 }}>
                Liquidez no vencimento: dinheiro travado por {a.prazo} meses.
              </div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 6 }}>
              {IND_RF.map((ind) => (
                <div key={ind.key} style={{ padding: "6px 8px", background: C.cardAlt, borderRadius: 6, border: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 8, color: C.textMuted, fontFamily: MN }}>{ind.label}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.text, fontFamily: MN, marginTop: 1 }}>{fmtRF(a[ind.key], ind.fmt)}</div>
                </div>
              ))}
            </div>
            {a.ri && <a href={a.ri} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", marginTop: 10, fontSize: 10, color: C.accent, fontFamily: MN, textDecoration: "none" }}>Ver no site oficial →</a>}
          </div>
        );
      })}

      {selected.length === 1 && <div style={{ textAlign: "center", padding: 16, color: C.textDim, fontSize: 12 }}>Adicione outro título de <strong style={{ color: C.white }}>{typeLock}</strong> para comparar</div>}

      {/* Empty state */}
      {selected.length === 0 && !searchQ && (
        <div style={{ textAlign: "center", padding: "40px 20px" }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🏦</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: C.white, marginBottom: 6 }}>Comparador de Renda Fixa</div>
          <div style={{ fontSize: 12, color: C.textDim, maxWidth: 420, margin: "0 auto", lineHeight: 1.7, marginBottom: 16 }}>
            Busque um título. O tipo trava e você compara <strong style={{ color: C.accent }}>{IND_RF.length} indicadores</strong> dentro da mesma categoria.
          </div>
          <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
            {Object.keys(TYPES_RF).map((t) => (
              <button key={t} onClick={() => { const first = Object.values(DB_RF).find((a) => a.sector === t); if (first) addAsset(first.symbol); }}
                style={{ padding: "6px 12px", borderRadius: 7, fontSize: 10, fontFamily: MN, cursor: "pointer", background: C.cardAlt, color: C.textDim, border: `1px solid ${C.border}` }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.accentBorder; e.currentTarget.style.color = C.accent; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textDim; }}>
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      <SponsorSlot id="rf-bottom" />

      {/* Ranking — uses custom table since RF has text indicators */}
      {ranked.length >= 2 && (
        <RankingResults ranked={ranked} selected={selected} indicators={IND_RF} label="título RF"
          fmtOverride={fmtRF}
          onAddToCart={(sym) => {
            try {
              const cart = JSON.parse(localStorage.getItem("comparai_cart") || "[]");
              if (!cart.find((c) => c.symbol === sym)) {
                cart.push({ symbol: sym, value: 0, category: "rf", customName: DB_RF[sym]?.shortName });
                localStorage.setItem("comparai_cart", JSON.stringify(cart));
              }
            } catch {}
          }}
        />
      )}
    </div>
  );
}
