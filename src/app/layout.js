import { Outfit, JetBrains_Mono } from "next/font/google";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata = {
  title: "compara.ai — Comparador de Ativos B3",
  description: "Compare ações e FIIs da B3 com indicadores fundamentalistas, ranking automático e análise visual.",
  manifest: "/manifest.json",
  themeColor: "#00E5A0",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={`${outfit.variable} ${jetbrains.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      </head>
      <body style={{ margin: 0, padding: 0, background: "#06090F", color: "#E2E8F0", fontFamily: "var(--font-outfit), sans-serif" }}>
        <style>{`
          @keyframes spin{to{transform:rotate(360deg)}}
          @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
          @keyframes glow{0%,100%{box-shadow:0 0 8px rgba(0,229,160,.3)}50%{box-shadow:0 0 20px rgba(0,229,160,.6)}}
          ::-webkit-scrollbar{width:5px;height:5px}
          ::-webkit-scrollbar-track{background:transparent}
          ::-webkit-scrollbar-thumb{background:#1B2433;border-radius:4px}
          input::placeholder{color:#3E4C5E}
          *{box-sizing:border-box}
        `}</style>
        {children}
      </body>
    </html>
  );
}
