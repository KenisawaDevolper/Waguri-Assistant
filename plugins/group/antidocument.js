import { getDatabase } from '../../src/lib/rimuru-database.js'
import config from '../../config.js'

const pluginConfig = {
    name: 'antidocument',
    alias: ['antidoc', 'nodocument', 'nodoc'],
    category: 'group',
    description: 'Gestiona la protección contra documentos en el grupo con la estética Waguri Assistant',
    usage: '.antidocument <on/off>',
    example: '.antidocument on',
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
        antidocument: '⚠ *AntiDocument* — El documento enviado por @%user% ha sido eliminado.',
    }
    let text = config.groupProtection?.[key] || defaults[key] || ''
    for (const [k, v] of Object.entries(replacements)) {
        text = text.replace(new RegExp(`%${k}%`, 'g'), v)
    }
    return text
}

async function checkAntidocument(m, sock, db) {
    if (!m.isGroup) return false
    if (m.isAdmin || m.isOwner || m.fromMe) return false

    const groupData = db.getGroup(m.chat) || {}
    if (!groupData.antidocument) return false

    const isDocument = m.isDocument || m.type === 'documentMessage' || m.type === 'documentWithCaptionMessage'
    if (!isDocument) return false

    try {
        await sock.sendMessage(m.chat, { delete: m.key })
    } catch {}

    await sock.sendMessage(m.chat, {
        text: gpMsg('antidocument', { user: m.sender.split('@')[0] }),
        mentions: [m.sender],
    })

    return true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const action = (m.args || [])[0]?.toLowerCase()
    const groupData = db.getGroup(m.chat) || {}

    if (!action) {
        const status = groupData.antidocument ? '✅ ACTIVO' : '❌ INACTIVO'
        await m.reply(
            `ꕥ 𝖠𝖭𝖳𝖨𝖣𝖮𝖢𝖴𝖬𝖤𝖭𝖳 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `      𓈒 ◌ㅤ──    *𝖤𝖲𝖳𝖠𝖡𝖫𝖤𝖢𝖨𝖬𝖨𝖤𝖭𝖳𝖮*\n` +
            `      • Estado :: ${status}\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Uso: \`${m.prefix}antidocument on\` o \`${m.prefix}antidocument off\`. »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        )
        return
    }

    if (action === 'on') {
        db.setGroup(m.chat, { antidocument: true })
        try { await m.react('✅') } catch {}
        await m.reply(
            `ꕥ 𝖠𝖭𝖳𝖨𝖣𝖮𝖢𝖴𝖬𝖤𝖭𝖳 𝖠𝖢𝖳𝖨𝖵𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « El sistema AntiDocument se ha activado exitosamente. »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        )
        return
    }

    if (action === 'off') {
        db.setGroup(m.chat, { antidocument: false })
        try { await m.react('❌') } catch {}
        await m.reply(
            `ꕥ 𝖠𝖭𝖳𝖨𝖣𝖮𝖢𝖴𝖬𝖤𝖭𝖳 𝖣𝖤𝖲𝖠𝖢𝖳𝖨𝖵𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « El sistema AntiDocument se ha desactivado. »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        )
        return
    }

    await m.reply(
        `ꕥ 𝖮𝖯𝖢𝖨𝖮𝖭 𝖨𝖭𝖵𝖠𝖫𝖨𝖣𝖠 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Usa \`${m.prefix}antidocument on\` o \`${m.prefix}antidocument off\`. »\n\n` +
        `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    )
}

export { pluginConfig as config, handler, checkAntidocument }
