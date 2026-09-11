let handler = async (m, { conn, text }) => {
    let args = text.split('\n').map(arg => arg.trim())
    let name = args[0]
    let values = args.slice(1)

    if (!name) {
        return m.reply(
            `ꕥ 𝖲𝖨𝖭 𝖯𝖱𝖤𝖦𝖴𝖭𝖳𝖠 𝖮 𝖳𝖨́𝖳𝖴𝖫𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `      • Uso correcto :: \`${m.prefix}poll <pregunta>\`\n` +
            `      • Formato :: Separa las opciones usando saltos de línea (Enter).\n\n` +
            `      𓈒 ◌ㅤ──    *📋 𝖤𝖩𝖤𝖬𝖯𝖫𝖮 𝖣𝖤 𝖴𝖲𝖮*\n` +
            `      \`${m.prefix}poll Mejor videojuego móvil\`\n` +
            `      Free Fire\n` +
            `      Mobile Legends\n` +
            `      PUBG Mobile\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Proporciona una pregunta o título inicial para iniciar la encuesta. »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        )
    }

    if (values.length < 2) {
        return m.reply(
            `ꕥ 𝖮𝖯𝖢𝖨𝖮𝖭𝖤𝖲 𝖨𝖭𝖲𝖴𝖥𝖨𝖢𝖨𝖤𝖭𝖳𝖤𝖲 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Debes proporcionar al menos dos opciones separadas por saltos de línea para crear una votación válida. »\n\n` +
            `      𓈒 ◌ㅤ──    *💡 𝖤𝖩𝖤𝖬𝖯𝖫𝖮*\n` +
            `      \`${m.prefix}poll ¿A quién prefieres?\`\n` +
            `      Paolo Maldini\n` +
            `      Sergio Ramos\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        )
    }

    let poll = {
        name: name,
        values: values,
        selectableCount: true
    }

    try { await m.react('📊'); } catch {}

    return conn.sendMessage(m.chat, { poll: poll })
}

handler.help = ['poll']
handler.tags = ['group']
handler.command = /^(poll|polling)$/i
handler.group = true

export default handler
