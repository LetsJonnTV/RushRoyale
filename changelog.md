# Changelog

Alle wichtigen Änderungen an diesem Projekt werden in dieser Datei dokumentiert.

Das Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.0.0/),
und dieses Projekt folgt der [Semantischen Versionierung](https://semver.org/lang/de/).

## [Unreleased]

## [3.0.0] - 2025-10-05

### 🎮 Major Features Added
- **🗺️ Custom Maps & Map Editor**: Vollständiger Map-Editor mit Drag & Drop Funktionalität
  - Interaktiver Grid-basierter Editor mit Snap-to-Grid
  - Pfad-Erstellung mit visuellen Wegpunkten (Start/Ende/Zwischenpunkte)
  - Map-Validierung: Automatische Überprüfung auf gültige Start- und Endpunkte
  - Test-Modus: Maps direkt im Editor testen mit Live-Feedback
  - Map-Speicherung: Lokale Speicherung und Wiederverwendung von Custom Maps
  - Schwierigkeitsgrade: Einfach, Mittel, Schwer, Extrem für Custom Maps
  - Export/Import: Maps können gespeichert und geteilt werden

- **🤝 Multiplayer System**: Umfassendes Echtzeit-Multiplayer mit WebRTC P2P
  - **Koop-Modus**: Gemeinsam gegen Gegnerwellen kämpfen
    - Geteilte Ressourcen und synchronisierte Wellen
    - Team-Fähigkeiten: Freeze All, Damage Boost, Gold Rush
    - Echtzeit-Synchronisation von Türmen, Gegnern und Projektilen
  - **PvP-Modus**: Direkter Kampf zwischen Spielern
    - Gegner an den anderen Spieler senden
    - Separate Ressourcen und konkurrierende Strategien
    - Live-Status des Gegners einsehen
  - **Cross-Device Unterstützung**: Firebase Realtime Database für Signaling
  - **Raum-System**: Einfaches Erstellen und Beitreten mit 9-stelligen Codes
  - **Lobby-System**: Warteraum mit Spielerstatus und Ready-Check
  - **WebRTC Datachannel**: Latenzarme P2P-Kommunikation für Spieldaten

- **🛒 Trading System & Marktplatz**: Vollständiger Item-Shop mit funktionalen Effekten
  - **Marktplatz**: 
    - Daily Deals mit 25% Rabatt und limitierter Verfügbarkeit
    - Featured Items mit Premium-Items im Rotationsverfahren
    - Regular Items mit Basis-Sortiment
    - Dynamische Preisgestaltung und Seltenheitssystem
  - **Währungssystem**: 
    - Trading Coins als Premium-Währung
    - Gold zu Coins Tausch (100:1 Ratio)
    - Separate Währungsanzeige und Verwaltung
  - **Item-Kategorien**:
    - **Tower Skins**: Visuelle und Stat-Verbesserungen für Türme
    - **Hintergründe**: Atmosphärische Themes mit visuellen Filtern
    - **Projektil-Effekte**: Spektakuläre Angriffs-Visualisierungen
    - **Power-Ups**: Temporäre Gameplay-Verstärkungen
  - **Inventar-System**: 
    - Kategorisierte Übersicht aller besessenen Items
    - Sofortiges Ausrüsten/Entfernen von Items
    - Equipment-Status-Anzeige
  - **Funktionale Item-Effekte**: 
    - Alle Items haben echte Auswirkungen auf Gameplay und Visuals
    - Stat-Boni werden sofort angewendet
    - Visuelle Effekte ändern Spielatmosphäre in Echtzeit

### 🎨 Visual & Audio Enhancements
- **Hintergrund-Rendering-System**: 4 verschiedene Themes mit Canvas-Filtern
  - Space Battle: Weltraum-Atmosphäre mit bläulichen Filtern
  - Medieval Castle: Mittelalterliches Ambiente mit Sepia-Tönen
  - Neon City: Cyberpunk-Style mit Neon-Effekten
  - Tropical Island: Paradiesische Atmosphäre mit warmen Filtern
- **Tower-Skin-Effekte**: Erweiterte Tower-Visualisierungen
  - Golden Basic: Goldener Glanz mit Partikel-Effekten
  - Ice Crystal: Eis-Kristall-Design mit Frost-Partikeln
  - Fire Demon: Feuer-Aura mit glühenden Effekten
  - Cyber Sniper: Futuristische Laser-Optik
- **Projektil-Effekte-System**: Spektakuläre Angriffs-Visualisierungen
  - Rainbow Trail: Regenbogen-Spuren hinter Projektilen
  - Star Burst: Stern-förmige Explosionen beim Aufprall
  - Lightning Chain: Blitz-Ketten zwischen mehreren Zielen
- **Gold-Animations-System**: Visuelle Belohnungs-Effekte
  - Fliegende Gold-Texte bei Belohnungen
  - Smooth CSS-Animationen mit Skalierung und Transparenz
  - Dynamische Positionierung basierend auf Kontext

### 🔧 System Improvements
- **Equipment-System**: Sofortige Anwendung von Item-Effekten
  - Real-time Stat-Updates für ausgerüstete Items
  - Visual Feedback beim Ausrüsten/Entfernen
  - Persistente Equipment-Speicherung
- **Tutorial-System**: Interaktive Hilfe für neue Features
  - Trading-Tutorial beim ersten Öffnen des Marktplatzes
  - Equipment-Tutorial beim ersten Ausrüsten von Items
  - Kontextuelle Hilfe mit visuellen Beispielen
- **Enhanced UI Components**: 
  - Premium-Glow-Effekte für besondere Items
  - Equipment-Indikatoren für ausgerüstete Items
  - Responsive Design für verschiedene Bildschirmgrößen
- **Performance Optimizations**: 
  - Optimiertes Rendering für Multiplayer-Umgebungen
  - Effiziente WebRTC-Datenübertragung
  - Reduzierte Canvas-Operationen für bessere Performance

### 🚀 Technical Infrastructure
- **WebRTC P2P Networking**: Latenzarme Peer-to-Peer Verbindungen
- **Firebase Integration**: Cross-Device Signaling und Raum-Management
- **Advanced Canvas Rendering**: Multi-Layer-Rendering für Hintergründe und Effekte
- **LocalStorage Enhancement**: Erweiterte Datenpersistierung für alle neuen Features
- **Modular Architecture**: Saubere Trennung von Multiplayer-, Trading- und Map-Editor-Komponenten

### 🎯 User Experience
- **Seamless Integration**: Alle neuen Features nahtlos in bestehende UI integriert
- **Progressive Enhancement**: Features bauen aufeinander auf ohne Core-Gameplay zu beeinträchtigen
- **Cross-Platform Compatibility**: Funktioniert auf Desktop und mobilen Geräten
- **Intuitive Controls**: Drag & Drop, Click-to-Equip, One-Click-Join Funktionalitäten

### 🔐 Data & Privacy
- **Local-First Approach**: Alle Daten primär lokal gespeichert
- **Optional Cloud Features**: Firebase nur für Multiplayer-Signaling verwendet
- **No Personal Data**: Keine Sammlung persönlicher Informationen
- **Secure P2P**: WebRTC-verschlüsselte Direktverbindungen

## [2.0.0] - 2025-10-05

### Added
- **Skill Tree System**: Umfassendes Skill-System mit 13 verschiedenen Fähigkeiten
  - Schadens-Skills: Präzisionsschütze, Kritischer Treffer, Elementarschaden, Explosionsexperte, Zielerfassung
  - Wirtschafts-Skills: Goldgräber, Effizienter Bau, Ressourcenmanager, Investition
  - Support-Skills: Reparatur, Verstärkung, Schnellbau, Überlastung
- **Tower Fusion System**: 9 verschiedene Fusion-Rezepte für erweiterte Türme
  - Plasma Kanone (Kanone + Laser)
  - Railgun (Kanone + Rakete)
  - Smart Missile (Laser + Rakete)
  - Und 6 weitere einzigartige Kombinationen
- **Erweiterte Gegner-Typen**: 4 neue Gegnerarten mit besonderen Eigenschaften
  - Tank-Gegner mit erhöhter Gesundheit
  - Schnelle Gegner mit doppelter Geschwindigkeit
  - Fliegende Gegner (nur von bestimmten Türmen angreifbar)
  - Boss-Gegner mit speziellen Fähigkeiten
- **Skill Tree Zugang im Hauptmenü**: Direkte Verwaltung der Skills ohne Spielstart
- **Changelog System**: "Was ist neu?" Button mit automatischem Markdown-Parsing
- **Persistente Skill-Punkte**: Skill-Fortschritt wird zwischen Spielsitzungen gespeichert
- **Skill-Punkte Badge**: Visueller Indikator für verfügbare Skill-Punkte im Hauptmenü

### Changed
- **Erweiterte Tower-Informationen**: Tooltips zeigen jetzt Skill-Boni und Effekte an
- **Dynamische Kostenberechnung**: Alle Kosten werden basierend auf aktiven Skills berechnet
- **Verbesserte Benutzeroberfläche**: Überarbeitetes Design für alle Menüs und Modals
- **Partikeleffekt-System**: Erweiterte visuelle Effekte für spezielle Fähigkeiten

### Fixed
- **Performance-Optimierungen**: Verbesserte Rendering-Zyklen und reduzierte CPU-Last
- **Speicher-Effizienz**: Optimierte Speicherverwaltung für Spielfortschritt
- **UI-Responsivität**: Verbesserte Darstellung auf verschiedenen Bildschirmgrößen

## [1.0.0] - 2025-09-01

### Added
- **Grundlegendes Tower Defense Gameplay**: Kern-Spielmechaniken implementiert
- **Basis-Türme**: Kanone, Laser und Raketen-Türme verfügbar
- **Wellen-System**: Fortschreitende Schwierigkeit mit verschiedenen Gegnerwellen
- **Wirtschafts-System**: Gold verdienen und ausgeben für Türme und Upgrades
- **Grundlegende UI**: Hauptmenü, Spielbildschirm und grundlegende Einstellungen
- **Pfad-System**: Vordefinierte Routen für Gegner
- **Basis-Statistiken**: Grundlegende Spielstatistiken und Tracking

### Changed
- Initiale Veröffentlichung
