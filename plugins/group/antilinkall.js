import { getDatabase } from "../../src/lib/rimuru-database.js";

const pluginConfig = {
  name: "antilinkall",
  alias: ["alall", "antialllink"],
  category: "group",
  description: "Gestiona la protección antienlaces generales con detección de extensiones de dominio bajo la estética Waguri Assistant",
  usage: ".antilinkall <on/off/metode> [kick/remove]",
  example: ".antilinkall on",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
  isAdmin: true,
  isBotAdmin: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const option = m.args?.[0]?.toLowerCase()?.trim();

  if (!option) {
    const groupData = db.getGroup(m.chat) || {};
    const status = groupData.antilinkall || "off";
    const mode = groupData.antilinkallMode || "remove";

    return m.reply(
      `ꕥ 𝖠𝖭𝖳𝖨𝖫𝖨𝖭𝖪 𝖠𝖫𝖫 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
      `      𓈒 ◌ㅤ──    *𝖤𝖲𝖳𝖠𝖡𝖫𝖤𝖢𝖨𝖬𝖨𝖤𝖭𝖳𝖮𝖲*\n` +
      `      • Estado :: ${status === "on" ? "ACTIVO ✅" : "INACTIVO ❌"}\n` +
      `      • Modo :: *${mode.toUpperCase()}*\n\n` +
      `      𓈒 ◌ㅤ──    *𝖣𝖤𝖳𝖤𝖢𝖢𝖨𝖮𝖭*\n` +
      `      • Enlaces http:// / https://\n` +
      `      • Subdominios www.\n` +
      `      • Extensiones de dominio (.com, .id, .io, etc.)\n` +
      `      • Enlaces cortos (bit.ly, t.me, etc.)\n\n` +
      `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Comandos:\n` +
      `> \`${m.prefix}antilinkall on\` — Activar\n` +
      `> \`${m.prefix}antilinkall off\` — Desactivar\n` +
      `> \`${m.prefix}antilinkall metode kick\` — Modo expulsión\n` +
      `> \`${m.prefix}antilinkall metode remove\` — Modo eliminación »\n\n` +
      `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    );
  }

  if (option === "on") {
    db.setGroup(m.chat, { antilinkall: "on" });
    try { await m.react('✅') } catch {}
    return m.reply(
      `ꕥ 𝖠𝖭𝖳𝖨𝖫𝖨𝖭𝖪 𝖠𝖫𝖫 𝖠𝖢𝖳𝖨𝖵𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
      `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Se ha activado el sistema Antilink All. Detectará cualquier tipo de enlace automáticamente. »\n\n` +
      `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    );
  }

  if (option === "off") {
    db.setGroup(m.chat, { antilinkall: "off" });
    try { await m.react('❌') } catch {}
    return m.reply(
      `ꕥ 𝖠𝖭𝖳𝖨𝖫𝖨𝖭𝖪 𝖠𝖫𝖫 𝖣𝖤𝖲𝖠𝖢𝖳𝖨𝖵𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
      `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « El sistema Antilink All se ha desactivado en este grupo. »\n\n` +
      `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    );
  }

  if (option === "metode") {
    const method = m.args?.[1]?.toLowerCase();
    if (method === "kick") {
      db.setGroup(m.chat, { antilinkall: "on", antilinkallMode: "kick" });
      return m.reply(
        `ꕥ 𝖬𝖮𝖣𝖮 𝖪𝖨𝖢𝖪 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Antilink All configurado en modo *KICK*. Los usuarios que envíen enlaces serán expulsados. »\n\n` +
        `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
      );
    } else if (method === "remove" || method === "delete") {
      db.setGroup(m.chat, { antilinkall: "on", antilinkallMode: "remove" });
      return m.reply(
        `ꕥ 𝖬𝖮𝖣𝖮 𝖱𝖤𝖬𝖮𝖵𝖤 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Antilink All configurado en modo *REMOVE*. Los mensajes con enlaces serán eliminados. »\n\n` +
        `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
      );
    } else {
      return m.reply(
        `ꕥ 𝖬𝖤𝖳𝖮𝖣𝖮 𝖨𝖭𝖵𝖠𝖫𝖨𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Usa \`kick\` o \`remove\` (ej: \`${m.prefix}antilinkall metode kick\`). »\n\n` +
        `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
      );
    }
  }

  if (option === "kick") {
    db.setGroup(m.chat, { antilinkall: "on", antilinkallMode: "kick" });
    return m.reply(
      `ꕥ 𝖬𝖮𝖣𝖮 𝖪𝖨𝖢𝖪 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
      `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Antilink All configurado en modo *KICK* exitosamente. »\n\n` +
      `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    );
  }

  if (option === "remove" || option === "delete") {
    db.setGroup(m.chat, { antilinkall: "on", antilinkallMode: "remove" });
    return m.reply(
      `ꕥ 𝖬𝖮𝖣𝖮 𝖱𝖤𝖬𝖮𝖵𝖤 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
      `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Antilink All configurado en modo *REMOVE* exitosamente. »\n\n` +
      `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    );
  }

  return m.reply(
    `ꕥ 𝖮𝖯𝖢𝖨𝖮𝖭 𝖨𝖭𝖵𝖠𝖫𝖨𝖣𝖠 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
    `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Usa \`on\`, \`off\`, \`metode kick\` o \`metode remove\`. »\n\n` +
    `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
  );
}

export { pluginConfig as config, handler };
