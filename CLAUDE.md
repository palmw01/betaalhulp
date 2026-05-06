# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands run from `betaalhulp-app/`:

```bash
npm run dev          # development server op http://localhost:5173/betaalhulp/
npm run build        # TypeScript compileren + Vite productie-build naar dist/
npx tsc --noEmit     # type check zonder build
npx vitest run       # alle tests eenmalig uitvoeren
npx vitest run src/logic/taxEngine.test.ts   # één testbestand
npx vitest           # tests in watch-modus
```

Er is geen `npm test` script — gebruik altijd `npx vitest run`.

De Vite base is `/betaalhulp/` (zie `vite.config.ts`); alle asset-paden in `index.html` beginnen met `/`.

## Architectuur

### Toepassingslogica (`src/logic/`)

De kern is `taxEngine.ts` die twee paden implementeert:

- **`applyLid1`** — normale aanslag: één termijn, zes weken na dagtekening (42 dagen kalenderstrikt; Algemene termijnenwet is uitgesloten via art. 9 lid 10 IW 1990)
- **`applyLid5`** — voorlopige aanslag: `numTerms = 12 - maandnummer` gelijke termijnen; valt terug op `applyLid1` als `numTerms <= 1`. De laatste termijn van een voorlopige aanslag wordt altijd gecontroleerd via de hulpfunctie **`applyLI91`**.

**Eindejaarsverschuiving (`applyLI91`):**
Conform § 9.1 Leidraad Invordering 2008 wordt de laatste (of enige) vervaldag van een voorlopige aanslag (gedagtekend in november of eerder) verschoven naar 31 december als de berekende datum anders eerder zou vallen. Bij afwijkende boekjaren wordt de laatste vervaldag steeds op de laatste dag van de maand gesteld. Deze logica is gecentraliseerd in `applyLI91` en wordt toegepast op zowel de meer-termijnregeling als de een-termijnterugvalregel. `applyLI91` is een **pure functie**: het muteert het meegegeven `result` niet maar geeft altijd een nieuw object terug met gespreade `terms`- en `trace`-arrays.

Elke berekening produceert een `trace: CalculationStep[]` — een geordende audit trail van stap → juridische grondslag → letterlijke wettekst. Dit is een contractvereiste: de UI toont elke stap inclusief uitklapbare wettekst.

**Datumconventies:**
- `parseDateLocal` in het formulier parseert `<input type="date">` als lokale tijd, niet UTC — dit voorkomt dat `new Date("YYYY-MM-DD")` een dag terugspringt door de UTC-interpretatie van ISO-strings.
- `addMonths` corrigeert maandoverflow (bijv. 31 jan + 1 mnd = 28/29 feb, niet 3 mrt).

**Termijnverdeling:** belastingaanslagen luiden in hele euro's (`Math.round(amount)`). Elk termijnbedrag wordt naar boven afgerond op hele euro's (`ceil`), waarna het overschot wordt gecorrigeerd door precies `numHigher = totaal − n × (ceil − 1)` termijnen op het hogere bedrag te houden en de rest op `€1` minder. De som is altijd exact gelijk aan het totaal; termijnen verschillen maximaal €1. Als het afgeronde bedrag kleiner is dan het aantal termijnen, werpt `applyLid5` een fout (€0-termijnen zijn inhoudelijk onzinnig). Dit is een uitvoeringskeuze — pas het algoritme niet aan zonder ook de tests en de trace-tekst bij te werken.

**`isCustom`-check:** `const isCustom = request.isCustomBookYear && request.bookYearEndMonth != null` — gebruik altijd `!= null` (niet truthy) zodat een ontbrekende `bookYearEndMonth` expliciet opgemerkt wordt in plaats van stilzwijgend terug te vallen op het standaardboekjaar.

### UI-flow (`App.tsx`)

Lineaire state machine met drie stappen: `'INTRO' → 'FORM' → 'RESULT'`. Terugknop gaat terug naar `'INTRO'` (niet naar `'FORM'`). Foutmeldingen worden gewist bij elke formulierwijziging via `handleChange`.

`isCustomBookYear` is alleen relevant voor voorlopige aanslagen; de checkbox wordt alleen getoond als `type === 'PROVISIONAL'` en wordt teruggezet bij typewijziging.

**Scope:** het hulpmiddel ondersteunt uitsluitend normale aanslagen (lid 1) en voorlopige aanslagen (lid 5). Naheffingsaanslagen en navorderingsaanslagen (lid 2: 14 dagen) zijn buiten scope; de footer vermeldt dit expliciet.

### Juridische terminologie in UI-teksten

Houd bij het schrijven of aanpassen van UI-teksten rekening met de volgende distincties:

- **Wet vs. beleid:** Art. 9 IW 1990 is formele wet; § 9.1 LI 2008 is beleidsregels (niet "wet- en regelgeving"). Vermeld beide bronnen apart wanneer beide van toepassing zijn.
- **Invorderbaarheid vs. betaalverplichting:** De *betaalverplichting* bestaat al vanaf het opleggen van de aanslag. De *vervaldag* is het moment waarop de aanslag *invorderbaar* wordt — d.w.z. het moment waarop de ontvanger dwanginvordering kan starten. Gebruik niet "u moet betalen op" maar "de aanslag wordt invorderbaar op" of "vervaldag (uiterste betaaldatum)".
- **Vervaldag:** de officiële IW-term voor de vervaldatum van een termijn. De UI toont dit als "Vervaldag (uiterste betaaldatum)" om herkenbaarheid te combineren met juridische precisie.
- **Voorlopige aanslag:** een aanslag vóór de definitieve vaststelling, opgelegd op basis van geschatte gegevens — géén navorderingsaanslag of naheffingsaanslag.
- **Afwijkend boekjaar:** van toepassing op belastingplichtigen (ondernemers én rechtspersonen zoals BV's) wiens boekjaar niet samenvalt met het kalenderjaar. Niet beperken tot "ondernemers".

### Juridische kennisbank (`wetteksten/`, `annotaties/`, `begrippen/`, `regels/`)

Dit is een **Obsidian-vault** met wikilinks (`[[pad/naar/noot]]`). Niet bewerken zonder kennis van de templatestructuur in `annotaties/template.md`, `begrippen/template.md` en `regels/template.md`.

Naamgevingsconventies:
- Afleidingsregels: `AR-[art]-[nr]` (bijv. `AR-9-1`, `AR-LI-9-1a`)
- Begrippen: kebab-case slug (bijv. `vervaldag-eerste-termijn`)
- Annotaties: `annotaties/[wet]/art[A]-[L].md` per lid

De frontmatter-velden `afgeleid-van`, `bepaalt`, `rechtsfeit`, `invoer`, `uitvoer` zijn wikilinks die de traceerbaarheid van code → regel → annotatie → wettekst borgen. Nieuwe regels in `taxEngine.ts` dienen een corresponderende `AR-*`-noot te hebben.

### Icons en PWA

Icoonbestanden in `public/` zijn gegenereerd vanuit `rijksoverheid.jpeg` (225×225 px) via ImageMagick. Bij regenereren: `magick rijksoverheid.jpeg -resize [N]x[N] -background white -flatten output.png`. Het `manifest.json` en de Apple-meta-tags in `index.html` zijn gekoppeld aan `favicon-192.png`, `favicon-512.png` en `apple-touch-icon.png`.

## TypeScript-configuratie

`tsconfig.app.json` heeft `noUnusedLocals` en `noUnusedParameters` actief. Ongebruikte imports of variabelen breken de build.
