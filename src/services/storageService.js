const STORAGE_DB_NAME = "erp-cocina-storage";
const STORAGE_DB_VERSION = 1;
const STORAGE_STORE = "keyval";
const STORAGE_DB_MARKER = "__erp_indexeddb__:";
const LOCAL_STORAGE_SAFE_LIMIT = 180000;

function openStorageDb() {
  return new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) {
      reject(new Error("IndexedDB no disponible"));
      return;
    }
    const request = indexedDB.open(STORAGE_DB_NAME, STORAGE_DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORAGE_STORE)) db.createObjectStore(STORAGE_STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("No se pudo abrir IndexedDB"));
  });
}

async function idbGet(key) {
  const db = await openStorageDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORAGE_STORE, "readonly");
    const req = tx.objectStore(STORAGE_STORE).get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error("No se pudo leer IndexedDB"));
    tx.oncomplete = () => db.close();
    tx.onerror = () => db.close();
  });
}

async function idbSet(key, value) {
  const db = await openStorageDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORAGE_STORE, "readwrite");
    const req = tx.objectStore(STORAGE_STORE).put(value, key);
    req.onsuccess = () => resolve(true);
    req.onerror = () => reject(req.error || new Error("No se pudo guardar IndexedDB"));
    tx.oncomplete = () => db.close();
    tx.onerror = () => db.close();
  });
}

export async function loadKey(key, fallback) {
  try {
    const data = localStorage.getItem(key);
    if (data?.startsWith(STORAGE_DB_MARKER)) {
      const dbData = await idbGet(key);
      return dbData ? JSON.parse(dbData) : fallback;
    }
    if (data) return JSON.parse(data);
    const dbData = await idbGet(key).catch(() => null);
    return dbData ? JSON.parse(dbData) : fallback;
  } catch (e) {
    console.error("Error cargando", key, e);
    return fallback;
  }
}

export async function saveKey(key, value) {
  const serialized = JSON.stringify(value);
  try {
    if (serialized.length > LOCAL_STORAGE_SAFE_LIMIT) {
      await idbSet(key, serialized);
      localStorage.setItem(key, `${STORAGE_DB_MARKER}${key}`);
      return true;
    }
    localStorage.setItem(key, serialized);
    idbSet(key, serialized).catch(() => {});
    return true;
  } catch (e) {
    try {
      await idbSet(key, serialized);
      localStorage.removeItem(key);
      localStorage.setItem(key, `${STORAGE_DB_MARKER}${key}`);
      return true;
    } catch (dbError) {
      console.error("Error guardando", key, e, dbError);
      return false;
    }
  }
}
