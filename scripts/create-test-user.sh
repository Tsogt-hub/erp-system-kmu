#!/bin/bash

echo "👤 Erstelle Test-Benutzer..."

# Prüfe ob Backend läuft
if ! curl -s http://localhost:3000/health > /dev/null; then
    echo "❌ Backend läuft nicht auf Port 3000"
    echo "📝 Bitte starten Sie das Backend:"
    echo "   cd backend && npm run dev"
    exit 1
fi

# Erstelle Test-Benutzer
echo "📝 Erstelle Benutzer: admin@test.com / admin123"
RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "admin123",
    "first_name": "Admin",
    "last_name": "Test"
  }')

if echo "$RESPONSE" | grep -q "token"; then
    echo "✅ Test-Benutzer erfolgreich erstellt!"
    echo ""
    echo "📋 Login-Daten:"
    echo "   E-Mail: admin@test.com"
    echo "   Passwort: admin123"
else
    echo "⚠️  Benutzer existiert möglicherweise bereits oder Fehler:"
    echo "$RESPONSE"
fi







