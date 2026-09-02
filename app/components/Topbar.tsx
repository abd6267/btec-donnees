"use client";

import { Menu, Search, Bell, Mail, ChevronDown } from "lucide-react";

type TopbarProps = {
  placeholder?: string;
  userName?: string;
  userRole?: string;
  avatarUrl?: string;
  notifCount?: number;
  messageCount?: number;
};

export default function Topbar({
  placeholder = "Rechercher un candidat, une entreprise...",
  userName = "Placide AGUIA-DAHO",
  userRole = "Administrateur",
  avatarUrl,
  notifCount = 0,
  messageCount = 0,
}: TopbarProps) {
  return (
    <div className="h-16 bg-black flex items-center gap-4 px-5 border-b border-white/10 sticky top-0 z-10">
      <Menu size={20} className="text-white shrink-0" />

      <div className="flex-1 max-w-xl relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          placeholder={placeholder}
          className="w-full bg-[#1a1a1a] text-slate-200 text-[13px] rounded-lg pl-9 pr-4 py-2.5 outline-none placeholder:text-slate-500 border border-white/5"
        />
      </div>

      <div className="flex-1" />

      <div className="relative">
        <Bell size={19} className="text-white" />
        {notifCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
            {notifCount}
          </span>
        )}
      </div>
      <div className="relative">
        <Mail size={19} className="text-white" />
        {messageCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
            {messageCount}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 pl-2">
        {avatarUrl ? (
          <img src={avatarUrl} className="w-8 h-8 rounded-full object-cover" alt={userName} />
        ) : (
          <div className="w-8 h-8 rounded-full bg-emerald-600/30 flex items-center justify-center text-emerald-400 text-[11px] font-bold">
            {userName.split(" ").map((n) => n[0]).slice(0, 2).join("")}
          </div>
        )}
        <div className="text-[12px] leading-tight">
          <p className="text-white font-semibold">{userName}</p>
          <p className="text-slate-400 text-[11px]">{userRole}</p>
        </div>
        <ChevronDown size={14} className="text-slate-400" />
      </div>
    </div>
  );
}