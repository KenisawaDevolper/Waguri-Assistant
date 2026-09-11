let handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!args[0] || isNaN(args[0])) {
        return m.reply(`✐ ¡Ingresa un número que represente la cantidad de días! ୧ ֹ ִ\n\n· ⛁ :: Ejemplo: *${usedPrefix + command} 30*`)
    }

    let who
    if (m.isGroup) who = args[1] ? args[1] : m.chat
    else who = args[1] || m.chat

    if (!global.db.data.chats[who]) global.db.data.chats[who] = {}

    var jumlahDía = 86400000 * Math.abs(parseInt(args[0]))
    var now = Date.now()
    
    if (global.db.data.chats[who].expired && now < global.db.data.chats[who].expired) {
        global.db.data.chats[who].expired += jumlahDía
    } else {
        global.db.data.chats[who].expired = now + jumlahDía
    }

    const remaining = msToDate(global.db.data.chats[who].expired - now)

    const caption = 
        `ꕥ 𝖤𝖷𝖯𝖨𝖱𝖠𝖢𝖨Ó𝖭 𝖣𝖤𝖫 𝖦𝖱𝖴𝖯𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « 𝖼𝗈𝗇𝖿ɩ𝗀𝗎𝗋⍺𝖼ɩó𝗇 ᧉ𝘹𝗉ɩ𝗋⍺ᑯ⍺ »\n\n` +
        `        𓈒 ◌ㅤ──    ᑯí⍺𝗌 ⍺ñ⍺ᑯɩᑯ𝗈𝗌 :: *${args[0]} días*\n` +
        `        𓈒 ◌ㅤ──    ƚɩᧉ𝗆𝗉𝗈 𝗋ᧉ𝗌ƚ⍺𝗇ƚᧉ :: *${remaining}*\n\n` +
        `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`

    await conn.reply(m.chat, caption, m)
}

handler.help = ['setexpired <días>', 'setsewa <días>']
handler.tags = ['owner']
handler.command = /^(setexpired|setsewa|alquiler)$/i
handler.rowner = true
handler.group = true

export default handler

function msToDate(ms) {
    let days = Math.floor(ms / (24 * 60 * 60 * 1000));
    let daysms = ms % (24 * 60 * 60 * 1000);
    let hours = Math.floor((daysms) / (60 * 60 * 1000));
    let hoursms = ms % (60 * 60 * 1000);
    let minutes = Math.floor((hoursms) / (60 * 1000));
    return `${days} días, ${hours} horas y ${minutes} mins`;
}
