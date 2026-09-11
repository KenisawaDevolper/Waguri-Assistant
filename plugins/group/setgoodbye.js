import { getDatabase } from "../../src/lib/rimuru-database.js";

const pluginConfig = {
  name: "setgoodbye",
  alias: ["customgoodbye"],
  category: "group",
  description: "Configura y personaliza el mensaje automático de despedida (cuando un miembro sale o es expulsado).",
  usage: ".setgoodbye <mensaje>",
  example: ".setgoodbye Bye {user}, sampai jumpa lagi!",
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
  const db = getDatabase();
  const text = m.fullArgs?.trim() || m.args.join(" ");

  if (!text) {
    return m.reply(
      `ꕥ 𝖢𝖮𝖭𝖥𝖨𝖦𝖴𝖱𝖠𝖱 𝖣𝖤𝖲𝖯𝖤𝖣𝖨𝖣𝖠 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
      `      • Uso correcto :: \`${m.prefix}setgoodbye <tu mensaje>\`\n` +
      `      • Comando de reinicio :: \`${m.prefix}resetgoodbye\`\n\n` +
      `      𓈒 ◌ㅤ──    *𝖵𝖠𝖱𝖨𝖠𝖡𝖫𝖤𝖲 𝖣𝖨𝖲𝖯𝖮𝖭𝖨𝖡𝖫𝖤𝖲*\n` +
      `      • \`{user}\` — Nombre del miembro\n` +
      `      • \`{number}\` — Número telefónico\n` +
      `      • \`{group}\` — Nombre del grupo\n` +
      `      • \`{desc}\` — Descripción del grupo\n` +
      `      • \`{count}\` — Total restante de integrantes\n` +
      `      • \`{owner}\` — Administrador principal\n` +
      `      • \`{date}\` — Fecha actual (DD/MM/YYYY)\n` +
      `      • \`{time}\` — Hora actual (HH:mm)\n` +
      `      • \`{day}\` — Día de la semana\n` +
      `      • \`{bot}\` — Nombre del bot\n` +
      `      • \`{prefix}\` — Prefijo activo\n\n` +
      `      𓈒 ◌ㅤ──    *𝖤𝖩𝖤𝖬𝖯𝖫𝖮 𝖣𝖤 𝖴𝖲𝖮*\n` +
      `      \`${m.prefix}setgoodbye ¡Adiós {user}, te extrañaremos en {group}!\`\n\n` +
      `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Escribe el mensaje que deseas establecer junto al comando. »\n\n` +
      `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    );
  }

  db.setGroup(m.chat, { goodbyeMsg: text, goodbye: true, leave: true });
  db.save();

  try { await m.react("✅"); } catch {}

  await m.reply(
    `ꕥ 𝖣𝖤𝖲𝖯𝖤𝖣𝖨𝖣𝖠 𝖠𝖢𝖳𝖴𝖠𝖫𝖨𝖹𝖠𝖣𝖠 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
    `      𓈒 ◌ㅤ──    *𝖭𝖴𝖤𝖵𝖮 𝖬𝖤𝖲𝖠𝖩𝖤*\n` +
    `${text}\n\n` +
    `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Si deseas restablecerlo por defecto, utiliza el comando \`${m.prefix}resetgoodbye\`. »\n\n` +
    `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
  );
}

export { pluginConfig as config, handler };
