# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Project Is

A domain-knowledge repository for a clothing recommendation app ("Kle deg etter været" — dress for the weather). The app recommends what to wear based on weather conditions, activity type, and duration. The language throughout is Norwegian.

There is no runnable application yet — the repo contains structured domain knowledge and a reference TypeScript implementation of the recommendation algorithm.

## Custom Commands

Three project-level slash commands are defined in `.claude/commands/`:

| Command | Purpose |
|---|---|
| `/domene-vær [spørsmål]` | Query `domain/weather.md` — API endpoints, parameters, thermal formulas |
| `/domene-klær [spørsmål]` | Query `domain/clothing.md` — 3-layer system, CLO values, materials |
| `/kle-deg [input]` | Full clothing recommendation — runs the complete algorithm against all domain files |

The `/kle-deg` command expects weather data (temp, wind, humidity, precipitation) and activity (type, duration). It will ask for missing values.

## Domain Architecture

All domain knowledge lives in `domain/`. The files form a pipeline:

```
domain/weather.md          → raw weather data + thermal comfort formulas
domain/activities.md       → MET values + activity-specific rules
domain/clothing.md         → CLO values + 3-layer system + materials
domain/recommendation-engine.md  → algorithm + TypeScript reference code
```

### Core Algorithm (recommendation-engine.md)

Four sequential steps produce a garment recommendation:

1. **Apparent temperature** — wind chill (JAG/TI, valid T < 10°C, wind > 4.8 km/h) or Steadman formula (humidity-based)
2. **Activity offset** — `(MET − 1.0) × 0.8` (e.g. running: +5.6°C, hiking: +3.6°C)
3. **Effective comfort temperature** — apparent temp + activity offset − duration factor − precipitation penalty + user sensitivity
4. **Target CLO** — lookup against `CLO_THRESHOLDS` → garment recommendations per body zone

### Weather Data Source

`api.met.no` — no API key required, but `User-Agent` header is mandatory per TOS. Primary endpoint: `locationforecast/2.0/compact`. For Norwegian users, `nowcast/2.0` provides 5-minute precipitation updates.

Key fields from the API: `air_temperature`, `wind_speed`, `relative_humidity`, `precipitation_amount`, `probability_of_precipitation`.

### Key Domain Rules

- **Cotton kills**: Never recommend cotton below 15°C effective temp — loses 90% insulation when wet
- **Running**: dress as if 10°C warmer; always moisture-wicking materials
- **Cycling**: wind exposure 2–3× normal; always windproof below 15°C
- **Hiking**: always pack extra layer + rain gear; Norwegian rule, no exceptions
- **Cross-country skiing**: dress as if 15°C warmer — highest heat output of common activities

### CLO System

`1 CLO = 0.155 m²·K/W`. Effective temp maps to a target CLO (e.g. 0°C → 1.00 CLO, −10°C → 1.45 CLO), which drives per-zone garment selection. CLO values for all garments are in `domain/clothing.md`.
