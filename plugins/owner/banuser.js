let handler = async (m, { conn, text }) => {
    if (!text) throw 'ꕥ ¿A quién deseas banear? Proporciona el número y el motivo ( ᴗ͈ˬᴗ͈ ) 𓈒 ◌\n`Ejemplo: .banuser 6281234567890 spam`'
    let parts = text.split(' ')
    let phoneNumber = parts[0].replace(/[^0-9]/g, '')
    let reason = parts.slice(1).join(' ') || ''

    let who = phoneNumber + '@s.whatsapp.net'
    let users = global.db.data.users

    if (users[who]) {
        users[who].banned = true
        users[who].banReason = reason
        conn.reply(m.chat, `🚫 *ᴜsᴜᴀʀɪᴏ ʙᴀɴᴇᴀᴅᴏ* 𓈒 ◌\n\nꕥ Usuario: \`${phoneNumber}\`\n${reason ? 'ꕥ Motivo: ' + reason : 'ꕥ Sin motivo'} ( ᴗ͈ˬᴗ͈ )`, m)
    } else {
        throw 'ꕥ Usuario no encontrado ( ᴗ͈ˬᴗ͈ )'
    }
}

handler.help = ['ban']
handler.tags = ['owner']
handler.command = /^ban(user)?$/i
handler.rowner = true

export default handler
// ꕥ plugin legacy — estética Waguri aplicada
