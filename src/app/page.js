"use client";
import { useState, useEffect } from "react";
import { supabase, ADMIN_EMAIL } from "../lib/supabase";
import { C, MN, FN, PAL, inputStyle, labelStyle, btnPrimary, btnSecondary } from "../lib/theme";
import { validateCPF, formatCPF, formatPhone, validateEmail, validatePhone } from "../lib/utils";
import { LGPD_TEXT } from "../lib/lgpd";
import { IND_ACOES, IND_FIIS } from "../data/indicators";
import { DB_A } from "../data/acoes";
import { DB_F } from "../data/fiis";
import ComparatorPage from "../components/ComparatorPage";
import { BannerFinanceiro, BannerRiqueza } from "../components/Banners";
import SponsorSlot from "../components/SponsorSlot";

function FieldError({ msg }) {
  if (!msg) return null;
  return <div style={{ fontSize: 11, color: C.red, marginTop: 2 }}>{msg}</div>;
}

/* ═══════════════════════════════════════════════════════════════════════
   REGISTER
   ═══════════════════════════════════════════════════════════════════════ */
function RegisterScreen({ onRegistered, onGoLogin }) {
  const [form, setForm] = useState({ nome: "", sobrenome: "", email: "", celular: "", cpf: "", sexo: "", nascimento: "", senha: "", senhaConf: "" });
  const [errors, setErrors] = useState({});
  const [lgpdOpen, setLgpdOpen] = useState(false);
  const [lgpdAccepted, setLgpdAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [globalErr, setGlobalErr] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.nome.trim()) e.nome = "Obrigatório";
    if (!form.sobrenome.trim()) e.sobrenome = "Obrigatório";
    if (!validateEmail(form.email)) e.email = "E-mail inválido";
    if (!validatePhone(form.celular)) e.celular = "Celular inválido (11 dígitos)";
    if (!validateCPF(form.cpf)) e.cpf = "CPF inválido (verifique os dígitos)";
    if (!form.sexo) e.sexo = "Selecione";
    if (!form.nascimento) e.nascimento = "Obrigatório";
    if (form.senha.length < 6) e.senha = "Mínimo 6 caracteres";
    if (form.senha !== form.senhaConf) e.senhaConf = "Senhas não coincidem";
    if (!lgpdAccepted) e.lgpd = "Você precisa aceitar os termos";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true); setGlobalErr(""); setSuccessMsg("");
    const cpfClean = form.cpf.replace(/\D/g, "");
    const emailClean = form.email.toLowerCase().trim();
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({ email: emailClean, password: form.senha });
      if (authError) { setGlobalErr(authError.message.includes("already registered") ? "E-mail já cadastrado. Faça login." : authError.message); setSubmitting(false); return; }
      const userId = authData.user?.id;
      if (!userId) { setGlobalErr("Erro ao criar conta."); setSubmitting(false); return; }
      const { error: profileError } = await supabase.from("profiles").insert({
        id: userId, nome: form.nome.trim(), sobrenome: form.sobrenome.trim(), cpf: cpfClean,
        celular: form.celular.replace(/\D/g, ""), sexo: form.sexo, nascimento: form.nascimento,
        lgpd_accepted: true, lgpd_date: new Date().toISOString(), is_admin: emailClean === ADMIN_EMAIL,
      });
      if (profileError) { setGlobalErr("Erro: " + profileError.message); setSubmitting(false); return; }
      if (!authData.session) { setSuccessMsg("Cadastro realizado! Verifique seu e-mail para confirmar a conta."); setSubmitting(false); return; }
      onRegistered({ id: userId, nome: form.nome.trim(), sobrenome: form.sobrenome.trim(), email: emailClean, is_admin: emailClean === ADMIN_EMAIL });
    } catch (err) { setGlobalErr("Erro: " + err.message); }
    setSubmitting(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 480, background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: "36px 32px" }}>
        <h1 style={{ fontFamily: MN, fontSize: 22, fontWeight: 800, color: C.white, margin: "0 0 4px", textAlign: "center" }}>compar<span style={{ color: C.accent }}>.</span>ai</h1>
        <p style={{ textAlign: "center", color: C.textDim, fontSize: 13, marginBottom: 28 }}>Crie sua conta gratuita</p>
        {globalErr && <div style={{ padding: "10px 14px", background: `${C.red}15`, border: `1px solid ${C.red}30`, borderRadius: 10, color: C.red, fontSize: 12, marginBottom: 16 }}>{globalErr}</div>}
        {successMsg && <div style={{ padding: "10px 14px", background: `${C.accent}15`, border: `1px solid ${C.accent}30`, borderRadius: 10, color: C.accent, fontSize: 12, marginBottom: 16 }}>{successMsg}</div>}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
          <div><label style={labelStyle}>Nome</label><input style={inputStyle} value={form.nome} onChange={(e) => set("nome", e.target.value)} placeholder="João" /><FieldError msg={errors.nome} /></div>
          <div><label style={labelStyle}>Sobrenome</label><input style={inputStyle} value={form.sobrenome} onChange={(e) => set("sobrenome", e.target.value)} placeholder="Silva" /><FieldError msg={errors.sobrenome} /></div>
        </div>
        <div style={{ marginBottom: 12 }}><label style={labelStyle}>E-mail</label><input style={inputStyle} type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="joao@email.com" /><FieldError msg={errors.email} /></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
          <div><label style={labelStyle}>Celular</label><input style={inputStyle} value={formatPhone(form.celular)} onChange={(e) => set("celular", e.target.value)} placeholder="(11) 99999-9999" /><FieldError msg={errors.celular} /></div>
          <div><label style={labelStyle}>CPF</label><input style={inputStyle} value={formatCPF(form.cpf)} onChange={(e) => set("cpf", e.target.value)} placeholder="000.000.000-00" /><FieldError msg={errors.cpf} /></div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
          <div><label style={labelStyle}>Sexo</label><select style={{ ...inputStyle, appearance: "auto" }} value={form.sexo} onChange={(e) => set("sexo", e.target.value)}><option value="">Selecione</option><option value="M">Masculino</option><option value="F">Feminino</option><option value="O">Outro</option><option value="N">Prefiro não dizer</option></select><FieldError msg={errors.sexo} /></div>
          <div><label style={labelStyle}>Data de Nascimento</label><input style={inputStyle} type="date" value={form.nascimento} onChange={(e) => set("nascimento", e.target.value)} /><FieldError msg={errors.nascimento} /></div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          <div><label style={labelStyle}>Senha</label><input style={inputStyle} type="password" value={form.senha} onChange={(e) => set("senha", e.target.value)} placeholder="Mínimo 6 caracteres" /><FieldError msg={errors.senha} /></div>
          <div><label style={labelStyle}>Confirmar Senha</label><input style={inputStyle} type="password" value={form.senhaConf} onChange={(e) => set("senhaConf", e.target.value)} placeholder="Repita a senha" /><FieldError msg={errors.senhaConf} /></div>
        </div>
        <div style={{ marginBottom: 20, padding: "14px 16px", background: C.cardAlt, borderRadius: 12, border: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            <input type="checkbox" checked={lgpdAccepted} onChange={(e) => setLgpdAccepted(e.target.checked)} style={{ marginTop: 3, accentColor: C.accent, width: 16, height: 16, cursor: "pointer" }} />
            <div style={{ fontSize: 12, color: C.textDim, lineHeight: 1.6 }}>Li e aceito o{" "}<span onClick={() => setLgpdOpen(!lgpdOpen)} style={{ color: C.accent, cursor: "pointer", textDecoration: "underline" }}>Termo de Consentimento (LGPD)</span></div>
          </div>
          <FieldError msg={errors.lgpd} />
          {lgpdOpen && <div style={{ marginTop: 12, padding: 14, background: C.bg, borderRadius: 10, maxHeight: 200, overflowY: "auto", fontSize: 11, color: C.textDim, lineHeight: 1.7, whiteSpace: "pre-line", border: `1px solid ${C.border}` }}>{LGPD_TEXT}</div>}
        </div>
        <button style={{ ...btnPrimary, opacity: submitting ? 0.6 : 1 }} onClick={handleSubmit} disabled={submitting}>{submitting ? "Cadastrando..." : "Aceito e quero me cadastrar"}</button>
        <div style={{ textAlign: "center", marginTop: 16 }}><button onClick={onGoLogin} style={{ ...btnSecondary, border: "none", width: "auto", padding: "8px 16px" }}>Já tem conta? <span style={{ color: C.accent }}>Fazer login</span></button></div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   LOGIN + PASSWORD RECOVERY
   ═══════════════════════════════════════════════════════════════════════ */
function LoginScreen({ onLoggedIn, onGoRegister }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetMsg, setResetMsg] = useState("");

  const handleLogin = async () => {
    setError(""); setLoading(true);
    const { data, error: authErr } = await supabase.auth.signInWithPassword({ email: email.toLowerCase().trim(), password: senha });
    if (authErr) { setError("E-mail ou senha incorretos."); setLoading(false); return; }
    const userId = data.user?.id;
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", userId).single();
    if (profile) {
      await supabase.from("profiles").update({ last_login: new Date().toISOString() }).eq("id", userId);
      onLoggedIn({ ...profile, email: data.user.email });
    } else { setError("Perfil não encontrado."); }
    setLoading(false);
  };

  const handleReset = async () => {
    setError(""); setResetMsg("");
    if (!validateEmail(email)) { setError("Digite um e-mail válido."); return; }
    setLoading(true);
    const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email.toLowerCase().trim(), { redirectTo: window.location.origin });
    if (resetErr) { setError(resetErr.message); } else { setResetMsg("E-mail de recuperação enviado! Verifique sua caixa."); }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 400, background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: "36px 32px" }}>
        <h1 style={{ fontFamily: MN, fontSize: 22, fontWeight: 800, color: C.white, margin: "0 0 4px", textAlign: "center" }}>compar<span style={{ color: C.accent }}>.</span>ai</h1>
        <p style={{ textAlign: "center", color: C.textDim, fontSize: 13, marginBottom: 28 }}>{resetMode ? "Recuperar senha" : "Entrar na sua conta"}</p>
        {error && <div style={{ padding: "10px 14px", background: `${C.red}15`, border: `1px solid ${C.red}30`, borderRadius: 10, color: C.red, fontSize: 12, marginBottom: 16 }}>{error}</div>}
        {resetMsg && <div style={{ padding: "10px 14px", background: `${C.accent}15`, border: `1px solid ${C.accent}30`, borderRadius: 10, color: C.accent, fontSize: 12, marginBottom: 16 }}>{resetMsg}</div>}
        <div style={{ marginBottom: 14 }}><label style={labelStyle}>E-mail</label><input style={inputStyle} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" onKeyDown={(e) => e.key === "Enter" && (resetMode ? handleReset() : handleLogin())} /></div>
        {!resetMode && <div style={{ marginBottom: 12 }}><label style={labelStyle}>Senha</label><input style={inputStyle} type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="Sua senha" onKeyDown={(e) => e.key === "Enter" && handleLogin()} /></div>}
        {!resetMode && <div style={{ textAlign: "right", marginBottom: 16 }}><button onClick={() => { setResetMode(true); setError(""); setResetMsg(""); }} style={{ background: "none", border: "none", color: C.accent, fontSize: 12, cursor: "pointer", fontFamily: FN, padding: 0 }}>Esqueci minha senha</button></div>}
        <button style={{ ...btnPrimary, opacity: loading ? 0.6 : 1 }} onClick={resetMode ? handleReset : handleLogin} disabled={loading}>{loading ? "Aguarde..." : resetMode ? "Enviar e-mail de recuperação" : "Entrar"}</button>
        {resetMode && <div style={{ textAlign: "center", marginTop: 12 }}><button onClick={() => { setResetMode(false); setError(""); setResetMsg(""); }} style={{ background: "none", border: "none", color: C.accent, fontSize: 12, cursor: "pointer", fontFamily: FN }}>← Voltar ao login</button></div>}
        <div style={{ textAlign: "center", marginTop: 16 }}><button onClick={onGoRegister} style={{ ...btnSecondary, border: "none", width: "auto", padding: "8px 16px" }}>Não tem conta? <span style={{ color: C.accent }}>Cadastre-se</span></button></div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════════════════════════════════════ */
export default function Home() {
  const [screen, setScreen] = useState("loading");
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("acoes");

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
        if (profile) { setUser({ ...profile, email: session.user.email }); setScreen("app"); return; }
      }
      setScreen("login");
    })();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === "SIGNED_OUT") { setUser(null); setScreen("login"); }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => { await supabase.auth.signOut(); setUser(null); setScreen("login"); };

  const trackSearch = async (sym) => {
    if (!user?.id) return;
    await supabase.from("searches").insert({ user_id: user.id, ticker: sym });
  };

  if (screen === "loading") return <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ width: 28, height: 28, border: `2.5px solid ${C.border}`, borderTop: `2.5px solid ${C.accent}`, borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /></div>;
  if (screen === "register") return <RegisterScreen onRegistered={(u) => { setUser(u); setScreen("app"); }} onGoLogin={() => setScreen("login")} />;
  if (screen === "login") return <LoginScreen onLoggedIn={(u) => { setUser(u); setScreen("app"); }} onGoRegister={() => setScreen("register")} />;

  return (
    <div style={{ fontFamily: FN, background: C.bg, color: C.text, minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ padding: "24px 28px", borderBottom: `1px solid ${C.border}`, background: `linear-gradient(180deg, rgba(0,229,160,0.03) 0%, transparent 100%)` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: MN, fontSize: 24, fontWeight: 800, color: C.white, margin: 0 }}>compar<span style={{ color: C.accent }}>.</span>ai</h1>
            <p style={{ color: C.textDim, fontSize: 12, margin: "4px 0 0" }}>Olá, {user?.nome}!</p>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {user?.is_admin && (
              <button onClick={() => setTab("admin")} style={{ padding: "8px 16px", borderRadius: 10, fontSize: 11, fontWeight: 600, fontFamily: MN, cursor: "pointer", background: `${C.purple}15`, color: C.purple, border: `1px solid ${C.purple}30` }}>
                🔐 Admin
              </button>
            )}
            <button onClick={handleLogout} style={{ padding: "8px 16px", borderRadius: 10, fontSize: 11, fontWeight: 600, fontFamily: MN, cursor: "pointer", background: C.cardAlt, color: C.textDim, border: `1px solid ${C.border}` }}>Sair</button>
          </div>
        </div>
        <div style={{ display: "flex", gap: 0, marginTop: 16 }}>
          {[
            { id: "acoes", label: "📈 Ações", desc: "12 ind. R2A" },
            { id: "fiis", label: "🏢 FIIs", desc: "11 indicadores" },
          ].map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "11px 20px", fontSize: 13, fontWeight: tab === t.id ? 600 : 400, color: tab === t.id ? C.accent : C.textDim, background: "transparent", border: "none", borderBottom: tab === t.id ? `2px solid ${C.accent}` : "2px solid transparent", cursor: "pointer", fontFamily: FN, transition: "all 0.2s" }}>
              {t.label} <span style={{ fontSize: 10, color: C.textMuted }}>({t.desc})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Sponsor slot - top */}
      <SponsorSlot id="header-top" />

      {/* Content */}
      <div style={{ padding: "24px 28px", maxWidth: 960, margin: "0 auto" }}>
        {tab === "acoes" && (
          <ComparatorPage
            db={DB_A} indicators={IND_ACOES} assetLabel="ação"
            searchPlaceholder="Buscar ação... (ex: ITUB4, Petrobras)"
            shortcuts={["Financeiro", "Energia Elétrica", "Consumo", "Mineração / Siderurgia", "Saúde"]}
            onSearch={trackSearch}
            banner={<BannerRiqueza />}
          />
        )}
        {tab === "fiis" && (
          <ComparatorPage
            db={DB_F} indicators={IND_FIIS} assetLabel="FII"
            searchPlaceholder="Buscar FII... (ex: HGLG11, MXRF11)"
            shortcuts={["Tijolo — Logística", "Tijolo — Shopping", "Tijolo — Lajes Corp.", "Papel — CRI", "Híbrido / FOF"]}
            onSearch={trackSearch}
            banner={<BannerRiqueza />}
          />
        )}
        {tab === "admin" && user?.is_admin && (
          <div style={{ textAlign: "center", padding: 40, color: C.textDim }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔐</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: C.white, marginBottom: 8 }}>Painel Admin</div>
            <div style={{ fontSize: 13 }}>Acesse via Supabase Dashboard para ver todos os dados dos usuários em tempo real.</div>
            <a href="https://supabase.com/dashboard/project/odcivnnmxopbjnwueewb" target="_blank" rel="noopener noreferrer"
              style={{ display: "inline-block", marginTop: 16, padding: "12px 24px", background: C.accentDim, border: `1px solid ${C.accentBorder}`, borderRadius: 12, color: C.accent, fontFamily: MN, fontSize: 13, textDecoration: "none" }}>
              Abrir Supabase Dashboard →
            </a>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: "16px 28px", borderTop: `1px solid ${C.border}`, textAlign: "center", fontSize: 10, color: C.textMuted, fontFamily: MN }}>
        compar.ai v3.0 — Next.js + Supabase + LGPD + Comparador R2A
      </div>
    </div>
  );
}
