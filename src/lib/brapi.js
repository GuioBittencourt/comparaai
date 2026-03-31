import { supabase } from "./supabase";

const BRAPI_TOKEN = "23JivkpZXLGb6uKbTK7uUU";
const BRAPI_BASE = "https://brapi.dev/api";
const CACHE_KEY = "comparai_brapi_live";
const FETCHED_TODAY_KEY = "comparai_brapi_fetched";
const MAX_TICKERS = 20;

function isMarketHours() {
  const now = new Date();
  const day = now.getDay(); // 0=Sun, 6=Sat
  if (day === 0 || day === 6) return false;
  const hour = now.getHours();
  return hour >= 10 && hour < 18; // 10h-17h59
}

function alreadyFetchedToday() {
  try {
    const last = localStorage.getItem(FETCHED_TODAY_KEY);
    if (!last) return false;
    const today = new Date().toISOString().slice(0, 10);
    return last === today;
  } catch { return false; }
}

function markFetchedToday() {
  try {
    localStorage.setItem(FETCHED_TODAY_KEY, new Date().toISOString().slice(0, 10));
  } catch {}
}

function getLiveCache() {
  try {
    const raw = JSON.parse(localStorage.getItem(CACHE_KEY));
    if (raw && typeof raw === "object") return raw;
  } catch {}
  return null;
}

function setLiveCache(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {}
}

async function getTopTickers() {
  try {
    const { data } = await supabase.from("searches").select("ticker");
    if (!data || data.length === 0) return null;
    // Count frequency
    const counts = {};
    data.forEach((s) => { counts[s.ticker] = (counts[s.ticker] || 0) + 1; });
    // Sort by frequency, take top 20
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, MAX_TICKERS)
      .map(([ticker]) => ticker);
  } catch (e) {
    console.log("Failed to get top tickers:", e.message);
    return null;
  }
}

async function fetchFromBrapi(tickers) {
  const tickerStr = tickers.join(",");
  const res = await fetch(`${BRAPI_BASE}/quote/${tickerStr}?token=${BRAPI_TOKEN}`);
  if (!res.ok) throw new Error(`Brapi ${res.status}`);
  const json = await res.json();
  const data = {};
  if (json.results) {
    json.results.forEach((r) => {
      data[r.symbol] = {
        regularMarketPrice: r.regularMarketPrice,
        dividendYield: r.dividendYield,
      };
    });
  }
  return data;
}

// Main function: smart fetch once per day during market hours
export async function smartBrapiFetch() {
  // Already fetched today? Use cache
  if (alreadyFetchedToday()) return getLiveCache();

  // Not market hours? Use cache (don't waste a request)
  if (!isMarketHours()) return getLiveCache();

  // Get top 20 most searched tickers from Supabase
  const topTickers = await getTopTickers();
  if (!topTickers || topTickers.length === 0) return getLiveCache();

  // Fetch from Brapi
  try {
    const brapiData = await fetchFromBrapi(topTickers);
    if (Object.keys(brapiData).length > 0) {
      // Merge with existing cache (keep old tickers, add/update new ones)
      const existing = getLiveCache() || {};
      const merged = { ...existing, ...brapiData };
      setLiveCache(merged);
      markFetchedToday();
      console.log(`Brapi: updated ${Object.keys(brapiData).length} tickers`);
      return merged;
    }
  } catch (e) {
    console.log("Brapi smart fetch failed:", e.message);
  }

  return getLiveCache();
}

// Merge Brapi live data into mock DB
export function mergeWithBrapi(mockDB, brapiData) {
  if (!brapiData) return mockDB;
  const merged = { ...mockDB };
  Object.entries(brapiData).forEach(([symbol, api]) => {
    if (merged[symbol]) {
      if (api.regularMarketPrice != null && api.regularMarketPrice > 0) {
        merged[symbol] = { ...merged[symbol], regularMarketPrice: api.regularMarketPrice };
      }
      if (api.dividendYield != null && api.dividendYield > 0) {
        merged[symbol] = { ...merged[symbol], dividendYield: api.dividendYield };
      }
    }
  });
  return merged;
}
