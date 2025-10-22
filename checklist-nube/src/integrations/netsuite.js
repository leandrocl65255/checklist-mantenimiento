// Futuro: integrar SuiteTalk REST / OAuth 2.0
export async function enviarA_NetSuite(payload, fileBuffer, filename) {
  // TODO: implementar llamada REST a NetSuite (custom record + adjunto)
  // Por ahora devolvemos mock.
  return { ok: true, message: 'Demo: no se envió a NetSuite todavía.' };
}
