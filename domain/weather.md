# Weather Domain

## Data Source: api.met.no (MET Norway)

### Primære endepunkter

**Locationforecast/2.0** — Primærvalg
- Base URL: `https://api.met.no/weatherapi/locationforecast/2.0/`
- Format: `compact` (GeoJSON, anbefalt), `complete`, `classic` (XML)
- Eksempel: `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=59.9139&lon=10.7522&altitude=5`
- Dekning: Global (0–10 dager), Norden har høyest prioritet og granularitet
- Oppdateringsfrekvens: Norden hourly (0–60t), 6-timers steg (2–10 dager)

**Nowcast/2.0** — Korttidspresisjon for Norden
- Base URL: `https://api.met.no/weatherapi/nowcast/2.0/`
- Dekning: Norge, Sverige, Finland, Danmark
- Oppdateringsfrekvens: Hvert 5. minutt
- Datakilder: MEPS-modell, radarekstrapolasjon (2t nedbørsvarsel), Netatmo/profesjonelle stasjoner

---

## Viktige værparametere

### Instant-verdier (punkt-i-tid)

| Parameter | Enhet | Beskrivelse | Prioritet |
|---|---|---|---|
| `air_temperature` | °C | Lufttemperatur ved 2m høyde | Kritisk |
| `wind_speed` | m/s | Vindhastighet 10m (10-min snitt) | Kritisk |
| `relative_humidity` | % | Fuktighet ved 2m | Høy |
| `wind_speed_of_gust` | m/s | Maks vindkast (3-sek snitt) | Høy |
| `wind_from_direction` | grader | Vindretning (0°=N, 90°=Ø) | Medium |
| `cloud_area_fraction` | % | Total skydekke | Medium |
| `ultraviolet_index_clear_sky` | 0–11+ | UV-indeks (klart vær) | Medium |
| `fog_area_fraction` | % | Tåkedekke (<1000m sikt) | Lav |
| `dew_point_temperature` | °C | Duggpunkt ved 2m | Lav |

### Periodeaggregater (next_1_hours, next_6_hours)

| Parameter | Enhet | Bruk |
|---|---|---|
| `precipitation_amount` | mm | Nedbørmengde |
| `probability_of_precipitation` | % | Nedbørssannsynlighet |
| `air_temperature_max/min` | °C | Topp/bunn planlegging |
| `symbol_code` | streng | Værtilstand-kategori |

### JSON-struktur (utsnitt)

```json
{
  "properties": {
    "timeseries": [{
      "time": "2026-06-08T08:00:00Z",
      "data": {
        "instant": {
          "details": {
            "air_temperature": 5.0,
            "wind_speed": 8.0,
            "relative_humidity": 72.0,
            "wind_speed_of_gust": 12.0,
            "cloud_area_fraction": 97.0
          }
        },
        "next_1_hours": {
          "summary": { "symbol_code": "rain" },
          "details": { "precipitation_amount": 1.2 }
        }
      }
    }]
  }
}
```

---

## API-brukskrav

- **Ingen API-nøkkel**: Gratis, åpen tjeneste
- **User-Agent**: PÅKREVD i TOS — `"MinApp/1.0 (kontakt@eksempel.no)"`
- **Caching**: Bruk `Expires`-headeren, `If-Modified-Since` for betingede forespørsler
- **Koordinatpresisjon**: Maks 4 desimaler (f.eks. `59.9139, 10.7522`) for cache-effektivitet
- **Polling-intervall**: Minimum 15–30 minutter

---

## Termiske komfortberegninger

### Vindavkjøling (Wind Chill) — JAG/TI standard

Brukes for T < 10°C og vind > 4.8 km/h:

```
T_wc = 13.12 + 0.6215·T_a − 11.37·v^0.16 + 0.3965·T_a·v^0.16
```

- `T_a` = lufttemperatur (°C)
- `v` = vindhastighet (km/h) — konverter fra m/s: `v_kmh = v_ms × 3.6`

**Eksempler:**
- 0°C + 10 m/s (36 km/h) → vindavkjøling ≈ −12°C
- −10°C + 10 m/s → vindavkjøling ≈ −27°C
- −20°C + 10 m/s → vindavkjøling ≈ −41°C

### Apparent Temperature (Steadman) — for fuktighetseffekter

```
AT = T_a + 0.33·e − 0.70·v − 4.00
```

- `e` = damptrykk (hPa): `e = (RH/100) × 6.1078 × exp((17.27·T_a)/(237.3+T_a))`
- `v` = vindhastighet (m/s)

### Fuktighets­effekt på komfort

- 40–60% RH: Optimalt komfortområde
- > 60% RH: Kulden oppleves mer gjennomtrengende
- > 80% RH: Signifikant økt kuldepersepsjon

---

## Norsk klimakontekst

### Sesongtemperaturer

| Region | Vinter gj.snitt | Sommer gj.snitt | Særtrekk |
|---|---|---|---|
| Kyst/Vest | −2 til +4°C | +12 til +18°C | Mye regn, Golfstrøm-moderert |
| Innland/Øst | −8 til −15°C | +10 til +18°C | Kontinentalt, større variasjon |
| Fjell/Nord | −10 til −20°C | +5 til +15°C | Ekstremkulde, mye snø |

**Rekorder:** Varmest +35.6°C (Nesbyen), Kaldest −51.4°C (Karasjok)

### Sesong­mønstre

- **Vinter (des–feb):** Kyst: mild med mye nedbør. Innland: streng kulde og snø
- **Vår (mar–mai):** Størst T-variasjon, driest periode, lenger dagslys
- **Sommer (jun–aug):** Varmest 15–20 jul innland, tidlig aug kyst. Midnattssol nord for 66°N
- **Høst (sep–nov):** Nedbørsøkning (topper okt–nov), rask temperaturfall

---

## Kledningsrelevante grenseverdier

| Lufttemperatur | Vindavkjøling | Tilstand | Nøkkelbehov |
|---|---|---|---|
| +15°C+ | N/A | Mild | Lett lag, valgfri jakke |
| +5 til +15°C | −10 til +5°C | Kjølig | Varm mellomlag, regnfast ytterlag |
| 0 til +5°C | −15 til −10°C | Kaldt | Isolert jakke, lue, hansker |
| −5 til 0°C | −25 til −15°C | Meget kaldt | Tunge isolasjonslag |
| −10°C | −35 til −25°C | Ekstremt | Full vinterutrustning, ansiktsvern |
| < −20°C | < −40°C | Farlig | Maks isolasjon, begrens eksponering |

---

## Implementasjonsanbefalinger

### API-strategi
- **Primær**: Locationforecast/2.0 compact (global, tilstrekkelig detalj)
- **Sekundær**: Nowcast/2.0 for norske brukere (5-minutters presisjon på nedbør)

### Kalkulasjonsprioritet
1. Vindavkjøling = f(air_temperature, wind_speed)
2. Komfortindeks = f(vindavkjøling, relative_humidity)
3. Nedbørrisiko = f(probability_of_precipitation, precipitation_amount)
4. Laganbefalinger = f(komfortindeks, nedbørrisiko, aktivitet, varighet)
