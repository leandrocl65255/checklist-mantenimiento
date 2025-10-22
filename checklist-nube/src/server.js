import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import ExcelJS from 'exceljs';
import { fileURLToPath } from 'url';
import { CONFIG } from './config.js';
import mapping from './mapping.json' assert { type: 'json' };
import { enviarA_NetSuite } from './integrations/netsuite.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static frontend
app.use(express.static(path.join(__dirname, '..', 'public')));

// Multer for optional signature upload
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

app.get('/api/config', (req, res) => {
  res.json(mapping);
});

app.post('/api/submit', upload.single('firmaArchivo'), async (req, res) => {
  try {
    const body = req.body; // fields from form
    const checks = JSON.parse(body.checks || '[]'); // array of { label, value } value: 'OK'|'NO'|'NA'
    const firmaArchivo = req.file ? req.file.path : null;

    // Load template
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(CONFIG.TEMPLATE_PATH);

    // Sheet
    const sheetName = mapping.meta?.sheetName || workbook.worksheets[0].name;
    const ws = workbook.getWorksheet(sheetName);
    if (!ws) {
      return res.status(400).json({ error: `No se encontró la hoja '${sheetName}' en la plantilla.` });
    }

    // Helper to set cell value safely
    const setCell = (addr, value) => {
      if (!addr) return;
      const cell = ws.getCell(addr);
      cell.value = value;
    };

    // Meta
    setCell(mapping.meta?.dateCell, body.fecha || new Date());
    setCell(mapping.meta?.technicianCell, body.tecnico || '');
    setCell(mapping.meta?.observationsCell, body.observaciones || '');

    // Fields
    if (mapping.fields) {
      for (const [field, cellAddr] of Object.entries(mapping.fields)) {
        if (field === 'firma') continue; // handled below
        setCell(cellAddr, body[field] ?? '');
      }
    }

    // Checks
    if (Array.isArray(mapping.checks) && Array.isArray(checks)) {
      const valueByLabel = Object.fromEntries(checks.map(c => [c.label, c.value]));
      for (const item of mapping.checks) {
        const val = valueByLabel[item.label] || '';
        // Escribimos "OK / NO / N/A" (o el texto que venga)
        setCell(item.cell, val);
      }
    }

    // Insert signature image if provided
    if (firmaArchivo && mapping.fields?.firma) {
      const imageId = workbook.addImage({
        filename: firmaArchivo,
        extension: path.extname(firmaArchivo).replace('.', '') || 'png',
      });
      // Anclar imagen sobre la celda definida
      // Nota: ExcelJS no tiene "anclar a celda" exacto por dirección,
      // se hace por top/left/width/height o por rango.
      // Aquí usamos el rango de la misma celda (mismo inicio/fin).
      ws.addImage(imageId, {
        tl: { col: ws.getCell(mapping.fields.firma).col - 1, row: ws.getCell(mapping.fields.firma).row - 1 },
        ext: { width: 120, height: 40 } // ajusta tamaño de la firma
      });
    }

    // Save file
    if (!fs.existsSync(CONFIG.OUTPUT_DIR)) fs.mkdirSync(CONFIG.OUTPUT_DIR, { recursive: true });
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `Checklist_${(body.equipo || 'equipo')}_${timestamp}.xlsx`;
    const filepath = path.join(CONFIG.OUTPUT_DIR, filename);
    await workbook.xlsx.writeFile(filepath);

    // Optional: send to NetSuite
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

// Download route
app.get('/download/:name', async (req, res) => {
  const name = req.params.name;
  const filePath = path.join(CONFIG.OUTPUT_DIR, name);
  if (!fs.existsSync(filePath)) return res.status(404).send('Archivo no encontrado');
  res.download(filePath);
});

// Fallback to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.listen(CONFIG.PORT, () => {
  console.log(`Server listening on http://localhost:${CONFIG.PORT}`);
});
