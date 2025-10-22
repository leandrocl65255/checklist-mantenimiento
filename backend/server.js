import express from 'express';
import multer from 'multer';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

dotenv.config();

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());

app.post('/enviar-excel', upload.single('file'), async (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ message: 'No se recibió el archivo' });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_FROM,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_TO,
      subject: 'Checklist Mantenimiento',
      text: 'Se adjunta el archivo Excel con el checklist.',
      attachments: [
        {
          filename: 'checklist.xlsx',
          path: file.path
        }
      ]
    });

    fs.unlinkSync(file.path);
    res.json({ ok: true, message: '✅ Enviado correctamente' });

  } catch (err) {
    console.error('❌ Error al enviar correo:', err);
    res.status(500).json({ message: '❌ Error al enviar el correo' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Backend corriendo en puerto ${PORT}`);
});