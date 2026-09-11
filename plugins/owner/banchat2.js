let handler = async (m, { text }) => {
  if (!text) return m.reply('Ingresa ID grup.\nEjemplo:\n.banchat2 1203630xxxxx@g.us')

  let id = text.trim()

  if (!id.endsWith('@g.us'))
    return m.reply('ID grup no valid.\nFormat: 12036xxxxx@g.us')

  if (!global.db.data.chats[id])
    global.db.data.chats[id] = {}

  global.db.data.chats[id].isBanned = true

  m.reply(`✅ Grupo berhasil dibanned:\n${id}`)
}

handler.help = ['banchat2']
handler.tags = ['owner']
handler.command = /^banchat2$/i
handler.owner = true
handler.limit = false

export default handler