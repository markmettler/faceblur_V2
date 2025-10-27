# Handmatig uploaden naar GitHub

De automatische sync vanaf bolt.new werkt niet goed. Je moet handmatig uploaden.

## Optie 1: Via bolt.new terminal

**BELANGRIJK:** Dit werkt alleen als je GitHub token hebt ingesteld in bolt.new

## Optie 2: Download en upload lokaal (MAKKELIJKST)

1. Download dit project als ZIP via bolt.new
2. Pak het uit op je computer
3. Open terminal/command prompt
4. Ga naar de uitgepakte folder
5. Voer uit:

```bash
cd docs
git init
git add .
git commit -m "Update met CDN voor gezichtsdetectie"
git branch -M main
git remote add origin https://github.com/markmettler/faceblur_V2.git
git push -f origin main
```

## Optie 3: Via GitHub Web Interface (NOG MAKKELIJKER)

1. Ga naar: https://github.com/markmettler/faceblur_V2
2. Klik op "Add file" > "Upload files"
3. Sleep ALLE bestanden uit de `docs` folder naar GitHub
4. Scroll naar beneden, vul commit message in: "Update met CDN voor gezichtsdetectie"
5. Klik "Commit changes"
6. Wacht 1-2 minuten voor GitHub Pages deployment

## Optie 4: Alleen de belangrijkste bestanden updaten

Upload via GitHub web interface ALLEEN deze bestanden uit de `docs` folder:
- `index.html`
- Alle bestanden in `assets/` folder (vooral de .js bestanden)

## Wat er fout gaat nu

De site laadt de OUDE JavaScript code die zoekt naar lokale MediaPipe bestanden.
De NIEUWE code gebruikt CDN's en zou direct moeten werken.
