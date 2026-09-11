import { getDatabase } from '../../src/lib/rimuru-database.js'

const pluginConfig = {
    name: 'unmute',
    alias: ['desmutear', 'abrirgrupo'],
    category: 'group',
    description: '𝖣ᧉ𝗌𝗆𝗎ƚᧉ⍺ ᧉ𝗅 𝗀𝗋𝗎𝗉𝗈 𝗉⍺𝗋⍺ 𝗊𝗎ᧉ ƚ𝗈𝖽𝗈𝗌 𝗉𝗎ᧉ𝖽⍺𝗇 𝗁⍺𝖻𝗅⍺𝗋',
    usage: '.unmute',
    example: '.unmute',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    isBotAdmin: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

function handler(m, { sock }) {
    const db = getDatabase()
    const group = db.getGroup(m.chat) || {}
    const groupName = m.groupMetadata.subject

    if (!group.mute) {
        return m.reply(
            `« ¿ 𝗊𝗎é 𝖽ᧉ𝗌ᧉ⍺𝗌 ᥎ᧉ𝗋 𝗑 ? »\n\n` +
            `⚠️ *𝖦𝖱𝖴𝖯𝖮 𝖸𝖠 𝖠𝖡𝖨𝖤𝖱𝖳𝖮*\n\n` +
            `      🔊   𓈒 ◌ㅤ──    _𝖤𝗅 𝗀𝗋𝗎𝗉𝗈 𝗇𝗈 ᧉ𝗌ƚá 𝗌ı𝗅ᧉ𝗇𝖼ı⍺𝖽𝗈 ⍺𝖼ƚ𝗎⍺𝗅𝗆ᧉ𝗇ƚᧉ._\n\n` +
            `( ᴗ͈ˬᴗ͈ ) 𝑊⍺ց𝗎𝗋ı 𝖠𝗌𝗌ı𝗌ƚ⍺𝗇ƚ`
        )
    }

    db.setGroup(m.chat, { ...group, mute: false })
    
    m.reply(
        `« ¿ 𝗊𝗎é 𝖽ᧉ𝗌ᧉ⍺𝗌 ᥎ᧉ𝗋 𝗑 ? »\n\n` +
        `✅ *𝖦𝖱𝖴𝖯𝖮 𝖣𝖤𝖲𝖬𝖴𝖳𝖤𝖠𝖣𝖮*\n\n` +
        `      🏠   𓈒 ◌ㅤ──    *𝖦𝗋𝗎𝗉𝗈* : ${groupName}\n` +
        `      👤   𓈒 ◌ㅤ──    *𝖯𝗈𝗋* : @${m.sender.split('@')[0]}\n` +
        `      ✨   𓈒 ◌ㅤ──    _¡𝖳𝗈𝖽𝗈𝗌 𝗅𝗈𝗌 𝗆ıᧉ𝗆𝖻𝗋𝗈𝗌 ⍺𝗁𝗈𝗋⍺ 𝗉𝗎ᧉ𝖽ᧉ𝗇 ᧉ𝗇𝗏ı⍺𝗋 𝗆ᧉ𝗇𝗌⍺𝗃ᧉ𝗌!_\n\n` +
        `( ᴗ͈ˬᴗ͈ ) 𝑊⍺ց𝗎𝗋ı 𝖠𝗌𝗌ı𝗌ƚ⍺𝗇ƚ`, 
        { mentions: [m.sender] }
    )
}

export { pluginConfig as config, handler }
