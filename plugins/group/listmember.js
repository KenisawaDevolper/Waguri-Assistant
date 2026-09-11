const pluginConfig = {
  name: "listmember",
  alias: ["memberlist", "daftarmember", "listanggota"],
  category: "group",
  description: "Muestra el listado completo y detallado de todos los miembros pertenecientes al chat grupal.",
  usage: ".listmember",
  example: ".listmember",
  isOwner: false, 
  isPremium: false, 
  isGroup: true, 
  isPrivate: false,
  cooldown: 5, 
  energi: 0, 
  isEnabled: true,
};

async function handler(m, { sock }) {
  if (!m.isGroup) {
    return m.reply(
      `ꕥ 𝖢𝖮𝖬𝖠𝖭𝖣𝖮 𝖲𝖮𝖫𝖮 𝖯𝖠𝖱𝖠 𝖦𝖱𝖴𝖯𝖮𝖲 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
      `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Esta función para ver la lista de miembros solo puede utilizarse dentro de chats grupales. »\n\n` +
      `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    )
  }

  const meta = await sock.groupMetadata(m.chat)
  const participants = meta.participants || []
  
  if (!participants.length) {
    return m.reply(
      `ꕥ 𝖣𝖠𝖳𝖮𝖲 𝖭𝖮 𝖣𝖨𝖲𝖯𝖮𝖭𝖨𝖡𝖫𝖤𝖲 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
      `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « No se han podido encontrar los datos de los integrantes de este grupo actualmente. »\n\n` +
      `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    )
  }

  const lines = participants.map((p, i) => {
    const jid = p.id || p.jid || ""
    const role = p.admin === "superadmin" ? "👑 Owner" : p.admin === "admin" ? "⭐ Admin" : "👤 Member"
    return `      • ${i + 1}. ${role} — @${jid.split("@")[0]}`
  })

  const mentions = participants.map(p => p.id || p.jid).filter(Boolean)

  try { await m.react('👥'); } catch {}

  return m.reply(
    `ꕥ 𝖫𝖨𝖲𝖳𝖠 𝖣𝖤 𝖬𝖨𝖤𝖬𝖡𝖱𝖮𝖲 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
    `      • Grupoo :: *${meta.subject || "Desconocido"}*\n` +
    `      • Total de integrantes :: *${participants.length} usuarios*\n\n` +
    `      𓈒 ◌ㅤ──    *📋 𝖭𝖮𝖬𝖁𝖱𝖤𝖲 𝖸 𝖱𝖮𝖫𝖤𝖲*\n` +
    `${lines.join("\n")}\n\n` +
    `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Listado completo generado correctamente con menciones de seguridad. »\n\n` +
    `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`, 
    { mentions }
  )
}

export { pluginConfig as config, handler }
