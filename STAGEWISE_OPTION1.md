# 🎯 Stagewise Extension - Anleitung

## Option 1 wird jetzt ausgeführt!

### ✅ Schritt 1: Datei in VS Code öffnen
**Datei**: `frontend/src/pages/Dashboard.tsx`

Die Datei wurde automatisch geöffnet (oder öffnen Sie sie manuell).

---

### ✅ Schritt 2: Stagewise Browser starten

**In VS Code:**
1. Drücken Sie: `Cmd + Shift + P` (Mac) oder `Ctrl + Shift + P` (Windows)
2. Tippen Sie: `Stagewise: Open Browser`
3. Enter drücken

**Alternative:**
- Klicken Sie auf das **Stagewise-Icon** in der VS Code Sidebar (lila Kreis)

---

### ✅ Schritt 3: Im Browser arbeiten

Wenn Stagewise den Browser öffnet:
- Sie sehen das verbesserte Dashboard
- Alle Charts sind sichtbar
- Gradient-Karten mit Hover-Effekten
- Filter oben rechts

**Klicken Sie auf Elemente:**
- Klicken Sie auf eine KPI-Karte → Stagewise zeigt den Code
- Klicken Sie auf ein Chart → Stagewise zeigt den Chart-Code
- Klicken Sie auf einen Filter → Stagewise zeigt den Filter-Code

---

### ✅ Schritt 4: Änderungen beschreiben

**Stagewise zeigt automatisch den relevanten Code-Bereich.**

Dann können Sie sagen:
- "Ändere die Farbe dieser Karte zu grün"
- "Füge eine Animation hinzu"
- "Mache dieses Chart größer"

---

## 🎨 Was Sie im Dashboard sehen:

### KPI-Karten (mit Gradient):
1. **Projekte** - Lila-Gradient (667eea → 764ba2)
2. **Zeiterfassung** - Pink-Gradient (f093fb → f5576c)
3. **Tickets** - Orange-Gradient (fa709a → fee140)
4. **Kunden** - Blau-Gradient (4facfe → 00f2fe)

### Charts:
1. **Liniendiagramm** - Projekt-Entwicklung (oben links)
2. **Tortendiagramm** - Ticket-Status (oben rechts)
3. **Balkendiagramm** - Arbeitsstunden (unten links)

### Filter:
- **Zeitraum** - Dropdown oben rechts
- **Projekte** - Dropdown neben Zeitraum

---

## 💡 Beispiele für Stagewise-Interaktion:

### Beispiel 1: Karte ändern
1. Klicken Sie auf die "Projekte"-Karte (lila)
2. Stagewise springt zu Zeile 51-67 (Card-Component)
3. Sagen Sie: "Ändere den Gradient zu grün"

### Beispiel 2: Chart anpassen
1. Klicken Sie auf das Liniendiagramm
2. Stagewise springt zu Zeile 234-245 (LineChart)
3. Sagen Sie: "Ändere die Farbe der Linie zu rot"

### Beispiel 3: Filter erweitern
1. Klicken Sie auf den Filter-Dropdown
2. Stagewise springt zu Zeile 113-130 (Filter)
3. Sagen Sie: "Füge einen Status-Filter hinzu"

---

## 🚀 System-Status:

- ✅ **Dashboard.tsx** - Geöffnet in VS Code
- ✅ **Browser** - Läuft auf http://localhost:5173
- ✅ **Charts** - Installiert (recharts)
- ✅ **Verbesserungen** - Live

---

## ⚡ Schnellstart:

```
1. Cmd + Shift + P
2. "Stagewise: Open Browser"
3. Klicken + Beschreiben!
```

**Viel Erfolg mit Stagewise! 🎯**

