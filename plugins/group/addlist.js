let handler = async (m, { text, command }) => {
  if (!m.isGroup) throw 'Fitur ini hanya untuk grup!'

  let chat = global.db.data.chats[m.chat] || (global.db.data.chats[m.chat] = {})
  chat.list = chat.list || []

  if (command === 'addlist') {
    if (!text) throw 'Contoh:\n.addlist anu'
    chat.list.push(text)
    return m.reply(`✅ Berhasil ditambahkan ke list\n📌 Total: ${chat.list.length}`)
  }

  if (command === 'list') {
    if (!chat.list.length) throw 'List masih kosong'
    let teks = chat.list.map((v, i) => `${i+1}. ${v}`).join('\n')
    return m.reply(teks)
  }

  if (command === 'dellist') {
    if (!text) throw 'Contoh:\n.dellist 1'
    let no = parseInt(text)
    if (isNaN(no) || no < 1 || no > chat.list.length) throw 'Nomor tidak valid'
    let removed = chat.list.splice(no - 1, 1)
    return m.reply(`🗑️ Berhasil hapus:\n${removed[0]}`)
  }
}

handler.help = ['addlist','list','dellist']
handler.tags = ['group']
handler.command = /^(addlist|list|dellist)$/i
handler.admin = true
handler.group = true

export default handler