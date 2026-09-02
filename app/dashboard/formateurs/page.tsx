"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Handshake, Plus, X } from "lucide-react";
import RequireRole from "../../components/RequireRole";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";

const GREEN = "#16a34a";

type Formateur = {
  id: string;
  photoPath: string | null;
  domaine: string;
  modulesEnseignes: string;
  telephone: string;
  email: string;
  honoraires: string;
};

function FormateursContent() {
  const [formateurs, setFormateurs] = useState<Formateur[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [domaine, setDomaine] = useState("");
  const [modulesEnseignes, setModulesEnseignes] = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [honoraires, setHonoraires] = useState("");
  const [saving, setSaving] = useState(false);
  const [erreur, setErreur] = useState("");

  const charger = () => {
    setLoading(true);
    fetch("/api/formateurs/list")
      .then((r) => r.json())
      .then((data) => setFormateurs(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    charger();
  }, []);

  const resetForm = () => {
    setDomaine(""); setModulesEnseignes(""); setTelephone("");
    setEmail(""); setHonoraires(""); setErreur("");
  };

  const creerFormateur = async () => {
    if (!domaine || !modulesEnseignes || !telephone || !email || !honoraires) {
      setErreur("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    setSaving(true);
    setErreur("");
    try {
      const res = await fetch("/api/formateurs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domaine, modulesEnseignes, telephone, email, honoraires }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErreur(data.error || "Erreur lors de la création");
        return;
      }
      setShowModal(false);
      resetForm();
      charger();
    } catch {
      setErreur("Erreur réseau lors de la création");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      <Sidebar active="formateurs" />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <div className="p-6">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-emerald-600/15 flex items-center justify-center">
                <Handshake size={17} style={{ color: GREEN }} />
              </div>
              <h1 className="text-[22px] font-bold text-white">Formateurs & Prestataires</h1>
            </div>
            <button
              onClick={() => { resetForm(); setShowModal(true); }}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-[12px] font-semibold text-white"
              style={{ backgroundColor: GREEN }}
            >
              <Plus size={14} /> Nouveau formateur
            </button>
          </div>
          <p className="text-slate-500 text-[12px] mb-5 ml-11">
            Liste des formateurs et prestataires du Cabinet BTEC
          </p>

          <div className="bg-[#111827] rounded-xl border border-white/5 overflow-hidden">
            {loading ? (
              <p className="text-slate-400 p-6 text-[13px]">Chargement...</p>
            ) : formateurs.length === 0 ? (
              <div className="p-10 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-600/15 flex items-center justify-center mb-3">
                  <Handshake size={22} style={{ color: GREEN }} />
                </div>
                <p className="text-white text-[13px] font-medium">Aucun formateur enregistré</p>
                <p className="text-slate-500 text-[12px] mt-1">Cliquez sur &quot;Nouveau formateur&quot; pour commencer.</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="text-slate-400 text-[11px] tracking-wide border-b border-white/5">
                    <th className="py-3 px-4 font-medium">Formateur</th>
                    <th className="py-3 px-4 font-medium">Modules enseignés</th>
                    <th className="py-3 px-4 font-medium">Contact</th>
                    <th className="py-3 px-4 font-medium">Honoraires</th>
                  </tr>
                </thead>
                <tbody>
                  {formateurs.map((f) => (
                    <tr key={f.id} className="border-b border-white/5 last:border-0 text-[12.5px]">
                      <td className="py-3 px-4">
                        <Link href={`/dashboard/formateurs/${f.id}`} className="flex items-center gap-2 text-white hover:text-emerald-400">
                          <div className="w-7 h-7 rounded-lg bg-emerald-600/15 flex items-center justify-center overflow-hidden shrink-0">
                            {f.photoPath ? (
                              <img src={f.photoPath} alt={f.domaine} className="w-full h-full object-cover" />
                            ) : (
                              <Handshake size={13} style={{ color: GREEN }} />
                            )}
                          </div>
                          {f.domaine}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-slate-300">{f.modulesEnseignes}</td>
                      <td className="py-3 px-4 text-slate-300">
                        {f.telephone}<br /><span className="text-slate-500">{f.email}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-300">{f.honoraires}</td>
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
          <div className="bg-[#111827] border border-white/10 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold text-[15px]">Nouveau formateur</h2>
              <button onClick={() => setShowModal(false)}>
                <X size={16} className="text-slate-400 hover:text-white" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Domaine</label>
                <input value={domaine} onChange={(e) => setDomaine(e.target.value)} placeholder="Ex: Comptabilité, Informatique..." className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-[13px] text-white outline-none placeholder:text-slate-600" />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Modules enseignés</label>
                <textarea value={modulesEnseignes} onChange={(e) => setModulesEnseignes(e.target.value)} rows={2} className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-[13px] text-white outline-none resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Téléphone</label>
                  <input value={telephone} onChange={(e) => setTelephone(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-[13px] text-white outline-none" />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-[13px] text-white outline-none" />
                </div>
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Honoraires</label>
                <input value={honoraires} onChange={(e) => setHonoraires(e.target.value)} placeholder="Ex: 15 000 FCFA/heure" className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-[13px] text-white outline-none placeholder:text-slate-600" />
              </div>

              {erreur && <p className="text-red-400 text-[12px]">{erreur}</p>}
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg text-[13px] text-slate-300 hover:bg-white/5">
                Annuler
              </button>
              <button
                onClick={creerFormateur}
                disabled={saving}
                className="px-4 py-2 rounded-lg text-[13px] font-semibold text-white disabled:opacity-50"
                style={{ backgroundColor: GREEN }}
              >
                {saving ? "Création..." : "Créer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FormateursPage() {
  return (
    <RequireRole allowed={["directeur", "coordonnateur"]}>
      <FormateursContent />
    </RequireRole>
  );
}