"use client";
import { useState, useMemo } from "react";
import { C, MN, FN, PAL } from "../lib/theme";
import { DB_RF, IND_RF, MACRO_SIGNALS, fmtRF } from "../data/rendafixa";
import RankingResults from "./RankingResults";
import SponsorSlot from "./SponsorSlot";
import UpgradeModal from "./UpgradeModal";
import { BannerRiqueza } from "./Banners";

const FREE_MAX_ASSETS = 2;
const FREE_MAX_BATTLES_15D = 3;
const BATTLE_STORAGE_KEY = "comparai_battles_15d";
const WINDOW_MS = 15 * 24 * 60 * 60 * 1000;
const STRIPE_PREMIUM_URL = "https://buy.stripe.com/cNicN52o39nt9YQ5Xx0Fi00";

function getBattleCount15d() {
  try {
    const raw = JSON.parse(localStorage.getItem(BATTLE_STORAGE_KEY) || "[]");
    const now = Date.now();
    const valid = raw.filter((ts) => now - ts < WINDOW_MS);
    localStorage.setItem(BATTLE_STORAGE_KEY, JSON.stringify(valid));
    return valid.length;
  } catch {
    return 0;
  }
}

function incrementBattleCount15d() {
  try {
    const raw = JSON.parse(localStorage.getItem(BATTLE_STORAGE_KEY) || "[]");
    const now = Date.now();
    const valid = raw.filter((ts) => now - ts < WINDOW_MS);
    valid.push(now);
    localStorage.setItem(BATTLE_STORAGE_KEY, JSON.stringify(valid));
  } catch {}
}

export default function ComparadorRF({ user, onSearch }) {
  const [selected, setSelected] = useState([]);
  const [typeLock, setTypeLock] = useState(null);
  const [searchQ, setSearchQ] = useState("");
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [upgradeMsg, setUpgradeMsg] = useState("");

  const isPremium = user?.is_premium || user?.is_admin;

  const addAsset = (sym) => {
    if (selected.includes(sym)) return;
    const a = DB_RF[sym];
    if (!a) return;

    if (!isPremium && selected.length >= FREE_MAX_ASSETS) {
      setUpgradeMsg(
        `Usuários gratuitos podem comparar até ${FREE_MAX_ASSETS} títulos por batalha. Desbloqueie o Premium para comparar mais ativos.`
      );
      setShowUpgrade(true);
      return;
    }

    if (!isPremium && selected.length === 1) {
      const battleCount = getBattleCount15d();
      if (battleCount >= FREE_MAX_BATTLES_15D) {
        setUpgradeMsg(
          `Sua conta gratuita permite até ${FREE_MAX_BATTLES_15D} batalhas a cada 15 dias. Desbloqueie o Premium para comparar sem limites.`
        );
        setShowUpgrade(true);
        return;
      }
      incrementBattleCount15d();
    }

    if (selected.length === 0) {
      setTypeLock(a.sector);
      setSelected([sym]);
    } else {
      setSelected((p) => [...p, sym]);
    }

    setSearchQ("");
    if (onSearch) onSearch(sym);
  };

  const removeAsset = (sym) => {
    const next = selected.filter((s) => s !== sym);
    setSelected(next);
    if (next.length === 0) setTypeLock(null);
  };

  const resetAll = () => {
    setSelected([]);
    setTypeLock(null);
  };

  const ranked = useMemo(() => {
    if (selected.length < 2) return [];

    const assets = selected.map((s) => DB_RF[s]).filter(Boolean);
    const scores = {};
    assets.forEach((a) => {
      scores[a.symbol] = { wins: 0, points: 0 };
    });

    for (let i = 0; i < assets.length; i++) {
      for (let j = i + 1; j < assets.length; j++) {
        let sA = 0;
        let sB = 0;

        for (const ind of IND_RF) {
          if (ind.dir === "neutral") continue;
          const vA = assets[i][ind.key];
          const vB = assets[j][ind.key];
          if (vA == null || vB == null || isNaN(vA) || isNaN(vB)) continue;

          const better =
            ind.dir === "lower"
              ? vA < vB
                ? "A"
                : vA > vB
                  ? "B"
                  : null
              : vA > vB
                ? "A"
                : vA < vB
                  ? "B"
                  : null;

          if (better === "A") sA++;
          if (better === "B") sB++;
        }

        if (sA > sB) scores[assets[i].symbol].wins++;
        if (sB > sA) scores[assets[j].symbol].wins++;
        scores[assets[i].symbol].points += sA;
        scores[assets[j].symbol].points += sB;
      }
    }

    return Object.entries(scores)
      .sort((a, b) => b[1].wins - a[1].wins || b[1].points - a[1].points)
      .map(([sym, sc]) => ({ ...DB_RF[sym], wins: sc.wins, points: sc.points }));
  }, [selected]);

  const results = useMemo(() => {
    if (searchQ.length < 1) return [];
    const q = searchQ.toUpperCase();
    return Object.values(DB_RF)
      .filter((a) => {
        if (typeLock && a.sector !== typeLock) return false;
        if (selected.includes(a.symbol)) return false;
        return (
          a.symbol.toUpperCase().includes(q) ||
          a.shortName.toUpperCase().includes(q) ||
          a.indexador.toUpperCase().includes(q)
        );
      })
      .slice(0, 8);
  }, [searchQ, typeLock, selected]);

  const battlesRemaining = isPremium
    ? "∞"
    : Math.max(0, FREE_MAX_BATTLES_15D - getBattleCount15d());

  return (
    <div>
      {showUpgrade && (
        <UpgradeModal onClose={() => setShowUpgrade(false)} message={upgradeMsg} />
      )}

      <BannerRiqueza />

      <div style={{ marginBottom: 16 }}>
        {MACRO_SIGNALS.map((m, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              gap: 10,
              padding: "10px 14px",
              marginBottom: 6,
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: 10,
              alignItems: "flex-start",
            }}
          >
            <span style={{ fontSize: 14 }}>
              {m.signal === "green" ? "🟢" : m.signal === "yellow" ? "🟡" : "🔴"}
            </span>
            <div>
              <div style={{ fontFamily: MN, fontSize: 11, fontWeight: 700, color: C.white }}>
                {m.type}
              </div>
              <div style={{ fontSize: 11, color: C.textDim, lineHeight: 1.5, marginTop: 2 }}>
                {m.text}
              </div>
            </div>
          </div>
        ))}
      </div>

      {!isPremium && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 16px",
            marginBottom: 14,
            borderRadius: 10,
            background: `${C.yellow}08`,
            border: `1px solid ${C.yellow}20`,
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontSize: 11, color: C.yellow }}>
            ⚡ Conta gratuita — {battlesRemaining} batalhas restantes em 15 dias | Máx. {FREE_MAX_ASSETS} títulos por batalha
          </span>

          <a
            href={STRIPE_PREMIUM_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "none" }}
          >
            <button
              style={{
                padding: "4px 12px",
                borderRadius: 6,
                fontSize: 10,
                fontWeight: 600,
                fontFamily: MN,
                cursor: "pointer",
                background: `${C.accent}15`,
                color: C.accent,
                border: `1px solid ${C.accent}30`,
              }}
            >
              Quero me tornar Premium
            </button>
          </a>
        </div>
      )}

      {typeLock && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 14,
            padding: "10px 16px",
            background: `${C.accent}08`,
            border: `1px solid ${C.accent}20`,
            borderRadius: 12,
          }}
        >
          <span style={{ fontSize: 14 }}>🔒</span>
          <span
            style={{
              fontSize: 12,
              color: C.accent,
              fontFamily: MN,
              fontWeight: 600,
            }}
          >
            {typeLock}
          </span>
          <button
            onClick={resetAll}
            style={{
              marginLeft: "auto",
              padding: "5px 14px",
              borderRadius: 8,
              fontSize: 11,
              fontWeight: 600,
              fontFamily: MN,
              cursor: "pointer",
              background: `${C.red}15`,
              color: C.red,
              border: `1px solid ${C.red}30`,
            }}
          >
            Limpar
          </button>
        </div>
      )}

      {selected.map((sym, i) => {
        const a = DB_RF[sym];
        return (
          <div
            key={sym}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "9px 14px",
              marginBottom: 4,
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: 12,
            }}
          >
            <span
              style={{
                fontFamily: MN,
                fontSize: 12,
                fontWeight: 700,
                color: PAL[i % PAL.length],
                minWidth: 22,
              }}
            >
              {i + 1}.
            </span>
            <span
              style={{
                fontFamily: MN,
                fontWeight: 700,
                color: C.white,
                fontSize: 12,
                flex: 1,
              }}
            >
              {a?.shortName}
            </span>
            <span style={{ fontSize: 10, color: C.textDim, fontFamily: MN }}>
              {a?.indexador}
            </span>
            <button
              onClick={() => removeAsset(sym)}
              style={{
                background: "none",
                border: "none",
                color: C.textMuted,
                cursor: "pointer",
                fontSize: 16,
              }}
            >
              ×
            </button>
          </div>
        );
      })}

      <div style={{ marginBottom: 16 }}>
        <input
          value={searchQ}
          onChange={(e) => setSearchQ(e.target.value)}
          placeholder="Buscar título... (ex: SELIC2029, CDB_INTER_POS)"
          style={{
            width: "100%",
            padding: "12px 14px",
            background: C.cardAlt,
            border: `1px solid ${C.border}`,
            borderRadius: 10,
            color: C.text,
            fontSize: 13,
            fontFamily: FN,
            outline: "none",
            boxSizing: "border-box",
          }}
        />

        {results.length > 0 && (
          <div
            style={{
              marginTop: 6,
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: 10,
              overflow: "hidden",
            }}
          >
            {results.map((a) => (
              <button
                key={a.symbol}
                onClick={() => addAsset(a.symbol)}
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 12px",
                  background: "transparent",
                  border: "none",
                  borderBottom: `1px solid ${C.border}`,
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <div>
                  <div style={{ fontFamily: MN, fontSize: 12, color: C.white }}>
                    {a.shortName}
                  </div>
                  <div style={{ fontSize: 10, color: C.textDim }}>
                    {a.indexador} • {a.sector}
                  </div>
                </div>
                <div style={{ fontFamily: MN, fontSize: 11, color: C.accent }}>
                  {fmtRF ? fmtRF(a.rentLiquida, "pct") : `${a.rentLiquida}%`}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {selected.length === 1 && (
        <div style={{ textAlign: "center", padding: 20, color: C.textDim, fontSize: 13 }}>
          Adicione o 2º título de <strong style={{ color: C.white }}>{typeLock}</strong> para comparar
        </div>
      )}

      {ranked.length >= 2 && (
        <RankingResults
          ranked={ranked}
          selected={selected}
          indicators={IND_RF}
          label="título"
        />
      )}

      <SponsorSlot id="rf-bottom" />
    </div>
  );
}
