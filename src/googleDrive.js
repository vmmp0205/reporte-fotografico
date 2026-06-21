// ── Subida centralizada a Google Drive vía cuenta de servicio (Netlify Function) ──
const UPLOAD_ENDPOINT = "/.netlify/functions/upload-to-drive";
 
function base64FromDataUrl(dataUrl) {
  return dataUrl.split(",")[1];
}
 
function mimeFromDataUrl(dataUrl) {
  return dataUrl.split(";")[0].split(":")[1];
}
 
async function uploadFile({ fileName, dataUrl, osFolderName, subFolder }) {
  const res = await fetch(UPLOAD_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fileName,
      fileData: base64FromDataUrl(dataUrl),
      mimeType: mimeFromDataUrl(dataUrl),
      osFolderName,
      subFolder: subFolder || null,
    }),
  });
 
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Error subiendo ${fileName}`);
  }
  return res.json();
}
 
// ── Función principal: sube fotos + PDF del reporte completo ─────────────────
export async function uploadReporteToDrive(reporte, onProgress) {
  const { os, ingeniero, photos, pdfDataUrl, folio } = reporte;
 
  const osFolderName = `OS-${os.os} ${os.equipo}`;
  const etapas = ["Antes", "Durante", "Final"];
  const etapaKeys = ["antes", "durante", "final"];
 
  const totalFotos = Object.values(photos).flat().filter(Boolean).length;
  const total = totalFotos + (pdfDataUrl ? 1 : 0);
  let uploaded = 0;
 
  onProgress?.({ message: "Subiendo fotos a Drive...", percent: 0 });
 
  for (let i = 0; i < etapaKeys.length; i++) {
    const key = etapaKeys[i];
    const etapaLabel = etapas[i];
    const etapaPhotos = photos[key] || [];
 
    for (let j = 0; j < etapaPhotos.length; j++) {
      const photo = etapaPhotos[j];
      if (!photo) continue;
 
      uploaded++;
      onProgress?.({
        message: `Subiendo foto ${uploaded}/${total} — ${etapaLabel}`,
        percent: Math.round((uploaded / total) * 100),
      });
 
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const fileName = `${etapaLabel}_${j + 1}_${ingeniero}_${timestamp}.jpg`;
      await uploadFile({ fileName, dataUrl: photo.data, osFolderName, subFolder: etapaLabel });
    }
  }
 
  if (pdfDataUrl) {
    uploaded++;
    onProgress?.({ message: "Subiendo reporte PDF...", percent: Math.round((uploaded / total) * 100) });
    const fileName = `Reporte_${folio}.pdf`;
    await uploadFile({ fileName, dataUrl: pdfDataUrl, osFolderName, subFolder: null });
  }
 
  onProgress?.({ message: "¡Reporte subido a Google Drive!", percent: 100 });
  return { success: true, folderName: osFolderName };
}
 