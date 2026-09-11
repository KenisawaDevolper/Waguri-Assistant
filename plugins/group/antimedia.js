import { getDatabase } from "../../src/lib/rimuru-database.js";
import config from "../../config.js";

const pluginConfig = {
  name: "antimedia",
  alias: ["am", "nomedia"],
  category: "group",
  description: "Gestiona la protección antimedia (bloqueo de imágenes, videos, audios o documentos) bajo la estética Waguri Assistant",
  usage: ".antimedia <on/off>",
  example: ".antimedia on",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  isAdmin: true,
  isBotAdmin: true,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

function gpMsg(key, replacements = {}) {
  const defaults = {
    antimedia: "⚠ *AntiMedia* — El archivo multimedia enviado por @%user% ha sido eliminado.",
  };
  let text = config.groupProtection?.[key] || defaults[key] || "";
  for (const [k, v] of Object.entries(replacements)) {
    text = text.replace(new RegExp(`%${k}%`, "g"), v);
  }
  return text;
}

async function checkAntimedia(m, sock, db) {
  if (!m.isGroup) return false;
  if (m.isAdmin || m.isOwner || m.fromMe) return false;

  const groupData = db.getGroup(m.chat) || {};
  if (!groupData.antimedia) return false;

  const isMedia =
    m.isImage || m.isVideo || m.isGif || m.isAudio || m.isDocument;
  if (!isMedia) return false;

  try {
    await sock.sendMessage(m.chat, { delete: m.key });
  } catch {}

  await sock.sendMessage(m.chat, {
    text: gpMsg("antimedia", { user: m.sender.split("@")[0] }),
    mentions: [m.sender],
  });

  return true;
}

async function handler(m, { sock }) {
  const db = getDatabase();
  const action = (m.args || [])[0]?.toLowerCase();
  const groupData = db.getGroup(m.chat) || {};

  if (!action) {
    const status = groupData.antimedia ? "✅ ACTIVO" : "❌ INACTIVO";
    await m.reply(
      `ꕥ 𝖠𝖭𝖳𝖨𝖬𝖤𝖣𝖨𝖠 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
      `      𓈒 ◌ㅤ──    *𝖤𝖲𝖳𝖠𝖡𝖫𝖤𝖢𝖨𝖬𝖨𝖤𝖭𝖳𝖮*\n` +
      `      • Estado :: ${status}\n\n` +
      `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Uso: \`${m.prefix}antimedia on\` o \`${m.prefix}antimedia off\`. »\n\n` +
      `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    );
    return;
  }

  if (action === "on") {
    db.setGroup(m.chat, { antimedia: true });
    try { await m.react("✅"); } catch {}
    await m.reply(
      `ꕥ 𝖠𝖭𝖳𝖨𝖬𝖤𝖣𝖨𝖠 𝖠𝖢𝖳𝖨𝖵𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
      `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « El sistema AntiMedia se ha activado exitosamente. »\n\n` +
      `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    );
    return;
  }

  if (action === "off") {
    db.setGroup(m.chat, { antimedia: false });
    try { await m.react("❌"); } catch {}
    await m.reply(
      `ꕥ 𝖠𝖭𝖳𝖨𝖬𝖤𝖣𝖨𝖠 𝖣𝖤𝖲𝖠𝖢𝖳𝖨𝖵𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
      `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « El sistema AntiMedia se ha desactivado. »\n\n` +
      `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    );
    return;
  }

  await m.reply(
    `ꕥ 𝖮𝖯𝖢𝖨𝖮𝖭 𝖨𝖭𝖵𝖠𝖫𝖨𝖣𝖠 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
    `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Usa \`${m.prefix}antimedia on\` o \`${m.prefix}antimedia off\`. »\n\n` +
    `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
  );
}

export { pluginConfig as config, handler, checkAntimedia };
