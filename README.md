# Thumb Keyboard Lab v0.3 — PWA

Tämä versio säilyttää v0.2:n 2 × 3 -kentät, samanaikaiset painallukset, pyyhkäisyt, merkkikartan, yhdistelyikkunan säädön ja tilastovalikon. Uutta ovat asennuskuvake, manifesti ja offline-välimuisti (service worker).

## Tärkeää: offline ei aktivoidu iPhonella lähiverkon HTTP-osoitteesta

Osoite `http://192.168.x.x:8000` toimii kehityksessä, **mutta ei ole turvallinen HTTPS-alkuperä**. iPhone ei yleensä anna tämän kautta asennetulle sivulle tarvittavaa service worker -toimintoa. Offline-käyttöä varten ohjelma täytyy avata **HTTPS-osoitteesta** ainakin kerran internet-yhteydellä. Esimerkiksi GitHub Pages on yksi vaihtoehto.

## Nopea julkaisu GitHub Pagesilla (julkinen sivusto)

1. Kirjaudu GitHubiin; luo uusi **Public** repository esim. `thumb-keyboard-lab`.
2. Lataa **kaikki tämän ZIP-paketin tiedostot** repositoryn juureen; `icons` pitää säilyä alikansiona. Huomaa, että GitHubissa sivusto ja HTML/JS-koodi ovat tällöin julkisia.
3. Avaa `Settings → Pages → Build and deployment → Source: Deploy from a branch → main / (root) → Save`.
4. Kun Pages on julkaistu, avaa `https://KÄYTTÄJÄ.github.io/thumb-keyboard-lab/` iPhonen Safarissa.
5. Odota, että sivu latautuu loppuun; avaa `Tilastot ja pyyhkäisyohjeet`, ja tarkista *Offline-tila: sovelluksen tiedostot tallennettu*.
6. Safari → Jaa → Lisää Koti-valikkoon → `Open as Web App` käyttöön → Lisää.
7. Avaa kotinäytön Thumb Lab -kuvake, testaa ja kokeile vielä lentokonetilassa.

Jos verkkosivu ei heti päivity, avaa se uudelleen verkkoyhteydellä. Service worker käyttää online-tilassa verkkoversiota ja offline-tilassa välimuistia. Jos teet lisää koodimuutoksia, vaihda `sw.js`-tiedoston `CACHE_NAME`-versionumero, jotta iPhonen välimuisti päivittyy luotettavammin.

## Paikallinen kehitys Windowsissa

Pura projektikansio. Kaksoisnapsauta `start_windows.bat` tai suorita `py -m http.server 8000 --bind 0.0.0.0`. Avaa Windowsissa `http://localhost:8000/` tai iPhonella `http://OMA-IP:8000/`. Jälkimmäinen **ei yksin mahdollista luotettavaa offline-PWA:ta**.

## Muut huomautukset

- Sovellus käyttää vain paikallista JavaScriptiä, eikä lähetä kirjoitettua tekstiä palvelimelle.
- Sovellus ei toimi muiden iOS-sovellusten järjestelmänäppäimistönä.
- Kirjoitettu teksti ei tallennu pysyvästi: kun sovellus ladataan uudelleen tai suljetaan, teksti voi kadota.
- Kotinäytölle lisääminen ei takaa ikuista offline-toimintaa: iOS voi poistaa välimuistin tallennustilan hallinnan yhteydessä.
