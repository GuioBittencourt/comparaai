"use client";
import { useState, useMemo } from "react";
import { C, MN, FN, PAL } from "../lib/theme";
import { fmtBRL } from "../lib/utils";
import { rankAll } from "../lib/engine";
import InlineSearch from "./InlineSearch";
import AssetDetail from "./AssetDetail";
import RankingResults from "./RankingResults";
import SponsorSlot from "./SponsorSlot";
import UpgradeModal from "./UpgradeModal";

const FREE_MAX_ASSETS = 2;
const FREE_MAX_COMPARISONS_WEEK = 2;

export default function ComparatorPage({ db, indicators, assetLabel, searchPlaceholder, shortcuts, onSearch, banner, user }) {
  const [selected, setSelected] = useState([]);
  const [sectorLock, setSectorLock] = useState(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [upgradeMsg, setUpgradeMsg] = useState("");

  const isPremium = user?.is_premium || user?.is_admin;

  // Track weekly comparisons in localStorage
  const getWeeklyCount = () => {
    try {
      const data = JSON.parse(localStorage.getItem("comparai_weekly") || "{}");
      const now = new Date();
      const weekStart = new Date(now.setDate(now.getDate() - now.getDay())).toISOString().slice(0, 10);
      if (data.week !== weekStart) return 0;
      return data.count || 0;
    } catch { return 0; }
  };

  const incrementWeeklyCount = () => {
    try {
      const now = new Date();
      const weekStart = new Date(now.setDate(now.getDate() - now.getDay())).toISOString().slice(0, 10);
      const data = JSON.parse(localStorage.getItem("comparai_weekly") || "{}");
      if (data.week !== weekStart) {
        localStorage.setItem("comparai_weekly", JSON.stringify({ week: weekStart, count: 1 }));
      } else {
        localStorage.setItem("comparai_weekly", JSON.stringify({ week: weekStart, count: (data.count || 0) + 1 }));
      }
    } catch {}
  };

  const addAsset = (sym) => {
    if (selected.includes(sym)) return;
    const a = db[sym];
    if (!a) return;

    // Free user: max 2 assets
    if (!isPremium && selected.length >= FREE_MAX_ASSETS) {
      setUpgradeMsg(`Usuários gratuitos podem comparar até ${FREE_MAX_ASSETS} ${assetLabel}s por vez. Faça upgrade para comparações ilimitadas!`);
      setShowUpgrade(true);
      return;
    }

    // Free user: check weekly limit (only on 2nd asset = 1 comparison)
    if (!isPremium && selected.length === 1) {
      const weeklyCount = getWeeklyCount();
      if (weeklyCount >= FREE_MAX_COMPARISONS_WEEK) {
        setUpgradeMsg(`Você já usou suas ${FREE_MAX_COMPARISONS_WEEK} comparações gratuitas desta semana. Faça upgrade para comparações ilimitadas!`);
        setShowUpgrade(true);
        return;
      }
      incrementWeeklyCount();
    }

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

  const weeklyRemaining = isPremium ? "∞" : Math.max(0, FREE_MAX_COMPARISONS_WEEK - getWeeklyCount());

  return (
    <div>
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} message={upgradeMsg} />}

      {/* WhatsApp banner */}
      {banner}

      {/* Free user info bar */}
      {!isPremium && (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px 16px", marginBottom: 16, borderRadius: 10,
          background: `${C.yellow}08`, border: `1px solid ${C.yellow}20`,
        }}>
          <span style={{ fontSize: 11, color: C.yellow }}>
            ⚡ Conta gratuita — {weeklyRemaining} comparações restantes esta semana | Máx. {FREE_MAX_ASSETS} ativos
          </span>
          <button onClick={() => { setUpgradeMsg(""); setShowUpgrade(true); }}
            style={{ padding: "4px 12px", borderRadius: 6, fontSize: 10, fontWeight: 600, fontFamily: MN, cursor: "pointer", background: `${C.accent}15`, color: C.accent, border: `1px solid ${C.accent}30` }}>
            ⭐ Premium
          </button>
        </div>
      )}

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

      {/* Asset detail cards */}
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

      <SponsorSlot id="comparator-bottom" />

      {/* Ranking results */}
      {ranked.length >= 2 && <RankingResults ranked={ranked} selected={selected} indicators={indicators} label={assetLabel}
        onAddToCart={(symbol) => {
          try {
            const cart = JSON.parse(localStorage.getItem("comparai_cart") || "[]");
            if (!cart.find((c) => c.symbol === symbol)) {
              const category = assetLabel === "ação" ? "acoes" : "fii";
              cart.push({ symbol, value: 0, category });
              localStorage.setItem("comparai_cart", JSON.stringify(cart));
            }
          } catch {}
        }}
      />}
    </div>
  );
}
