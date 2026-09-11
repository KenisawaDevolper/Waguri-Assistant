import config from '../../config.js'
import te from '../../src/lib/rimuru-error.js'

const pluginConfig = {
    name: 'acc',
    alias: ['accall', 'joinrequest', 'reqjoin'],
    category: 'group',
    description: '𝖦ᧉ𝗌ƚı𝗈𝗇⍺ 𝗅⍺𝗌 𝗌𝗈𝗅ı𝖼ıƚ𝗎𝖽ᧉ𝗌 𝖽ᧉ ı𝗇𝗀𝗋ᧉ𝗌𝗈 ⍺𝗅 𝗀𝗋𝗎𝗉𝗈 (⍺𝖼ᧉ𝗉ƚ⍺𝗋/𝗋ᧉ𝗃ᧉz⍺𝗋)',
    usage: '.acc <list|approve|reject> [all|número]',
    example: '.acc approve all',
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

function formatDate(timestamp) {
    return new Intl.DateTimeFormat('es-AR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date(timestamp * 1000))
}

async function handler(m, { sock }) {
    const args = m.args || []
    const sub = args[0]?.toLowerCase()
    const option = args.slice(1).join(' ')?.trim()

    if (!sub || !['list', 'approve', 'reject'].includes(sub)) {
        return m.reply(
            `« ¿ 𝗊𝗎é 𝖽ᧉ𝗌ᧉ⍺𝗌 ᥎ᧉ𝗋 𝗑 ? »\n\n` +
            `📋 *𝖦𝖴𝚰𝖠 𝖣𝖤 𝖲𝖮𝖫𝚰𝖢𝚰𝖳𝖴𝖣𝖤𝖲*\n\n` +
            `      📌   𓈒 ◌ㅤ──    > \`${m.prefix}acc list\`\n` +
            `      ✅   𓈒 ◌ㅤ──    > \`${m.prefix}acc approve all\`\n` +
            `      ❌   𓈒 ◌ㅤ──    > \`${m.prefix}acc reject all\`\n` +
            `      🔢   𓈒 ◌ㅤ──    > \`${m.prefix}acc approve 1|2|3\`\n` +
            `      🔢   𓈒 ◌ㅤ──    > \`${m.prefix}acc reject 1|2|3\`\n\n` +
            `( ᴗ͈ˬᴗ͈ ) 𝑊⍺ց𝗎𝗋ı 𝖠𝗌𝗌ı𝗌ƚ⍺𝗇ƚ`
        )
    }

    await m.react('🕕')

    try {
        const pendingList = await sock.groupRequestParticipantsList(m.chat)

        if (!pendingList?.length) {
            await m.react('📭')
            return m.reply(
                `« ¿ 𝗊𝗎é 𝖽ᧉ𝗌ᧉ⍺𝗌 ᥎ᧉ𝗋 𝗑 ? »\n\n` +
                `📭 *𝖲𝖮𝖫𝚰𝖢𝚰𝖳𝖴𝖣𝖤𝖲 𝖵𝖠𝖢𝚫𝖲*\n\n` +
                `      ℹ️   𓈒 ◌ㅤ──    _𝖭𝗈 𝗁⍺𝗒 𝗌𝗈𝗅ı𝖼ıƚ𝗎𝖽ᧉ𝗌 𝖽ᧉ ı𝗇𝗀𝗋ᧉ𝗌𝗈 𝗉ᧉ𝗇𝖽ıᧉ𝗇ƚᧉ𝗌._\n\n` +
                `( ᴗ͈ˬᴗ͈ ) 𝑊⍺ց𝗎𝗋ı 𝖠𝗌𝗌ı𝗌ƚ⍺𝗇ƚ`
            )
        }

        if (sub === 'list') {
            let text = `« ¿ 𝗊𝗎é 𝖽ᧉ𝗌ᧉ⍺𝗌 ᥎ᧉ𝗋 𝗑 ? »\n\n📋 *𝖫𝚰𝖲𝖳𝖠 𝖣𝖤 𝖲𝖮𝖫𝚰𝖢𝚰𝖳𝖴𝖣𝖤𝖲*\n\n`
            text += `> 📊 𝖳𝗈ƚ⍺𝗅: \`${pendingList.length}\` 𝗌𝗈𝗅ı𝖼ıƚ𝗎𝖽ᧉ𝗌\n\n`

            for (let i = 0; i < pendingList.length; i++) {
                const req = pendingList[i]
                const number = req.jid?.split('@')[0] || 'Unknown'
                const method = req.request_method || '-'
                const time = req.request_time ? formatDate(req.request_time) : '-'

                text += `*${i + 1}.* @${number}\n`
                text += `      📱   𓈒 ◌ㅤ──    ${number}\n`
                text += `      📨   𓈒 ◌ㅤ──    ${method}\n`
                text += `      🕐   𓈒 ◌ㅤ──    ${time}\n\n`
            }

            text += `> 💡 𝖴𝗌⍺ \`${m.prefix}acc approve all\` 𝗈 \`${m.prefix}acc reject all\`\n\n( ᴗ͈ˬᴗ͈ ) 𝑊⍺ց𝗎𝗋ı 𝖠𝗌𝗌ı𝗌ƚ⍺𝗇ƚ`

            const mentions = pendingList.map(r => r.jid)
            await m.react('📋')
            return m.reply(text, { mentions })
        }

        const action = sub

        if (option === 'all') {
            const jids = pendingList.map(r => r.jid)

            const results = await sock.groupRequestParticipantsUpdate(m.chat, jids, action)

            const success = results.filter(r => r.status === '200' || !r.status || r.status === 200).length
            const failed = results.length - success

            const label = action === 'approve' ? '𝖠𝖢𝖤𝖯𝖳𝖠𝖣𝖮𝖲' : '𝖱𝖤𝖩𝖤𝖹𝖠𝖣𝖮𝖲'
            await m.react('✅')
            return m.reply(
                `« ¿ 𝗊𝗎é 𝖽ᧉ𝗌ᧉ⍺𝗌 ᥎ᧉ𝗋 𝗑 ? »\n\n` +
                `✅ *𝖱𝖤𝖲𝖴𝖫𝖳𝖠𝖣𝖮 — ${label}*\n\n` +
                `      ✔️   𓈒 ◌ㅤ──    *𝖡ᧉ𝗋𝗋ᧉ𝗌ᧉ𝗇* : \`${success}\`\n` +
                `      ❌   𓈒 ◌ㅤ──    *𝖦⍺𝗀⍺𝗅* : \`${failed}\`\n` +
                `      📊   𓈒 ◌ㅤ──    *𝖳𝗈ƚ⍺𝗅* : \`${results.length}\`\n\n` +
                `( ᴗ͈ˬᴗ͈ ) 𝑊⍺ց𝗎𝗋ı 𝖠𝗌𝗌ı𝗌ƚ⍺𝗇ƚ`
            )
        }

        const indices = option.split('|').map(n => parseInt(n.trim()) - 1).filter(n => !isNaN(n) && n >= 0 && n < pendingList.length)

        if (!indices.length) {
            await m.react('❌')
            return m.reply(
                `« ¿ 𝗊𝗎é 𝖽ᧉ𝗌ᧉ⍺𝗌 ᥎ᧉ𝗋 𝗑 ? »\n\n` +
                `❌ *𝖭Ú𝖬𝖤𝖱𝖮 𝖨𝖭𝖵Á𝖫𝚰𝖣𝖮*\n\n` +
                `      ⚠️   𓈒 ◌ㅤ──    _𝖴𝗌⍺ \`${m.prefix}acc list\` 𝗉⍺𝗋⍺ 𝗏ᧉ𝗋 𝗅⍺ 𝗅ı𝗌ƚ⍺._\n` +
                `      💡   𓈒 ◌ㅤ──    _𝖤𝗃ᧉ𝗆𝗉𝗅𝗈: \`${m.prefix}acc ${action} 1|2|3\`_\n\n` +
                `( ᴗ͈ˬᴗ͈ ) 𝑊⍺ց𝗎𝗋ı 𝖠𝗌𝗌ı𝗌ƚ⍺𝗇ƚ`
            )
        }

        const targets = indices.map(i => pendingList[i])
        let text = ''
        const label = action === 'approve' ? '𝖸ᧉ𝗌' : '𝖱ᧉ𝗃ᧉ𝖼ƚᧉ𝖽'
        let successCount = 0

        for (const target of targets) {
            try {
                const result = await sock.groupRequestParticipantsUpdate(m.chat, [target.jid], action)
                const status = result[0]?.status
                const ok = status === '200' || !status || status === 200

                const number = target.jid.split('@')[0]
                text += `      ${ok ? '✅' : '❌'}   𓈒 ◌ㅤ──    @${number} — \`${ok ? label : '𝖦⍺𝗀⍺𝗅'}\`\n`
                if (ok) successCount++
            } catch {
                const number = target.jid.split('@')[0]
                text += `      ❌   𓈒 ◌ㅤ──    @${number} — \`𝖤𝗋𝗋𝗈𝗋\`\n`
            }
        }

        await m.react('✅')
        const mentions = targets.map(t => t.jid)
        return m.reply(
            `« ¿ 𝗊𝗎é 𝖽ᧉ𝗌ᧉ⍺𝗌 ᥎ᧉ𝗋 𝗑 ? »\n\n` +
            `📋 *𝖱𝖤𝖲𝖴𝖫𝖳𝖠𝖣𝖮 𝖣𝖤 𝖦𝖤𝖲𝖳𝚰Ó𝖭*\n\n` +
            text + `\n` +
            `      📊   𓈒 ◌ㅤ──    *𝖤𝗃ᧉ𝖼𝗎ƚ⍺𝖽𝗈𝗌* : \`${successCount}/${targets.length}\` ᧉ𝗑ıƚ𝗈𝗌𝗈𝗌\n\n` +
            `( ᴗ͈ˬᴗ͈ ) 𝑊⍺ց𝗎𝗋ı 𝖠𝗌𝗌ı𝗌ƚ⍺𝗇ƚ`,
            { mentions }
        )
    } catch (error) {
        await m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
