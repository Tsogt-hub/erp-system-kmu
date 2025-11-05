#!/bin/bash

echo "🗄️  Datenbank-Initialisierung..."

# Prüfe ob PostgreSQL läuft
if ! pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo "❌ PostgreSQL läuft nicht auf Port 5432"
    echo "📝 Bitte starten Sie Docker:"
    echo "   docker-compose -f docker/docker-compose.yml up -d"
    echo ""
    echo "Oder installieren Sie PostgreSQL lokal und starten Sie es."
    exit 1
fi

# Erstelle Datenbank falls nicht vorhanden
echo "📦 Erstelle Datenbank..."
createdb -h localhost -p 5432 -U postgres erp_system_kmu 2>/dev/null || echo "Datenbank existiert bereits oder Fehler"

# Führe Schema aus
echo "📋 Führe Datenbank-Schema aus..."
psql -h localhost -p 5432 -U postgres -d erp_system_kmu -f database/schema.sql

echo "✅ Datenbank initialisiert!"







