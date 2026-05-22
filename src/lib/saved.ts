const STORAGE_KEY = 'hax-saved';
const CURRENT_VERSION = 1;

interface SavedItem {
  experimentId: string;
  savedAt: string;
}

interface SavedData {
  version: number;
  items: SavedItem[];
}

function getStore(): SavedData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { version: CURRENT_VERSION, items: [] };
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== CURRENT_VERSION || !Array.isArray(parsed.items)) {
      return { version: CURRENT_VERSION, items: [] };
    }
    return parsed;
  } catch {
    return { version: CURRENT_VERSION, items: [] };
  }
}

function setStore(data: SavedData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage full or unavailable
  }
}

export function getSaved(): SavedItem[] {
  return getStore().items;
}

export function isSaved(experimentId: string): boolean {
  return getStore().items.some((item) => item.experimentId === experimentId);
}

export function saveExperiment(experimentId: string): void {
  const store = getStore();
  if (store.items.some((item) => item.experimentId === experimentId)) return;
  store.items.push({ experimentId, savedAt: new Date().toISOString() });
  setStore(store);
}

export function removeExperiment(experimentId: string): void {
  const store = getStore();
  store.items = store.items.filter((item) => item.experimentId !== experimentId);
  setStore(store);
}

export function clearAll(): void {
  setStore({ version: CURRENT_VERSION, items: [] });
}

export function isLocalStorageAvailable(): boolean {
  try {
    const key = '__hax_test__';
    localStorage.setItem(key, '1');
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}
