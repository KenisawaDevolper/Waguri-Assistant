import { getDatabase } from '../../src/lib/rimuru-database.js'
import { isLid, lidToJid } from '../../src/lib/rimuru-lid.js'

const pluginConfig = {
    name: 'unmutemember',
    alias: ['unmutmember', 'unsilentmember', 'desmutear', 'listmutemember', 'listmute'],
    category: 'group',
    description: '𝖣ᧉ𝗌𝗆𝗎ƚᧉ⍺ ⍺ 𝗎𝗇 𝗆ıᧉ𝗆𝖻𝗋𝗈 ᧉ𝗌𝗉ᧉ𝖼í𝖿ı𝖼𝗈',
    usage: '.unmutemember <@tag/reply/número>',
    example: '.unmutemember @user',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    isBotAdmin: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

function resolveTarget(m) {
    let raw = ''

    if (m.quoted) {
        raw = m.quoted.sender || ''
    } else if (m.mentionedJid?.length) {
        raw = m.mentionedJid[0] || ''
    } else if (m.args[0]) {
        raw = m.args[0]
    }

    if (!raw) return ''

    if (isLid(raw)) raw = lidToJid(raw)
    if (!raw.includes('@')) raw = raw.replace(/[^0-9]/g, '') + '@s.whatsapp.net'

    return raw
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const groupData = db.getGroup(m.chat) || {}
    const mutedMembers = groupData.mutedMembers || []

    if (m.command === 'listmutemember' || m.command === 'listmute') {
        if (mutedMembers.length === 0) {
            return m.reply(
                `« ¿ 𝗊𝗎é 𝖽ᧉ𝗌ᧉ⍺𝗌 ᥎ᧉ𝗋 𝗑 ? »\n\n` +
                `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ *𝖫𝖨𝖲𝖳𝖠 𝖣𝖤 𝖬𝖴𝖳𝖤𝖲* ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                `      🔊   𓈒 ◌ㅤ──    _𝖭𝗈 𝗁⍺𝗒 𝗆ıᧉ𝗆𝖻𝗋𝗈𝗌 𝗌ı𝗅ᧉ𝗇𝖼ı⍺𝖽𝗈𝗌 ᧉ𝗇 ᧉ𝗌ƚᧉ 𝗀𝗋𝗎𝗉𝗈._\n\n` +
                `( ᴗ͈ˬᴗ͈ ) 𝑊⍺ց𝗎𝗋ı 𝖠𝗌𝗌ı𝗌ƚ⍺𝗇ƚ`
            )
        }

        let txt = `« ¿ 𝗊𝗎é 𝖽ᧉ𝗌ᧉ⍺𝗌 ᥎ᧉ𝗋 𝗑 ? »\n\nଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ *𝖫𝖨𝖲𝖳𝖠 𝖣𝖤 𝖬𝖴𝖳𝖤𝖲* ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n`
        mutedMembers.forEach((jid, i) => {
            const num = jid.replace(/@.+/g, '')
            txt += `      👤   𓈒 ◌ㅤ──    ${i + 1}. @${num}\n`
        })
        txt += `\n> 𝖳𝗈ƚ⍺𝗅: \`${mutedMembers.length}\` 𝗆ıᧉ𝗆𝖻𝗋𝗈𝗌 𝗌ı𝗅ᧉ𝗇𝖼ı⍺𝖽𝗈𝗌\n\n( ᴗ͈ˬᴗ͈ ) 𝑊⍺ց𝗎𝗋ı 𝖠𝗌𝗌ı𝗌ƚ⍺𝗇ƚ`

        return m.reply(txt, { mentions: mutedMembers })
    }

    const targetJid = resolveTarget(m)

    if (!targetJid) {
        return m.reply(
            `« ¿ 𝗊𝗎é 𝖽ᧉ𝗌ᧉ⍺𝗌 ᥎ᧉ𝗋 𝗑 ? »\n\n` +
            `⚠️ *𝖢Ó𝖬𝖮 𝖴𝖲𝖠𝖱 𝖤𝖫 𝖴𝖭𝖬𝖴𝖳𝖤*\n\n` +
            `      🔊   𓈒 ◌ㅤ──    _𝖣ᧉ𝗌𝗌ı𝗅ᧉ𝗇𝖼ı⍺ ⍺ 𝗎𝗇 𝗆ıᧉ𝗆𝖻𝗋𝗈 𝖽ᧉ𝗅 𝗀𝗋𝗎𝗉𝗈._\n\n` +
            `(•ૢ⚈͒⌄⚈͒•ૢ) *𝖤𝖩𝖤𝖬𝖯𝖫𝖮𝖲* 🌸\n` +
            `      💬   𓈒 ◌ㅤ──    > \`${m.prefix}unmutemember @user\`\n` +
            `      📱   𓈒 ◌ㅤ──    > \`${m.prefix}unmutemember 5491123456789\`\n` +
            `      ↩️   𓈒 ◌ㅤ──    > 𝖱ᧉ𝗌𝗉𝗈𝗇𝖽ᧉ ⍺ 𝗎𝗇 𝗆ᧉ𝗇𝗌⍺𝗃ᧉ + \`${m.prefix}unmutemember\`\n\n` +
            `( ᴗ͈ˬᴗ͈ ) 𝑊⍺ց𝗎𝗋ı 𝖠𝗌𝗌ı𝗌ƚ⍺𝗇ƚ`
        )
    }

    const targetNumber = targetJid.replace(/@.+/g, '')

    const index = mutedMembers.findIndex(jid => {
        const c = jid.replace(/@.+/g, '')
        return c === targetNumber || c.endsWith(targetNumber) || targetNumber.endsWith(c)
    })

    if (index === -1) {
        return m.reply(
            `« ¿ 𝗊𝗎é 𝖽ᧉ𝗌ᧉ⍺𝗌 ᥎ᧉ𝗋 𝗑 ? »\n\n` +
            `❌ *𝖤𝖱𝖱𝖮𝖱*\n\n` +
            `      ⚠️   𓈒 ◌ㅤ──    _𝖤𝗅 𝗎𝗌𝗎⍺𝗋ı𝗈 @${targetNumber} 𝗇𝗈 ᧉ𝗌ƚá 𝗌ı𝗅ᧉ𝗇𝖼ı⍺𝖽𝗈._\n\n` +
            `( ᴗ͈ˬᴗ͈ ) 𝑊⍺ց𝗎𝗋ı 𝖠𝗌𝗌ı𝗌ƚ⍺𝗇ƚ`, 
            { mentions: [targetJid] }
        )
    }

    mutedMembers.splice(index, 1)
    db.setGroup(m.chat, { ...groupData, mutedMembers })

    m.react('🔊')
    await m.reply(
        `« ¿ 𝗊𝗎é 𝖽ᧉ𝗌ᧉ⍺𝗌 ᥎ᧉ𝗋 𝗑 ? »\n\n` +
        `✅ *𝖬𝖨𝖤𝖬𝖡𝖱𝖮 𝖣𝖤𝖲𝖲𝖨𝖫𝖤𝖭𝖢𝖨𝖠𝖣𝖮*\n\n` +
        `      👤   𓈒 ◌ㅤ──    *𝖴𝗌𝗎⍺𝗋ı𝗈* : @${targetNumber}\n` +
        `      🔊   𓈒 ◌ㅤ──    *𝖤𝗌ƚ⍺𝖽𝗈* : \`Unmuted\`\n` +
        `      📊   𓈒 ◌ㅤ──    *𝖱ᧉ𝗌ƚ⍺𝗇ƚᧉ𝗌* : \`${mutedMembers.length}\` 𝗆ıᧉ𝗆𝖻𝗋𝗈𝗌\n\n` +
        `( ᴗ͈ˬᴗ͈ ) 𝑊⍺ց𝗎𝗋ı 𝖠𝗌𝗌ı𝗌ƚ⍺𝗇ƚ`,
        { mentions: [targetJid] }
    )
}

export { pluginConfig as config, handler }
