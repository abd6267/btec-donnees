"use client";

import { useEffect, useState } from "react";
import { Briefcase, UserX } from "lucide-react";
import RequireRole from "../../components/RequireRole";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import Avatar from "../../components/Avatar";

const GREEN = "#16a34a";

type EmployeEmbauche = {
  id: string;
  poste: string | null;
  dateEmbauche: string | null;
  candidat: {
    id: string;
    nom: string;
    prenom: string;
    photoPath: string | null;
    telephone: string;
  };
  entreprise: {
    id: string;
    nom: string;
  } | null;
};

function EmbauchesContent() {
  const [employes, setEmployes] = useState<EmployeEmbauche[]>([]);
  const [loading, setLoading] = useState(true);

  const [debaucheId, setDebaucheId] = useState<string | null>(null);
  const [motif, setMotif] = useState("");
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  const charger = () => {
    setLoading(true);
    fetch("/api/embauches/list")
      .then((r) => r.json())
      .then((data) => setEmployes(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    charger();
  }, []);

  const ouvrirDebauche = (id: string) => {
    setDebaucheId(id);
    setMotif("");
  };

  const confirmerDebauche = async () => {
    if (!debaucheId || !motif.trim()) return;
    setEnvoiEnCours(true);
    try {
      const res = await fetch(`/api/employes/${debaucheId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statutEmploi: "DEBAUCHE", motifDepart: motif.trim() }),
      });
      if (!res.ok) throw new Error("Echec du départ");
      setDebaucheId(null);
      charger();
    } catch {
      // laisser le modal ouvert pour reessayer
    } finally {
      setEnvoiEnCours(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      <Sidebar active="embauches" />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <div className="p-6">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-lg bg-emerald-600/15 flex items-center justify-center">
              <Briefcase size={17} style={{ color: GREEN }} />
            </div>
            <h1 className="text-[22px] font-bold text-white">Employés Embauchés</h1>
          </div>
          <p className="text-slate-500 text-[12px] mb-5 ml-11">
            Liste des employés actuellement embauchés
          </p>

          <div className="bg-[#111827] rounded-xl border border-white/5 overflow-hidden">
            {loading ? (
              <p className="text-slate-400 p-6 text-[13px]">Chargement...</p>
            ) : employes.length === 0 ? (
              <div className="p-10 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-600/15 flex items-center justify-center mb-3">
                  <Briefcase size={22} style={{ color: GREEN }} />
                </div>
                <p className="text-white text-[13px] font-medium">Aucun employé embauché pour le moment</p>
                <p className="text-slate-500 text-[12px] mt-1">Les employés embauchés s&apos;afficheront ici.</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="text-slate-400 text-[11px] tracking-wide border-b border-white/5">
                    <th className="py-3 px-4 font-medium">Employé</th>
                    <th className="py-3 px-4 font-medium">Entreprise</th>
                    <th className="py-3 px-4 font-medium">Poste</th>
                    <th className="py-3 px-4 font-medium">Date d&apos;embauche</th>
                    <th className="py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employes.map((e) => (
                    <tr key={e.id} className="border-b border-white/5 last:border-0 text-[12.5px]">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Avatar photoPath={e.candidat.photoPath} nom={e.candidat.nom} prenom={e.candidat.prenom} />
                          <span className="text-white">{e.candidat.nom} {e.candidat.prenom}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-300">{e.entreprise?.nom || "-"}</td>
                      <td className="py-3 px-4 text-slate-300">{e.poste || "-"}</td>
                      <td className="py-3 px-4 text-slate-400">
                        {e.dateEmbauche ? new Date(e.dateEmbauche).toLocaleDateString("fr-FR") : "-"}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => ouvrirDebauche(e.id)}
                          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold text-red-400 border border-red-400/30"
                        >
                          <UserX size={12} /> Débaucher
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

      {debaucheId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#111827] border border-white/10 rounded-xl p-5 w-full max-w-sm">
            <div className="flex items-center gap-2 mb-4">
              <UserX size={16} className="text-red-400" />
              <h2 className="text-white text-[14px] font-semibold">Confirmer le départ</h2>
            </div>

            <label className="text-slate-400 text-[11px] block mb-1.5">Motif de départ</label>
            <textarea
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              placeholder="Ex: Fin de contrat, démission..."
              rows={3}
              className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-[12px] text-slate-300 outline-none mb-4 placeholder:text-slate-600 resize-none"
            />

            <div className="flex gap-2">
              <button
                onClick={() => setDebaucheId(null)}
                className="flex-1 rounded-lg px-3 py-2 text-[12px] text-slate-300 border border-white/10"
              >
                Annuler
              </button>
              <button
                onClick={confirmerDebauche}
                disabled={!motif.trim() || envoiEnCours}
                className="flex-1 rounded-lg px-3 py-2 text-[12px] font-semibold text-white disabled:opacity-50 bg-red-500"
              >
                {envoiEnCours ? "Confirmation..." : "Confirmer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function EmbauchesPage() {
  return (
    <RequireRole allowed={["directeur", "coordonnateur", "secretaire"]}>
      <EmbauchesContent />
    </RequireRole>
  );
}