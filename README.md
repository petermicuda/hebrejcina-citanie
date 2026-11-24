# Hebrejčina – čítanie

Cvičenia na čítanie hebrejčiny podľa materiálov z hodín: lekcie 1–11, úvodné opakovanie, koncové písmená a dageš, podobné písmená, pravidlá čítania, Amida a všetky strany Big Practice.

Aplikácia patrí k rodine **Sidur Hineni**. Pripravil Peter Mičuda.

## Kde ju nájdete

- **Android aplikácia** – hlavná verzia. Zostavuje sa v súkromnom repozitári sidur-hineni (priečinok `citanie/`), testovacie APK sa posiela testerom priamo.
- **Webová verzia** – tento repozitár (GitHub Pages). Je pre tých, ktorí nemajú Android (napr. iPhone) alebo chcú len rýchlo otvoriť odkaz. Obsah je rovnaký ako v aplikácii.

## Ako upraviť

- Texty: `src/obsah.html` (sekcie `<h2 id="s0">` … `s27`), vzhľad a správanie: `src/sablona.html`, `src/app.css`, `src/app.js`.
- Zostavenie: `python3 zostav.py` → `index.html` (33 strán).
- Android verzia: `index.html` a `frank-ruhl.woff` skopírovať do `citanie/www/` v repozitári sidur-hineni.

## Čo vie

- Čítanie po stranách (33 strán) ako v sidure: listovanie tlačidlami alebo prstom, „Na ktorú časť?“.
- Výslovnosť pod každým slovom; ikonou oka sa skryje, ťuknutím na slovo (alebo číslo riadku) sa ukáže.
- Pokračovanie tam, kde ste skončili (strana a riadok), obsah, 6 veľkostí písma, nočný režim.
- Funguje aj bez internetu.

Chyby v texte alebo vo výslovnosti: sidur.hineni@gmail.com
