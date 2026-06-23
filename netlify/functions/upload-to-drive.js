const { google } = require('googleapis');
const { Readable } = require('stream');
 
function getAuthClient() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_OAUTH_CLIENT_ID,
    process.env.GOOGLE_OAUTH_CLIENT_SECRET
  );
  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_OAUTH_REFRESH_TOKEN,
  });
  return oauth2Client;
}
 
async function findOrCreateFolder(drive, name, parentId = null) {
  const safeName = name.replace(/'/g, "\\'");
  const parentQuery = parentId ? `'${parentId}' in parents and ` : "'root' in parents and ";
  const searchRes = await drive.files.list({
    q: `${parentQuery}name='${safeName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: 'files(id, name)',
    spaces: 'drive',
  });
 
  if (searchRes.data.files.length > 0) return searchRes.data.files[0].id;
 
  const metadata = {
    name,
    mimeType: 'application/vnd.google-apps.folder',
    ...(parentId && { parents: [parentId] }),
  };
 
  const folderRes = await drive.files.create({
    resource: metadata,
    fields: 'id',
  });
  return folderRes.data.id;
}
 
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
 
  try {
    const { fileName, fileData, mimeType, osFolderName, subFolder } = JSON.parse(event.body);
 
    if (!fileName || !fileData || !mimeType || !osFolderName) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Faltan datos requeridos' }) };
    }
 
    const auth = getAuthClient();
    const drive = google.drive({ version: 'v3', auth });
 
    // Carpeta raíz creada por la app
    const rootFolderId = await findOrCreateFolder(drive, 'REPORTES FOTOGRÁFICOS');
 
    // Carpeta de la O.S. (ej. "OS-211 FOTOCOAGULADOR LASER")
    const osFolderId = await findOrCreateFolder(drive, osFolderName, rootFolderId);
 
    // Subcarpeta de etapa (Antes/Durante/Final) solo para fotos
    const targetFolderId = subFolder
      ? await findOrCreateFolder(drive, subFolder, osFolderId)
      : osFolderId;
 
    const buffer = Buffer.from(fileData, 'base64');
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);
 
    const uploadRes = await drive.files.create({
      resource: { name: fileName, parents: [targetFolderId] },
      media: { mimeType, body: stream },
      fields: 'id, webViewLink',
    });
 
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, fileId: uploadRes.data.id, link: uploadRes.data.webViewLink }),
    };
  } catch (err) {
    console.error('Error subiendo a Drive:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
 
