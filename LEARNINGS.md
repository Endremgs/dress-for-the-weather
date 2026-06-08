# LEARNINGS.md

Oppdagelser, gotchas og ting som har overrasket oss under utvikling. Oppdateres løpende — nye funn øverst.

---

## 2026-06

### SDD-infrastruktur etablert
- Opprettet `.claude/skills/cross-platform-rule.yaml` — prosjektets viktigste regel er nå encodet som en skill
- La til `/ny-funksjon` og `/domene-aktiviteter` kommandoer
- CLAUDE.md restructurert til navigasjonshub per SDD-retningslinjer
- Leksjon: CLAUDE.md bør peke til, ikke duplisere, domeneinnholdet

### met.no User-Agent er ikke valgfri
API-kall til `api.met.no` uten `User-Agent`-header blokkeres stille. Ikke et tydelig feilsvar — bare ingen data. Alltid sett header med kontaktinfo.

### Watch har reelle begrensninger
WatchOS tillater ikke bakgrunns-API-kall på samme måte som iOS. Appen er avhengig av WatchConnectivity fra iPhone for data. Dette er ikke en teknisk bug — det er en Watch-arkitekturbeslutning.

### TypeScript-algoritmen er kilden til sannhet
`packages/recommendation-engine/` er TypeScript-implementasjon. iOS-appen porterer logikken til Swift. Når algoritmen endres, oppdater TypeScript FØRST, deretter Swift — aldri omvendt.

---

*Format: dato → hva vi lærte → hva vi ville gjort annerledes*
