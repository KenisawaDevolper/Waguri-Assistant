import { getDatabase } from "../../src/lib/rimuru-database.js";

const pluginConfig = {
  name: "rpg",
  alias: ["togglerpg"],
  category: "group",
  description: "Activa o desactiva de forma interactiva el uso de los comandos RPG para los miembros del grupo.",
  usage: ".rpg <on/off>",
  example: ".rpg on",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  isAdmin: true,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const args = m.text?.trim()?.toLowerCase();

  if (args !== "on" && args !== "off") {
    return m.reply(
      `ꕥ 𝖢𝖮𝖭𝖥𝖨𝖦𝖴𝖱𝖠𝖱 𝖬𝖴𝖭𝖣𝖮 𝖱𝖯𝖦 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
      `      • Activar :: \`${m.prefix}rpg on\`\n` +
      `      • Desactivar :: \`${m.prefix}rpg off\`\n\n` +
      `      𓈒 ◌ㅤ──    *𝖭𝖮𝖳𝖠 𝖨𝖬𝖯𝖮𝖱𝖳𝖠𝖭𝖳𝖤*\n` +
      `      • Los administradores del grupo conservan acceso al RPG en todo momento.\n\n` +
      `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Utiliza el comando junto con \`on\` u \`off\` para cambiar el estado actual. »\n\n` +
      `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    );
  }

  const db = getDatabase();
  const group = db.getGroup(m.chat) || db.setGroup(m.chat);

  const isEnable = args === "on";

  if (group.rpg === isEnable) {
    return m.reply(
      `ꕥ 𝖤𝖲𝖳𝖠𝖣𝖮 𝖲𝖨𝖬𝖨𝖫𝖠𝖱 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
      `      • Estado actual :: *${isEnable ? "✅ ACTIVADO" : "❌ DESACTIVADO"}*\n\n` +
      `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « El sistema RPG ya se encuentra en este estado dentro del grupo. »\n\n` +
      `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    );
  }

  group.rpg = isEnable;
  db.setGroup(m.chat, group);

  try { await m.react("✅"); } catch {}

  return m.reply(
    `ꕥ 𝖬𝖴𝖭𝖣𝖮 𝖱𝖯𝖦 𝖠𝖢𝖳𝖴𝖠𝖫𝖨𝖹𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
    `      • Nuevo estado :: *${isEnable ? "✨ ACTIVADO" : "⛔ DESACTIVADO"}*\n\n` +
    (isEnable
      ? `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Los miembros ya pueden interactuar con los comandos del sistema RPG. »`
      : `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Se ha restringido el uso de comandos RPG para los miembros comunes. »`) +
    `\n\n> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
  );
}

export { pluginConfig as config, handler };
