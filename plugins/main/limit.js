let handler = async (m, { conn, isOwner, isPrems }) => {
  let who = m.isGroup ? (m.mentionedJid?.[0] || m.sender) : m.sender
  const user = global.db.data.users[who]

  if (!user) {
    return m.reply(
      `ꕥ 𝖴𝖲𝖴𝖠𝖱𝖨𝖮 𝖭𝖮 𝖤𝖭𝖢𝖮𝖭𝖳𝖱𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
      `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « El usuario especificado no se encuentra registrado en la base de datos. »\n\n` +
      `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    )
  }

  const name = user.registered ? user.name : await conn.getName(who)
  const limitNow = user.limit || 0
  const status = isOwner
    ? 'Creador'
    : isPrems
      ? 'Usuario Premium'
      : user.level > 999
        ? 'Usuario Élite'
        : 'Usuario Gratuito'

  return m.reply(
    `ꕥ 𝖯𝖤𝖱𝖥𝖨𝖫 𝖣𝖤 𝖴𝖲𝖴𝖠𝖱𝖨𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
    `      • Nombre :: *${name}*\n` +
    `      • Estado :: *${status}*\n` +
    `      • Límite :: *${isPrems ? 'Ilimitado' : limitNow}*\n\n` +
    `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
  )
}

handler.help = ['limit']
handler.tags = ['xp']
handler.command = /^(limit)$/i
handler.register = false

export default handler
