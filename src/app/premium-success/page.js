"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PremiumSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/");
    }, 2500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0D1117",
        color: "#E6EDF3",
        fontSize: 16,
        textAlign: "center",
        padding: 24,
      }}
    >
      <div>
        <div style={{ fontSize: 28, marginBottom: 12 }}>✅</div>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>
          Pagamento confirmado
        </div>
        <div style={{ opacity: 0.8 }}>
          Pagamento confirmado 🎉
Seu acesso premium está sendo ativado...
        </div>
      </div>
    </div>
  );
}
