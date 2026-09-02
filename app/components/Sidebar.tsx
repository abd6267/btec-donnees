"use client";

import Link from "next/link";
import {
  LayoutGrid, FileText, Users, GraduationCap, Briefcase, UserX, Building2,
  Handshake, UserCog, Pencil, KeyRound, Settings2, FileBarChart, Headphones,
  BookOpen, ClipboardList, Wallet, Bell, Archive, FileStack,
} from "lucide-react";

const GREEN = "#16a34a";

type NavItem = {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  label: string;
  id: string;
  href: string;
};

const TOP_ITEM: NavItem = { icon: LayoutGrid, label: "Tableau de bord", id: "dashboard", href: "/dashboard" };

const SESSION_CANDIDAT: NavItem[] = [
  { icon: FileText, label: "Dossiers de Candidature", id: "candidats", href: "/dashboard/candidats" },
  { icon: Users, label: "Entretiens d'Embauche", id: "entretiens", href: "/dashboard/entretiens" },
  { icon: GraduationCap, label: "Formés en Attente", id: "formes", href: "/dashboard/formes" },
  { icon: BookOpen, label: "Formations (Catalogue)", id: "formations", href: "/dashboard/formations" },
  { icon: ClipboardList, label: "Suivi des Inscriptions", id: "formation", href: "/dashboard/formation" },
  { icon: Briefcase, label: "Employés Embauchés", id: "embauches", href: "/dashboard/embauches" },
  { icon: UserX, label: "Employés Débauchés", id: "debauches", href: "/dashboard/debauches" },
];

const SESSION_PARTENAIRE: NavItem[] = [
  { icon: Building2, label: "Entreprises Partenaires", id: "entreprises", href: "/dashboard/entreprises" },
  { icon: Handshake, label: "Formateurs & Prestataires", id: "formateurs", href: "/dashboard/formateurs" },
];

const GESTION_FINANCIERE: NavItem[] = [
  { icon: Wallet, label: "Finances", id: "finance", href: "/dashboard/finance" },
  { icon: FileStack, label: "Documents", id: "documents", href: "/dashboard/documents" },
];

const RAPPORTS_SUIVI: NavItem[] = [
  { icon: FileBarChart, label: "Rapports", id: "rapports", href: "/dashboard/rapports" },
  { icon: Bell, label: "Notifications", id: "notifications", href: "/dashboard/notifications" },
  { icon: Archive, label: "Archives", id: "archives", href: "/dashboard/archives" },
];

const GESTION_COMPTES: NavItem[] = [
  { icon: UserCog, label: "Créer un Compte", id: "creer-compte", href: "/dashboard/personnel/creer" },
  { icon: Pencil, label: "Modifier un Compte", id: "modifier-compte", href: "/dashboard/personnel/modifier" },
  { icon: KeyRound, label: "Supprimer un Compte", id: "suppr-compte", href: "/dashboard/personnel/supprimer" },
];

const PARAMETRES: NavItem[] = [
  { icon: Settings2, label: "Paramètres Généraux", id: "params", href: "/dashboard/parametres" },
  { icon: FileBarChart, label: "Journal d'Activité", id: "journal", href: "/dashboard/journal" },
];

function NavLink({ item, active }: { item: NavItem; active: string }) {
  const isActive = active === item.id;
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] transition-colors ${
        isActive ? "text-white font-medium" : "text-slate-300 hover:text-white hover:bg-white/5"
      }`}
      style={isActive ? { backgroundColor: GREEN } : {}}
    >
      <Icon size={16} strokeWidth={2} />
      <span>{item.label}</span>
    </Link>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      <p className="px-3 text-[10px] font-semibold tracking-wider text-emerald-500 mb-1.5">{label}</p>
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  );
}

export default function Sidebar({ active }: { active: string }) {
  return (
    <aside className="w-[220px] shrink-0 bg-black text-white flex flex-col h-screen sticky top-0">
      <div className="flex items-center gap-2 px-4 py-4 border-b border-white/10">
        <svg width="34" height="34" viewBox="0 0 40 40" fill="none">
          <path d="M8 30 L14 14 L20 30 M10.5 24 H17.5" stroke={GREEN} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="27" cy="14" r="3.2" stroke={GREEN} strokeWidth="2" />
          <path d="M20 30 c0 -6 4 -9 7 -9 s7 3 7 9" stroke={GREEN} strokeWidth="2.2" strokeLinecap="round" />
        </svg>
        <div className="leading-tight">
          <p className="font-extrabold text-lg tracking-tight" style={{ color: GREEN }}>BTEC</p>
          <p className="text-[8.5px] text-slate-400 leading-tight">
            CABINET DE RECRUTEMENT<br />& DE FORMATION
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-4">
        <div className="mt-3">
          <NavLink item={TOP_ITEM} active={active} />
        </div>

        <Section label="SESSION CANDIDAT">
          {SESSION_CANDIDAT.map((item) => <NavLink key={item.id} item={item} active={active} />)}
        </Section>

        <Section label="SESSION PARTENAIRE">
          {SESSION_PARTENAIRE.map((item) => <NavLink key={item.id} item={item} active={active} />)}
        </Section>

        <Section label="GESTION FINANCIÈRE">
          {GESTION_FINANCIERE.map((item) => <NavLink key={item.id} item={item} active={active} />)}
        </Section>

        <Section label="RAPPORTS & SUIVI">
          {RAPPORTS_SUIVI.map((item) => <NavLink key={item.id} item={item} active={active} />)}
        </Section>

        <Section label="GESTION DES COMPTES">
          {GESTION_COMPTES.map((item) => <NavLink key={item.id} item={item} active={active} />)}
        </Section>

        <Section label="PARAMÈTRES">
          {PARAMETRES.map((item) => <NavLink key={item.id} item={item} active={active} />)}
        </Section>
      </div>

      <div className="mx-3 mb-3 rounded-lg bg-white/5 p-3 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-emerald-600/20 flex items-center justify-center">
          <Headphones size={16} style={{ color: GREEN }} />
        </div>
        <div className="text-[11px] leading-tight">
          <p className="font-semibold text-white">BESOIN D&apos;AIDE ?</p>
          <p className="text-slate-400">Contactez l&apos;administrateur</p>
          <p className="text-slate-400">support@btecbenin.com</p>
        </div>
      </div>
    </aside>
  );
}