import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});
const prisma = new PrismaClient({ adapter });

// Aide : nombre de jours entre deux dates
function daysAgo(date: Date) {
  return Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
}

// Aide : format relatif "Il y a X min/h/j"
function timeAgo(date: Date) {
  const diffMs = Date.now() - new Date(date).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "Ã€ l'instant";
  if (min < 60) return `Il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `Il y a ${h}h`;
  const j = Math.floor(h / 24);
  return `Il y a ${j}j`;
}

function startOfMonth() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export async function GET() {
  const debutMois = startOfMonth();
  const now = new Date();

  const [
    candidats,
    entretiens,
    formes,
    embauches,
    debauches,
    entreprises,
    paiements,
  ] = await Promise.all([
    prisma.candidat.findMany({ orderBy: { dateInscription: 'desc' } }),
    prisma.entretien.findMany({
      include: { candidat: true },
      orderBy: { dateEntretien: 'desc' },
    }),
    prisma.employe.findMany({
      where: { statutEmploi: 'EN_ATTENTE' },
      include: { candidat: true, entreprise: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.employe.findMany({
      where: { statutEmploi: 'EMBAUCHE' },
      include: { candidat: true, entreprise: true },
      orderBy: { dateEmbauche: 'desc' },
    }),
    prisma.employe.findMany({
      where: { statutEmploi: 'DEBAUCHE' },
      include: { candidat: true, entreprise: true },
      orderBy: { dateDepart: 'desc' },
    }),
    prisma.entreprise.findMany({
      include: { employes: true },
      orderBy: { datePartenariat: 'desc' },
    }),
    prisma.paiement.findMany({
      include: { candidat: true, entreprise: true },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  // --- Cartes stats (StatCard) ---
  const stats = {
    totalCandidats: candidats.length,
    candidatsCeMois: candidats.filter((c) => new Date(c.dateInscription) >= debutMois).length,

    totalEntretiens: entretiens.length,
    entretiensCeMois: entretiens.filter((e) => new Date(e.dateEntretien) >= debutMois).length,

    totalFormes: formes.length,
    formesCeMois: formes.filter((f) => new Date(f.createdAt) >= debutMois).length,

    totalEmbauches: embauches.length,
    embauchesCeMois: embauches.filter((e) => e.dateEmbauche && new Date(e.dateEmbauche) >= debutMois).length,

    totalDebauches: debauches.length,
    debauchesCeMois: debauches.filter((e) => e.dateDepart && new Date(e.dateDepart) >= debutMois).length,

    totalEntreprises: entreprises.length,
    entreprisesCeMois: entreprises.filter((e) => new Date(e.datePartenariat) >= debutMois).length,
  };

  // --- RÃ©partition des candidats par statut (donut) ---
  const statutCounts: Record<string, number> = {};
  for (const c of candidats) {
    statutCounts[c.statut] = (statutCounts[c.statut] || 0) + 1;
  }
  const total = candidats.length || 1;
  const STATUT_LABELS: Record<string, string> = {
    NOUVEAU: 'Nouveaux dossiers',
    DOSSIER_INCOMPLET: 'Dossiers incomplets',
    EN_ETUDE: 'En Ã©tude',
    VALIDE: 'ValidÃ©s',
    REFUSE: 'RefusÃ©s',
  };
  const STATUT_COLORS: Record<string, string> = {
    NOUVEAU: '#16a34a',
    EN_ETUDE: '#0f172a',
    VALIDE: '#86efac',
    DOSSIER_INCOMPLET: '#f97316',
    REFUSE: '#ef4444',
  };
  const repartitionCandidats = Object.entries(statutCounts).map(([statut, count]) => ({
    label: STATUT_LABELS[statut] || statut,
    pct: Math.round((count / total) * 1000) / 10,
    color: STATUT_COLORS[statut] || '#cbd5e1',
  }));

  // --- ActivitÃ©s rÃ©centes (fusion multi-sources, triÃ©es par date) ---
  type Activite = { type: string; title: string; sub: string; date: Date };
  const activites: Activite[] = [];

  for (const c of candidats.slice(0, 5)) {
    activites.push({
      type: 'candidat',
      title: 'Nouveau dossier de candidature ajoutÃ©',
      sub: `${c.nom} ${c.prenom}`,
      date: new Date(c.dateInscription),
    });
  }
  for (const e of entretiens.slice(0, 5)) {
    activites.push({
      type: 'entretien',
      title: 'Entretien programmÃ©',
      sub: e.candidat ? `${e.candidat.nom} ${e.candidat.prenom}` : 'Candidat',
      date: new Date(e.dateEntretien),
    });
  }
  for (const e of embauches.slice(0, 5)) {
    if (!e.dateEmbauche) continue;
    activites.push({
      type: 'embauche',
      title: 'Nouvel employÃ© embauchÃ©',
      sub: e.candidat ? `${e.candidat.nom} ${e.candidat.prenom}` : 'EmployÃ©',
      date: new Date(e.dateEmbauche),
    });
  }
  for (const e of debauches.slice(0, 5)) {
    if (!e.dateDepart) continue;
    activites.push({
      type: 'debauche',
      title: 'EmployÃ© dÃ©bauchÃ©',
      sub: e.candidat ? `${e.candidat.nom} ${e.candidat.prenom}` : 'EmployÃ©',
      date: new Date(e.dateDepart),
    });
  }
  for (const ent of entreprises.slice(0, 3)) {
    activites.push({
      type: 'entreprise',
      title: 'Nouveau partenaire enregistrÃ©',
      sub: ent.nom,
      date: new Date(ent.datePartenariat),
    });
  }
  for (const p of paiements.slice(0, 5)) {
    if (p.statut !== 'PAYE' || !p.datePaiement) continue;
    activites.push({
      type: 'paiement',
      title: p.type === 'RECETTE' ? 'Paiement reÃ§u' : 'DÃ©pense enregistrÃ©e',
      sub: p.libelle,
      date: new Date(p.datePaiement),
    });
  }

  const dernieresActivitesToutes = activites
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .map((a) => ({
      type: a.type,
      title: a.title,
      sub: a.sub,
      time: timeAgo(a.date),
    }));
  const dernieresActivites = dernieresActivitesToutes.slice(0, 6);

  // --- Prochains rendez-vous (entretiens Ã  venir) ---
  const prochainsRdvsTous = entretiens
    .filter((e) => new Date(e.dateEntretien) >= now)
    .sort((a, b) => new Date(a.dateEntretien).getTime() - new Date(b.dateEntretien).getTime())
    .map((e) => {
      const d = new Date(e.dateEntretien);
      return {
        date: String(d.getDate()).padStart(2, '0'),
        mois: d.toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase().replace('.', ''),
        nom: e.candidat ? `${e.candidat.nom} ${e.candidat.prenom}` : 'Candidat',
        poste: e.candidat?.posteRecherche || 'â€”',
        heure: d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      };
    });
  const prochainsRdvs = prochainsRdvsTous.slice(0, 5);

  // --- Alertes ---
  type Alerte = { type: string; title: string; sub: string; date: Date };
  const alertes: Alerte[] = [];

  const dossiersIncomplets = candidats.filter((c) => c.statut === 'DOSSIER_INCOMPLET');
  if (dossiersIncomplets.length > 0) {
    alertes.push({
      type: 'dossier',
      title: 'Dossiers incomplets',
      sub: `${dossiersIncomplets.length} dossier(s) en attente de piÃ¨ces`,
      date: new Date(),
    });
  }

  const formesEnAttenteDepuisLongtemps = formes.filter((f) => daysAgo(f.createdAt) > 30);
  if (formesEnAttenteDepuisLongtemps.length > 0) {
    alertes.push({
      type: 'formation',
      title: "FormÃ©s en attente d'insertion prolongÃ©e",
      sub: `${formesEnAttenteDepuisLongtemps.length} personne(s) en attente depuis plus de 30 jours`,
      date: new Date(),
    });
  }

  // Paiements en retard : statut EN_RETARD, ou EN_ATTENTE avec Ã©chÃ©ance dÃ©passÃ©e
  const paiementsEnRetard = paiements.filter(
    (p) =>
      p.statut === 'EN_RETARD' ||
      (p.statut === 'EN_ATTENTE' && p.dateEcheance && new Date(p.dateEcheance) < now)
  );
  for (const p of paiementsEnRetard.slice(0, 5)) {
    alertes.push({
      type: 'paiement',
      title: 'Paiement en retard',
      sub: p.entreprise ? `Entreprise : ${p.entreprise.nom}` : p.libelle,
      date: p.dateEcheance ? new Date(p.dateEcheance) : new Date(p.createdAt),
    });
  }

  // TODO: contrats arrivant Ã  expiration â†’ nÃ©cessite un champ dateFinContrat sur Employe

  const alertesFinales = alertes
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .map((a) => ({ ...a, time: timeAgo(a.date) }));
  // Toutes les alertes sont dÃ©jÃ  courtes par nature (une par catÃ©gorie), donc pas de version "limitÃ©e" sÃ©parÃ©e ici.

  // --- Finances (ce mois) ---
  const paiementsCeMois = paiements.filter(
    (p) => p.statut === 'PAYE' && p.datePaiement && new Date(p.datePaiement) >= debutMois
  );
  const recettes = paiementsCeMois
    .filter((p) => p.type === 'RECETTE')
    .reduce((sum, p) => sum + p.montant, 0);
  const depenses = paiementsCeMois
    .filter((p) => p.type === 'DEPENSE')
    .reduce((sum, p) => sum + p.montant, 0);

  const finances = paiements.length > 0
    ? { recettes, depenses, benefice: recettes - depenses }
    : null; // pas encore de paiements enregistrÃ©s â†’ on n'affiche pas de faux zÃ©ros trompeurs

  // --- Courbe "Statistiques globales" : candidats inscrits par mois sur l'annÃ©e en cours ---
  const anneeEnCours = now.getFullYear();
  const MOIS_LABELS = ['Jan', 'FÃ©v', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'AoÃ»t', 'Sep', 'Oct', 'Nov', 'DÃ©c'];
  const candidatsParMois = Array(12).fill(0);
  for (const c of candidats) {
    const d = new Date(c.dateInscription);
    if (d.getFullYear() === anneeEnCours) {
      candidatsParMois[d.getMonth()] += 1;
    }
  }
  // On ne montre que jusqu'au mois courant (les mois futurs de l'annÃ©e restent Ã  0, inutiles Ã  afficher)
  const moisCourant = now.getMonth();
  const evolutionCandidats = MOIS_LABELS.slice(0, moisCourant + 1).map((mois, i) => ({
    mois,
    total: candidatsParMois[i],
  }));

  return NextResponse.json({
    stats,
    repartitionCandidats,
    dernieresActivites,
    dernieresActivitesToutes,
    prochainsRdvs,
    prochainsRdvsTous,
    alertes: alertesFinales,
    finances,
    evolutionCandidats,
    entreprises: entreprises.map((e) => ({
      id: e.id,
      nom: e.nom,
      activite: e.activite,
      nombreEmployesActuels: e.employes.length,
    })),
  });
}
