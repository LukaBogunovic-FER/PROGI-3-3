# 2. Analiza zahtjeva

## 2.1 Funkcijski zahtjevi

| ID | Opis | Prioritet | Izvor | Kriteriji prihvaćanja |
|---|---|---|---|---|
| F-001 | Učitavanje i preuzimanje rasterskih slika u najmanje tri formata | Visok | Odobreni zadatak | Slike se mogu učitati i preuzeti u podržanim formatima |
| F-002 | Organizacija slika u direktorije te imenovanje, preimenovanje, premještanje i brisanje datoteka | Visok | Odobreni zadatak | Korisnik može izvršiti navedene operacije nad svojim datotekama |
| F-003 | Pregledavanje i uređivanje rasterskih slika | Visok | Odobreni zadatak | Slika se prikazuje, a dostupni su najmanje pet filtara, četiri morfološka operatora, tri geometrijske transformacije i jedan algoritam segmentacije |
| F-004 | Registracija i prijava putem vanjskog poslužitelja | Visok | Zahtjev dionika | Korisnik se može prijaviti, a pristup aplikaciji dodjeljuje se nakon uspješne autentifikacije |
| F-005 | Privatna radna okolina svakog korisnika | Visok | Odobreni zadatak | Korisnik može pristupiti vlastitim datotekama, ali ne i privatnim datotekama drugih korisnika |
| F-006 | Uređivanje javnog profila i upravljanje objavama | Visok | Zahtjev dionika | Korisnik može uređivati podatke profila te stvarati, mijenjati i brisati objave sa slikom i tekstom |
| F-007 | Objavljivanje slika i postavljanje privatnosti objava | Visok | Zahtjev dionika | Korisnik može odabrati javnu ili privatnu vidljivost objave |
| F-008 | Pregledavanje javnih profila i objava te označavanje favorita | Visok | Odobreni zadatak | Prijavljeni korisnik može pregledavati javni sadržaj i dodavati profile i objave u favorite |
| F-009 | Preuzimanje javnih slika i njihovo kopiranje u vlastitu radnu okolinu | Srednji | Odobreni zadatak | Korisnik može preuzeti javnu sliku na računalo ili ju kopirati u vlastiti radni prostor |
| F-010 | Dodjela početnih rasterskih slika novom korisniku | Srednji | Odobreni zadatak | Nakon prve prijave korisnik dobiva tri početne slike |

## 2.2 Nefunkcijski zahtjevi

| ID | Opis | Prioritet | Izvor | Način provjere |
|---|---|---|---|---|
| NF-01 | Korisničko sučelje mora biti prilagođeno korištenju na računalima i mobilnim uređajima | Srednji | Zahtjev dionika | Testirati prikaz aplikacije na različitim veličinama zaslona |
| NF-02 | Pristupni tokeni i drugi osjetljivi podaci moraju se pohranjivati u zaštićenom obliku | Visok | Sigurnost | Pregledati način pohrane i zaštite osjetljivih podataka |
| NF-03 | Aplikacija mora prikazati jasnu poruku ako učitana datoteka nije podržanog formata ili se ne može učitati | Srednji | Povratna informacija | Pokušati učitati datoteku nepodržanog formata i provjeriti prikazuje li se odgovarajuća poruka |
| NF-04 | Aplikacija mora ispravno raditi u aktualnim verzijama preglednika Google Chrome i Mozilla Firefox | Srednji | Zahtjev dionika | Testirati glavne funkcionalnosti u oba preglednika |
| NF-05 | Radnje poput otvaranja radnog prostora i prikaza popisa slika trebaju završiti unutar 2 sekunde pri uobičajenom opterećenju | Srednji | Zahtjev dionika | Izmjeriti vrijeme izvođenja navedenih radnji pri unaprijed definiranim uvjetima testiranja |
| NF-06 | Izvorni kod mora biti dobro organiziran i strukturiran radi lakšeg održavanja | Srednji | Pravila dokumentiranja | Pregledati strukturu projekta, imenovanje i dosljednost koda |

## 2.3 Dionici i akteri

| ID uloge ili aktera | Odnos prema sustavu | Relevantni zahtjevi |
|---|---|---|
| A-01 | Registrirani korisnik koji upravlja vlastitim slikama i radnim prostorom | F-001, F-002, F-003 |
| A-02 | Registrirani korisnik koji uređuje profil i objavljuje slike | F-004, F-005 |
| A-03 | Registrirani korisnik koji pregledava i preuzima javni sadržaj te označava favorite | F-008, F-009 |
| D-01 | Razvojni tim koji razvija i održava aplikaciju | NF-03, NF-05, NF-06 |

**Napomena:** A-01, A-02 i A-03 mogu biti ista osoba u bilo kojoj kombinaciji, ali netko možda neće koristiti mrežne dijelove aplikacije i samo njezin uređivač

## 2.4 Ograničenja i pretpostavke

**Cilj:** Zabilježiti projektno specifične granice i pretpostavke koje utječu na zahtjeve ili oblikovanje, zajedno s njihovim izvorom i praktičnom posljedicom. Ovo je njihovo mjerodavno mjesto u dokumentaciji.

| ID | Tip | Opis ograničenja ili pretpostavke | Izvor | Inženjerska posljedica / Provjera |
| --- | --- | --- | --- | --- |
| C-01 | Ograničenje | [Fiksni tehnički ili procesni uvjet] | [Zadatak / Pravila] | [Utjecaj na arhitekturu i oblikovanje] |
| AS-01 | Pretpostavka | [Očekivani uvjet, npr. o podacima ili okolini] | [Procjena tima] | [Kako i kada će se provjeriti valjanost] |
|  |  |  |  |  |
<details>
<summary><strong>Ograničenja nasuprot pretpostavkama</strong></summary>

Ograničenje je uvjet koji tim mora poštovati; pretpostavka je uvjet na koji se tim oslanja i koji treba ponovno provjeravati.

**Primjer — projektni kontekst CrisisMapa:**

| ID | Ograničenje ili pretpostavka | Izvor | Posljedica ili način provjere |
| --- | --- | --- | --- |
| C-01 | Odobreni zadatak zahtijeva OAuth prijavu u sustav za uređivanje vlastitih prijava korisnika. | Odobreni zadatak  | Zaštićeno uređivanje projektirati oko odabranog pružatelja identiteta; provjeriti autorizirane i neautorizirane zahtjeve. |
| AS-01 | Prijave koje se prikazuju na karti imaju uporabive koordinate. | Pretpostavka o podacima  | Pregledati ogledne i uvezene prijave; planirati prikaz prijava bez valjanih koordinata. |

**Ograničenje nasuprot pretpostavci:** C-01 navodi obvezujuću odluku i njezin arhitekturni učinak; AS-01 je moguće provjeriti i može se pokazati netočnim. Nemojte kopirati C-01 ako OAuth nije dio stvarnog odobrenog zadatka. Projektni odgovor objasnite u arhitekturi bez prepisivanja ove tablice.

</details>

---

## 2.5 Značajne promjene zahtjeva

**Cilj:** Sačuvati razlog promjena koje mijenjaju dogovoreni opseg, prioritet ili kriterije prihvaćanja, uz istodobno održavanje prethodnih zahtjeva ažurnima.

| Datum | ID zahtjeva | Promjena i razlog | Dogovoreno s / dokaz |
| --- | --- | --- | --- |
|  |  |  |  |

<details>
<summary><strong>Primjer značajne promjene</strong></summary>

**Primjer scenarija — odluka tijekom pregleda CrisisMapa:**

| Datum | ID zahtjeva | Promjena i razlog | Dogovoreno s / dokaz |
| --- | --- | --- | --- |
| [Datum pregleda] | F-004, NF-01 | Dodati ručni odabir lokacije kada korisnik odbije geolokaciju preglednika; bez toga građanin ne može podnijeti prijavu kriznog događaja s lokacijom. | [Poveznica na stvarnu bilješku pregleda ili zadatak tima] |

**Razlog promjene:** Zapis navodi zahvaćene stavke i objašnjava razlog iz perspektive korisnika, a zatim upućuje na dokaz odluke.  Nakon stvarne odluke ažurirajte trenutačne zahtjeve; stilska izmjena teksta ne zahtijeva zapis u dnevniku promjena. Trenutačni red zadataka držite u alatu za praćenje zadataka.

</details>

---

## 2.6 Sljedivost zahtjeva

**Cilj:** Osigurati dvosmjernu sljedivost — povezati zahtjeve s opisanim ponašanjem, dijelovima sustava koji ih ostvaruju te ispitivanjem ili drugom provjerom. 

| ID zahtjeva | Obrazac uporabe / modul | Arhitekturna realizacija | Ispitivanje ili provjera |
| --- | --- | --- | --- |
| F-001 | [UC-001] | [Komponenta, modul ili drugo mjesto realizacije] | [ST-01, CT-01 ili druga provjera] |
|  |  |  |  |

<details>
<summary><strong>Sljedivost zahtjeva do obrazaca uporabe i ispitivanja</strong></summary>

**Primjer — poveznice zahtjeva CrisisMapa:**

| ID zahtjeva | Obrazac uporabe / ponašanje | Arhitekturna realizacija | Ispitivanje / provjera |
| --- | --- | --- | --- |
| F-004 | UC-002 Podnošenje prijave kriznog događaja | Web-klijent; API za prijave; usluga za prijave | ST-01 Valjano podnošenje prijave; ST-02 Nedostaje obavezna lokacija; ST-03 Dopuštenje geolokacije odbijeno |
| F-005 | Odabir primatelja obavijesti | Proces za obavijesti | CT-06 Primatelji obavijesti; potpuna dostava obavijesti nije pokrivena ovom provjerom |

**Pokrivenost i dokazi:** CT-06 provjerava odabir primatelja za F-005, ali sam po sebi ne dokazuje da je obavijest stvarno dostavljena; ako projekt zahtijeva potpunu dostavu od početka do kraja, za taj dio treba postojati zasebna provjera. Svaki redak pokazuje gdje je zahtjev opisan kao ponašanje, gdje je ostvaren u sustavu i gdje se nalazi dokaz njegove provjere. Zahtjev ne mora imati zaseban obrazac uporabe ako ne opisuje korisničku interakciju; tada navedite relevantno ponašanje, arhitekturni element ili drugi prikladan način realizacije. U svojem projektu koristite stvarne nazive komponenata, modula i provjera iz dokumentacije i implementacije. Nedostajuću poveznicu ostavite praznom ili označite kao *na čekanju* uz kratak razlog. Stvarni rezultati ispitivanja bilježe se uz ispitne slučajeve; ova tablica pokazuje gdje ih pronaći.

</details>

---

## 2.7 Pregled zahtjeva

**Cilj:** Zabilježiti važne povratne informacije o zahtjevima i odluke koje iz njih proizlaze na dvije formalne kontrolne točke projekta, u 7. i 14. tjednu.

| Kontrolna točka | Povratna informacija ili nalaz | Odluka o zahtjevu ili opsegu |
| --- | --- | --- |
| Iteracija 1 | [Povratna informacija] | [Odluka; vidi odjeljak 2.5] |
| Demo 2  | [Povratna informacija] | [Odluka; vidi odjeljak 2.5] |
| Završni pregled | [Povratna informacija] | [Odluka; vidi odjeljak 2.5] |

<details>
<summary><strong>Odluke o zahtjevima nakon pregleda</strong></summary>

**Primjer scenarija — pregled zahtjeva CrisisMapa:**

| Kontrolna točka | Povratna informacija ili nalaz | Odluka o zahtjevu ili opsegu |
| --- | --- | --- |
| Iteracija 1 | Demonstracija pokazuje da odbijanje pristupa lokaciji preglednika onemogućuje podnošenje prijave. | Dogovoriti ručni odabir lokacije; ažurirati F-004 i primjer NF-01 te razlog zabilježiti u odjeljku 2.5. |

**Odluka povezana s povratnom informacijom:** Zapis povezuje opaženo ponašanje s konkretnom promjenom zahtjeva i izbjegava zapisnik cijelog sastanka. Zapišite samo stvarne povratne informacije i odluke za kontrolne točke. Konzultacije u nekom drugom tjednu ne stvaraju dodatnu obaveznu predaju.

</details>

---

>**Završna provjera:** Zahtjevi su aktualni, provjerljivi i povezani. Svaki važan zahtjev moguće je pratiti od njegova opisa i ponašanja preko mjesta realizacije u sustavu do odgovarajućeg ispitivanja ili druge provjere. Poveznice koriste stvarne identifikatore i nazive iz projektne dokumentacije.

