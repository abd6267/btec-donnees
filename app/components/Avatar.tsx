"use client";

import { useState } from "react";

type AvatarProps = {
  photoPath?: string | null;
  nom: string;
  prenom: string;
  size?: number;
};

function getInitials(nom: string, prenom: string) {
  const a = prenom?.trim()?.[0] ?? "";
  const b = nom?.trim()?.[0] ?? "";
  return (a + b).toUpperCase() || "?";
}

// Palette stable dérivée du nom, pour que chaque candidat garde toujours la même couleur.
const PALETTE = ["#16a34a", "#2563eb", "#9333ea", "#ea580c", "#0891b2", "#db2777"];

function colorFor(key: string) {
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = key.charCodeAt(i) + ((hash << 5) - hash);
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

export default function Avatar({ photoPath, nom, prenom, size = 28 }: AvatarProps) {
  const [errored, setErrored] = useState(false);
  const showPhoto = photoPath && !errored;
  const dim = { width: size, height: size };

  if (showPhoto) {
    return (
      <img
        src={photoPath!}
        alt={`${prenom} ${nom}`}
        style={dim}
        className="rounded-full object-cover shrink-0"
        onError={() => setErrored(true)}
      />
    );
  }

  const initials = getInitials(nom, prenom);
  return (
    <div
      style={{ ...dim, backgroundColor: `${colorFor(nom + prenom)}33`, color: colorFor(nom + prenom) }}
      className="rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold"
    >
      {initials}
    </div>
  );
}