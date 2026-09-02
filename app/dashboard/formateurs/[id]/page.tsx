"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Handshake, GraduationCap, Users, Wallet } from "lucide-react";
import RequireRole from "../../../components/RequireRole";
import Sidebar from "../../../components/Sidebar";
import Topbar from "../../../components/Topbar";
import Avatar from "../../../components/Avatar";

const GREEN = "#16a34a";

type Formation = {
  id: string;
  nom: string;
  prix: number;
  dureeJours: number;
  nombrePlaces: number;
  inscriptions: { id: string }[];
};

type InscriptionFormateur = {
  id: string;
  statut: string;
  candidat: { nom: string; prenom: string; photoPath: string | null };
  formation: { nom: string };
};

type Historique = {
  formateur: {
    id: string; domaine: string; modulesEnseignes: string; telephone: string;
    email: string; honoraires: string; photoPath: string | null; contratPath: string | null;
  };
  formations: Formation[];
  nombreApprenants: number;
  revenusGeneres: number;
  inscriptions: InscriptionFormateur[];
};

const STATUT_LABELS: Record<string, string> = {
  EN_FORMATION: "En formation",
  FORMATION_TERMINEE: "Formation terminée",
  EN_ATTENTE_INSERTION: "En attente d'insertion",
  ABANDON: "Abandon",
};

const STATUT_COLORS: Record<string, string> = {
  EN_FORMATION: "text-yellow-400",
  FORMATION_TERMINEE: "text-emerald-400",
  EN_ATTENTE_INSERTION: "text-blue-400",
  ABANDON: "text-red-400",
};

function FicheFormateurContent() {
  const params = useParams();
  const id = params.id as string;

  const [data, setData] = useState<Historique | null>(null);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    fetch(`/api/formateurs/${id}/historique`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setErreur(d.error);
        else setData(d);
      })
      .catch(() => setErreur("Impossible de contacter le serveur."))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      <Sidebar active="formateurs" />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <div className="p-6">
          {loading ? (
            <p className="text-slate-400 text-[13px]">Chargement...</p>
          ) : erreur ? (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg p-4 text-[13px]">
              {erreur}
            </div>
          ) : data ? (
            <>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-12 h-12 rounded-xl bg-emerald-600/15 flex items-center justify-center overflow-hidden">
                  {data.formateur.photoPath ? (
                    <img src={data.formateur.photoPath} alt={data.formateur.domaine} className="w-full h-full object-cover" />
                  ) : (
                    <Handshake size={22} style={{ color: GREEN }} />
                  )}
                </div>
                <div>
                  <h1 className="text-[22px] font-bold text-white">{data.formateur.domaine}</h1>
                  <p className="text-slate-500 text-[12px]">{data.formateur.modulesEnseignes}</p>
                </div>
              </div>

              {/* Fiche complète */}
              <div className="grid grid-cols-3 gap-3 mt-5 mb-6">
                <div className="bg-[#111827] rounded-xl border border-white/5 p-4">
                  <p className="text-slate-500 text-[11px] mb-1">Contact</p>
                  <p className="text-white text-[13px]">{data.formateur.telephone}</p>
                  <p className="text-slate-400 text-[12px]">{data.formateur.email}</p>
                </div>
                <div className="bg-[#111827] rounded-xl border border-white/5 p-4">
                  <p className="text-slate-500 text-[11px] mb-1">Honoraires</p>
                  <p className="text-white text-[13px]">{data.formateur.honoraires}</p>
                </div>
                <div className="bg-[#111827] rounded-xl border border-white/5 p-4">
                  <p className="text-slate-500 text-[11px] mb-1">Contrat</p>
                  {data.formateur.contratPath ? (
                    <a href={data.formateur.contratPath} target="_blank" className="text-emerald-400 text-[13px] hover:underline">
                      Voir le contrat
                    </a>
                  ) : (
                    <p className="text-slate-500 text-[13px]">—</p>
                  )}
                </div>
              </div>

              {/* Indicateurs */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-[#111827] rounded-xl border border-white/5 p-4">
                  <div className="flex items-center gap-2 text-slate-400 text-[11px] mb-2">
                    <GraduationCap size={14} className="text-yellow-400" /> Formations réalisées
                  </div>
                  <div className="text-white text-[20px] font-bold">{data.formations.length}</div>
                </div>
                <div className="bg-[#111827] rounded-xl border border-white/5 p-4">
                  <div className="flex items-center gap-2 text-slate-400 text-[11px] mb-2">
                    <Users size={14} className="text-blue-400" /> Nombre d&apos;apprenants
                  </div>
                  <div className="text-white text-[20px] font-bold">{data.nombreApprenants}</div>
                </div>
                <div className="bg-[#111827] rounded-xl border border-white/5 p-4">
                  <div className="flex items-center gap-2 text-slate-400 text-[11px] mb-2">
                    <Wallet size={14} className="text-emerald-400" /> Revenus générés
                  </div>
                  <div className="text-emerald-400 text-[18px] font-bold">
                    {data.revenusGeneres.toLocaleString("fr-FR")} FCFA
                  </div>
                </div>
              </div>

              {/* Formations données */}
              <div className="bg-[#111827] rounded-xl border border-white/5 overflow-hidden mb-5">
                <div className="p-4 border-b border-white/5">
                  <h2 className="text-white text-[13px] font-semibold">Formations dispensées</h2>
                </div>
                {data.formations.length === 0 ? (
                  <p className="text-slate-500 text-[12px] p-4">Aucune formation associée à ce formateur.</p>
                ) : (
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-slate-400 text-[11px] tracking-wide border-b border-white/5">
                        <th className="py-2.5 px-4 font-medium">Formation</th>
                        <th className="py-2.5 px-4 font-medium">Prix</th>
                        <th className="py-2.5 px-4 font-medium">Durée</th>
                        <th className="py-2.5 px-4 font-medium">Inscrits</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.formations.map((f) => (
                        <tr key={f.id} className="border-b border-white/5 last:border-0 text-[12.5px]">
                          <td className="py-2.5 px-4 text-white">{f.nom}</td>
                          <td className="py-2.5 px-4 text-slate-300">{f.prix.toLocaleString("fr-FR")} FCFA</td>
                          <td className="py-2.5 px-4 text-slate-300">{f.dureeJours} j</td>
                          <td className="py-2.5 px-4 text-slate-300">{f.inscriptions.length} / {f.nombrePlaces}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Apprenants suivis directement */}
              <div className="bg-[#111827] rounded-xl border border-white/5 overflow-hidden">
                <div className="p-4 border-b border-white/5">
                  <h2 className="text-white text-[13px] font-semibold">Apprenants suivis ({data.inscriptions.length})</h2>
                </div>
                {data.inscriptions.length === 0 ? (
                  <p className="text-slate-500 text-[12px] p-4">Aucun apprenant suivi directement.</p>
                ) : (
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-slate-400 text-[11px] tracking-wide border-b border-white/5">
                        <th className="py-2.5 px-4 font-medium">Candidat</th>
                        <th className="py-2.5 px-4 font-medium">Formation</th>
                        <th className="py-2.5 px-4 font-medium">Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.inscriptions.map((i) => (
                        <tr key={i.id} className="border-b border-white/5 last:border-0 text-[12.5px]">
                          <td className="py-2.5 px-4">
                            <div className="flex items-center gap-2">
                              <Avatar photoPath={i.candidat.photoPath} nom={i.candidat.nom} prenom={i.candidat.prenom} />
                              <span className="text-white">{i.candidat.nom} {i.candidat.prenom}</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-4 text-slate-300">{i.formation.nom}</td>
                          <td className="py-2.5 px-4">
                            <span className={`font-medium ${STATUT_COLORS[i.statut]}`}>
                              {STATUT_LABELS[i.statut]}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function FicheFormateurPage() {
  return (
    <RequireRole allowed={["directeur", "coordonnateur", "secretaire"]}>
      <FicheFormateurContent />
    </RequireRole>
  );
}