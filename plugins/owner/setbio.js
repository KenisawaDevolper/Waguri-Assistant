let handler = async (m, { conn, text }) => {
  if (!text) throw `Ingresa el texto para la nueva bio del bot ✨`
    try {
   await conn.updateProfileStatus(text).catch(_ => _)
   conn.reply(m.chat, 'Bio del bot actualizada con éxito ✨', m)
} catch {
      throw 'Yah Error.. :D'
    }
}
handler.help = ['setbio']
handler.tags = ['owner']
handler.command = /^(setbio)$/i
handler.owner = true

export default handler