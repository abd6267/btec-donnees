"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users, Briefcase, GraduationCap, UserX, Building2, Calendar, ChevronDown,
  MoreVertical, TrendingUp, AlertTriangle, FileWarning, FileText, Wallet, X,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import StatCard from "../components/StatCard";

const GREEN = "#16a34a";

type DashboardSummary = {
  stats: {
    totalCandidats: number; candidatsCeMois: number;
    totalEntretiens: number; entretiensCeMois: number;
    totalFormes: number; formesCeMois: number;
    totalEmbauches: number; embauchesCeMois: number;
    totalDebauches: number; debauchesCeMois: number;
    totalEntreprises: number; entreprisesCeMois: number;
  };
  repartitionCandidats: { label: string; pct: number; color: string }[];
  dernieresActivites: { type: string; title: string; sub: string; time: string }[];
  dernieresActivitesToutes: { type: string; title: string; sub: string; time: string }[];
  prochainsRdvs: { date: string; mois: string; nom: string; poste: string; heure: string }[];
  prochainsRdvsTous: { date: string; mois: string; nom: string; poste: string; heure: string }[];
  alertes: { type: string; title: string; sub: string; time: string }[];
  finances: null | { recettes: number; depenses: number; benefice: number };
  evolutionCandidats: { mois: string; total: number }[];
  entreprises: null | unknown;
};

const ACTIVITE_ICONS: Record<string, typeof FileText> = {
  candidat: FileText,
  entretien: Users,
  embauche: Briefcase,
  debauche: UserX,
  entreprise: Building2,
  paiement: Wallet,
};

const ALERTE_STYLE: Record<string, { icon: typeof AlertTriangle; color: string }> = {
  dossier: { icon: FileText, color: "#3b82f6" },
  formation: { icon: GraduationCap, color: "#16a34a" },
  paiement: { icon: AlertTriangle, color: "#f97316" },
  contrat: { icon: FileWarning, color: "#ef4444" },
};

function StatsChart({ data }: { data: { mois: string; total: number }[] }) {
  const w = 380, h = 130;
  const points = data.length > 0 ? data.map((d) => d.total) : [0];
  const max = Math.max(...points, 1); // évite la division par 0, garde une échelle lisible même à 1 point
  const stepX = points.length > 1 ? w / (points.length - 1) : 0;
  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${i * stepX} ${h - (p / max) * h}`)
    .join(" ");
  const areaPath = `${path} L ${(points.length - 1) * stepX} ${h} L 0 ${h} Z`;

  if (data.length === 0) {
    return <p className="text-slate-500 text-[12px] py-8 text-center">Pas encore de données sur l&apos;année.</p>;
  }

  return (
    <>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-28">
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#16a34a" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#16a34a" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#areaGrad)" />
        <path d={path} fill="none" stroke="#22c55e" strokeWidth="2" />
        {points.map((p, i) => (
          <circle key={i} cx={i * stepX} cy={h - (p / max) * h} r="2.5" fill="#22c55e" />
        ))}
      </svg>
      <div className="flex justify-between text-[10px] text-slate-500 mt-1 px-0.5">
        {data.map((d) => <span key={d.mois}>{d.mois}</span>)}
      </div>
    </>
  );
}

function DonutChart({ segs }: { segs: { label: string; pct: number; color: string }[] }) {
  const R = 52, C = 2 * Math.PI * R;
  let acc = 0;
  return (
    <svg viewBox="0 0 140 140" className="w-32 h-32 shrink-0 -rotate-90">
      {segs.map((seg, i) => {
        const dash = (seg.pct / 100) * C;
        const el = (
          <circle
            key={i}
            cx="70" cy="70" r={R}
            fill="none"
            stroke={seg.color}
            strokeWidth="16"
            strokeDasharray={`${dash} ${C - dash}`}
            strokeDashoffset={-((acc / 100) * C)}
          />
        );
        acc += seg.pct;
        return el;
      })}
    </svg>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-6"
      onClick={onClose}
    >
      <div
        className="bg-[#111827] border border-white/10 rounded-xl w-full max-w-lg max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <p className="text-white text-[14px] font-semibold tracking-wide">{title}</p>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        </div>
        <div className="p-4 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [role, setRole] = useState<string | null>(null);
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOuvert, setModalOuvert] = useState<null | "activites" | "rdvs" | "alertes">(null);
  const router = useRouter();

  useEffect(() => {
    const storedRole = localStorage.getItem("btec_role");
    if (storedRole) setRole(storedRole);
    else router.push("/");
  }, [router]);

  useEffect(() => {
    if (!role) return;
    let cancelled = false;
    fetch("/api/dashboard/summary")
      .then((res) => res.json())
      .then((d) => {
        if (!cancelled) {
          setData(d);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [role]);

  if (!role) return null;

  const today = new Date().toLocaleDateString("fr-FR", {
    weekday: "long", day: "2-digit", month: "long", year: "numeric",
  });

  const s = data?.stats;
  const statCards = [
    { icon: Users, value: s?.totalCandidats ?? "—", label: "Dossiers de Candidature", sub: s ? `+${s.candidatsCeMois} ce mois` : "", color: "#16a34a" },
    { icon: Briefcase, value: s?.totalEntretiens ?? "—", label: "Entretiens ce mois", sub: s ? `+${s.entretiensCeMois} ce mois` : "", color: "#16a34a" },
    { icon: GraduationCap, value: s?.totalFormes ?? "—", label: "Formés en attente d'insertion", sub: s ? `+${s.formesCeMois} ce mois` : "", color: "#16a34a" },
    { icon: Briefcase, value: s?.totalEmbauches ?? "—", label: "Employés Embauchés", sub: s ? `+${s.embauchesCeMois} ce mois` : "", color: "#16a34a" },
    { icon: UserX, value: s?.totalDebauches ?? "—", label: "Employés Débauchés", sub: s ? `+${s.debauchesCeMois} ce mois` : "", color: "#16a34a" },
    { icon: Building2, value: s?.totalEntreprises ?? "—", label: "Entreprises Partenaires", sub: "Bientôt disponible", color: "#16a34a" },
  ];

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      <Sidebar active="dashboard" />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <div className="p-6">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h1 className="text-[26px] font-bold text-white">Bienvenue, Placide !</h1>
              <p className="text-slate-400 text-[13px] mt-0.5">
                Voici ce qui se passe aujourd&apos;hui dans votre cabinet.
              </p>
            </div>
            <button className="flex items-center gap-2 bg-[#111827] border border-white/10 rounded-lg px-3.5 py-2 text-[13px] text-white capitalize">
              <Calendar size={15} />
              {today}
              <ChevronDown size={13} />
            </button>
          </div>

          <div className="grid grid-cols-6 gap-3 mb-4">
            {statCards.map((c, i) => <StatCard key={i} {...c} />)}
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="col-span-1 bg-[#111827] rounded-xl p-4 border border-white/5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-white text-[13px] font-semibold tracking-wide">STATISTIQUES GLOBALES</p>
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  Cette année <ChevronDown size={12} />
                </span>
              </div>
              <StatsChart data={data?.evolutionCandidats ?? []} />
              <div className="grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-white/5 text-center">
                {[
                  [s?.totalCandidats ?? "—", "Candidats inscrits"],
                  [s?.totalEntretiens ?? "—", "Entretiens réalisés"],
                  [s?.totalEmbauches ?? "—", "Places / Embauchés"],
                  [s?.totalFormes ?? "—", "En attente d'insertion"],
                ].map(([v, l]) => (
                  <div key={l as string}>
                    <p className="text-white font-bold text-sm">{v}</p>
                    <p className="text-slate-500 text-[9px] leading-tight mt-0.5">{l}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-span-1 bg-[#111827] rounded-xl p-4 border border-white/5">
              <p className="text-white text-[13px] font-semibold tracking-wide mb-3">RÉPARTITION DES CANDIDATS</p>
              {data && data.repartitionCandidats.length > 0 ? (
                <div className="flex items-center gap-4 relative">
                  <DonutChart segs={data.repartitionCandidats} />
                  <div className="absolute left-[52px] top-1/2 -translate-y-1/2 -translate-x-1/2 text-center pointer-events-none">
                    <p className="text-white text-xl font-bold">{s?.totalCandidats}</p>
                    <p className="text-slate-500 text-[10px]">Total</p>
                  </div>
                  <div className="flex flex-col gap-2 text-[11px] text-slate-300">
                    {data.repartitionCandidats.map((seg) => (
                      <div key={seg.label} className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                        <span>{seg.label} <span className="text-slate-500">({seg.pct.toFixed(1)}%)</span></span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-slate-500 text-[12px] py-8 text-center">
                  {loading ? "Chargement..." : "Aucun candidat pour l'instant."}
                </p>
              )}
            </div>

            <div className="col-span-1 bg-[#111827] rounded-xl p-4 border border-white/5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-white text-[13px] font-semibold tracking-wide">
                  SITUATION FINANCIÈRE <span className="text-slate-500 font-normal">(Ce mois)</span>
                </p>
                <MoreVertical size={14} className="text-slate-500" />
              </div>
              {data?.finances ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-black/30 rounded-lg p-3">
                      <p className="text-slate-400 text-[10px] tracking-wide">RECETTES</p>
                      <p className="text-white font-bold text-base mt-1">
                        {data.finances.recettes.toLocaleString("fr-FR")} FCFA
                      </p>
                    </div>
                    <div className="bg-black/30 rounded-lg p-3">
                      <p className="text-slate-400 text-[10px] tracking-wide">DÉPENSES</p>
                      <p className="text-white font-bold text-base mt-1">
                        {data.finances.depenses.toLocaleString("fr-FR")} FCFA
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 rounded-lg p-3.5 flex items-center justify-between" style={{ backgroundColor: GREEN }}>
                    <div>
                      <p className="text-white/80 text-[10px] tracking-wide">BÉNÉFICE NET</p>
                      <p className="text-white font-bold text-base">
                        {data.finances.benefice.toLocaleString("fr-FR")} FCFA
                      </p>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                      <TrendingUp size={16} className="text-white" />
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-slate-500 text-[12px]">Module finances pas encore branché.</p>
                  <p className="text-slate-600 text-[10.5px] mt-1">Créez une API paiements pour activer ce bloc.</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-[#111827] rounded-xl p-4 border border-white/5">
              <p className="text-white text-[13px] font-semibold tracking-wide mb-3">DERNIÈRES ACTIVITÉS</p>
              {loading ? (
                <p className="text-slate-500 text-[12px] py-4">Chargement...</p>
              ) : data && data.dernieresActivites.length > 0 ? (
                <div className="flex flex-col gap-3.5">
                  {data.dernieresActivites.map((a, i) => {
                    const Icon = ACTIVITE_ICONS[a.type] || FileText;
                    return (
                      <div key={i} className="flex items-start gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-emerald-600/15 flex items-center justify-center shrink-0">
                          <Icon size={14} style={{ color: GREEN }} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-white text-[12px] leading-tight">{a.title}</p>
                          <p className="text-slate-500 text-[11px]">{a.sub}</p>
                        </div>
                        <span className="text-slate-500 text-[10px] shrink-0">{a.time}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-slate-500 text-[12px] py-4">Aucune activité récente.</p>
              )}
              <button onClick={() => setModalOuvert("activites")} className="text-emerald-500 text-[12px] font-medium mt-4">Voir toutes les activités ›</button>
            </div>

            <div className="bg-[#111827] rounded-xl p-4 border border-white/5">
              <p className="text-white text-[13px] font-semibold tracking-wide mb-3">PROCHAINS RENDEZ-VOUS</p>
              {loading ? (
                <p className="text-slate-500 text-[12px] py-4">Chargement...</p>
              ) : data && data.prochainsRdvs.length > 0 ? (
                <div className="flex flex-col gap-2.5">
                  {data.prochainsRdvs.map((r, i) => (
                    <div key={i} className="flex items-center gap-3 bg-black/30 rounded-lg p-2.5">
                      <div className="w-11 h-11 rounded-lg flex flex-col items-center justify-center shrink-0" style={{ backgroundColor: GREEN }}>
                        <span className="text-white text-sm font-bold leading-none">{r.date}</span>
                        <span className="text-white/80 text-[8px] leading-none mt-0.5">{r.mois}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-white text-[12px] font-medium">Entretien : {r.nom}</p>
                        <p className="text-slate-500 text-[11px]">Poste : {r.poste}</p>
                        <p className="text-slate-500 text-[10px]">{r.heure}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-[12px] py-4">Aucun rendez-vous à venir.</p>
              )}
              <button onClick={() => setModalOuvert("rdvs")} className="text-emerald-500 text-[12px] font-medium mt-4">Voir tous les rendez-vous ›</button>
            </div>

            <div className="bg-[#111827] rounded-xl p-4 border border-white/5">
              <p className="text-white text-[13px] font-semibold tracking-wide mb-3">ALERTES & NOTIFICATIONS</p>
              {loading ? (
                <p className="text-slate-500 text-[12px] py-4">Chargement...</p>
              ) : data && data.alertes.length > 0 ? (
                <div className="flex flex-col gap-3.5">
                  {data.alertes.map((a, i) => {
                    const style = ALERTE_STYLE[a.type] || { icon: FileText, color: "#3b82f6" };
                    const Icon = style.icon;
                    return (
                      <div key={i} className="flex items-start gap-2.5">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${style.color}22` }}>
                          <Icon size={14} style={{ color: style.color }} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-white text-[12px] leading-tight">{a.title}</p>
                          <p className="text-slate-500 text-[11px]">{a.sub}</p>
                        </div>
                        <span className="text-slate-500 text-[10px] shrink-0">{a.time}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-slate-500 text-[12px] py-4">Aucune alerte pour le moment.</p>
              )}
              <button onClick={() => setModalOuvert("alertes")} className="text-emerald-500 text-[12px] font-medium mt-4">Voir toutes les alertes ›</button>
            </div>
          </div>

          <p className="text-center text-slate-600 text-[11px] mt-6 pt-4 border-t border-white/5 relative">
            © 2026 BTEC BENIN - Tous droits réservés
            <span className="absolute right-2">Version 1.0.0</span>
          </p>

          {modalOuvert === "activites" && (
            <Modal title="Toutes les activités" onClose={() => setModalOuvert(null)}>
              {data && data.dernieresActivitesToutes.length > 0 ? (
                <div className="flex flex-col gap-3.5">
                  {data.dernieresActivitesToutes.map((a, i) => {
                    const Icon = ACTIVITE_ICONS[a.type] || FileText;
                    return (
                      <div key={i} className="flex items-start gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-emerald-600/15 flex items-center justify-center shrink-0">
                          <Icon size={14} style={{ color: GREEN }} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-white text-[12px] leading-tight">{a.title}</p>
                          <p className="text-slate-500 text-[11px]">{a.sub}</p>
                        </div>
                        <span className="text-slate-500 text-[10px] shrink-0">{a.time}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-slate-500 text-[12px]">Aucune activité.</p>
              )}
            </Modal>
          )}

          {modalOuvert === "rdvs" && (
            <Modal title="Tous les rendez-vous" onClose={() => setModalOuvert(null)}>
              {data && data.prochainsRdvsTous.length > 0 ? (
                <div className="flex flex-col gap-2.5">
                  {data.prochainsRdvsTous.map((r, i) => (
                    <div key={i} className="flex items-center gap-3 bg-black/30 rounded-lg p-2.5">
                      <div className="w-11 h-11 rounded-lg flex flex-col items-center justify-center shrink-0" style={{ backgroundColor: GREEN }}>
                        <span className="text-white text-sm font-bold leading-none">{r.date}</span>
                        <span className="text-white/80 text-[8px] leading-none mt-0.5">{r.mois}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-white text-[12px] font-medium">Entretien : {r.nom}</p>
                        <p className="text-slate-500 text-[11px]">Poste : {r.poste}</p>
                        <p className="text-slate-500 text-[10px]">{r.heure}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-[12px]">Aucun rendez-vous à venir.</p>
              )}
            </Modal>
          )}

          {modalOuvert === "alertes" && (
            <Modal title="Toutes les alertes" onClose={() => setModalOuvert(null)}>
              {data && data.alertes.length > 0 ? (
                <div className="flex flex-col gap-3.5">
                  {data.alertes.map((a, i) => {
                    const style = ALERTE_STYLE[a.type] || { icon: FileText, color: "#3b82f6" };
                    const Icon = style.icon;
                    return (
                      <div key={i} className="flex items-start gap-2.5">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${style.color}22` }}>
                          <Icon size={14} style={{ color: style.color }} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-white text-[12px] leading-tight">{a.title}</p>
                          <p className="text-slate-500 text-[11px]">{a.sub}</p>
                        </div>
                        <span className="text-slate-500 text-[10px] shrink-0">{a.time}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-slate-500 text-[12px]">Aucune alerte.</p>
              )}
            </Modal>
          )}
        </div>
      </div>
    </div>
  );
}