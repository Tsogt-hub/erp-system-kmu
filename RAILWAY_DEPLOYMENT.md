# Railway Deployment Guide

## Übersicht

Das ERP-System besteht aus zwei Services:
1. **Backend** - Node.js/Express API
2. **Frontend** - React/Vite Static Site

## Schritt 1: Projekt auf GitHub pushen

```bash
cd "/Users/tsogtnandin-erdene/ERP System KMU"
git add .
git commit -m "Prepare for Railway deployment"
git push origin main
```

## Schritt 2: Railway Services erstellen

### 2.1 Backend Service

1. Gehe zu [Railway Dashboard](https://railway.app/dashboard)
2. Klicke auf **"New Project"** → **"Deploy from GitHub repo"**
3. Wähle dein Repository aus
4. Wähle **"Add a Service"** → **"GitHub Repo"**
5. Konfiguriere:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start:prod`

### 2.2 PostgreSQL Datenbank

1. Im gleichen Projekt: **"Add a Service"** → **"Database"** → **"PostgreSQL"**
2. Railway erstellt automatisch die `DATABASE_URL` Variable

### 2.3 Backend Umgebungsvariablen

Gehe zu Backend Service → **Variables** und füge hinzu:

```
NODE_ENV=production
PORT=3001
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

### 2.4 Frontend Service

1. **"Add a Service"** → **"GitHub Repo"**
2. Wähle das gleiche Repository
3. Konfiguriere:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run serve`

### 2.5 Frontend Umgebungsvariablen

```
VITE_API_URL=https://[backend-domain].railway.app/api
```

**Hinweis**: Ersetze `[backend-domain]` mit der tatsächlichen Domain deines Backend-Services.

## Schritt 3: Domains einrichten

1. Backend Service → **Settings** → **Networking** → **Generate Domain**
2. Frontend Service → **Settings** → **Networking** → **Generate Domain**

## Schritt 4: Backend CORS aktualisieren (optional)

Falls nötig, füge die Frontend-Domain zur CORS-Konfiguration hinzu:

```
FRONTEND_URL=https://[frontend-domain].railway.app
```

## Fehlerbehebung

### Build schlägt fehl
- Prüfe die Build-Logs in Railway
- Stelle sicher, dass alle Dependencies in `package.json` sind

### Database Connection Error
- Prüfe ob `DATABASE_URL` korrekt gesetzt ist
- Das System fällt automatisch auf SQLite zurück, wenn PostgreSQL nicht verfügbar ist

### CORS Fehler
- Stelle sicher, dass `FRONTEND_URL` korrekt gesetzt ist
- Die App erlaubt automatisch alle `.railway.app` Domains

## Nützliche Railway CLI Befehle

```bash
# Railway CLI installieren
npm install -g @railway/cli

# Einloggen
railway login

# Projekt verbinden
railway link

# Logs anzeigen
railway logs

# Variablen anzeigen
railway variables
```

## Kosten

- **Hobby Plan**: $5/Monat (inkl. $5 Guthaben)
- **PostgreSQL**: ~$0.000231/GB-hour
- **Compute**: ~$0.000231/vCPU-hour

Für ein kleines ERP-System: ca. $5-10/Monat
