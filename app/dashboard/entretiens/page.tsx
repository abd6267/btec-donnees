"use client";

import { useEffect, useState } from "react";
import { Users, Calendar, Pencil, Check, X, ClipboardList } from "lucide-react";
import RequireRole from "../../components/RequireRole";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import Avatar from "../../components/Avatar";

const GREEN = "#16a34a";

type Entretien = {
  id: string;
  dateEntretien: string;
  notes: string | null;
  statut: "PREVU" | "REALISE" | "ANNULE";
  responsableRH: string | null;
  note: number | null;
  resultat: "ADMIS" | "AJOURNE" | "REFUSE" | null;
  compteRendu: string | null;
  forces: string | null;
  faiblesses: string | null;
  recommandations: string | null;
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

const RESULTAT_LABELS: Record<string, string> = {
  ADMIS: "Admis",
  AJOURNE: "Ajourné",
  REFUSE: "Refusé",
};

const RESULTAT_COLORS: Record<string, string> = {
  ADMIS: "text-emerald-400",
  AJOURNE: "text-yellow-400",
  REFUSE: "text-red-400",
};

function EntretiensContent() {
  const [entretiens, setEntretiens] = useState<Entretien[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState<string>("");

  // Modal d'évaluation
  const [evalId, setEvalId] = useState<string | null>(null);
  const [evalResponsableRH, setEvalResponsableRH] = useState("");
  const [evalNote, setEvalNote] = useState("");
  const [evalResultat, setEvalResultat] = useState<"ADMIS" | "AJOURNE" | "REFUSE" | "">("");
  const [evalCompteRendu, setEvalCompteRendu] = useState("");
  const [evalForces, setEvalForces] = useState("");
  const [evalFaiblesses, setEvalFaiblesses] = useState("");
  const [evalRecommandations, setEvalRecommandations] = useState("");
  const [saving, setSaving] = useState(false);

  const charger = () => {
    setLoading(true);
    fetch("/api/entretiens/list")
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

  const openEval = (e: Entretien) => {
    setEvalId(e.id);
    setEvalResponsableRH(e.responsableRH ?? "");
    setEvalNote(e.note != null ? String(e.note) : "");
    setEvalResultat(e.resultat ?? "");
    setEvalCompteRendu(e.compteRendu ?? "");
    setEvalForces(e.forces ?? "");
    setEvalFaiblesses(e.faiblesses ?? "");
    setEvalRecommandations(e.recommandations ?? "");
  };

  const closeEval = () => setEvalId(null);

  const saveEval = async () => {
    if (!evalId) return;
    setSaving(true);
    try {
      await fetch(`/api/entretiens/${evalId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          responsableRH: evalResponsableRH || null,
          note: evalNote !== "" ? parseFloat(evalNote) : null,
          resultat: evalResultat || null,
          compteRendu: evalCompteRendu || null,
          forces: evalForces || null,
          faiblesses: evalFaiblesses || null,
          recommandations: evalRecommandations || null,
        }),
      });
      closeEval();
      charger();
    } finally {
      setSaving(false);
    }
  };

  const evalEntretien = entretiens.find((e) => e.id === evalId) || null;

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
                    <th className="py-3 px-4 font-medium">Responsable RH</th>
                    <th className="py-3 px-4 font-medium">Statut</th>
                    <th className="py-3 px-4 font-medium">Note/20</th>
                    <th className="py-3 px-4 font-medium">Résultat</th>
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
                      <td className="py-3 px-4 text-slate-300">
                        {e.responsableRH || <span className="text-slate-600">—</span>}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-medium ${STATUT_COLORS[e.statut]}`}>
                          {STATUT_LABELS[e.statut]}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {e.note != null ? e.note : <span className="text-slate-600">—</span>}
                      </td>
                      <td className="py-3 px-4">
                        {e.resultat ? (
                          <span className={`font-medium ${RESULTAT_COLORS[e.resultat]}`}>
                            {RESULTAT_LABELS[e.resultat]}
                          </span>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          {e.statut === "PREVU" && (
                            <>
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
                            </>
                          )}
                          <button
                            onClick={() => openEval(e)}
                            className="flex items-center gap-1 text-[11px] text-blue-400 hover:underline"
                          >
                            <ClipboardList size={12} />
                            Évaluer
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {evalEntretien && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111827] border border-white/10 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold text-[15px]">
                Évaluation — {evalEntretien.candidat.nom} {evalEntretien.candidat.prenom}
              </h2>
              <button onClick={closeEval}>
                <X size={16} className="text-slate-400 hover:text-white" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Responsable RH</label>
                <input
                  type="text"
                  value={evalResponsableRH}
                  onChange={(e) => setEvalResponsableRH(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-[13px] text-white outline-none"
                  placeholder="Nom du responsable RH"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Note / 20</label>
                  <input
                    type="number"
                    min={0}
                    max={20}
                    step={0.5}
                    value={evalNote}
                    onChange={(e) => setEvalNote(e.target.value)}
                    className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-[13px] text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Résultat</label>
                  <select
                    value={evalResultat}
                    onChange={(e) => setEvalResultat(e.target.value as "ADMIS" | "AJOURNE" | "REFUSE" | "")}
                    className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-[13px] text-white outline-none"
                  >
                    <option value="">—</option>
                    <option value="ADMIS">Admis</option>
                    <option value="AJOURNE">Ajourné</option>
                    <option value="REFUSE">Refusé</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Compte rendu de l&apos;entretien</label>
                <textarea
                  value={evalCompteRendu}
                  onChange={(e) => setEvalCompteRendu(e.target.value)}
                  rows={3}
                  className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-[13px] text-white outline-none resize-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Forces</label>
                <textarea
                  value={evalForces}
                  onChange={(e) => setEvalForces(e.target.value)}
                  rows={2}
                  className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-[13px] text-white outline-none resize-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Faiblesses</label>
                <textarea
                  value={evalFaiblesses}
                  onChange={(e) => setEvalFaiblesses(e.target.value)}
                  rows={2}
                  className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-[13px] text-white outline-none resize-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Recommandations</label>
                <textarea
                  value={evalRecommandations}
                  onChange={(e) => setEvalRecommandations(e.target.value)}
                  rows={2}
                  className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-[13px] text-white outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={closeEval}
                className="px-4 py-2 rounded-lg text-[13px] text-slate-300 hover:bg-white/5"
              >
                Annuler
              </button>
              <button
                onClick={saveEval}
                disabled={saving}
                className="px-4 py-2 rounded-lg text-[13px] bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {saving ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}
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