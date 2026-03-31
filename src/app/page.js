"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { C, MN, FN } from "../lib/theme";

import HomePage from "../components/HomePage";
import ComparatorPage from "../components/ComparatorPage";
import ComparadorRF from "../components/ComparadorRF";
import PhilosophyQuiz from "../components/PhilosophyQuiz";
import PhilosophyResult from "../components/PhilosophyResult";
import CarteiraFicticia from "../components/CarteiraFicticia";
import AdminDashboard from "../components/AdminDashboard";

import {
  LogoSymbol,
  IconHome,
  IconComparar,
  IconAcoes,
  IconFIIs,
  IconRendaFixa,
  IconCarteira,
} from "../components/Icons";

export default function Home() {
  const [screen, setScreen] = useState("loading");
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("home");
  const [quizResult, setQuizResult] = useState(null);

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        setUser(session.user);
        setScreen("app");
      } else {
        setScreen("login");
      }
    })();
  }, []);

  const handleLogin = async () => {
    setError("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password: senha,
    });

    if (error) {
      setError("E-mail ou senha incorretos");
      return;
    }

    setUser(data.user);
    setScreen("app");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setScreen("login");
  };

  // LOADING
  if (screen === "loading") {
    return <div style={{ minHeight: "100vh", background: C.bg }} />;
  }

  // LOGIN (CORRIGIDO)
  if (screen === "login") {
    return (
      <div style={{
        minHeight: "100vh",
        background: C.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <div style={{
          width: 320,
          padding: 28,
          background: C.card,
          borderRadius: 16,
          border: `1px solid ${C.border}`
        }}>
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <LogoSymbol size={40} />
            <h1 style={{ fontFamily: MN }}>
              compara<span style={{ color: C.accent }}>invest</span>
            </h1>
          </div>

          {error && (
            <div style={{ color: "red", fontSize: 12, marginBottom: 10 }}>
              {error}
            </div>
          )}

          <input
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: "100%", marginBottom: 10, padding: 10 }}
          />

          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            style={{ width: "100%", marginBottom: 14, padding: 10 }}
          />

          <button
            onClick={handleLogin}
            style={{
              width: "100%",
              padding: 12,
              background: C.accent,
              border: "none",
              borderRadius: 10,
              fontWeight: 600
            }}
          >
            Entrar
          </button>
        </div>
      </div>
    );
  }

  // APP
  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text }}>

      {/* HEADER */}
      <div style={{
        padding: "20px 28px",
        borderBottom: `1px solid ${C.border}`,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <div
          onClick={() => setTab("home")}
          style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}
        >
          <LogoSymbol size={22} />
          <h1 style={{ fontFamily: MN, fontSize: 20 }}>
            compara<span style={{ color: C.accent }}>invest</span>
          </h1>
        </div>

        <button onClick={handleLogout} style={{ fontSize: 12 }}>
          Sair
        </button>
      </div>

      {/* NAV */}
      <div style={{ display: "flex", gap: 12, padding: 16 }}>
        {[
          { id: "home", icon: <IconHome size={16} />, label: "Início" },
          { id: "comparadores", icon: <IconComparar size={16} />, label: "Comparar" },
          { id: "acoes", icon: <IconAcoes size={16} />, label: "Ações" },
          { id: "fiis", icon: <IconFIIs size={16} />, label: "FIIs" },
          { id: "rf", icon: <IconRendaFixa size={16} />, label: "RF" },
          { id: "carteira", icon: <IconCarteira size={16} />, label: "Carteira" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 12px",
              background: "transparent",
              border: "none",
              color: tab === t.id ? C.accent : C.textDim,
              borderBottom: tab === t.id ? `2px solid ${C.accent}` : "none",
              cursor: "pointer"
            }}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <div style={{ padding: 24 }}>
        {tab === "home" && <HomePage user={user} />}
        {tab === "comparadores" && <ComparatorPage user={user} />}
        {tab === "acoes" && <ComparatorPage user={user} />}
        {tab === "fiis" && <ComparatorPage user={user} />}
        {tab === "rf" && <ComparadorRF user={user} />}
        {tab === "carteira" && <CarteiraFicticia user={user} />}
        {tab === "admin" && <AdminDashboard />}

        {tab === "quiz" && (
          <PhilosophyQuiz
            onComplete={(res) => {
              setQuizResult(res);
              setTab("quiz-result");
            }}
          />
        )}

        {tab === "quiz-result" && (
          <PhilosophyResult
            result={quizResult}
            onContinue={() => setTab("comparadores")}
          />
        )}
      </div>

      {/* FOOTER */}
      <div style={{
        textAlign: "center",
        fontSize: 10,
        padding: 16,
        color: C.textMuted,
        borderTop: `1px solid ${C.border}`
      }}>
        comparainvest v3.0
      </div>

    </div>
  );
}
}
