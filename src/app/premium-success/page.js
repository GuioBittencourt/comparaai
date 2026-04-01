"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function PremiumSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    async function ativarPremium() {
      const { data } = await supabase.auth.getUser();
      const user = data?.user;

      if (!user) {
        router.push("/");
        return;
      }

      await supabase
        .from("profiles")
        .update({ is_premium: true })
        .eq("id", user.id);

      router.push("/");
    }

    ativarPremium();
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
      }}
    >
      Ativando seu Premium...
    </div>
  );
}
