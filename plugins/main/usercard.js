import config from "../../config.js";

const pluginConfig = {
  name: "usercard",
  alias: ["kartu", "mycard", "tarjeta", "perfil"],
  category: "main",
  description: "Muestra la tarjeta de perfil del usuario",
  usage: ".usercard [reply/tag]",
  example: ".usercard",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

function targetJid(m) {
  return m.mentionedJid?.[0] || m.quoted?.sender || m.sender;
}

async function handler(m, { sock, db }) {
  const jid = targetJid(m);
  const user = db.getUsuario?.(jid) || db.setUsuario?.(jid) || {};
  
  let name = (jid === m.sender ? m.pushName : null) || jid.split("@")[0];

  if (m.isGroup) {
    try {
      const meta = await sock.groupMetadata(m.chat);
      const p = meta.participants?.find(x => (x.id || x.jid) === jid);
      if (p?.notify || p?.name) name = p.notify || p.name;
    } catch {}
  }

  const premium = Boolean(user.isPremium || user.premium);
  const energi = user.energi ?? 0;
  const exp = user.exp ?? user.xp ?? 0;
  const level = user.level ?? Math.floor(Number(exp) / 100) + 1;

  const caption = 
    `ꕥ 𝖳𝖠𝖱𝖩𝖤𝖳𝖠 𝖣𝖤 𝖴𝖲𝖴𝖠𝖱𝖨𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
    `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « ɩ𝗇𝖿𝗈𝗋𝗆⍺𝖼ɩó𝗇 ᑯᧉ𝗅 𝗎𝗌𝗎⍺𝗋ɩ𝗈 »\n\n` +
    `        𓈒 ◌ㅤ──    𝗇𝗈𝗆𝖻𝗋ᧉ :: *${name}*\n` +
    `        𓈒 ◌ㅤ──    𝗇ú𝗆ᧉ𝗋𝗈 :: *@${jid.split("@")[0]}*\n` +
    `        𓈒 ◌ㅤ──    𝗇ɩ᥎ᧉ𝗅 :: *${level}*\n` +
    `        𓈒 ◌ㅤ──    ᧉ𝘹𝗉ᧉ𝗋ɩᧉ𝗇𝖼ɩ⍺ :: *${exp}*\n` +
    `        𓈒 ◌ㅤ──    ᧉ𝗇ᧉ𝗋𝗀í⍺ :: *${energi === -1 ? "Ilimiƚ⍺ᑯ⍺" : energi}*\n` +
    `        𓈒 ◌ㅤ──    𝗉𝗋ᧉ𝗆ɩ𝗎𝗆 :: *${premium ? "Sí" : "No"}*\n\n` +
    `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ɩ𝗌ƚ⍺𝗇ƚ ツ`;

  return m.reply(caption, { mentions: [jid] });
}

export { pluginConfig as config, handler };
