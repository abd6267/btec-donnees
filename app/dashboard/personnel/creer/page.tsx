"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserCog, Save } from "lucide-react";
import RequireRole from "../../../components/RequireRole";
import Sidebar from "../../../components/Sidebar";
import Topbar from "../../../components/Topbar";

const GREEN = "#16a34a";

const FONCTIONS = [
  "Administrateur",
  "RH",
  "Comptable",
  "Commercial",
  "Responsable Formation",
  "Secrétaire",
];

const ROLES = [
  { value: "directeur", label: "Directeur (accès complet)" },
  { value: "coordonnateur", label: "Coordonnateur" },
  { value: "secretaire", label: "Secrétaire" },
];

function CreerCompteContent() {
  const router = useRouter();
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [fonction, setFonction] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("secretaire");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const creer = async () => {
    if (!username || !password || !role) {
      setError("Login, mot de passe et niveau d'accès sont obligatoires.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/personnel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom, prenom, fonction, username, password, email, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erreur lors de la création du compte.");
        return;
      }
      setSuccess(true);
      setTimeout(() => router.push("/dashboard/personnel/modifier"), 800);
    } catch {
      setError("Impossible de contacter le serveur.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      <Sidebar active="creer-compte" />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <div className="p-6 max-w-xl">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-lg bg-emerald-600/15 flex items-center justify-center">
              <UserCog size={17} style={{ color: GREEN }} />
            </div>
            <h1 className="text-[22px] font-bold text-white">Créer un Compte</h1>
          </div>
          <p className="text-slate-500 text-[12px] mb-5 ml-11">
            Ajouter un membre du personnel (Administrateur, RH, Comptable, Commercial, Responsable Formation, Secrétaire)
          </p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-[12.5px] rounded-lg p-3 mb-4">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[12.5px] rounded-lg p-3 mb-4">
              Compte créé avec succès.
            </div>
          )}

          <div className="bg-[#111827] rounded-xl border border-white/5 p-5 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Nom</label>
                <input
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-[13px] text-white outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Prénom</label>
                <input
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-[13px] text-white outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Fonction</label>
              <select
                value={fonction}
                onChange={(e) => setFonction(e.target.value)}
                className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-[13px] text-white outline-none"
              >
                <option value="">Sélectionner...</option>
                {FONCTIONS.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-[13px] text-white outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Login</label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-[13px] text-white outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Mot de passe</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-[13px] text-white outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Niveau d&apos;accès</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-[13px] text-white outline-none"
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-5">
            <button
              onClick={() => router.push("/dashboard")}
              className="px-4 py-2 rounded-lg text-[13px] text-slate-300 hover:bg-white/5"
            >
              Annuler
            </button>
            <button
              onClick={creer}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold text-white disabled:opacity-50"
              style={{ backgroundColor: GREEN }}
            >
              <Save size={14} /> {saving ? "Création..." : "Créer le compte"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CreerComptePage() {
  return (
    <RequireRole allowed={["directeur"]}>
      <CreerCompteContent />
    </RequireRole>
  );
}