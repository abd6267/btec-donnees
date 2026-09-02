"use client";

import { useEffect, useState } from "react";
import { ClipboardCheck, Plus, X } from "lucide-react";
import RequireRole from "../../components/RequireRole";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import Avatar from "../../components/Avatar";

const GREEN = "#16a34a";

type Employe = {
  id: string;
  poste: string | null;
  statutEmploi: string;
  dateEmbauche: string | null;
  candidat: { nom: string; prenom: string; photoPath: string | null };
  entreprise: { nom: string } | null;
};

type Suivi = {
  id: string;
  mois: number;
  dateSuivi: string;
  presence: string | null;
  ponctualite: string | null;
  discipline: string | null;
  evaluation: string | null;
  satisfaction: string | null;
  commentaire: string | null;
  employe: Employe;
};

const SATISFACTION_LABELS: Record<string, string> = {
  TRES_SATISFAIT: "Très satisfait",
  SATISFAIT: "Satisfait",
  MOYEN: "Moyen",
  INSATISFAIT: "Insatisfait",
};

const SATISFACTION_COLORS: Record<string, string> = {
  TRES_SATISFAIT: "text-emerald-400",
  SATISFAIT: "text-blue-400",
  MOYEN: "text-yellow-400",
  INSATISFAIT: "text-red-400",
};

function SuiviEmployesContent() {
  const [suivis, setSuivis] = useState<Suivi[]>([]);
  const [employes, setEmployes] = useState<Employe[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [employeId, setEmployeId] = useState("");
  const [mois, setMois] = useState("1");
  const [presence, setPresence] = useState("");
  const [ponctualite, setPonctualite] = useState("");
  const [discipline, setDiscipline] = useState("");
  const [evaluation, setEvaluation] = useState("");
  const [satisfaction, setSatisfaction] = useState("");
  const [commentaire, setCommentaire] = useState("");
  const [saving, setSaving] = useState(false);

  const charger = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/suivis/list").then((r) => r.json()),
      fetch("/api/employes/list").then((r) => r.json()),
    ])
      .then(([s, e]) => {
        setSuivis(Array.isArray(s) ? s : []);
        setEmployes(Array.isArray(e) ? e.filter((emp: any) => emp.statutEmploi === "EMBAUCHE") : []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    charger();
  }, []);

  const resetForm = () => {
    setEmployeId("");
    setMois("1");
    setPresence("");
    setPonctualite("");
    setDiscipline("");
    setEvaluation("");
    setSatisfaction("");
    setCommentaire("");
  };

  const creerSuivi = async () => {
    if (!employeId || !mois) return;
    setSaving(true);
    try {
      await fetch("/api/suivis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeId, mois, presence, ponctualite, discipline, evaluation,
          satisfaction: satisfaction || null, commentaire,
        }),
      });
      setShowModal(false);
      resetForm();
      charger();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      <Sidebar active="suivi-employes" />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <div className="p-6">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-emerald-600/15 flex items-center justify-center">
                <ClipboardCheck size={17} style={{ color: GREEN }} />
              </div>
              <h1 className="text-[22px] font-bold text-white">Suivi Période d&apos;Essai</h1>
            </div>
            <button
              onClick={() => { resetForm(); setShowModal(true); }}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-[12px] font-semibold text-white"
              style={{ backgroundColor: GREEN }}
            >
              <Plus size={14} /> Nouveau suivi
            </button>
          </div>
          <p className="text-slate-500 text-[12px] mb-5 ml-11">
            Suivi des 3 premiers mois : présence, ponctualité, discipline, évaluation, satisfaction entreprise
          </p>

          <div className="bg-[#111827] rounded-xl border border-white/5 overflow-hidden">
            {loading ? (
              <p className="text-slate-400 p-6 text-[13px]">Chargement...</p>
            ) : suivis.length === 0 ? (
              <div className="p-10 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-600/15 flex items-center justify-center mb-3">
                  <ClipboardCheck size={22} style={{ color: GREEN }} />
                </div>
                <p className="text-white text-[13px] font-medium">Aucun suivi pour le moment</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="text-slate-400 text-[11px] tracking-wide border-b border-white/5">
                    <th className="py-3 px-4 font-medium">Employé</th>
                    <th className="py-3 px-4 font-medium">Entreprise</th>
                    <th className="py-3 px-4 font-medium">Mois</th>
                    <th className="py-3 px-4 font-medium">Présence</th>
                    <th className="py-3 px-4 font-medium">Ponctualité</th>
                    <th className="py-3 px-4 font-medium">Discipline</th>
                    <th className="py-3 px-4 font-medium">Satisfaction</th>
                  </tr>
                </thead>
                <tbody>
                  {suivis.map((s) => (
                    <tr key={s.id} className="border-b border-white/5 last:border-0 text-[12.5px]">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Avatar photoPath={s.employe.candidat.photoPath} nom={s.employe.candidat.nom} prenom={s.employe.candidat.prenom} />
                          <span className="text-white">{s.employe.candidat.nom} {s.employe.candidat.prenom}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-300">{s.employe.entreprise?.nom || "—"}</td>
                      <td className="py-3 px-4 text-slate-300">Mois {s.mois}</td>
                      <td className="py-3 px-4 text-slate-300">{s.presence || "—"}</td>
                      <td className="py-3 px-4 text-slate-300">{s.ponctualite || "—"}</td>
                      <td className="py-3 px-4 text-slate-300">{s.discipline || "—"}</td>
                      <td className="py-3 px-4">
                        {s.satisfaction ? (
                          <span className={`font-medium ${SATISFACTION_COLORS[s.satisfaction]}`}>
                            {SATISFACTION_LABELS[s.satisfaction]}
                          </span>
                        ) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111827] border border-white/10 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold text-[15px]">Nouveau suivi</h2>
              <button onClick={() => setShowModal(false)}>
                <X size={16} className="text-slate-400 hover:text-white" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Employé</label>
                <select
                  value={employeId}
                  onChange={(e) => setEmployeId(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-[13px] text-white outline-none"
                >
                  <option value="">Sélectionner...</option>
                  {employes.map((e) => (
                    <option key={e.id} value={e.id}>{e.candidat.nom} {e.candidat.prenom} — {e.entreprise?.nom || "—"}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Mois (1, 2 ou 3)</label>
                <select
                  value={mois}
                  onChange={(e) => setMois(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-[13px] text-white outline-none"
                >
                  <option value="1">Mois 1</option>
                  <option value="2">Mois 2</option>
                  <option value="3">Mois 3</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Présence</label>
                <input value={presence} onChange={(e) => setPresence(e.target.value)} placeholder="Ex: Assidu" className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-[13px] text-white outline-none placeholder:text-slate-600" />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Ponctualité</label>
                <input value={ponctualite} onChange={(e) => setPonctualite(e.target.value)} placeholder="Ex: Ponctuel" className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-[13px] text-white outline-none placeholder:text-slate-600" />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Discipline</label>
                <input value={discipline} onChange={(e) => setDiscipline(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-[13px] text-white outline-none" />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Évaluation</label>
                <textarea value={evaluation} onChange={(e) => setEvaluation(e.target.value)} rows={2} className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-[13px] text-white outline-none resize-none" />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Satisfaction de l&apos;entreprise</label>
                <select
                  value={satisfaction}
                  onChange={(e) => setSatisfaction(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-[13px] text-white outline-none"
                >
                  <option value="">—</option>
                  <option value="TRES_SATISFAIT">Très satisfait</option>
                  <option value="SATISFAIT">Satisfait</option>
                  <option value="MOYEN">Moyen</option>
                  <option value="INSATISFAIT">Insatisfait</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Commentaire</label>
                <textarea value={commentaire} onChange={(e) => setCommentaire(e.target.value)} rows={2} className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-[13px] text-white outline-none resize-none" />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg text-[13px] text-slate-300 hover:bg-white/5">
                Annuler
              </button>
              <button
                onClick={creerSuivi}
                disabled={saving || !employeId}
                className="px-4 py-2 rounded-lg text-[13px] font-semibold text-white disabled:opacity-50"
                style={{ backgroundColor: GREEN }}
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

export default function SuiviEmployesPage() {
  return (
    <RequireRole allowed={["directeur", "coordonnateur", "secretaire"]}>
      <SuiviEmployesContent />
    </RequireRole>
  );
}