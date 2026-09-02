"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Erreur de connexion");
      return;
    }

    localStorage.setItem("btec_role", data.role);
    localStorage.setItem("btec_username", username);
    window.location.href = "/dashboard";
  }

  return (
    <main style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#0f172a",
      color: "white",
      padding: "2rem",
    }}>
      <h1 style={{ fontSize: "2.5rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
        BTEC Données
      </h1>
      <p style={{ fontSize: "1.1rem", color: "#94a3b8", marginBottom: "2rem", textAlign: "center", maxWidth: "500px" }}>
        Plateforme de gestion des données administratives de BTEC
      </p>

      <form onSubmit={handleSubmit} style={{
        backgroundColor: "#1e293b",
        padding: "2rem",
        borderRadius: "12px",
        width: "100%",
        maxWidth: "360px",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
      }}>
        <div>
          <label style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.9rem" }}>
            Identifiant
          </label>
          <input
            type="text"
            placeholder="Votre identifiant"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              width: "100%",
              padding: "0.6rem",
              borderRadius: "6px",
              border: "1px solid #334155",
              backgroundColor: "#0f172a",
              color: "white",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.9rem" }}>
            Mot de passe
          </label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "0.6rem",
              borderRadius: "6px",
              border: "1px solid #334155",
              backgroundColor: "#0f172a",
              color: "white",
              boxSizing: "border-box",
            }}
          />
        </div>

        {error && (
          <p style={{ color: "#f87171", fontSize: "0.9rem", margin: 0 }}>{error}</p>
        )}

        <button
          type="submit"
          style={{
            marginTop: "0.5rem",
            padding: "0.7rem",
            borderRadius: "6px",
            border: "none",
            backgroundColor: "#3b82f6",
            color: "white",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Se connecter
        </button>
      </form>
    </main>
  );
}