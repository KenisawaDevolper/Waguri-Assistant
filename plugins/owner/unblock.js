import config from '../../config.js'
import te from '../../src/lib/rimuru-error.js'
const pluginConfig = {
    name: ['unblock', 'unblocknomor'],
    alias: [],
    category: 'owner',
    description: 'Desbloquear número de WhatsApp',
    usage: '.unblock <número/responder/mencionar>',
    example: '.unblock 628xxx',
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
            'ꕥ `.unblock 628xxx` — Desbloquear por número\n' +
            'ꕥ `.unblock` (responder) — Desbloquear al remitente\n' +
            'ꕥ `.unblock @mención` — Desbloquear al mencionado\n' +
            'ꕥ `.unblock` (en chat privado) — Desbloquear a este usuario ( ᴗ͈ˬᴗ͈ )'
        )
    }

    try {
        await sock.updateBlockStatus(targetJid, 'unblock')
        await m.react('✅')
        return m.reply(
            `✅ *ɴúᴍᴇʀᴏ ᴅᴇsʙʟᴏǫᴜᴇᴀᴅᴏ* 𓈒 ◌\n\n` +
            `ꕥ Objetivo: @${targetJid.split('@')[0]} ( ᴗ͈ˬᴗ͈ )`,
            { mentions: [targetJid] }
        )
    } catch (err) {
        return m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }