import nodemailer from 'nodemailer';
import { CONFIG } from './config.js';

export async function enviarCorreoChecklist(filename, filepath, datos) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const to = process.env.MAIL_TO || process.env.SMTP_USER;
    const subject = `Checklist completado - ${datos.equipo || 'Equipo'}`;
    const text = `Checklist generado por ${datos.tecnico || 'técnico'} el ${datos.fecha || new Date().toLocaleDateString()}`;

    const mailOptions = {
      from: process.env.SMTP_USER,
      to,
      subject,
      text,
      attachments: [{ filename, path: filepath }]
    };

    await transporter.sendMail(mailOptions);
    console.log(`📨 Correo enviado a ${to}`);
  } catch (err) {
    console.error('❌ Error al enviar correo:', err);
    throw err;
  }
}
