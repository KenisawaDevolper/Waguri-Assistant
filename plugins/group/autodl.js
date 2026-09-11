import { getDatabase } from '../../src/lib/rimuru-database.js'

const pluginConfig = {
    name: ['autodl', 'autodownload'],
    alias: [],
    category: 'group',
    description: 'Activa o desactiva la descarga automática de enlaces',
    usage: '.autodl on/off',
    example: '.autodl on',
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
    const args = m.args[0]?.toLowerCase()
    
    const groupData = db.getGroup(m.chat)
    const current = groupData?.autodl || false
    
    if (!args || args === 'status') {
        const stateText = current ? '⍺𝖼ƚı᥎⍺𝖽𝗈' : '𝖽ᧉ𝗌⍺𝖼ƚı᥎⍺𝖽𝗈'
        return m.reply(
            `*⍺𝗎ƚ𝗈-𝖽𝗈𝗐𝗇𝗅𝗈⍺𝖽*\n\n` +
            `✧ ‹ ᧉ𝗌ƚ⍺𝖽𝗈 › *${stateText}*\n\n` +
            `✧ ‹ 𝗉𝗅⍺ƚ⍺𝖿𝗈𝗋𝗆⍺𝗌 ›\n` +
            `> TikTok, Instagram, Facebook\n` +
            `> YouTube, Spotify, Pinterest\n\n` +
            `✧ ‹ 𝗎𝗌𝗈 ›\n` +
            `> \`${m.prefix}autodl on\` - ⍺𝖼ƚı᥎⍺𝗋\n` +
            `> \`${m.prefix}autodl off\` - 𝖽ᧉ𝗌⍺𝖼ƚı᥎⍺𝗋\n\n` +
            `> 𝗐⍺𝗀𝗎ɾı ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ`
        )
    }
    
    if (args === 'on') {
        db.setGroup(m.chat, { ...groupData, autodl: true })
        m.react('✓')
        return m.reply(
            `*⍺𝗎ƚ𝗈-𝖽𝗈𝗐𝗇𝗅𝗈⍺𝖽 ⍺𝖼ƚı᥎⍺𝖽𝗈*\n\n` +
            `> ᧉ𝗇᥎í⍺ 𝗎𝗇 ᧉ𝗇𝗅⍺𝖼ᧉ 𝗒 𝗌ᧉ 𝖽ᧉ𝗌𝖼⍺𝗋𝗀⍺𝗋á ⍺𝗎ƚ𝗈𝗆áƚı𝖼⍺𝗆ᧉ𝗇ƚᧉ.\n\n` +
            `> 𝗐⍺𝗀𝗎ɾı ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ`
        )
    }
    
    if (args === 'off') {
        db.setGroup(m.chat, { ...groupData, autodl: false })
        m.react('✕')
        return m.reply(`*⍺𝗎ƚ𝗈-𝖽𝗈𝗐𝗇𝗅𝗈⍺𝖽 𝖽ᧉ𝗌⍺𝖼ƚı᥎⍺𝖽𝗈*\n\n> 𝗐⍺𝗀𝗎ɾı ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ`)
    }
    
    return m.reply(`*⍺𝗋𝗀𝗎𝗆ᧉ𝗇ƚ𝗈 𝗇𝗈 ᥎á𝗅ı𝖽𝗈*\n\n> 𝗎𝗌⍺: \`on\` 𝗈 \`off\``)
}

export { pluginConfig as config, handler }
