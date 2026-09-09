/** Umbrales PLD / SAT en UMA. No hay carga de documentos en esta fase. */

export const UMA = {
  dailyMxn: 117.31,
  windowMonths: 6,
  pldUnits: 1605,
  satReportUnits: 3210,
} as const

export type DonorComplianceStatus = 'rapid' | 'cfdi' | 'pld_pending' | 'sat_report'

export function mxnForUma(units: number) {
  return Math.round(UMA.dailyMxn * units * 100) / 100
}

export function pldThresholdMxn() {
  return mxnForUma(UMA.pldUnits)
}

export function satReportThresholdMxn() {
  return mxnForUma(UMA.satReportUnits)
}

export function classifyDonor(input: {
  wantsReceipt: boolean
  paidInWindowMxn: number
}): DonorComplianceStatus {
  if (input.paidInWindowMxn >= satReportThresholdMxn()) return 'sat_report'
  if (input.paidInWindowMxn >= pldThresholdMxn()) return 'pld_pending'
  if (input.wantsReceipt) return 'cfdi'
  return 'rapid'
}

export function umaWindowStart(now = new Date()) {
  const start = new Date(now)
  start.setMonth(start.getMonth() - UMA.windowMonths)
  return start
}
