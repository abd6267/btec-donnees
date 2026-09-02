"use client";

import { useEffect, useState } from "react";
import { UserX2 } from "lucide-react";
import RequireRole from "../../components/RequireRole";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import Avatar from "../../components/Avatar";

type EmployeDebauche = {
  id: string;
  poste: string | null;
  dateEmbauche: string | null;
  dateDepart: string | null;
  motifDepart: string | null;
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

function DebauchesContent() {
  const [employes, setEmployes] = useState<EmployeDebauche[]>([]);
  const [loading, setLoading] = useState(true);

  const charger = () => {
    setLoading(true);
    fetch("/api/debauches/list")
      .then((r) => r.json())
      .then((data) => setEmployes(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    charger();
  }, []);

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      <Sidebar active="debauches" />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <div className="p-6">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-lg bg-red-500/15 flex items-center justify-center">
              <UserX2 size={17} className="text-red-400" />
            </div>
            <h1 className="text-[22px] font-bold text-white">Employés Débauchés</h1>
          </div>
          <p className="text-slate-500 text-[12px] mb-5 ml-11">
            Historique des employés ayant quitté leur poste
          </p>

          <div className="bg-[#111827] rounded-xl border border-white/5 overflow-hidden">
            {loading ? (
              <p className="text-slate-400 p-6 text-[13px]">Chargement...</p>
            ) : employes.length === 0 ? (
              <div className="p-10 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full bg-red-500/15 flex items-center justify-center mb-3">
                  <UserX2 size={22} className="text-red-400" />
                </div>
                <p className="text-white text-[13px] font-medium">Aucun employé débauché pour le moment</p>
                <p className="text-slate-500 text-[12px] mt-1">
                  Les employés ayant quitté leur poste s&apos;afficheront ici.
                </p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="text-slate-400 text-[11px] tracking-wide border-b border-white/5">
                    <th className="py-3 px-4 font-medium">Employé</th>
                    <th className="py-3 px-4 font-medium">Entreprise</th>
                    <th className="py-3 px-4 font-medium">Poste</th>
                    <th className="py-3 px-4 font-medium">Date d&apos;embauche</th>
                    <th className="py-3 px-4 font-medium">Date de départ</th>
                    <th className="py-3 px-4 font-medium">Motif</th>
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
                      <td className="py-3 px-4 text-slate-400">
                        {e.dateDepart ? new Date(e.dateDepart).toLocaleDateString("fr-FR") : "-"}
                      </td>
                      <td className="py-3 px-4 text-slate-400">{e.motifDepart || "-"}</td>
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

export default function DebauchesPage() {
  return (
    <RequireRole allowed={["directeur", "coordonnateur", "secretaire"]}>
      <DebauchesContent />
    </RequireRole>
  );
}