let handler = async (m, { conn, args, usedPrefix, command }) => {
  let who
  if (m.isGroup) who = args[1] ? args[1] : m.chat
  else who = args[1]

  if (!global.db.data.chats[who]) global.db.data.chats[who] = {}

  global.db.data.chats[who].expired = false

  conn.reply(
    m.chat,
    `ꕥ 𝖤𝖷𝖯𝖨𝖱𝖠𝖢𝖨𝖮𝖭 𝖤𝖫𝖨𝖬𝖨𝖭𝖠𝖣𝖠 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
    `      • Estado :: Se ha eliminado la fecha de expiración de este grupo.\n\n` +
    `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « El bot ya no se saldrá automáticamente por tiempo de alquiler. »\n\n` +
    `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`,
    m
  )
}

handler.help = ['delexpired', 'delsewa']
handler.tags = ['owner']
handler.command = /^(delexpired|delsewa)$/i
handler.rowner = true
handler.group = true

export default handler

function msToDate(ms) {
  let days = Math.floor(ms / (24 * 60 * 60 * 1000));
  let daysms = ms % (24 * 60 * 60 * 1000);
  let hours = Math.floor((daysms) / (60 * 60 * 1000));
  let hoursms = ms % (60 * 60 * 1000);
  let minutes = Math.floor((hoursms) / (60 * 1000));
  let minutesms = ms % (60 * 1000);
  let sec = Math.floor((minutesms) / (1000));
  return days + " días " + hours + " horas " + minutes + " minutos";
}
