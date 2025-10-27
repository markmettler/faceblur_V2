# Android APK Genereren voor Offline Installatie

## Snelste Methode: PWABuilder.com (Aanbevolen)

### Stap 1: Deploy je app
Zorg dat de `deploy/` folder beschikbaar is via HTTPS (bijv. via GitHub Pages, Netlify, of een lokale server).

### Stap 2: Gebruik PWABuilder
1. Ga naar [PWABuilder.com](https://www.pwabuilder.com/)
2. Voer je app URL in (waar de deploy folder toegankelijk is)
3. Klik op "Package For Stores"
4. Selecteer "Android"
5. Download de APK

De APK werkt volledig offline na installatie!

---

## Alternatief: Lokaal met Bubblewrap CLI

### Vereisten
- Node.js (al geïnstalleerd ✓)
- JDK 17 (wordt automatisch geïnstalleerd)
- Android SDK (wordt automatisch geïnstalleerd)

### Stap 1: Installeer Bubblewrap
```bash
npm install -g @bubblewrap/cli
```

### Stap 2: Initialiseer JDK en Android SDK
```bash
npx @bubblewrap/cli doctor
```
(Volg de prompts en laat Bubblewrap alles installeren - dit kan 5-10 minuten duren)

### Stap 3: Host je app lokaal
```bash
cd /tmp/cc-agent/59097003/project
npx serve deploy -p 3000
```

### Stap 4: Genereer APK
Open een nieuwe terminal en voer uit:
```bash
cd /tmp/cc-agent/59097003/project
npx @bubblewrap/cli init --manifest http://localhost:3000/manifest.json
npx @bubblewrap/cli build
```

### Stap 5: Vind je APK
De APK staat in: `./app-release-signed.apk` of `./app-release-unsigned.apk`

---

## APK Installeren op Android

### Methode 1: Via USB
1. Verbind je Android telefoon met USB
2. Zet "USB debugging" aan in Developer Options
3. Kopieer de APK naar je telefoon
4. Open de APK op je telefoon
5. Sta "Installeren van onbekende bronnen" toe
6. Installeer de app

### Methode 2: Via Email/Drive
1. Upload de APK naar Google Drive of email naar jezelf
2. Open op je Android telefoon
3. Download en installeer (sta onbekende bronnen toe)

---

## Snelste Oplossing: Direct APK Downloaden

Als je de app al op een server hebt staan, gebruik dan:

**PWABuilder.com** - Geeft je binnen 2 minuten een werkende APK!

1. Deploy deze `deploy` folder naar een publieke URL
2. Ga naar PWABuilder.com
3. Voer de URL in
4. Klik "Package for Android"
5. Download APK (inclusief signing keys)

De gegenereerde APK:
- ✓ Werkt volledig offline
- ✓ Heeft toegang tot camera en microfoon
- ✓ Ziet eruit als native app
- ✓ Kan gedeeld worden zonder app store

---

## Waarom PWABuilder boven Bubblewrap?

| Feature | PWABuilder | Bubblewrap |
|---------|-----------|------------|
| Setup tijd | 2 minuten | 10-15 minuten |
| Vereist lokale tools | Nee | Ja (JDK, Android SDK) |
| Browser interface | Ja | Nee (CLI only) |
| Auto-signing | Ja | Handmatig |
| Geschikt voor niet-devs | Ja | Nee |

**Conclusie:** Gebruik PWABuilder.com voor de snelste route naar een werkende APK!
