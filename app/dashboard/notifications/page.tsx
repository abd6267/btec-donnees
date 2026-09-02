"use client";

import { useEffect, useState } from "react";
import { Bell, AlertTriangle, Info, Clock } from "lucide-react";
import RequireRole from "../../components/RequireRole";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";

const GREEN = "#16a34a";

type Notification = {
  type: string;
  message: string;
  date: string;
  niveau: "urgent" | "attention" | "info";
};

const NIVEAU_ICON: Record<string, any> = {
  urgent: AlertTriangle,
  attention: Clock,
  info: Info,
};

const NIVEAU_COLOR: Record<string, string> = {
  urgent: "text-red-400 bg-red-500/10",
  attention: "text-yellow-400 bg-yellow-500/10",
  info: "text-blue-400 bg-blue-500/10",
};

function NotificationsContent() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((data) => setNotifications(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      <Sidebar active="notifications" />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <div className="p-6">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-lg bg-emerald-600/15 flex items-center justify-center">
              <Bell size={17} style={{ color: GREEN }} />
            </div>
            <h1 className="text-[22px] font-bold text-white">Notifications</h1>
          </div>
          <p className="text-slate-500 text-[12px] mb-5 ml-11">
            Alertes automatiques : paiements en retard, entretiens du jour, formations à venir, dossiers incomplets
          </p>

          <div className="bg-[#111827] rounded-xl border border-white/5 overflow-hidden">
            {loading ? (
              <p className="text-slate-400 p-6 text-[13px]">Chargement...</p>
            ) : notifications.length === 0 ? (
              <div className="p-10 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-600/15 flex items-center justify-center mb-3">
                  <Bell size={22} style={{ color: GREEN }} />
                </div>
                <p className="text-white text-[13px] font-medium">Aucune alerte pour le moment</p>
                <p className="text-slate-500 text-[12px] mt-1">Tout est à jour.</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {notifications.map((n, idx) => {
                  const Icon = NIVEAU_ICON[n.niveau] || Info;
                  return (
                    <div key={idx} className="flex items-start gap-3 p-4">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${NIVEAU_COLOR[n.niveau]}`}>
                        <Icon size={15} />
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-[13px]">{n.message}</p>
                        {n.date && (
                          <p className="text-slate-500 text-[11px] mt-0.5">
                            {new Date(n.date).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  return (
    <RequireRole allowed={["directeur", "coordonnateur", "secretaire"]}>
      <NotificationsContent />
    </RequireRole>
  );
}