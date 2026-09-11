import { getDatabase } from "../../src/lib/rimuru-database.js";
import te from "../../src/lib/rimuru-error.js";
import config from "../../config.js";

const pluginConfig = {
  name: "selfthisgc",
  alias: ["selfgc", "selfgroup", "selfthisgroup"],
  category: "group",
  description: "Activa el modo exclusivo de auto-respuesta (self) únicamente para este grupo.",
  usage: ".selfthisgc",
  example: ".selfthisgc",
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

  if (isSelfGroup) {
    return m.reply(
      `ꕥ 𝖬𝖮𝖣𝖮 𝖲𝖤𝖫𝖥 𝖸𝖠 𝖠𝖢𝖳𝖨𝖵𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
      `      • Estado :: *🔒 MODO SELF*\n\n` +
      `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « El bot en este grupo ya responde exclusivamente al propietario y a sí mismo.\nUsa \`${m.prefix}publicthisgc\` para restaurar el acceso general. »\n\n` +
      `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    );
  }

  if (!selfGroups.includes(m.chat)) {
    db.setting("selfGroups", [...selfGroups, m.chat]);
  }

  const updatedPublic = publicGroups.filter((id) => id !== m.chat);
  db.setting("publicGroups", updatedPublic);

  try { await m.react("🔒"); } catch {}

  return m.reply(
    `ꕥ 𝖬𝖮𝖣𝖮 𝖲𝖤𝖫𝖥 𝖠𝖢𝖳𝖨𝖵𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
    `      • Restricción aplicada :: *Solo para este chat*\n\n` +
    `      𓈒 ◌ㅤ──    *𝖯𝖤𝖱𝖬𝖨𝖲𝖮𝖲 𝖠𝖴𝖳𝖮𝖱𝖨𝖹𝖠𝖣𝖮𝖲*\n` +
    `      • Propietario del bot (Owner)\n` +
    `      • El bot mismo (fromMe)\n\n` +
    `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Los demás grupos del bot no se ven afectados por este cambio.\nUsa \`${m.prefix}publicthisgc\` si deseas abrir el acceso nuevamente. »\n\n` +
    `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
  );
}

export { pluginConfig as config, handler };
