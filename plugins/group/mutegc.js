import { getDatabase } from "../../src/lib/rimuru-database.js";
import { saluranCtx } from "../../src/lib/rimuru-context.js";

const pluginConfig = {
  name: "mutegc",
  alias: ["mutegrup", "mutebot", "blockbot", "lockbot"],
  category: "group",
  description: "Bloquea el uso de comandos del bot para los miembros comunes del grupo (restringido únicamente a admins y owner).",
  usage: ".mutegc",
  example: ".mutegc",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  isAdmin: true,
  isBotAdmin: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const groupData = db.getGroup(m.chat) || {};

  if (groupData.mutegc) {
    return m.reply(
      `ꕥ 𝖡𝖮𝖳 𝖸𝖠 𝖲𝖨𝖫𝖤𝖭𝖢𝖨𝖠𝖣𝖮 𝖤𝖭 𝖦𝖱𝖴𝖯𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
      `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « El sistema anti-comandos para miembros ya se encuentra activo en este chat. »\n\n` +
      `> 💡 Tip: Escribe \`${m.prefix}unmutegc\` para restaurar el acceso público a todos los participantes.\n\n` +
      `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    );
  }

  db.setGroup(m.chat, { ...groupData, mutegc: true });
  const ctx = saluranCtx();
  const groupName = m.groupMetadata?.subject || "este grupo";

  try { await m.react('🔇'); } catch {}

  return m.reply(
    `ꕥ 𝖬𝖴𝖳𝖤 𝖦𝖱𝖴𝖯𝖮 𝖠𝖢𝖳𝖨𝖵𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
    `      • Grupoo afectado :: *${groupName}*\n` +
    `      • Restricción :: *Comandos bloqueados para miembros*\n` +
    `      • Excepciones :: *Solo administradores y el owner conservan acceso*\n\n` +
    `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Escribe \`${m.prefix}unmutegc\` para deshabilitar esta restricción y permitir comandos a todos. »\n\n` +
    `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`,
    { contextInfo: ctx }
  );
}

function isSilenciagc(groupJid, db) {
  const group = db.getGroup(groupJid) || {};
  return !!group.mutegc;
}

export { pluginConfig as config, handler, isSilenciagc };
