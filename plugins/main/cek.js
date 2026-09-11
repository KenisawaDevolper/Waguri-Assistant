let handler = async (m, { conn }) => {
  let chat = global.db.data.chats[m.chat]
  if (!chat || !chat.expired || chat.expired < 1) {
    return m.reply(
      `ꕥ 𝖲𝖨𝖭 𝖤𝖷𝖯𝖨𝖱𝖠𝖢𝖨𝖮𝖭 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
      `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Este grupo no tiene un tiempo de expiración o alquiler configurado. »\n\n` +
      `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    )
  }

  let now = Date.now()
  let sisa = chat.expired - now

  if (sisa <= 0) {
    return m.reply(
      `ꕥ 𝖳𝖨𝖤𝖬𝖯𝖮 𝖠𝖦𝖮𝖳𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
      `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « El período de alquiler para este grupo ha finalizado. »\n\n` +
      `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    )
  }

  m.reply(
    `ꕥ 𝖳𝖨𝖤𝖬𝖯𝖮 𝖱𝖤𝖲𝖳𝖠𝖭𝖳𝖤 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
    `      𓈒 ◌ㅤ──    *𝖤𝖷𝖯𝖨𝖱𝖠𝖢𝖨𝖮𝖭 𝖣𝖤𝖫 𝖦𝖱𝖴𝖯𝖮*\n` +
    `${msToDate(sisa)}\n\n` +
    `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
  )
}

handler.help = ['cekexpired', 'ceksewa']
handler.tags = ['group']
handler.command = /^(cekexpired|ceksewa)$/i
handler.group = true

export default handler

function msToDate(ms) {
  let days = Math.floor(ms / (24 * 60 * 60 * 1000))
  let hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
  let minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000))

  return `      • Días :: ${days}\n` +
         `      • Horas :: ${hours}\n` +
         `      • Minutos :: ${minutes}`
}
