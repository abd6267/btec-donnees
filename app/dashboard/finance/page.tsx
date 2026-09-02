"use client";

import { useEffect, useState } from "react";
import { Wallet, Plus, X, TrendingUp, TrendingDown, Landmark, Coins } from "lucide-react";
import RequireRole from "../../components/RequireRole";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";

const GREEN = "#16a34a";
const RED = "#dc2626";

type Paiement = {
  id: string;
  type: "RECETTE" | "DEPENSE";
  statut: "EN_ATTENTE" | "PAYE" | "EN_RETARD";
  libelle: string;
  montant: number;
  categorie: string | null;
  modePaiement: "CAISSE" | "BANQUE" | null;
  datePaiement: string | null;
  candidat: { nom: string; prenom: string } | null;
  entreprise: { nom: string } | null;
};

type Rapport = {
  totalRecettes: number;
  totalDepenses: number;
  benefice: number;
  journalCaisse: { recettes: number; depenses: number };
  journalBanque: { recettes: number; depenses: number };
};

const CATEGORIES_ENTREE = [
  { value: "FRAIS_INSCRIPTION", label: "Frais d'inscription" },
  { value: "FRAIS_OUVERTURE_DOSSIER", label: "Frais d'ouverture de dossier" },
  { value: "FRAIS_FORMATION", label: "Frais de formation" },
  { value: "FRAIS_RECRUTEMENT", label: "Frais de recrutement" },
  { value: "COMMISSIONS", label: "Commissions" },
  { value: "PRESTATIONS_RH", label: "Prestations RH" },
  { value: "GESTION_DELEGUEE", label: "Gestion déléguée" },
];

const CATEGORIES_SORTIE = [
  { value: "SALAIRES", label: "Salaires" },
  { value: "LOYERS", label: "Loyers" },
  { value: "INTERNET", label: "Internet" },
  { value: "PUBLICITE", label: "Publicité" },
  { value: "FOURNITURES", label: "Fournitures" },
  { value: "DEPLACEMENTS", label: "Déplacements" },
  { value: "AUTRE", label: "Autre" },
];

const CATEGORIE_LABELS: Record<string, string> = Object.fromEntries(
  [...CATEGORIES_ENTREE, ...CATEGORIES_SORTIE].map((c) => [c.value, c.label])
);

const STATUT_LABELS: Record<string, string> = {
  EN_ATTENTE: "En attente",
  PAYE: "Payé",
  EN_RETARD: "En retard",
};

const STATUT_COLORS: Record<string, string> = {
  EN_ATTENTE: "text-yellow-400",
  PAYE: "text-emerald-400",
  EN_RETARD: "text-red-400",
};

function FinanceContent() {
  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [rapport, setRapport] = useState<Rapport | null>(null);
  const [loading, setLoading] = useState(true);
  const [filtreType, setFiltreType] = useState<string>("");

  const [showModal, setShowModal] = useState(false);
  const [formType, setFormType] = useState<"RECETTE" | "DEPENSE">("RECETTE");
  const [formLibelle, setFormLibelle] = useState("");
  const [formMontant, setFormMontant] = useState("");
  const [formCategorie, setFormCategorie] = useState("");
  const [formModePaiement, setFormModePaiement] = useState<"CAISSE" | "BANQUE">("CAISSE");
  const [formStatut, setFormStatut] = useState<"EN_ATTENTE" | "PAYE" | "EN_RETARD">("PAYE");
  const [formDatePaiement, setFormDatePaiement] = useState("");
  const [saving, setSaving] = useState(false);

  const charger = () => {
    setLoading(true);
    const query = filtreType ? `?type=${filtreType}` : "";
    Promise.all([
      fetch(`/api/paiements/list${query}`).then((r) => r.json()),
      fetch("/api/paiements/rapport?periode=mensuel").then((r) => r.json()),
    ])
      .then(([p, r]) => {
        setPaiements(Array.isArray(p) ? p : []);
        setRapport(r);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    charger();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtreType]);

  const resetForm = () => {
    setFormLibelle("");
    setFormMontant("");
    setFormCategorie("");
    setFormModePaiement("CAISSE");
    setFormStatut("PAYE");
    setFormDatePaiement(new Date().toISOString().slice(0, 10));
  };

  const openModal = (type: "RECETTE" | "DEPENSE") => {
    setFormType(type);
    resetForm();
    setShowModal(true);
  };

  const creerPaiement = async () => {
    if (!formLibelle || !formMontant) return;
    setSaving(true);
    try {
      await fetch("/api/paiements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: formType,
          libelle: formLibelle,
          montant: formMontant,
          categorie: formCategorie || null,
          modePaiement: formModePaiement,
          statut: formStatut,
          datePaiement: formStatut === "PAYE" ? (formDatePaiement || new Date().toISOString()) : null,
        }),
      });
      setShowModal(false);
      charger();
    } finally {
      setSaving(false);
    }
  };

  const categoriesDisponibles = formType === "RECETTE" ? CATEGORIES_ENTREE : CATEGORIES_SORTIE;

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      <Sidebar active="finance" />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <div className="p-6">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-emerald-600/15 flex items-center justify-center">
                <Wallet size={17} style={{ color: GREEN }} />
              </div>
              <h1 className="text-[22px] font-bold text-white">Gestion Financière</h1>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => openModal("RECETTE")}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-[12px] font-semibold text-white"
                style={{ backgroundColor: GREEN }}
              >
                <Plus size={14} /> Entrée
              </button>
              <button
                onClick={() => openModal("DEPENSE")}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-[12px] font-semibold text-white"
                style={{ backgroundColor: RED }}
              >
                <Plus size={14} /> Sortie
              </button>
            </div>
          </div>
          <p className="text-slate-500 text-[12px] mb-5 ml-11">
            Entrées, sorties, journal de caisse et bénéfices
          </p>

          {/* Cartes résumé */}
          {rapport && (
            <div className="grid grid-cols-4 gap-3 mb-5">
              <div className="bg-[#111827] rounded-xl border border-white/5 p-4">
                <div className="flex items-center gap-2 text-slate-400 text-[11px] mb-2">
                  <TrendingUp size={14} className="text-emerald-400" /> Recettes (mois)
                </div>
                <div className="text-white text-[18px] font-bold">
                  {rapport.totalRecettes.toLocaleString("fr-FR")} FCFA
                </div>
              </div>
              <div className="bg-[#111827] rounded-xl border border-white/5 p-4">
                <div className="flex items-center gap-2 text-slate-400 text-[11px] mb-2">
                  <TrendingDown size={14} className="text-red-400" /> Dépenses (mois)
                </div>
                <div className="text-white text-[18px] font-bold">
                  {rapport.totalDepenses.toLocaleString("fr-FR")} FCFA
                </div>
              </div>
              <div className="bg-[#111827] rounded-xl border border-white/5 p-4">
                <div className="flex items-center gap-2 text-slate-400 text-[11px] mb-2">
                  <Coins size={14} className="text-yellow-400" /> Bénéfice (mois)
                </div>
                <div className={`text-[18px] font-bold ${rapport.benefice >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {rapport.benefice.toLocaleString("fr-FR")} FCFA
                </div>
              </div>
              <div className="bg-[#111827] rounded-xl border border-white/5 p-4">
                <div className="flex items-center gap-2 text-slate-400 text-[11px] mb-2">
                  <Landmark size={14} className="text-blue-400" /> Caisse / Banque
                </div>
                <div className="text-white text-[13px]">
                  Caisse: {(rapport.journalCaisse.recettes - rapport.journalCaisse.depenses).toLocaleString("fr-FR")} FCFA
                </div>
                <div className="text-white text-[13px]">
                  Banque: {(rapport.journalBanque.recettes - rapport.journalBanque.depenses).toLocaleString("fr-FR")} FCFA
                </div>
              </div>
            </div>
          )}

          {/* Filtres */}
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setFiltreType("")}
              className={`px-3 py-1.5 rounded-lg text-[11px] ${filtreType === "" ? "bg-white/10 text-white" : "text-slate-400"}`}
            >
              Tout
            </button>
            <button
              onClick={() => setFiltreType("RECETTE")}
              className={`px-3 py-1.5 rounded-lg text-[11px] ${filtreType === "RECETTE" ? "bg-white/10 text-white" : "text-slate-400"}`}
            >
              Entrées
            </button>
            <button
              onClick={() => setFiltreType("DEPENSE")}
              className={`px-3 py-1.5 rounded-lg text-[11px] ${filtreType === "DEPENSE" ? "bg-white/10 text-white" : "text-slate-400"}`}
            >
              Sorties
            </button>
          </div>

          <div className="bg-[#111827] rounded-xl border border-white/5 overflow-hidden">
            {loading ? (
              <p className="text-slate-400 p-6 text-[13px]">Chargement...</p>
            ) : paiements.length === 0 ? (
              <div className="p-10 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-600/15 flex items-center justify-center mb-3">
                  <Wallet size={22} style={{ color: GREEN }} />
                </div>
                <p className="text-white text-[13px] font-medium">Aucune opération pour le moment</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="text-slate-400 text-[11px] tracking-wide border-b border-white/5">
                    <th className="py-3 px-4 font-medium">Libellé</th>
                    <th className="py-3 px-4 font-medium">Catégorie</th>
                    <th className="py-3 px-4 font-medium">Type</th>
                    <th className="py-3 px-4 font-medium">Mode</th>
                    <th className="py-3 px-4 font-medium">Montant</th>
                    <th className="py-3 px-4 font-medium">Statut</th>
                    <th className="py-3 px-4 font-medium">Date paiement</th>
                  </tr>
                </thead>
                <tbody>
                  {paiements.map((p) => (
                    <tr key={p.id} className="border-b border-white/5 last:border-0 text-[12.5px]">
                      <td className="py-3 px-4 text-white">{p.libelle}</td>
                      <td className="py-3 px-4 text-slate-300">
                        {p.categorie ? CATEGORIE_LABELS[p.categorie] || p.categorie : <span className="text-slate-600">—</span>}
                      </td>
                      <td className="py-3 px-4">
                        <span className={p.type === "RECETTE" ? "text-emerald-400" : "text-red-400"}>
                          {p.type === "RECETTE" ? "Entrée" : "Sortie"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {p.modePaiement === "CAISSE" ? "Caisse" : p.modePaiement === "BANQUE" ? "Banque" : "—"}
                      </td>
                      <td className="py-3 px-4 text-slate-300">{p.montant.toLocaleString("fr-FR")} FCFA</td>
                      <td className="py-3 px-4">
                        <span className={`font-medium ${STATUT_COLORS[p.statut]}`}>{STATUT_LABELS[p.statut]}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {p.datePaiement ? new Date(p.datePaiement).toLocaleDateString("fr-FR") : <span className="text-slate-600">—</span>}
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
              <h2 className="text-white font-semibold text-[15px]">
                Nouvelle {formType === "RECETTE" ? "entrée" : "sortie"}
              </h2>
              <button onClick={() => setShowModal(false)}>
                <X size={16} className="text-slate-400 hover:text-white" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Libellé</label>
                <input
                  value={formLibelle}
                  onChange={(e) => setFormLibelle(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-[13px] text-white outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Catégorie</label>
                <select
                  value={formCategorie}
                  onChange={(e) => setFormCategorie(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-[13px] text-white outline-none"
                >
                  <option value="">—</option>
                  {categoriesDisponibles.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Montant (FCFA)</label>
                  <input
                    type="number"
                    value={formMontant}
                    onChange={(e) => setFormMontant(e.target.value)}
                    className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-[13px] text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Mode</label>
                  <select
                    value={formModePaiement}
                    onChange={(e) => setFormModePaiement(e.target.value as "CAISSE" | "BANQUE")}
                    className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-[13px] text-white outline-none"
                  >
                    <option value="CAISSE">Caisse</option>
                    <option value="BANQUE">Banque</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Statut</label>
                  <select
                    value={formStatut}
                    onChange={(e) => setFormStatut(e.target.value as "EN_ATTENTE" | "PAYE" | "EN_RETARD")}
                    className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-[13px] text-white outline-none"
                  >
                    <option value="PAYE">Payé</option>
                    <option value="EN_ATTENTE">En attente</option>
                    <option value="EN_RETARD">En retard</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Date paiement</label>
                  <input
                    type="date"
                    value={formDatePaiement}
                    onChange={(e) => setFormDatePaiement(e.target.value)}
                    className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-[13px] text-white outline-none [color-scheme:dark]"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg text-[13px] text-slate-300 hover:bg-white/5">
                Annuler
              </button>
              <button
                onClick={creerPaiement}
                disabled={saving}
                className="px-4 py-2 rounded-lg text-[13px] font-semibold text-white disabled:opacity-50"
                style={{ backgroundColor: formType === "RECETTE" ? GREEN : RED }}
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

export default function FinancePage() {
  return (
    <RequireRole allowed={["directeur", "coordonnateur"]}>
      <FinanceContent />
    </RequireRole>
  );
}