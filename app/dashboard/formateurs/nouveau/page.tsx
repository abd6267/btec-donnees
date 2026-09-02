"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import RequireRole from "../../../components/RequireRole";

function NouveauFormateurForm() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    dateNaissance: "",
    lieuNaissance: "",
    adresseResidence: "",
    email: "",
    telephone: "",
    niveauEtude: "",
    filiere: "",
    entiteDiplome: "",
    moyenDeplacement: "false",
    typeContrat: "",
  });

  function updateField(field: string, value: string) {
    setForm({ ...form, [field]: value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    const res = await fetch("/api/formateurs/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Erreur");
      return;
    }

    setMessage(`Formateur créé : ${data.matricule}`);
    setTimeout(() => router.push("/dashboard/formateurs"), 1500);
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
        maxWidth: "600px",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        height: "fit-content",
      }}>
        <h1 style={{ fontSize: "1.4rem", fontWeight: "bold", margin: 0, color: "#facc15" }}>
          Nouveau formateur
        </h1>

        <Row>
          <Field label="Nom" value={form.nom} onChange={(v) => updateField("nom", v)} />
          <Field label="Prénom" value={form.prenom} onChange={(v) => updateField("prenom", v)} />
        </Row>
        <Row>
          <Field label="Date de naissance" type="date" value={form.dateNaissance} onChange={(v) => updateField("dateNaissance", v)} />
          <Field label="Lieu de naissance" value={form.lieuNaissance} onChange={(v) => updateField("lieuNaissance", v)} />
        </Row>
        <Field label="Adresse de résidence" value={form.adresseResidence} onChange={(v) => updateField("adresseResidence", v)} />
        <Row>
          <Field label="Email" type="email" value={form.email} onChange={(v) => updateField("email", v)} />
          <Field label="Téléphone" value={form.telephone} onChange={(v) => updateField("telephone", v)} />
        </Row>
        <Row>
          <Field label="Niveau d'étude" value={form.niveauEtude} onChange={(v) => updateField("niveauEtude", v)} />
          <Field label="Filière" value={form.filiere} onChange={(v) => updateField("filiere", v)} />
        </Row>
        <Field label="Entité ayant délivré le dernier diplôme" value={form.entiteDiplome} onChange={(v) => updateField("entiteDiplome", v)} />
        <Row>
          <div style={{ flex: 1 }}>
            <label>Moyen de déplacement</label>
            <select value={form.moyenDeplacement} onChange={(e) => updateField("moyenDeplacement", e.target.value)} style={inputStyle}>
              <option value="false">Non</option>
              <option value="true">Oui</option>
            </select>
          </div>
          <Field label="Type de contrat" value={form.typeContrat} onChange={(v) => updateField("typeContrat", v)} />
        </Row>

        {message && <p style={{ color: message.startsWith("Formateur créé") ? "#4ade80" : "#f87171" }}>{message}</p>}

        <button type="submit" style={{
          padding: "0.7rem",
          borderRadius: "6px",
          border: "none",
          backgroundColor: "#3b82f6",
          color: "white",
          fontWeight: "bold",
          cursor: "pointer",
          marginTop: "0.5rem",
        }}>
          Enregistrer le formateur
        </button>
      </form>
    </main>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "flex", gap: "1rem" }}>{children}</div>;
}

function Field({ label, value, onChange, type = "text" }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div style={{ flex: 1 }}>
      <label>{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} style={inputStyle} />
    </div>
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

export default function NouveauFormateurPage() {
  return (
    <RequireRole allowed={["directeur", "coordonnateur"]}>
      <NouveauFormateurForm />
    </RequireRole>
  );
}