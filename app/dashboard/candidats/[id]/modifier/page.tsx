"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import RequireRole from "../../../../components/RequireRole";
import Sidebar from "../../../../components/Sidebar";
import Topbar from "../../../../components/Topbar";

const GREEN = "#16a34a";

type CandidatForm = {
  nom: string;
  prenom: string;
  sexe: string;
  dateNaissance: string;
  telephone: string;
  email: string;
  adresse: string;
  niveauEtude: string;
  diplome: string;
  posteRecherche: string;
};

function ModifierCandidatContent() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [form, setForm] = useState<CandidatForm>({
    nom: "", prenom: "", sexe: "M", dateNaissance: "", telephone: "",
    email: "", adresse: "", niveauEtude: "", diplome: "", posteRecherche: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const load = useCallback(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/candidats/${id}`)
      .then((res) => res.json())
      .then((d) => {
        setForm({
          nom: d.nom || "",
          prenom: d.prenom || "",
          sexe: d.sexe || "M",
          dateNaissance: d.dateNaissance ? new Date(d.dateNaissance).toISOString().slice(0, 10) : "",
          telephone: d.telephone || "",
          email: d.email || "",
          adresse: d.adresse || "",
          niveauEtude: d.niveauEtude || "",
          diplome: d.diplome || "",
          posteRecherche: d.posteRecherche || "",
        });
        setLoading(false);
      });
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const updateField = (field: keyof CandidatForm, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const enregistrer = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch(`/api/candidats/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erreur lors de la mise à jour.");
        return;
      }
      setSuccess(true);
      setTimeout(() => router.push(`/dashboard/candidats/${id}`), 800);
    } catch {
      setError("Impossible de contacter le serveur.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
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

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      <Sidebar active="candidats" />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <div className="p-6 max-w-2xl">
          <button
            onClick={() => router.push(`/dashboard/candidats/${id}`)}
            className="flex items-center gap-1.5 text-slate-400 text-[12px] mb-4 hover:text-white"
          >
            <ArrowLeft size={14} /> Retour au dossier
          </button>

          <h1 className="text-[20px] font-bold text-white mb-1">Modifier le dossier</h1>
          <p className="text-slate-500 text-[12px] mb-5">
            Corrigez les informations saisies pour ce candidat.
          </p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-[12.5px] rounded-lg p-3 mb-4">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[12.5px] rounded-lg p-3 mb-4">
              Modifications enregistrées.
            </div>
          )}

          <div className="bg-[#111827] rounded-xl border border-white/5 p-5 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Nom</label>
                <input
                  value={form.nom}
                  onChange={(e) => updateField("nom", e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-[13px] text-white outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Prénom</label>
                <input
                  value={form.prenom}
                  onChange={(e) => updateField("prenom", e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-[13px] text-white outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Sexe</label>
                <select
                  value={form.sexe}
                  onChange={(e) => updateField("sexe", e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-[13px] text-white outline-none"
                >
                  <option value="M">Masculin</option>
                  <option value="F">Féminin</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Date de naissance</label>
                <input
                  type="date"
                  value={form.dateNaissance}
                  onChange={(e) => updateField("dateNaissance", e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-[13px] text-white outline-none [color-scheme:dark]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Téléphone</label>
                <input
                  value={form.telephone}
                  onChange={(e) => updateField("telephone", e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-[13px] text-white outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-[13px] text-white outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Adresse</label>
              <input
                value={form.adresse}
                onChange={(e) => updateField("adresse", e.target.value)}
                className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-[13px] text-white outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Niveau d&apos;étude</label>
                <input
                  value={form.niveauEtude}
                  onChange={(e) => updateField("niveauEtude", e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-[13px] text-white outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Diplôme</label>
                <input
                  value={form.diplome}
                  onChange={(e) => updateField("diplome", e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-[13px] text-white outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Poste recherché</label>
              <input
                value={form.posteRecherche}
                onChange={(e) => updateField("posteRecherche", e.target.value)}
                className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-[13px] text-white outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-5">
            <button
              onClick={() => router.push(`/dashboard/candidats/${id}`)}
              className="px-4 py-2 rounded-lg text-[13px] text-slate-300 hover:bg-white/5"
            >
              Annuler
            </button>
            <button
              onClick={enregistrer}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold text-white disabled:opacity-50"
              style={{ backgroundColor: GREEN }}
            >
              <Save size={14} /> {saving ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ModifierCandidatPage() {
  return (
    <RequireRole allowed={["directeur", "coordonnateur", "secretaire"]}>
      <ModifierCandidatContent />
    </RequireRole>
  );
}