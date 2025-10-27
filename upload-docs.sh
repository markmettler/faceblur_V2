#!/bin/bash

# Upload docs folder naar GitHub
cd ~
mkdir -p faceblur-v2-upload
cd faceblur-v2-upload

# Clone de repository als deze nog niet bestaat
if [ ! -d "faceblur_V2" ]; then
  git clone https://github.com/markmettler/faceblur_V2.git
fi

cd faceblur_V2

# Kopieer de docs folder
echo "Kopiëren van docs folder..."
cp -r /tmp/cc-agent/59097003/project/docs/* ./

# Git operaties
echo "Uploaden naar GitHub..."
git add .
git commit -m "Update manifest.json voor PWA Builder"
git push origin main

echo ""
echo "✅ Docs folder geüpload naar GitHub!"
echo "Wacht 1-2 minuten en probeer PWABuilder opnieuw met:"
echo "https://markmettler.github.io/faceblur_V2/"
