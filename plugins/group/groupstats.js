const pluginConfig = {
  name: "groupstats",
  alias: ["statsgrup", "statsgroup"],
  category: "group",
  description: "Muestra las estadísticas básicas y demográficas de los participantes del grupo actual.",
  usage: ".groupstats",
  example: ".groupstats",
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
      `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Esta función de estadísticas de grupo solo puede ejecutarse dentro de chats grupales. »\n\n` +
      `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    );
  }

  const meta = await sock.groupMetadata(m.chat);
  const participants = meta.participants || [];
  const admins = participants.filter(p => p.admin === "admin" || p.admin === "superadmin");
  const owner = participants.find(p => p.admin === "superadmin");
  const members = participants.length - admins.length;
  const ownerJid = owner ? (owner.id || owner.jid) : null;
  const ownerDisplay = ownerJid ? `@${ownerJid.split("@")[0]}` : "Desconocido";

  return m.reply(
    `ꕥ 𝖲𝖳𝖠𝖳𝖨𝖲𝖳𝖨𝖢𝖠𝖲 𝖣𝖤𝖫 𝖦𝖱𝖴𝖯 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
    `      𓈒 ◌ㅤ──    *📊 𝖬𝖤𝖳𝖱𝖨𝖢𝖠𝖲 𝖣𝖤𝖬𝖮𝖦𝖱𝖠𝖫𝖨𝖢𝖠𝖲*\n` +
    `      • Total de integrantes :: *${participants.length}*\n` +
    `      • Administradores :: *${admins.length}*\n` +
    `      • Miembros comunes :: *${members}*\n` +
    `      • Propietario (Owner) :: ${ownerDisplay}\n` +
    `      • ID del grupo :: \`${m.chat}\`\n\n` +
    `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Resumen general de la población actual en este chat grupal. »\n\n` +
    `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`,
    { mentions: ownerJid ? [ownerJid] : [] }
  );
}

export { pluginConfig as config, handler };
