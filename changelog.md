# Changelog

Alle wichtigen Änderungen an diesem Projekt werden in dieser Datei dokumentiert.

Das Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.0.0/),
und dieses Projekt folgt der [Semantischen Versionierung](https://semver.org/lang/de/).

## [Unreleased]

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
