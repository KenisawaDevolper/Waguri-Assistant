import te from "../../src/lib/rimuru-error.js"

const pluginConfig = {
    name: "antispam",
    alias: ["antispamgc"],
    category: "group",
    description: "Gestiona la protección contra spam brutal en el grupo bajo la estética Waguri Assistant",
    usage: ".antispam <on/off/action/delay>",
    example: ".antispam on\n.antispam warning\n.antispam 2",
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isAdmin: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

const spamTracker = new Map()

async function handler(m, { sock, db }) {
    const args = m.args
    const action = args[0]?.toLowerCase()
    const delayMatch = action?.match(/^(\d+)(s|ms)?$/)
    
    if (!action || (!["on", "off", "warning", "kick", "delete"].includes(action) && !delayMatch)) {
        return m.reply(
            `ꕥ 𝖠𝖭𝖳𝖨𝖲𝖯𝖠𝖬 𝖦𝖱𝖮𝖴𝖯 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `      𓈒 ◌ㅤ──    *𝖨𝖭𝖥𝖮𝖱𝖬𝖠𝖢𝖨𝖮𝖭*\n` +
            `Este sistema protege el grupo contra miembros que envían mensajes de forma repetitiva, rápida y abusiva, alterando la tranquilidad.\n\n` +
            `      𓈒 ◌ㅤ──    *𝖢𝖮𝖬𝖠𝖭𝖣𝖮𝖲 𝖯𝖱𝖨𝖭𝖢𝖨𝖯𝖠𝖫𝖤𝖲*\n` +
            `      • \`${m.prefix}antispam on\` — Activar antispam\n` +
            `      • \`${m.prefix}antispam off\` — Desactivar antispam\n\n` +
            `      𓈒 ◌ㅤ──    *𝖬𝖤𝖳𝖮𝖣𝖮𝖲 𝖣𝖤 𝖧𝖴𝖢𝖧𝖠/𝖲𝖠𝖭𝖢𝖨𝖮𝖭*\n` +
            `      • \`${m.prefix}antispam warning\` — Emitir hasta 3 avisos\n` +
            `      • \`${m.prefix}antispam kick\` — Expulsar al spammer\n` +
            `      • \`${m.prefix}antispam delete\` — Borrar el mensaje infractor\n\n` +
            `      𓈒 ◌ㅤ──    *𝖲𝖤𝖭𝖲𝖨𝖡𝖨𝖫𝖨𝖣𝖠𝖣 (𝖣𝖤𝖫𝖠𝖸)*\n` +
            `      • \`${m.prefix}antispam 2\` — Límite de 2 segundos\n` +
            `      • \`${m.prefix}antispam 1500\` — 1500 milisegundos\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        )
    }

    const groupData = db.getGroup(m.chat) || {}
    
    if (delayMatch) {
        let delayMs = parseInt(delayMatch[1])
        if (delayMatch[2] === "s" || (delayMs >= 1 && delayMs <= 10)) {
            delayMs = delayMs * 1000
        }
        
        if (delayMs < 500) delayMs = 500
        if (delayMs > 10000) delayMs = 10000
        
        groupData.antispamDelay = delayMs
        db.setGroup(m.chat, groupData)
        
        return m.reply(
            `ꕥ 𝖲𝖤𝖭𝖲𝖨𝖡𝖨𝖫𝖨𝖣𝖠𝖣 𝖠𝖭𝖳𝖨𝖲𝖯𝖠𝖬 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `      𓈒 ◌ㅤ──    *𝖭𝖴𝖤𝖵𝖮 𝖩𝖤𝖣𝖠*\n` +
            `      • Retraso máximo :: *${delayMs} ms* (${(delayMs/1000).toFixed(1)} segundos)\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Se considerará spam si los mensajes ocurren con una pausa inferior a este límite. »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        )
    }

    if (action === "on" || action === "off") {
        const isEnable = action === "on"
        if (groupData.antispam === isEnable) {
            return m.reply(
                `ꕥ 𝖲𝖨𝖭 𝖢𝖠𝖬𝖡𝖨𝖮𝖲 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « El sistema antispam ya se encontraba ${isEnable ? "activo" : "inactivo"} en este grupo. »\n\n` +
                `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
            )
        }
        
        groupData.antispam = isEnable
        db.setGroup(m.chat, groupData)
        
        try { await m.react(isEnable ? '✅' : '❌') } catch {}
        await m.reply(
            `ꕥ 𝖠𝖭𝖳𝖨𝖲𝖯𝖠𝖬 𝖣𝖨𝖯𝖤𝖱𝖡𝖠𝖱𝖴𝖨 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `      𓈒 ◌ㅤ──    *𝖤𝖲𝖳𝖠𝖡𝖫𝖤𝖢𝖨𝖬𝖨𝖤𝖭𝖳𝖮*\n` +
            `      • Estado :: *${isEnable ? "ACTIVO ✅" : "INACTIVO ❌"}*\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « El bot supervisará rigurosamente el flujo de mensajes en el chat. »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        )
    } else {
        groupData.antispamAction = action
        db.setGroup(m.chat, groupData)
        
        let textAction = ""
        if (action === "warning") textAction = "Avisos estrictos de forma gradual"
        if (action === "kick") textAction = "Expulsión automática del infractor"
        if (action === "delete") textAction = "Eliminación inmediata de mensajes molestos"
        
        await m.reply(
            `ꕥ 𝖠𝖢𝖢𝖨𝖮𝖭 𝖠𝖭𝖳𝖨𝖲𝖯𝖠𝖬 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `      𓈒 ◌ㅤ──    *𝖬𝖤𝖳𝖮𝖣𝖮 𝖣𝖤 𝖲𝖠𝖭𝖢𝖨𝖮𝖭*\n` +
            `      • Método :: *${action.toUpperCase()}*\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Acción aplicada: ${textAction}. »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        )
    }
}

async function checkSpam(m, sock, db) {
    if (!m.isGroup || m.isAdmin || m.isOwner || m.fromMe) return false
    
    const groupData = db.getGroup(m.chat)
    if (!groupData || !groupData.antispam) return false

    const senderId = m.sender
    const chatKey = `${m.chat}_${senderId}`
    const now = Date.now()
    const delayThreshold = groupData.antispamDelay || 2000

    const userData = spamTracker.get(chatKey) || { count: 0, lastMessage: 0, warnings: 0 }
    
    if (now - userData.lastMessage < delayThreshold) {
        userData.count += 1
    } else {
        if (now - userData.lastMessage > delayThreshold + 1000) {
            userData.count = 1
        } else {
            userData.count = Math.max(1, userData.count - 1)
        }
    }
    
    userData.lastMessage = now
    spamTracker.set(chatKey, userData)

    if (userData.count >= 5) {
        return true
    }
    
    return false
}

async function handleSpamAction(m, sock, db) {
    const groupData = db.getGroup(m.chat)
    const action = groupData.antispamAction || "warning"
    const senderId = m.sender
    const chatKey = `${m.chat}_${senderId}`
    const userData = spamTracker.get(chatKey)

    if (action === "warning") {
        userData.warnings += 1
        spamTracker.set(chatKey, userData)
        
        if (userData.warnings >= 3) {
            await m.reply(
                `ꕥ 𝖠𝖵𝖨𝖲𝖮 𝖬𝖠𝖷𝖨𝖬𝖮 𝖣𝖤 𝖲𝖯𝖠𝖬 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « @${senderId.split("@")[0]} has acumulado 3 advertencias por enviar mensajes de forma continua. ¡Detén el spam o los administradores tomarán medidas drásticas! »\n\n` +
                `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`,
                { mentions: [senderId] }
            )
            userData.warnings = 0 
            userData.count = 0
            spamTracker.set(chatKey, userData)
        } else {
            await m.reply(
                `ꕥ 𝖳𝖤𝖦𝖴𝖱𝖠𝖭 𝖣𝖤 𝖲𝖯𝖠𝖬 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                `      𓈒 ◌ㅤ──    *𝖠𝖵𝖨𝖲𝖮*\n` +
                `      • Advertencia :: *${userData.warnings} / 3*\n\n` +
                `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Hola @${senderId.split("@")[0]}, evita enviar mensajes consecutivos tan deprisa. El sistema anti-spam te ha detectado. »\n\n` +
                `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`,
                { mentions: [senderId] }
            )
            userData.count = 0 
            spamTracker.set(chatKey, userData)
        }
    } else if (action === "kick") {
        if (m.isBotAdmin) {
            await m.reply(
                `ꕥ 𝖲𝖯𝖠𝖬𝖬𝖤𝖱 𝖤𝖷𝖯𝖴𝖫𝖲𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Lo siento mucho @${senderId.split("@")[0]}, has sido expulsado automáticamente por realizar spam masivo en el grupo. »\n\n` +
                `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`, 
                { mentions: [senderId] }
            )
            await sock.groupParticipantsUpdate(m.chat, [senderId], "remove")
            spamTracker.delete(chatKey)
        } else {
            await m.reply(
                `ꕥ 𝖲𝖯𝖠𝖬 𝖣𝖤𝖳𝖤𝖢𝖳𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Se detectó spam de @${senderId.split("@")[0]}, pero no puedo expulsarle porque el bot carece de permisos de administrador. »\n\n` +
                `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`, 
                { mentions: [senderId] }
            )
            userData.count = 0
            spamTracker.set(chatKey, userData)
        }
    } else if (action === "delete") {
        if (m.isBotAdmin) {
            try {
                await sock.sendMessage(m.chat, { delete: m.key })
            } catch {}
        } else {
            userData.count = 0
            spamTracker.set(chatKey, userData)
        }
    }
}

export { pluginConfig as config, handler, checkSpam, handleSpamAction }
