let handler = async (m, { conn }) => {
  try {
    let res = await conn.newsletterSubscribed()

    if (!res || !res.length) {
      return m.reply(
        `ꕥ 𝖢𝖠𝖭𝖠𝖫𝖤𝖲 𝖭𝖮 𝖤𝖭𝖢𝖮𝖭𝖳𝖱𝖠𝖣𝖮𝖲 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Parece que aún no estás siguiendo ningún canal. »\n\n` +
        `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
      )
    }

    let teks = `ꕥ 𝖢𝖠𝖭𝖠𝖫𝖤𝖲 𝖲𝖴𝖲𝖢𝖱𝖨𝖳𝖮𝖲 (${res.length}) ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
               `      𓈒 ◌ㅤ──    *𝖫𝖨𝖲𝖳𝖠 𝖣𝖤 𝖢𝖠𝖭𝖠𝖫𝖤𝖲*\n`

    for (let ch of res) {
      let id = ch.id

      let name =
        ch.name?.text ||
        ch.thread_metadata?.name?.text ||
        ch.name ||
        ch.thread_metadata?.name ||
        'Canal Desconocido'

      if (typeof name === 'object') name = 'Canal Desconocido'

      teks += `      • Nombre :: ${name}\n`
      teks += `      • ID :: ${id}\n\n`
    }

    teks += `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`

    m.reply(teks)
  } catch (e) {
    m.reply(
      `ꕥ 𝖤𝖱𝖱𝖮𝖱 𝖣𝖤𝖫 𝖲𝖨𝖲𝖳𝖤𝖬𝖠 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
      `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Ocurrió un error al intentar consultar la lista de canales. »\n\n` +
      `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    )
  }
}

handler.help = ['listch']
handler.tags = ['owner']
handler.command = /^listch$/i
handler.owner = true

export default handler
