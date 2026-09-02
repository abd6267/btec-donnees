"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import RequireRole from "../../../components/RequireRole";

const GREEN = "#16a34a";

const SEXE_LABELS: Record<string, string> = { M: "Masculin", F: "Féminin" };

function NouveauCandidatForm() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [enregistre, setEnregistre] = useState<{ numeroDossier: string } | null>(null);
  const [photoApercu, setPhotoApercu] = useState<string | null>(null);
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    sexe: "M",
    dateNaissance: "",
    telephone: "",
    email: "",
    adresse: "",
    niveauEtude: "",
    diplome: "",
    posteRecherche: "",
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [cv, setCv] = useState<File | null>(null);
  const [lettre, setLettre] = useState<File | null>(null);
  const [pieces, setPieces] = useState<File | null>(null);

  function updateField(field: string, value: string) {
    setForm({ ...form, [field]: value });
  }

  function handlePhotoChange(fichier: File | null) {
    setPhoto(fichier);
    setPhotoApercu((prevUrl) => {
      if (prevUrl) URL.revokeObjectURL(prevUrl);
      return fichier ? URL.createObjectURL(fichier) : null;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => data.append(key, value));
    if (photo) data.append("photo", photo);
    if (cv) data.append("cv", cv);
    if (lettre) data.append("lettre", lettre);
    if (pieces) data.append("pieces", pieces);

    const res = await fetch("/api/candidats/create", {
      method: "POST",
      body: data,
    });

    const result = await res.json();

    if (!res.ok) {
      setMessage(result.error || "Erreur");
      return;
    }

    setMessage(`Candidat créé : ${result.numeroDossier}`);
    setEnregistre({ numeroDossier: result.numeroDossier });
  }

  // Génère le récapitulatif en PDF côté client à partir des infos saisies
  // et de la liste des pièces jointes fournies (jsPDF ; nécessite
  // `npm install jspdf` dans le projet).
  async function handleTelechargerPdf() {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    const margeGauche = 15;
    let y = 20;

    doc.setFontSize(16);
    doc.setTextColor(22, 163, 74); // vert BTEC
    doc.text("BTEC - Récapitulatif du dossier candidat", margeGauche, y);
    y += 8;

    doc.setDrawColor(220, 220, 220);
    doc.line(margeGauche, y, 195, y);
    y += 10;

    // Photo en haut du récapitulatif, avant les informations du candidat
    if (photoApercu) {
      try {
        const tailleImg = 30;
        const xImg = (210 - tailleImg) / 2; // centrée (page A4 = 210mm de large)
        doc.addImage(photoApercu, xImg, y, tailleImg, tailleImg);
        y += tailleImg + 8;
      } catch {
        // Si l'image ne peut pas être intégrée (format non supporté),
        // on continue sans bloquer la génération du PDF.
      }
    }

    doc.setFontSize(11);
    doc.setTextColor(30, 30, 30);

    if (enregistre?.numeroDossier) {
      doc.setFont("helvetica", "bold");
      doc.text(`N° Dossier : ${enregistre.numeroDossier}`, margeGauche, y);
      doc.setFont("helvetica", "normal");
      y += 10;
    }

    const champs: [string, string][] = [
      ["Nom", form.nom],
      ["Prénom", form.prenom],
      ["Sexe", SEXE_LABELS[form.sexe] || form.sexe],
      ["Date de naissance", form.dateNaissance],
      ["Téléphone", form.telephone],
      ["Email", form.email],
      ["Adresse", form.adresse],
      ["Niveau d'étude", form.niveauEtude],
      ["Diplôme", form.diplome],
      ["Poste recherché", form.posteRecherche],
    ];

    doc.setFont("helvetica", "bold");
    doc.text("Informations du candidat", margeGauche, y);
    doc.setFont("helvetica", "normal");
    y += 7;

    champs.forEach(([label, valeur]) => {
      doc.setTextColor(100, 100, 100);
      doc.text(`${label} :`, margeGauche, y);
      doc.setTextColor(30, 30, 30);
      doc.text(valeur || "-", margeGauche + 50, y);
      y += 7;
    });

    y += 5;
    doc.setDrawColor(220, 220, 220);
    doc.line(margeGauche, y, 195, y);
    y += 10;

    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 30, 30);
    doc.text("Pièces fournies", margeGauche, y);
    doc.setFont("helvetica", "normal");
    y += 8;

    const documents: [string, File | null][] = [
      ["Photo", photo],
      ["CV", cv],
      ["Lettre de motivation", lettre],
      ["Pièces jointes", pieces],
    ];

    documents.forEach(([label, fichier]) => {
      const fourni = !!fichier;
      doc.setTextColor(fourni ? 22 : 200, fourni ? 163 : 60, fourni ? 74 : 60);
      doc.text(fourni ? "✓" : "✗", margeGauche, y);
      doc.setTextColor(30, 30, 30);
      doc.text(label, margeGauche + 8, y);
      if (fichier) {
        doc.setTextColor(130, 130, 130);
        doc.text(fichier.name, margeGauche + 60, y);
      }
      y += 7;
    });

    y += 10;
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Généré le ${new Date().toLocaleDateString("fr-FR")} - BTEC Cabinet de Recrutement & de Formation`,
      margeGauche,
      y
    );

    const nomFichier = `recapitulatif-${enregistre?.numeroDossier || form.nom || "candidat"}.pdf`;
    doc.save(nomFichier);
  }

  const documentsListe: [string, File | null][] = [
    ["Photo", photo],
    ["CV", cv],
    ["Lettre de motivation", lettre],
    ["Pièces jointes", pieces],
  ];

  return (
    <main className="min-h-screen bg-[#f4f6f8] text-slate-900 p-6 flex justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-slate-200 shadow-sm rounded-xl w-full max-w-2xl p-6 flex flex-col gap-4 h-fit"
      >
        <h1 className="text-[20px] font-bold text-slate-900">Nouveau candidat</h1>

        <Row>
          <Field label="Nom" value={form.nom} onChange={(v) => updateField("nom", v)} />
          <Field label="Prénom" value={form.prenom} onChange={(v) => updateField("prenom", v)} />
        </Row>
        <Row>
          <div className="flex-1">
            <label className="text-slate-600 text-[12px]">Sexe</label>
            <select
              value={form.sexe}
              onChange={(e) => updateField("sexe", e.target.value)}
              className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-[13px] text-slate-800 outline-none"
            >
              <option value="M">Masculin</option>
              <option value="F">Féminin</option>
            </select>
          </div>
          <Field label="Date de naissance" type="date" value={form.dateNaissance} onChange={(v) => updateField("dateNaissance", v)} />
        </Row>
        <Row>
          <Field label="Téléphone" value={form.telephone} onChange={(v) => updateField("telephone", v)} />
          <Field label="Email" type="email" value={form.email} onChange={(v) => updateField("email", v)} />
        </Row>
        <Field label="Adresse" value={form.adresse} onChange={(v) => updateField("adresse", v)} />
        <Row>
          <Field label="Niveau d'étude" value={form.niveauEtude} onChange={(v) => updateField("niveauEtude", v)} />
          <Field label="Diplôme" value={form.diplome} onChange={(v) => updateField("diplome", v)} />
        </Row>
        <Field label="Poste recherché" value={form.posteRecherche} onChange={(v) => updateField("posteRecherche", v)} />

        <h2 className="text-[15px] font-bold text-slate-900 mt-2">Documents</h2>
        <FileField label="Photo" onChange={handlePhotoChange} />
        <FileField label="CV" onChange={setCv} />
        <FileField label="Lettre de motivation" onChange={setLettre} />
        <FileField label="Pièces jointes" onChange={setPieces} />

        {message && (
          <p className={`text-[13px] ${message.startsWith("Candidat créé") ? "text-emerald-600" : "text-red-500"}`}>
            {message}
          </p>
        )}

        <button
          type="submit"
          className="rounded-lg py-2.5 text-white font-semibold text-[13px] mt-1"
          style={{ backgroundColor: GREEN }}
        >
          Enregistrer le candidat
        </button>

        {/* Récapitulatif final : infos saisies + statut des pièces jointes,
            avec export PDF. Reste visible après la saisie (avant ou après
            enregistrement) pour que l'utilisateur puisse vérifier son dossier. */}
        <div className="mt-4 pt-5 border-t border-slate-200">
          <h2 className="text-[15px] font-bold text-slate-900 mb-3">Récapitulatif du dossier</h2>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col gap-1.5 text-[12.5px]">
            {photoApercu && (
              <div className="flex justify-center mb-3">
                <img
                  src={photoApercu}
                  alt="Photo du candidat"
                  className="w-24 h-24 rounded-full object-cover border border-slate-200"
                />
              </div>
            )}
            {enregistre?.numeroDossier && (
              <p className="text-slate-800 font-semibold mb-1">N° Dossier : {enregistre.numeroDossier}</p>
            )}
            <RecapLigne label="Nom" valeur={form.nom} />
            <RecapLigne label="Prénom" valeur={form.prenom} />
            <RecapLigne label="Sexe" valeur={SEXE_LABELS[form.sexe]} />
            <RecapLigne label="Date de naissance" valeur={form.dateNaissance} />
            <RecapLigne label="Téléphone" valeur={form.telephone} />
            <RecapLigne label="Email" valeur={form.email} />
            <RecapLigne label="Adresse" valeur={form.adresse} />
            <RecapLigne label="Niveau d'étude" valeur={form.niveauEtude} />
            <RecapLigne label="Diplôme" valeur={form.diplome} />
            <RecapLigne label="Poste recherché" valeur={form.posteRecherche} />
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mt-3 flex flex-col gap-2">
            <p className="text-slate-700 font-semibold text-[12.5px] mb-1">Pièces fournies</p>
            {documentsListe.map(([label, fichier]) => (
              <div key={label} className="flex items-center gap-2 text-[12.5px]">
                <span className={fichier ? "text-emerald-600" : "text-slate-300"}>
                  {fichier ? "✓" : "✗"}
                </span>
                <span className="text-slate-700">{label}</span>
                {fichier && <span className="text-slate-400 text-[11px]">— {fichier.name}</span>}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleTelechargerPdf}
            className="w-full mt-3 rounded-lg py-2.5 text-[13px] font-semibold border"
            style={{ borderColor: GREEN, color: GREEN }}
          >
            Télécharger le récapitulatif en PDF
          </button>
        </div>
      </form>
    </main>
  );
}

function RecapLigne({ label, valeur }: { label: string; valeur: string }) {
  return (
    <div className="flex gap-2">
      <span className="text-slate-400 shrink-0 w-32">{label} :</span>
      <span className="text-slate-800">{valeur || "-"}</span>
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="flex gap-4">{children}</div>;
}

function Field({ label, value, onChange, type = "text" }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div className="flex-1">
      <label className="text-slate-600 text-[12px]">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-[13px] text-slate-800 outline-none"
      />
    </div>
  );
}

function FileField({ label, onChange }: { label: string; onChange: (f: File | null) => void }) {
  return (
    <div>
      <label className="text-slate-600 text-[12px]">{label}</label>
      <input
        type="file"
        onChange={(e) => onChange(e.target.files?.[0] || null)}
        className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-[12.5px] text-slate-600 outline-none"
      />
    </div>
  );
}

export default function NouveauCandidatPage() {
  return (
    <RequireRole allowed={["directeur", "coordonnateur", "secretaire"]}>
      <NouveauCandidatForm />
    </RequireRole>
  );
}