"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Calendar, CheckCircle2, GraduationCap, Briefcase, UserX,
  Home, Clock, Building2,
} from "lucide-react";
import RequireRole from "../../../components/RequireRole";
import Sidebar from "../../../components/Sidebar";
import Topbar from "../../../components/Topbar";
import Avatar from "../../../components/Avatar";

const GREEN = "#16a34a";

type Entretien = {
  id: string;
  dateEntretien: string;
  notes: string | null;
  statut: "PREVU" | "REALISE" | "ANNULE";
};

type Employe = {
  id: string;
  statutEmploi: "EN_ATTENTE" | "EMBAUCHE" | "DEBAUCHE";
  poste: string | null;
  dateEmbauche: string | null;
  dateDepart: string | null;
  motifDepart: string | null;
  motifDepartType: string | null;
  salaire: number | null;
  typeContrat: string | null;
  dureeContrat: string | null;
  responsablePlacement: string | null;
  entreprise: { id: string; nom: string } | null;
  createdAt: string;
};

type CandidatDetail = {
  id: string;
  numeroDossier: string;
  nom: string;
  prenom: string;
  photoPath: string | null;
  telephone: string;
  email: string | null;
  posteRecherche: string;
  statut: string;
  entretiens: Entretien[];
  employes: Employe[];
};

type Entreprise = { id: string; nom: string };

const STATUT_LABELS: Record<string, string> = {
  NOUVEAU: "Nouveau", DOSSIER_INCOMPLET: "Dossier incomplet", EN_ETUDE: "En étude",
  VALIDE: "Validé", REFUSE: "Refusé",
};

const MOTIF_DEPART_LABELS: Record<string, string> = {
  DEMISSION: "Démission",
  LICENCIEMENT: "Licenciement",
  FIN_CONTRAT: "Fin de contrat",
  MUTATION: "Mutation",
  AUTRE: "Autre",
};

function CandidatDetailContent() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [candidat, setCandidat] = useState<CandidatDetail | null>(null);
  const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showEntretienForm, setShowEntretienForm] = useState(false);
  const [dateEntretien, setDateEntretien] = useState("");

  const [showEmbaucheForm, setShowEmbaucheForm] = useState(false);
  const [entrepriseId, setEntrepriseId] = useState("");
  const [posteEmbauche, setPosteEmbauche] = useState("");
  const [salaire, setSalaire] = useState("");
  const [typeContrat, setTypeContrat] = useState("");
  const [dureeContrat, setDureeContrat] = useState("");
  const [responsablePlacement, setResponsablePlacement] = useState("");
  const [dateEmbauche, setDateEmbauche] = useState("");

  const [showDebaucheForm, setShowDebaucheForm] = useState(false);
  const [motifDepart, setMotifDepart] = useState("");
  const [motifDepartType, setMotifDepartType] = useState("");
  const [dateDepart, setDateDepart] = useState("");

  const load = useCallback(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/candidats/${id}`)
      .then((res) => res.json())
      .then((d) => {
        setCandidat(d);
        setLoading(false);
      });
  }, [id]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    fetch("/api/entreprises/list")
      .then((res) => res.json())
      .then((d) => setEntreprises(d))
      .catch(() => setEntreprises([]));
  }, []);

  async function runAction(action: string, payload: Record<string, unknown> = {}) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/candidats/${id}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...payload }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Une erreur est survenue.");
      } else {
        load();
        setShowEntretienForm(false);
        setShowEmbaucheForm(false);
        setShowDebaucheForm(false);
        setDateEntretien("");
        setEntrepriseId("");
        setPosteEmbauche("");
        setSalaire("");
        setTypeContrat("");
        setDureeContrat("");
        setResponsablePlacement("");
        setDateEmbauche("");
        setMotifDepart("");
        setMotifDepartType("");
        setDateDepart("");
      }
    } catch {
      setError("Impossible de contacter le serveur.");
    } finally {
      setBusy(false);
    }
  }

  if (loading || !candidat) {
    return (
      <div className="flex min-h-screen bg-[#0a0a0a]">
        <Sidebar active="candidats" />
        <div className="flex-1 flex flex-col">
          <Topbar />
          <div className="p-6"><p className="text-slate-400 text-[13px]">Chargement...</p></div>
        </div>
      </div>
    );
  }

  const dernierEmploye = candidat.employes[0] ?? null;
  const dernierEntretien = candidat.entretiens[0] ?? null;
  const entretienRealise = candidat.entretiens.some((e) => e.statut === "REALISE");
  const estActuellementEmbauche = dernierEmploye?.statutEmploi === "EMBAUCHE";

  // Entretien : librement planifiable, sauf s'il y en a déjà un PREVU ou si le candidat est embauché.
  const peutPlanifierEntretien = dernierEntretien?.statut !== "PREVU" && !estActuellementEmbauche;
  const peutMarquerRealise = dernierEntretien?.statut === "PREVU";

  // Formation : librement déclenchable, sauf si un cycle Employe est déjà actif (EN_ATTENTE ou EMBAUCHE).
  const enCycleEmployeActif = dernierEmploye && dernierEmploye.statutEmploi !== "DEBAUCHE";
  const peutPasserFormation = !enCycleEmployeActif;

  // Embauche : seul prérequis réel = un entretien réalisé. La formation est optionnelle.
  const peutEmbaucher = entretienRealise && (dernierEmploye?.statutEmploi === "EN_ATTENTE" || !enCycleEmployeActif);

  const peutDebaucher = dernierEmploye?.statutEmploi === "EMBAUCHE";

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      <Sidebar active="candidats" />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <div className="p-6 max-w-4xl">
          <button
            onClick={() => router.push("/dashboard/candidats")}
            className="flex items-center gap-1.5 text-slate-400 text-[12px] mb-3 hover:text-white"
          >
            <ArrowLeft size={14} /> Retour aux dossiers
          </button>

          <div className="flex items-center gap-4 mb-2">
            <Avatar photoPath={candidat.photoPath} nom={candidat.nom} prenom={candidat.prenom} />
            <div>
              <h1 className="text-[22px] font-bold text-white">{candidat.nom} {candidat.prenom}</h1>
              <p className="text-slate-400 text-[12px]">
                {candidat.numeroDossier} · {candidat.posteRecherche} · {candidat.telephone}
              </p>
            </div>
          </div>
          <p className="text-slate-500 text-[12px] flex items-center gap-1.5 mb-5">
            <Home size={11} /> Accueil <span className="text-slate-700">›</span> Dossiers de Candidature{" "}
            <span className="text-slate-700">›</span> {candidat.nom} {candidat.prenom}
          </p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-[12.5px] rounded-lg p-3 mb-4">
              {error}
            </div>
          )}

          <div className="bg-[#111827] rounded-xl p-4 border border-white/5 mb-4">
            <p className="text-white text-[13px] font-semibold tracking-wide mb-3">PARCOURS DU CANDIDAT</p>

            <div className="flex flex-col gap-3">
              {/* Étape entretien */}
              <div className="flex items-center justify-between bg-black/30 rounded-lg p-3">
                <div className="flex items-center gap-2.5">
                  <Calendar size={16} className="text-blue-400" />
                  <div>
                    <p className="text-white text-[12.5px] font-medium">Entretien</p>
                    <p className="text-slate-500 text-[11px]">
                      {dernierEntretien
                        ? `${new Date(dernierEntretien.dateEntretien).toLocaleDateString("fr-FR")} — ${dernierEntretien.statut}`
                        : "Aucun entretien"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {peutPlanifierEntretien && !showEntretienForm && (
                    <button
                      onClick={() => setShowEntretienForm(true)}
                      className="text-[11.5px] font-semibold text-white rounded-lg px-3 py-1.5"
                      style={{ backgroundColor: GREEN }}
                    >
                      Planifier
                    </button>
                  )}
                  {peutMarquerRealise && (
                    <button
                      disabled={busy}
                      onClick={() => runAction("MARQUER_ENTRETIEN_REALISE")}
                      className="text-[11.5px] font-semibold text-white rounded-lg px-3 py-1.5 bg-blue-600 disabled:opacity-50"
                    >
                      Marquer réalisé
                    </button>
                  )}
                </div>
              </div>

              {showEntretienForm && (
                <div className="bg-black/20 rounded-lg p-3 flex items-center gap-2">
                  <input
                    type="datetime-local"
                    value={dateEntretien}
                    onChange={(e) => setDateEntretien(e.target.value)}
                    className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-[12px] text-slate-300 outline-none"
                  />
                  <button
                    disabled={busy || !dateEntretien}
                    onClick={() => runAction("PLANIFIER_ENTRETIEN", { dateEntretien })}
                    className="text-[11.5px] font-semibold text-white rounded-lg px-3 py-2 disabled:opacity-50"
                    style={{ backgroundColor: GREEN }}
                  >
                    Confirmer
                  </button>
                  <button
                    onClick={() => setShowEntretienForm(false)}
                    className="text-[11.5px] text-slate-400 px-2"
                  >
                    Annuler
                  </button>
                </div>
              )}

              {/* Étape formation */}
              <div className="flex items-center justify-between bg-black/30 rounded-lg p-3">
                <div className="flex items-center gap-2.5">
                  <GraduationCap size={16} className="text-emerald-400" />
                  <div>
                    <p className="text-white text-[12.5px] font-medium">Formé (en attente d&apos;insertion)</p>
                    <p className="text-slate-500 text-[11px]">
                      {dernierEmploye?.statutEmploi === "EN_ATTENTE"
                        ? `Depuis le ${new Date(dernierEmploye.createdAt).toLocaleDateString("fr-FR")}`
                        : "Pas encore atteint"}
                    </p>
                  </div>
                </div>
                {peutPasserFormation && (
                  <button
                    disabled={busy}
                    onClick={() => runAction("PASSER_EN_FORMATION")}
                    className="text-[11.5px] font-semibold text-white rounded-lg px-3 py-1.5 disabled:opacity-50"
                    style={{ backgroundColor: GREEN }}
                  >
                    Passer en formation
                  </button>
                )}
              </div>

              {/* Étape embauche */}
              <div className="flex items-center justify-between bg-black/30 rounded-lg p-3">
                <div className="flex items-center gap-2.5">
                  <Briefcase size={16} className="text-emerald-400" />
                  <div>
                    <p className="text-white text-[12.5px] font-medium">Embauché</p>
                    <p className="text-slate-500 text-[11px]">
                      {dernierEmploye?.statutEmploi === "EMBAUCHE" || dernierEmploye?.statutEmploi === "DEBAUCHE"
                        ? `${dernierEmploye.entreprise?.nom ?? "—"} · ${dernierEmploye.poste ?? ""} · ${dernierEmploye.salaire ? dernierEmploye.salaire.toLocaleString("fr-FR") + " FCFA" : ""} · ${dernierEmploye.dateEmbauche ? new Date(dernierEmploye.dateEmbauche).toLocaleDateString("fr-FR") : ""}`
                        : !entretienRealise
                        ? "Nécessite un entretien réalisé"
                        : "Pas encore atteint"}
                    </p>
                  </div>
                </div>
                {peutEmbaucher && !showEmbaucheForm && (
                  <button
                    onClick={() => setShowEmbaucheForm(true)}
                    className="text-[11.5px] font-semibold text-white rounded-lg px-3 py-1.5"
                    style={{ backgroundColor: GREEN }}
                  >
                    Embaucher
                  </button>
                )}
              </div>

              {showEmbaucheForm && (
                <div className="bg-black/20 rounded-lg p-3 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                      <Building2 size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <select
                        value={entrepriseId}
                        onChange={(e) => setEntrepriseId(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg pl-8 pr-3 py-2 text-[12px] text-slate-300 outline-none"
                      >
                        <option value="">Choisir une entreprise...</option>
                        {entreprises.map((e) => (
                          <option key={e.id} value={e.id}>{e.nom}</option>
                        ))}
                      </select>
                    </div>
                    <input
                      placeholder="Poste"
                      value={posteEmbauche}
                      onChange={(e) => setPosteEmbauche(e.target.value)}
                      className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-[12px] text-slate-300 outline-none placeholder:text-slate-600"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="number"
                      placeholder="Salaire (FCFA)"
                      value={salaire}
                      onChange={(e) => setSalaire(e.target.value)}
                      className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-[12px] text-slate-300 outline-none placeholder:text-slate-600"
                    />
                    <select
                      value={typeContrat}
                      onChange={(e) => setTypeContrat(e.target.value)}
                      className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-[12px] text-slate-300 outline-none"
                    >
                      <option value="">Type de contrat</option>
                      <option value="CDD">CDD</option>
                      <option value="CDI">CDI</option>
                      <option value="STAGE">Stage</option>
                      <option value="ESSAI">Essai</option>
                      <option value="AUTRE">Autre</option>
                    </select>
                    <input
                      placeholder="Durée du contrat"
                      value={dureeContrat}
                      onChange={(e) => setDureeContrat(e.target.value)}
                      className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-[12px] text-slate-300 outline-none placeholder:text-slate-600"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      placeholder="Responsable du placement"
                      value={responsablePlacement}
                      onChange={(e) => setResponsablePlacement(e.target.value)}
                      className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-[12px] text-slate-300 outline-none placeholder:text-slate-600"
                    />
                    <input
                      type="date"
                      value={dateEmbauche}
                      onChange={(e) => setDateEmbauche(e.target.value)}
                      className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-[12px] text-slate-300 outline-none [color-scheme:dark]"
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => setShowEmbaucheForm(false)}
                      className="text-[11.5px] text-slate-400 px-2"
                    >
                      Annuler
                    </button>
                    <button
                      disabled={busy || !entrepriseId}
                      onClick={() => runAction("EMBAUCHER", {
                        entrepriseId,
                        poste: posteEmbauche || undefined,
                        salaire: salaire || undefined,
                        typeContrat: typeContrat || undefined,
                        dureeContrat: dureeContrat || undefined,
                        responsablePlacement: responsablePlacement || undefined,
                        dateEmbauche: dateEmbauche || undefined,
                      })}
                      className="text-[11.5px] font-semibold text-white rounded-lg px-3 py-2 disabled:opacity-50"
                      style={{ backgroundColor: GREEN }}
                    >
                      Confirmer l&apos;embauche
                    </button>
                  </div>
                </div>
              )}

              {/* Étape débauche */}
              <div className="flex items-center justify-between bg-black/30 rounded-lg p-3">
                <div className="flex items-center gap-2.5">
                  <UserX size={16} className="text-red-400" />
                  <div>
                    <p className="text-white text-[12.5px] font-medium">Débauché</p>
                    <p className="text-slate-500 text-[11px]">
                      {dernierEmploye?.statutEmploi === "DEBAUCHE"
                        ? `${dernierEmploye.dateDepart ? new Date(dernierEmploye.dateDepart).toLocaleDateString("fr-FR") : ""} ${dernierEmploye.motifDepartType ? "— " + MOTIF_DEPART_LABELS[dernierEmploye.motifDepartType] : dernierEmploye.motifDepart ? "— " + dernierEmploye.motifDepart : ""}`
                        : "Pas encore atteint"}
                    </p>
                  </div>
                </div>
                {peutDebaucher && !showDebaucheForm && (
                  <button
                    onClick={() => setShowDebaucheForm(true)}
                    className="text-[11.5px] font-semibold text-white rounded-lg px-3 py-1.5 bg-red-600"
                  >
                    Débaucher
                  </button>
                )}
              </div>

              {showDebaucheForm && (
                <div className="bg-black/20 rounded-lg p-3 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={motifDepartType}
                      onChange={(e) => setMotifDepartType(e.target.value)}
                      className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-[12px] text-slate-300 outline-none"
                    >
                      <option value="">Motif du départ</option>
                      <option value="DEMISSION">Démission</option>
                      <option value="LICENCIEMENT">Licenciement</option>
                      <option value="FIN_CONTRAT">Fin de contrat</option>
                      <option value="MUTATION">Mutation</option>
                      <option value="AUTRE">Autre</option>
                    </select>
                    <input
                      type="date"
                      value={dateDepart}
                      onChange={(e) => setDateDepart(e.target.value)}
                      className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-[12px] text-slate-300 outline-none [color-scheme:dark]"
                    />
                  </div>
                  <input
                    placeholder="Détail / commentaire (optionnel)"
                    value={motifDepart}
                    onChange={(e) => setMotifDepart(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-[12px] text-slate-300 outline-none placeholder:text-slate-600"
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => setShowDebaucheForm(false)}
                      className="text-[11.5px] text-slate-400 px-2"
                    >
                      Annuler
                    </button>
                    <button
                      disabled={busy}
                      onClick={() => runAction("DEBAUCHER", {
                        motifDepart: motifDepart || undefined,
                        motifDepartType: motifDepartType || undefined,
                        dateDepart: dateDepart || undefined,
                      })}
                      className="text-[11.5px] font-semibold text-white rounded-lg px-3 py-2 bg-red-600 disabled:opacity-50"
                    >
                      Confirmer le départ
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Historique */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#111827] rounded-xl p-4 border border-white/5">
              <p className="text-white text-[13px] font-semibold tracking-wide mb-3">HISTORIQUE DES ENTRETIENS</p>
              {candidat.entretiens.length === 0 ? (
                <p className="text-slate-500 text-[12px]">Aucun entretien.</p>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {candidat.entretiens.map((e) => (
                    <div key={e.id} className="flex items-center gap-2.5 text-[12px]">
                      <Clock size={13} className="text-slate-500 shrink-0" />
                      <span className="text-slate-300">{new Date(e.dateEntretien).toLocaleString("fr-FR")}</span>
                      <span className={
                        e.statut === "REALISE" ? "text-emerald-400" :
                        e.statut === "ANNULE" ? "text-red-400" : "text-blue-400"
                      }>
                        {e.statut}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-[#111827] rounded-xl p-4 border border-white/5">
              <p className="text-white text-[13px] font-semibold tracking-wide mb-3">HISTORIQUE EMPLOI</p>
              {candidat.employes.length === 0 ? (
                <p className="text-slate-500 text-[12px]">Aucun cycle d&apos;emploi.</p>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {candidat.employes.map((e) => (
                    <div key={e.id} className="flex items-center gap-2.5 text-[12px]">
                      <CheckCircle2 size={13} className="text-slate-500 shrink-0" />
                      <span className="text-slate-300">{e.entreprise?.nom ?? "—"}</span>
                      <span className={
                        e.statutEmploi === "EMBAUCHE" ? "text-emerald-400" :
                        e.statutEmploi === "DEBAUCHE" ? "text-red-400" : "text-yellow-400"
                      }>
                        {e.statutEmploi}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CandidatDetailPage() {
  return (
    <RequireRole allowed={["directeur", "coordonnateur", "secretaire"]}>
      <CandidatDetailContent />
    </RequireRole>
  );
}