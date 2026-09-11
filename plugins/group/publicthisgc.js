import { getDatabase } from "../../src/lib/rimuru-database.js";
import te from "../../src/lib/rimuru-error.js";
import config from "../../config.js";

const pluginConfig = {
  name: "publicthisgc",
  alias: ["publicgc", "publicgroup", "publicthisgroup"],
  category: "group",
  description: "Activa el modo público exclusivamente en este grupo (override global), permitiendo que el bot responda a todos los miembros.",
  usage: ".publicthisgc",
  example: ".publicthisgc",
  isOwner: true,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const selfGroups = db.setting("selfGroups") || [];
  const publicGroups = db.setting("publicGroups") || [];

  const isSelfGroup = selfGroups.includes(m.chat);
  const isPublicGroup = publicGroups.includes(m.chat);

  if (isPublicGroup && !isSelfGroup) {
    return m.reply(
      `ꕥ 𝖦𝖱𝖴𝖯𝖮 𝖸𝖠 𝖤𝖭 𝖬𝖮𝖣𝖮 𝖯𝖴́𝖡𝖫𝖨𝖢𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
      `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « El bot ya se encuentra configurado para responder a todos los miembros en este chat grupal. »\n\n` +
      `> 💡 Tip: Usa \`${m.prefix}selfthisgc\` para restringir nuevamente el acceso.\n\n` +
      `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    );
  }

  const updatedSelf = selfGroups.filter((id) => id !== m.chat);
  db.setting("selfGroups", updatedSelf);

  if (!publicGroups.includes(m.chat)) {
    db.setting("publicGroups", [...publicGroups, m.chat]);
  }

  try { await m.react("🌐"); } catch {}

  return m.reply(
    `ꕥ 𝖬𝖮𝖣𝖮 𝖯𝖴́𝖡𝖫𝖨𝖢𝖮 𝖠𝖢𝖳𝖨𝖵𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
    `      • Estado :: *Modo público local habilitado*\n` +
    `      • Alcance :: *El bot responde a todos los miembros de este grupo*\n` +
    `      • Nota :: *Los demás chats grupales del bot no se ven afectados*\n\n` +
    `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Escribe \`${m.prefix}selfthisgc\` si deseas revertir esta configuración en el futuro. »\n\n` +
    `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
  );
}

export { pluginConfig as config, handler };
