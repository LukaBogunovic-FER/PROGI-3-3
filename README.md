<!--
PREDLOŽAK — README završnog projekta na kolegiju Programsko inženjerstvo FER-a.
Kopirajte ovu datoteku u README.md u repozitoriju svojeg projekta. Zamijenite
svaku uputu u uglatim zagradama činjenicama o svojem projektu, uklonite sve
komentare s uputama i ogledne <details> blokove te prije predaje izbrišite ovu
napomenu. Nemojte kopirati nastavni primjer kao rezultat svojeg projekta.
-->

# Pictora

**Projekt na kolegiju:** Ovu je aplikaciju razvio studentski tim u sklopu kolegija [Programsko inženjerstvo](https://www.fer.unizg.hr/predmet/proinz) na Fakultetu elektrotehnike i računarstva Sveučilišta u Zagrebu (FER).

Pictora je platforma koja korisnicima omogućuje dijeljenje i uređivanje njihovih slika, kao i pregledavanje te praćenje drugih korisnika.

## Opis aplikacije

Svatko od nas voli objaviti dobru fotku i podijeliti ju sa prijateljima kao i listati objave drugih.
Cilj je korisnicima pružiti uređivač fotografija koji je lako shvatljiv te im omogućuje lako pronalaženje i uživanje u sadržaju koji im se sviđa.
Aplikacija nudi nekoliko mogućnosti obrade rasterskih slika u više formata pomoću filtera, morfoloških i geometrijskih operacija te uvid u privatnu radnu okolinu svakog prijavljenog korisnika kao i njihove javne profile koji omogućuju favoritiziranje profila ili objava koji su im posebno zanimljivi.


**Ključne funkcionalnosti**

1. Uvoz i uređivanje slika
2. Objava vlastitih i pregled tuđih slika

Za potpuni opseg, zahtjeve, oblikovanje i dokaze ispitivanja pogledajte [docs](docs/Home.md).

<a id="deployment"></a>
## Postavljanje

<!-- UPUTA: Ovaj odjeljak opisuje već postavljenu aplikaciju koju se  može otvoriti i isprobati bez lokalnog pokretanja izvornog koda.
Za Iteraciju 1 i Završni pregled navedite konkretne podatke. Provjerite vodi li URL na javno dostupnu pokrenutu aplikaciju i radi li navedeni tijek uporabe. Nikada ne objavljujte lozinke ni pristupne tokene. -->

**Javno dostupna aplikacija:** [Javni URL]

**Isprobajte:** [Jedna ili dvije kratke radnje koje pokazuju funkcionalan korisnički tijek.]

**Demonstracija:** [Objasnite kako dobiti potreban ograničeni pristup ako je prijava obavezna; u suprotnom napišite „Korisnički račun nije potreban.” Ovdje ne objavljujte lozinke ni pristupne tokene.]

**Ograničenja:** [Kratko navedite ograničenja postavljene inačice ili postavite poveznicu na jedinstveno mjerodavno mjesto u dokumentaciji s poznatim problemima.]

[Vodič za postavljanje i pokretanje](docs/6-Postavljanje-instalacija-i-konfiguracija.md) opisuje smještaj aplikacije (engl. hosting) koji tim stvarno koristi. Tim može koristiti Render ili drugu platformu koju ste dogovorili s asistentom/demonstratorom.


**Adresa:** [Stvarna adresa koju aplikacija ispiše nakon pokretanja.]

**Konfiguracija:** [Navedite potrebne varijable okruženja (engl. environment variables) ili uputite na sigurnu datoteku `.env.example`; objasnite gdje se dobivaju vrijednosti. Nikada ne stavljajte stvarne pristupne podatke u ovu datoteku, primjer konfiguracije, snimke zaslona, zapise ni zapise promjena (engl. commits).]

[Dodajte kratak korak provjere, primjerice koja se stranica treba otvoriti ili koja naredba pokreće osnovnu provjeru.] Za detaljno postavljanje pogledajte [projektnu dokumentaciju](docs/Home.md).

## Tehnologije

Navedite nekoliko tehnologija i vanjskih usluga koje bitno određuju kako vaša aplikacija radi. Za svaku navedite njezinu konkretnu ulogu i jedan razlog ili ograničenje važno za projekt. Alat za razvoj ili ispitivanje uključite samo ako je njegova uloga važna za razumijevanje načina na koji je projekt izrađen ili provjeren. Nemojte prepisivati popis ovisnosti (engl. dependencies), statistiku programskih jezika ni popis razvojnih okruženja i komunikacijskih alata. Tablicu provjerite prema stvarnom repozitoriju i pokrenutoj aplikaciji; potrebne verzije i konfiguraciju dokumentirajte u vodiču za instalaciju.

| Tehnologija ili alat | Uloga u ovom projektu | Razlog uporabe ili važno ograničenje |
| --- | --- | --- |
| Spring boot | Backend framework | Pojednostavljuje konfiguraciju Java aplikacije te implementaciju REST API-ja |
| PostgreSQL | Pohrana podataka | Omogućuje pouzdanu pohranu podataka u relacijskoj bazi |
| OAuth2 | Prijava | Pruža pouzdanu uslugu prijave s vanjskim računima |
| React | Frontend | Omogućuje izradu komponenti za galeriju, uređivač slika, profile i objave |
| Arctic | Početne slike | Dohvaća početne slike u radnoj okolini korisnika |
| ImageJS | Obrada slika | Nudi mogućnost obrade slika bez potrebe za slanjem svake na poslužitelj |
| Render| Deployment | Omogućuje objavu aplikacije online i lako povezivanje s GitHub repozitorijem|




<a id="team-members"></a>
## Članovi tima

| Član | Glavna uloga ili doprinos |
| --- | --- |
| Luka Milošević | [Uloga ili doprinos] |
| Petar Gabriel | [Uloga ili doprinos] |
| Tin Karalić | Backend |
| Eugen Korak ||
| Mislav Brkić ||
| Luka Bogunović ||
| Borna Dramalija ||


## Doprinos projektu

Trenutni zadaci i njihova raspodjela se prati pomoću alata Trello.

<a id="license"></a>

**Status licence:** 

# Licenca

[LICENCA](PROGI3-3/LICENSE.md)

[![CC BY-NC-SA 4.0][cc-by-nc-sa-shield]][cc-by-nc-sa]

Ovaj repozitorij sadrži otvoreni obrazovni sadržaji (eng. Open Educational Resources)  i licenciran je prema pravilima Creative Commons licencije koja omogućava da preuzmete djelo, podijelite ga s drugima uz
uvjet da navođenja autora, ne upotrebljavate ga u komercijalne svrhe te dijelite pod istim uvjetima [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License HR][cc-by-nc-sa].


[![CC BY-NC-SA 4.0][cc-by-nc-sa-image]][cc-by-nc-sa]

[cc-by-nc-sa]: https://creativecommons.org/licenses/by-nc/4.0/deed.hr
[cc-by-nc-sa-image]: https://licensebuttons.net/l/by-nc-sa/4.0/88x31.png
[cc-by-nc-sa-shield]: https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg

Orginal [![cc0-1.0][cc0-1.0-shield]][cc0-1.0]
>
>COPYING: All the content within this repository is dedicated to the public domain under the CC0 1.0 Universal (CC0 1.0) Public Domain Dedication.
>
[![CC0-1.0][cc0-1.0-image]][cc0-1.0]

[cc0-1.0]: https://creativecommons.org/licenses/by/1.0/deed.en
[cc0-1.0-image]: https://licensebuttons.net/l/by/1.0/88x31.png
[cc0-1.0-shield]: https://img.shields.io/badge/License-CC0--1.0-lightgrey.svg

<a id="ai-usage"></a>
## Uporaba umjetne inteligencije [![AI Usage: Disclosed](https://img.shields.io/badge/AI%20Usage-Disclosed-blue.svg)](https://www.fer.unizg.hr/_download/repository/Policy%20on%20the%20appropriate%20use%20of%20artificial%20intelligence%20at%20the%20faculty%20of%20electrical%20engineering%20and%20computing%5B1%5D.pdf)

Ovaj projekt slijedi FER-ova [pravila o primjerenoj uporabi umjetne inteligencije](https://www.fer.unizg.hr/_download/repository/Policy%20on%20the%20appropriate%20use%20of%20artificial%20intelligence%20at%20the%20faculty%20of%20electrical%20engineering%20and%20computing%5B1%5D.pdf).

[Izjava o korištenju umjetne inteligencije](docs/Home.md#izjava-o-uporabi-umjetne-inteligencije)

<a id="code-of-conduct-and-support"></a>
## Kodeks ponašanja i podrška [![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](CODE_OF_CONDUCT.md)

Od članova tima očekuje se pridržavanje **Kodeksa ponašanja studenata** Fakulteta elektrotehnike i računarstva Sveučilišta u Zagrebu, pravila timskog rada na kolegiju i [Etičkog kodeksa IEEE-a](https://www.ieee.org/about/corporate/governance/p7-8.html).

---

Struktura dokumentacije prilagođena je predlošku kolegija Programsko inženjerstvo FER-a autora [Vlade Sruka](https://www.fer.unizg.hr/vlado.sruk), licenciranom pod [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/). Aplikaciju i njezin sadržaj izradio je gore navedeni studentski tim.
