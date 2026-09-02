// prisma/seed-permissions.ts
// Seed initial de la matrice de permissions par rôle (SQLite via better-sqlite3).
// Rôles en minuscules pour rester compatible avec les comptes déjà créés
// (ex: le compte directeur "DGBTEC" a role = "directeur").
//
// À exécuter après `npx prisma migrate dev` :
//   npx tsc prisma/seed-permissions.ts --outDir prisma/dist --module commonjs --target es2020 --esModuleInterop
//   node prisma/dist/seed-permissions.js

import { PrismaClient } from "@prisma/client";
import { PrismaBetterSQLite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSQLite3({ url: "file:./prisma/dev.db" });
const prisma = new PrismaClient({ adapter });

type PermissionSeed = {
  role: string;
  resource: string;
  action: "read" | "write" | "delete";
  scope?: string;
};

const permissions: PermissionSeed[] = [
  // ---------- directeur : accès total, y compris les comptes ----------
  { role: "directeur", resource: "formateur", action: "read", scope: "all" },
  { role: "directeur", resource: "formateur", action: "write", scope: "all" },
  { role: "directeur", resource: "formateur", action: "delete", scope: "all" },

  { role: "directeur", resource: "entreprise", action: "read", scope: "all" },
  { role: "directeur", resource: "entreprise", action: "write", scope: "all" },
  { role: "directeur", resource: "entreprise", action: "delete", scope: "all" },

  { role: "directeur", resource: "candidat", action: "read", scope: "all" },
  { role: "directeur", resource: "candidat", action: "write", scope: "all" },
  { role: "directeur", resource: "candidat", action: "delete", scope: "all" },

  { role: "directeur", resource: "entretien", action: "read", scope: "all" },
  { role: "directeur", resource: "entretien", action: "write", scope: "all" },
  { role: "directeur", resource: "entretien", action: "delete", scope: "all" },

  { role: "directeur", resource: "personnel_account", action: "read", scope: "all" },
  { role: "directeur", resource: "personnel_account", action: "write", scope: "all" },
  { role: "directeur", resource: "personnel_account", action: "delete", scope: "all" },

  // ---------- coordonnateur : tout voir/modifier, sauf comptes du personnel ----------
  { role: "coordonnateur", resource: "formateur", action: "read", scope: "all" },
  { role: "coordonnateur", resource: "formateur", action: "write", scope: "pending_director_approval" },

  { role: "coordonnateur", resource: "entreprise", action: "read", scope: "all" },
  { role: "coordonnateur", resource: "entreprise", action: "write", scope: "pending_director_approval" },

  { role: "coordonnateur", resource: "candidat", action: "read", scope: "all" },
  { role: "coordonnateur", resource: "candidat", action: "write", scope: "pending_director_approval" },

  { role: "coordonnateur", resource: "entretien", action: "read", scope: "all" },
  { role: "coordonnateur", resource: "entretien", action: "write", scope: "pending_director_approval" },
  // Pas d'entrée pour "personnel_account" => aucun accès

  // ---------- secretaire : dépôts de dossiers candidats + entretiens uniquement ----------
  { role: "secretaire", resource: "candidat", action: "read", scope: "all" },
  { role: "secretaire", resource: "entretien", action: "read", scope: "all" },

  // ---------- Autres rôles : aucun accès par défaut ----------
  // responsable_evenementiel, responsable_commerciale, superviseur, animateur_projet
];

async function main() {
  console.log(`Seed de ${permissions.length} permissions...`);

  for (const p of permissions) {
    await prisma.permission.upsert({
      where: {
        role_resource_action: {
          role: p.role,
          resource: p.resource,
          action: p.action,
        },
      },
      update: { scope: p.scope },
      create: p,
    });
  }

  for (const prefix of ["FBTEC", "PBTEC", "CBTEC"]) {
    await prisma.matriculeCounter.upsert({
      where: { prefix },
      update: {},
      create: { prefix, lastNum: 0 },
    });
  }

  console.log("Seed terminé.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });