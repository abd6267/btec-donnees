"use client";

import { useEffect, useState } from "react";
import { Archive, UserX, Briefcase, FileWarning } from "lucide-react";
import RequireRole from "../../components/RequireRole";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import Avatar from "../../components/Avatar";

const GREEN = "#16a34a";

type ArchiveData = {
  anciensCandidats: {
    id: string;
    nom: string;
    prenom: string;
    photoPath: string | null;
    posteRecherche: string;
    updatedAt: string;
  }[];
  anciensEmployes: {
    id: string;
    poste: string | null;
    dateDepart: string | null;
    motifDepart: string | null;
    candidat: { nom: string; prenom: string; photoPath: string | null };
    entreprise: { nom: string } | null;
  }[];
  contratsExpires: {
    id: string;
    libelle: string;
    montant: number;
    dateEcheance: string | null;
    candidat: { nom: string; prenom: string } | null;
    entreprise: { nom: string } | null;
  }[];
};

type Onglet = "candidats" | "employes" | "contrats";

function ArchivesContent() {
  const [data, setData] = useState<ArchiveData | null>(null);
  const [loading, setLoading] = useState(true);
  const [onglet, setOnglet] = useState<Onglet>("candidats");

  useEffect(() => {
    fetch("/api/archives")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      <Sidebar active="archives" />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <div className="p-6">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-lg bg-emerald-600/15 flex items-center justify-center">
              <Archive size={17} style={{ color: GREEN }} />
            </div>
            <h1 className="text-[22px] font-bold text-white">Archives</h1>
          </div>
          <p className="text-slate-500 text-[12px] mb-5 ml-11">
            Anciens candidats, anciens employés et contrats expirés
          </p>

          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setOnglet("candidats")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] ${onglet === "candidats" ? "bg-white/10 text-white" : "text-slate-400"}`}
            >
              <UserX size={13} /> Anciens candidats
            </button>
            <button
              onClick={() => setOnglet("employes")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] ${onglet === "employes" ? "bg-white/10 text-white" : "text-slate-400"}`}
            >
              <Briefcase size={13} /> Anciens employés
            </button>
            <button
              onClick={() => setOnglet("contrats")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] ${onglet === "contrats" ? "bg-white/10 text-white" : "text-slate-400"}`}
            >
              <FileWarning size={13} /> Contrats expirés
            </button>
          </div>

          <div className="bg-[#111827] rounded-xl border border-white/5 overflow-hidden">
            {loading || !data ? (
              <p className="text-slate-400 p-6 text-[13px]">Chargement...</p>
            ) : onglet === "candidats" ? (
              data.anciensCandidats.length === 0 ? (
                <p className="text-slate-500 text-[12px] p-6">Aucun candidat archivé (refusé).</p>
              ) : (
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-slate-400 text-[11px] tracking-wide border-b border-white/5">
                      <th className="py-3 px-4 font-medium">Candidat</th>
                      <th className="py-3 px-4 font-medium">Poste recherché</th>
                      <th className="py-3 px-4 font-medium">Dernière mise à jour</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.anciensCandidats.map((c) => (
                      <tr key={c.id} className="border-b border-white/5 last:border-0 text-[12.5px]">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Avatar photoPath={c.photoPath} nom={c.nom} prenom={c.prenom} />
                            <span className="text-white">{c.nom} {c.prenom}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-300">{c.posteRecherche}</td>
                        <td className="py-3 px-4 text-slate-300">
                          {new Date(c.updatedAt).toLocaleDateString("fr-FR")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            ) : onglet === "employes" ? (
              data.anciensEmployes.length === 0 ? (
                <p className="text-slate-500 text-[12px] p-6">Aucun employé débauché.</p>
              ) : (
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-slate-400 text-[11px] tracking-wide border-b border-white/5">
                      <th className="py-3 px-4 font-medium">Employé</th>
                      <th className="py-3 px-4 font-medium">Entreprise</th>
                      <th className="py-3 px-4 font-medium">Poste</th>
                      <th className="py-3 px-4 font-medium">Date départ</th>
                      <th className="py-3 px-4 font-medium">Motif</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.anciensEmployes.map((e) => (
                      <tr key={e.id} className="border-b border-white/5 last:border-0 text-[12.5px]">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Avatar photoPath={e.candidat.photoPath} nom={e.candidat.nom} prenom={e.candidat.prenom} />
                            <span className="text-white">{e.candidat.nom} {e.candidat.prenom}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-300">{e.entreprise?.nom || "—"}</td>
                        <td className="py-3 px-4 text-slate-300">{e.poste || "—"}</td>
                        <td className="py-3 px-4 text-slate-300">
                          {e.dateDepart ? new Date(e.dateDepart).toLocaleDateString("fr-FR") : "—"}
                        </td>
                        <td className="py-3 px-4 text-slate-300">{e.motifDepart || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            ) : data.contratsExpires.length === 0 ? (
              <p className="text-slate-500 text-[12px] p-6">Aucun paiement en retard/expiré.</p>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="text-slate-400 text-[11px] tracking-wide border-b border-white/5">
                    <th className="py-3 px-4 font-medium">Libellé</th>
                    <th className="py-3 px-4 font-medium">Concerné</th>
                    <th className="py-3 px-4 font-medium">Montant</th>
                    <th className="py-3 px-4 font-medium">Échéance dépassée</th>
                  </tr>
                </thead>
                <tbody>
                  {data.contratsExpires.map((p) => (
                    <tr key={p.id} className="border-b border-white/5 last:border-0 text-[12.5px]">
                      <td className="py-3 px-4 text-white">{p.libelle}</td>
                      <td className="py-3 px-4 text-slate-300">
                        {p.candidat ? `${p.candidat.nom} ${p.candidat.prenom}` : p.entreprise?.nom || "—"}
                      </td>
                      <td className="py-3 px-4 text-slate-300">{p.montant.toLocaleString("fr-FR")} FCFA</td>
                      <td className="py-3 px-4 text-red-400">
                        {p.dateEcheance ? new Date(p.dateEcheance).toLocaleDateString("fr-FR") : "—"}
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

export default function ArchivesPage() {
  return (
    <RequireRole allowed={["directeur", "coordonnateur"]}>
      <ArchivesContent />
    </RequireRole>
  );
}