#!/bin/bash
# Uso: sorgenti/docx_bestiario/genera.sh <cartella_uscita> <A|B|tutto> [pagine.json]
set -e
D=$(cd "$(dirname "$0")" && pwd)
OUT=$1; MODO=${2:-tutto}; PAG=$3
export NODE_PATH=$(npm root -g)
N=$OUT/Bestiario_$MODO.docx
node "$D/build.js" "$N" "$MODO" "$PAG"
python3 "$D/ritocchi.py" "$N"
python3 /mnt/skills/public/docx/scripts/office/validate.py "$N" | tail -2
(cd "$OUT" && python3 /mnt/skills/public/docx/scripts/office/soffice.py --headless --convert-to pdf "$(basename "$N")" >/dev/null 2>&1)
pdfinfo "${N%.docx}.pdf" | grep Pages
