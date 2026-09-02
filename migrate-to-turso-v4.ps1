$fichiers = Get-ChildItem -Path "app\api" -Recurse -Filter "route.ts"
$compteur = 0

foreach ($fichier in $fichiers) {
    $contenu = [System.IO.File]::ReadAllText($fichier.FullName)

    if ($contenu -match "PrismaBetterSqlite3") {
        $nouveauContenu = $contenu -replace "import\s*\{\s*PrismaBetterSqlite3\s*\}\s*from\s*'@prisma/adapter-better-sqlite3';", "import { PrismaLibSQL } from '@prisma/adapter-libsql';"
        $nouveauContenu = $nouveauContenu -replace "const\s+adapter\s*=\s*new\s+PrismaBetterSqlite3\(\{\s*url:\s*process\.env\.DATABASE_URL\s*\}\);", "const adapter = new PrismaLibSQL({`n  url: process.env.DATABASE_URL!,`n  authToken: process.env.DATABASE_AUTH_TOKEN,`n});"

        [System.IO.File]::WriteAllText($fichier.FullName, $nouveauContenu)
        $compteur++
        Write-Host "Modifie : $($fichier.FullName)" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Termine. $compteur fichier(s) modifie(s)." -ForegroundColor Cyan
