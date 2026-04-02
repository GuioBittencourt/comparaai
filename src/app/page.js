"use client";
import { useState, useEffect } from "react";
import { supabase, ADMIN_EMAIL } from "../lib/supabase";
import { C, MN, FN, PAL, inputStyle, labelStyle, btnPrimary, btnSecondary } from "../lib/theme";
import { validateCPF, formatCPF, formatPhone, validateEmail, validatePhone } from "../lib/utils";
import { LGPD_TEXT } from "../lib/lgpd";
import { IND_ACOES, IND_FIIS } from "../data/indicators";
import { DB_A } from "../data/acoes";
import { DB_F } from "../data/fiis";
import { DB_RF, IND_RF, MACRO_SIGNALS, fmtRF } from "../data/rendafixa";
import { smartBrapiFetch, mergeWithBrapi } from "../lib/brapi";
import ComparatorPage from "../components/ComparatorPage";
import ComparadorRF from "../components/ComparadorRF";
import { BannerFinanceiro, BannerRiqueza } from "../components/Banners";
import SponsorSlot from "../components/SponsorSlot";
import AdminDashboard from "../components/AdminDashboard";
import HomePage from "../components/HomePage";
import PhilosophyQuiz, { PHILOSOPHIES } from "../components/PhilosophyQuiz";
import PhilosophyResult from "../components/PhilosophyResult";
import EducationHub from "../components/EducationHub";
import CarteiraFicticia from "../components/CarteiraFicticia";

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
        <div style={{ textAlign: "center", margin: "0 0 8px" }}>
  <img
    src="/logo-completo.png"
    alt="comparainvest"
    style={{ width: 100, maxWidth: "100%", height: "auto" }}
  />
</div>
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
        <div style={{ textAlign: "center", margin: "0 0 8px" }}>
  <img
    src="/logo-completo.png"
    alt="comparainvest"
    style={{ width: 100, maxWidth: "100%", height: "auto" }}
  />
</div>
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
  const [tab, setTab] = useState("home");
  const [quizResult, setQuizResult] = useState(null);
  const [dbAcoes, setDbAcoes] = useState(DB_A);
  const [dbFiis, setDbFiis] = useState(DB_F);

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

  // Smart Brapi: fetch top 20 tickers once per day during market hours
  useEffect(() => {
    (async () => {
      try {
        const brapiData = await smartBrapiFetch();
        if (brapiData) {
          setDbAcoes(mergeWithBrapi(DB_A, brapiData));
          setDbFiis(mergeWithBrapi(DB_F, brapiData));
        }
      } catch (e) { console.log("Brapi merge skipped:", e.message); }
    })();
  }, []);

  const handleLogout = async () => { await supabase.auth.signOut(); setUser(null); setScreen("login"); setTab("home"); };

  const trackSearch = async (sym) => {
    if (!user?.id) return;
    await supabase.from("searches").insert({ user_id: user.id, ticker: sym });
  };

  const handleTrack = (track) => {
    if (track === "investimentos") {
      // Check if user already has a philosophy
      if (user?.philosophy) {
        setTab("comparadores");
      } else {
        setTab("quiz");
      }
    } else {
      setTab("educacao");
    }
  };

  const handleQuizComplete = (result) => {
    setQuizResult(result);
    setUser((prev) => ({ ...prev, philosophy: result.key, philosophy_allocation: result.philosophy }));
    setTab("quiz-result");
  };

  const handleQuizSkip = () => {
    setTab("comparadores");
  };

  if (screen === "loading") return <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ width: 28, height: 28, border: `2.5px solid ${C.border}`, borderTop: `2.5px solid ${C.accent}`, borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /></div>;
  if (screen === "register") return <RegisterScreen onRegistered={(u) => { setUser(u); setScreen("app"); }} onGoLogin={() => setScreen("login")} />;
  if (screen === "login") return <LoginScreen onLoggedIn={(u) => { setUser(u); setScreen("app"); }} onGoRegister={() => setScreen("register")} />;

  // Quiz screens (full screen, no header)
  if (tab === "quiz") return <PhilosophyQuiz user={user} onComplete={handleQuizComplete} onSkip={handleQuizSkip} />;
  if (tab === "quiz-result") return <PhilosophyResult result={quizResult} onContinue={() => setTab("comparadores")} />;
  if (tab === "my-philosophy" && user?.philosophy) {
    const key = user.philosophy.toLowerCase();
    const philo = PHILOSOPHIES[key] || PHILOSOPHIES[Object.keys(PHILOSOPHIES).find(k => PHILOSOPHIES[k].name.toLowerCase() === key)] || PHILOSOPHIES.estrategista;
    const allocation = user.philosophy_allocation || { rf: philo.rf, fii: philo.fii, acoes: philo.acoes, cripto: philo.cripto };
    const storedResult = {
      key: key,
      score: user.philosophy_score || 50,
      philosophy: { ...philo, rf: allocation.rf, fii: allocation.fii, acoes: allocation.acoes, cripto: allocation.cripto },
    };
    return <PhilosophyResult result={storedResult} onContinue={() => setTab("comparadores")} onRefazer={() => setTab("quiz")} />;
  }

  return (
    <div style={{ fontFamily: FN, background: C.bg, color: C.text, minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ padding: "24px 28px", borderBottom: `1px solid ${C.border}`, background: `linear-gradient(180deg, rgba(0,229,160,0.03) 0%, transparent 100%)` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div
  onClick={() => setTab("home")}
  style={{
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    marginLeft: -8
  }}
>
  <img
    src="/logo-texto.png"
    alt="comparainvest"
    style={{ height: 32, width: "auto" }}
  />
</div>
            <p style={{ color: C.textDim, fontSize: 12, margin: "4px 0 0" }}>
              Olá, {user?.nome}!
              {user?.philosophy && <button onClick={() => setTab("my-philosophy")} style={{ marginLeft: 8, fontSize: 10, padding: "2px 8px", borderRadius: 4, background: `${C.accent}15`, color: C.accent, fontFamily: MN, border: `1px solid ${C.accent}30`, cursor: "pointer" }} title="Ver minha filosofia">Filosofia: {user.philosophy} →</button>}
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
<div
  style={{
    padding: "4px 8px",
    borderRadius: 999,
    fontSize: 9,
    fontWeight: 700,
    fontFamily: MN,
    letterSpacing: "0.2px",
    background: user?.is_premium ? `${C.accent}15` : `${C.yellow}12`,
    color: user?.is_premium ? C.accent : C.yellow,
    border: `1px solid ${user?.is_premium ? `${C.accent}30` : `${C.yellow}25`}`,
    lineHeight: 1,
    whiteSpace: "nowrap",
  }}
>
  {user?.is_premium ? "Premium" : "Gratuito"}
</div>
            {user?.is_admin && (
              <button onClick={() => setTab("admin")} style={{ padding: "8px 16px", borderRadius: 10, fontSize: 11, fontWeight: 600, fontFamily: MN, cursor: "pointer", background: `${C.purple}15`, color: C.purple, border: `1px solid ${C.purple}30` }}>
                🔐 Admin
              </button>
            )}
            <button onClick={handleLogout} style={{ padding: "8px 16px", borderRadius: 10, fontSize: 11, fontWeight: 600, fontFamily: MN, cursor: "pointer", background: C.cardAlt, color: C.textDim, border: `1px solid ${C.border}` }}>Sair</button>
          </div>
        </div>

        {/* Navigation tabs - only show when not on home */}
        {tab !== "home" && tab !== "educacao" && tab !== "admin" && (
          <div style={{ display: "flex", gap: 0, marginTop: 16 }}>
            {[
              { id: "home", label: "🏠 Início" },
              { id: "comparadores", label: "⚔️ Comparar" },
              { id: "acoes", label: "📈 Ações", desc: "12 ind." },
              { id: "fiis", label: "🏢 FIIs", desc: "11 ind." },
              { id: "rf", label: "🏦 RF", desc: "8 ind." },
              { id: "carteira", label: "💼 Carteira" },
            ].map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "11px 16px", fontSize: 12, fontWeight: tab === t.id ? 600 : 400, color: tab === t.id ? C.accent : C.textDim, background: "transparent", border: "none", borderBottom: tab === t.id ? `2px solid ${C.accent}` : "2px solid transparent", cursor: "pointer", fontFamily: FN, transition: "all 0.2s" }}>
                {t.label} {t.desc && <span style={{ fontSize: 9, color: C.textMuted }}>({t.desc})</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: tab === "home" ? 0 : "24px 28px", maxWidth: tab === "admin" ? 1100 : 960, margin: "0 auto" }}>
        {tab === "home" && <HomePage user={user} onTrack={handleTrack} />}

        {tab === "educacao" && <EducationHub onBack={() => setTab("home")} user={user} />}

        {tab === "comparadores" && (
          <div style={{ padding: "32px 0" }}>
            <h2 style={{ fontFamily: MN, fontSize: 18, fontWeight: 800, color: C.white, margin: "0 0 8px" }}>⚔️ Hub de Comparação</h2>
            <p style={{ color: C.textDim, fontSize: 13, marginBottom: 24, lineHeight: 1.7 }}>
              Escolha o tipo de ativo que deseja comparar.
              {!user?.philosophy && <span style={{ display: "block", marginTop: 8 }}><button onClick={() => setTab("quiz")} style={{ background: "none", border: "none", color: C.accent, fontSize: 13, cursor: "pointer", fontFamily: FN, padding: 0, textDecoration: "underline" }}>💡 Faça o quiz de filosofia</button> para receber sugestões personalizadas de carteira.</span>}
            </p>

            <BannerRiqueza />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[
                { id: "acoes", icon: "📈", title: "Ações", desc: "12 indicadores R2A", color: C.accent },
                { id: "fiis", icon: "🏢", title: "Fundos Imobiliários", desc: "11 indicadores", color: C.blue },
                { id: "rf", icon: "🏦", title: "Renda Fixa", desc: "8 indicadores", color: C.orange },
                { id: "cripto", icon: "₿", title: "Cripto", desc: "Em breve", color: C.purple, disabled: true },
              ].map((c) => (
                <button key={c.id} onClick={() => !c.disabled && setTab(c.id)}
                  style={{
                    padding: "24px 20px", borderRadius: 16, textAlign: "center",
                    background: C.card, border: `1px solid ${c.disabled ? C.border : `${c.color}30`}`,
                    cursor: c.disabled ? "not-allowed" : "pointer", opacity: c.disabled ? 0.5 : 1,
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => { if (!c.disabled) e.currentTarget.style.borderColor = c.color; }}
                  onMouseLeave={(e) => { if (!c.disabled) e.currentTarget.style.borderColor = `${c.color}30`; }}
                >
                  <div style={{ fontSize: 32, marginBottom: 8 }}>{c.icon}</div>
                  <div style={{ fontFamily: MN, fontSize: 14, fontWeight: 700, color: C.white }}>{c.title}</div>
                  <div style={{ fontSize: 11, color: C.textDim, marginTop: 4 }}>{c.desc}</div>
                  {c.disabled && <div style={{ fontSize: 9, color: C.yellow, fontFamily: MN, marginTop: 8 }}>🔒 Em breve</div>}
                </button>
              ))}
            </div>
          </div>
        )}

        {tab === "acoes" && (
          <ComparatorPage
            db={dbAcoes} indicators={IND_ACOES} assetLabel="ação"
            searchPlaceholder="Buscar ação... (ex: ITUB4, Petrobras)"
            shortcuts={["Financeiro", "Energia Elétrica", "Consumo", "Mineração / Siderurgia", "Saúde"]}
            onSearch={trackSearch}
            banner={<BannerRiqueza />}
            user={user}
          />
        )}
        {tab === "fiis" && (
          <ComparatorPage
            db={dbFiis} indicators={IND_FIIS} assetLabel="FII"
            searchPlaceholder="Buscar FII... (ex: HGLG11, MXRF11)"
            shortcuts={["Tijolo — Logística", "Tijolo — Shopping", "Tijolo — Lajes Corp.", "Papel — CRI", "Híbrido / FOF"]}
            onSearch={trackSearch}
            banner={<BannerRiqueza />}
            user={user}
          />
        )}
        {tab === "rf" && <ComparadorRF user={user} onSearch={trackSearch} />}
        {tab === "carteira" && <CarteiraFicticia user={user} onGoCompare={() => setTab("comparadores")} />}
        {tab === "admin" && user?.is_admin && <AdminDashboard />}
      </div>

      {/* Footer */}
      <div style={{ padding: "16px 28px", borderTop: `1px solid ${C.border}`, textAlign: "center", fontSize: 10, color: C.textMuted, fontFamily: MN }}>
        COMPARAINVEST © • Desde 2026 — LGPD • Comparador B3 
      </div>
    </div>
  );
}
