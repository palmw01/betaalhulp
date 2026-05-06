# Betaalhulp App

Dit is de front-end applicatie voor het berekenen van betalingstermijnen op basis van de Invorderingswet 1990.

## Functionaliteit
- Invoeren van aanslaggegevens (type, datum, bedrag).
- Berekenen van betalingstermijnen conform Artikel 9 IW 1990.
- Tonen van een volledig betalingsschema inclusief juridische onderbouwing (trace).
- **Directe inzage in wetteksten**: Per berekeningsstap kan de relevante tekst uit de wet of de Leidraad Invordering worden getoond.

## Ontwikkeling

### Installatie
```bash
npm install
```

### Start Development Server
```bash
npm run dev
```

### Build voor Productie
```bash
npm run build
```

### Kwaliteitscontroles
- **Linting**: `npm run lint`
- **Testing**: `npx vitest run` (er is geen `npm test` script)

## Architectuur
De applicatie scheidt de UI (React componenten in `src/components`) strikt van de juridische logica (`src/logic`). 
De `taxEngine.ts` is de implementatie van de regels die gedefinieerd zijn in de [hoofd-kennisbank](../regels/index.md).

Zie de [hoofd-README](../README.md) voor meer informatie over het totale project.
