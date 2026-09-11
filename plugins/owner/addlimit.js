let handler = async (m, { conn, text }) => {
  if (!text) throw `ꕥ 𝖠𝖣𝖣 𝖫𝖨𝖬𝖨𝖳 𓈒 ◌ ( ᴗ͈ˬᴗ͈ )\n\n> Formato:\n> \`.addlimit @user 1000\`\n> \`.addlimit 628xxxx 1000\` ✨`

  let users = global.db.data.users
  let args = text.trim().split(/\s+/)
  let jumlah = parseInt(args[1]) || 1000
  let who

  if (m.quoted) {
    who = m.quoted.sender
  } else if (m.mentionedJid && m.mentionedJid.length) {
    who = m.mentionedJid[0]
  } else if (args[0].match(/^\d{5,}$/)) {
    who = args[0].replace(/\D/g, '') + '@s.whatsapp.net'
  }

  if (!who) throw 'ꕥ Menciona, responde o ingresa el número del usuario ( ᴗ͈ˬᴗ͈ ) 🌸'

  if (!users[who]) users[who] = { limit: 0 }
  users[who].limit += jumlah

  conn.reply(
    m.chat,
    `ꕥ 𝖫𝖨𝖬𝖨𝖳 𝖠𝖭̃𝖠𝖣𝖨𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n      𓈒 ◌ㅤ──    *𝖨𝖭𝖥𝖮𝖱𝖬𝖠𝖢𝖨𝖮𝖭*\n      • Usuario :: @${who.split('@')[0]}\n      • Añadido :: +${jumlah} ✨\n\n> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`,
    m,
    { mentions: [who] }
  )
}

handler.help = ['addlimit @user <jumlah>', 'addlimit nomor <jumlah>']
handler.tags = ['owner']
handler.command = /^addlimit(user)?$/i
handler.rowner = true

export default handler