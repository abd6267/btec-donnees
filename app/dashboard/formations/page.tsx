"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ClipboardList, Users, CheckCircle2, XCircle, Clock, Home, Search,
  Plus, X, Calendar, Headphones,
} from "lucide-react";
import RequireRole from "../../components/RequireRole";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import StatCard from "../../components/StatCard";
import Avatar from "../../components/Avatar";

const GREEN = "#16a34a";

type Candidat = {
  id: string;
  nom: string;
  prenom: string;
  photoPath: string | null;
};

type Formation = {
  id: string;
  nom: string;
};

type Formateur = {
  id: string;
  domaine: string;
};

type Inscription = {
  id: string;
  statut: string;
  resultat: string | null;
  mention: string | null;
  attestationPath: string | null;
  dateDebut: string | null;
  dateFin: string | null;
  createdAt: string;
  candidat: Candidat;
  formation: Formation;
  formateur: Formateur | null;
};

const STATUT_LABELS: Record<string, string> = {
  EN_FORMATION: "En formation",
  TERMINE: "Terminé",
  REUSSI: "Réussi",
  ECHOUE: "Échoué",
  ABANDONNE: "Abandonné",
};

const STATUT_COLORS: Record<string, string> = {
  EN_FORMATION: "text-blue-600",
  TERMINE: "text-purple-600",
  REUSSI: "text-emerald-600",
  ECHOUE: "text-red-600",
  ABANDONNE: "text-slate-500",
};

function FormationContent() {
  const [inscriptions, setInscriptions] = useState<Inscription[]>([]);
  const [candidats, setCandidats] = useState<Candidat[]>([]);
  const [formations, setFormations] = useState<Formation[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtres
  const [filtreStatut, setFiltreStatut] = useState<string>("TOUS");
  const [recherche, setRecherche] = useState<string>("");

  // Statut en cours de modification (pour désactiver le select le temps de la requête)
  const [statutEnCours, setStatutEnCours] = useState<string | null>(null);

  // Modale de création rapide
  const [showModal, setShowModal] = useState(false);
  const [candidatId, setCandidatId] = useState("");
  const [formationId, setFormationId] = useState("");
  const [dateDebut, setDateDebut] = useState("");
  const [saving, setSaving] = useState(false);
  const [erreur, setErreur] = useState("");

  const charger = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/inscriptions").then((r) => r.json()),
      fetch("/api/candidats/list").then((r) => r.json()).catch(() => []),
      fetch("/api/formations/list").then((r) => r.json()).catch(() => []),
    ])
      .then(([insc, cand, form]) => {
        setInscriptions(Array.isArray(insc) ? insc : []);
        setCandidats(Array.isArray(cand) ? cand : []);
        setFormations(Array.isArray(form) ? form : []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    charger();
  }, []);

  const total = inscriptions.length;
  const enFormation = inscriptions.filter((i) => i.statut === "EN_FORMATION").length;
  const reussis = inscriptions.filter((i) => i.statut === "REUSSI").length;
  const echoues = inscriptions.filter((i) => i.statut === "ECHOUE" || i.statut === "ABANDONNE").length;

  const stats = [
    { icon: ClipboardList, value: total, label: "Total Inscriptions", sub: "Toutes formations", color: "#16a34a", statutKey: "TOUS" },
    { icon: Clock, value: enFormation, label: "En Formation", sub: "En cours", color: "#2563eb", statutKey: "EN_FORMATION" },
    { icon: CheckCircle2, value: reussis, label: "Réussis", sub: "Formations validées", color: "#9333ea", statutKey: "REUSSI" },
    { icon: XCircle, value: echoues, label: "Échoués / Abandons", sub: "À suivre", color: "#ef4444", statutKey: "ECHOUE" },
  ];

  const norm = (v: string | null | undefined) => (v || "").trim().toLowerCase();

  const inscriptionsFiltrees = useMemo(() => {
    return inscriptions.filter((i) => {
      if (filtreStatut !== "TOUS") {
        if (filtreStatut === "ECHOUE") {
          if (i.statut !== "ECHOUE" && i.statut !== "ABANDONNE") return false;
        } else if (i.statut !== filtreStatut) {
          return false;
        }
      }
      if (recherche.trim()) {
        const q = norm(recherche);
        const haystack = norm(`${i.candidat?.nom} ${i.candidat?.prenom} ${i.formation?.nom}`);
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [inscriptions, filtreStatut, recherche]);

  const handleChangerStatut = async (inscriptionId: string, nouveauStatut: string) => {
    setStatutEnCours(inscriptionId);
    try {
      const res = await fetch("/api/inscriptions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: inscriptionId, statut: nouveauStatut }),
      });
      if (!res.ok) throw new Error("Échec de la mise à jour du statut");
      setInscriptions((prev) =>
        prev.map((i) => (i.id === inscriptionId ? { ...i, statut: nouveauStatut } : i))
      );
    } catch {
      // en cas d'échec, le select réaffichera l'ancien statut au prochain rendu
    } finally {
      setStatutEnCours(null);
    }
  };

  const resetForm = () => {
    setCandidatId("");
    setFormationId("");
    setDateDebut("");
    setErreur("");
  };

  const creerInscription = async () => {
    if (!candidatId || !formationId) {
      setErreur("Sélectionnez un candidat et une formation.");
      return;
    }
    setSaving(true);
    setErreur("");
    try {
      const res = await fetch("/api/inscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidatId,
          formationId,
          dateDebut: dateDebut || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Échec de la création de l'inscription");
      }
      setShowModal(false);
      resetForm();
      charger();
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f4f6f8]">
      <Sidebar active="formation" />
      <div className="flex-1 flex flex-col">
        <Topbar placeholder="Rechercher une inscription..." />
        <div className="p-6">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                <ClipboardList size={17} style={{ color: GREEN }} />
              </div>
              <h1 className="text-[22px] font-bold text-slate-900">Suivi des Inscriptions</h1>
            </div>
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-[13px] font-semibold text-white"
              style={{ backgroundColor: GREEN }}
            >
              <Plus size={15} /> Nouvelle Inscription
            </button>
          </div>
          <p className="text-slate-400 text-[12px] flex items-center gap-1.5 mb-5 ml-11">
            <Home size={11} /> Accueil <span className="text-slate-300">&rsaquo;</span> Session Candidat{" "}
            <span className="text-slate-300">&rsaquo;</span> Suivi des Inscriptions
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

          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm mb-4">
            <div className="relative max-w-xs">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
                placeholder="Rechercher (candidat, formation...)"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-2 text-[12px] text-slate-700 outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {loading ? (
              <p className="text-slate-400 p-6 text-[13px]">Chargement...</p>
            ) : inscriptionsFiltrees.length === 0 ? (
              <div className="p-10 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mb-3">
                  <ClipboardList size={22} style={{ color: GREEN }} />
                </div>
                <p className="text-slate-800 text-[13px] font-medium">Aucune inscription</p>
                <p className="text-slate-400 text-[12px] mt-1">
                  Inscrivez un candidat à une formation pour commencer le suivi.
                </p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="text-slate-400 text-[11px] tracking-wide border-b border-slate-100 bg-slate-50">
                    <th className="py-3 px-4 font-medium">Candidat</th>
                    <th className="py-3 px-4 font-medium">Formation</th>
                    <th className="py-3 px-4 font-medium">Formateur</th>
                    <th className="py-3 px-4 font-medium">Période</th>
                    <th className="py-3 px-4 font-medium">Statut</th>
                    <th className="py-3 px-4 font-medium">Résultat / Mention</th>
                    <th className="py-3 px-4 font-medium">Attestation</th>
                  </tr>
                </thead>
                <tbody>
                  {inscriptionsFiltrees.map((i) => (
                    <tr key={i.id} className="border-b border-slate-100 last:border-0 text-[12.5px] hover:bg-slate-50/60">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Avatar photoPath={i.candidat?.photoPath} nom={i.candidat?.nom} prenom={i.candidat?.prenom} />
                          <span className="text-slate-800 font-medium">
                            {i.candidat?.nom} {i.candidat?.prenom}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-700">{i.formation?.nom}</td>
                      <td className="py-3 px-4 text-slate-700">
                        {i.formateur ? i.formateur.domaine : <span className="text-slate-400">—</span>}
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-[11.5px]">
                        {i.dateDebut ? new Date(i.dateDebut).toLocaleDateString("fr-FR") : "—"}
                        {" → "}
                        {i.dateFin ? new Date(i.dateFin).toLocaleDateString("fr-FR") : "—"}
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={i.statut}
                          disabled={statutEnCours === i.id}
                          onChange={(e) => handleChangerStatut(i.id, e.target.value)}
                          className={`bg-slate-50 border border-slate-200 rounded text-[11.5px] px-1.5 py-1 outline-none cursor-pointer disabled:opacity-50 disabled:cursor-wait font-medium ${STATUT_COLORS[i.statut] || "text-slate-700"}`}
                        >
                          {Object.entries(STATUT_LABELS).map(([k, v]) => (
                            <option key={k} value={k}>{v}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {i.resultat || i.mention ? (
                          <>
                            {i.resultat && <span>{i.resultat}</span>}
                            {i.mention && <span className="text-slate-400"> · {i.mention}</span>}
                          </>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {i.attestationPath ? (
                          <a href={i.attestationPath} target="_blank" className="text-blue-600 hover:underline text-[11px]">
                            Voir
                          </a>
                        ) : (
                          <span className="text-slate-300 text-[11px]">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="mx-3 mt-5 rounded-lg bg-white p-3 flex items-center gap-2.5 max-w-xs border border-slate-200 shadow-sm">
            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
              <Headphones size={16} style={{ color: GREEN }} />
            </div>
            <div className="text-[11px] leading-tight">
              <p className="font-semibold text-slate-900">BESOIN D&apos;AIDE ?</p>
              <p className="text-slate-400">Contactez l&apos;administrateur</p>
              <p className="text-slate-400">support@btecbenin.com</p>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-sm p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-slate-900 font-semibold text-[15px]">Nouvelle inscription</h2>
              <button type="button" onClick={() => setShowModal(false)}>
                <X size={16} className="text-slate-400 hover:text-slate-700" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-slate-500 block mb-1">Candidat</label>
                <select
                  value={candidatId}
                  onChange={(e) => setCandidatId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-[13px] text-slate-800 outline-none"
                >
                  <option value="">Sélectionner un candidat</option>
                  {candidats.map((c) => (
                    <option key={c.id} value={c.id}>{c.nom} {c.prenom}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] text-slate-500 block mb-1">Formation</label>
                <select
                  value={formationId}
                  onChange={(e) => setFormationId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-[13px] text-slate-800 outline-none"
                >
                  <option value="">Sélectionner une formation</option>
                  {formations.map((f) => (
                    <option key={f.id} value={f.id}>{f.nom}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] text-slate-500 block mb-1">Date de début (optionnel)</label>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                  <input
                    type="date"
                    value={dateDebut}
                    onChange={(e) => setDateDebut(e.target.value)}
                    className="bg-transparent text-[13px] text-slate-800 outline-none w-full"
                  />
                  <Calendar size={13} className="text-slate-400 shrink-0" />
                </div>
              </div>

              {erreur && <p className="text-red-600 text-[11.5px]">{erreur}</p>}
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg text-[13px] text-slate-500 hover:bg-slate-50"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={creerInscription}
                disabled={saving}
                className="px-4 py-2 rounded-lg text-[13px] text-white disabled:opacity-50"
                style={{ backgroundColor: GREEN }}
              >
                {saving ? "Création..." : "Créer l'inscription"}
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