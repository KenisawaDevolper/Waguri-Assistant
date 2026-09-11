import config from '../../config.js'
import { getDatabase } from '../../src/lib/rimuru-database.js'
const pluginConfig = {
    name: 'listban',
    alias: ['listbanned', 'banlist'],
    category: 'owner',
    description: 'Ver lista de usuarios baneados',
    usage: '.listban',
    example: '.listban',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const bannedUsuarios = config.bannedUsuarios && config.bannedUsuarios.length > 0 ? config.bannedUsuarios : (db.setting('bannedUsuarios') || [])
    
    if (bannedUsuarios.length === 0) {
        return m.reply(`🚫 *ʟɪsᴛᴀ ᴅᴇ ʙᴀɴᴇᴀᴅᴏs* 𓈒 ◌\n\nꕥ No hay usuarios baneados\n\n𓈒 ◌ Usa: \`${m.prefix}ban <número>\` ( ᴗ͈ˬᴗ͈ )`)
    }
    
    let caption = `🚫 *ʟɪsᴛᴀ ᴅᴇ ʙᴀɴᴇᴀᴅᴏs* 𓈒 ◌\n\n`
    caption += `╭┈┈⬡「 ⛔ *ᴜsᴜᴀʀɪᴏs* 」\n`
    
    for (let i = 0; i < bannedUsuarios.length; i++) {
        caption += `┃ ${i + 1}. \`${bannedUsuarios[i]}\`\n`
    }
    
    caption += `╰┈┈⬡\n\n`
    caption += `ꕥ ᴛᴏᴛᴀʟ: \`${bannedUsuarios.length}\` ᴜsᴜᴀʀɪᴏs ʙᴀɴᴇᴀᴅᴏs 𓈒 ◌`
    
    await m.reply(caption)
}

export { pluginConfig as config, handler }