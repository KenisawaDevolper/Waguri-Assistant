import { getDatabase } from "../../src/lib/rimuru-database.js";
import { getTimeGreeting } from "../../src/lib/rimuru-formatter.js";

const pluginConfig = {
  name: "daily",
  alias: ["claim", "harian", "bonus"],
  category: "user",
  description: "Reclama tu recompensa diaria (Exp, Monedas, Poción)",
  usage: ".daily",
  example: ".daily",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 0,
  energi: 0,
  isEnabled: true,
};

const DAILY_COOLDOWN = 24 * 60 * 60 * 1000;

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);

  if (!user.cooldowns) user.cooldowns = {};
  const lastDaily = user.cooldowns.daily || 0;
  const now = Date.now();

  if (now - lastDaily < DAILY_COOLDOWN) {
    const remaining = lastDaily + DAILY_COOLDOWN - now;
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    return m.reply(
      `*¡Hola, buenas tardes!* ฅ^·ﻌ·^ฅ\n` +
      `> _Sistema de recompensas diarias ≽^• ˕ • ྀི≼_\n\n` +
      `## ꕥ *W⍺gurı 𝖠ssı𝗌ƚ⍺nƚ* (*ᴗ͈ˬᴗ͈)ꕤ\n` +
      `> 𝖢𝖮𝖮𝖫𝖣𝖮𝖶𝖭 𝖣𝖤 𝖱𝖤𝖢𝖮𝖬𝖯𝖤𝖭𝖲𝖠\n\n` +
      `> Aviso: ¡Ya has reclamado tu recompensa hoy!\n` +
      `> Tiempo restante: *${hours} horas y ${minutes} minutos*.\n\n` +
      `> sɪᴍᴘʟᴇ ᴡʜᴀᴛsᴀᴘᴘ ʙᴏᴛ ツ`
    );
  }

  const expReward = Math.floor(Math.random() * 5000) + 1000;
  const moneyReward = Math.floor(Math.random() * 10000) + 5000;
  const potionReward = Math.floor(Math.random() * 3) + 1;

  if (!user.rpg) user.rpg = {};
  db.updateExp(m.sender, expReward);
  user.koin = (user.koin || 0) + moneyReward;

  if (!user.inventory) user.inventory = {};
  user.inventory.potion = (user.inventory.potion || 0) + potionReward;

  user.cooldowns.daily = now;
  db.save();

  const greeting = getTimeGreeting();

  let txt = `*¡Hola, buenas tardes!* ฅ^·ﻌ·^ฅ\n`;
  txt += `> _Recompensa diaria reclamada con éxito ≽^• ˕ • ྀི≼_\n\n`;
  txt += `## ꕥ *W⍺gurı 𝖠ssı𝗌ƚ⍺nƚ* (*ᴗ͈ˬᴗ͈)ꕤ\n`;
  txt += `> 𝖣𝖠𝖨𝖫𝖸 𝖱𝖤𝖶𝖠𝖱𝖣 𝖲𝖴𝖢𝖢𝖤𝖲𝖲\n\n`;
  txt += `> Saludo: ${greeting}, @${m.sender.split("@")[0]}\n\n`;
  txt += `*〔 𝖱𝖤𝖶𝖠𝖱𝖣𝖲 𝖮𝖡𝖳𝖤𝖭𝖨𝖣𝖠𝖲 〕*\n`;
  txt += `> Experiencia: *+${expReward}* XP\n`;
  txt += `> Monedas Koin: *+${moneyReward.toLocaleString("es-ES")}*\n`;
  txt += `> Poción (Potion): *+${potionReward}* unidades\n\n`;
  txt += `> ¡No olvides volver a reclamarlo mañana!\n\n`;
  txt += `> sɪᴍᴘʟᴇ ᴡʜᴀᴛsᴀᴘᴘ ʙᴏᴛ ツ`;

  await m.reply(txt, { mentions: [m.sender] });
}

export { pluginConfig as config, handler };
