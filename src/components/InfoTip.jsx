"use client";
import { useState } from "react";
import { C, FN } from "@/lib/theme";

export default function InfoTip({ text }) {
  const [show, setShow] = useState(false);
  return (
    <span style={{ position: "relative", display: "inline-flex", marginLeft: 5 }}>
      <span
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          width: 15, height: 15, borderRadius: "50%", fontSize: 9,
          color: C.textMuted, border: `1px solid ${C.border}`, cursor: "help", flexShrink: 0,
        }}
      >i</span>
      {show && (
        <span style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0, width: 250,
          padding: "10px 12px", background: "#1a2235", border: `1px solid ${C.borderLight}`,
          borderRadius: 10, fontSize: 11, lineHeight: 1.6, color: "#94A3B8",
          boxShadow: "0 12px 40px rgba(0,0,0,0.7)", zIndex: 200,
          pointerEvents: "none", fontFamily: FN,
        }}>{text}</span>
      )}
    </span>
  );
}
