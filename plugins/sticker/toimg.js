import sharp from 'sharp'

let handler = async (m, { conn, usedPrefix, command }) => {
  if (!m.quoted) {
    return m.reply(
      `ꕥ 𝖢𝖮𝖭𝖵𝖤𝖱𝖲𝖨𝖮𝖭 𝖠 𝖨𝖬𝖠𝖦𝖤𝖭 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
      `      𓈒 ◌ㅤ──    *𝖬𝖮𝖣𝖮 𝖣𝖤 𝖴𝖲𝖮*\n` +
      `      • Uso :: Responde a un sticker con:\n` +
      `        \`${usedPrefix + command}\`\n\n` +
      `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    )
  }

  let q = m.quoted
  let mime = q.mimetype || ''

  if (!/image\/webp/.test(mime)) {
    return m.reply(
      `ꕥ 𝖠𝖱𝖢𝖧𝖨𝖵𝖮 𝖨𝖭𝖵𝖠𝖫𝖨𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
      `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « El archivo seleccionado no es un sticker válido. »\n\n` +
      `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    )
  }

  await m.react('🕕')

  try {
    let media = await q.download()

    let img = await sharp(media)
      .png({ quality: 100 })
      .toBuffer()

    let caption = 
      `ꕥ 𝖢𝖮𝖭𝖵𝖤𝖱𝖲𝖨𝖮𝖭 𝖢𝖮𝖬𝖯𝖫𝖤𝖳𝖠 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
      `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « ¡Tu sticker ha sido convertido a imagen exitosamente! »\n\n` +
      `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`

    await conn.sendFile(
      m.chat,
      img,
      'image.png',
      caption,
      m
    )
    await m.react('✅')

  } catch (e) {
    console.error(e)
    await m.react('❌')
    return m.reply(
      `ꕥ 𝖤𝖱𝖱𝖮𝖱 𝖣𝖤𝖫 𝖲𝖨𝖲𝖳𝖤𝖬𝖠 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
      `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Ocurrió un error al convertir el sticker a imagen. »\n\n` +
      `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    )
  }
}

handler.help = ['toimg']
handler.tags = ['sticker']
handler.command = ['toimg', 'toimage']

handler.register = true
handler.limit = true

export default handler
