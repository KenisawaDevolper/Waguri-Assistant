let handler = async (m, { conn, args }) => {
    let list = Object.entries(global.db.data.users)
    let lim = !args || !args[0] ? 25 : isNumber(args[0]) ? parseInt(args[0]) : 25
    lim = Math.max(1, lim)
    
    list.forEach(([user, data]) => {
        if (data) data.limit = lim
    })

    const caption = 
        `ꕥ 𝖱𝖤𝖲𝖳𝖠𝖡𝖫𝖤𝖢𝖤𝖱 𝖫Í𝖬𝖨𝖳𝖤 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « ⍺𝖼ƚ𝗎⍺𝗅ɩ𝗭⍺𝖼ɩó𝗇 ᑯᧉ 𝗅í𝗆ɩƚᧉ »\n\n` +
        `      𓈒 ◌ㅤ──    𝗇𝗎ᧉ᥎𝗈 𝗅í𝗆ɩƚᧉ :: *${lim} por usuario*\n` +
        `      𓈒 ◌ㅤ──    𝗎𝗌𝗎⍺𝗋ɩ𝗈𝗌 ⍺𝖼ƚ𝗎⍺𝗅ɩ𝗭⍺ᑯ𝗈𝗌 :: *${list.length}*\n\n` +
        `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`

    await conn.reply(m.chat, caption, m)
}

handler.help = ['resetlimit <cantidad>']
handler.tags = ['owner']
handler.command = /^(resetlimit|restablecerlimite)$/i
handler.owner = true

export default handler 

function isNumber(x = 0) {
    x = parseInt(x)
    return !isNaN(x) && typeof x == 'number'
}
