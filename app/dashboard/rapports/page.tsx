"use client";

import { useEffect, useState } from "react";
import { FileBarChart, Download, Users, GraduationCap, Briefcase, TrendingUp } from "lucide-react";
import RequireRole from "../../components/RequireRole";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";

const GREEN = "#16a34a";

type Statistiques = {
  candidatsInscrits: number;
  candidatsRecrutes: number;
  enFormation: number;
  placés: number;
  revenus: number;
  depenses: number;
  classementEntreprises: { nom: string; nombreEmployes: number }[];
  classementFormations: { nom: string; nombreInscrits: number }[];
};

function RapportsContent() {
  const [stats, setStats] = useState<Statistiques | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetch("/api/rapports/statistiques")
      .then((r) => r.json())
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  const exporterExcel = async () => {
    setExporting(true);
    try {
      const res = await fetch("/api/rapports/export?format=xlsx");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "rapport-btec.xlsx";
      a.click();
      window.URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      <Sidebar active="rapports" />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <div className="p-6">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-emerald-600/15 flex items-center justify-center">
                <FileBarChart size={17} style={{ color: GREEN }} />
              </div>
              <h1 className="text-[22px] font-bold text-white">Rapports</h1>
            </div>
            <button
              onClick={exporterExcel}
              disabled={exporting}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-[12px] font-semibold text-white disabled:opacity-50"
              style={{ backgroundColor: GREEN }}
            >
              <Download size={14} /> {exporting ? "Export..." : "Exporter Excel"}
            </button>
          </div>
          <p className="text-slate-500 text-[12px] mb-5 ml-11">
            Statistiques globales et classements
          </p>

          {loading ? (
            <p className="text-slate-400 text-[13px]">Chargement...</p>
          ) : stats ? (
            <>
              <div className="grid grid-cols-4 gap-3 mb-5">
                <div className="bg-[#111827] rounded-xl border border-white/5 p-4">
                  <div className="flex items-center gap-2 text-slate-400 text-[11px] mb-2">
                    <Users size={14} className="text-blue-400" /> Candidats inscrits
                  </div>
                  <div className="text-white text-[20px] font-bold">{stats.candidatsInscrits}</div>
                </div>
                <div className="bg-[#111827] rounded-xl border border-white/5 p-4">
                  <div className="flex items-center gap-2 text-slate-400 text-[11px] mb-2">
                    <Briefcase size={14} className="text-emerald-400" /> Recrutés
                  </div>
                  <div className="text-white text-[20px] font-bold">{stats.candidatsRecrutes}</div>
                </div>
                <div className="bg-[#111827] rounded-xl border border-white/5 p-4">
                  <div className="flex items-center gap-2 text-slate-400 text-[11px] mb-2">
                    <GraduationCap size={14} className="text-yellow-400" /> En formation
                  </div>
                  <div className="text-white text-[20px] font-bold">{stats.enFormation}</div>
                </div>
                <div className="bg-[#111827] rounded-xl border border-white/5 p-4">
                  <div className="flex items-center gap-2 text-slate-400 text-[11px] mb-2">
                    <TrendingUp size={14} className="text-purple-400" /> Placés
                  </div>
                  <div className="text-white text-[20px] font-bold">{stats.placés}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-[#111827] rounded-xl border border-white/5 p-4">
                  <div className="text-slate-400 text-[11px] mb-2">Revenus (payés)</div>
                  <div className="text-emerald-400 text-[18px] font-bold">
                    {stats.revenus.toLocaleString("fr-FR")} FCFA
                  </div>
                </div>
                <div className="bg-[#111827] rounded-xl border border-white/5 p-4">
                  <div className="text-slate-400 text-[11px] mb-2">Dépenses (payées)</div>
                  <div className="text-red-400 text-[18px] font-bold">
                    {stats.depenses.toLocaleString("fr-FR")} FCFA
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#111827] rounded-xl border border-white/5 overflow-hidden">
                  <div className="p-4 border-b border-white/5">
                    <h2 className="text-white text-[13px] font-semibold">Classement entreprises partenaires</h2>
                  </div>
                  {stats.classementEntreprises.length === 0 ? (
                    <p className="text-slate-500 text-[12px] p-4">Aucune donnée</p>
                  ) : (
                    <table className="w-full text-left">
                      <tbody>
                        {stats.classementEntreprises.map((e, idx) => (
                          <tr key={e.nom} className="border-b border-white/5 last:border-0 text-[12.5px]">
                            <td className="py-2.5 px-4 text-slate-400 w-8">{idx + 1}</td>
                            <td className="py-2.5 px-4 text-white">{e.nom}</td>
                            <td className="py-2.5 px-4 text-slate-300 text-right">{e.nombreEmployes} employés</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                <div className="bg-[#111827] rounded-xl border border-white/5 overflow-hidden">
                  <div className="p-4 border-b border-white/5">
                    <h2 className="text-white text-[13px] font-semibold">Formations les plus vendues</h2>
                  </div>
                  {stats.classementFormations.length === 0 ? (
                    <p className="text-slate-500 text-[12px] p-4">Aucune donnée</p>
                  ) : (
                    <table className="w-full text-left">
                      <tbody>
                        {stats.classementFormations.map((f, idx) => (
                          <tr key={f.nom} className="border-b border-white/5 last:border-0 text-[12.5px]">
                            <td className="py-2.5 px-4 text-slate-400 w-8">{idx + 1}</td>
                            <td className="py-2.5 px-4 text-white">{f.nom}</td>
                            <td className="py-2.5 px-4 text-slate-300 text-right">{f.nombreInscrits} inscrits</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </>
          ) : (
            <p className="text-slate-400 text-[13px]">Aucune donnée disponible.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RapportsPage() {
  return (
    <RequireRole allowed={["directeur", "coordonnateur"]}>
      <RapportsContent />
    </RequireRole>
  );
}