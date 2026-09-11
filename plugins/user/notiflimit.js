import { getDatabase } from "../../src/lib/rimuru-database.js";

const pluginConfig = {
  name: "notiflimit",
  alias: ["notifenergi"],
  category: "owner",
  description: "Activa o desactiva las notificaciones globales de deducción de energía.",
  usage: ".notiflimit",
  example: ".notiflimit",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 0,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();

  const currentStatus = db.setting("notiflimit") ?? false;
  db.setting("notiflimit", !currentStatus);

  const newStatus = db.setting("notiflimit") ? "𝖠𝖢𝖳𝖨𝖵𝖮 ⟡" : "𝖣𝖤𝖲𝖠𝖢𝖳𝖨𝖵𝖠𝖣𝖮 ⟡";

  await m.reply(
    `*¡Hola, buenas tardes!* ฅ^·ﻌ·^ฅ\n` +
    `> _Configuración de notificaciones globales ≽^• ˕ • ྀི≼_\n\n` +
    `## ꕥ *W⍺gurı 𝖠ssı𝗌ƚ⍺nƚ* (*ᴗ͈ˬᴗ͈)ꕤ\n` +
    `> 𝖭ᴏᴛɪғɪᴄᴀᴄɪóɴ ᴅᴇ ʟíᴍɪᴛᴇ (ɢʟᴏʙᴀʟ)\n\n` +
    `> Estado actual: *${newStatus}*\n\n` +
    `> Cuando está activo, el bot notificará la energía restante de TODOS LOS USUARIOS cada vez que se realice una deducción al usar un comando.\n\n` +
    `> sɪᴍᴘʟᴇ ᴡʜᴀᴛsᴀᴘᴘ ʙᴏᴛ ツ`
  );
}

export { pluginConfig as config, handler };
