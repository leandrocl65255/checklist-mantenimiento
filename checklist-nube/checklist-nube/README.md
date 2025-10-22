# Checklist de Mantenimiento → Excel (Node.js + ExcelJS) — listo para integrar con NetSuite

## Cómo correr
1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Crear `.env` a partir de `.env.example` (opcional). Por defecto usa `PORT=3000` y modo DEMO.
3. Ejecutar:
   ```bash
   npm run dev
   ```
4. Abrir en el navegador: http://localhost:3000

## Cómo mapear campos a celdas
Edita `src/mapping.json`:
- `meta.sheetName`: nombre exacto de la hoja en tu plantilla.
- `meta.dateCell`, `meta.technicianCell`, `meta.observationsCell`: celdas para fecha, técnico y observaciones.
- `fields`: mapea campos del formulario (ej: `equipo`, `ubicacion`, `responsable`, `turno`) a direcciones de celda (ej: `B4`, `F4`, ...).
- `checks`: lista de ítems con sus celdas; el formulario permite elegir `OK/NO/N/A` para cada uno y se escribe el valor en esa celda.

> **Tip:** abre tu plantilla en Excel, identifica las celdas de destino y actualiza `mapping.json`. No se pierde el formato.

## Firma
Puedes subir una imagen de firma y se insertará en la celda definida como `fields.firma`. Ajusta dimensiones en `src/server.js` (propiedad `ext: { width, height }`).

## NetSuite (futuro)
En `src/integrations/netsuite.js` queda el stub para SuiteTalk REST. Cuando tengas credenciales OAuth 2.0:
- Implementa `enviarA_NetSuite(payload, fileBuffer, filename)` para crear un *custom record* y adjuntar el Excel.
- Pon `DEMO=false` en `.env` para activar el envío.

## Exportación
Los archivos generados se guardan en `./output` y se pueden descargar desde el navegador tras enviar el formulario.
