"use client";

import { useEffect, useState } from "react";
import { GraduationCap, Home, X, Award, Calendar } from "lucide-react";
import RequireRole from "../../components/RequireRole";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import StatCard from "../../components/StatCard";
import Avatar from "../../components/Avatar";

const GREEN = "#16a34a";

type Inscription = {
  id: string;
  candidat: {
    id: string;
    nom: string;
    prenom: string;
    photoPath: string | null;
  };
  formation: {
    id: string;
    nom: string;
  };
  formateur: {
    id: string;
    domaine: string;
  } | null;
  dateDebut: string | null;
  dateFin: string | null;
  statut: string;
  resultat: string | null;
  mention: string | null;
  attestationPath: string | null;
};

const STATUT_LABELS: Record<string, string> = {
  EN_FORMATION: "En formation",
  FORMATION_TERMINEE: "Formation terminée",
  EN_ATTENTE_INSERTION: "En attente d'insertion",
  ABANDON: "Abandon",
};

const STATUT_COLORS: Record<string, string> = {
  EN_FORMATION: "text-blue-600",
  FORMATION_TERMINEE: "text-emerald-600",
  EN_ATTENTE_INSERTION: "text-orange-600",
  ABANDON: "text-red-600",
};

const RESULTAT_LABELS: Record<string, string> = {
  REUSSI: "Réussi",
  ECHOUE: "Échoué",
  EN_COURS: "En cours",
};

const RESULTAT_COLORS: Record<string, string> = {
  REUSSI: "text-emerald-600",
  ECHOUE: "text-red-600",
  EN_COURS: "text-slate-500",
};

function FormationContent() {
  const [inscriptions, setInscriptions] = useState<Inscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtreStatut, setFiltreStatut] = useState<string>("TOUS");
  const [editInscription, setEditInscription] = useState<Inscription | null>(null);
  const [saving, setSaving] = useState(false);

  const [editStatut, setEditStatut] = useState("");
  const [editResultat, setEditResultat] = useState("");
  const [editMention, setEditMention] = useState("");
  const [editDateDebut, setEditDateDebut] = useState("");
  const [editDateFin, setEditDateFin] = useState("");

  const charger = () => {
    setLoading(true);
    fetch("/api/inscriptions")
      .then((r) => r.json())
      .then((data) => setInscriptions(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    charger();
  }, []);

  const total = inscriptions.length;
  const enFormation = inscriptions.filter((i) => i.statut === "EN_FORMATION").length;
  const terminees = inscriptions.filter((i) => i.statut === "FORMATION_TERMINEE").length;
  const enAttenteInsertion = inscriptions.filter((i) => i.statut === "EN_ATTENTE_INSERTION").length;

  const stats = [
    { icon: GraduationCap, value: total, label: "Total Historique", sub: "Toutes les formations", color: "#16a34a", statutKey: "TOUS" },
    { icon: Calendar, value: enFormation, label: "En Formation", sub: "En cours", color: "#2563eb", statutKey: "EN_FORMATION" },
    { icon: Award, value: terminees, label: "Formations Terminées", sub: "Achevées", color: GREEN, statutKey: "FORMATION_TERMINEE" },
    { icon: GraduationCap, value: enAttenteInsertion, label: "En Attente d'Insertion", sub: "À placer", color: "#f97316", statutKey: "EN_ATTENTE_INSERTION" },
  ];

  const inscriptionsFiltrees = filtreStatut === "TOUS"
    ? inscriptions
    : inscriptions.filter((i) => i.statut === filtreStatut);

  const ouvrirEdition = (i: Inscription) => {
    setEditInscription(i);
    setEditStatut(i.statut);
    setEditResultat(i.resultat || "");
    setEditMention(i.mention || "");
    setEditDateDebut(i.dateDebut ? i.dateDebut.slice(0, 10) : "");
    setEditDateFin(i.dateFin ? i.dateFin.slice(0, 10) : "");
  };

  const enregistrerEdition = async () => {
    if (!editInscription) return;
    setSaving(true);
    try {
      const res = await fetch("/api/inscriptions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editInscription.id,
          statut: editStatut,
          resultat: editResultat || null,
          mention: editMention || null,
          dateDebut: editDateDebut || null,
          dateFin: editDateFin || null,
        }),
      });
      if (!res.ok) throw new Error("Echec de la mise a jour");
      setEditInscription(null);
      charger();
    } catch {
      // en cas d'echec on laisse le modal ouvert pour reessayer
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f4f6f8]">
      <Sidebar active="formation" />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <div className="p-6">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
              <GraduationCap size={17} style={{ color: GREEN }} />
            </div>
            <h1 className="text-[22px] font-bold text-slate-900">Formation</h1>
          </div>
          <p className="text-slate-400 text-[12px] flex items-center gap-1.5 mb-5 ml-11">
            <Home size={11} /> Accueil <span className="text-slate-300">&rsaquo;</span> Historique de formation des candidats
          </p>

          <div className="grid grid-cols-4 gap-3 mb-5">
            {stats.map((s, i) => (
              <StatCard
                key={i}
                icon={s.icon}
                value={s.value}
                label={s.label}
                sub={s.sub}
                color={s.color}
                active={filtreStatut === s.statutKey}
                onClick={() => setFiltreStatut(s.statutKey)}
              />
            ))}
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {loading ? (
              <p className="text-slate-400 p-6 text-[13px]">Chargement...</p>
            ) : inscriptionsFiltrees.length === 0 ? (
              <div className="p-10 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mb-3">
                  <GraduationCap size={22} style={{ color: GREEN }} />
                </div>
                <p className="text-slate-800 text-[13px] font-medium">Aucun historique de formation</p>
                <p className="text-slate-400 text-[12px] mt-1">
                  Les inscriptions aux formations s&apos;afficheront ici.
                </p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="text-slate-400 text-[11px] tracking-wide border-b border-slate-100 bg-slate-50">
                    <th className="py-3 px-4 font-medium">Candidat</th>
                    <th className="py-3 px-4 font-medium">Formation suivie</th>
                    <th className="py-3 px-4 font-medium">Formateur</th>
                    <th className="py-3 px-4 font-medium">Début</th>
                    <th className="py-3 px-4 font-medium">Fin</th>
                    <th className="py-3 px-4 font-medium">Résultat</th>
                    <th className="py-3 px-4 font-medium">Mention</th>
                    <th className="py-3 px-4 font-medium">Attestation</th>
                    <th className="py-3 px-4 font-medium">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {inscriptionsFiltrees.map((i) => (
                    <tr
                      key={i.id}
                      onClick={() => ouvrirEdition(i)}
                      className="border-b border-slate-100 last:border-0 text-[12.5px] hover:bg-slate-50/60 cursor-pointer"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Avatar photoPath={i.candidat.photoPath} nom={i.candidat.nom} prenom={i.candidat.prenom} />
                          <span className="text-slate-800 font-medium">{i.candidat.nom} {i.candidat.prenom}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-700">{i.formation.nom}</td>
                      <td className="py-3 px-4 text-slate-500">
                        {i.formateur ? i.formateur.domaine : "—"}
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {i.dateDebut ? new Date(i.dateDebut).toLocaleDateString("fr-FR") : "—"}
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {i.dateFin ? new Date(i.dateFin).toLocaleDateString("fr-FR") : "—"}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-medium ${i.resultat ? RESULTAT_COLORS[i.resultat] : "text-slate-300"}`}>
                          {i.resultat ? RESULTAT_LABELS[i.resultat] : "—"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500">{i.mention || "—"}</td>
                      <td className="py-3 px-4">
                        {i.attestationPath ? (
                          <a
                            href={i.attestationPath}
                            target="_blank"
                            onClick={(e) => e.stopPropagation()}
                            className="text-blue-600 hover:underline"
                          >
                            Voir
                          </a>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-medium ${STATUT_COLORS[i.statut] || "text-slate-700"}`}>
                          {STATUT_LABELS[i.statut] || i.statut}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {editInscription && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-slate-900 font-semibold text-[15px]">
                  {editInscription.candidat.nom} {editInscription.candidat.prenom}
                </h2>
                <p className="text-slate-400 text-[12px]">{editInscription.formation.nom}</p>
              </div>
              <button onClick={() => setEditInscription(null)}>
                <X size={16} className="text-slate-400 hover:text-slate-700" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">Date de début</label>
                  <input
                    type="date"
                    value={editDateDebut}
                    onChange={(e) => setEditDateDebut(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-[13px] text-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">Date de fin</label>
                  <input
                    type="date"
                    value={editDateFin}
                    onChange={(e) => setEditDateFin(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-[13px] text-slate-800 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-500 block mb-1">Statut</label>
                <select
                  value={editStatut}
                  onChange={(e) => setEditStatut(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-[13px] text-slate-800 outline-none"
                >
                  {Object.entries(STATUT_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-500 block mb-1">Résultat</label>
                <select
                  value={editResultat}
                  onChange={(e) => setEditResultat(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-[13px] text-slate-800 outline-none"
                >
                  <option value="">—</option>
                  {Object.entries(RESULTAT_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-500 block mb-1">Mention</label>
                <input
                  value={editMention}
                  onChange={(e) => setEditMention(e.target.value)}
                  placeholder="Ex: Bien, Très bien..."
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-[13px] text-slate-800 outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setEditInscription(null)}
                className="px-4 py-2 rounded-lg text-[13px] text-slate-600 hover:bg-slate-50"
              >
                Annuler
              </button>
              <button
                onClick={enregistrerEdition}
                disabled={saving}
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

export default function FormationPage() {
  return (
    <RequireRole allowed={["directeur", "coordonnateur", "secretaire"]}>
      <FormationContent />
    </RequireRole>
  );
}