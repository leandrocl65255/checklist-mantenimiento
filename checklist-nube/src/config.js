import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const CONFIG = {
  PORT: process.env.PORT || 3000,
  OUTPUT_DIR: process.env.OUTPUT_DIR || path.join(__dirname, '..', '..', 'output'),
  DEMO: (process.env.DEMO || 'true').toLowerCase() === 'true',
  TEMPLATE_PATH: path.join(__dirname, '..', '..', 'templates', '5V Mensual.xlsx')
};
