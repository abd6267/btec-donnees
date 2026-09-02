"use client";

import { useEffect, useState } from "react";
import { GraduationCap, Building2, Check } from "lucide-react";
import RequireRole from "../../components/RequireRole";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import Avatar from "../../components/Avatar";

const GREEN = "#16a34a";

type EmployeEnAttente = {
  id: string;
  candidat: {
    id: string;
    nom: string;
    prenom: string;
    photoPath: string | null;
    posteRecherche: string;
    telephone: string;
  };
};

type Entreprise = {
  id: string;
  nom: string;
};

function FormesContent() {
  const [employes, setEmployes] = useState<EmployeEnAttente[]>([]);
  const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
  const [loading, setLoading] = useState(true);

  const [embaucheId, setEmbaucheId] = useState<string | null>(null);
  const [entrepriseChoisie, setEntrepriseChoisie] = useState<string>("");
  const [posteChoisi, setPosteChoisi] = useState<string>("");
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  const charger = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/formes/list").then((r) => r.json()),
      fetch("/api/entreprises/list").then((r) => r.json()).catch(() => []),
    ])
      .then(([emp, ent]) => {
        setEmployes(Array.isArray(emp) ? emp : []);
        setEntreprises(Array.isArray(ent) ? ent : []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    charger();
  }, []);

  const ouvrirEmbauche = (id: string) => {
    setEmbaucheId(id);
    setEntrepriseChoisie("");
    setPosteChoisi("");
  };

  const confirmerEmbauche = async () => {
    if (!embaucheId || !entrepriseChoisie) return;
    setEnvoiEnCours(true);
    try {
      const res = await fetch(`/api/employes/${embaucheId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          statutEmploi: "EMBAUCHE",
          entrepriseId: entrepriseChoisie,
          poste: posteChoisi || undefined,
        }),
      });
      if (!res.ok) throw new Error("Echec de l'embauche");
      setEmbaucheId(null);
      charger();
    } catch {
      // en cas d'echec on laisse le modal ouvert pour reessayer
    } finally {
      setEnvoiEnCours(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      <Sidebar active="formes" />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <div className="p-6">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-lg bg-emerald-600/15 flex items-center justify-center">
              <GraduationCap size={17} style={{ color: GREEN }} />
            </div>
            <h1 className="text-[22px] font-bold text-white">Formés en Attente</h1>
          </div>
          <p className="text-slate-500 text-[12px] mb-5 ml-11">
            Candidats formés en attente d&apos;embauche
          </p>

          <div className="bg-[#111827] rounded-xl border border-white/5 overflow-hidden">
            {loading ? (
              <p className="text-slate-400 p-6 text-[13px]">Chargement...</p>
            ) : employes.length === 0 ? (
              <div className="p-10 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-600/15 flex items-center justify-center mb-3">
                  <GraduationCap size={22} style={{ color: GREEN }} />
                </div>
                <p className="text-white text-[13px] font-medium">Aucun candidat formé en attente</p>
                <p className="text-slate-500 text-[12px] mt-1">
                  Les candidats ayant terminé leur formation s&apos;afficheront ici.
                </p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="text-slate-400 text-[11px] tracking-wide border-b border-white/5">
                    <th className="py-3 px-4 font-medium">Candidat</th>
                    <th className="py-3 px-4 font-medium">Poste recherché</th>
                    <th className="py-3 px-4 font-medium">Contact</th>
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
                      <td className="py-3 px-4 text-slate-300">{e.candidat.posteRecherche}</td>
                      <td className="py-3 px-4 text-slate-300">{e.candidat.telephone}</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => ouvrirEmbauche(e.id)}
                          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold text-white"
                          style={{ backgroundColor: GREEN }}
                        >
                          <Check size={12} /> Marquer embauché
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

      {embaucheId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#111827] border border-white/10 rounded-xl p-5 w-full max-w-sm">
            <div className="flex items-center gap-2 mb-4">
              <Building2 size={16} style={{ color: GREEN }} />
              <h2 className="text-white text-[14px] font-semibold">Confirmer l&apos;embauche</h2>
            </div>

            <label className="text-slate-400 text-[11px] block mb-1.5">Entreprise partenaire</label>
            <select
              value={entrepriseChoisie}
              onChange={(e) => setEntrepriseChoisie(e.target.value)}
              className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-[12px] text-slate-300 outline-none mb-3"
            >
              <option value="">Sélectionner une entreprise...</option>
              {entreprises.map((ent) => (
                <option key={ent.id} value={ent.id}>{ent.nom}</option>
              ))}
            </select>

            <label className="text-slate-400 text-[11px] block mb-1.5">Poste (optionnel)</label>
            <input
              value={posteChoisi}
              onChange={(e) => setPosteChoisi(e.target.value)}
              placeholder="Ex: Développeur Frontend"
              className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-[12px] text-slate-300 outline-none mb-4 placeholder:text-slate-600"
            />

            <div className="flex gap-2">
              <button
                onClick={() => setEmbaucheId(null)}
                className="flex-1 rounded-lg px-3 py-2 text-[12px] text-slate-300 border border-white/10"
              >
                Annuler
              </button>
              <button
                onClick={confirmerEmbauche}
                disabled={!entrepriseChoisie || envoiEnCours}
                className="flex-1 rounded-lg px-3 py-2 text-[12px] font-semibold text-white disabled:opacity-50"
                style={{ backgroundColor: GREEN }}
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

export default function FormesPage() {
  return (
    <RequireRole allowed={["directeur", "coordonnateur", "secretaire"]}>
      <FormesContent />
    </RequireRole>
  );
}