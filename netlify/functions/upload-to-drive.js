const { google } = require('googleapis');
const { Readable } = require('stream');
 
async function findOrCreateFolder(drive, name, parentId) {
  const safeName = name.replace(/'/g, "\\'");
  const searchRes = await drive.files.list({
    q: `'${parentId}' in parents and name='${safeName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: 'files(id, name)',
  });
 
  if (searchRes.data.files.length > 0) return searchRes.data.files[0].id;
 
  const folderRes = await drive.files.create({
    resource: {
      name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentId],
    },
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
 
    const auth = new google.auth.JWT(
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      null,
      (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
      ['https://www.googleapis.com/auth/drive']
    );
 
    const drive = google.drive({ version: 'v3', auth });
    const rootId = process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID;
 
    // Carpeta de la O.S. (ej. "OS-211 FOTOCOAGULADOR LASER")
    const osFolderId = await findOrCreateFolder(drive, osFolderName, rootId);
 
    // Subcarpeta de etapa (Antes/Durante/Final) solo para fotos; el PDF va directo en la carpeta de la O.S.
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
 