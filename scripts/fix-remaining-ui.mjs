/**
 * fix-remaining-ui.mjs — Fix 5 remaining missed UI text items
 */
import { readFileSync, writeFileSync } from 'fs';

// Fix slider.astro - 3 remaining performance items
let slider = readFileSync('src/pages/[lang]/docs/components/slider.astro', 'utf8');
const sliderFixes = [
  ['<li>Native browser scrolling</li>', '<li>{p.ui20 ?? "Native browser scrolling"}</li>'],
  ['<li>Lazy loading images recommended</li>', '<li>{p.ui21 ?? "Lazy loading images recommended"}</li>'],
  ['<li>No external dependencies</li>', '<li>{p.ui22 ?? "No external dependencies"}</li>'],
];
for (const [old, rep] of sliderFixes) {
  if (slider.includes(old)) {
    slider = slider.replace(old, rep);
    console.log('Fixed slider:', old.slice(4, 45));
  }
}
writeFileSync('src/pages/[lang]/docs/components/slider.astro', slider, 'utf8');

// Fix alert.astro
let alert = readFileSync('src/pages/[lang]/docs/design/alert.astro', 'utf8');
const alertOld = '<li>The close button has a "Close alert" label</li>';
const alertNew = '<li>{p.ui7 ?? `The close button has a "Close alert" label`}</li>';
if (alert.includes(alertOld)) {
  alert = alert.replace(alertOld, alertNew);
  console.log('Fixed alert: close button label');
}
writeFileSync('src/pages/[lang]/docs/design/alert.astro', alert, 'utf8');

// Fix badge.astro
let badge = readFileSync('src/pages/[lang]/docs/design/badge.astro', 'utf8');
const badgeOld = '<li>The close button has a default label "Close"</li>';
const badgeNew = '<li>{p.ui7 ?? `The close button has a default label "Close"`}</li>';
if (badge.includes(badgeOld)) {
  badge = badge.replace(badgeOld, badgeNew);
  console.log('Fixed badge: close button label');
}
writeFileSync('src/pages/[lang]/docs/design/badge.astro', badge, 'utf8');

// Add keys to JSONs
const locales = ['fr', 'en', 'es', 'ar'];
for (const loc of locales) {
  const path = `src/i18n/${loc}.json`;
  const data = JSON.parse(readFileSync(path, 'utf8'));
  
  // Slider keys
  if (!data.docs.pages.slider.ui20) {
    data.docs.pages.slider.ui20 = loc === 'fr' ? 'Défilement natif du navigateur' : loc === 'es' ? 'Desplazamiento nativo del navegador' : 'Native browser scrolling';
    data.docs.pages.slider.ui21 = loc === 'fr' ? 'Chargement paresseux des images recommandé' : loc === 'es' ? 'Se recomienda carga diferida de imágenes' : 'Lazy loading images recommended';
    data.docs.pages.slider.ui22 = loc === 'fr' ? 'Aucune dépendance externe' : loc === 'es' ? 'Sin dependencias externas' : 'No external dependencies';
  }
  
  // Alert key
  if (!data.docs.pages.alert.ui7) {
    data.docs.pages.alert.ui7 = loc === 'fr'
      ? 'Le bouton de fermeture a un label "Fermer l\'alerte"'
      : loc === 'es'
      ? 'El botón de cierre tiene una etiqueta "Cerrar alerta"'
      : 'The close button has a "Close alert" label';
  }
  
  // Badge key
  if (!data.docs.pages.badge.ui7) {
    data.docs.pages.badge.ui7 = loc === 'fr'
      ? 'Le bouton de fermeture a un label par défaut "Fermer"'
      : loc === 'es'
      ? 'El botón de cierre tiene una etiqueta predeterminada "Cerrar"'
      : 'The close button has a default label "Close"';
  }
  
  writeFileSync(path, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`Updated ${loc}.json`);
}

console.log('\n✅ Done! 5 items fixed.');
