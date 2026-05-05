# Graph Report - .  (2026-05-05)

## Corpus Check
- Corpus is ~17,111 words - fits in a single context window. You may not need a graph.

## Summary
- 42 nodes · 30 edges · 18 communities (4 shown, 14 thin omitted)
- Extraction: 87% EXTRACTED · 13% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.9)
- Token cost: 23,650 input · 3,750 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Invorderbaarheid & Aanslagtypen|Invorderbaarheid & Aanslagtypen]]
- [[_COMMUNITY_Termijnenberekening (Lid 5)|Termijnenberekening (Lid 5)]]
- [[_COMMUNITY_Eindejaarsregeling & Boekjaar|Eindejaarsregeling & Boekjaar]]
- [[_COMMUNITY_Resterende Maanden & Bedragen|Resterende Maanden & Bedragen]]
- [[_COMMUNITY_Vervaldagen (Leidraad)|Vervaldagen (Leidraad)]]
- [[_COMMUNITY_Facturatie & Totaalbedrag|Facturatie & Totaalbedrag]]
- [[_COMMUNITY_Eerste Termijn Berekening|Eerste Termijn Berekening]]
- [[_COMMUNITY_Volgende Termijnen Berekening|Volgende Termijnen Berekening]]
- [[_COMMUNITY_Termijn van Zes Weken|Termijn van Zes Weken]]
- [[_COMMUNITY_Zes-weken-na-dagtekening|Zes-weken-na-dagtekening]]
- [[_COMMUNITY_Logische Operatoren|Logische Operatoren]]
- [[_COMMUNITY_Uitzonderingsbepalingen|Uitzonderingsbepalingen]]
- [[_COMMUNITY_Vaststellingsjaar Conditie|Vaststellingsjaar Conditie]]
- [[_COMMUNITY_Maand van Dagtekening|Maand van Dagtekening]]
- [[_COMMUNITY_Eén Maand na Dagtekening|Eén Maand na Dagtekening]]
- [[_COMMUNITY_Annotaties Art. 9 lid 1|Annotaties Art. 9 lid 1]]
- [[_COMMUNITY_Annotaties Art. 9 lid 5|Annotaties Art. 9 lid 5]]
- [[_COMMUNITY_Annotaties § 9.1 LI 2008|Annotaties § 9.1 LI 2008]]

## God Nodes (most connected - your core abstractions)
1. `AR-9-1: bepalen invorderbaarheid belastingaanslag` - 6 edges
2. `§ 9.1 LI 2008` - 6 edges
3. `Art. 9 IW 1990` - 5 edges
4. `invorderbaarheid in gelijke termijnen` - 4 edges
5. `vervaldag volgende termijnen` - 4 edges
6. `belastingaanslag` - 3 edges
7. `vervaldag 31 december` - 3 edges
8. `resterende maanden van het jaar` - 2 edges
9. `telkens een maand later` - 2 edges
10. `termijnenberekening resterende maanden` - 2 edges

## Surprising Connections (you probably didn't know these)
- `AR-9-1: bepalen invorderbaarheid belastingaanslag` --references--> `invorderbaarheid belastingaanslag`  [EXTRACTED]
  regels/AR-9-1.md → begrippen/invorderbaarheid-belastingaanslag.md
- `AR-9-1: bepalen invorderbaarheid belastingaanslag` --references--> `de dagtekening van het aanslagbiljet`  [EXTRACTED]
  regels/AR-9-1.md → begrippen/dagtekening-aanslagbiljet.md
- `AR-9-1: bepalen invorderbaarheid belastingaanslag` --references--> `invorderbaarheid`  [EXTRACTED]
  regels/AR-9-1.md → begrippen/invorderbaarheid.md
- `telkens een maand later` --cites--> `Art. 9 IW 1990`  [EXTRACTED]
  begrippen/telkens-een-maand-later.md → wetteksten/iw1990/art9.md
- `termijnenberekening resterende maanden` --cites--> `Art. 9 IW 1990`  [EXTRACTED]
  begrippen/termijnenberekening-resterende-maanden.md → wetteksten/iw1990/art9.md

## Hyperedges (group relationships)
- **Lid 5 Payment Logic** — ar_9_5a_ar_9_5a, ar_9_5b_ar_9_5b, ar_9_5c_ar_9_5c, ar_9_5d_ar_9_5d, ar_9_5e_ar_9_5e, ar_9_5f_ar_9_5f [EXTRACTED 1.00]
- **Art 9 lid 5 IW 1990 Termijnenberekening** — invorderbaarheid_in_gelijke_termijnen_invorderbaarheid_in_gelijke_termijnen, vervaldag_eerste_termijn_vervaldag_eerste_termijn, vervaldag_volgende_termijnen_vervaldag_volgende_termijnen, termijnenberekening_resterende_maanden_termijnenberekening_resterende_maanden [EXTRACTED 1.00]
- **LI 2008 Eindejaars-vervaldagen** — dagtekening_in_november_of_eerder_dagtekening_in_november_of_eerder, termijn_eindigt_voor_31_december_termijn_eindigt_voor_31_december, vervaldag_31_december_vervaldag_31_december, vervaldag_laatste_dag_maand_vervaldag_laatste_dag_maand [EXTRACTED 1.00]

## Communities (18 total, 14 thin omitted)

### Community 0 - "Invorderbaarheid & Aanslagtypen"
Cohesion: 0.22
Nodes (9): AR-9-1: bepalen invorderbaarheid belastingaanslag, AR-9-5a: bepalen invorderbaarheid voorlopige aanslag in gelijke termijnen, AR-9-5e: bepalen terugval naar lid 1 bij onvoldoende termijnen, belastingaanslag, de dagtekening van het aanslagbiljet, invorderbaarheid belastingaanslag, invorderbaarheid, voorlopige aanslag (+1 more)

### Community 1 - "Termijnenberekening (Lid 5)"
Cohesion: 0.48
Nodes (7): invorderbaarheid in gelijke termijnen, Art. 9 IW 1990, telkens een maand later, termijnenberekening resterende maanden, terugvalregel lid 1, vervaldag eerste termijn, vervaldag volgende termijnen

### Community 2 - "Eindejaarsregeling & Boekjaar"
Cohesion: 0.38
Nodes (7): 31 december, afwijkend boekjaar, dagtekening in november of eerder, § 9.1 LI 2008, termijn eindigt voor 31 december, vervaldag 31 december, vervaldag laatste dag maand

### Community 3 - "Resterende Maanden & Bedragen"
Cohesion: 0.67
Nodes (3): AR-9-5b: berekenen resterende maanden jaar, AR-9-5f: berekenen termijnbedrag voorlopige aanslag, resterende maanden van het jaar

## Knowledge Gaps
- **29 isolated node(s):** `AR-9-5b: berekenen resterende maanden jaar`, `AR-9-5c: berekenen vervaldag eerste termijn voorlopige aanslag`, `AR-9-5d: berekenen vervaldag volgende termijnen voorlopige aanslag`, `AR-9-5e: bepalen terugval naar lid 1 bij onvoldoende termijnen`, `AR-9-5a: bepalen invorderbaarheid voorlopige aanslag in gelijke termijnen` (+24 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **14 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What connects `AR-9-5b: berekenen resterende maanden jaar`, `AR-9-5c: berekenen vervaldag eerste termijn voorlopige aanslag`, `AR-9-5d: berekenen vervaldag volgende termijnen voorlopige aanslag` to the rest of the system?**
  _29 weakly-connected nodes found - possible documentation gaps or missing edges._