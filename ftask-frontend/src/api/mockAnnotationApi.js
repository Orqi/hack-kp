const LS_KEY = 'mock_annotations_v1';

let store = load();

function load() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch { return []; }
}
function persist() {
  try { localStorage.setItem(LS_KEY, JSON.stringify(store)); } catch {}
}

let config = { failRate: 0.05, minLatency: 150, maxLatency: 500 };
const wait = ms => new Promise(r => setTimeout(r, ms));
const latency = () =>
  Math.random() * (config.maxLatency - config.minLatency) + config.minLatency;

export function configureMock(opts = {}) {
  config = { ...config, ...opts };
}

export async function listAnnotations(imageId) {
  await wait(latency());
  return store.filter(a => a.imageId === imageId);
}

export async function createAnnotation(data) {
  await wait(latency());
  if (Math.random() < config.failRate) throw new Error('Mock network failure');
  const rec = {
    id: (crypto && crypto.randomUUID) ? crypto.randomUUID()
      : Date.now() + '-' + Math.random().toString(36).slice(2),
    createdAt: Date.now(),
    ...data
  };
  store.push(rec);
  persist();
  console.log('[mockAnnotationApi] Saved annotation:', rec);
  return rec;
}

export function deleteAnnotation(id) {
  const before = store.length;
  store = store.filter(a => a.id !== id);
  if (store.length !== before) {
    persist();
    console.log('[mockAnnotationApi] Deleted annotation:', id);
  }
}

export function getAllAnnotations() {
  return [...store];
}

export function replaceAllAnnotations(list) {
  if (!Array.isArray(list)) return;
  store = list.map(a => ({ ...a }));
  persist();
  console.log('[mockAnnotationApi] Replaced all annotations. Count:', store.length);
}

export function resetMock() {
  store = [];
  persist();
  console.log('[mockAnnotationApi] Store reset');
}

if (typeof window !== 'undefined') {
  window.__ANNOS__ = () => getAllAnnotations();
  window.__ANNORESET__ = () => resetMock();
  window.__ANNODEL__ = (id) => deleteAnnotation(id);
  window.__ANNOREPLACE__ = (arr) => replaceAllAnnotations(arr);
}