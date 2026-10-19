#!/usr/bin/env bash
set -euo pipefail

# Run from the repository root on feature/slides-section.
# The SourceCraft pipeline publishes src/ as site/, so public/ assets must also be copied into src/.
test -f public/data/slides/spec-1.01.json || { echo "Не найден public/data/slides/spec-1.01.json. Переключитесь на feature/slides-section."; exit 1; }

mkdir -p src/data/slides src/slides src/downloads/specifications
cp public/data/slides/spec-1.01.json public/data/slides/spec-1.03.json public/data/slides/spec-1.04.json src/data/slides/
cp -R public/slides/. src/slides/
cp public/downloads/specifications/*.xlsx src/downloads/specifications/

echo "Файлы спецификаций, изображений и Excel скопированы в src/."
echo "Далее скопируйте из архива products.js, script.js, render-spec.js, slides.html, slide-1.01.html, slide-1.03.html, slide-1.04.html, site-enhancements.css и playgrounds.html в src/."
