let handler = async (m, {
    conn, text, isROwner, isOwner, isAdmin, usedPrefix, command
}) => {
    if (text) {
        global.db.data.chats[m.chat].sBye = text
        try { await m.react("✅"); } catch {}
        return m.reply(
            `ꕥ 𝖣𝖤𝖲𝖯𝖤𝖣𝖨𝖣𝖠 𝖢𝖮𝖭𝖥𝖨𝖦𝖴𝖱𝖠𝖣𝖠 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `      • Nuevo mensaje :: \`${text}\`\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Recuerda que puedes usar \`@user\` para mencionar al miembro que se va. »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        )
    } else {
        return m.reply(
            `ꕥ 𝖢𝖮𝖭𝖥𝖨𝖦𝖴𝖱𝖠𝖱 𝖣𝖤𝖲𝖯𝖤𝖣𝖨𝖣𝖠 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `      • Uso correcto :: \`${usedPrefix + command} <tu mensaje>\`\n\n` +
            `      𓈒 ◌ㅤ──    *𝖤𝖩𝖤𝖬𝖯𝖫𝖮 𝖣𝖤 𝖴𝖲𝖮*\n` +
            `      \`${usedPrefix + command} ¡Adiós por fin, @user! Te extrañaremos...\`\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Escribe el texto que deseas configurar junto al comando. »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        )
    }
}

handler.help = ['setbye']
handler.tags = ['group']
handler.command = /^(setbye)$/i
handler.group = true
handler.admin = true

export default handler
