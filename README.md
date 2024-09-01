# Kamernet BotBot
Wil je niet elke uur van de dag zelf Kamernet afspeuren en reageren op nieuwe kamers die voor jou interessant kunnen zijn? Gebruik dan dit script. Het script zoekt automatisch naar nieuwe kamers en reageert direct voor je.

<sup><sup>Gebruik dit script op eigen risico</sup><sup>

## Installatie

1. Download deze folder naar een server of lokaal (is alleen lokaal getest). Hernoem de `.env.example` file naar `.env` en vul hier je credentials in.

    Het interval bepaalt hoe vaak Kamernet wordt gescand. Er is ook een kleine variatie toegevoegd, zodat het niet steeds precies hetzelfde moment is, wat de kans op detectie verkleint.

    > Zet in eerste instantie developer modus aan!  
2. Ga naar Kamernet.nl, open meteen de ontwikkelaarstools en ga naar het tabblad "Network". Stel vervolgens al je filters in, zoals prijs, locatie, afstand, beschikbaarheid, of geslacht. Wanneer je de filters toepast, wordt er een POST-verzoek gedaan naar de file `findlistings`. Open dit verzoek, zet de JSON-weergave naar raw, kopieer de inhoud en plak deze in de `searchQuery.js` file.

images/tutorial.mov