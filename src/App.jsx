import { useState, useRef, useCallback, useEffect } from "react";
import { saveReporte, getAllReportes } from "./db";
import { useOnlineSync } from "./useOnlineSync";

// ── Data from real Excel ──────────────────────────────────────────────────────
const ORDENES = [
  { os: "211", equipo: "FOTOCOAGULADOR LASER", marca: "CARL ZEISS", modelo: "VISULAS 532s", serie: "865670 / 807816", area: "OFTALMOLOGIA" },
  { os: "212", equipo: "LAMPARA DE HENDIDURA", marca: "HAAG-STREIT BERN", modelo: "900 B90034818", serie: "S/N", area: "OFTALMOLOGIA" },
  { os: "213", equipo: "LAMPARA DE HENDIDURA", marca: "WOODLYNE", modelo: "YT2A", serie: "26042506", area: "OFTALMOLOGIA" },
  { os: "214", equipo: "LAMPARA DE HENDIDURA", marca: "NIDEK", modelo: "M-SL550", serie: "20061", area: "OFTALMOLOGIA" },
  { os: "215", equipo: "LAMPARA DE HENDIDURA", marca: "NIDEK", modelo: "M-SL550", serie: "S/N", area: "OFTALMOLOGIA" },
  { os: "216", equipo: "AUDIOMETRO PARA RECONOCIMIENTO", marca: "MADSEN", modelo: "MM602", serie: "39240", area: "AUDIOLOGIA" },
  { os: "217", equipo: "AUDIOMETRO PARA RECONOCIMIENTO", marca: "MADSEN", modelo: "MM602", serie: "32859", area: "AUDIOLOGIA" },
  { os: "218", equipo: "IMPEDANCIOMETRO AVANZADO", marca: "MADSEN", modelo: "ZODIAC 901", serie: "348230", area: "AUDIOLOGIA" },
  { os: "219", equipo: "ULTRASONIDO TERAPEUTICO", marca: "CHATTANOOGA", modelo: "INTELLECT MOBILE 2776", serie: "17106-41704", area: "MEDICINA FISICA" },
  { os: "220", equipo: "LASER TERAPEUTICO", marca: "CHATTANOOGA", modelo: "INTELLECT MOBILE C/DIODO", serie: "2750-4156", area: "MEDICINA FISICA" },
  { os: "221", equipo: "LASER TERAPUETICO", marca: "CHATTANOOGA", modelo: "2779 / 840", serie: "T6483-T4770", area: "MEDICINA FISICA" },
  { os: "222", equipo: "LASER TERAPUETICO", marca: "CHATTANOOGA", modelo: "840/2779", serie: "T6468-T4537", area: "MEDICINA FISICA" },
  { os: "223", equipo: "HIDROCOLADOR PARA COMPRESAS", marca: "CHATTANOOGA", modelo: "M-2", serie: "31945", area: "MEDICINA FISICA" },
  { os: "224", equipo: "COMPRESERO", marca: "CHATTANOOGA", modelo: "C-2", serie: "5660", area: "MEDICINA FISICA" },
  { os: "225", equipo: "COMPRESERO", marca: "CHATTANOOGA", modelo: "M-4", serie: "5906", area: "MEDICINA FISICA" },
  { os: "226", equipo: "COMPRESERO", marca: "CHATTANOOGA", modelo: "M-4", serie: "5903", area: "MEDICINA FISICA" },
  { os: "227", equipo: "COMPRESERO", marca: "CHATTANOOGA", modelo: "M-2", serie: "24326", area: "MEDICINA FISICA" },
  { os: "228", equipo: "TINA DE HUBBARD", marca: "WHITE HALL", modelo: "F-425-S", serie: "S/N", area: "MEDICINA FISICA" },
  { os: "229", equipo: "TINA DE REMOLINO CHICA MIEMBROS SUPERIORES", marca: "L.L.E ELECTRICCO", modelo: "500", serie: "83-53724", area: "MEDICINA FISICA" },
  { os: "230", equipo: "TINA DE REMOLINO GRANDE MIEMBROS INFERIORES", marca: "EQ. INTERFERENCIALES", modelo: "GRANDE W-L-90-M", serie: "S/N", area: "MEDICINA FISICA" },
  { os: "231", equipo: "CENTRIFUGA DE MESA PARA OCHO TUBOS", marca: "THERMO SCIENTIFIC", modelo: "—", serie: "41985478", area: "PATOLOGIA" },
  { os: "232", equipo: "DISPENSADOR DE PARAFINA", marca: "BOEKEL", modelo: "145600", serie: "163884931", area: "PATOLOGIA" },
  { os: "233", equipo: "DISPENSADOR DE PARAFINA", marca: "BOEKEL", modelo: "145600", serie: "163884932", area: "PATOLOGIA" },
  { os: "234", equipo: "DISPENSADOR DE PARAFINA", marca: "BOEKEL", modelo: "145600", serie: "163884935", area: "PATOLOGIA" },
  { os: "235", equipo: "DISPENSADOR DE PARAFINA", marca: "BOEKEL", modelo: "145600", serie: "163884952", area: "PATOLOGIA" },
  { os: "236", equipo: "MICROTOMO PARA CORTES EN PARAFINA", marca: "THERMO SCIENTIFIC", modelo: "HM340E", serie: "S16071150", area: "PATOLOGIA" },
  { os: "237", equipo: "MICROTOMO PARA CORTES EN PARAFINA", marca: "THERMO SCIENTIFIC", modelo: "HM340E", serie: "S16071153", area: "PATOLOGIA" },
  { os: "238", equipo: "MICROTOMO PARA CORTES EN PARAFINA", marca: "THERMO SCIENTIFIC", modelo: "HM340E", serie: "S16081412", area: "PATOLOGIA" },
  { os: "239", equipo: "MICROTOMO PARA CORTES EN PARAFINA", marca: "THERMO SCIENTIFIC", modelo: "HM340E", serie: "S16081413", area: "PATOLOGIA" },
  { os: "240", equipo: "MICROTOMO DE CONGELACION", marca: "THERMO SCIENTIFIC", modelo: "HM525 NX SISTEMA", serie: "S16089804", area: "PATOLOGIA" },
  { os: "241", equipo: "UNIDAD PARA INCLUIR TEJIDOS EN PARAFINA", marca: "THERMO SCIENTIFIC", modelo: "HISTOSTAR", serie: "HS5027A1607", area: "PATOLOGIA" },
  { os: "242", equipo: "UNIDAD PARA INCLUIR TEJIDOS EN PARAFINA", marca: "THERMO SCIENTIFIC", modelo: "HISTOSTAR", serie: "HS5028A1607", area: "PATOLOGIA" },
  { os: "243", equipo: "EQUIPO PARA TINCION DE TEJIDOS", marca: "THERMO SCIENTIFIC", modelo: "GEMINI AS", serie: "GT5025U1608", area: "PATOLOGIA" },
  { os: "244", equipo: "MICROSCOPIO PARA LABORATORIO", marca: "CARL ZEISS", modelo: "K7", serie: "04051054", area: "MICROSCOPIOS" },
  { os: "245", equipo: "MICROSCOPIO PARA LABORATORIO", marca: "CARL ZEISS", modelo: "K7", serie: "33663379", area: "MICROSCOPIOS" },
  { os: "246", equipo: "MICROSCOPIO PARA LABORATORIO", marca: "CARL ZEISS", modelo: "K5", serie: "4286038", area: "MICROSCOPIOS" },
  { os: "247", equipo: "MICROSCOPIO PARA LABORATORIO", marca: "CARL ZEISS", modelo: "K5", serie: "62903", area: "MICROSCOPIOS" },
  { os: "248", equipo: "MICROSCOPIO GRIS INVERTIDO", marca: "REICHERT AUSTRIA", modelo: "BIOVERT", serie: "353480", area: "MICROSCOPIOS" },
  { os: "249", equipo: "MICROSCOPIO NEGRO CON REGULADOR", marca: "BAUSCH & LOMB", modelo: "1661AD", serie: "105248", area: "MICROSCOPIOS" },
  { os: "250", equipo: "MICROSCOPIO PARA TRABAJO DE RUTINA", marca: "CARL ZEISS", modelo: "PRIMO STAR", serie: "3120002664", area: "MICROSCOPIOS" },
  { os: "251", equipo: "MICROSCOPIO PARA TRABAJO DE RUTINA", marca: "CARL ZEISS", modelo: "PRIMO STAR", serie: "3120002675", area: "MICROSCOPIOS" },
];

const ETAPAS = [
  { key: "antes",   label: "Antes",   color: "#F59E0B", desc: "Condiciones iniciales del equipo" },
  { key: "durante", label: "Durante", color: "#3B82F6", desc: "Desarrollo del mantenimiento" },
  { key: "final",   label: "Final",   color: "#10B981", desc: "Condiciones finales del equipo" },
];

const TIPOS_MANTENIMIENTO = ["Preventivo", "Correctivo"];

// ── Icons ─────────────────────────────────────────────────────────────────────
const Icon = ({ name, size = 20, color = "currentColor" }) => {
  const icons = {
    camera: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
    upload: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>,
    check: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
    trash: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>,
    back: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
    search: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    wifi_off: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="1" y1="1" x2="23" y2="23"/><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/><path d="M10.71 5.05A16 16 0 0 1 22.56 9"/><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>,
    report: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
    close: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  };
  return icons[name] || null;
};

// ── Placeholder images for simulation ────────────────────────────────────────
const PLACEHOLDER_COLORS = {
  antes:   ["#1a3a2a", "#1a2a3a"],
  durante: ["#1a1a3a", "#2a1a3a"],
  final:   ["#1a3a1a", "#2a3a1a"],
};

function makePlaceholderSVG(etapa, index) {
  const labels = { antes: "ANTES", durante: "DURANTE", final: "FINAL" };
  const colors = { antes: "#F59E0B", durante: "#3B82F6", final: "#10B981" };
  const bg = PLACEHOLDER_COLORS[etapa]?.[index] || "#1E293B";
  const accent = colors[etapa] || "#6B7280";
  const label = labels[etapa] || etapa.toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
    <rect width="400" height="300" fill="${bg}"/>
    <rect x="0" y="0" width="400" height="4" fill="${accent}"/>
    <circle cx="200" cy="120" r="40" fill="none" stroke="${accent}" stroke-width="2" opacity="0.4"/>
    <circle cx="200" cy="120" r="25" fill="${accent}" opacity="0.15"/>
    <text x="200" y="126" text-anchor="middle" font-family="monospace" font-size="14" fill="${accent}" opacity="0.9">📷</text>
    <text x="200" y="175" text-anchor="middle" font-family="monospace" font-size="13" font-weight="bold" fill="${accent}">${label} — Foto ${index + 1}</text>
    <text x="200" y="196" text-anchor="middle" font-family="monospace" font-size="10" fill="#475569">Simulación de captura</text>
  </svg>`;
  return "data:image/svg+xml;base64," + btoa(svg);
}

// ── Photo Slot ────────────────────────────────────────────────────────────────
function PhotoSlot({ index, etapa, photo, onCapture, onRemove }) {
  const cameraRef = useRef(); 
  const galleryRef = useRef();
  const [dragging, setDragging] = useState(false);
  const color = ETAPAS.find(e => e.key === etapa)?.color || "#6B7280";

  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (ev) => onCapture(ev.target.result, file.name);
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e) => handleFile(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleSimulate = () => {
    const data = makePlaceholderSVG(etapa, index);
    onCapture(data, `simulacion_${etapa}_${index + 1}.jpg`);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      style={{
        background: photo ? "#0F172A" : dragging ? `${color}15` : "#1E293B",
        borderRadius: 12,
        border: `2px ${dragging ? "solid" : photo ? "solid" : "dashed"} ${dragging ? color : photo ? color : "#334155"}`,
        overflow: "hidden",
        position: "relative",
        aspectRatio: "4/3",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.2s",
        boxShadow: dragging ? `0 0 0 3px ${color}40` : "none",
      }}
    >
      {photo ? (
        <>
          <img src={photo.data} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)" }} />
          <div style={{ position: "absolute", bottom: 8, left: 10, right: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "#fff", fontSize: 11, fontWeight: 600 }}>Foto {index + 1}</span>
            <button onClick={onRemove} style={{ background: "rgba(239,68,68,0.85)", border: "none", borderRadius: 6, padding: "3px 6px", cursor: "pointer", display: "flex", alignItems: "center" }}>
              <Icon name="trash" size={13} color="#fff" />
            </button>
          </div>
          <div style={{ position: "absolute", top: 8, right: 8, background: color, borderRadius: "50%", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="check" size={13} color="#fff" />
          </div>
        </>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: 12, width: "100%" }}>
          {dragging ? (
            <>
              <div style={{ background: `${color}20`, borderRadius: "50%", width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="upload" size={22} color={color} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color }}>Suelta aquí</span>
            </>
          ) : (
            <>
              <div style={{ background: "#0F172A", borderRadius: "50%", width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="camera" size={18} color={color} />
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, color: "#94A3B8" }}>Foto {index + 1}</span>
            <button onClick={() => cameraRef.current.click()} style={{ background: `${color}20`, border: `1px solid ${color}50`, borderRadius: 7, padding: "7px 10px", cursor: "pointer", color, fontSize: 11, fontWeight: 700, width: "90%" }}>
  📷 Tomar foto
</button>
<button onClick={() => galleryRef.current.click()} style={{ background: "#0F172A", border: `1px solid #334155`, borderRadius: 7, padding: "7px 10px", cursor: "pointer", color: "#94A3B8", fontSize: 11, fontWeight: 600, width: "90%" }}>
  🖼️ Subir de galería
</button>
            </>
          )}
        </div>
      )}
  <input ref={cameraRef} type="file" accept="image/*" capture="environment" onChange={handleInputChange} style={{ display: "none" }} />
<input ref={galleryRef} type="file" accept="image/*" onChange={handleInputChange} style={{ display: "none" }} />
    </div>
  );
}

// ── Progress Bar ──────────────────────────────────────────────────────────────
function ProgressBar({ photos }) {
  const total = 6;
  const done = Object.values(photos).flat().filter(Boolean).length;
  const pct = Math.round((done / total) * 100);
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ color: "#94A3B8", fontSize: 12, fontWeight: 600 }}>PROGRESO DE FOTOS</span>
        <span style={{ color: "#F1F5F9", fontSize: 12, fontWeight: 700 }}>{done}/{total}</span>
      </div>
      <div style={{ background: "#1E293B", borderRadius: 8, height: 8, overflow: "hidden" }}>
        <div style={{
          height: "100%",
          width: `${pct}%`,
          background: done === total ? "linear-gradient(90deg,#10B981,#059669)" : "linear-gradient(90deg,#3B82F6,#6366F1)",
          borderRadius: 8,
          transition: "width 0.4s ease",
        }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
        {ETAPAS.map(etapa => {
          const count = (photos[etapa.key] || []).filter(Boolean).length;
          return (
            <div key={etapa.key} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: count === 2 ? etapa.color : "#334155" }} />
              <span style={{ fontSize: 10, color: count === 2 ? etapa.color : "#475569", fontWeight: 600 }}>{etapa.label} {count}/2</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Report View ───────────────────────────────────────────────────────────────
function ReportView({ form, photos, os, onClose, onNuevoReporte }) {
  const now = new Date();
  const fecha = now.toLocaleDateString("es-MX", { day: "2-digit", month: "long", year: "numeric" });
  const hora = now.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });

  return (
    <div style={{ background: "#0F172A", minHeight: "100vh", padding: "0 0 40px 0" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg,#1E3A5F,#1E293B)", padding: "20px 20px 24px", borderBottom: "1px solid #1E293B" }}>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "#94A3B8", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, marginBottom: 16, padding: 0 }}>
          <Icon name="back" size={16} color="#94A3B8" />
          <span style={{ fontSize: 13 }}>Volver al reporte</span>
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <Icon name="report" size={20} color="#3B82F6" />
          <span style={{ color: "#3B82F6", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em" }}>VISTA PREVIA DEL REPORTE</span>
        </div>
        <h2 style={{ color: "#F1F5F9", fontSize: 20, fontWeight: 700, margin: 0 }}>O.S. {os.os}</h2>
        <p style={{ color: "#64748B", fontSize: 12, margin: "4px 0 0" }}>{fecha} · {hora}</p>
      </div>

      <div style={{ padding: "20px 16px 0" }}>
        {/* Info card */}
        <div style={{ background: "#1E293B", borderRadius: 12, padding: 16, marginBottom: 20, border: "1px solid #334155" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              ["Ingeniero", form.ingeniero],
              ["Tipo", form.tipo],
              ["O.S.", os.os],
              ["Área", os.area],
              ["Equipo", os.equipo],
              ["Marca/Modelo", `${os.marca} ${os.modelo}`],
              ["N° Serie", os.serie],
            ].map(([label, val]) => (
              <div key={label} style={{ gridColumn: label === "Equipo" || label === "Marca/Modelo" ? "1 / -1" : undefined }}>
                <div style={{ color: "#475569", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 2 }}>{label.toUpperCase()}</div>
                <div style={{ color: "#F1F5F9", fontSize: 13, fontWeight: 600 }}>{val || "—"}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Photos by stage */}
        {ETAPAS.map(etapa => {
          const etapaPhotos = (photos[etapa.key] || []).filter(Boolean);
          if (etapaPhotos.length === 0) return null;
          return (
            <div key={etapa.key} style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <div style={{ width: 3, height: 20, background: etapa.color, borderRadius: 2 }} />
                <span style={{ color: etapa.color, fontSize: 13, fontWeight: 700, letterSpacing: "0.06em" }}>FOTOS {etapa.label.toUpperCase()}</span>
                <span style={{ color: "#475569", fontSize: 11 }}>({etapaPhotos.length} foto{etapaPhotos.length !== 1 ? "s" : ""})</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {etapaPhotos.map((p, i) => (
                  <div key={i} style={{ borderRadius: 10, overflow: "hidden", border: `1px solid ${etapa.color}33` }}>
                    <img src={p.data} alt="" style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", display: "block" }} />
                  </div>
                ))}
              </div>
            </div>
          );
        })}

   <DriveSync form={form} photos={photos} os={os} onNuevoReporte={onNuevoReporte} />
      </div>
    </div>
  );
}

function DriveSync({ form, photos, os, onNuevoReporte }) {
  const [syncStatus, setSyncStatus] = useState("idle");
  const [syncMessage, setSyncMessage] = useState("");
  const [syncPercent, setSyncPercent] = useState(0);

  const handleSync = async () => {
    try {
      setSyncStatus("syncing");
      setSyncMessage("Conectando con Google...");
      setSyncPercent(0);
      const { initGoogleAuth, requestAccessToken, uploadReporteToDrive } = await import("./googleDrive.js");
      await initGoogleAuth();
      const auth = await requestAccessToken();
      if (!auth.success) throw new Error("No se pudo autenticar con Google");
      setSyncMessage("Autenticado. Subiendo fotos...");
      await uploadReporteToDrive(
        { os, ingeniero: form.ingeniero, tipo: form.tipo, photos },
        ({ message, percent }) => { setSyncMessage(message); if (percent) setSyncPercent(percent); }
      );
      setSyncStatus("done");
      setSyncMessage("¡Fotos subidas a Google Drive!");
    } catch (err) {
      setSyncStatus("error");
      setSyncMessage("Error: " + err.message);
    }
  };

  if (syncStatus === "idle") return (
    <button onClick={handleSync} style={{ display: "flex", width: "100%", padding: 15, background: "linear-gradient(135deg,#1a73e8,#1557b0)", color: "#fff", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 20 }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M19.35 10.04A7.49 7.49 0 0 0 12 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 0 0 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/></svg>
      Subir a Google Drive
    </button>
  );

  if (syncStatus === "syncing") return (
    <div style={{ background: "#1E3A5F30", border: "1px solid #2563EB40", borderRadius: 12, padding: 16, marginBottom: 20 }}>
      <div style={{ color: "#60A5FA", fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{syncMessage}</div>
      <div style={{ background: "#1E293B", borderRadius: 8, height: 6, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${syncPercent}%`, background: "linear-gradient(90deg,#3B82F6,#6366F1)", borderRadius: 8, transition: "width 0.3s" }} />
      </div>
      <div style={{ color: "#475569", fontSize: 11, marginTop: 6, textAlign: "right" }}>{syncPercent}%</div>
    </div>
  );

  if (syncStatus === "done") return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ background: "#10B98120", border: "1px solid #10B98140", borderRadius: 12, padding: 16, textAlign: "center", marginBottom: 12 }}>
        <div style={{ color: "#10B981", fontSize: 15, fontWeight: 700, marginBottom: 4 }}>✓ {syncMessage}</div>
        <div style={{ color: "#94A3B8", fontSize: 12 }}>Google Drive → Reportes IMSS → OS-{os.os}</div>
      </div>
      <button onClick={onNuevoReporte} style={{ display: "flex", width: "100%", padding: 15, background: "linear-gradient(135deg,#2563EB,#1D4ED8)", color: "#fff", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer", alignItems: "center", justifyContent: "center", gap: 8 }}>
        + Nuevo Reporte
      </button>
    </div>
  );

  return (
    <div style={{ background: "#EF444420", border: "1px solid #EF444440", borderRadius: 12, padding: 16, marginBottom: 20 }}>
      <div style={{ color: "#EF4444", fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{syncMessage}</div>
      <button onClick={() => setSyncStatus("idle")} style={{ background: "#EF444420", border: "1px solid #EF444440", borderRadius: 8, padding: "6px 12px", color: "#EF4444", cursor: "pointer", fontSize: 12 }}>Reintentar</button>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [step, setStep] = useState("form"); // form | fotos | preview
  const [form, setForm] = useState({ ingeniero: "", os: "", tipo: "" });
  const [photos, setPhotos] = useState({ antes: [null, null], durante: [null, null], final: [null, null] });
  const [osSearch, setOsSearch] = useState("");
  const [showOsList, setShowOsList] = useState(false);
  const [activeEtapa, setActiveEtapa] = useState("antes");
  const [isOffline] = useState(!navigator.onLine);

  const selectedOS = ORDENES.find(o => o.os === form.os);
  const totalPhotos = Object.values(photos).flat().filter(Boolean).length;
  const allDone = totalPhotos === 6;

  const filteredOS = ORDENES.filter(o =>
    o.os.includes(osSearch) ||
    o.equipo.toLowerCase().includes(osSearch.toLowerCase()) ||
    o.area.toLowerCase().includes(osSearch.toLowerCase())
  );

  const handleCapture = (etapa, index) => (data, name) => {
    setPhotos(prev => {
      const updated = [...prev[etapa]];
      updated[index] = { data, name, timestamp: new Date().toISOString() };
      return { ...prev, [etapa]: updated };
    });
  };

  const handleRemove = (etapa, index) => () => {
    setPhotos(prev => {
      const updated = [...prev[etapa]];
      updated[index] = null;
      return { ...prev, [etapa]: updated };
    });
  };

  const handleNuevoReporte = () => {
    setStep("form");
    setForm(f => ({ ...f, os: "", tipo: "" }));
    setPhotos({ antes: [null, null], durante: [null, null], final: [null, null] });
    setOsSearch("");
    setActiveEtapa("antes");
  };
  
  const formValid = form.ingeniero.trim() && form.os && form.tipo;

  // ── STYLES ──────────────────────────────────────────────────────────────────
  const S = {
    root: { background: "#0A0F1E", minHeight: "100vh", fontFamily: "'Inter', system-ui, sans-serif", color: "#F1F5F9", maxWidth: 430, margin: "0 auto" },
    header: { background: "linear-gradient(135deg, #0F2850 0%, #0A1628 100%)", padding: "20px 20px 28px", borderBottom: "1px solid #1E3A5F" },
    title: { fontSize: 22, fontWeight: 800, color: "#F1F5F9", margin: 0, letterSpacing: "-0.02em" },
    subtitle: { fontSize: 12, color: "#60A5FA", fontWeight: 600, letterSpacing: "0.1em", marginBottom: 6 },
    section: { padding: "20px 16px" },
    label: { display: "block", color: "#94A3B8", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 6 },
    input: { width: "100%", background: "#1E293B", border: "1.5px solid #334155", borderRadius: 10, padding: "12px 14px", color: "#F1F5F9", fontSize: 15, outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" },
    btn: { display: "block", width: "100%", padding: "15px", background: "linear-gradient(135deg,#2563EB,#1D4ED8)", color: "#fff", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer", letterSpacing: "0.02em" },
    btnDisabled: { opacity: 0.4, cursor: "not-allowed" },
    chip: (active, color) => ({
      padding: "8px 16px", borderRadius: 8, border: `1.5px solid ${active ? color : "#334155"}`,
      background: active ? `${color}20` : "#1E293B", color: active ? color : "#64748B",
      cursor: "pointer", fontSize: 13, fontWeight: 600, transition: "all 0.15s",
    }),
  };

  // ── PREVIEW ─────────────────────────────────────────────────────────────────
  if (step === "preview") {
    return (
      <div style={S.root}>
        <ReportView form={form} photos={photos} os={selectedOS} onClose={() => setStep("fotos")} onNuevoReporte={handleNuevoReporte} />
      </div>
    );
  }

  // ── FORM STEP ───────────────────────────────────────────────────────────────
  if (step === "form") {
    return (
      <div style={S.root}>
        {/* Header */}
        <div style={S.header}>
          {isOffline && (
            <div style={{ background: "#F59E0B20", border: "1px solid #F59E0B40", borderRadius: 8, padding: "8px 12px", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
              <Icon name="wifi_off" size={14} color="#F59E0B" />
              <span style={{ color: "#F59E0B", fontSize: 12, fontWeight: 600 }}>Modo sin conexión · Las fotos se sincronizarán al conectarte</span>
            </div>
          )}
          <div style={S.subtitle}>IMSS · UMAE PUEBLA</div>
          <h1 style={S.title}>Reporte Fotográfico</h1>
          <p style={{ color: "#475569", fontSize: 13, margin: "6px 0 0" }}>Mantenimiento preventivo y correctivo</p>
        </div>

        <div style={S.section}>
          {/* Ingeniero */}
          <div style={{ marginBottom: 18 }}>
            <label style={S.label}>NOMBRE DEL INGENIERO</label>
            <input
              style={S.input}
              placeholder="Escribe tu nombre completo"
              value={form.ingeniero}
              onChange={e => setForm(f => ({ ...f, ingeniero: e.target.value }))}
            />
          </div>

          {/* OS Selector */}
          <div style={{ marginBottom: 18, position: "relative" }}>
            <label style={S.label}>ORDEN DE SERVICIO</label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}>
                <Icon name="search" size={16} color="#475569" />
              </span>
              <input
                style={{ ...S.input, paddingLeft: 38 }}
                placeholder="Buscar por O.S., equipo o área..."
                value={selectedOS ? `OS ${selectedOS.os} — ${selectedOS.equipo}` : osSearch}
                onFocus={() => { setShowOsList(true); if (selectedOS) { setOsSearch(""); setForm(f => ({ ...f, os: "" })); } }}
                onChange={e => { setOsSearch(e.target.value); setShowOsList(true); }}
              />
              {form.os && (
                <button onClick={() => { setForm(f => ({ ...f, os: "" })); setOsSearch(""); }} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                  <Icon name="close" size={14} color="#64748B" />
                </button>
              )}
            </div>
            {showOsList && !form.os && (
              <div style={{ background: "#1E293B", border: "1.5px solid #334155", borderRadius: 10, marginTop: 4, maxHeight: 240, overflowY: "auto", position: "absolute", zIndex: 10, width: "100%", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}>
                {filteredOS.length === 0 ? (
                  <div style={{ padding: 16, color: "#475569", fontSize: 13, textAlign: "center" }}>Sin resultados</div>
                ) : filteredOS.map(o => (
                  <button key={o.os} onClick={() => { setForm(f => ({ ...f, os: o.os })); setShowOsList(false); setOsSearch(""); }}
                    style={{ display: "block", width: "100%", textAlign: "left", background: "none", border: "none", borderBottom: "1px solid #334155", padding: "10px 14px", cursor: "pointer", color: "#F1F5F9" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <span style={{ color: "#3B82F6", fontWeight: 700, fontSize: 13 }}>OS {o.os}</span>
                        <span style={{ color: "#64748B", fontSize: 11, marginLeft: 8 }}>{o.area}</span>
                      </div>
                    </div>
                    <div style={{ color: "#94A3B8", fontSize: 12, marginTop: 2 }}>{o.equipo}</div>
                    <div style={{ color: "#475569", fontSize: 11, marginTop: 1 }}>{o.marca} · {o.modelo}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selected OS card */}
          {selectedOS && (
            <div style={{ background: "#1E3A5F30", border: "1px solid #2563EB40", borderRadius: 10, padding: 12, marginBottom: 18 }}>
              <div style={{ color: "#60A5FA", fontSize: 11, fontWeight: 700, marginBottom: 6 }}>EQUIPO SELECCIONADO</div>
              <div style={{ color: "#F1F5F9", fontSize: 14, fontWeight: 600 }}>{selectedOS.equipo}</div>
              <div style={{ color: "#94A3B8", fontSize: 12, marginTop: 2 }}>{selectedOS.marca} {selectedOS.modelo}</div>
              <div style={{ color: "#64748B", fontSize: 11, marginTop: 2 }}>Serie: {selectedOS.serie} · {selectedOS.area}</div>
            </div>
          )}

          {/* Tipo mantenimiento */}
          <div style={{ marginBottom: 28 }}>
            <label style={S.label}>TIPO DE MANTENIMIENTO</label>
            <div style={{ display: "flex", gap: 10 }}>
              {TIPOS_MANTENIMIENTO.map(tipo => (
                <button key={tipo} onClick={() => setForm(f => ({ ...f, tipo }))} style={S.chip(form.tipo === tipo, form.tipo === tipo ? (tipo === "Preventivo" ? "#10B981" : "#F59E0B") : "#64748B")}>
                  {tipo}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setStep("fotos")}
            disabled={!formValid}
            style={{ ...S.btn, ...(formValid ? {} : S.btnDisabled) }}
          >
            Continuar a Fotografías →
          </button>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", padding: "12px 20px 30px", color: "#1E3A5F" }}>
          <span style={{ fontSize: 11 }}>Hospital de Especialidades CMN Manuel Ávila Camacho · Puebla</span>
        </div>
      </div>
    );
  }

  // ── FOTOS STEP ──────────────────────────────────────────────────────────────
  return (
    <div style={S.root}>
      {/* Header */}
      <div style={S.header}>
        <button onClick={() => setStep("form")} style={{ background: "none", border: "none", color: "#94A3B8", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, marginBottom: 14, padding: 0 }}>
          <Icon name="back" size={16} color="#94A3B8" />
          <span style={{ fontSize: 13 }}>Datos del servicio</span>
        </button>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={S.subtitle}>OS {selectedOS?.os} · {form.tipo}</div>
            <h1 style={{ ...S.title, fontSize: 18 }}>{selectedOS?.equipo}</h1>
            <p style={{ color: "#475569", fontSize: 12, margin: "4px 0 0" }}>{form.ingeniero}</p>
          </div>
          {allDone && (
            <div style={{ background: "#10B98120", border: "1px solid #10B98140", borderRadius: 8, padding: "6px 10px", display: "flex", alignItems: "center", gap: 4 }}>
              <Icon name="check" size={13} color="#10B981" />
              <span style={{ color: "#10B981", fontSize: 11, fontWeight: 700 }}>Completo</span>
            </div>
          )}
        </div>
      </div>

      <div style={S.section}>
        <ProgressBar photos={photos} />

        {/* Etapa tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {ETAPAS.map(etapa => {
            const count = (photos[etapa.key] || []).filter(Boolean).length;
            const active = activeEtapa === etapa.key;
            return (
              <button key={etapa.key} onClick={() => setActiveEtapa(etapa.key)}
                style={{ flex: 1, padding: "10px 4px", borderRadius: 10, border: `1.5px solid ${active ? etapa.color : "#1E293B"}`, background: active ? `${etapa.color}15` : "#1E293B", cursor: "pointer", transition: "all 0.15s" }}>
                <div style={{ color: active ? etapa.color : "#475569", fontSize: 12, fontWeight: 700 }}>{etapa.label}</div>
                <div style={{ color: count === 2 ? etapa.color : "#334155", fontSize: 10, marginTop: 2 }}>{count}/2</div>
              </button>
            );
          })}
        </div>

        {/* Current stage description */}
        {(() => {
          const etapa = ETAPAS.find(e => e.key === activeEtapa);
          return (
            <div style={{ background: `${etapa.color}10`, border: `1px solid ${etapa.color}30`, borderRadius: 10, padding: "10px 14px", marginBottom: 14 }}>
              <span style={{ color: etapa.color, fontSize: 12, fontWeight: 600 }}>{etapa.desc}</span>
            </div>
          );
        })()}

        {/* Photo grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
          {[0, 1].map(i => (
            <PhotoSlot
              key={i}
              index={i}
              etapa={activeEtapa}
              photo={photos[activeEtapa][i]}
              onCapture={handleCapture(activeEtapa, i)}
              onRemove={handleRemove(activeEtapa, i)}
            />
          ))}
        </div>

        {/* Navigation between stages */}
        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          {ETAPAS.findIndex(e => e.key === activeEtapa) > 0 && (
            <button onClick={() => setActiveEtapa(ETAPAS[ETAPAS.findIndex(e => e.key === activeEtapa) - 1].key)}
              style={{ flex: 1, padding: 12, background: "#1E293B", border: "1.5px solid #334155", borderRadius: 10, color: "#94A3B8", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
              ← Anterior
            </button>
          )}
          {ETAPAS.findIndex(e => e.key === activeEtapa) < ETAPAS.length - 1 && (
            <button onClick={() => setActiveEtapa(ETAPAS[ETAPAS.findIndex(e => e.key === activeEtapa) + 1].key)}
              style={{ flex: 1, padding: 12, background: "#1E293B", border: "1.5px solid #334155", borderRadius: 10, color: "#94A3B8", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
              Siguiente →
            </button>
          )}
        </div>

        {/* Ver reporte / Finalizar */}
        <button
          onClick={() => setStep("preview")}
          disabled={!allDone}
          style={{ ...S.btn, ...(allDone ? { background: "linear-gradient(135deg,#059669,#047857)" } : S.btnDisabled) }}
        >
          {allDone ? "Ver Reporte Completo →" : `Faltan ${6 - totalPhotos} foto${6 - totalPhotos !== 1 ? "s" : ""}`}
        </button>

        {totalPhotos > 0 && !allDone && (
          <button onClick={() => setStep("preview")}
            style={{ display: "block", width: "100%", padding: 12, marginTop: 10, background: "none", border: "1.5px solid #334155", borderRadius: 12, color: "#64748B", cursor: "pointer", fontSize: 13 }}>
            Vista previa parcial
          </button>
        )}
      </div>
    </div>
  );
}


