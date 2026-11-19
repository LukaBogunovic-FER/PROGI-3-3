# Obrada slike – zahtjevi i operacije

Ova stranica razrađuje zahtjev **F-003** iz [Analize zahtjeva](2-Analiza-zahtjeva.md) na pojedine operacije obrade slike. Za svaku operaciju navedeni su parametri i kriterij prihvaćanja koji se provjerava jediničnim testom.

Sve operacije izvode se u pregledniku pomoću knjižnice [ImageJS](https://github.com/image-js/image-js) (paket `image-js`), kako preporučuje projektni zadatak. Operacije su zapisane u registru `frontend/src/imaging/ops.ts`, a testovi su u `frontend/src/imaging/ops.test.ts` (pokretanje: `npm test` u direktoriju `frontend`).

Zajedničko za sve operacije:

- operacija ne mijenja ulaznu sliku nego vraća novu
- parametri imaju zadanu vrijednost, a vrijednosti izvan dopuštenog raspona korisničko sučelje ne nudi
- operacije koje rade samo nad sivom slikom (rubovi, morfologija, segmentacija) same pretvaraju sliku u boji u sivu

Stupac *Status* opisuje stanje u repozitoriju: **Implementirano** znači da je operacija u registru i ima test, **Planirano** da još nije.

## Filtri (F-003.1)

Zadatak traži najmanje 5 filtara.

| ID | Operacija | Parametri | Kriterij prihvaćanja | Status |
|---|---|---|---|---|
| FIL-01 | Invert | – | Svaka vrijednost kanala v postaje 255 − v; dvostruka primjena daje izvornu sliku | Implementirano |
| FIL-02 | Sivi tonovi (greyscale) | metoda: Luma BT.709, prosjek, svjetlina, najveći kanal | Rezultat ima jedan kanal; čista crvena (255, 0, 0) uz Luma BT.709 daje 54 | Implementirano |
| FIL-03 | Pikselizacija | veličina ćelije 2–64 px (zadano 8) | Svi pikseli unutar jedne ćelije imaju istu vrijednost | Implementirano |
| FIL-04 | Zamućenje (box blur) | veličina 3–31 px, neparna (zadano 5) | Jednobojna slika ostaje ista; oštar rub postaje mekši | Implementirano |
| FIL-05 | Gaussovo zamućenje | sigma 0,5–10 (zadano 2) | Jednobojna slika ostaje ista; oštar rub postaje mekši | Implementirano |
| FIL-06 | Medijan (uklanjanje šuma) | prozor 3–9, neparan (zadano 3) | Pojedinačni bijeli pikseli šuma na sivoj podlozi nestaju | Implementirano |
| FIL-07 | Rubovi (derivacija) | operator: Sobel, Scharr, Prewitt | Jednobojna slika daje 0; okomiti rub daje jak odziv (> 200) na mjestu ruba | Implementirano |
| FIL-08 | Automatski kontrast | – | Najtamnija vrijednost postaje 0, a najsvjetlija 255 | Implementirano |

## Morfološki operatori (F-003.2)

Zadatak traži najmanje 4 morfološka operatora. Strukturni element je kvadrat zadane veličine.

| ID | Operacija | Parametri | Kriterij prihvaćanja | Status |
|---|---|---|---|---|
| MOR-01 | Erozija | veličina jezgre 3–15, neparna; broj ponavljanja 1–10 | Izolirani bijeli piksel nestaje uz jezgru 3×3 | Implementirano |
| MOR-02 | Dilatacija | isto kao MOR-01 | Bijeli kvadrat se poveća za polumjer jezgre sa svake strane | Implementirano |
| MOR-03 | Otvaranje | isto kao MOR-01 | Mali šum nestaje, a veći objekt ostaje iste veličine | Implementirano |
| MOR-04 | Zatvaranje | isto kao MOR-01 | Mala rupa unutar objekta se popuni | Implementirano |

## Geometrijske transformacije (F-003.3)

Zadatak traži najmanje 3 geometrijske transformacije.

| ID | Operacija | Parametri | Kriterij prihvaćanja | Status |
|---|---|---|---|---|
| GEO-01 | Promjena veličine | mjerilo 5–400 % (zadano 50) | Uz 50 % širina i visina se prepolove; omjer stranica ostaje isti | Implementirano |
| GEO-02 | Rotacija za 90°/180°/270° | kut | Rotacija za 90° zamijeni širinu i visinu; dvije rotacije za 180° daju izvornu sliku | Implementirano |
| GEO-03 | Rotacija za proizvoljan kut | kut −180°…180° | Slika se ne odrezuje – platno se poveća da stane cijela zarotirana slika | Implementirano |
| GEO-04 | Zrcaljenje | os: vodoravno, okomito, obje | Dvostruko zrcaljenje po istoj osi daje izvornu sliku | Implementirano |
| GEO-05 | Izrezivanje | lijevo, gore, širina, visina (u %) | Rezultat ima zadane dimenzije; vrijednosti izvan slike se ograniče na rub | Implementirano |

## Segmentacija (F-003.4)

Zadatak traži najmanje jedan algoritam segmentacije.

| ID | Operacija | Parametri | Kriterij prihvaćanja | Status |
|---|---|---|---|---|
| SEG-01 | Prag (Otsu) | – | Rezultat je crno-bijela slika; na slici s dvije razine sivoga prag pada između njih; prikazuje se vrijednost praga | Implementirano |
| SEG-02 | Označavanje povezanih područja | povezanost 4 ili 8; najmanja veličina područja | Na ispitnoj slici s tri odvojena oblika pronalaze se točno 3 područja; svako područje dobiva svoju boju i prikazuje se njihov broj | Implementirano |

## Nefunkcijski zahtjevi za obradu slike

| ID | Opis | Način provjere |
|---|---|---|
| NF-OBR-01 | Operacija koja ne uspije (npr. neispravni parametri) ne smije srušiti aplikaciju; korisniku se prikazuje poruka | Ručno ispitivanje u editoru |
| NF-OBR-02 | Svaka operacija mora raditi i nad slikom u boji (RGB/RGBA) i nad sivom slikom | Test „every op runs with default params on a colour and on a grey image” |

## Korištene ImageJS funkcije

Pregled koju funkciju knjižnice `image-js` (verzija 1.x) koristi pojedina operacija i što treba napraviti sami.

| Operacija | ImageJS funkcija | Ulaz | Napomena |
|---|---|---|---|
| Invert | `invert()` | bilo koji | |
| Sivi tonovi | `grey({ algorithm })` | RGB, RGBA | siva slika vraća se nepromijenjena (vlastita provjera u `toGrey`) |
| Pikselizacija | `pixelate({ cellSize })` | bilo koji | |
| Zamućenje | `blur({ width, height })` | bilo koji | |
| Gaussovo zamućenje | `gaussianBlur({ sigma })` | bilo koji | |
| Medijan | `medianFilter({ cellSize, borderType })` | bilo koji | rub se proširuje zrcaljenjem (`reflect101`) |
| Rubovi | `derivativeFilter({ filter })` | GREY | slika u boji se prvo pretvara u sivu |
| Automatski kontrast | `increaseContrast()` | bilo koji | |
| Erozija, dilatacija | `erode()`, `dilate()` | GREY | |
| Otvaranje, zatvaranje | `open()`, `close()` | GREY | |
| Promjena veličine | `resize({ width, preserveAspectRatio })` | bilo koji | |
| Rotacija 90°/180°/270° | `rotate(angle)` | bilo koji | |
| Rotacija za proizvoljan kut | `transformRotate(angle, { fullImage })` | bilo koji | |
| Zrcaljenje | `flip({ axis })` | bilo koji | |
| Izrezivanje | `crop({ origin, width, height })` | bilo koji | |
| Prag (Otsu) | `threshold({ algorithm: 'otsu' })` | GREY | vraća masku, koja se pretvara u sivu sliku |
| Označavanje područja | – | maska | **vlastita implementacija** (algoritam s dva prolaza i union-find) |

Formati datoteka koje ImageJS podržava:

| Smjer | Formati |
|---|---|
| Čitanje (`decode`) | PNG, JPEG, TIFF, BMP |
| Zapis (`encode`) | PNG, JPEG, BMP |

TIFF se može učitati, ali ga ImageJS ne zna zapisati, pa se slika uređena u editoru sprema kao PNG, JPEG ili BMP.
