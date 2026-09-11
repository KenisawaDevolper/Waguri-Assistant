import axios from 'axios'
import { getParticipantJid, resolveAnyLidToJid } from '../../src/lib/rimuru-lid.js'
import * as timeHelper from '../../src/lib/rimuru-time.js'
import te from '../../src/lib/rimuru-error.js'

const pluginConfig = {
    name: 'groupinfo',
    alias: ['infogroup', 'gcinfo', 'infogc', 'gc'],
    category: 'group',
    description: 'Muestra información detallada del grupo, configuraciones y protecciones activas.',
    usage: '.groupinfo',
    example: '.groupinfo',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true,
    isAdmin: false,
    isBotAdmin: false
}

function featureStatus(val) {
    if (val === true || val === 'on') return '✅'
    return '❌'
}

async function handler(m, { sock, db }) {
    try {
        const groupMeta = m.groupMetadata
        const participants = groupMeta.participants || []
        const admins = participants.filter(p => p.admin)

        let ownerJid = null
        if (groupMeta.owner) ownerJid = resolveAnyLidToJid(groupMeta.owner, participants)
        if (!ownerJid || ownerJid.includes('@lid')) {
            const superAdmin = participants.find(p => p.admin === 'superadmin')
            if (superAdmin) ownerJid = getParticipantJid(superAdmin)
        }
        if (!ownerJid || ownerJid.includes('@lid')) {
            const firstAdmin = admins[0]
            if (firstAdmin) ownerJid = getParticipantJid(firstAdmin)
        }

        const group = db.getGroup(m.chat) || {}

        const createdDate = groupMeta.creation
            ? timeHelper.fromTimestamp(groupMeta.creation * 1000, 'D MMMM YYYY')
            : 'Desconocida'

        const ownerNumber = ownerJid ? ownerJid.split('@')[0] : null
        const ownerDisplay = ownerNumber && !ownerNumber.includes(':')
            ? `@${ownerNumber}`
            : 'Desconocido'

        let ppUrl = null
        try {
            ppUrl = await sock.profilePictureUrl(m.chat)
        } catch {}

        const isOpen = groupMeta.announce === false || !groupMeta.announce

        let text = `ꕥ 𝖨𝖭𝖥𝖮𝖱𝖬𝖠𝖢𝖨𝖀́𝖭 𝖣𝖤𝖫 𝖦𝖱𝖴𝖯 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                   `      𓈒 ◌ㅤ──    *𝖣𝖮𝖳𝖮𝖲 𝖦𝖤𝖭𝖤𝖱𝖠𝖫𝖤𝖲*\n` +
                   `      • Nombre :: *${groupMeta.subject}*\n` +
                   `      • ID del chat :: \`${m.chat}\`\n` +
                   `      • Creador/Owner :: ${ownerDisplay}\n` +
                   `      • Fecha de creación :: ${createdDate}\n` +
                   `      • Estado del chat :: ${isOpen ? '🔓 Abierto (Todos escriben)' : '🔒 Cerrado (Solo admins)'}\n\n` +

                   `      𓈒 ◌ㅤ──    *📊 𝖬𝖨𝖤𝖬𝖡𝖱𝖮𝖲*\n` +
                   `      • Total de integrantes :: *${participants.length}*\n` +
                   `      • Administradores :: *${admins.length}*\n` +
                   `      • Participantes comunes :: *${participants.length - admins.length}*\n\n` +

                   `      𓈒 ◌ㅤ──    *🔧 𝖥𝖨𝖳𝖴𝖱𝖠𝖲 𝖠𝖢𝖳𝖨𝖵𝖠𝖲*\n` +
                   `      • Bienvenida :: ${featureStatus(group.welcome)}\n` +
                   `      • Despedida :: ${featureStatus(group.goodbye)}\n` +
                   `      • Autoreply :: ${featureStatus(group.autoreply)}\n` +
                   `      • AutoAI :: ${featureStatus(group.autoai)}\n` +
                   `      • AutoDL :: ${featureStatus(group.autodl)}\n` +
                   `      • AutoSticker :: ${featureStatus(group.autosticker)}\n` +
                   `      • AutoMedia :: ${featureStatus(group.automedia)}\n\n` +

                   `      𓈒 ◌ㅤ──    *🛡️ 𝖲𝖨𝖲𝖳𝖤𝖬𝖠𝖲 𝖣𝖤 𝖯𝖱𝖮𝖳𝖤𝖢𝖢𝖨𝖀́𝖭*\n` +
                   `      • AntiLink :: ${featureStatus(group.antilink)}\n` +
                   `      • AntiBot :: ${featureStatus(group.antibot)}\n` +
                   `      • AntiToxic :: ${featureStatus(group.antitoxic)}\n` +
                   `      • AntiRemove :: ${featureStatus(group.antiremove)}\n` +
                   `      • AntiHidetag :: ${featureStatus(group.antihidetag)}\n` +
                   `      • AntiSticker :: ${featureStatus(group.antisticker)}\n` +
                   `      • AntiMedia :: ${featureStatus(group.antimedia)}\n` +
                   `      • AntiDocument :: ${featureStatus(group.antidocument)}`

        if (groupMeta.desc) {
            text += `\n\n      𓈒 ◌ㅤ──    *📝 𝖣𝖤𝖲𝖢𝖱𝖨𝖯𝖢𝖨𝖀́𝖭*\n> ${groupMeta.desc}`
        }

        text += `\n\n> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`

        const mentions = ownerJid && !ownerJid.includes(':') ? [ownerJid] : []

        if (ppUrl) {
            try {
                const ppBuffer = Buffer.from((await axios.get(ppUrl, { responseType: 'arraybuffer', timeout: 10000 })).data)
                await sock.sendMessage(m.chat, {
                    image: ppBuffer,
                    caption: text,
                    mentions
                }, { quoted: m })
            } catch {
                await m.reply(text, { mentions })
            }
        } else {
            await m.reply(text, { mentions })
        }
    } catch (error) {
        return m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
