"use client";

import { useState, useEffect } from "react";
import { supabase, ADMIN_EMAIL } from "../lib/supabase";
import {
  C,
  MN,
  FN,
  inputStyle,
  labelStyle,
  btnPrimary,
  btnSecondary,
} from "../lib/theme";

import {
  validateCPF,
  formatCPF,
  formatPhone,
  validateEmail,
  validatePhone,
} from "../lib/utils";

import { LGPD_TEXT } from "../lib/lgpd";

import { IND_ACOES, IND_FIIS } from "../data/indicators";
import { DB_A } from "../data/acoes";
import { DB_F } from "../data/fiis";

import { smartBrapiFetch, mergeWithBrapi } from "../lib/brapi";

import ComparatorPage from "../components/ComparatorPage";
import ComparadorRF from "../components/ComparadorRF";
import { BannerRiqueza } from "../components/Banners";
import AdminDashboard from "../components/AdminDashboard";
import HomePage from "../components/HomePage";
import PhilosophyQuiz, { PHILOSOPHIES } from "../components/PhilosophyQuiz";
import PhilosophyResult from "../components/PhilosophyResult";
import EducationHub from "../components/EducationHub";
import CarteiraFicticia from "../components/CarteiraFicticia";

/* =========================================================
   COMPONENT AUX
========================================================= */
function FieldError({ msg }) {
  if (!msg) return null;
  return (
    <div style={{ fontSize: 11, color: C.red, marginTop: 2 }}>
      {msg}
    </div>
  );
}

/* =========================================================
   REGISTER
========================================================= */
function RegisterScreen({ onRegistered, onGoLogin }) {
  const [form, setForm] = useState({
    nome: "",
    sobrenome: "",
    email: "",
    celular: "",
    cpf: "",
    sexo: "",
    nascimento: "",
    senha: "",
    senhaConf: "",
  });

  const [errors, setErrors] = useState({});
  const [lgpdAccepted, setLgpdAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.nome.trim()) e.nome = "Obrigatório";
    if (!form.sobrenome.trim()) e.sobrenome = "Obrigatório";
    if (!validateEmail(form.email)) e.email = "E-mail inválido";
    if (!validatePhone(form.celular)) e.celular = "Celular inválido";
    if (!validateCPF(form.cpf)) e.cpf = "CPF inválido";
    if (form.senha.length < 6) e.senha = "Mínimo 6 caracteres";
    if (form.senha !== form.senhaConf) e.senhaConf = "Senhas não coincidem";
    if (!lgpdAccepted) e.lgpd = "Aceite os termos";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setSubmitting(true);

    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.senha,
    });

    if (error) {
      alert(error.message);
      setSubmitting(false);
      return;
    }

    onRegistered(data.user);
    setSubmitting(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{
        width: "100%",
        maxWidth: 420,
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 20,
        padding: 30,
      }}>
        <h1 style={{ textAlign: "center" }}>
          compara<span style={{ color: C.accent }}>invest</span>
        </h1>

        <input style={inputStyle} placeholder="Nome" onChange={(e) => set("nome", e.target.value)} />
        <FieldError msg={errors.nome} />

        <input style={inputStyle} placeholder="Email" onChange={(e) => set("email", e.target.value)} />
        <FieldError msg={errors.email} />

        <input style={inputStyle} placeholder="Senha" type="password" onChange={(e) => set("senha", e.target.value)} />

        <button style={btnPrimary} onClick={handleSubmit}>
          Criar conta
        </button>

        <button onClick={onGoLogin} style={btnSecondary}>
          Já tenho conta
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   LOGIN
========================================================= */
function LoginScreen({ onLoggedIn, onGoRegister }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (error) {
      alert("Erro no login");
      return;
    }

    onLoggedIn(data.user);
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{
        width: "100%",
        maxWidth: 400,
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 20,
        padding: 30,
      }}>
        <h1 style={{ textAlign: "center" }}>
          compara<span style={{ color: C.accent }}>invest</span>
        </h1>

        <input style={inputStyle} placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
        <input style={inputStyle} type="password" placeholder="Senha" onChange={(e) => setSenha(e.target.value)} />

        <button style={btnPrimary} onClick={handleLogin}>
          Entrar
        </button>

        <button onClick={onGoRegister} style={btnSecondary}>
          Criar conta
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   APP
========================================================= */
export default function Home() {
  const [screen, setScreen] = useState("loading");
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("home");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();

      if (data.session?.user) {
        setUser(data.session.user);
        setScreen("app");
      } else {
        setScreen("login");
      }
    })();
  }, []);

  if (screen === "loading") return null;

  if (screen === "login")
    return (
      <LoginScreen
        onLoggedIn={(u) => {
          setUser(u);
          setScreen("app");
        }}
        onGoRegister={() => setScreen("register")}
      />
    );

  if (screen === "register")
    return (
      <RegisterScreen
        onRegistered={(u) => {
          setUser(u);
          setScreen("app");
        }}
        onGoLogin={() => setScreen("login")}
      />
    );

  return (
    <div style={{ background: C.bg, minHeight: "100vh" }}>
      <h1>App rodando 🔥</h1>
    </div>
  );
}
