const assert = require('node:assert/strict');
const {readFileSync} = require('node:fs');
const {test} = require('node:test');
const vm = require('node:vm');
const {webcrypto} = require('node:crypto');
const {join} = require('node:path');

const app = readFileSync(join(__dirname, '..', 'dist', 'app.js'), 'utf8');
const oldKey = 'batallon-supremacy-sorteo-alianzas-v1';
const newKey = 'batallon-supremacy-sorteo-octavos-v1';

function startApp() {
  const values = new Map([[oldKey, JSON.stringify(Array.from({length: 32}, (_, i) => i))]]);
  const elements = new Map();
  function element(selector) {
    if (!elements.has(selector)) {
      elements.set(selector, {
        innerHTML: '', textContent: '', style: {}, disabled: false,
        classList: {toggle() {}},
        setAttribute(name, value) { this[name] = value; },
        replaceChildren() { this.children = []; },
        append(...children) { this.children.push(...children); },
        addEventListener() {}, scrollIntoView() {}, showModal() {}
      });
    }
    return elements.get(selector);
  }
  const context = vm.createContext({
    crypto: webcrypto,
    localStorage: {
      getItem: key => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, value)
    },
    document: {querySelector: element, createElement: () => ({})},
    IntersectionObserver: class { observe() {} },
    window: {matchMedia: () => ({matches: true}), setTimeout: callback => callback(), scrollTo() {}}
  });
  vm.runInContext(app, context);
  return {context, values, element};
}

test('octavos empieza vacío aunque el sorteo anterior esté completo', () => {
  const {values, element} = startApp();
  assert.equal(element('#drawCount').textContent, '00');
  assert.equal(element('#progressBar')['aria-valuenow'], '0');
  assert.equal((element('#frontA').innerHTML.match(/class="match-card/g) ?? []).length, 4);
  assert.equal((element('#frontB').innerHTML.match(/class="match-card/g) ?? []).length, 4);
  assert.equal(values.has(newKey), false);
});

test('los 16 ganadores aparecen una vez y completan 8 combates', () => {
  const {context, values, element} = startApp();
  const expected = [
    'EuropaVII', 'Los Guerreros Aguila', 'Sturmtruppen', 'The Golden Prophecy',
    'Mort Imperium', 'AETT Blar', 'Pura Vida 2', 'Guardia Nocturna',
    'Grupo de Operaciones Maldito II', 'K I N G S 2', 'The Raptors Supremacy',
    'Sturmtruppen 2', 'Orden Ashura', 'GEM', 'Asylum', 'Pura Vida'
  ];
  const names = JSON.parse(vm.runInContext('JSON.stringify(ALLIANCES)', context));
  assert.deepEqual(names, expected);
  vm.runInContext('for (let i = 0; i < 16; i++) draw()', context);
  const picks = JSON.parse(values.get(newKey));
  assert.equal(picks.length, 16);
  assert.equal(new Set(picks).size, 16);
  assert.equal(element('#drawCount').textContent, '16');
  assert.equal(element('#progressPercent').textContent, '100%');
  assert.equal(element('#progressBar')['aria-valuenow'], '16');
  assert.equal((element('#frontA').innerHTML.match(/EMPAREJADO/g) ?? []).length, 4);
  assert.equal((element('#frontB').innerHTML.match(/EMPAREJADO/g) ?? []).length, 4);
  assert.equal(element('#drawButton').disabled, true);
});
