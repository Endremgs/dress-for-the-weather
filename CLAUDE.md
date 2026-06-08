# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Hva dette prosjektet er

En kledningsanbefalingsapp ("Kle deg etter været") for tre plattformer. Appen anbefaler klær basert på vær, aktivitet og varighet. All tekst er på norsk.

## Cross-Platform Regel

**KRITISK:** Appen finnes på **tre plattformer** — alle endringer skal implementeres på alle tre:

| Plattform | Teknologi | Sti |
|-----------|-----------|-----|
| Web | Next.js / TypeScript | `apps/web` |
| iOS | Swift / SwiftUI | `apps/ios/KledningsApp` |
| Watch | SwiftUI | `apps/ios/KledningsWatch` |

Unntak (Watch-begrensning o.l.) skal forklares eksplisitt. Se `/ny-funksjon` for arbeidsflyt.

## Quick Start

```bash
pnpm dev                  # Start Next.js web-app
pnpm test                 # Kjør alle tester (recommendation-engine + web)
pnpm build                # Bygg alt
pnpm test:e2e             # Playwright-tester
```

For iOS/Watch: Åpne `apps/ios/KledningsApp.xcodeproj` i Xcode, velg simulator og kjør.

## Kommandoer & Skills

| Kommando | Formål |
|----------|--------|
| `/domene-vær` | Slå opp i `domain/weather.md` — API, parametere, termiske formler |
| `/domene-klær` | Slå opp i `domain/clothing.md` — 3-lags-system, CLO-verdier |
| `/domene-aktiviteter` | Slå opp i `domain/activities.md` — MET-verdier, aktivitetsregler |
| `/kle-deg [input]` | Full kledningsanbefaling — kjører komplett algoritme |
| `/ny-funksjon` | Sjekkliste for ny funksjonalitet på alle tre plattformer |

Skills ligger i `.claude/skills/` (YAML) og `.claude/commands/` (slash-kommandoer).

## Domene-arkitektur

Fire filer danner en pipeline — les dem i denne rekkefølgen:

```
domain/weather.md              → API-data + termiske formler
domain/activities.md           → MET-verdier + aktivitetsregler
domain/clothing.md             → CLO-verdier + 3-lags-system
domain/recommendation-engine.md → algoritme + TypeScript-referansekode
```

## Prosjektstruktur

```
apps/
  web/                    # Next.js-app
  ios/KledningsApp/       # iOS-app
  ios/KledningsWatch/     # Watch-app
packages/
  recommendation-engine/  # Delt TypeScript-algoritme
domain/                   # Domenekunnskap (kilde til sannhet)
.claude/
  commands/               # Slash-kommandoer
  skills/                 # SDD-skills
```

## Kritiske regler

- **Cotton kills**: Anbefal aldri bomull under 15°C effektiv temp — mister 90% isolasjon når våt
- **met.no User-Agent**: Obligatorisk header per TOS — appen stoppes uten den
- **Tre plattformer**: Ny funksjonalitet implementeres alltid på alle tre i samme PR
- **Hiking**: Alltid ekstra lag + regnplagg — norsk regel, ingen unntak
