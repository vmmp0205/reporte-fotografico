# Reportes Fotográficos IMSS
## App PWA para mantenimiento preventivo y correctivo

---

## 🚀 Despliegue en Netlify (paso a paso)

### Opción A — Sin terminal (solo navegador)

1. Crea una cuenta en [github.com](https://github.com) si no tienes
2. Crea un repositorio nuevo llamado `reporte-fotografico`
3. Sube todos estos archivos al repositorio
4. Ve a [netlify.com](https://netlify.com) → Log in with GitHub
5. "Add new site" → "Import an existing project" → GitHub
6. Selecciona tu repositorio
7. Netlify detecta automáticamente la configuración
8. Clic en "Deploy site" → en 2 minutos tendrás tu URL con HTTPS

### Opción B — Con terminal

```bash
# 1. Instalar dependencias
npm install

# 2. Probar localmente
npm run dev
# Abre http://localhost:5173

# 3. Construir para producción
npm run build

# 4. Subir a Netlify
# Arrastra la carpeta /dist a netlify.com/drop
```

---

## 📱 Instalar en teléfono

1. El ingeniero abre la URL en Chrome (Android) o Safari (iOS)
2. Chrome muestra banner: "Agregar a pantalla de inicio"
3. En Safari: botón compartir → "Añadir a pantalla de inicio"
4. La app se instala como nativa, sin App Store

---

## 🗂️ Estructura del proyecto

```
reporte-fotografico/
├── index.html              # Punto de entrada
├── netlify.toml            # Configuración de Netlify
├── vite.config.js          # Config de Vite + PWA
├── package.json            # Dependencias
└── src/
    ├── main.jsx            # Arranque de React
    ├── App.jsx             # App principal (UI completa)
    ├── db.js               # Almacenamiento offline (IndexedDB)
    └── useOnlineSync.js    # Hook de sincronización automática
```

---

## 🔜 Fase 2 — Integraciones pendientes

- [ ] Google Sheets API — leer O.S. en tiempo real
- [ ] Google Drive API — crear carpetas y subir fotos automáticamente
- [ ] GPS + timestamp en cada foto
- [ ] Generación de reporte PDF
- [ ] Dashboard del supervisor
- [ ] Firma digital del ingeniero

---

## 📋 Datos del proyecto

- **Hospital:** UMAE Puebla — CMN Manuel Ávila Camacho
- **Órdenes de servicio:** OS 211 a OS 251 (41 equipos)
- **Áreas:** Oftalmología, Audiología, Medicina Física, Patología, Microscopios
