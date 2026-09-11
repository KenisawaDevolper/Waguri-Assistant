let handler = async (m, { conn }) => {
    if (!m.isGroup) {
        return m.reply(
            `ꕥ 𝖢𝖮𝖬𝖠𝖭𝖣𝖮 𝖲𝖮𝖫𝖮 𝖯𝖠𝖱𝖠 𝖦𝖱𝖴𝖯𝖮𝖲 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Esta función para obtener el enlace de invitación solo puede utilizarse dentro de chats grupales. »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        )
    }

    try {
        let inviteCode;
        try {
            inviteCode = await conn.groupInviteCode(m.chat)
            inviteCode = `https://chat.whatsapp.com/${inviteCode}`
        } catch {
            inviteCode = 'No se pudo obtener el enlace (Verifica que el bot sea administrador)'
        }

        try { await m.react('🔗'); } catch {}

        return m.reply(
            `ꕥ 𝖤𝖭𝖫𝖠𝖢𝖤 𝖣𝖤 𝖨𝖭𝖵𝖨𝖳𝖠𝖢𝖨𝖀́𝖭 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `      • Enlace del grupo ::\n      \`${inviteCode}\`\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Comparte este enlace con precaución para invitar nuevos participantes al chat. »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        )
    } catch (err) {
        console.log(err)
        return m.reply(
            `ꕥ 𝖤𝖱𝖱𝖮𝖱 𝖣𝖤 𝖲𝖨𝖲𝖳𝖤𝖬𝖠 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Ocurrió un error inesperado al intentar generar o recuperar el enlace del grupo. »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        )
    }
}

handler.help = ['linkgrup']
handler.tags = ['group']
handler.command = /^linkgrup$/i
handler.group = true 
handler.botAdmin = true

export default handler
