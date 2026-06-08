Du hjelper med å planlegge og implementere en ny funksjon i Kledningsappen på tvers av alle tre plattformer.

$ARGUMENTS

## Steg 1: Forstå funksjonen

Forklar funksjonen kort:
- Hva gjør den?
- Hvilken brukerverdi gir den?
- Hvilke domenedata kreves (vær, aktivitet, klær)?

## Steg 2: Cross-platform sjekkliste

For **hver plattform**, beskriv hva som trengs:

### Web (`apps/web/`)
- Hvilke komponenter endres eller opprettes?
- API-integrasjon?
- Tester som skal oppdateres?

### iOS (`apps/ios/KledningsApp/`)
- Hvilke SwiftUI-views endres?
- Model-lag?

### Watch (`apps/ios/KledningsWatch/`)
- Kan funksjonen porteres til Watch?
- Hvis nei: hva er Watch-begrensningen? (dokumentér)
- Hvis ja: forenklet Watch-variant?

### Delt logikk (`packages/recommendation-engine/`)
- Er noe av logikken plattformuavhengig?
- Skal algoritmen utvides?

## Steg 3: Implementeringsplan

List konkrete oppgaver i rekkefølge:
1. Start med delt logikk / algoritme-endringer
2. Web-implementasjon
3. iOS-implementasjon
4. Watch-implementasjon (eller dokumenter unntak)
5. Oppdater tester
6. Én PR med alt

## Steg 4: Bekreftelse

Ikke start implementasjon før planen er klar og logisk konsistent på tvers av plattformer. Spør om nødvendig informasjon mangler.
