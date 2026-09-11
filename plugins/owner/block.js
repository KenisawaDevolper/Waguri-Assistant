import config from '../../config.js'
import te from '../../src/lib/rimuru-error.js'
const pluginConfig = {
    name: ['block', 'blokir'],
    alias: [],
    category: 'owner',
    description: 'Bloquear número de WhatsApp',
    usage: '.block <número/responder/mencionar>',
    example: '.block 628xxx',
    isOwner: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    let targetJid = null

    if (m.mentionedJid?.length > 0) {
        targetJid = m.mentionedJid[0]
    } else if (m.quoted) {
        targetJid = m.quoted.sender || m.quoted.participant
    } else if (m.args[0]) {
        let num = m.args[0].replace(/[^0-9]/g, '')
        if (!num) return m.reply('❌ ꕥ Número no válido ( ᴗ͈ˬᴗ͈ )')
        targetJid = num + '@s.whatsapp.net'
    } else if (!m.isGroup) {
        targetJid = m.chat
    }

    if (!targetJid) {
        return m.reply(
            '⚠️ *ᴄóᴍᴏ ᴜsᴀʀ* 𓈒 ◌\n\n' +
            'ꕥ `.block 628xxx` — Bloquear por número\n' +
            'ꕥ `.block` (responder) — Bloquear al remitente\n' +
            'ꕥ `.block @mención` — Bloquear al mencionado\n' +
            'ꕥ `.block` (en chat privado) — Bloquear a este usuario ( ᴗ͈ˬᴗ͈ )'
        )
    }

    const botJid = sock.user?.id?.split(':')[0] + '@s.whatsapp.net'
    if (targetJid === botJid) {
        return m.reply('❌ ꕥ No puedes bloquear el número del bot ( ᴗ͈ˬᴗ͈ )')
    }

    try {
        await sock.updateBlockStatus(targetJid, 'block')
        await m.react('🚫')
        return m.reply(
            `🚫 *ɴúᴍᴇʀᴏ ʙʟᴏǫᴜᴇᴀᴅᴏ* 𓈒 ◌\n\n` +
            `ꕥ Objetivo: @${targetJid.split('@')[0]}\n` +
            `ꕥ Usa \`.unblock\` para desbloquear ( ᴗ͈ˬᴗ͈ )`,
            { mentions: [targetJid] }
        )
    } catch (err) {
        return m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }