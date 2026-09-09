/**
 * Identidad del responsable y versionado del aviso de privacidad.
 * Requisitos de la LFPDPPP publicada en el DOF el 20/03/2025 (vigente 21/03/2025).
 */

export const LEGAL = {
  razonSocial: 'IGLESIA UNIVERSAL DEL REINO DE DIOS OFES, A.R.',
  /** TODO legal: domicilio fiscal completo. Es requisito del aviso integral y del simplificado. */
  domicilio: 'PENDIENTE DE CONFIRMAR — domicilio fiscal completo',
  /** TODO legal: confirmar buzón dedicado a solicitudes ARCO antes de publicar. */
  correoArco: 'donaciones@mx.universal.org',
  telefono: '55 86 64 51 01',
  /**
   * Se estampa en cada consentimiento guardado. Si cambia el texto del aviso,
   * sube esta versión para saber qué redacción aceptó cada persona.
   */
  noticeVersion: '2026-09-09',
  noticeDate: '9 de septiembre de 2026',
  /** Autoridad vigente tras la desaparición del INAI. */
  autoridad: 'Secretaría Anticorrupción y Buen Gobierno',
} as const

/** Plazos del procedimiento ARCO, en días hábiles. */
export const ARCO_DEADLINES = {
  respuesta: 20,
  prorroga: 20,
  ejecucion: 10,
} as const

/** Conservación por tipo de dato. Los fiscales quedan sujetos al CFF cuando se emitan CFDI. */
export const RETENTION = {
  cuentaActiva: 'Mientras la cuenta permanezca activa',
  trasCancelacion: 'Se elimina al cancelar la cuenta; las donaciones quedan sin vínculo al titular',
  datosFiscales: '5 años a partir de la emisión del comprobante (Art. 30 del Código Fiscal de la Federación)',
  consentimientos: '5 años como evidencia de que el consentimiento fue otorgado',
} as const
