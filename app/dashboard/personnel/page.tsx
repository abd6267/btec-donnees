"use client";

import { useEffect, useState } from "react";
import RequireRole from "../../components/RequireRole";

type Compte = {
  id: string;
  username: string;
  nom: string | null;
  prenom: string | null;
  email: string | null;
  role: string;
  actif: boolean;
};

const ROLE_LABELS: Record<string, string> = {
  directeur: "Directeur",
  coordonnateur: "Coordonnateur",
  secretaire: "Secrétaire",
  responsable_evenementiel: "Responsable événementiel",
  responsable_commerciale: "Responsable commerciale",
  superviseur: "Superviseur",
  animateur_projet: "Animateur de projet",
};

function PersonnelListContent() {
  const [comptes, setComptes] = useState<Compte[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/personnel/list")
      .then((res) => res.json())
      .then((data) => {
        setComptes(data);
        setLoading(false);
      });
  }, []);

  return (
    <main style={{
      minHeight: "100vh",
      backgroundColor: "#0f172a",
      color: "white",
      padding: "2rem",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "bold", color: "#facc15", margin: 0 }}>
          Comptes personnel
        </h1>
        <a href="/dashboard/personnel/nouveau" style={{
          padding: "0.6rem 1rem",
          borderRadius: "6px",
          backgroundColor: "#3b82f6",
          color: "white",
          textDecoration: "none",
          fontWeight: "bold",
        }}>
          + Nouveau compte
        </a>
      </div>

      {loading ? (
        <p style={{ color: "#94a3b8" }}>Chargement...</p>
      ) : comptes.length === 0 ? (
        <p style={{ color: "#94a3b8" }}>Aucun compte pour l&apos;instant.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid #334155" }}>
              <th style={{ padding: "0.6rem" }}>Nom</th>
              <th style={{ padding: "0.6rem" }}>Identifiant</th>
              <th style={{ padding: "0.6rem" }}>Email</th>
              <th style={{ padding: "0.6rem" }}>Rôle</th>
              <th style={{ padding: "0.6rem" }}>Statut</th>
            </tr>
          </thead>
          <tbody>
            {comptes.map((c) => (
              <tr key={c.id} style={{ borderBottom: "1px solid #1e293b" }}>
                <td style={{ padding: "0.6rem" }}>{c.nom} {c.prenom}</td>
                <td style={{ padding: "0.6rem" }}>{c.username}</td>
                <td style={{ padding: "0.6rem" }}>{c.email}</td>
                <td style={{ padding: "0.6rem" }}>{ROLE_LABELS[c.role] || c.role}</td>
                <td style={{ padding: "0.6rem" }}>
                  <span style={{ color: c.actif ? "#4ade80" : "#f87171" }}>
                    {c.actif ? "Actif" : "Inactif"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}

export default function PersonnelListPage() {
  return (
    <RequireRole allowed={["directeur"]}>
      <PersonnelListContent />
    </RequireRole>
  );
}