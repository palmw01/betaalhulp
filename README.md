# Betaalhulp Project: Juridische Logica & Applicatie

Dit project is een "Legal-as-Code" implementatie van de **Invorderingswet 1990 (IW 1990)** en de **Leidraad Invordering 2008 (LI 2008)**, specifiek gericht op het berekenen van betalingstermijnen voor belastingaanslagen.

Het project combineert een gestructureerde juridische kennisbank met een functionele webapplicatie die deze logica toepast.

## 🏗️ Projectstructuur

Het project is verdeeld in twee hoofdcomponenten: de juridische bronnen en de technische implementatie.

### ⚖️ Juridische Kennisbank
Deze mappen bevatten de vertaling van natuurlijke taal (wetstekst) naar gestructureerde logica:

- **`wetteksten/`**: De authentieke bronteksten van de wetten en leidraden.
- **`annotaties/`**: Juridische analyses die de brug slaan tussen wettekst en logische regels.
- **`begrippen/`**: Definities van alle juridische concepten die in de regels worden gebruikt.
- **`regels/`**: De afgeleide beslissings- en rekenregels (bijv. `AR-9-1` voor Artikel 9 lid 1 IW 1990).

### 💻 Applicatie (`betaalhulp-app/`)
Een moderne webapplicatie die de juridische logica toegankelijk maakt:

- **Framework**: React 19 met TypeScript.
- **Build tool**: Vite.
- **Tax Engine**: De kernlogica bevindt zich in `src/logic/taxEngine.ts`, waar de juridische regels zijn omgezet in uitvoerbare code.

## 🚀 Aan de slag

### Applicatie draaien
Om de betaalhulp-app lokaal te starten:

1. Navigeer naar de app-map:
   ```bash
   cd betaalhulp-app
   ```
2. Installeer de dependencies:
   ```bash
   npm install
   ```
3. Start de development server:
   ```bash
   npm run dev
   ```

### Tests uitvoeren
De `taxEngine` bevat uitgebreide unit tests om de juridische correctheid te waarborgen:

```bash
cd betaalhulp-app
npm test
```

## 🛠️ Technologieën & Methodiek

- **Legal-as-Code**: Door wetgeving op te breken in atomaire regels (`AR-*`) en begrippen, wordt de logica transparant en controleerbaar.
- **Traceability**: De `taxEngine` is zo ontworpen dat elke berekening een "trace" teruggeeft naar de onderliggende juridische grondslag.
- **Graphify**: Dit project maakt gebruik van `graphify` om relaties tussen wetsteksten, begrippen en regels in kaart te brengen (zie `graphify-out/`).

## 📖 Documentatie
Voor meer details over de specifieke regels en begrippen, zie de index-bestanden in de respectievelijke mappen:
- [Begrippen Index](begrippen/index.md)
- [Regels Index](regels/index.md)
- [Annotaties Index](annotaties/index.md)
