let handler = async (m, { conn, text, usedPrefix, command }) => {
    let id = ''

    // Opción 1: Respondiendo a un mensaje reenviado desde un canal
    if (m.quoted && (m.quoted.newsletterJid || m.quoted.msg?.contextInfo?.newsletterJid)) {
        id = m.quoted.newsletterJid || m.quoted.msg.contextInfo.newsletterJid
    } 
    // Opción 2: Mediante el enlace de invitación del canal
    else if (text) {
        let match = text.match(/https:\/\/whatsapp\.com\/channel\/([a-zA-Z0-9]+)/i)
        if (match) {
            try {
                let res = await conn.newsletterMetadata('invite', match[1])
                id = res.id
            } catch (e) {
                return m.reply('✐ No se pudo obtener la información del canal con ese enlace ! ୧ ֹ ִ')
            }
        } else if (text.endsWith('@newsletter')) {
            id = text
        }
    }

    if (!id) {
        const usageText = 
            `ꕥ 𝖮𝖡𝖳𝖤𝖭𝖤𝖱 𝖨𝖣 𝖣𝖤 𝖢𝖠𝖭𝖠𝖫 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « 𝗎𝗌𝗈 ᑯᧉ𝗅 𝖼𝗈𝗆⍺𝗇ᑯ𝗈 »\n\n` +
            `      𓈒 ◌ㅤ──    *Opción 1* :: Responde a un mensaje del canal usando *${usedPrefix + command}*\n` +
            `      𓈒 ◌ㅤ──    *Opción 2* :: *${usedPrefix + command} <enlace_del_canal>*\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        return m.reply(usageText)
    }

    const caption = 
        `ꕥ 𝖨𝖣 𝖣𝖤𝖫 𝖢𝖠𝖭𝖠𝖫 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « ɩ𝗇𝖿𝗈𝗋𝗆⍺𝖼ɩó𝗇 𝗈𝖻ƚᧉ𝗇ɩᑯ⍺ »\n\n` +
        `      𓈒 ◌ㅤ──    ɩᑯ :: *${id}*\n\n` +
        `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`

    await m.reply(caption)
}

handler.help = ['idchannel <enlace/responder>']
handler.tags = ['tools']
handler.command = /^(idchannel|chid|idcanal)$/i

export default handler
