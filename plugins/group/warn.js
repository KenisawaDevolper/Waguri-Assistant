import { getDatabase } from '../../src/lib/rimuru-database.js'
import { getParticipantJid } from '../../src/lib/rimuru-lid.js'
import te from '../../src/lib/rimuru-error.js'

const pluginConfig = {
    name: 'warn',
    alias: ['warning', 'advertencia'],
    category: 'group',
    description: '𝖣⍺ 𝗎𝗇⍺ ⍺𝖽᥎ᧉ𝗋ƚᧉ𝗇𝖼ı⍺ ⍺ 𝗎𝗇 𝗆ıᧉ𝗆𝖻𝗋𝗈',
    usage: '.warn @user <motivo>',
    example: '.warn @user spam',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    
    let groupData = db.getGroup(m.chat) || {}
    let warnings = groupData.warnings || {}
    const maxAdviertes = groupData.maxAdvierteings || 3

    const args = m.args
    if (!args[0] && !m.quoted && (!m.mentionedJid || m.mentionedJid.length === 0)) {
        return m.reply(
            `« ¿ 𝗊𝗎é 𝖽ᧉ𝗌ᧉ⍺𝗌 ᥎ᧉ𝗋 𝗑 ? »\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ *𝖲𝖨𝖲𝖳𝖤𝖬𝖠 𝖣𝖤 𝖠𝖣𝖵𝖤𝖱𝖳𝖤𝖭𝖢𝖨𝖠𝖲* ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `      🛡️   𓈒 ◌ㅤ──    _𝖲ı𝗌ƚᧉ𝗆⍺ 𝖽ᧉ 𝗀ᧉ𝗌ƚıó𝗇 𝖽ᧉ ı𝗇𝖿𝗋⍺𝖼𝖼ı𝗈𝗇ᧉ𝗌._\n` +
            `      ⚠️   𓈒 ◌ㅤ──    *𝖫í𝗆ıƚᧉ*: ${maxAdviertes} (𝖪ı𝖼𝗄 ⍺𝗎ƚ𝗈𝗆áƚı𝖼𝗈)\n\n` +
            `(•ૢ⚈͒⌄⚈͒•ૢ) *𝖢𝖮𝖬𝖠𝖭𝖣𝖮𝖲* 🌸\n` +
            `      🔘   𓈒 ◌ㅤ──    \`${m.prefix}warn @user <motivo>\`\n` +
            `      🔘   𓈒 ◌ㅤ──    \`${m.prefix}warn max <número>\`\n` +
            `      🔘   𓈒 ◌ㅤ──    \`${m.prefix}listwarn\`\n` +
            `      🔘   𓈒 ◌ㅤ──    \`${m.prefix}resetwarn @user\`\n\n` +
            `> 💡 *𝖳ı𝗉:* 𝖲ı ᧉ𝗅 𝗎𝗌𝗎⍺𝗋ı𝗈 ⍺𝗅𝖼⍺𝗇𝗓⍺ ᧉ𝗅 𝗅í𝗆ıƚᧉ (${maxAdviertes}), 𝗌ᧉ𝗋á ᧉ𝗑𝗉𝗎𝗅𝗌⍺𝖽𝗈 ⍺𝗎ƚ𝗈𝗆áƚı𝖼⍺𝗆ᧉ𝗇ƚᧉ.\n\n` +
            `( ᴗ͈ˬᴗ͈ ) 𝑊⍺ց𝗎𝗋ı 𝖠𝗌𝗌ı𝗌ƚ⍺𝗇ƚ`
        )
    }
    
    if (args[0]?.toLowerCase() === 'max') {
        const newMax = parseInt(args[1])
        if (isNaN(newMax) || newMax < 1 || newMax > 20) {
            return m.reply(
                `« ¿ 𝗊𝗎é 𝖽ᧉ𝗌ᧉ⍺𝗌 ᥎ᧉ𝗋 𝗑 ? »\n\n` +
                `❌ *𝖤𝖱𝖱𝖮𝖱*\n\n` +
                `      ⚠️   𓈒 ◌ㅤ──    _𝖤𝗅 𝗅í𝗆ıƚᧉ 𝖽ᧉ𝖻ᧉ 𝗌ᧉ𝗋 𝗎𝗇 𝗇ú𝗆ᧉ𝗋𝗈 ᧉ𝗇ƚ𝗋ᧉ 𝟣 𝗒 𝟤𝟢._\n` +
                `      💡   𓈒 ◌ㅤ──    _𝖤𝗃ᧉ𝗆𝗉𝗅𝗈: *${m.prefix}warn max 5*_\n\n` +
                `( ᴗ͈ˬᴗ͈ ) 𝑊⍺ց𝗎𝗋ı 𝖠𝗌𝗌ı𝗌ƚ⍺𝗇ƚ`
            )
        }
        groupData.maxAdvierteings = newMax
        db.setGroup(m.chat, groupData)
        return m.reply(
            `« ¿ 𝗊𝗎é 𝖽ᧉ𝗌ᧉ⍺𝗌 ᥎ᧉ𝗋 𝗑 ? »\n\n` +
            `✅ *𝖫Í𝖬𝖨𝖳𝖤 𝖬𝖮𝖣𝖨𝖥𝖨𝖢𝖠𝖣𝖮*\n\n` +
            `      ⚙️   𓈒 ◌ㅤ──    _¡𝖤𝗅 𝗅í𝗆ıƚᧉ 𝖽ᧉ ⍺𝖽᥎ᧉ𝗋ƚᧉ𝗇𝖼ı⍺𝗌 𝗌ᧉ ⍺𝖼ƚ𝗎⍺𝗅ı𝗓ó ⍺ *${newMax}*!_\n\n` +
            `( ᴗ͈ˬᴗ͈ ) 𝑊⍺ց𝗎𝗋ı 𝖠𝗌𝗌ı𝗌ƚ⍺𝗇ƚ`
        )
    }

    let targetUsuario = null
    if (m.quoted) {
        targetUsuario = m.quoted.sender
    } else if (m.mentionedJid && m.mentionedJid.length > 0) {
        targetUsuario = m.mentionedJid[0]
    }
    
    if (!targetUsuario) {
        await m.reply(
            `« ¿ 𝗊𝗎é 𝖽ᧉ𝗌ᧉ⍺𝗌 ᥎ᧉ𝗋 𝗑 ? »\n\n` +
            `⚠️ *𝖢Ó𝖬𝖮 𝖴𝖲𝖠𝖱*\n\n` +
            `      💬   𓈒 ◌ㅤ──    > 𝖱ᧉ𝗌𝗉𝗈𝗇𝖽ᧉ ⍺ 𝗎𝗇 𝗆ᧉ𝗇𝗌⍺𝗃ᧉ + \`${m.prefix}warn <motivo>\`\n` +
            `      👤   𓈒 ◌ㅤ──    > 𝖮 𝗎𝗌⍺: \`${m.prefix}warn @user <motivo>\`\n\n` +
            `( ᴗ͈ˬᴗ͈ ) 𝑊⍺ց𝗎𝗋ı 𝖠𝗌𝗌ı𝗌ƚ⍺𝗇ƚ`
        )
        return
    }
    
    try {
        const groupMeta = m.groupMetadata
        const participant = groupMeta.participants.find(p => getParticipantJid(p) === targetUsuario)
        if (participant?.admin) {
            await m.reply(
                `« ¿ 𝗊𝗎é 𝖽ᧉ𝗌ᧉ⍺𝗌 ᥎ᧉ𝗋 𝗑 ? »\n\n` +
                `❌ *𝖤𝖱𝖱𝖮𝖱*\n\n` +
                `      🛡️   𓈒 ◌ㅤ──    _𝖭𝗈 𝗉𝗎ᧉ𝖽ᧉ𝗌 ⍺𝖽᥎ᧉ𝗋ƚı𝗋 ⍺ 𝗎𝗇 ⍺𝖽𝗆ı𝗇ı𝗌ƚ𝗋⍺𝖽𝗈𝗋 𝖽ᧉ𝗅 𝗀𝗋𝗎𝗉𝗈._\n\n` +
                `( ᴗ͈ˬᴗ͈ ) 𝑊⍺ց𝗎𝗋ı 𝖠𝗌𝗌ı𝗌ƚ⍺𝗇ƚ`
            )
            return
        }
    } catch (e) {}
    
    const botJid = sock.user?.id?.split(':')[0] + '@s.whatsapp.net'
    if (targetUsuario === botJid) {
        await m.reply(
            `« ¿ 𝗊𝗎é 𝖽ᧉ𝗌ᧉ⍺𝗌 ᥎ᧉ𝗋 𝗑 ? »\n\n` +
            `❌ *𝖤𝖱𝖱𝖮𝖱*\n\n` +
            `      🌸   𓈒 ◌ㅤ──    _¡𝖭𝗈 𝗆ᧉ ⍺𝖽᥎ıᧉ𝗋ƚ⍺𝗌 ⍺ 𝗆í, 𝗌𝗈𝗅𝗈 𝗌𝗈𝗒 𝗎𝗇⍺ ⍺𝗌ı𝗌ƚᧉ𝗇ƚᧉ!_\n\n` +
            `( ᴗ͈ˬᴗ͈ ) 𝑊⍺ց𝗎𝗋ı 𝖠𝗌𝗌ı𝗌ƚ⍺𝗇ƚ`
        )
        return
    }
    
    const reasonArg = m.quoted ? m.text?.trim() : m.text?.replace(/@\d+/g, '').replace(/^\s*warn\s*/i, '').trim()
    const reason = reasonArg || '𝖲ı𝗇 𝗆𝗈ƚı᥎𝗈 ᧉ𝗌𝗉ᧉ𝖼ı𝖿ı𝖼⍺𝖽𝗈'
    
    let userAdvierteings = warnings[targetUsuario] || []
    userAdvierteings.push({
        reason: reason,
        by: m.sender,
        time: Date.now()
    })
    
    warnings[targetUsuario] = userAdvierteings
    db.setGroup(m.chat, { ...groupData, warnings: warnings })
    
    const warnCount = userAdvierteings.length
    const targetName = targetUsuario.split('@')[0]
    
    if (warnCount >= maxAdviertes) {
        try {
            await sock.groupParticipantsUpdate(m.chat, [targetUsuario], 'remove')
            await m.reply(
                `« ¿ 𝗊𝗎é 𝖽ᧉ𝗌ᧉ⍺𝗌 ᥎ᧉ𝗋 𝗑 ? »\n\n` +
                `🚨 *𝖫Í𝖬𝖨𝖳𝖤 𝖠𝖫𝖢𝖠𝖭𝖹𝖠𝖣𝖮*\n\n` +
                `      👤   𓈒 ◌ㅤ──    *𝖴𝗌𝗎⍺𝗋ı𝗈* : @${targetName}\n` +
                `      ⚠️   𓈒 ◌ㅤ──    *𝖤𝗌ƚ⍺𝖽𝗈* : 𝖤𝗑𝗉𝗎𝗅𝗌⍺𝖽𝗈/⍺\n` +
                `      📝   𓈒 ◌ㅤ──    *𝖬𝗈ƚı᥎𝗈 𝖿ı𝗇⍺𝗅* : ${reason}\n\n` +
                `> ❝ ¡𝖧⍺ ⍺𝗅𝖼⍺𝗇𝗓⍺𝖽𝗈 ᧉ𝗅 𝗅í𝗆ıƚᧉ 𝖽ᧉ *${maxAdviertes}* ⍺𝖽᥎ᧉ𝗋ƚᧉ𝗇𝖼ı⍺𝗌 𝗒 𝖿𝗎ᧉ ᧉ𝗅ı𝗆ı𝗇⍺𝖽𝗈/⍺ 𝖽ᧉ𝗅 𝗀𝗋𝗎𝗉𝗈! ❞\n\n` +
                `( ᴗ͈ˬᴗ͈ ) 𝑊⍺ց𝗎𝗋ı 𝖠𝗌𝗌ı𝗌ƚ⍺𝗇ƚ`,
                { mentions: [targetUsuario] }
            )
            delete warnings[targetUsuario]
            db.setGroup(m.chat, { ...groupData, warnings: warnings })
        } catch (e) {
            m.reply(te(m.prefix, m.command, m.pushName))
        }
    } else {
        await m.reply(
            `« ¿ 𝗊𝗎é 𝖽ᧉ𝗌ᧉ⍺𝗌 ᥎ᧉ𝗋 𝗑 ? »\n\n` +
            `⚠️ *𝖠𝖣𝖵𝖤𝖱𝖳𝖤𝖭𝖢𝖨𝖠 𝖣𝖠𝖣𝖠*\n\n` +
            `      👤   𓈒 ◌ㅤ──    *𝖴𝗌𝗎⍺𝗋ı𝗈* : @${targetName}\n` +
            `      🚨   𓈒 ◌ㅤ──    *𝖨𝗇𝖿𝗋⍺𝖼𝖼ıó𝗇* : ${warnCount}/${maxAdviertes}\n` +
            `      📝   𓈒 ◌ㅤ──    *𝖬𝗈ƚı᥎𝗈* : ${reason}\n\n` +
            `> ❝ ¡𝖳ᧉ 𝗊𝗎ᧉ𝖽⍺𝗇 *${maxAdviertes - warnCount}* ⍺𝖽᥎ᧉ𝗋ƚᧉ𝗇𝖼ı⍺𝗌 ⍺𝗇ƚᧉ𝗌 𝖽ᧉ 𝗌ᧉ𝗋 ᧉ𝗑𝗉𝗎𝗅𝗌⍺𝖽𝗈/⍺! ❞\n\n` +
            `( ᴗ͈ˬᴗ͈ ) 𝑊⍺ց𝗎𝗋ı 𝖠𝗌𝗌ı𝗌ƚ⍺𝗇ƚ`,
            { mentions: [targetUsuario] }
        )
    }
}

export { pluginConfig as config, handler }
