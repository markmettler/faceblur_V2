#!/bin/bash

# Navigeer naar een werkdirectory
cd ~
mkdir -p faceblur-upload
cd faceblur-upload

# Clone de repository
git clone https://github.com/markmettler/faceblur.git
cd faceblur

echo "Repository gecloned. Nu ga je de bestanden kopiëren..."
echo ""
echo "VOLGENDE STAPPEN:"
echo "1. Download/kopieer ALLE bestanden van dit project naar: ~/faceblur-upload/faceblur/"
echo "2. Kom dan terug naar deze terminal en voer uit:"
echo ""
echo "   cd ~/faceblur-upload/faceblur"
echo "   git add ."
echo "   git commit -m 'Initial commit: Face blur video recorder'"
echo "   git push origin main"
echo ""
echo "Let op: Kopieer NIET de node_modules folder!"
