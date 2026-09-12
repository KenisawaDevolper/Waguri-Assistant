import { getDatabase } from '../../src/lib/rimuru-database.js'

const pluginConfig = {
    name: 'antiphising',
    alias: ['antiphishing', 'antiscamlink', 'nophising'],
    category: 'group',
    description: 'Deteksi konten phising di grup',
    usage: '.antiphising <on/off/metode> [kick/remove]',
    example: '.antiphising on',
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
        const status = groupData.antiphising || 'off'
        const mode = groupData.antiphisingModo || 'remove'
        return m.reply(
            `🎣 *ᴀɴᴛɪᴘʜɪsɪɴɢ*\n\n` +
            `> Status: *${status.toUpperCase()}*\n` +
            `> Modo: *${mode.toUpperCase()}*\n\n` +
            `> Deteksi pesan phising seperti klik link, verifikasi akun, login palsu, shortener mencurigakan, URL IP, punycode, dan pola sejenis.\n\n` +
            `> \`${m.prefix}antiphising on\`\n` +
            `> \`${m.prefix}antiphising off\`\n` +
            `> \`${m.prefix}antiphising metode kick\`\n` +
            `> \`${m.prefix}antiphising metode remove\``
        )
    }

    if (option === 'on') {
        db.setGroup(m.chat, { antiphising: 'on' })
        return m.reply('✅ *AntiPhishing activado*')
    }

    if (option === 'off') {
        db.setGroup(m.chat, { antiphising: 'off' })
        return m.reply('❌ *AntiPhishing desactivado*')
    }

    if (option.startsWith('metode')) {
        const method = m.args?.[1]?.toLowerCase()
        if (method === 'kick') {
            db.setGroup(m.chat, { antiphising: 'on', antiphisingModo: 'kick' })
            return m.reply('✅ *Modo KICK de AntiPhishing activado*')
        }
        if (method === 'remove' || method === 'delete') {
            db.setGroup(m.chat, { antiphising: 'on', antiphisingModo: 'remove' })
            return m.reply('✅ *Modo DELETE de AntiPhishing activado*')
        }
        return m.reply('❌ Metode no valid! Gunakan: `kick` atau `remove`')
    }

    if (option === 'kick') {
        db.setGroup(m.chat, { antiphising: 'on', antiphisingModo: 'kick' })
            return m.reply('✅ *Modo KICK de AntiPhishing activado*')
    }

    if (option === 'remove' || option === 'delete') {
        db.setGroup(m.chat, { antiphising: 'on', antiphisingModo: 'remove' })
            return m.reply('✅ *Modo DELETE de AntiPhishing activado*')
    }

    return m.reply('❌ Opsi no valid! Gunakan: `on`, `off`, `metode kick`, `metode remove`')
}

export { pluginConfig as config, handler }
