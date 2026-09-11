import { getAllJadibotSessions, getActiveJadibots, getJadibotStatus } from '../../src/lib/rimuru-jadibot-manager.js'
import config from '../../config.js'

const pluginConfig = {
    name: 'subbots',
    alias: ['bots', 'listbots', 'jadibots', 'misbots', 'sockets'],
    category: 'owner',
    description: 'Ver lista detallada de Sub-Bots activos estilo Waguri 🌸',
    usage: '.subbots',
    example: '.subbots',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

function formatUptime(ms) {
    const s = Math.floor(ms / 1000)
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    if (h > 0) return `${h}h ${m}m ${sec}s`
    if (m > 0) return `${m}m ${sec}s`
    return `${sec}s`
}

async function handler(m, { sock }) {
    const sessions = getAllJadibotSessions()
    const active = getActiveJadibots()

    if (sessions.length === 0) {
        return m.reply(
            `ꕥ 𝖲𝖴𝖡-𝖡𝖮𝖳𝖲 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `      𓈒 ◌ㅤ──    *𝖤𝖲𝖳𝖠𝖣𝖮*\n` +
            `      • Total :: *0*\n` +
            `      • Activos :: *0*\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « No hay Sub-Bots vinculados aún. »\n` +
            `> Usa \`${m.prefix}jadibot\` para crear uno ツ\n\n` +
            `> 𝗐⍺𝗀𝗎ɾı ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ 🌸`
        )
    }

    let txt = `ꕥ 𝖲𝖴𝖡-𝖡𝖮𝖳𝖲 • 𝑊⍺ց𝗎𝗋ı 𝖠𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n`
    txt += `      𓈒 ◌ㅤ──    *𝖤𝖲𝖳𝖠𝖣Í𝖲𝖳𝖨𝖢𝖠𝖲*\n`
    txt += `      • Total :: *${sessions.length}* sesiones\n`
    txt += `      • Activos :: *${active.length}* 🟢\n`
    txt += `      • Offline :: *${sessions.length - active.length}* ⚫\n`
    txt += `      • Bot principal :: *${config.bot?.name || 'Waguri'}*\n\n`

    txt += `      𓈒 ◌ㅤ──    *𝖫𝖨𝖲𝖳𝖠 𝖣𝖤𝖳𝖠𝖫𝖫𝖠𝖣𝖠*\n`

    const mentions = []
    sessions.forEach((s, i) => {
        const status = getJadibotStatus(s.jid)
        const isOnline = s.isActive
        const emoji = isOnline ? '🟢' : '⚫'
        const label = isOnline ? 'Online' : 'Offline'
        const uptime = status?.uptime ? formatUptime(status.uptime) : '-'
        const num = s.id
        mentions.push(s.jid)
        txt += `      ${emoji} *${i + 1}.* @${num}\n`
        txt += `         ↳ ${label} ${isOnline ? `• ⏱️ ${uptime}` : ''}\n`
    })

    txt += `\nଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Comandos útiles »\n`
    txt += `> \`${m.prefix}listjadibotaktif\` — Solo activos\n`
    txt += `> \`${m.prefix}stopjadibot <num>\` — Detener uno\n`
    txt += `> \`${m.prefix}stopalljadibot\` — Detener todos\n`
    txt += `> \`${m.prefix}jadibot\` — Vincular nuevo\n\n`
    txt += `> 𝗐⍺𝗀𝗎ɾı ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ 🌸 ( ᴗ͈ˬᴗ͈ )`

    try {
        await sock.sendMessage(m.chat, {
            text: txt,
            mentions,
            contextInfo: {
                mentionedJid: mentions,
                isForwarded: true,
                forwardingScore: 999,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: config.saluran?.id || "120363400911374213@newsletter",
                    newsletterName: config.saluran?.name || "Waguri Assistant",
                    serverMessageId: 127
                }
            }
        }, { quoted: m })
    } catch {
        await m.reply(txt, { mentions })
    }
}

export { pluginConfig as config, handler }
