export async function loadKey(key, fallback) {
  try {
    const data = localStorage.getItem(key);

    if (!data) {
      return fallback;
    }

    return JSON.parse(data);
  } catch (e) {
    console.error("Error cargando", key, e);
    return fallback;
  }
}

export async function saveKey(key, value) {
  try {
    localStorage.setItem(
      key,
      JSON.stringify(value)
    );

    return true;
  } catch (e) {
    console.error("Error guardando", key, e);
    return false;
  }
}