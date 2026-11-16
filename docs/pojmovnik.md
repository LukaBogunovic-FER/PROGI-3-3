# Pojmovnik

| Pojam | Značenje |
|---|---|
| Rasterska slika | Slika zapisana kao mreža piksela, npr. PNG, JPEG, TIFF ili BMP datoteka |
| Piksel | Najmanji element slike; ima jednu vrijednost (siva slika) ili po jednu vrijednost za svaki kanal boje |
| Kanal | Jedna komponenta boje piksela, npr. R, G ili B; vrijednosti su od 0 do 255 |
| Model boje | Način zapisa piksela: GREY (jedan kanal), RGB (tri kanala), RGBA (tri kanala i prozirnost) |
| Siva slika | Slika s jednim kanalom koji predstavlja svjetlinu |
| Binarna slika (maska) | Slika u kojoj je svaki piksel ili objekt ili pozadina, obično prikazano crno-bijelo |
| Filtar | Operacija koja novu vrijednost piksela računa iz njegove vrijednosti i vrijednosti susjeda (npr. zamućenje, rubovi) |
| Konvolucija | Računanje nove vrijednosti piksela kao težinske sume susjednih piksela; težine su zadane jezgrom |
| Jezgra (kernel) | Mala matrica težina ili oblik koji se koristi u filtrima i morfološkim operacijama |
| Strukturni element | Jezgra u morfološkim operacijama; određuje oblik i veličinu susjedstva |
| Morfološki operator | Operacija nad oblicima u slici, npr. erozija (smanjuje svijetla područja) i dilatacija (povećava ih) |
| Geometrijska transformacija | Operacija koja mijenja položaj piksela, a ne njihove vrijednosti, npr. rotacija, zrcaljenje, promjena veličine |
| Segmentacija | Podjela slike na područja, npr. odvajanje objekata od pozadine |
| Prag (threshold) | Vrijednost svjetline koja dijeli piksele na objekt i pozadinu; Otsuova metoda je sama određuje iz histograma |
| Histogram | Broj piksela za svaku vrijednost svjetline |
| Povezano područje | Skup piksela objekta koji se međusobno dodiruju (preko 4 ili 8 susjeda) |
| Registar operacija | Popis svih operacija obrade slike u aplikaciji s nazivom, kategorijom i parametrima (`frontend/src/imaging/ops.ts`) |
| Radna okolina | Privatni dio aplikacije u kojem korisnik sprema, organizira i uređuje svoje slike |
| Javna stranica | Profil korisnika vidljiv drugim prijavljenim korisnicima, s objavama |
| Objava | Slika s tekstualnim opisom objavljena na javnoj stranici korisnika |
