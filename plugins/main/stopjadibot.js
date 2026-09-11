import { stopJadibot, isJadibotActive, getJadibotStatus } from '../../src/lib/rimuru-jadibot-manager.js'

const pluginConfig = {
    name: 'stopjadibot',
    alias: ['detenerjadibot', 'stopbot', 'unjadibot', 'detenerbot'],
    category: 'main',
    description: 'Detén tu sesión activa de SubBot/Jadibot',
    usage: '.stopjadibot',
    example: '.stopjadibot',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

function formatUptime(ms) {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    if (hours > 0) return `${hours}h ${minutes % 60}m`
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`
    return `${seconds}s`
}

async function handler(m, { sock }) {
    const sender = m.sender
    if (!sender) return m.reply('✐ No se pudo identificar tu número ! ୧ ֹ ִ')

    if (!isJadibotActive(sender)) {
        return m.reply(
            `✐ No tienes ninguna sesión de SubBot activa ! ୧ ֹ ִ\n\n` +
            `· ⛁ :: Usa *${m.prefix}jadibot* para convertirte en bot.`
        )
    }

    const status = getJadibotStatus(sender)
    const uptime = status ? formatUptime(Date.now() - status.startedAt) : '-'

    await m.react('🕕')

    try {
        await stopJadibot(sender, false)
        await m.react('✅')

        const caption = 
            `ꕥ 𝖲𝖴𝖡𝖡𝖮𝖳 𝖣𝖤𝖳𝖤𝖭𝖨𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « 𝗌ᧉ𝗌ɩó𝗇 𝖿ɩ𝗇⍺𝗅ɩ𝗭⍺ᑯ⍺ »\n\n` +
            `        𓈒 ◌ㅤ──    𝗇ú𝗆ᧉ𝗋𝗈 :: *@${sender.split('@')[0]}*\n` +
            `        𓈒 ◌ㅤ──    ƚɩᧉ𝗆𝗉𝗈 ⍺𝖼ƚɩ᥎𝗈 :: *${uptime}*\n` +
            `        𓈒 ◌ㅤ──    𝗌ᧉ𝗌ɩó𝗇 :: *Guardada*\n\n` +
            `· ⛁ :: Usa *${m.prefix}jadibot* para reactivar tu sesión.\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`

        await m.reply(caption, { mentions: [sender] })
    } catch (e) {
        await m.react('✕')
        await m.reply(`✐ Ocurrió un error al detener el SubBot: ${e.message} ! ୧ ֹ ִ`)
    }
}

export { pluginConfig as config, handler }
