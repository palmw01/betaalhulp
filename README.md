# BetaalHulp Belastingaanslag

Een **Legal-as-Code** implementatie van de **Invorderingswet 1990 (IW 1990)** en de **Leidraad Invordering 2008 (LI 2008)**, gericht op het berekenen van betalingstermijnen voor belastingaanslagen.

Het project combineert een gestructureerde juridische kennisbank met een functionele webapplicatie die deze logica transparant en controleerbaar uitvoert.

---

## Projectstructuur

```
betaalhulp/
├── wetteksten/         Authentieke bronteksten (IW 1990, LI 2008)
├── annotaties/         Juridische analyses: wettekst → logische regels
├── begrippen/          Definities van juridische concepten
├── regels/             Afgeleide beslissings- en rekenregels (AR-*)
└── betaalhulp-app/     React/TypeScript webapplicatie
    └── src/
        ├── logic/
        │   ├── taxEngine.ts     Kernlogica (Art. 9 IW 1990 + § 9.1 LI 2008)
        │   ├── legalTexts.ts    Wetteksten voor weergave in de UI
        │   └── types.ts         TypeScript-types
        └── components/
            ├── Form/            Invoerformulier
            └── Schedule/        Resultaatweergave met audit trail
```

### Juridische kennisbank

- **`wetteksten/`** — De authentieke bronteksten van de wetten en leidraden.
- **`annotaties/`** — Juridische analyses die de brug slaan tussen wettekst en logische regels.
- **`begrippen/`** — Definities van alle juridische concepten die in de regels worden gebruikt.
- **`regels/`** — De afgeleide beslissings- en rekenregels, bijv. `AR-9-1` (Art. 9 lid 1 IW 1990) en `AR-LI-9-1a` (LI 2008 § 9.1 begunstigende regel).

---

## Berekende regels

De applicatie implementeert de volgende regels uit Artikel 9 IW 1990 en § 9.1 LI 2008:

| Regel | Omschrijving |
|---|---|
| **AR-9-1** | Normale aanslag: invorderbaar zes weken na dagtekening |
| **AR-9-5a..f** | Voorlopige aanslag: gelijke termijnen over resterende maanden |
| **AR-LI-9-1a** | Begunstigende regel: laatste termijn verschoven naar 31 december |
| **AR-LI-9-1b** | Afwijkend boekjaar: laatste termijn op laatste dag van de maand |

**Terugvalregel** (Art. 9 lid 5, derde volzin): als de termijnberekening niet meer dan één termijn oplevert (dagtekening in november of december), wordt de hoofdregel (zes weken) toegepast. Ook in dit geval wordt de vervaldag getoetst aan de begunstigende regels uit § 9.1 LI 2008 (verschuiving naar 31 december of laatste dag van de maand).

---

## Aan de slag

### Vereisten

- Node.js 24 of hoger
- npm

### Applicatie starten

```bash
cd betaalhulp-app
npm install
npm run dev
```

De applicatie is beschikbaar op `http://localhost:5173/betaalhulp/`.

### Bouwen voor productie

```bash
cd betaalhulp-app
npm run build
```

De geoptimaliseerde bestanden staan in `betaalhulp-app/dist/`.

### Tests uitvoeren

De `taxEngine` bevat uitgebreide unit tests om de juridische correctheid te waarborgen:

```bash
cd betaalhulp-app
npx vitest run
```

---

## Technische keuzes

### Datumverwerking

- Datuminvoer wordt geparsed als **lokale tijd** (niet UTC) om tijdzoneverschuivingen te vermijden bij `<input type="date">`.
- Maandtellingen bij overflow (bijv. 31 januari + 1 maand) worden gecorrigeerd naar de laatste dag van de doelmaand, conform de wettelijke terminologie "een maand later".

### Termijnverdeling

Belastingaanslagen luiden in hele euro's. De verdeling werkt als volgt:

1. Bereken het exacte termijnbedrag: `totaal / aantal`
2. Rond elk termijnbedrag **naar boven** af op hele euro's (`ceil`)
3. De som overstijgt daarmee het totaal; corrigeer door een aantal termijnen met precies **€1 te verlagen**

De formule is: `numHigher = totaal − n × (ceil − 1)`. De eerste `numHigher` termijnen krijgen het hogere bedrag, de rest `€1` minder. Termijnen verschillen maximaal €1 van elkaar; de som is altijd exact gelijk aan het totaal.

Dit is een uitvoeringskeuze in verlengde van de wet (Art. 9 lid 5, tweede volzin IW 1990).

### Audit trail

Elke berekening produceert een `trace`-array met de gevolgde stappen, de juridische grondslag en de letterlijke wettekst. Dit maakt de uitkomst volledig controleerbaar.

### Icons en installatie

De applicatie is uitgerust voor gebruik als snelkoppeling op het startscherm:

- **Browsers**: `favicon.ico` (16/32/48 px) en `favicon.svg`
- **iPhone / iPad**: `apple-touch-icon.png` (180×180 px)
- **Android / PWA**: `manifest.json` met 192×512 px icons

---

## Scope

Het hulpmiddel ondersteunt uitsluitend:

- **Normale aanslagen** (Art. 9 lid 1 IW 1990) — één termijn, zes weken na dagtekening
- **Voorlopige aanslagen** (Art. 9 lid 5 IW 1990) — gelijke maandtermijnen

Naheffingsaanslagen en navorderingsaanslagen vallen onder Art. 9 lid 2 IW 1990 (termijn: veertien dagen) en worden niet ondersteund.

---

## Juridische disclaimer

Dit hulpmiddel is gebaseerd op Artikel 9 IW 1990 en het begunstigende beleid uit § 9.1 Leidraad Invordering 2008. De Leidraad Invordering is beleidsregels van de Staatssecretaris, geen formele wetgeving. Er kunnen **geen rechten worden ontleend** aan de uitkomsten van deze berekening. Raadpleeg bij twijfel de Belastingdienst of een belastingadviseur.

---

## Documentatie

- [Begrippen Index](begrippen/index.md)
- [Regels Index](regels/index.md)
- [Annotaties Index](annotaties/index.md)
- [Wetteksten Index](wetteksten/index.md)
