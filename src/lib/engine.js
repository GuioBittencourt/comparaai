export function rankAll(symbols, db, indicators) {
  const assets = symbols.map((s) => db[s]).filter(Boolean);
  if (assets.length < 2) return [];
  const scores = {};
  assets.forEach((a) => { scores[a.symbol] = { wins: 0, points: 0 }; });

  for (let i = 0; i < assets.length; i++) {
    for (let j = i + 1; j < assets.length; j++) {
      let sA = 0, sB = 0;
      for (const ind of indicators) {
        const vA = assets[i][ind.key], vB = assets[j][ind.key];
        if (vA == null || vB == null || isNaN(vA) || isNaN(vB)) continue;
        const better = ind.dir === "lower"
          ? (vA < vB ? "A" : vA > vB ? "B" : null)
          : (vA > vB ? "A" : vA < vB ? "B" : null);
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
    .map(([sym, sc], i) => ({ ...db[sym], wins: sc.wins, points: sc.points, rank: i + 1 }));
}
