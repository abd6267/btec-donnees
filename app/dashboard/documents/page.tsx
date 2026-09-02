"use client";

import { useEffect, useState } from "react";
import { FileStack, Download, X } from "lucide-react";
import RequireRole from "../../components/RequireRole";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";

const GREEN = "#16a34a";

type DocType =
  | "CONTRAT_RECRUTEMENT" | "CONTRAT_FORMATION" | "CONTRAT_PARTENARIAT"
  | "RECU_PAIEMENT" | "FACTURE" | "ATTESTATION_FORMATION"
  | "CONVOCATION" | "LETTRE_EMBAUCHE" | "CERTIFICAT_TRAVAIL";

type DocumentItem = {
  id: string;
  type: DocType;
  filePath: string;
  genereLe: string;
  candidat: { nom: string; prenom: string } | null;
  entreprise: { nom: string } | null;
  inscription: { formation: { nom: string } } | null;
  paiement: { libelle: string } | null;
};

const TYPE_LABELS: Record<DocType, string> = {
  CONTRAT_RECRUTEMENT: "Contrat de recrutement",
  CONTRAT_FORMATION: "Contrat de formation",
  CONTRAT_PARTENARIAT: "Contrat de partenariat",
  RECU_PAIEMENT: "Reçu de paiement",
  FACTURE: "Facture",
  ATTESTATION_FORMATION: "Attestation de formation",
  CONVOCATION: "Convocation",
  LETTRE_EMBAUCHE: "Lettre d'embauche",
  CERTIFICAT_TRAVAIL: "Certificat de travail",
};

// Champs requis par type, pour construire dynamiquement le formulaire
const CHAMPS_PAR_TYPE: Record<DocType, string[]> = {
  CONTRAT_RECRUTEMENT: ["candidatId", "entrepriseId", "poste"],
  CONTRAT_FORMATION: ["inscriptionId"],
  CONTRAT_PARTENARIAT: ["entrepriseId"],
  RECU_PAIEMENT: ["paiementId"],
  FACTURE: ["paiementId"],
  ATTESTATION_FORMATION: ["inscriptionId"],
  CONVOCATION: ["candidatId", "dateEntretien"],
  LETTRE_EMBAUCHE: ["candidatId", "entrepriseId", "poste", "dateEmbauche"],
  CERTIFICAT_TRAVAIL: ["employeId"],
};

const CHAMP_LABELS: Record<string, string> = {
  candidatId: "Candidat",
  entrepriseId: "Entreprise",
  inscriptionId: "Inscription (formation)",
  paiementId: "Paiement",
  employeId: "Employé",
  poste: "Poste",
  dateEntretien: "Date de l'entretien",
  dateEmbauche: "Date d'embauche",
};

function DocumentsContent() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [typeChoisi, setTypeChoisi] = useState<DocType>("CONTRAT_RECRUTEMENT");
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [generating, setGenerating] = useState(false);
  const [erreur, setErreur] = useState("");

  // Listes pour les selects
  const [candidats, setCandidats] = useState<any[]>([]);
  const [entreprises, setEntreprises] = useState<any[]>([]);
  const [inscriptions, setInscriptions] = useState<any[]>([]);
  const [paiements, setPaiements] = useState<any[]>([]);
  const [employes, setEmployes] = useState<any[]>([]);

  const charger = () => {
    setLoading(true);
    fetch("/api/documents/list")
      .then((r) => r.json())
      .then((data) => setDocuments(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    charger();
  }, []);

  const ouvrirModal = () => {
    setFormValues({});
    setErreur("");
    setShowModal(true);
    // Charge les listes utiles pour les selects (silencieux si l'endpoint n'existe pas)
    fetch("/api/candidats/list").then((r) => r.json()).then(setCandidats).catch(() => {});
    fetch("/api/entreprises/list").then((r) => r.json()).then(setEntreprises).catch(() => {});
    fetch("/api/inscriptions/list").then((r) => r.json()).then(setInscriptions).catch(() => {});
    fetch("/api/paiements/list").then((r) => r.json()).then(setPaiements).catch(() => {});
    fetch("/api/employes/list").then((r) => r.json()).then(setEmployes).catch(() => {});
  };

  const champsRequis = CHAMPS_PAR_TYPE[typeChoisi];

  const generer = async () => {
    setErreur("");
    setGenerating(true);
    try {
      const res = await fetch("/api/documents/generer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: typeChoisi, ...formValues }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErreur(data.error || "Erreur lors de la génération");
        return;
      }
      setShowModal(false);
      charger();
      window.open(data.filePath, "_blank");
    } catch {
      setErreur("Erreur réseau lors de la génération");
    } finally {
      setGenerating(false);
    }
  };

  const renderChamp = (champ: string) => {
    const value = formValues[champ] || "";
    const setValue = (v: string) => setFormValues((f) => ({ ...f, [champ]: v }));

    if (champ === "candidatId") {
      return (
        <select value={value} onChange={(e) => setValue(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-[13px] text-white outline-none">
          <option value="">Sélectionner...</option>
          {candidats.map((c) => <option key={c.id} value={c.id}>{c.nom} {c.prenom}</option>)}
        </select>
      );
    }
    if (champ === "entrepriseId") {
      return (
        <select value={value} onChange={(e) => setValue(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-[13px] text-white outline-none">
          <option value="">Sélectionner...</option>
          {entreprises.map((e) => <option key={e.id} value={e.id}>{e.nom}</option>)}
        </select>
      );
    }
    if (champ === "inscriptionId") {
      return (
        <select value={value} onChange={(e) => setValue(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-[13px] text-white outline-none">
          <option value="">Sélectionner...</option>
          {inscriptions.map((i) => (
            <option key={i.id} value={i.id}>{i.candidat?.nom} {i.candidat?.prenom} — {i.formation?.nom}</option>
          ))}
        </select>
      );
    }
    if (champ === "paiementId") {
      return (
        <select value={value} onChange={(e) => setValue(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-[13px] text-white outline-none">
          <option value="">Sélectionner...</option>
          {paiements.map((p) => (
            <option key={p.id} value={p.id}>{p.libelle} — {p.montant?.toLocaleString("fr-FR")} FCFA</option>
          ))}
        </select>
      );
    }
    if (champ === "employeId") {
      return (
        <select value={value} onChange={(e) => setValue(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-[13px] text-white outline-none">
          <option value="">Sélectionner...</option>
          {employes.map((e) => (
            <option key={e.id} value={e.id}>{e.candidat?.nom} {e.candidat?.prenom} — {e.poste || "—"}</option>
          ))}
        </select>
      );
    }
    if (champ === "dateEntretien" || champ === "dateEmbauche") {
      return (
        <input
          type="date"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-[13px] text-white outline-none [color-scheme:dark]"
        />
      );
    }
    // poste ou autre champ texte libre
    return (
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-[13px] text-white outline-none"
      />
    );
  };

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      <Sidebar active="documents" />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <div className="p-6">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-emerald-600/15 flex items-center justify-center">
                <FileStack size={17} style={{ color: GREEN }} />
              </div>
              <h1 className="text-[22px] font-bold text-white">Documents</h1>
            </div>
            <button
              onClick={ouvrirModal}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-[12px] font-semibold text-white"
              style={{ backgroundColor: GREEN }}
            >
              Générer un document
            </button>
          </div>
          <p className="text-slate-500 text-[12px] mb-5 ml-11">
            Contrats, reçus, factures, attestations, convocations et certificats
          </p>

          <div className="bg-[#111827] rounded-xl border border-white/5 overflow-hidden">
            {loading ? (
              <p className="text-slate-400 p-6 text-[13px]">Chargement...</p>
            ) : documents.length === 0 ? (
              <div className="p-10 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-600/15 flex items-center justify-center mb-3">
                  <FileStack size={22} style={{ color: GREEN }} />
                </div>
                <p className="text-white text-[13px] font-medium">Aucun document généré</p>
                <p className="text-slate-500 text-[12px] mt-1">Cliquez sur &quot;Générer un document&quot; pour commencer.</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="text-slate-400 text-[11px] tracking-wide border-b border-white/5">
                    <th className="py-3 px-4 font-medium">Type</th>
                    <th className="py-3 px-4 font-medium">Concerné</th>
                    <th className="py-3 px-4 font-medium">Généré le</th>
                    <th className="py-3 px-4 font-medium">Fichier</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((d) => (
                    <tr key={d.id} className="border-b border-white/5 last:border-0 text-[12.5px]">
                      <td className="py-3 px-4 text-white">{TYPE_LABELS[d.type]}</td>
                      <td className="py-3 px-4 text-slate-300">
                        {d.candidat ? `${d.candidat.nom} ${d.candidat.prenom}` : d.entreprise ? d.entreprise.nom : d.inscription ? d.inscription.formation.nom : d.paiement ? d.paiement.libelle : "—"}
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {new Date(d.genereLe).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })}
                      </td>
                      <td className="py-3 px-4">
                        <a
                          href={d.filePath}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-emerald-400 hover:underline w-fit"
                        >
                          <Download size={13} /> Télécharger
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111827] border border-white/10 rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold text-[15px]">Générer un document</h2>
              <button onClick={() => setShowModal(false)}>
                <X size={16} className="text-slate-400 hover:text-white" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Type de document</label>
                <select
                  value={typeChoisi}
                  onChange={(e) => { setTypeChoisi(e.target.value as DocType); setFormValues({}); }}
                  className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-[13px] text-white outline-none"
                >
                  {Object.entries(TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              {champsRequis.map((champ) => (
                <div key={champ}>
                  <label className="text-[11px] text-slate-400 block mb-1">{CHAMP_LABELS[champ] || champ}</label>
                  {renderChamp(champ)}
                </div>
              ))}

              {erreur && <p className="text-red-400 text-[12px]">{erreur}</p>}
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg text-[13px] text-slate-300 hover:bg-white/5">
                Annuler
              </button>
              <button
                onClick={generer}
                disabled={generating}
                className="px-4 py-2 rounded-lg text-[13px] font-semibold text-white disabled:opacity-50"
                style={{ backgroundColor: GREEN }}
              >
                {generating ? "Génération..." : "Générer le PDF"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DocumentsPage() {
  return (
    <RequireRole allowed={["directeur", "coordonnateur", "secretaire"]}>
      <DocumentsContent />
    </RequireRole>
  );
}