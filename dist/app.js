const ALLIANCES = [
  'Morior Invictvs', 'Sturmtruppen.', 'Orden Ashura', 'K I N G S',
  'Gens Una Sumus', 'Pura Vida', 'Guardia Nocturna', 'Los Guerreros Aguila',
  'Quiencomodios', 'Mort Imperium', 'El Toro y el Águila', 'Grupo de Operaciones Maldito',
  'HispanoRomano', 'The Golden Prophecy', 'Comando Wisky', 'The Raptors Supremacy',
  'La Maldad', 'Schutztafell', 'AETT Blar', 'Conquistadores Final del Mundo',
  'EuropaVII', 'Gremio Guardianes', 'Cinzas da Guerra', 'P4ct0 de Ac3ro',
  'Primera Guardia', 'Brindemos', 'GEM', 'Asylum', 'Madhouse',
  'Diosconmigoquiencontrami (2)', 'Pura Vida (2)', 'K I N G S (2)'
];
const STORAGE_KEY = 'batallon-supremacy-sorteo-alianzas-v1';
const $ = (selector) => document.querySelector(selector);
let picks = loadPicks();
let drawing = false;

function loadPicks() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(data) && data.length <= ALLIANCES.length && data.every(Number.isInteger) &&
        data.every(i => i >= 0 && i < ALLIANCES.length) && new Set(data).size === data.length) return data;
  } catch (_) { /* Start with an empty draw if local storage is unavailable. */ }
  return [];
}

function savePicks() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(picks)); } catch (_) { /* Draw remains usable in this session. */ }
}

function randomIndex(upperBound) {
  const limit = Math.floor(0x100000000 / upperBound) * upperBound;
  const sample = new Uint32Array(1);
  do { crypto.getRandomValues(sample); } while (sample[0] >= limit);
  return sample[0] % upperBound;
}

function matchMarkup(matchIndex) {
  const slots = [0, 1].map(slotIndex => {
    const drawIndex = matchIndex * 2 + slotIndex;
    const picked = picks[drawIndex];
    const isCurrent = drawIndex === picks.length && picks.length < ALLIANCES.length;
    const isNewest = drawIndex === picks.length - 1;
    const classes = ['team-slot', picked === undefined ? 'empty' : 'filled', isCurrent ? 'next-slot' : '', isNewest ? 'newest-slot' : ''].filter(Boolean).join(' ');
    return `<div class="${classes}" data-draw-index="${drawIndex}"><span class="slot-indicator" aria-hidden="true">${picked === undefined ? String(slotIndex + 1).padStart(2, '0') : '✦'}</span><span class="team-name">${picked === undefined ? 'POR DEFINIR' : ALLIANCES[picked]}</span>${isCurrent ? '<span class="slot-pulse" aria-hidden="true"></span>' : ''}</div>`;
  }).join('<div class="versus">VS</div>');
  const complete = picks.length >= matchIndex * 2 + 2;
  const active = picks.length === matchIndex * 2 || picks.length === matchIndex * 2 + 1;
  return `<article class="match-card ${complete ? 'complete' : ''} ${active ? 'active' : ''}" id="match-${matchIndex + 1}"><div class="match-topline"><span>COMBATE ${String(matchIndex + 1).padStart(2, '0')}</span><span>${complete ? 'EMPAREJADO' : active ? 'EN SORTEO' : 'PENDIENTE'}</span></div><div class="match-teams">${slots}</div></article>`;
}

function render() {
  $('#frontA').innerHTML = Array.from({length: 8}, (_, i) => matchMarkup(i)).join('');
  $('#frontB').innerHTML = Array.from({length: 8}, (_, i) => matchMarkup(i + 8)).join('');
  $('#drawCount').textContent = String(picks.length).padStart(2, '0');
  $('#remainingCount').textContent = `${ALLIANCES.length - picks.length} ${ALLIANCES.length - picks.length === 1 ? 'alianza pendiente' : 'alianzas pendientes'}`;
  $('#progressPercent').textContent = `${Math.round(picks.length / ALLIANCES.length * 100)}%`;
  $('#progressFill').style.width = `${picks.length / ALLIANCES.length * 100}%`;
  $('#progressBar').setAttribute('aria-valuenow', String(picks.length));
  const latest = $('#latestResult');
  latest.replaceChildren();
  if (picks.length) {
    const number = document.createElement('small'); number.textContent = `ALIANZA ${String(picks.length).padStart(2, '0')}`;
    const name = document.createElement('strong'); name.textContent = ALLIANCES[picks.at(-1)];
    latest.append(number, name);
  } else {
    const placeholder = document.createElement('span'); placeholder.className = 'latest-placeholder'; placeholder.textContent = 'AÚN SIN REVELAR'; latest.append(placeholder);
  }
  const done = picks.length === ALLIANCES.length;
  $('#drawButton').disabled = done || drawing;
  $('#floatingDrawButton').disabled = done || drawing;
  $('#floatingCount').textContent = `${String(picks.length).padStart(2, '0')} / 32`;
  $('#floatingDrawButton').classList.toggle('completed', done);
  $('#drawButtonText').textContent = done ? 'SORTEO COMPLETADO' : drawing ? 'SORTEANDO...' : 'REVELAR ALIANZA';
  $('#instruction').textContent = done ? 'Los 16 enfrentamientos están definidos. ¡Que comience la batalla!' : picks.length === 0 ? 'Presiona el botón para revelar la primera alianza.' : picks.length % 2 === 1 ? `Presiona de nuevo para descubrir el rival del combate ${String(Math.ceil(picks.length / 2)).padStart(2, '0')}.` : `Combate ${String(picks.length / 2).padStart(2, '0')} definido. Revela la siguiente alianza.`;
}

function draw() {
  if (drawing || picks.length === ALLIANCES.length) return;
  drawing = true;
  const available = ALLIANCES.map((_, i) => i).filter(i => !picks.includes(i));
  const next = available[randomIndex(available.length)];
  // Commit the result before the visual animation so a refresh cannot reroll this pick.
  picks.push(next);
  savePicks();
  const button = $('#drawButton');
  button.disabled = true;
  $('#drawButtonText').textContent = 'SORTEANDO...';
  const delay = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 650;
  window.setTimeout(() => {
    drawing = false;
    render();
    const slot = document.querySelector(`[data-draw-index="${picks.length - 1}"]`);
    if (slot) slot.scrollIntoView({behavior: 'smooth', block: 'center'});
  }, delay);
}

$('#rosterList').innerHTML = ALLIANCES.map(name => `<li>${name.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')}</li>`).join('');
$('#drawButton').addEventListener('click', draw);
$('#floatingDrawButton').addEventListener('click', draw);
new IntersectionObserver(([entry]) => {
  $('#floatingDrawButton').classList.toggle('visible', !entry.isIntersecting);
}, {threshold: 0.1}).observe($('#drawButton'));
$('#resetButton').addEventListener('click', () => $('#resetDialog').showModal());
$('#resetDialog').addEventListener('close', (event) => {
  if (event.target.returnValue !== 'confirm') return;
  picks = [];
  savePicks();
  render();
  window.scrollTo({top: 0, behavior: 'smooth'});
});
render();
