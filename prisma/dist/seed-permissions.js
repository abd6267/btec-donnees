"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// prisma/seed-permissions.ts
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const permissions = [
    { role: "DIRECTEUR", resource: "formateur", action: "read", scope: "all" },
    { role: "DIRECTEUR", resource: "formateur", action: "write", scope: "all" },
    { role: "DIRECTEUR", resource: "formateur", action: "delete", scope: "all" },
    { role: "DIRECTEUR", resource: "entreprise", action: "read", scope: "all" },
    { role: "DIRECTEUR", resource: "entreprise", action: "write", scope: "all" },
    { role: "DIRECTEUR", resource: "entreprise", action: "delete", scope: "all" },
    { role: "DIRECTEUR", resource: "candidat", action: "read", scope: "all" },
    { role: "DIRECTEUR", resource: "candidat", action: "write", scope: "all" },
    { role: "DIRECTEUR", resource: "candidat", action: "delete", scope: "all" },
    { role: "DIRECTEUR", resource: "entretien", action: "read", scope: "all" },
    { role: "DIRECTEUR", resource: "entretien", action: "write", scope: "all" },
    { role: "DIRECTEUR", resource: "entretien", action: "delete", scope: "all" },
    { role: "DIRECTEUR", resource: "personnel_account", action: "read", scope: "all" },
    { role: "DIRECTEUR", resource: "personnel_account", action: "write", scope: "all" },
    { role: "DIRECTEUR", resource: "personnel_account", action: "delete", scope: "all" },
    { role: "COORDONNATEUR", resource: "formateur", action: "read", scope: "all" },
    { role: "COORDONNATEUR", resource: "formateur", action: "write", scope: "pending_director_approval" },
    { role: "COORDONNATEUR", resource: "entreprise", action: "read", scope: "all" },
    { role: "COORDONNATEUR", resource: "entreprise", action: "write", scope: "pending_director_approval" },
    { role: "COORDONNATEUR", resource: "candidat", action: "read", scope: "all" },
    { role: "COORDONNATEUR", resource: "candidat", action: "write", scope: "pending_director_approval" },
    { role: "COORDONNATEUR", resource: "entretien", action: "read", scope: "all" },
    { role: "COORDONNATEUR", resource: "entretien", action: "write", scope: "pending_director_approval" },
    { role: "SECRETAIRE", resource: "candidat", action: "read", scope: "all" },
    { role: "SECRETAIRE", resource: "entretien", action: "read", scope: "all" },
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
