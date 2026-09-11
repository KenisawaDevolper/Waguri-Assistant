const afkStorage = global.afkStorage || (global.afkStorage = new Map())

const pluginConfig = {
    name: 'afk',
    alias: ['away', 'brb'],
    category: 'group',
    description: 'Establece tu estado AFK con un motivo y la estética Waguri Assistant',
    usage: '.afk <motivo>',
    example: '.afk durmiendo un rato',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

function getAfkUser(jid) {
    return afkStorage.get(jid) || null
}

function setAfkUser(jid, reason) {
    afkStorage.set(jid, {
        reason: reason || 'Sin motivo especificado',
        time: Date.now()
    })
}

function removeAfkUser(jid) {
    afkStorage.delete(jid)
}

function isUserAfk(jid) {
    return afkStorage.has(jid)
}

function formatDuration(ms) {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    if (hours > 0) {
        return `${hours} horas ${minutes % 60} minutos`
    } else if (minutes > 0) {
        return `${minutes} minutos ${seconds % 60} segundos`
    } else {
        return `${seconds} segundos`
    }
}

async function handler(m, { sock }) {
    const reason = (m.args?.join(" ") || m.text)?.trim() || 'Sin motivo especificado'
    setAfkUser(m.sender, reason)
    
    await m.reply(
        `ꕥ 𝖲𝖳𝖠𝖳𝖴𝖲 𝖠𝖥𝖪 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `      𓈒 ◌ㅤ──    *𝖨𝖭𝖥𝖮𝖱𝖬𝖠𝖢𝖨𝖮𝖭*\n` +
        `      • Usuario :: @${m.sender.split('@')[0]}\n` +
        `      • Estado :: Ahora está AFK\n` +
        `      • Motivo :: ${reason}\n\n` +
        `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Escribe cualquier mensaje para desactivar tu estado AFK. »\n\n` +
        `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`,
        { mentions: [m.sender] }
    )
}

async function checkAfk(m, sock) {
    const afkData = getAfkUser(m.sender)
    if (afkData) {
        if (m.isCommand && m.command?.toLowerCase() === 'afk') return
        removeAfkUser(m.sender)
        const duration = formatDuration(Date.now() - afkData.time)
        
        await m.reply(
            `ꕥ 𝖠𝖥𝖪 𝖥𝖨𝖭𝖠𝖫𝖨𝖹𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `      𓈒 ◌ㅤ──    *𝖨𝖭𝖥𝖮𝖱𝖬𝖠𝖢𝖨𝖮𝖭*\n` +
            `      • Usuario :: @${m.sender.split('@')[0]}\n` +
            `      • Estado :: ¡Ha regresado!\n` +
            `      • Duración :: ${duration}\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`, 
            { mentions: [m.sender] }
        )
    }
    
    if (m.isGroup && m.mentionedJid && m.mentionedJid.length > 0) {
        for (const mentioned of m.mentionedJid) {
            const mentionedAfk = getAfkUser(mentioned)
            if (mentionedAfk) {
                const duration = formatDuration(Date.now() - mentionedAfk.time)
                
                await m.reply(
                    `ꕥ 𝖴𝖲𝖴𝖠𝖱𝖨𝖮 𝖠𝖥𝖪 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                    `      𓈒 ◌ㅤ──    *𝖨𝖭𝖥𝖮𝖱𝖬𝖠𝖢𝖨𝖮𝖭*\n` +
                    `      • Usuario :: @${mentioned.split('@')[0]}\n` +
                    `      • Motivo :: ${mentionedAfk.reason}\n` +
                    `      • Tiempo :: Hace ${duration}\n\n` +
                    `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « ¡Shhh, no lo molestes por ahora! »\n\n` +
                    `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`, 
                    { mentions: [mentioned] }
                )
            }
        }
    }
}

export { pluginConfig as config, handler, checkAfk, getAfkUser, setAfkUser, removeAfkUser, isUserAfk }
