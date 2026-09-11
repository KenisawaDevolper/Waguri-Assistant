const orders = {
  '3': { name: '3 Días Premium', price: '$ 1.500 ARS' },
  '7': { name: '7 Días Premium', price: '$ 3.500 ARS' },
  '30': { name: '30 Días Premium', price: '$ 8.000 ARS' },
  '60': { name: '60 Días Premium', price: '$ 14.000 ARS' },
  '90': { name: '90 Días Premium', price: '$ 18.000 ARS' },
  '365': { name: '365 Días Premium', price: '$ 50.000 ARS' },
  'G7': { name: '7 Días Bot en Grupo', price: '$ 1.200 ARS' },
  'G30': { name: '30 Días Bot en Grupo', price: '$ 3.000 ARS' },
  'G365': { name: '365 Días Bot en Grupo', price: '$ 35.000 ARS' }
}

let handler = async (m, { conn, text }) => {
  if (!text) {
    return m.reply(
      `ꕥ 𝖯𝖫𝖠𝖭𝖤𝖲 𝖯𝖱𝖤𝖬𝖨𝖴𝖬 𝖸 𝖦𝖱𝖴𝖯𝖮𝖲 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
      `      𓈒 ◌ㅤ──    *𝖯𝖠𝖰𝖴𝖤𝖳𝖤𝖲 𝖯𝖱𝖤𝖬𝖨𝖴𝖬*\n` +
      `      • 3 :: 3 Días Premium — $ 1.500 ARS\n` +
      `      • 7 :: 7 Días Premium — $ 3.500 ARS\n` +
      `      • 30 :: 30 Días Premium — $ 8.000 ARS\n` +
      `      • 60 :: 60 Días Premium — $ 14.000 ARS\n` +
      `      • 90 :: 90 Días Premium — $ 18.000 ARS\n` +
      `      • 365 :: 365 Días Premium — $ 50.000 ARS\n\n` +
      `      𓈒 ◌ㅤ──    *𝖠𝖫𝖰𝖴𝖨𝖫𝖤𝖱 𝖯𝖠𝖱𝖠 𝖦𝖱𝖴𝖯𝖮𝖲*\n` +
      `      • G7 :: 7 Días Bot en Grupo — $ 1.200 ARS\n` +
      `      • G30 :: 30 Días Bot en Grupo — $ 3.000 ARS\n` +
      `      • G365 :: 365 Días Bot en Grupo — $ 35.000 ARS\n\n` +
      `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Uso: *.sewa <código>* »\n` +
      `« Ejemplo: *.sewa 30* »\n\n` +
      `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    )
  }

  let code = text.trim().toUpperCase()

  if (!orders[code]) {
    return m.reply(
      `ꕥ El código ingresado no existe.\n\n` +
      `« Usa *.sewa* para consultar la lista de paquetes. »\n\n` +
      `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    )
  }

  let paket = orders[code]

  let orderMsg = 
    `ꕥ 𝖭𝖴𝖤𝖵𝖮 𝖯𝖤𝖣𝖨𝖣𝖮 𝖱𝖤𝖢𝖨𝖡𝖨𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
    `      • Cliente :: ${m.pushName}\n` +
    `      • Paquete :: ${paket.name}\n` +
    `      • Precio :: ${paket.price}\n` +
    `      • Fecha :: ${new Date().toLocaleString('es-AR')}\n\n` +
    `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`

  await m.reply(
    `ꕥ 𝖲𝖮𝖫𝖨𝖢𝖨𝖳𝖴𝖣 𝖢𝖱𝖤𝖠𝖣𝖠 𝖢𝖮𝖭 𝖤𝖷𝖨𝖳𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
    `      • Paquete :: ${paket.name}\n` +
    `      • Precio :: ${paket.price}\n\n` +
    `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « La solicitud ha sido enviada al Creador. Espera un momento su confirmación. »\n\n` +
    `¡Muchas gracias por tu preferencia!\n\n` +
    `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
  )

  let owner = Array.isArray(global.owner)
    ? global.owner[0]
    : global.owner

  owner = owner.toString().replace(/[^0-9]/g, '')

  await conn.sendMessage(owner + '@s.whatsapp.net', {
    text: orderMsg
  })
}

handler.help = ['sewa', 'premium']
handler.tags = ['main']
handler.command = /^(sewa|premium)$/i

export default handler
