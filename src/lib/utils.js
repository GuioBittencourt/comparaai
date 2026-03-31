export function validateCPF(cpf) {
  const clean = cpf.replace(/\D/g, "");
  if (clean.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(clean)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(clean[i]) * (10 - i);
  let rem = (sum * 10) % 11;
  if (rem === 10) rem = 0;
  if (rem !== parseInt(clean[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(clean[i]) * (11 - i);
  rem = (sum * 10) % 11;
  if (rem === 10) rem = 0;
  if (rem !== parseInt(clean[10])) return false;
  return true;
}

export function formatCPF(v) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0,3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6)}`;
  return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`;
}

export function formatPhone(v) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 7) return `(${d.slice(0,2)}) ${d.slice(2)}`;
  return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
}

export function validateEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }
export function validatePhone(p) { return p.replace(/\D/g, "").length === 11; }

export const numFmt = (v, d = 2) => {
  if (v == null || isNaN(v)) return "—";
  return Number(v).toLocaleString("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d });
};

export const fmtBRL = (v) => (v != null && !isNaN(v) ? `R$ ${numFmt(v)}` : "—");

export function fmtInd(v, f) {
  if (v == null || isNaN(v)) return "—";
  switch (f) {
    case "pct": return `${numFmt(v)}%`;
    case "bi": return `R$ ${numFmt(v, 1)} bilhões`;
    case "mi": return `R$ ${numFmt(v, 0)} milhões`;
    case "x": return `${numFmt(v)}x`;
    case "score": return `${Math.round(v)}/100`;
    case "money": {
      if (v >= 1e6) return `R$ ${numFmt(v / 1e6, 1)} milhões/dia`;
      if (v >= 1e3) return `R$ ${numFmt(v / 1e3, 1)} mil/dia`;
      return `R$ ${numFmt(v, 0)}/dia`;
    }
    default: return numFmt(v);
  }
}
