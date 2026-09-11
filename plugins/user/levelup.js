import { getDatabase } from '../../src/lib/rimuru-database.js'

const pluginConfig = {
    name: 'levelup',
    alias: ['lvlup', 'levelnotif'],
    category: 'user',
    description: 'Activa o desactiva las notificaciones de subida de nivel',
    usage: '.levelup <on/off>',
    example: '.levelup on',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

function handler(m, { sock }) {
    const db = getDatabase()
    const user = db.getUser(m.sender)
    const args = m.args || []
    const sub = args[0]?.toLowerCase()
    
    if (!user.settings) user.settings = {}
    
    if (sub === 'on') {
        user.settings.levelupNotif = true
        db.save()
        return m.reply(
            `*¡Hola, buenas tardes!* ฅ^·ﻌ·^ฅ\n` +
            `> _Configuración de notificaciones de nivel ≽^• ˕ • ྀི≼_\n\n` +
            `## ꕥ *W⍺gurı 𝖠ssı𝗌ƚ⍺nƚ* (*ᴗ͈ˬᴗ͈)ꕤ\n` +
            `> 𝖭𝖮𝖳𝖨𝖥𝖨𝖢𝖠𝖢𝖨Ó𝖭 𝖣𝖤 𝖫𝖤𝖵𝖤𝖫 𝖴𝖯\n\n` +
            `> Estado: *𝖠𝖢𝖳𝖨𝖵𝖮 ⟡*\n` +
            `> ¡Recibirás una notificación cada vez que subas de nivel!\n\n` +
            `> sɪᴍᴘʟᴇ ᴡʜᴀᴛsᴀᴘᴘ ʙᴏᴛ ツ`
        )
    }
    
    if (sub === 'off') {
        user.settings.levelupNotif = false
        db.save()
        return m.reply(
            `*¡Hola, buenas tardes!* ฅ^·ﻌ·^ฅ\n` +
            `> _Configuración de notificaciones de nivel ≽^• ˕ • ྀི≼_\n\n` +
            `## ꕥ *W⍺gurı 𝖠ssı𝗌ƚ⍺nƚ* (*ᴗ͈ˬᴗ͈)ꕤ\n` +
            `> 𝖭𝖮𝖳𝖨𝖥𝖨𝖢𝖠𝖢𝖨Ó𝖭 𝖣𝖤 𝖫𝖤𝖵𝖤𝖫 𝖴𝖯\n\n` +
            `> Estado: *𝖣𝖤𝖲𝖠𝖢𝖳𝖨𝖵𝖠𝖣𝖮 ⟡*\n` +
            `> Las notificaciones de nivel up han sido desactivadas.\n\n` +
            `> sɪᴍᴘʟᴇ ᴡʜᴀᴛsᴀᴘᴘ ʙᴏᴛ ツ`
        )
    }
    
    const status = user.settings.levelupNotif !== false ? '𝖠𝖢𝖳𝖨𝖵𝖮 ⟡' : '𝖣𝖤𝖲𝖠𝖢𝖳𝖨𝖵𝖠𝖣𝖮 ⟡'
    return m.reply(
        `*¡Hola, buenas tardes!* ฅ^·ﻌ·^ฅ\n` +
        `> _Configuración de notificaciones de nivel ≽^• ˕ • ྀི≼_\n\n` +
        `## ꕥ *W⍺gurı 𝖠ssı𝗌ƚ⍺nƚ* (*ᴗ͈ˬᴗ͈)ꕤ\n` +
        `> 𝖭𝖮𝖳𝖨𝖥𝖨𝖢𝖠𝖢𝖨Ó𝖭 𝖣𝖤 𝖫𝖤𝖵𝖤𝖫 𝖴𝖯\n\n` +
        `> Estado actual: *${status}*\n\n` +
        `> 𝖴𝗌𝗈 𝖽𝖾𝗅 𝖼𝗈𝗆𝖺𝗇𝖽𝗈:\n` +
        `> - \`.levelup on\` - Activar notificaciones\n` +
        `> - \`.levelup off\` - Desactivar notificaciones\n\n` +
        `> sɪᴍᴘʟᴇ ᴡʜᴀᴛsᴀᴘᴘ ʙᴏᴛ ツ`
    )
}

export { pluginConfig as config, handler }
