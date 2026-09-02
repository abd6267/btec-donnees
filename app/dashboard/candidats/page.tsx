"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Inbox, FileText, Users, FileBarChart, UserX, Briefcase, Home, Calendar,
  Search, Plus, Eye, Pencil, ChevronLeft, ChevronRight, Headphones,
} from "lucide-react";
import { useRouter } from "next/navigation";
import RequireRole from "../../components/RequireRole";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import StatCard from "../../components/StatCard";
import Avatar from "../../components/Avatar";

const GREEN = "#16a34a";

type Candidat = {
  id: string;
  numeroDossier: string;
  nom: string;
  prenom: string;
  sexe: string;
  telephone: string;
  posteRecherche: string;
  statut: string;
  dateInscription: string;
  photoPath: string | null;
  cvPath: string | null;
  lettrePath: string | null;
  piecesPath: string | null;
  email?: string;
  niveauEtude?: string;
};

const STATUT_LABELS: Record<string, string> = {
  NOUVEAU: "Nouveau",
  DOSSIER_INCOMPLET: "Dossier incomplet",
  EN_ETUDE: "En etude",
  VALIDE: "Valide",
  REFUSE: "Refuse",
};

const STATUT_COLORS: Record<string, string> = {
  NOUVEAU: "text-blue-600",
  DOSSIER_INCOMPLET: "text-orange-600",
  EN_ETUDE: "text-yellow-600",
  VALIDE: "text-emerald-600",
  REFUSE: "text-red-600",
};

// Referentiel des principales filieres universitaires du Benin
// (UAC, UNSTIM, UNIPAR, UP, ecoles/instituts publics et prives reconnus),
// utilise comme base pour le filtre "Metier recherche" en plus des
// metiers reellement saisis dans les dossiers candidats.
const FILIERES_UNIVERSITAIRES_BENIN: string[] = [
  "Sciences de Gestion",
  "Comptabilite et Gestion des Entreprises",
  "Finance et Comptabilite",
  "Banque et Finance",
  "Marketing et Action Commerciale",
  "Gestion des Ressources Humaines",
  "Gestion des Projets",
  "Sciences Economiques",
  "Economie et Gestion",
  "Assurance",
  "Transport et Logistique",
  "Commerce International",
  "Fiscalite",
  "Informatique de Gestion",
  "Genie Logiciel",
  "Reseaux et Systemes Informatiques",
  "Developpement Web et Mobile",
  "Statistique et Informatique Decisionnelle",
  "Telecommunications",
  "Intelligence Artificielle et Data Science",
  "Cybersecurite",
  "Droit",
  "Droit des Affaires",
  "Sciences Politiques",
  "Administration Publique",
  "Medecine",
  "Pharmacie",
  "Soins Infirmiers et Obstetricaux",
  "Sage-Femme",
  "Sante Publique",
  "Kinesitherapie",
  "Odonto-Stomatologie",
  "Laboratoire d'Analyses Biomedicales",
  "Genie Civil",
  "Genie Electrique",
  "Genie Mecanique",
  "Genie Energetique",
  "Electrotechnique",
  "Batiment et Travaux Publics",
  "Architecture",
  "Genie Industriel et Maintenance",
  "Mathematiques",
  "Physique",
  "Chimie",
  "Sciences de la Vie et de la Terre",
  "Agronomie",
  "Agroeconomie",
  "Production Vegetale",
  "Production Animale",
  "Environnement et Developpement Durable",
  "Foresterie",
  "Halieutique et Aquaculture",
  "Lettres Modernes",
  "Sociologie et Anthropologie",
  "Histoire et Archeologie",
  "Geographie et Amenagement du Territoire",
  "Psychologie",
  "Sciences de l'Education",
  "Communication et Journalisme",
  "Langues Etrangeres Appliquees",
  "Bibliotheconomie et Documentation",
  "Hotellerie et Tourisme",
  "Restauration",
  "Secretariat de Direction",
  "Assistanat de Direction",
  "Electronique",
  "Mecanique Automobile",
  "Froid et Climatisation",
  "Textile et Habillement",
  "Esthetique et Cosmetologie",
];

// Referentiel des niveaux d'etude en usage au Benin (systeme LMD +
// niveaux secondaires/techniques), utilise comme base pour le filtre
// "Niveau d'etude" en plus des niveaux reellement saisis dans les dossiers.
const NIVEAUX_ETUDE_BENIN: string[] = [
  "Sans diplome",
  "CEP",
  "BEPC",
  "CAP",
  "Baccalaureat",
  "BTS",
  "DUT",
  "DEUG / Bac+2",
  "Licence 1",
  "Licence 2",
  "Licence 3 / Licence",
  "Maitrise / Bac+4",
  "Master 1",
  "Master 2 / Master",
  "Ingeniorat",
  "Doctorat",
];

function CandidatsContent() {
  const router = useRouter();
  const [candidats, setCandidats] = useState<Candidat[]>([]);
  const [loading, setLoading] = useState(true);

  // ID du candidat dont le statut est en cours de changement (pour desactiver
  // le select le temps de la requete et eviter les doubles-clics)
  const [statutEnCours, setStatutEnCours] = useState<string | null>(null);

  // Filtres "en cours de saisie" (ce que l'utilisateur tape/selectionne)
  const [filtreStatut, setFiltreStatut] = useState<string>("TOUS");
  const [filtreNiveau, setFiltreNiveau] = useState<string>("TOUS");
  const [filtreMetier, setFiltreMetier] = useState<string>("TOUS");
  const [dateDebut, setDateDebut] = useState<string>("");
  const [dateFin, setDateFin] = useState<string>("");
  const [recherche, setRecherche] = useState<string>("");

  // Filtres "appliques" (ce qui est reellement utilise pour filtrer le tableau,
  // mis a jour uniquement au clic sur "Filtrer" ou "Reinitialiser")
  const [appliques, setAppliques] = useState({
    statut: "TOUS",
    niveau: "TOUS",
    metier: "TOUS",
    dateDebut: "",
    dateFin: "",
    recherche: "",
  });

  useEffect(() => {
    let cancelled = false;
    fetch("/api/candidats/list")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setCandidats(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setCandidats([]);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Change le statut d'un candidat depuis le tableau. Le backend
  // (PATCH /api/candidats/[id]) se charge de synchroniser automatiquement
  // les autres rubriques (creation d'un Entretien si EN_ETUDE, d'un Employe
  // si VALIDE, etc.). Ici on met juste a jour l'affichage local une fois
  // la requete confirmee.
  const handleChangerStatut = async (candidatId: string, nouveauStatut: string) => {
    setStatutEnCours(candidatId);
    try {
      const res = await fetch(`/api/candidats/${candidatId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statut: nouveauStatut }),
      });
      if (!res.ok) throw new Error("Echec de la mise a jour du statut");
      setCandidats((prev) =>
        prev.map((c) => (c.id === candidatId ? { ...c, statut: nouveauStatut } : c))
      );
    } catch {
      // En cas d'echec, on ne modifie pas l'etat local : le select
      // reaffichera l'ancien statut au prochain rendu.
    } finally {
      setStatutEnCours(null);
    }
  };

  const total = candidats.length;
  const nouveaux = candidats.filter((c) => c.statut === "NOUVEAU").length;
  const enEtude = candidats.filter((c) => c.statut === "EN_ETUDE").length;
  const valides = candidats.filter((c) => c.statut === "VALIDE").length;
  const refuses = candidats.filter((c) => c.statut === "REFUSE").length;

  const stats = [
    { icon: Inbox, value: total, label: "Total Dossiers", sub: "Tous les dossiers", color: "#16a34a", statutKey: "TOUS" },
    { icon: FileText, value: nouveaux, label: "Nouveaux Dossiers", sub: "Ce mois", color: "#2563eb", statutKey: "NOUVEAU" },
    { icon: Users, value: enEtude, label: "Dossiers en etude", sub: "En cours", color: "#eab308", statutKey: "EN_ETUDE" },
    { icon: FileBarChart, value: valides, label: "Dossiers Valides", sub: "Ce mois", color: "#9333ea", statutKey: "VALIDE" },
    { icon: UserX, value: refuses, label: "Dossiers Refuses", sub: "Ce mois", color: "#ef4444", statutKey: "REFUSE" },
  ];

  const niveauxDisponibles = useMemo(() => {
    const set = new Set<string>(NIVEAUX_ETUDE_BENIN);
    candidats.forEach((c) => {
      if (c.niveauEtude && c.niveauEtude.trim()) set.add(c.niveauEtude.trim());
    });
    return Array.from(set);
  }, [candidats]);

  const metiersDisponibles = useMemo(() => {
    const set = new Set<string>(FILIERES_UNIVERSITAIRES_BENIN);
    candidats.forEach((c) => {
      if (c.posteRecherche && c.posteRecherche.trim()) set.add(c.posteRecherche.trim());
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, "fr"));
  }, [candidats]);

  const handleStatCardClick = (statutKey: string) => {
    setFiltreStatut(statutKey);
    setAppliques((prev) => ({ ...prev, statut: statutKey }));
  };

  const handleFiltrer = () => {
    setAppliques({
      statut: filtreStatut,
      niveau: filtreNiveau,
      metier: filtreMetier,
      dateDebut,
      dateFin,
      recherche,
    });
  };

  const handleReinitialiser = () => {
    setFiltreStatut("TOUS");
    setFiltreNiveau("TOUS");
    setFiltreMetier("TOUS");
    setDateDebut("");
    setDateFin("");
    setRecherche("");
    setAppliques({
      statut: "TOUS",
      niveau: "TOUS",
      metier: "TOUS",
      dateDebut: "",
      dateFin: "",
      recherche: "",
    });
  };

  const norm = (v: string | null | undefined) => (v || "").trim().toLowerCase();

  const candidatsFiltres = useMemo(() => {
    return candidats.filter((c) => {
      if (appliques.statut !== "TOUS" && c.statut !== appliques.statut) return false;

      if (appliques.niveau !== "TOUS" && norm(c.niveauEtude) !== norm(appliques.niveau)) return false;

      if (appliques.metier !== "TOUS" && norm(c.posteRecherche) !== norm(appliques.metier)) return false;

      if (appliques.dateDebut) {
        const debut = new Date(appliques.dateDebut);
        debut.setHours(0, 0, 0, 0);
        const inscrit = new Date(c.dateInscription);
        if (isNaN(inscrit.getTime()) || inscrit < debut) return false;
      }
      if (appliques.dateFin) {
        const fin = new Date(appliques.dateFin);
        fin.setHours(23, 59, 59, 999);
        const inscrit = new Date(c.dateInscription);
        if (isNaN(inscrit.getTime()) || inscrit > fin) return false;
      }

      if (appliques.recherche.trim()) {
        const q = norm(appliques.recherche);
        const haystack = norm(`${c.nom} ${c.prenom} ${c.telephone} ${c.email || ""} ${c.numeroDossier || ""}`);
        if (!haystack.includes(q)) return false;
      }

      return true;
    });
  }, [candidats, appliques]);

  return (
    <div className="flex min-h-screen bg-[#f4f6f8]">
      <Sidebar active="candidats" />
      <div className="flex-1 flex flex-col">
        <Topbar placeholder="Rechercher un candidat..." />
        <div className="p-6">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                <Briefcase size={17} style={{ color: GREEN }} />
              </div>
              <h1 className="text-[22px] font-bold text-slate-900">Dossiers de Candidature</h1>
            </div>
            <a
              href="/dashboard/candidats/nouveau"
              className="flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-[13px] font-semibold text-white"
              style={{ backgroundColor: GREEN }}
            >
              <Plus size={15} /> Nouveau Dossier
            </a>
          </div>
          <p className="text-slate-400 text-[12px] flex items-center gap-1.5 mb-5 ml-11">
            <Home size={11} /> Accueil <span className="text-slate-300">&rsaquo;</span> Session Candidat{" "}
            <span className="text-slate-300">&rsaquo;</span> Dossiers de Candidature
          </p>

          <div className="grid grid-cols-5 gap-3 mb-5">
            {stats.map((s, i) => (
              <StatCard
                key={i}
                icon={s.icon}
                value={s.value}
                label={s.label}
                sub={s.sub}
                color={s.color}
                active={appliques.statut === s.statutKey}
                onClick={() => handleStatCardClick(s.statutKey)}
              />
            ))}
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm mb-4">
            <div className="grid grid-cols-5 gap-3 items-end">
              <div className="col-span-1">
                <label className="text-slate-500 text-[11px] block mb-1.5">Statut</label>
                <select
                  value={filtreStatut}
                  onChange={(e) => setFiltreStatut(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-[12px] text-slate-700 outline-none"
                >
                  <option value="TOUS">Tous</option>
                  {Object.entries(STATUT_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-1">
                <label className="text-slate-500 text-[11px] block mb-1.5">Niveau d&apos;etude</label>
                <select
                  value={filtreNiveau}
                  onChange={(e) => setFiltreNiveau(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-[12px] text-slate-700 outline-none"
                >
                  <option value="TOUS">Tous</option>
                  {niveauxDisponibles.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-1">
                <label className="text-slate-500 text-[11px] block mb-1.5">Metier recherche</label>
                <select
                  value={filtreMetier}
                  onChange={(e) => setFiltreMetier(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-[12px] text-slate-700 outline-none"
                >
                  <option value="TOUS">Tous</option>
                  {metiersDisponibles.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-1">
                <label className="text-slate-500 text-[11px] block mb-1.5">Date d&apos;inscription</label>
                <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5">
                  <span className="text-[11px] text-slate-400 shrink-0">Du</span>
                  <input
                    type="date"
                    value={dateDebut}
                    onChange={(e) => setDateDebut(e.target.value)}
                    className="bg-transparent text-[11px] text-slate-700 outline-none w-full"
                  />
                  <span className="text-[11px] text-slate-400 shrink-0">au</span>
                  <input
                    type="date"
                    value={dateFin}
                    onChange={(e) => setDateFin(e.target.value)}
                    className="bg-transparent text-[11px] text-slate-700 outline-none w-full"
                  />
                  <Calendar size={13} className="text-slate-400 shrink-0" />
                </div>
              </div>
              <div className="col-span-1 flex gap-2">
                <button
                  type="button"
                  onClick={handleFiltrer}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[12px] font-semibold text-white"
                  style={{ backgroundColor: GREEN }}
                >
                  Filtrer
                </button>
                <button
                  type="button"
                  onClick={handleReinitialiser}
                  className="flex-1 rounded-lg px-3 py-2 text-[12px] text-slate-600 border border-slate-200"
                >
                  Reinitialiser
                </button>
              </div>
            </div>
            <div className="relative mt-3">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleFiltrer();
                }}
                placeholder="Rechercher (nom, prenom, telephone...)"
                className="w-full max-w-xs bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-2 text-[12px] text-slate-700 outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {loading ? (
              <p className="text-slate-400 p-6 text-[13px]">Chargement...</p>
            ) : candidatsFiltres.length === 0 ? (
              <p className="text-slate-400 p-6 text-[13px]">
                {appliques.statut === "TOUS" &&
                appliques.niveau === "TOUS" &&
                appliques.metier === "TOUS" &&
                !appliques.dateDebut &&
                !appliques.dateFin &&
                !appliques.recherche
                  ? "Aucun candidat pour l'instant."
                  : "Aucun dossier ne correspond aux filtres selectionnes."}
              </p>
            ) : (
              <>
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-slate-400 text-[11px] tracking-wide border-b border-slate-100 bg-slate-50">
                      <th className="py-3 px-4 font-medium">N&deg; Dossier</th>
                      <th className="py-3 px-4 font-medium">Candidat</th>
                      <th className="py-3 px-4 font-medium">Contact</th>
                      <th className="py-3 px-4 font-medium">Metier recherche</th>
                      <th className="py-3 px-4 font-medium">Date d&apos;inscription</th>
                      <th className="py-3 px-4 font-medium">Statut</th>
                      <th className="py-3 px-4 font-medium">Documents</th>
                      <th className="py-3 px-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {candidatsFiltres.map((c) => (
                      <tr key={c.id} className="border-b border-slate-100 last:border-0 text-[12.5px] hover:bg-slate-50/60">
                        <td className="py-3 px-4 text-emerald-700 font-medium">{c.numeroDossier}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Avatar photoPath={c.photoPath} nom={c.nom} prenom={c.prenom} />
                            <span className="text-slate-800 font-medium">{c.nom} {c.prenom}</span>
                            <span className={c.sexe === "M" ? "text-blue-500 text-[10px]" : "text-pink-500 text-[10px]"}>
                              {c.sexe === "M" ? "\u2642" : "\u2640"}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-slate-700">{c.telephone}</p>
                          {c.email && <p className="text-slate-400 text-[10.5px]">{c.email}</p>}
                        </td>
                        <td className="py-3 px-4 text-slate-700">{c.posteRecherche}</td>
                        <td className="py-3 px-4 text-slate-400">
                          {new Date(c.dateInscription).toLocaleDateString("fr-FR")}
                        </td>
                        <td className="py-3 px-4">
                          <select
                            value={c.statut}
                            disabled={statutEnCours === c.id}
                            onChange={(e) => handleChangerStatut(c.id, e.target.value)}
                            title="Changer le statut du dossier"
                            className={`bg-transparent border-0 font-medium text-[12.5px] outline-none cursor-pointer disabled:opacity-50 disabled:cursor-wait ${STATUT_COLORS[c.statut] || "text-slate-700"}`}
                          >
                            {Object.entries(STATUT_LABELS).map(([k, v]) => (
                              <option key={k} value={k} className="text-slate-700">{v}</option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2 text-[11px]">
                            {c.photoPath && <a href={c.photoPath} target="_blank" className="text-blue-600 hover:underline">Photo</a>}
                            {c.cvPath && <a href={c.cvPath} target="_blank" className="text-blue-600 hover:underline">CV</a>}
                            {c.lettrePath && <a href={c.lettrePath} target="_blank" className="text-blue-600 hover:underline">Lettre</a>}
                            {c.piecesPath && <a href={c.piecesPath} target="_blank" className="text-blue-600 hover:underline">Pieces</a>}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5 text-slate-400">
                            <button
                              type="button"
                              title="Voir le dossier et gerer le parcours"
                              onClick={() => router.push(`/dashboard/candidats/${c.id}`)}
                            >
                              <Eye size={14} className="hover:text-slate-700 cursor-pointer" />
                            </button>
                            <button
                              type="button"
                              title="Modifier les informations du candidat"
                              onClick={() => router.push(`/dashboard/candidats/${c.id}/modifier`)}
                            >
                              <Pencil size={14} className="hover:text-slate-700 cursor-pointer" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="flex items-center justify-between px-4 py-3 text-[12px] text-slate-400">
                  <span>Affichage de 1 a {candidatsFiltres.length} sur {total} dossiers</span>
                  <div className="flex items-center gap-1.5">
                    <button type="button" className="w-7 h-7 rounded-md border border-slate-200 flex items-center justify-center text-slate-500"><ChevronLeft size={13} /></button>
                    <button type="button" className="w-7 h-7 rounded-md text-white font-medium flex items-center justify-center" style={{ backgroundColor: GREEN }}>1</button>
                    <button type="button" className="w-7 h-7 rounded-md border border-slate-200 flex items-center justify-center text-slate-500"><ChevronRight size={13} /></button>
                  </div>
                </div>
              </>
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
    </div>
  );
}

export default function CandidatsPage() {
  return (
    <RequireRole allowed={["directeur", "coordonnateur", "secretaire"]}>
      <CandidatsContent />
    </RequireRole>
  );
}