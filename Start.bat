@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo 🚗🚀 Démarrage du projet Gestion d'Entretien...


REM === BACKEND ===
echo.
echo 📂 Configuration du Backend...
cd BackEnd

REM Installer dépendances si manquantes
if not exist "node_modules" (
    echo 📦 Installation des dépendances Backend...
    npm install
)

REM Créer .env si inexistant
if not exist ".env" (
    echo ⚙️ Création du fichier .env pour le backend...
    copy env.example .env >nul
)

REM Lancer le serveur Backend
echo 🌐 Démarrage du serveur Backend...
start /b cmd /c "npm run dev > backend.log 2>&1"

cd ..

REM === FRONTEND ===
echo.
echo 📂 Configuration du Frontend...
cd frontend

REM Installer dépendances si manquantes
if not exist "node_modules" (
    echo 📦 Installation des dépendances Frontend...
    npm install
)

REM Lancer le serveur Frontend
echo ⚛️ Démarrage du serveur Frontend...
start /b cmd /c "npm start > frontend.log 2>&1"

cd ..

REM === Ouverture navigateurs ===
timeout /t 8 /nobreak >nul
start http://localhost:5000
start http://localhost:3000

echo.
echo ✅ Projet lancé avec succès !
echo 🌐 Backend : http://localhost:5000
echo ⚛️ Frontend : http://localhost:3000
echo 📝 Logs :
echo    Backend : BackEnd\backend.log
echo    Frontend : frontend\frontend.log
echo 🛑 Pour arrêter les serveurs : fermez cette fenêtre ou arrêtez manuellement avec CTRL+C dans les consoles.
echo.

pause
