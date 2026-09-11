import { getDatabase } from '../../src/lib/rimuru-database.js'
import config from '../../config.js'

const pluginConfig = {
    name: 'antitoxic',
    alias: ['toxic', 'antitoxik'],
    category: 'group',
    description: 'Gestiona la protección antitoxic en el grupo bajo la estética Waguri Assistant',
    usage: '.antitoxic <on/off/warn/metode>',
    example: '.antitoxic on',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

const DEFAULT_TOXIC_WORDS = [
    'puta', 'puto', 'mierda', 'idiota', 'estúpido', 'estúpida', 'imbécil',
    'pendejo', 'pendeja', 'cabrón', 'cabrona', 'chingada', 'chingado', 'pinche',
    'culero', 'culera', 'gilipollas', 'coño', 'maricón', 'zorra'
]

function isToxic(text, toxicList) {
    if (!text || typeof text !== 'string') return { toxic: false, word: null }

    const lowerText = text.toLowerCase().trim()
    if (!lowerText) return { toxic: false, word: null }

    const words = (toxicList && toxicList.length > 0) ? toxicList : DEFAULT_TOXIC_WORDS

    for (const word of words) {
        if (!word) continue
        const lowerWord = word.toLowerCase().trim()
        if (!lowerWord) continue

        const escapedWord = lowerWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        const regex = new RegExp(`(^|\\s|[^a-zA-Z0-9])${escapedWord}($|\\s|[^a-zA-Z0-9])`, 'i')

        if (regex.test(lowerText)) {
            return { toxic: true, word }
        }
    }

    return { toxic: false, word: null }
}

function gpMsg(key, replacements = {}) {
    const defaults = {
        antitoxicAdvierte: '⚠ @%user% ha utilizado un término prohibido.\nAviso %warn% de %max%, la siguiente infracción aplicará %method%.',
        antitoxicAction: '🚫 @%user% ha sido sancionado mediante %method% por lenguaje tóxico. (%warn%/%max%)',
    }
    let text = config.groupProtection?.[key] || defaults[key] || ''
    for (const [k, v] of Object.entries(replacements)) {
        text = text.replace(new RegExp(`%${k}%`, 'g'), v)
    }
    return text
}

async function handleToxicMessage(m, sock, db, toxicWord) {
    const groupData = db.getGroup(m.chat) || {}
    const maxAdvierte = groupData.toxicMaxAdvierte || 3
    const method = groupData.toxicMethod || 'kick'
    const warnCount = (groupData.toxicAdviertes?.[m.sender] || 0) + 1

    if (!groupData.toxicAdviertes) groupData.toxicAdviertes = {}
    groupData.toxicAdviertes[m.sender] = warnCount
    db.setGroup(m.chat, groupData)

    try {
        await sock.sendMessage(m.chat, { delete: m.key })
    } catch {}

    const senderMenciona = m.sender.split('@')[0]

    if (warnCount >= maxAdvierte) {
        if (method === 'kick') {
            try {
                await sock.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
            } catch {}
        }

        groupData.toxicAdviertes[m.sender] = 0
        db.setGroup(m.chat, groupData)

        await sock.sendMessage(m.chat, {
            text: gpMsg('antitoxicAction', {
                user: senderMenciona,
                warn: String(warnCount),
                max: String(maxAdvierte),
                method
            }),
            mentions: [m.sender],
        })
    } else {
        await sock.sendMessage(m.chat, {
            text: gpMsg('antitoxicAdvierte', {
                user: senderMenciona,
                warn: String(warnCount),
                max: String(maxAdvierte),
                method
            }),
            mentions: [m.sender],
        })
    }

    return true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const args = m.args || []
    const subCommand = args[0]?.toLowerCase()

    const groupData = db.getGroup(m.chat) || {}

    if (!subCommand) {
        const status = groupData.antitoxic ? 'ACTIVO ✅' : 'INACTIVO ❌'
        const toxicCount = groupData.toxicWords?.length || DEFAULT_TOXIC_WORDS.length
        const maxAdvierte = groupData.toxicMaxAdvierte || 3
        const method = groupData.toxicMethod || 'kick'

        await m.reply(
            `ꕥ 𝖠𝖭𝖳𝖨𝖳𝖮𝖷𝖨𝖢 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `      𓈒 ◌ㅤ──    *𝖤𝖲𝖳𝖠𝖡𝖫𝖤𝖢𝖨𝖬𝖨𝖤𝖭𝖳𝖮𝖲*\n` +
            `      • Estado :: ${status}\n` +
            `      • Palabras clave :: ${toxicCount}\n` +
            `      • Máx. Advertencias :: ${maxAdvierte}\n` +
            `      • Método :: *${method.toUpperCase()}*\n\n` +
            `      𓈒 ◌ㅤ──    *𝖢𝖮𝖬𝖠𝖭𝖣𝖮𝖲*\n` +
            `      • \`${m.prefix}antitoxic on/off\`\n` +
            `      • \`${m.prefix}antitoxic warn <1-10>\`\n` +
            `      • \`${m.prefix}antitoxic metode kick/delete\`\n` +
            `      • \`${m.prefix}addtoxic <palabra>\`\n` +
            `      • \`${m.prefix}deltoxic <palabra>\`\n` +
            `      • \`${m.prefix}listtoxic\`\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        )
        return
    }

    if (subCommand === 'on') {
        db.setGroup(m.chat, { antitoxic: true })
        try { await m.react('✅') } catch {}
        await m.reply(
            `ꕥ 𝖠𝖭𝖳𝖨𝖳𝖮𝖷𝖨𝖢 𝖠𝖢𝖳𝖨𝖵𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « El sistema AntiToxic se ha activado exitosamente. »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        )
        return
    }

    if (subCommand === 'off') {
        db.setGroup(m.chat, { antitoxic: false })
        try { await m.react('❌') } catch {}
        await m.reply(
            `ꕥ 𝖠𝖭𝖳𝖨𝖳𝖮𝖷𝖨𝖢 𝖣𝖤𝖲𝖠𝖢𝖳𝖨𝖵𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « El sistema AntiToxic se ha desactivado. »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        )
        return
    }

    if (subCommand === 'warn') {
        const count = parseInt(args[1])
        if (!count || count < 1 || count > 10) {
            return m.reply(
                `ꕥ 𝖬𝖠𝖱𝖦𝖤𝖭 𝖨𝖭𝖵𝖠𝖫𝖨𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Ingresa un número del 1 al 10 (ej: \`${m.prefix}antitoxic warn 5\`). »\n\n` +
                `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
            )
        }
        db.setGroup(m.chat, { toxicMaxAdvierte: count })
        try { await m.react('✅') } catch {}
        await m.reply(
            `ꕥ 𝖶𝖠𝖱𝖭 𝖠𝖢𝖳𝖴𝖠𝖫𝖨𝖹𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Máximo de advertencias modificado a *${count}*. »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        )
        return
    }

    if (subCommand === 'metode' || subCommand === 'method' || subCommand === 'mode') {
        const method = args[1]?.toLowerCase()
        if (!method || !['kick', 'delete'].includes(method)) {
            return m.reply(
                `ꕥ 𝖬𝖤𝖳𝖮𝖣𝖮 𝖨𝖭𝖵𝖠𝖫𝖨𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Selecciona *kick* o *delete* (ej: \`${m.prefix}antitoxic metode kick\`). »\n\n` +
                `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
            )
        }
        db.setGroup(m.chat, { toxicMethod: method })
        try { await m.react('✅') } catch {}
        await m.reply(
            `ꕥ 𝖬𝖤𝖳𝖮𝖣𝖮 𝖠𝖢𝖳𝖴𝖠𝖫𝖨𝖹𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Método de sanción cambiado a *${method.toUpperCase()}*. »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        )
        return
    }

    await m.reply(
        `ꕥ 𝖮𝖯𝖢𝖨𝖮𝖭 𝖨𝖭𝖵𝖠𝖫𝖨𝖣𝖠 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Escribe \`${m.prefix}antitoxic\` para ver la lista de comandos disponibles. »\n\n` +
        `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    )
}

export { pluginConfig as config, handler, isToxic, handleToxicMessage, DEFAULT_TOXIC_WORDS }
