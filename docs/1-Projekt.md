# 1. Opseg projekta

## 1.1 Problem i cilj projekta

Korisnici koji žele organizirati, obrađivati i dijeliti rasterske slike često moraju koristiti više različitih alata za pohranu, uređivanje i objavljivanje slika. Takav pristup može otežati organizaciju datoteka, praćenje obrađenih verzija i dijeljenje sadržaja s drugim korisnicima.

Pictora je platforma koja objedinjuje pohranu, organizaciju, pregledavanje, obradu i javno dijeljenje rasterskih slika na jednom mjestu. Korisnicima omogućuje upravljanje vlastitom zbirkom slika, primjenu različitih metoda obrade te objavljivanje slika i tekstualnih opisa na javnom profilu.

Za očekivati je da će takva aplikacija biti privlačna svakom tko si želi olakšati cjelokupni proces objave slika.
## 1.2 Ciljani korisnici i dionici

| Skupina korisnika ili dionika | Potreba ili interes relevantan za ovaj projekt |
| --- | --- |
| Registrirani korisnik | Pohranjivati, organizirati i obrađivati vlastite slike te mogućnost pregleda tuđih profila i slika |
| Razvojni tim | Razviti aplikaciju te ju nadograđivati prema mogućnostima i željama korisnika uz moderaciju sadržaja na platformi |
| Regulatorno tijelo | Osigurati zaštitu korisnika i njihovih osobnih podataka potrebnih za prijavu, kao i sadržaja objavljenog na platformi |

## 1.3 Granice projekta

**Cilj:** Jasno definirati granice sustava — što je obuhvaćeno odobrenim zadatkom, što je svjesno izostavljeno ili odgođeno te o kojim vanjskim uslugama sustav izravno ovisi.

**Uključeno:** Prijenos, uređivanje i objava vlastitih slika kao i pregled tuđih 
**Izvan opsega ili odgođeno:** [Navedite funkcionalnosti koje su namjerno izostavljene ili prebačene u buduće verzije, uz kratko inženjersko ili vremensko obrazloženje.] 
**Vanjske ovisnosti:** Pružatelj uređivačkih usluga (ImageJS), pružatelj web usluga (Render)

<details>
<summary><strong>Primjer početne granice projekta</strong></summary>

**Primjer — CrisisMap:**  
**Uključeno:** Podnošenje prijave kriznog događaja s lokacijom i pregled prijava na karti.  
**Isključeno:** Automatsko angažiranje hitnih službi; prikaz prijave ne odobrava niti pokreće službenu intervenciju.  
**Vanjska ovisnost:** Pružatelj kartografskih usluga omogućuje prikaz karte; aplikacija ostaje odgovorna za vlastite podatke o prijavama.

Ovo je konkretna granica jer razdvaja prikaz informacija od službenog odgovora hitnih službi i određuje koji sustav osigurava kartu. Izuzeće i ovisnost dio su **nastavnog scenarija**, a ne tvrdnja o tome što objavljena aplikacija stvarno implementira; te činjenice određuju odobreni opseg i stvarna aplikacija tima.

**Drugi primjer korisne granice:** U prvoj implementaciji usredotočite se na koordinaciju odgovora na poplavu. Navedite vrste događaja ili korisnika koje pokriva odobreni projekt umjesto obećavanja svih mogućih kriznih procesa. Predviđanje pomoću umjetne inteligencije ili obuku u virtualnoj stvarnosti navedite kao budući rad samo ako predstavljaju smislen sljedeći korak, a ne kao pretpostavljene funkcionalnosti prve inačice.

Tvrdnja poput „modularna arhitektura omogućuje brzo postavljanje u novim regijama” zahtijeva stvarno projektno uporište. Ovdje nemojte obećavati prilagodljivost samo zato što zvuči kao poželjna korist projekta.

Ovaj pregled zadržite na razini opsega: navedite glavnu mogućnost i njezinu granicu bez popisivanja svakog zahtjeva ili projektne pojedinosti. Ono što je stvarno dovršeno i ono što je ostalo nedovršeno navedite u završnim rezultatima, a ne u ovom početnom opisu.

</details>

## 1.4 Postojeći pristupi i opravdanost projekta

**Cilj:** Objasniti kako korisnici trenutačno rješavaju problem i koja preostala potreba opravdava odobreni projekt.

[U dvije do četiri rečenice opišite jedan postojeći postupak ili relevantno rješenje, što ono već omogućuje i koja konkretna potreba motivira ovaj projekt. Činjenične tvrdnje o vanjskim proizvodima ili praksama potkrijepite izvorom.]

<details>
<summary><strong>Postojeći pristupi i opravdanost projekta</strong></summary>

**Primjer — CrisisMap:** „Nakon teškog vremenskog događaja građanin će možda morati provjeriti izvor meteoroloških upozorenja i zaseban izvor lokalnih prijava. Predloženi prikaz na karti u CrisisMapu objedinjuje prijave kriznih događaja relevantne za odabranu lokaciju. Aplikacija ne zamjenjuje službena upozorenja ni hitne službe.” Time se objašnjava potreba i namjeravana granica projekta bez tvrdnje da su svi postojeći kanali neučinkoviti. Prva je rečenica **primjer korisničkog scenarija**, a ne izmjeren nalaz o stvarnim korisnicima. Ako tim navodi konkretnu službu upozoravanja ili konkurentski proizvod, treba navesti izvor. Pregled konkurencije i snimke zaslona nisu obavezni.

Ako je postojeće rješenje stvarno utjecalo na projekt, usporedite samo relevantnu funkcionalnost, primjerice jasnoću karte ili potrebnu integraciju. Izbjegavajte unaprijed zadani broj proizvoda ili tablicu kriterija koji nisu povezani s odobrenim zadatkom.

</details>

---

>**Završna provjera:** Opis problema, cilj projekta, korisnici i dionici, granice opsega te postojeći pristupi međusobno su usklađeni. Navedene koristi ne predstavljaju neprovjerene tvrdnje, a uključene i izostavljene funkcionalnosti odgovaraju odobrenom projektnom zadatku.
