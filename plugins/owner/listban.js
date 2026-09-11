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
    const bannedUsers = config.bannedUsers && config.bannedUsers.length > 0 ? config.bannedUsers : (db.setting('bannedUsers') || [])
    
    if (bannedUsers.length === 0) {
        return m.reply(`🚫 *ʟɪsᴛᴀ ᴅᴇ ʙᴀɴᴇᴀᴅᴏs* 𓈒 ◌\n\nꕥ No hay usuarios baneados\n\n𓈒 ◌ Usa: \`${m.prefix}ban <número>\` ( ᴗ͈ˬᴗ͈ )`)
    }
    
    let caption = `🚫 *ʟɪsᴛᴀ ᴅᴇ ʙᴀɴᴇᴀᴅᴏs* 𓈒 ◌\n\n`
    caption += `╭┈┈⬡「 ⛔ *ᴜsᴜᴀʀɪᴏs* 」\n`
    
    for (let i = 0; i < bannedUsers.length; i++) {
        caption += `┃ ${i + 1}. \`${bannedUsers[i]}\`\n`
    }
    
    caption += `╰┈┈⬡\n\n`
    caption += `ꕥ ᴛᴏᴛᴀʟ: \`${bannedUsers.length}\` ᴜsᴜᴀʀɪᴏs ʙᴀɴᴇᴀᴅᴏs 𓈒 ◌`
    
    await m.reply(caption)
}

export { pluginConfig as config, handler }