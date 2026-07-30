#!/usr/bin/env node
/* Empacota o app em arquivo único, sem dependências.
 *   node build.js
 *   → dist/ambar.html            documento completo (duplo clique, offline)
 *   → dist/ambar-artifact.html   só o conteúdo, para hospedagem que injeta o esqueleto
 */
const fs = require('fs');
const path = require('path');

const raiz = __dirname;
const ler = (p) => fs.readFileSync(path.join(raiz, p), 'utf8');

const css = ler('css/ambar.css');
const js = ['js/data.js', 'js/core.js', 'js/ui.js', 'js/telas.js', 'js/app.js'].map(ler).join('\n');
const html = ler('index.html');

// corpo = tudo entre <body> e </body>, sem as tags <script src> e <link>
const corpo = html
  .split(/<body[^>]*>/)[1].split('</body>')[0]
  .replace(/<script src=[^>]+><\/script>\s*/g, '')
  .trim();

const estilo = `<style>\n${css}\n</style>`;
const script = `<script>\n${js}\n</script>`;

fs.mkdirSync(path.join(raiz, 'dist'), { recursive: true });

fs.writeFileSync(path.join(raiz, 'dist/ambar.html'), `<!DOCTYPE html>
<html lang="pt-BR" data-tema="escuro">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1">
<meta name="theme-color" content="#100D0A">
<title>ÂMBAR</title>
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' fill='%23100D0A'/%3E%3Ccircle cx='16' cy='16' r='8' fill='%23E8A33D'/%3E%3C/svg%3E">
${estilo}
</head>
<body>
${corpo}
${script}
</body>
</html>
`);

fs.writeFileSync(path.join(raiz, 'dist/ambar-artifact.html'),
  `<title>ÂMBAR</title>\n${estilo}\n${corpo}\n${script}\n`);

const kb = (p) => (fs.statSync(path.join(raiz, p)).size / 1024).toFixed(1) + ' KB';
console.log('dist/ambar.html          ', kb('dist/ambar.html'));
console.log('dist/ambar-artifact.html ', kb('dist/ambar-artifact.html'));
