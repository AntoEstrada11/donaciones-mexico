export default defineEventHandler(async () => {
  const settings = await getPaymentSettings()
  return {
    spei: settings.speiManualEnabled,
    card: settings.cardEnabled && settings.credentials.mercadopago,
    paypal: settings.paypalEnabled && settings.credentials.paypal,
    mode: settings.mode,
  }
})
