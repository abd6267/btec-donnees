# Script de migration : remplace l'adapter better-sqlite3 par libsql (Turso)
# dans tous les fichiers route.ts sous app/api

$fichiers = Get-ChildItem -Path "app\api" -Recurse -Filter "route.ts"

$ancienImport = "import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';"
$nouvelImport = "import { PrismaLibSQL } from '@prisma/adapter-libsql';"

$ancienAdapter = "const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL });"
$nouvelAdapter = @"
const adapter = new PrismaLibSQL({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});
"@

$compteur = 0

foreach ($fichier in $fichiers) {
    $contenu = Get-Content -Path $fichier.FullName -Raw

    if ($contenu -match [regex]::Escape($ancienImport)) {
        $nouveauContenu = $contenu -replace [regex]::Escape($ancienImport), $nouvelImport
        $nouveauContenu = $nouveauContenu -replace [regex]::Escape($ancienAdapter), $nouvelAdapter

        Set-Content -Path $fichier.FullName -Value $nouveauContenu -NoNewline
        $compteur++
        Write-Host "Modifié : $($fichier.FullName)" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Terminé. $compteur fichier(s) modifié(s)." -ForegroundColor Cyan