import { getDatabase } from '../../src/lib/rimuru-database.js'

const pluginConfig = {
    name: 'autoreadsw',
    alias: ['autoreadstory', 'readstory', 'bacasw'],
    category: 'owner',
    description: 'Lee automáticamente todos los estados/historias de WA con la estética Waguri Assistant 👁️',
    usage: '.autoreadsw on/off',
    example: '.autoreadsw on',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m) {
    const db = getDatabase()
    const action = (m.args?.[0] || '').toLowerCase()
    const current = db.setting('autoReadSW') || { enabled: false }

    if (!action) {
        return m.reply(
            `👁️ *ᴀᴜᴛᴏ ʀᴇᴀᴅ sᴛᴏʀʏ*\n\n` +
            `> Status: *${current.enabled ? '✅ ON' : '❌ OFF'}*\n\n` +
            `*ᴄᴀʀᴀ ᴘᴀᴋᴀɪ:*\n` +
            `> \`${m.prefix}autoreadsw on\` — Activar\n` +
            `> \`${m.prefix}autoreadsw off\` — Desactivar`
        )
    }

    if (action === 'on') {
        db.setting('autoReadSW', { enabled: true })
        db.save()
        await m.react('✅')
        return m.reply(
            `✅ *ᴀᴜᴛᴏ ʀᴇᴀᴅ sᴛᴏʀʏ ᴀᴋᴛɪꜰ*\n\n` +
            `> Bot akan otomatis membaca todos story WA`
        )
    }

    if (action === 'off') {
        db.setting('autoReadSW', { enabled: false })
        db.save()
        await m.react('✅')
        return m.reply(`❌ *ᴀᴜᴛᴏ ʀᴇᴀᴅ sᴛᴏʀʏ ᴅɪᴍᴀᴛɪᴋᴀɴ*`)
    }

    return m.reply(`❌ Gunakan \`on\` atau \`off\``)
}

export { pluginConfig as config, handler }
