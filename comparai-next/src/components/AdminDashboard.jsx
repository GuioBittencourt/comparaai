"use client";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "../lib/supabase";
import { C, MN, FN, PAL } from "../lib/theme";
import { formatPhone } from "../lib/utils";
import {
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  Tooltip as RTooltip, Legend
} from "recharts";

export default function AdminDashboard() {
  const [profiles, setProfiles] = useState([]);
  const [searches, setSearches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const fetchData = async () => {
    setLoading(true);
    const { data: p } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    const { data: s } = await supabase.from("searches").select("*");
    setProfiles(p || []);
    setSearches(s || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = useMemo(() => {
    let list = profiles;
    if (dateFrom) list = list.filter((u) => u.created_at >= dateFrom);
    if (dateTo) list = list.filter((u) => u.created_at <= dateTo + "T23:59:59");
    return list;
  }, [profiles, dateFrom, dateTo]);

  const total = filtered.length;
  const today = new Date().toISOString().slice(0, 10);

  const sexoData = useMemo(() => {
    const c = { M: 0, F: 0, O: 0, N: 0 };
    filtered.forEach((u) => { if (c[u.sexo] !== undefined) c[u.sexo]++; });
    return [
      { name: "Masculino", value: c.M, fill: C.blue },
      { name: "Feminino", value: c.F, fill: C.pink },
      { name: "Outro", value: c.O, fill: C.purple },
      { name: "N/D", value: c.N, fill: C.textMuted },
    ].filter((d) => d.value > 0);
  }, [filtered]);

  const ageData = useMemo(() => {
    const b = { "18-24": 0, "25-34": 0, "35-44": 0, "45-54": 0, "55+": 0 };
    const now = new Date();
    filtered.forEach((u) => {
      if (!u.nascimento) return;
      const age = Math.floor((now - new Date(u.nascimento)) / (365.25 * 86400000));
      if (age < 25) b["18-24"]++;
      else if (age < 35) b["25-34"]++;
      else if (age < 45) b["35-44"]++;
      else if (age < 55) b["45-54"]++;
      else b["55+"]++;
    });
    return Object.entries(b).map(([name, value], i) => ({ name, value, fill: PAL[i] })).filter((d) => d.value > 0);
  }, [filtered]);

  const topTickers = useMemo(() => {
    const c = {};
    searches.forEach((s) => { c[s.ticker] = (c[s.ticker] || 0) + 1; });
    return Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, 15).map(([name, value]) => ({ name, value }));
  }, [searches]);

  const togglePremium = async (userId, current) => {
    await supabase.from("profiles").update({ is_premium: !current }).eq("id", userId);
    fetchData();
  };

  const exportExcel = () => {
    const header = ["Nome", "Sobrenome", "E-mail", "Celular", "WhatsApp Link", "CPF", "Sexo", "Nascimento", "Cadastro", "Último Login", "Admin", "Premium"];
    const rows = filtered.map((u) => [
      u.nome, u.sobrenome, u.email || "",
      u.celular || "", u.celular ? `https://wa.me/55${u.celular}` : "",
      u.cpf ? `***${u.cpf.slice(3, 9)}***` : "",
      u.sexo === "M" ? "Masculino" : u.sexo === "F" ? "Feminino" : u.sexo === "O" ? "Outro" : "N/D",
      u.nascimento || "", u.created_at?.slice(0, 10) || "", u.last_login?.slice(0, 10) || "",
      u.is_admin ? "Sim" : "Não", u.is_premium ? "Sim" : "Não",
    ]);
    const csv = [header, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `comparai-usuarios-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return (
    <div style={{ padding: 40, textAlign: "center", color: C.textDim }}>
      <div style={{ width: 28, height: 28, border: `2.5px solid ${C.border}`, borderTop: `2.5px solid ${C.accent}`, borderRadius: "50%", animation: "spin 0.7s linear infinite", margin: "0 auto 12px" }} />
      Carregando dados...
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: MN, fontSize: 18, fontWeight: 800, color: C.white, margin: 0 }}>🔐 Painel Administrativo</h2>
          <p style={{ fontSize: 12, color: C.textDim, margin: "4px 0 0" }}>Dados reais do Supabase — {total} usuários</p>
        </div>
        <button onClick={exportExcel} style={{ padding: "8px 18px", borderRadius: 10, fontSize: 12, fontWeight: 600, fontFamily: MN, cursor: "pointer", background: `${C.green}15`, color: C.green, border: `1px solid ${C.green}30` }}>
          📥 Exportar Excel/CSV
        </button>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Total Usuários", value: total, icon: "👥" },
          { label: "Cadastros Hoje", value: filtered.filter((u) => u.created_at?.startsWith(today)).length, icon: "📅" },
          { label: "Buscas Totais", value: searches.length, icon: "🔍" },
          { label: "Premium", value: filtered.filter((u) => u.is_premium).length, icon: "⭐" },
          { label: "LGPD Aceitos", value: filtered.filter((u) => u.lgpd_accepted).length, icon: "✅" },
        ].map((k) => (
          <div key={k.label} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 18px" }}>
            <div style={{ fontSize: 11, color: C.textDim, marginBottom: 4 }}>{k.icon} {k.label}</div>
            <div style={{ fontFamily: MN, fontSize: 26, fontWeight: 800, color: C.accent }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Filtro por data */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: 12, color: C.textDim, fontFamily: MN }}>Filtrar por data:</span>
        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
          style={{ padding: "8px 12px", background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 12, fontFamily: MN }} />
        <span style={{ color: C.textMuted, fontSize: 12 }}>até</span>
        <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
          style={{ padding: "8px 12px", background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 12, fontFamily: MN }} />
        {(dateFrom || dateTo) && (
          <button onClick={() => { setDateFrom(""); setDateTo(""); }}
            style={{ padding: "6px 12px", borderRadius: 8, fontSize: 11, cursor: "pointer", background: `${C.red}15`, color: C.red, border: `1px solid ${C.red}30`, fontFamily: MN }}>
            ✕ Limpar
          </button>
        )}
      </div>

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
          <div style={{ fontSize: 12, color: C.textDim, fontFamily: MN, marginBottom: 12 }}>Distribuição por Sexo</div>
          {sexoData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={sexoData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={35} paddingAngle={3} strokeWidth={0}>
                  {sexoData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Pie>
                <Legend wrapperStyle={{ fontFamily: MN, fontSize: 10 }} />
                <RTooltip contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, fontFamily: MN, fontSize: 11, color: C.text }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div style={{ color: C.textMuted, fontSize: 12, padding: 20, textAlign: "center" }}>Sem dados</div>}
        </div>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
          <div style={{ fontSize: 12, color: C.textDim, fontFamily: MN, marginBottom: 12 }}>Faixa Etária</div>
          {ageData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={ageData} margin={{ left: 0, right: 10, top: 5, bottom: 5 }}>
                <XAxis dataKey="name" tick={{ fill: C.textDim, fontSize: 10, fontFamily: MN }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: C.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} width={30} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {ageData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <div style={{ color: C.textMuted, fontSize: 12, padding: 20, textAlign: "center" }}>Sem dados</div>}
        </div>
      </div>

      {/* Top tickers */}
      {topTickers.length > 0 && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20, marginBottom: 24 }}>
          <div style={{ fontSize: 12, color: C.textDim, fontFamily: MN, marginBottom: 12 }}>🔍 Ativos Mais Buscados</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {topTickers.map((s, i) => (
              <span key={s.name} style={{ padding: "6px 12px", borderRadius: 8, fontSize: 12, fontFamily: MN, fontWeight: 600, background: `${PAL[i % PAL.length]}15`, color: PAL[i % PAL.length], border: `1px solid ${PAL[i % PAL.length]}30` }}>
                {s.name} ({s.value})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* User table */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "auto" }}>
        <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: C.textDim, fontFamily: MN }}>TODOS OS USUÁRIOS ({total})</span>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
          <thead>
            <tr>
              {["Nome", "E-mail", "WhatsApp", "CPF", "Sexo", "Idade", "Cadastro", "Último Login", "Premium", "Ações"].map((h) => (
                <th key={h} style={{ padding: "10px 10px", borderBottom: `1px solid ${C.border}`, textAlign: "left", fontFamily: MN, fontSize: 9, color: C.textMuted, textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => {
              const age = u.nascimento ? Math.floor((Date.now() - new Date(u.nascimento).getTime()) / (365.25 * 86400000)) : "—";
              const cpfMask = u.cpf ? `***.***. ${u.cpf.slice(6, 9)}-${u.cpf.slice(9)}` : "—";
              const whatsLink = u.celular ? `https://wa.me/55${u.celular}` : null;
              return (
                <tr key={u.id}>
                  <td style={{ padding: "9px 10px", borderBottom: `1px solid ${C.border}`, fontSize: 12, color: C.text }}>
                    {u.nome} {u.sobrenome}
                    {u.is_admin && <span style={{ marginLeft: 6, fontSize: 9, padding: "2px 6px", borderRadius: 4, background: `${C.purple}20`, color: C.purple }}>ADM</span>}
                  </td>
                  <td style={{ padding: "9px 10px", borderBottom: `1px solid ${C.border}`, fontSize: 11, color: C.textDim, fontFamily: MN }}>{u.email || "—"}</td>
                  <td style={{ padding: "9px 10px", borderBottom: `1px solid ${C.border}`, fontSize: 11 }}>
                    {whatsLink ? (
                      <a href={whatsLink} target="_blank" rel="noopener noreferrer" style={{ color: C.green, textDecoration: "none", fontFamily: MN, fontSize: 11 }}>
                        📱 {formatPhone(u.celular)}
                      </a>
                    ) : "—"}
                  </td>
                  <td style={{ padding: "9px 10px", borderBottom: `1px solid ${C.border}`, fontSize: 11, color: C.textDim, fontFamily: MN }}>{cpfMask}</td>
                  <td style={{ padding: "9px 10px", borderBottom: `1px solid ${C.border}`, fontSize: 11, color: C.textDim }}>
                    {u.sexo === "M" ? "Masc" : u.sexo === "F" ? "Fem" : u.sexo === "O" ? "Outro" : "N/D"}
                  </td>
                  <td style={{ padding: "9px 10px", borderBottom: `1px solid ${C.border}`, fontSize: 11, color: C.textDim, fontFamily: MN }}>{age}</td>
                  <td style={{ padding: "9px 10px", borderBottom: `1px solid ${C.border}`, fontSize: 10, color: C.textMuted, fontFamily: MN }}>{u.created_at?.slice(0, 10) || "—"}</td>
                  <td style={{ padding: "9px 10px", borderBottom: `1px solid ${C.border}`, fontSize: 10, color: C.textMuted, fontFamily: MN }}>{u.last_login?.slice(0, 10) || "—"}</td>
                  <td style={{ padding: "9px 10px", borderBottom: `1px solid ${C.border}` }}>
                    <button onClick={() => togglePremium(u.id, u.is_premium)}
                      style={{ padding: "4px 10px", borderRadius: 6, fontSize: 10, fontWeight: 600, fontFamily: MN, cursor: "pointer",
                        background: u.is_premium ? `${C.accent}15` : `${C.red}15`,
                        color: u.is_premium ? C.accent : C.red,
                        border: `1px solid ${u.is_premium ? C.accent : C.red}30`,
                      }}>
                      {u.is_premium ? "⭐ Premium" : "Free"}
                    </button>
                  </td>
                  <td style={{ padding: "9px 10px", borderBottom: `1px solid ${C.border}` }}>
                    {whatsLink && (
                      <a href={`${whatsLink}?text=Olá ${u.nome}! Aqui é da equipe compara.ai 😊`} target="_blank" rel="noopener noreferrer"
                        style={{ padding: "4px 10px", borderRadius: 6, fontSize: 10, fontFamily: MN, background: `${C.green}15`, color: C.green, border: `1px solid ${C.green}30`, textDecoration: "none" }}>
                        💬 Enviar
                      </a>
                    )}
                  </td>
                </tr>
              );
            })}
            {total === 0 && (
              <tr><td colSpan={10} style={{ padding: 20, textAlign: "center", color: C.textMuted, fontSize: 12 }}>Nenhum usuário encontrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
