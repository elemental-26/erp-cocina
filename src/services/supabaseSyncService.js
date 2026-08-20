const ERP_SYNC_KEYS = [
  "qc_config",
  "qc_areas",
  "qc_epp",
  "qc_personas",
  "qc_usuarios",
  "qc_inspecciones",
  "qc_hallazgos",
  "qc_desviaciones",
  "hr_colaboradores",
  "hr_evaluaciones",
  "hr_planes_mejora",
  "hr_capacitaciones",
  "hr_certificaciones",
  "std_familias",
  "std_insumos",
  "std_recetas",
  "std_preparaciones",
  "std_mermas",
  "std_requisiciones",
];

const SESSION_KEY = "erp_supabase_session";

function cleanUrl(url) {
  return String(url || "").trim().replace(/\/+$/, "");
}

export function isCloudConfigReady(config) {
  const cloud = config?.cloudSync || {};
  return Boolean(cloud.enabled && cleanUrl(cloud.url) && cloud.anonKey && cloud.workspaceId);
}

export function getCloudSession() {
  try {
    const data = localStorage.getItem(SESSION_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function clearCloudSession() {
  localStorage.removeItem(SESSION_KEY);
}

async function supabaseRequest(config, path, { method = "GET", body, token, prefer } = {}) {
  const cloud = config?.cloudSync || {};
  const url = `${cleanUrl(cloud.url)}${path}`;
  const headers = {
    apikey: cloud.anonKey,
    "Content-Type": "application/json",
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (prefer) headers.Prefer = prefer;
  const response = await fetch(url, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `Supabase respondió ${response.status}`);
  }
  if (response.status === 204) return null;
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

export async function signInCloud(config, email, password) {
  const result = await supabaseRequest(config, "/auth/v1/token?grant_type=password", {
    method: "POST",
    body: { email, password },
  });
  const session = {
    access_token: result.access_token,
    refresh_token: result.refresh_token,
    expires_at: Date.now() + Number(result.expires_in || 3600) * 1000,
    user: result.user,
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export async function pullCloudRecords(config) {
  const session = getCloudSession();
  if (!isCloudConfigReady(config) || !session?.access_token) return {};
  const workspaceId = config.cloudSync.workspaceId;
  const rows = await supabaseRequest(
    config,
    `/rest/v1/erp_records?workspace_id=eq.${encodeURIComponent(workspaceId)}&select=key,value,updated_at`,
    { token: session.access_token },
  );
  return (rows || []).reduce((acc, row) => ({ ...acc, [row.key]: row.value }), {});
}

export async function pushCloudRecord(config, key, value) {
  const session = getCloudSession();
  if (!ERP_SYNC_KEYS.includes(key) || !isCloudConfigReady(config) || !session?.access_token) return false;
  await supabaseRequest(config, "/rest/v1/erp_records", {
    method: "POST",
    token: session.access_token,
    prefer: "resolution=merge-duplicates,return=minimal",
    body: {
      workspace_id: config.cloudSync.workspaceId,
      key,
      value,
      updated_by: session.user?.id || null,
      updated_at: new Date().toISOString(),
    },
  });
  return true;
}

export async function pushCloudSnapshot(config, records) {
  const session = getCloudSession();
  if (!isCloudConfigReady(config) || !session?.access_token) return false;
  const payload = Object.entries(records || {})
    .filter(([key]) => ERP_SYNC_KEYS.includes(key))
    .map(([key, value]) => ({
      workspace_id: config.cloudSync.workspaceId,
      key,
      value,
      updated_by: session.user?.id || null,
      updated_at: new Date().toISOString(),
    }));
  if (!payload.length) return false;
  await supabaseRequest(config, "/rest/v1/erp_records", {
    method: "POST",
    token: session.access_token,
    prefer: "resolution=merge-duplicates,return=minimal",
    body: payload,
  });
  return true;
}

export { ERP_SYNC_KEYS };
