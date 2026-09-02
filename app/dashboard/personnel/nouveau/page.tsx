"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import RequireRole from "../../../components/RequireRole";

function NouveauPersonnelForm() {
  const [form, setForm] = useState({
    username: "",
    password: "",
    role: "secretaire",
    nom: "",
    prenom: "",
    email: "",
  });
  const [message, setMessage] = useState("");
  const router = useRouter();

  const roles = [
    { value: "coordonnateur", label: "Coordonnateur" },
    { value: "secretaire", label: "Secrétaire" },
    { value: "responsable_evenementiel", label: "Responsable événementiel" },
    { value: "responsable_commerciale", label: "Responsable commerciale" },
    { value: "superviseur", label: "Superviseur" },
    { value: "animateur_projet", label: "Animateur de projet" },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    const res = await fetch("/api/personnel/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Erreur");
      return;
    }

    setMessage(`Compte créé : ${data.username} (${data.role})`);
    setTimeout(() => router.push("/dashboard"), 1500);
  }

  function updateField(field: string, value: string) {
    setForm({ ...form, [field]: value });
  }

  return (
    <main style={{
      minHeight: "100vh",
      backgroundColor: "#0f172a",
      color: "white",
      padding: "2rem",
      display: "flex",
      justifyContent: "center",
    }}>
      <form onSubmit={handleSubmit} style={{
        backgroundColor: "#1e293b",
        padding: "2rem",
        borderRadius: "12px",
        width: "100%",
        maxWidth: "420px",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        height: "fit-content",
      }}>
        <h1 style={{ fontSize: "1.4rem", fontWeight: "bold", margin: 0 }}>
          Créer un compte personnel
        </h1>

        <div>
          <label>Nom</label>
          <input value={form.nom} onChange={(e) => updateField("nom", e.target.value)}
            style={inputStyle} />
        </div>
        <div>
          <label>Prénom</label>
          <input value={form.prenom} onChange={(e) => updateField("prenom", e.target.value)}
            style={inputStyle} />
        </div>
        <div>
          <label>Email</label>
          <input type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)}
            style={inputStyle} />
        </div>
        <div>
          <label>Rôle</label>
          <select value={form.role} onChange={(e) => updateField("role", e.target.value)}
            style={inputStyle}>
            {roles.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Identifiant</label>
          <input value={form.username} onChange={(e) => updateField("username", e.target.value)}
            style={inputStyle} />
        </div>
        <div>
          <label>Mot de passe</label>
          <input type="password" value={form.password} onChange={(e) => updateField("password", e.target.value)}
            style={inputStyle} />
        </div>

        {message && <p style={{ color: message.startsWith("Compte créé") ? "#4ade80" : "#f87171" }}>{message}</p>}

        <button type="submit" style={{
          padding: "0.7rem",
          borderRadius: "6px",
          border: "none",
          backgroundColor: "#3b82f6",
          color: "white",
          fontWeight: "bold",
          cursor: "pointer",
        }}>
          Créer le compte
        </button>
      </form>
    </main>
  );
}

export default function NouveauPersonnel() {
  return (
    <RequireRole allowed={["directeur"]}>
      <NouveauPersonnelForm />
    </RequireRole>
  );
}

const inputStyle = {
  width: "100%",
  padding: "0.5rem",
  borderRadius: "6px",
  border: "1px solid #334155",
  backgroundColor: "#0f172a",
  color: "white",
  boxSizing: "border-box" as const,
  marginTop: "0.3rem",
};