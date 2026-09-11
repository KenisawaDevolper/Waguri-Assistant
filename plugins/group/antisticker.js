import { getDatabase } from '../../src/lib/rimuru-database.js'
import config from '../../config.js'

const pluginConfig = {
    name: 'antisticker',
    alias: ['as', 'nosticker'],
    category: 'group',
    description: 'Gestiona la protección antisticker en el grupo bajo la estética Waguri Assistant',
    usage: '.antisticker <on/off>',
    example: '.antisticker on',
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

function gpMsg(key, replacements = {}) {
    const defaults = {
        antisticker: '⚠ *AntiSticker* — El sticker enviado por @%user% ha sido eliminado.',
    }
    let text = config.groupProtection?.[key] || defaults[key] || ''
    for (const [k, v] of Object.entries(replacements)) {
        text = text.replace(new RegExp(`%${k}%`, 'g'), v)
    }
    return text
}

async function checkAntisticker(m, sock, db) {
    if (!m.isGroup) return false
    if (m.isAdmin || m.isOwner || m.fromMe) return false

    const groupData = db.getGroup(m.chat) || {}
    if (!groupData.antisticker) return false

    const isSticker = m.isSticker || m.type === 'stickerMessage'
    if (!isSticker) return false

    try {
        await sock.sendMessage(m.chat, { delete: m.key })
    } catch {}

    await sock.sendMessage(m.chat, {
        text: gpMsg('antisticker', { user: m.sender.split('@')[0] }),
        mentions: [m.sender],
    })

    return true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const action = (m.args || [])[0]?.toLowerCase()
    const groupData = db.getGroup(m.chat) || {}

    if (!action) {
        const status = groupData.antisticker ? '✅ ACTIVO' : '❌ INACTIVO'
        await m.reply(
            `ꕥ 𝖠𝖭𝖳𝖨𝖲𝖳𝖨𝖢𝖪𝖤𝖱 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `      𓈒 ◌ㅤ──    *𝖤𝖲𝖳𝖠𝖡𝖫𝖤𝖢𝖨𝖬𝖨𝖤𝖭𝖳𝖮*\n` +
            `      • Estado :: ${status}\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Uso: \`${m.prefix}antisticker on\` o \`${m.prefix}antisticker off\`. »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        )
        return
    }

    if (action === 'on') {
        db.setGroup(m.chat, { antisticker: true })
        try { await m.react('✅') } catch {}
        await m.reply(
            `ꕥ 𝖠𝖭𝖳𝖨𝖲𝖳𝖨𝖢𝖪𝖤𝖱 𝖠𝖢𝖳𝖨𝖵𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « El sistema AntiSticker se ha activado exitosamente. »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        )
        return
    }

    if (action === 'off') {
        db.setGroup(m.chat, { antisticker: false })
        try { await m.react('❌') } catch {}
        await m.reply(
            `ꕥ 𝖠𝖭𝖳𝖨𝖲𝖳𝖨𝖢𝖪𝖤𝖱 𝖣𝖤𝖲𝖠𝖢𝖳𝖨𝖵𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « El sistema AntiSticker se ha desactivado. »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        )
        return
    }

    await m.reply(
        `ꕥ 𝖮𝖯𝖢𝖨𝖮𝖭 𝖨𝖭𝖵𝖠𝖫𝖨𝖣𝖠 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Usa \`${m.prefix}antisticker on\` o \`${m.prefix}antisticker off\`. »\n\n` +
        `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    )
}

export { pluginConfig as config, handler, checkAntisticker }
