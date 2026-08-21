const fs = require('fs');
const path = require('path');
const vm = require('vm');

const jsPath = path.join(__dirname, '..', 'QuanLyBanNganh', 'JavaScript.html');
const jsRaw = fs.readFileSync(jsPath, 'utf8').trim();
const jsCode = jsRaw.replace(/^<script>/i, '').replace(/<\/script>$/i, '');

// Create mock browser environment
const mockWindow = {
  SERVER_CONFIG: { sheetId: '13oCKGzsOyy3x9VrsI-NNxFaXBTpdOvveUoTiWegcEZw', banNganhId: 'id_41451e0a', banNganhTitle: 'Ban Thanh Tráng' },
  location: { search: '', href: '' },
  localStorage: { getItem: () => null, setItem: () => {} },
  document: {
    readyState: 'complete',
    addEventListener: () => {},
    getElementById: () => ({ classList: { add: () => {}, remove: () => {} }, textContent: '', value: '' }),
    querySelectorAll: () => [],
    querySelector: () => null,
    createElement: () => ({ classList: { add: () => {}, remove: () => {} }, setAttribute: () => {}, appendChild: () => {} }),
    body: { appendChild: () => {} }
  },
  console: console,
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  setInterval: setInterval,
  clearInterval: clearInterval,
  Date: Date,
  Math: Math,
  JSON: JSON,
  Array: Array,
  Object: Object,
  String: String,
  Number: Number,
  RegExp: RegExp,
  Set: Set,
  Map: Map,
  URLSearchParams: URLSearchParams
};
mockWindow.window = mockWindow;

const context = vm.createContext(mockWindow);

try {
  vm.runInContext(jsCode, context, { filename: 'JavaScript.html' });
  console.log('✅ JSDOM Simulation: JavaScript executed without runtime error!');
  console.log('typeof navigateTo in context:', typeof context.navigateTo);
  console.log('typeof initApp in context:', typeof context.initApp);
} catch (e) {
  console.error('❌ JSDOM Simulation Runtime Error:', e);
}
