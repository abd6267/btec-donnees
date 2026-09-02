"use client";

import { useEffect, useState } from "react";
import { Pencil, X, Save, UserCog } from "lucide-react";
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

type User = {
  id: string;
  username: string;
  nom: string | null;
  prenom: string | null;
  email: string | null;
  role: string;
  fonction: string | null;
  actif: boolean;
  derniereConnexion: string | null;
};

function ModifierCompteContent() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [editId, setEditId] = useState<string | null>(null);
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [fonction, setFonction] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("secretaire");
  const [actif, setActif] = useState(true);
  const [nouveauPassword, setNouveauPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const charger = () => {
    setLoading(true);
    fetch("/api/personnel/list")
      .then((r) => r.json())
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    charger();
  }, []);

  const ouvrirEdition = (u: User) => {
    setEditId(u.id);
    setNom(u.nom || "");
    setPrenom(u.prenom || "");
    setFonction(u.fonction || "");
    setEmail(u.email || "");
    setRole(u.role);
    setActif(u.actif);
    setNouveauPassword("");
    setError(null);
  };

  const enregistrer = async () => {
    if (!editId) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/personnel/${editId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom, prenom, fonction, email, role, actif,
          password: nouveauPassword || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erreur lors de la mise à jour.");
        return;
      }
      setEditId(null);
      charger();
    } catch {
      setError("Impossible de contacter le serveur.");
    } finally {
      setSaving(false);
    }
  };

  const editUser = users.find((u) => u.id === editId) || null;

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      <Sidebar active="modifier-compte" />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <div className="p-6">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-lg bg-emerald-600/15 flex items-center justify-center">
              <UserCog size={17} style={{ color: GREEN }} />
            </div>
            <h1 className="text-[22px] font-bold text-white">Modifier un Compte</h1>
          </div>
          <p className="text-slate-500 text-[12px] mb-5 ml-11">
            Liste du personnel — cliquez sur le crayon pour modifier un compte
          </p>

          <div className="bg-[#111827] rounded-xl border border-white/5 overflow-hidden">
            {loading ? (
              <p className="text-slate-400 p-6 text-[13px]">Chargement...</p>
            ) : users.length === 0 ? (
              <p className="text-slate-500 text-[12px] p-6">Aucun compte pour le moment.</p>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="text-slate-400 text-[11px] tracking-wide border-b border-white/5">
                    <th className="py-3 px-4 font-medium">Nom</th>
                    <th className="py-3 px-4 font-medium">Fonction</th>
                    <th className="py-3 px-4 font-medium">Login</th>
                    <th className="py-3 px-4 font-medium">Niveau d&apos;accès</th>
                    <th className="py-3 px-4 font-medium">Statut</th>
                    <th className="py-3 px-4 font-medium">Dernière connexion</th>
                    <th className="py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-white/5 last:border-0 text-[12.5px]">
                      <td className="py-3 px-4 text-white">{u.nom} {u.prenom}</td>
                      <td className="py-3 px-4 text-slate-300">{u.fonction || "—"}</td>
                      <td className="py-3 px-4 text-slate-300">{u.username}</td>
                      <td className="py-3 px-4 text-slate-300">{u.role}</td>
                      <td className="py-3 px-4">
                        <span className={u.actif ? "text-emerald-400" : "text-red-400"}>
                          {u.actif ? "Actif" : "Inactif"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {u.derniereConnexion ? new Date(u.derniereConnexion).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" }) : "Jamais connecté"}
                      </td>
                      <td className="py-3 px-4">
                        <button onClick={() => ouvrirEdition(u)} title="Modifier">
                          <Pencil size={13} className="text-slate-500 hover:text-white" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {editUser && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111827] border border-white/10 rounded-xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold text-[15px]">
                Modifier — {editUser.username}
              </h2>
              <button onClick={() => setEditId(null)}>
                <X size={16} className="text-slate-400 hover:text-white" />
              </button>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-[12px] rounded-lg p-3 mb-3">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Nom</label>
                  <input value={nom} onChange={(e) => setNom(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-[13px] text-white outline-none" />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Prénom</label>
                  <input value={prenom} onChange={(e) => setPrenom(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-[13px] text-white outline-none" />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Fonction</label>
                <select value={fonction} onChange={(e) => setFonction(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-[13px] text-white outline-none">
                  <option value="">—</option>
                  {FONCTIONS.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-[13px] text-white outline-none" />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Niveau d&apos;accès</label>
                <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-[13px] text-white outline-none">
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Nouveau mot de passe (laisser vide pour ne pas changer)</label>
                <input type="password" value={nouveauPassword} onChange={(e) => setNouveauPassword(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-[13px] text-white outline-none" />
              </div>

              <label className="flex items-center gap-2 text-[12px] text-slate-300">
                <input type="checkbox" checked={actif} onChange={(e) => setActif(e.target.checked)} />
                Compte actif
              </label>
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setEditId(null)} className="px-4 py-2 rounded-lg text-[13px] text-slate-300 hover:bg-white/5">
                Annuler
              </button>
              <button
                onClick={enregistrer}
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold text-white disabled:opacity-50"
                style={{ backgroundColor: GREEN }}
              >
                <Save size={14} /> {saving ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ModifierComptePage() {
  return (
    <RequireRole allowed={["directeur"]}>
      <ModifierCompteContent />
    </RequireRole>
  );
}