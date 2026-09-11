const pluginConfig = {
    name: 'antilinkch',
    alias: ['antilinkchannel'],
    category: 'group',
    description: 'Gestiona la protección antienlaces de canales de WhatsApp en el grupo con la estética Waguri Assistant',
    usage: '.antilinkch <on/off>',
    example: '.antilinkch on',
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

async function handler(m, { args, isAdmin, isOwner, sock }) {
    if (!m.isGroup) {
        await m.reply(
            `ꕥ 𝙂𝑹𝙐𝙋𝙊 𝙍𝑿𝑸𝑼𝙄𝑬𝑹𝑶 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Esta función solo se puede usar en grupos. »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        )
        return
    }
    if (!(isAdmin || isOwner)) {
        await m.reply(
            `ꕥ 𝖠𝖢𝖢𝖤𝖲𝖮 𝖣𝖤𝖭𝖤𝖦𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Este comando es exclusivo para administradores. »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        )
        return
    }

    global.db.data.chats = global.db.data.chats || {}
    global.db.data.chats[m.chat] = global.db.data.chats[m.chat] || {}

    const action = (args || [])[0]?.toLowerCase()

    if (!action) {
        const status = global.db.data.chats[m.chat].antilinkch ? '✅ ACTIVO' : '❌ INACTIVO'
        await m.reply(
            `ꕥ 𝘈𝘕𝘛𝘐𝘓𝘐𝘕𝘒 𝘊𝘏𝘈𝘕𝘕𝘌𝘓 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `      𓈒 ◌ㅤ──    *𝖤𝖲𝖳𝖠𝖡𝖫𝖤𝖢𝖨𝖬𝖨𝖤𝖭𝖳𝖮*\n` +
            `      • Estado :: ${status}\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Uso: \`${m.prefix}antilinkch on\` o \`${m.prefix}antilinkch off\`. »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        )
        return
    }

    if (action === "on") {
        if (global.db.data.chats[m.chat].antilinkch) {
            await m.reply(
                `ꕥ 𝖸𝖠 𝘈𝘊𝘛𝘐𝘝𝘈𝘋𝘖 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « El sistema Antilink de canales ya se encuentra activo. »\n\n` +
                `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
            )
            return
        }
        global.db.data.chats[m.chat].antilinkch = true
        try { await m.react('✅') } catch {}
        await m.reply(
            `ꕥ 𝘈𝘕𝘛𝘐𝘓𝘐𝘕𝘒 𝘊𝘏𝘈𝘕𝘕𝘌𝘓 𝘈𝘊𝘛𝘐𝘝𝘈𝘋𝘖 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Antilink channel se ha activado exitosamente. »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        )
        return
    }

    if (action === "off") {
        if (!global.db.data.chats[m.chat].antilinkch) {
            await m.reply(
                `ꕥ 𝖸𝖠 𝘋𝘌𝘚𝘈𝘊𝘛𝘐𝘝𝘈𝘋𝘖 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « El sistema Antilink de canales ya está desactivado. »\n\n` +
                `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
            )
            return
        }
        global.db.data.chats[m.chat].antilinkch = false
        try { await m.react('❌') } catch {}
        await m.reply(
            `ꕥ 𝘈𝘕𝘛𝘐𝘓𝘐𝘕𝘒 𝘊𝘏𝘈𝘕𝘕𝘌𝘓 𝘋𝘌𝘚𝘈𝘊𝘛𝘐𝘝𝘈𝘋𝘖 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Antilink channel se ha desactivado correctamente. »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        )
        return
    }

    await m.reply(
        `ꕥ 𝙂𝑼𝘐𝘼 𝘐𝘕𝘝𝘈𝘓𝘐𝘋𝘈 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Usa \`${m.prefix}antilinkch on\` o \`${m.prefix}antilinkch off\`. »\n\n` +
        `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    )
}

async function before(m, { sock, isBotAdmin, usedPrefix, isAdmin }) {
    if (!m.isGroup) return
    if (!isBotAdmin) return

    if (typeof m.text === "string") {
        const txt = m.text.toLowerCase()
        if (txt.startsWith((usedPrefix || ".") + "antilinkch")) return
    }

    global.db.data.chats = global.db.data.chats || {}
    global.db.data.chats[m.chat] = global.db.data.chats[m.chat] || {}

    if (!global.db.data.chats[m.chat].antilinkch) return

    let text = m.text || ''
    let isChannel = /https?:\/\/(www\.)?whatsapp\.com\/channel\/[^\s]+/i.test(text)

    if (!isChannel) return
    if (isAdmin) return

    try {
        await sock.sendMessage(m.chat, {
            delete: {
                remoteJid: m.chat,
                fromMe: false,
                id: m.key.id,
                participant: m.sender
            }
        })
    } catch {}

    let who = m.mentionedJid?.[0] || m.quoted?.sender || m.sender

    return sock.sendMessage(m.chat, {
        text: `ꕥ 𝘈𝘕𝘛𝘐𝘓𝘐𝘕𝘒 𝘊𝘏𝘈𝘕𝘕𝘌𝘓 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\nଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « @${who.split('@')[0]} está prohibido compartir enlaces de canales aquí. »\n\n> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`,
        mentions: [who]
    })
}

export { pluginConfig as config, handler, before }
