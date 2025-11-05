#!/bin/bash

echo "🚀 ERP System KMU - Kompletter Start"
echo "===================================="
echo ""

# Farben für Output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Prüfe ob Backend läuft
echo -e "${YELLOW}📊 Prüfe Backend...${NC}"
if lsof -ti:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend läuft bereits${NC}"
else
    echo -e "${YELLOW}⚠️  Backend läuft nicht - starte es...${NC}"
    cd backend
    npm run dev > /dev/null 2>&1 &
    BACKEND_PID=$!
    echo $BACKEND_PID > ../.backend.pid
    cd ..
    sleep 5
    echo -e "${GREEN}✅ Backend gestartet (PID: $BACKEND_PID)${NC}"
fi

# Prüfe ob Frontend läuft
echo -e "${YELLOW}🌐 Prüfe Frontend...${NC}"
if lsof -ti:5173 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend läuft bereits${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend läuft nicht - starte es...${NC}"
    cd frontend
    npm run dev > /dev/null 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > ../.frontend.pid
    cd ..
    sleep 5
    echo -e "${GREEN}✅ Frontend gestartet (PID: $FRONTEND_PID)${NC}"
fi

# Prüfe Datenbank
echo -e "${YELLOW}🗄️  Prüfe Datenbank...${NC}"
if curl -s http://localhost:3000/health | grep -q "ok"; then
    echo -e "${GREEN}✅ Datenbank-Verbindung OK${NC}"
else
    echo -e "${RED}❌ Datenbank-Verbindung fehlgeschlagen${NC}"
    echo -e "${YELLOW}📝 Bitte starten Sie Docker:${NC}"
    echo "   docker-compose -f docker/docker-compose.yml up -d"
    echo ""
fi

# Erstelle Test-Benutzer
echo -e "${YELLOW}👤 Erstelle Test-Benutzer...${NC}"
RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "admin123",
    "first_name": "Admin",
    "last_name": "Test"
  }')

if echo "$RESPONSE" | grep -q "token"; then
    echo -e "${GREEN}✅ Test-Benutzer erstellt${NC}"
elif echo "$RESPONSE" | grep -q "already exists"; then
    echo -e "${YELLOW}⚠️  Benutzer existiert bereits${NC}"
else
    echo -e "${RED}❌ Fehler beim Erstellen des Benutzers${NC}"
    echo "$RESPONSE"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ System ist bereit!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "🌐 Frontend: http://localhost:5173"
echo "📊 Backend:  http://localhost:3000"
echo ""
echo "📋 Login-Daten:"
echo "   E-Mail: admin@test.com"
echo "   Passwort: admin123"
echo ""
echo "🎯 Öffnen Sie http://localhost:5173 in Ihrem Browser!"
echo ""





