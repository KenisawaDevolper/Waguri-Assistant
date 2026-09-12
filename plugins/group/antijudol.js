import { getDatabase } from '../../src/lib/rimuru-database.js'

const pluginConfig = {
    name: 'antijudol',
    alias: ['antijudi', 'nojudi', 'antislot'],
    category: 'group',
    description: 'Deteksi konten judol di grup',
    usage: '.antijudol <on/off/metode> [kick/remove]',
    example: '.antijudol on',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    isBotAdmin: true,
    cooldown: 3,
    energi: 0,
    isEnabled: true
}

function handler(m) {
    const db = getDatabase()
    const groupData = db.getGroup(m.chat) || {}
    const option = m.text?.toLowerCase()?.trim()

    if (!option) {
        const status = groupData.antijudol || 'off'
        const mode = groupData.antijudolModo || 'remove'
        return m.reply(
            `🎰 *ᴀɴᴛɪᴊᴜᴅᴏʟ*\n\n` +
            `> Status: *${status.toUpperCase()}*\n` +
            `> Modo: *${mode.toUpperCase()}*\n\n` +
            `> Deteksi konten judol seperti judi, slot, gacor, maxwin, togel, bonus member, link alternatif, dan pola sejenis.\n\n` +
            `> \`${m.prefix}antijudol on\`\n` +
            `> \`${m.prefix}antijudol off\`\n` +
            `> \`${m.prefix}antijudol metode kick\`\n` +
            `> \`${m.prefix}antijudol metode remove\``
        )
    }

    if (option === 'on') {
        db.setGroup(m.chat, { antijudol: 'on' })
        return m.reply('✅ *AntiApuestas activado*')
    }

    if (option === 'off') {
        db.setGroup(m.chat, { antijudol: 'off' })
        return m.reply('❌ *AntiApuestas desactivado*')
    }

    if (option.startsWith('metode')) {
        const method = m.args?.[1]?.toLowerCase()
        if (method === 'kick') {
            db.setGroup(m.chat, { antijudol: 'on', antijudolModo: 'kick' })
            return m.reply('✅ *Modo KICK de AntiApuestas activado*')
        }
        if (method === 'remove' || method === 'delete') {
            db.setGroup(m.chat, { antijudol: 'on', antijudolModo: 'remove' })
            return m.reply('✅ *Modo DELETE de AntiApuestas activado*')
        }
        return m.reply(`❌ Metode no valid! Gunakan: \`kick\` atau \`remove\``)
    }

    if (option === 'kick') {
        db.setGroup(m.chat, { antijudol: 'on', antijudolModo: 'kick' })
            return m.reply('✅ *Modo KICK de AntiApuestas activado*')
    }

    if (option === 'remove' || option === 'delete') {
        db.setGroup(m.chat, { antijudol: 'on', antijudolModo: 'remove' })
            return m.reply('✅ *Modo DELETE de AntiApuestas activado*')
    }

    return m.reply('❌ Opsi no valid! Gunakan: `on`, `off`, `metode kick`, `metode remove`')
}

export { pluginConfig as config, handler }
