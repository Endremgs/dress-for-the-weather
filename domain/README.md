# Domain Knowledge — Kle deg etter været

Strukturert domenekunnskap for en app som anbefaler klær basert på vær, aktivitet og varighet.

## Filer

| Fil | Innhold |
|---|---|
| [weather.md](./weather.md) | yr.no API, værparametere, vindavkjølingsformler, norsk klima |
| [clothing.md](./clothing.md) | 3-lags-systemet, materialer, CLO-verdier, merker |
| [activities.md](./activities.md) | MET-verdier, aktivitetsspesifikke krav, varighet, farlige kombinasjoner |
| [recommendation-engine.md](./recommendation-engine.md) | Algoritme, TypeScript-kode, eksempler, sikkerhetsvarsler |

## Kjerne­konsepter

### Effektiv komforttemperatur
Utgangspunktet for alle anbefalinger:

```
Effektiv temp = Apparent temp + Aktivitets-offset − Varighets-justerting − Nedbørs-justering + Bruker-sensitivitet
```

Hvor:
- **Apparent temp** = lufttemp korrigert for vind (wind chill) og fuktighet
- **Aktivitets-offset** = varmeproduksjon fra aktivitet (+3°C rusling → +10°C løping)
- **Varighets-justering** = lengre ute = trenger mer isolasjon
- **Nedbørs-justering** = fuktig = kaldere følt

### CLO-system
Måleenhet for klednings-isolasjon. `1 CLO = 0.155 m²·K/W`.
Effektiv temp → target CLO → plagganbefalinger per kropp­sone.

### Aktivitets-viktigste tommelfingerregler
- Løping: kle deg som om det er **10°C varmere**
- Langrenn: kle deg som om det er **15°C varmere**
- Sykling: ekstra vindeksponering → vindtett alltid under 15°C
- Fjelltur: **alltid** ekstra lag i sekken + regntøy i Norge

## Datakilder

- **Vær**: [api.met.no](https://api.met.no) — gratis, ingen API-nøkkel, krever User-Agent header
- **Termisk komfort**: JAG/TI wind chill standard (2001), Steadman apparent temperature
- **MET-verdier**: Compendium of Physical Activities (Ainsworth et al.)
- **CLO-verdier**: ISO 7730, ASHRAE 55
