"use client";

import { useEffect, useState } from "react";
import { Users, Calendar, Pencil, Check, X } from "lucide-react";
import RequireRole from "../../../components/RequireRole";
import Sidebar from "../../../components/Sidebar";
import Topbar from "../../../components/Topbar";
import Avatar from "../../../components/Avatar";

const GREEN = "#16a34a";

type Entretien = {
  id: string;
  dateEntretien: string;
  notes: string | null;
  statut: "PREVU" | "REALISE" | "ANNULE";
  candidat: {
    id: string;
    nom: string;
    prenom: string;
    photoPath: string | null;
    posteRecherche: string;
    telephone: string;
  };
};

const STATUT_LABELS: Record<string, string> = {
  PREVU: "Prévu",
  REALISE: "Réalisé",
  ANNULE: "Annulé",
};

const STATUT_COLORS: Record<string, string> = {
  PREVU: "text-yellow-400",
  REALISE: "text-emerald-400",
  ANNULE: "text-red-400",
};

function EntretiensContent() {
  const [entretiens, setEntretiens] = useState<Entretien[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState<string>("");

  const charger = () => {
    setLoading(true);
    fetch("/api/entretiens")
      .then((res) => res.json())
      .then((data) => setEntretiens(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    charger();
  }, []);

  const startEdit = (e: Entretien) => {
    setEditingId(e.id);
    setEditDate(new Date(e.dateEntretien).toISOString().slice(0, 16));
  };

  const saveDate = async (id: string) => {
    await fetch(`/api/entretiens/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dateEntretien: editDate }),
    });
    setEditingId(null);
    charger();
  };

  const changerStatut = async (id: string, statut: string) => {
    await fetch(`/api/entretiens/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ statut }),
    });
    charger();
  };

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      <Sidebar active="entretiens" />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <div className="p-6">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-lg bg-emerald-600/15 flex items-center justify-center">
              <Users size={17} style={{ color: GREEN }} />
            </div>
            <h1 className="text-[22px] font-bold text-white">Entretiens d&apos;Embauche</h1>
          </div>
          <p className="text-slate-500 text-[12px] mb-5 ml-11">
            Liste des entretiens planifiés et réalisés
          </p>

          <div className="bg-[#111827] rounded-xl border border-white/5 overflow-hidden">
            {loading ? (
              <p className="text-slate-400 p-6 text-[13px]">Chargement...</p>
            ) : entretiens.length === 0 ? (
              <div className="p-10 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-600/15 flex items-center justify-center mb-3">
                  <Users size={22} style={{ color: GREEN }} />
                </div>
                <p className="text-white text-[13px] font-medium">Aucun entretien pour le moment</p>
                <p className="text-slate-500 text-[12px] mt-1">
                  Les entretiens d&apos;embauche planifiés s&apos;afficheront ici.
                </p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="text-slate-400 text-[11px] tracking-wide border-b border-white/5">
                    <th className="py-3 px-4 font-medium">Candidat</th>
                    <th className="py-3 px-4 font-medium">Poste recherché</th>
                    <th className="py-3 px-4 font-medium">Date entretien</th>
                    <th className="py-3 px-4 font-medium">Statut</th>
                    <th className="py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {entretiens.map((e) => (
                    <tr key={e.id} className="border-b border-white/5 last:border-0 text-[12.5px]">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Avatar photoPath={e.candidat.photoPath} nom={e.candidat.nom} prenom={e.candidat.prenom} />
                          <span className="text-white">{e.candidat.nom} {e.candidat.prenom}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-300">{e.candidat.posteRecherche}</td>
                      <td className="py-3 px-4 text-slate-300">
                        {editingId === e.id ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="datetime-local"
                              value={editDate}
                              onChange={(ev) => setEditDate(ev.target.value)}
                              className="bg-black/30 border border-white/10 rounded px-2 py-1 text-[11px] text-slate-300 outline-none [color-scheme:dark]"
                            />
                            <button onClick={() => saveDate(e.id)} title="Enregistrer">
                              <Check size={14} className="text-emerald-400" />
                            </button>
                            <button onClick={() => setEditingId(null)} title="Annuler">
                              <X size={14} className="text-red-400" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Calendar size={12} className="text-slate-500" />
                            {new Date(e.dateEntretien).toLocaleString("fr-FR", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                            <button onClick={() => startEdit(e)} title="Modifier la date">
                              <Pencil size={12} className="text-slate-500 hover:text-white" />
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-medium ${STATUT_COLORS[e.statut]}`}>
                          {STATUT_LABELS[e.statut]}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {e.statut === "PREVU" && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => changerStatut(e.id, "REALISE")}
                              className="text-[11px] text-emerald-400 hover:underline"
                            >
                              Marquer réalisé
                            </button>
                            <button
                              onClick={() => changerStatut(e.id, "ANNULE")}
                              className="text-[11px] text-red-400 hover:underline"
                            >
                              Annuler
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EntretiensPage() {
  return (
    <RequireRole allowed={["directeur", "coordonnateur", "secretaire"]}>
      <EntretiensContent />
    </RequireRole>
  );
}