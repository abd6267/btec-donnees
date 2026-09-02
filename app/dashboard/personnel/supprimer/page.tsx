"use client";

import { useEffect, useState } from "react";
import { Trash2, X, UserCog, AlertTriangle } from "lucide-react";
import RequireRole from "../../../components/RequireRole";
import Sidebar from "../../../components/Sidebar";
import Topbar from "../../../components/Topbar";

const GREEN = "#16a34a";

type User = {
  id: string;
  username: string;
  nom: string | null;
  prenom: string | null;
  role: string;
  fonction: string | null;
};

function SupprimerCompteContent() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
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

  const supprimer = async () => {
    if (!confirmId) return;
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/personnel/${confirmId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erreur lors de la suppression.");
        return;
      }
      setConfirmId(null);
      charger();
    } catch {
      setError("Impossible de contacter le serveur.");
    } finally {
      setDeleting(false);
    }
  };

  const userAConfirmer = users.find((u) => u.id === confirmId) || null;

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      <Sidebar active="suppr-compte" />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <div className="p-6">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-lg bg-emerald-600/15 flex items-center justify-center">
              <UserCog size={17} style={{ color: GREEN }} />
            </div>
            <h1 className="text-[22px] font-bold text-white">Supprimer un Compte</h1>
          </div>
          <p className="text-slate-500 text-[12px] mb-5 ml-11">
            Attention : la suppression d&apos;un compte est définitive
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
                        <button
                          onClick={() => { setConfirmId(u.id); setError(null); }}
                          className="flex items-center gap-1 text-[11px] text-red-400 hover:underline"
                        >
                          <Trash2 size={12} /> Supprimer
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

      {userAConfirmer && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111827] border border-white/10 rounded-xl w-full max-w-sm p-6">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={18} className="text-red-400" />
              <h2 className="text-white font-semibold text-[15px]">Confirmer la suppression</h2>
            </div>
            <p className="text-slate-300 text-[13px] mb-4">
              Voulez-vous vraiment supprimer le compte de <strong>{userAConfirmer.nom} {userAConfirmer.prenom}</strong> ({userAConfirmer.username}) ? Cette action est irréversible.
            </p>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-[12px] rounded-lg p-3 mb-3">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button onClick={() => setConfirmId(null)} className="px-4 py-2 rounded-lg text-[13px] text-slate-300 hover:bg-white/5">
                Annuler
              </button>
              <button
                onClick={supprimer}
                disabled={deleting}
                className="px-4 py-2 rounded-lg text-[13px] font-semibold text-white bg-red-600 disabled:opacity-50"
              >
                {deleting ? "Suppression..." : "Supprimer définitivement"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SupprimerComptePage() {
  return (
    <RequireRole allowed={["directeur"]}>
      <SupprimerCompteContent />
    </RequireRole>
  );
}
