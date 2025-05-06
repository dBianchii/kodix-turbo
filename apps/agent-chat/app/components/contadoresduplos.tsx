"use client";

import { useState } from "react";

/* ────────────────────────────────────────────── */
/*   Componente genérico: recebe um título        */
/*   e mantém seu próprio placar interno.         */
/* ────────────────────────────────────────────── */
function PlacarComBotao({ titulo }: { titulo: string }) {
  const [contagem, setContagem] = useState(0);

  const incrementar = () => {
    setContagem((prev) => prev + 1); 
    setContagem((prev) => prev + 1);
  };

  return (
    <div
      style={{
        border: "1px solid #444",
        borderRadius: 8,
        padding: 16,
        margin: 12,
        width: 180,
        textAlign: "center",
      }}
    >
      <h3>{titulo}</h3>
      <p style={{ fontSize: 24 }}>{contagem}</p>
      <button onClick={incrementar}>+1</button>
    </div>
  );
}

/* ────────────────────────────────────────────── */
/*   Tela principal com DOIS placares             */
/* ────────────────────────────────────────────── */
export default function ContadoresDuplos() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: 24,
        marginTop: 32,
      }}
    >
      <PlacarComBotao titulo="Placar A" />
      <PlacarComBotao titulo="Placar B" />
    </div>
  );
}
