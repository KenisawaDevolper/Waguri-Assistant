import { getDatabase } from "../../src/lib/rimuru-database.js";

const EXP_PER_LEVEL = 10000;

const pluginConfig = {
  name: "level",
  alias: ["lvl", "ceklevel"],
  category: "user",
  description: "Consulta el nivel y estadísticas de RPG del usuario",
  usage: ".level [@usuario]",
  example: ".level",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

function calculateLevel(exp) {
  return Math.floor(exp / EXP_PER_LEVEL) + 1;
}

function expForLevel(level) {
  return (level - 1) * EXP_PER_LEVEL;
}

function expToNextLevel(exp) {
  const currentLevel = calculateLevel(exp);
  const nextLevelExp = expForLevel(currentLevel + 1);
  return nextLevelExp - exp;
}

function getRole(level) {
  if (level >= 100) return "𝖬ʏᴛʜɪᴄ";
  if (level >= 80) return "𝖫ᴇɢᴇɴᴅ";
  if (level >= 60) return "𝖤ᴘɪᴄ";
  if (level >= 40) return "𝖦ʀᴀɴᴅᴍᴀsᴛᴇʀ";
  if (level >= 20) return "𝖬ᴀsᴛᴇʀ";
  if (level >= 10) return "𝖤ʟɪᴛᴇ";
  return "𝖶ᴀʀʀɪᴏʀ";
}

function getLevelBar(current, target) {
  const totalBars = 10;
  const filledBars = Math.min(
    Math.floor((current / target) * totalBars),
    totalBars,
  );
  const emptyBars = totalBars - filledBars;
  return "▰".repeat(filledBars) + "▱".repeat(emptyBars);
}

async function handler(m, { sock }) {
  const db = getDatabase();

  let targetJid = m.sender;
  let targetName = m.pushName || "Usuario";

  if (m.quoted) {
    targetJid = m.quoted.sender;
    targetName = m.quoted.pushName || targetJid.split("@")[0];
  } else if (m.mentionedJid?.length) {
    targetJid = m.mentionedJid[0];
    targetName = targetJid.split("@")[0];
  }

  const user = db.getUser(targetJid) || db.setUser(targetJid);
  if (!user.rpg) user.rpg = {};

  const exp = user.exp || 0;
  const level = calculateLevel(exp);
  const role = getRole(level);
  const currentLevelExp = expForLevel(level);
  const nextLevelExp = expForLevel(level + 1);
  const expInLevel = exp - currentLevelExp;
  const expNeeded = nextLevelExp - currentLevelExp;
  const progress = getLevelBar(expInLevel, expNeeded);

  let txt = `*¡Hola, buenas tardes!* ฅ^·ﻌ·^ฅ\n`;
  txt += `> _Consulta de nivel y experiencia ≽^• ˕ • ྀི≼_\n\n`;

  txt += `## ꕥ *W⍺gurı 𝖠ssı𝗌ƚ⍺nƚ* (*ᴗ͈ˬᴗ͈)ꕤ\n`;
  txt += `> 𝖫𝖤𝖵𝖤𝖫 𝖨𝖭𝖥𝖮𝖱𝖬𝖠𝖢𝖨Ó𝖭\n\n`;

  txt += `*〔 𝖴𝖲𝖴𝖠𝖱𝖨𝖮 〕*\n`;
  txt += `> Nombre: *${targetName}*\n`;
  txt += `> Mención: @${targetJid.split("@")[0]}\n\n`;

  txt += `*〔 𝖲𝖳𝖠𝖳𝖲 𝖣𝖤 𝖱𝖯𝖦 〕*\n`;
  txt += `> Nivel actual: *${level}*\n`;
  txt += `> Rango / Rol: *${role}*\n`;
  txt += `> EXP total: *${exp.toLocaleString("es-ES")}* XP\n`;
  txt += `> Progreso de nivel:\n`;
  txt += `> ${progress}\n`;
  txt += `> _${expInLevel.toLocaleString("es-ES")} / ${expNeeded.toLocaleString("es-ES")} XP_\n\n`;

  txt += `> Te faltan *${expToNextLevel(exp).toLocaleString("es-ES")} XP* para subir al siguiente nivel.\n\n`;
  txt += `> sɪᴍᴘʟᴇ ᴡʜᴀᴛsᴀᴘᴘ ʙᴏᴛ ツ`;

  await m.reply(txt, { mentions: [targetJid] });
}

export {
  pluginConfig as config,
  handler,
  calculateLevel,
  expForLevel,
  expToNextLevel,
  getRole,
};
