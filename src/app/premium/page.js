"use client";
import { useEffect } from "react";

export default function PremiumPage() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://js.stripe.com/v3/pricing-table.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0D1117",
        padding: 24,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <stripe-pricing-table
        pricing-table-id="prctbl_1TJkxFEq3sTdx3YetAT7EHWb"
        publishable-key="pk_live_51TGkEDEq3sTdx3Ye2XAWCdPXmRl1YCu5q9aTXZrDfkMEFR9CeKzQ2ZwfYvn2Eo4umEbSM7yuoLuSwsaF9xNQcF4w00S15s1XTU"
      />
    </div>
  );
}
