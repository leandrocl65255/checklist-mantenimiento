import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import ExcelJS from 'exceljs';
import { fileURLToPath } from 'url';
import { CONFIG } from './config.js';
import { enviarA_NetSuite } from './integrations/netsuite.js';
import { enviarCorreoChecklist } from './mail.js'; // si aún no lo agregaste, puedes quitar esta línea

// === Corrección JSON (ya no usamos "assert") ===
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const mapping = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'mapping.json'), 'utf-8')
);

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Servir el frontend (HTML)
app.use(express.static(path.join(__dirname, '..', 'public')));

// Configuración de Multer (subida de firma)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dest = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname) || '.png';
    cb(null, 'firma_' + Date.now() + ext);
  }
});
const upload = multer({ storage });

// Endpoint para obtener configuración del checklist
app.get('/api/config', (req, res) => {
  res.json(mapping);
});

// Endpoint principal para procesar el checklist
app.post('/api/submit', upload.single('firmaArchivo'), async (req, res) => {
  try {
    const body = req.body;
    const checks = JSON.parse(body.checks || '[]');
    const firmaArchivo = req.file ? req.file.path : null;

    // Cargar plantilla Excel
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(CONFIG.TEMPLATE_PATH);

    const sheetName = mapping.meta?.sheetName || workbook.worksheets[0].name;
    const ws = workbook.getWorksheet(sheetName);
    if (!ws) {
      return res.status(400).json({ error: `No se encontró la hoja '${sheetName}' en la plantilla.` });
    }

    // Helper para escribir en celdas
    const setCell = (addr, value) => {
      if (!addr) return;
      const cell = ws.getCell(addr);
      cell.value = value;
    };

    // Campos meta
    setCell(mapping.meta?.dateCell, body.fecha || new Date());
    setCell(mapping.meta?.technicianCell, body.tecnico || '');
    setCell(mapping.meta?.observationsCell, body.observaciones || '');

    // Campos generales
    if (mapping.fields) {
      for (const [field, cellAddr] of Object.entries(mapping.fields)) {
        if (field === 'firma') continue;
        setCell(cellAddr, body[field] ?? '');
      }
    }

    // Checks
    if (Array.isArray(mapping.checks) && Array.isArray(checks)) {
      const valueByLabel = Object.fromEntries(checks.map(c => [c.label, c.value]));
      for (const item of mapping.checks) {
        const val = valueByLabel[item.label] || '';
        setCell(item.cell, val);
      }
    }

    // Firma (imagen)
    if (firmaArchivo && mapping.fields?.firma) {
      const imageId = workbook.addImage({
        filename: firmaArchivo,
        extension: path.extname(firmaArchivo).replace('.', '') || 'png',
      });
      ws.addImage(imageId, {
        tl: { col: ws.getCell(mapping.fields.firma).col - 1, row: ws.getCell(mapping.fields.firma).row - 1 },
        ext: { width: 120, height: 40 },
      });
    }

    // Guardar Excel generado
    if (!fs.existsSync(CONFIG.OUTPUT_DIR)) fs.mkdirSync(CONFIG.OUTPUT_DIR, { recursive: true });
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `Checklist_${(body.equipo || 'equipo')}_${timestamp}.xlsx`;
    const filepath = path.join(CONFIG.OUTPUT_DIR, filename);
    await workbook.xlsx.writeFile(filepath);

    // Envío de correo (opcional)
    if (process.env.SMTP_USER) {
      try {
        await enviarCorreoChecklist(filename, filepath, body);
      } catch (mailErr) {
        console.error('Error enviando correo:', mailErr);
      }
    }

    // Envío opcional a NetSuite
    let netsuiteResp = { ok: false, message: 'Sin integrar' };
    if (!CONFIG.DEMO) {
      const fileBuffer = await fs.promises.readFile(filepath);
      netsuiteResp = await enviarA_NetSuite(body, fileBuffer, filename);
    }

    res.json({
      ok: true,
      message: 'Checklist generado correctamente.',
      file: filename,
      downloadUrl: `/download/${encodeURIComponent(filename)}`,
      netsuite: netsuiteResp
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Descargar Excel generado
app.get('/download/:name', async (req, res) => {
  const name = req.params.name;
  const filePath = path.join(CONFIG.OUTPUT_DIR, name);
  if (!fs.existsSync(filePath)) return res.status(404).send('Archivo no encontrado');
  res.download(filePath);
});

// Fallback a index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.listen(CONFIG.PORT, () => {
  console.log(`✅ Servidor escuchando en http://localhost:${CONFIG.PORT}`);
});
