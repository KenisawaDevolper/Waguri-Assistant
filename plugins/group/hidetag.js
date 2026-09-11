import { generateWAMessageFromContent } from 'ourin'

let handler = async (m, { conn, text, participants, usedPrefix, command }) => {
    const hasQuoted = !!m.quoted
    const rawText = (text || '').trim()
    const cleanText = rawText.replace(/^\(([\s\S]*)\)$/, '$1').trim()

    if (!hasQuoted && !cleanText) {
        return m.reply(`Masukan text atau Reply pesan! \n\nContoh: \n${usedPrefix + command} (Selamat Pagi)`)
    }

    const users = participants.map(u => conn.decodeJid(u.id))
    let messageContent

    if (hasQuoted) {
        const q = m.quoted
        const serialized = typeof q.toJSON === 'function' ? q.toJSON() : (q.msg || q)
        messageContent = {
            [q.mtype || 'extendedTextMessage']: serialized
        }
    } else {
        messageContent = {
            extendedTextMessage: {
                text: cleanText
            }
        }
    }

    const msg = conn.cMod(
        m.chat,
        generateWAMessageFromContent(m.chat, messageContent, {
            quoted: m,
            userJid: conn.user.id
        }),
        cleanText || m.quoted?.text || '',
        conn.user.jid,
        { mentions: users }
    )

    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
}

handler.help = ['hidetag']
handler.tags = ['group']
handler.command = /^(hidetag|ht)$/i

handler.group = true
handler.admin = true

export default handler
