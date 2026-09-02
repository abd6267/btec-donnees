"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Building2, Briefcase, FileStack, Wallet, Users } from "lucide-react";
import RequireRole from "../../../components/RequireRole";
import Sidebar from "../../../components/Sidebar";
import Topbar from "../../../components/Topbar";
import Avatar from "../../../components/Avatar";

const GREEN = "#16a34a";

type Employe = {
  id: string;
  poste: string | null;
  statutEmploi: string;
  dateEmbauche: string | null;
  dateDepart: string | null;
  candidat: { nom: string; prenom: string; photoPath: string | null };
};

type Facture = {
  id: string;
  filePath: string;
  genereLe: string;
};

type Paiement = {
  id: string;
  libelle: string;
  montant: number;
  type: string;
  statut: string;
  createdAt: string;
};

type Historique = {
  entreprise: {
    id: string; nom: string; directeur: string; adresse: string; telephone: string;
    email: string; activite: string; nombreEmployes: number; datePartenariat: string;
    logoPath: string | null; contratPath: string | null;
  };
  recrutementsEffectues: Employe[];
  personnelConfie: Employe[];
  factures: Facture[];
  paiements: Paiement[];
};

const STATUT_LABELS: Record<string, string> = {
  EN_ATTENTE: "En attente",
  EMBAUCHE: "Embauché",
  DEBAUCHE: "Débauché",
};

const STATUT_COLORS: Record<string, string> = {
  EN_ATTENTE: "text-yellow-400",
  EMBAUCHE: "text-emerald-400",
  DEBAUCHE: "text-red-400",
};

function FicheEntrepriseContent() {
  const params = useParams();
  const id = params.id as string;

  const [data, setData] = useState<Historique | null>(null);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    fetch(`/api/entreprises/${id}/historique`)
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
      <Sidebar active="entreprises" />
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
                  {data.entreprise.logoPath ? (
                    <img src={data.entreprise.logoPath} alt={data.entreprise.nom} className="w-full h-full object-cover" />
                  ) : (
                    <Building2 size={22} style={{ color: GREEN }} />
                  )}
                </div>
                <div>
                  <h1 className="text-[22px] font-bold text-white">{data.entreprise.nom}</h1>
                  <p className="text-slate-500 text-[12px]">
                    {data.entreprise.activite} — {data.entreprise.directeur}
                  </p>
                </div>
              </div>

              {/* Fiche complète */}
              <div className="grid grid-cols-3 gap-3 mt-5 mb-6">
                <div className="bg-[#111827] rounded-xl border border-white/5 p-4">
                  <p className="text-slate-500 text-[11px] mb-1">Adresse</p>
                  <p className="text-white text-[13px]">{data.entreprise.adresse}</p>
                </div>
                <div className="bg-[#111827] rounded-xl border border-white/5 p-4">
                  <p className="text-slate-500 text-[11px] mb-1">Contact</p>
                  <p className="text-white text-[13px]">{data.entreprise.telephone}</p>
                  <p className="text-slate-400 text-[12px]">{data.entreprise.email}</p>
                </div>
                <div className="bg-[#111827] rounded-xl border border-white/5 p-4">
                  <p className="text-slate-500 text-[11px] mb-1">Partenariat depuis</p>
                  <p className="text-white text-[13px]">
                    {new Date(data.entreprise.datePartenariat).toLocaleDateString("fr-FR")}
                  </p>
                </div>
              </div>

              {/* Personnel confié actuellement */}
              <div className="bg-[#111827] rounded-xl border border-white/5 overflow-hidden mb-5">
                <div className="p-4 border-b border-white/5 flex items-center gap-2">
                  <Users size={15} style={{ color: GREEN }} />
                  <h2 className="text-white text-[13px] font-semibold">
                    Personnel confié actuellement ({data.personnelConfie.length})
                  </h2>
                </div>
                {data.personnelConfie.length === 0 ? (
                  <p className="text-slate-500 text-[12px] p-4">Aucun employé actuellement en poste.</p>
                ) : (
                  <table className="w-full text-left">
                    <tbody>
                      {data.personnelConfie.map((e) => (
                        <tr key={e.id} className="border-b border-white/5 last:border-0 text-[12.5px]">
                          <td className="py-2.5 px-4">
                            <div className="flex items-center gap-2">
                              <Avatar photoPath={e.candidat.photoPath} nom={e.candidat.nom} prenom={e.candidat.prenom} />
                              <span className="text-white">{e.candidat.nom} {e.candidat.prenom}</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-4 text-slate-300">{e.poste || "—"}</td>
                          <td className="py-2.5 px-4 text-slate-300">
                            {e.dateEmbauche ? new Date(e.dateEmbauche).toLocaleDateString("fr-FR") : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Historique complet des recrutements */}
              <div className="bg-[#111827] rounded-xl border border-white/5 overflow-hidden mb-5">
                <div className="p-4 border-b border-white/5 flex items-center gap-2">
                  <Briefcase size={15} style={{ color: GREEN }} />
                  <h2 className="text-white text-[13px] font-semibold">
                    Recrutements effectués ({data.recrutementsEffectues.length})
                  </h2>
                </div>
                {data.recrutementsEffectues.length === 0 ? (
                  <p className="text-slate-500 text-[12px] p-4">Aucun recrutement effectué pour cette entreprise.</p>
                ) : (
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-slate-400 text-[11px] tracking-wide border-b border-white/5">
                        <th className="py-2.5 px-4 font-medium">Employé</th>
                        <th className="py-2.5 px-4 font-medium">Poste</th>
                        <th className="py-2.5 px-4 font-medium">Statut</th>
                        <th className="py-2.5 px-4 font-medium">Embauché le</th>
                        <th className="py-2.5 px-4 font-medium">Départ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recrutementsEffectues.map((e) => (
                        <tr key={e.id} className="border-b border-white/5 last:border-0 text-[12.5px]">
                          <td className="py-2.5 px-4">
                            <div className="flex items-center gap-2">
                              <Avatar photoPath={e.candidat.photoPath} nom={e.candidat.nom} prenom={e.candidat.prenom} />
                              <span className="text-white">{e.candidat.nom} {e.candidat.prenom}</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-4 text-slate-300">{e.poste || "—"}</td>
                          <td className="py-2.5 px-4">
                            <span className={`font-medium ${STATUT_COLORS[e.statutEmploi]}`}>
                              {STATUT_LABELS[e.statutEmploi]}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-slate-300">
                            {e.dateEmbauche ? new Date(e.dateEmbauche).toLocaleDateString("fr-FR") : "—"}
                          </td>
                          <td className="py-2.5 px-4 text-slate-300">
                            {e.dateDepart ? new Date(e.dateDepart).toLocaleDateString("fr-FR") : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="grid grid-cols-2 gap-5">
                {/* Factures */}
                <div className="bg-[#111827] rounded-xl border border-white/5 overflow-hidden">
                  <div className="p-4 border-b border-white/5 flex items-center gap-2">
                    <FileStack size={15} style={{ color: GREEN }} />
                    <h2 className="text-white text-[13px] font-semibold">Factures ({data.factures.length})</h2>
                  </div>
                  {data.factures.length === 0 ? (
                    <p className="text-slate-500 text-[12px] p-4">Aucune facture générée.</p>
                  ) : (
                    <div className="divide-y divide-white/5">
                      {data.factures.map((f) => (
                        <a
                          key={f.id}
                          href={f.filePath}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-3 text-[12.5px] hover:bg-white/5"
                        >
                          <span className="text-white">Facture du {new Date(f.genereLe).toLocaleDateString("fr-FR")}</span>
                          <span className="text-emerald-400">Voir</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>

                {/* Paiements */}
                <div className="bg-[#111827] rounded-xl border border-white/5 overflow-hidden">
                  <div className="p-4 border-b border-white/5 flex items-center gap-2">
                    <Wallet size={15} style={{ color: GREEN }} />
                    <h2 className="text-white text-[13px] font-semibold">Paiements ({data.paiements.length})</h2>
                  </div>
                  {data.paiements.length === 0 ? (
                    <p className="text-slate-500 text-[12px] p-4">Aucun paiement enregistré.</p>
                  ) : (
                    <div className="divide-y divide-white/5">
                      {data.paiements.map((p) => (
                        <div key={p.id} className="flex items-center justify-between p-3 text-[12.5px]">
                          <span className="text-white">{p.libelle}</span>
                          <span className={p.type === "RECETTE" ? "text-emerald-400" : "text-red-400"}>
                            {p.montant.toLocaleString("fr-FR")} FCFA
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function FicheEntreprisePage() {
  return (
    <RequireRole allowed={["directeur", "coordonnateur", "secretaire"]}>
      <FicheEntrepriseContent />
    </RequireRole>
  );
}