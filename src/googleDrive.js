// ── Google Drive API Integration ─────────────────────────────────────────────
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

let tokenClient = null;
let accessToken = null;

// ── Cargar Google Identity Services ──────────────────────────────────────────
export function loadGoogleAPI() {
  return new Promise((resolve, reject) => {
    if (window.google) return resolve();
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// ── Inicializar cliente OAuth ─────────────────────────────────────────────────
export async function initGoogleAuth() {
  await loadGoogleAPI();
  return new Promise((resolve) => {
    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: (response) => {
        if (response.access_token) {
          accessToken = response.access_token;
          resolve({ success: true, token: accessToken });
        } else {
          resolve({ success: false, error: response });
        }
      },
    });
    resolve({ ready: true });
  });
}

// ── Solicitar token (abre popup de Google) ────────────────────────────────────
export function requestAccessToken() {
  return new Promise((resolve) => {
    if (!tokenClient) {
      resolve({ success: false, error: 'Cliente no inicializado' });
      return;
    }
    tokenClient.callback = (response) => {
      if (response.access_token) {
        accessToken = response.access_token;
        resolve({ success: true, token: accessToken });
      } else {
        resolve({ success: false, error: response });
      }
    };
    tokenClient.requestAccessToken({ prompt: 'consent' });
  });
}

export function getAccessToken() {
  return accessToken;
}

export function isAuthenticated() {
  return !!accessToken;
}

// ── Crear carpeta en Drive ────────────────────────────────────────────────────
async function createFolder(name, parentId = null) {
  const metadata = {
    name,
    mimeType: 'application/vnd.google-apps.folder',
    ...(parentId && { parents: [parentId] }),
  };

  const response = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(metadata),
  });

  if (!response.ok) throw new Error(`Error creando carpeta: ${response.statusText}`);
  const data = await response.json();
  return data.id;
}

// ── Buscar carpeta existente ──────────────────────────────────────────────────
async function findFolder(name, parentId = null) {
  const parentQuery = parentId ? ` and '${parentId}' in parents` : '';
  const query = `name='${name}' and mimeType='application/vnd.google-apps.folder' and trashed=false${parentQuery}`;

  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name)`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!response.ok) throw new Error(`Error buscando carpeta: ${response.statusText}`);
  const data = await response.json();
  return data.files.length > 0 ? data.files[0].id : null;
}

// ── Obtener o crear carpeta ───────────────────────────────────────────────────
async function getOrCreateFolder(name, parentId = null) {
  const existing = await findFolder(name, parentId);
  if (existing) return existing;
  return createFolder(name, parentId);
}

// ── Subir foto a Drive ────────────────────────────────────────────────────────
async function uploadPhoto(base64Data, fileName, folderId) {
  // Convertir base64 a blob
  const base64 = base64Data.split(',')[1];
  const mimeType = base64Data.split(';')[0].split(':')[1];
  const byteChars = atob(base64);
  const byteArray = new Uint8Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) {
    byteArray[i] = byteChars.charCodeAt(i);
  }
  const blob = new Blob([byteArray], { type: mimeType });

  const metadata = {
    name: fileName,
    parents: [folderId],
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', blob);

  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: form,
    }
  );

  if (!response.ok) throw new Error(`Error subiendo foto: ${response.statusText}`);
  return response.json();
}

// ── Función principal: subir reporte completo ─────────────────────────────────
export async function uploadReporteToDrive(reporte, onProgress) {
  const { os, ingeniero, tipo, photos } = reporte;

  onProgress?.({ step: 'carpetas', message: 'Creando estructura de carpetas...' });

  // Carpeta raíz: "Reportes IMSS"
  const rootId = await getOrCreateFolder('Reportes IMSS');

  // Carpeta de la O.S.: "OS-211 FOTOCOAGULADOR LASER"
  const osNombre = `OS-${os.os} ${os.equipo}`;
  const osFolderId = await getOrCreateFolder(osNombre, rootId);

  // Subcarpetas por etapa
  const etapas = ['Antes', 'Durante', 'Final'];
  const etapaKeys = ['antes', 'durante', 'final'];
  const etapaFolders = {};

  for (const etapa of etapas) {
    etapaFolders[etapa.toLowerCase()] = await getOrCreateFolder(etapa, osFolderId);
  }

  // Subir fotos
  let uploaded = 0;
  const total = Object.values(photos).flat().filter(Boolean).length;

  for (let i = 0; i < etapaKeys.length; i++) {
    const key = etapaKeys[i];
    const etapaLabel = etapas[i];
    const etapaPhotos = photos[key] || [];

    for (let j = 0; j < etapaPhotos.length; j++) {
      const photo = etapaPhotos[j];
      if (!photo) continue;

      uploaded++;
      onProgress?.({
        step: 'subiendo',
        message: `Subiendo foto ${uploaded}/${total} — ${etapaLabel}`,
        percent: Math.round((uploaded / total) * 100),
      });

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `${etapaLabel}_${j + 1}_${ingeniero}_${timestamp}.jpg`;
      await uploadPhoto(photo.data, fileName, etapaFolders[key]);
    }
  }

  onProgress?.({ step: 'completo', message: '¡Reporte sincronizado con Google Drive!', percent: 100 });

  return { success: true, folderName: osNombre };
}
