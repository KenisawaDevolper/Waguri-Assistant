import { clearRegistrationSession } from "./daftar.js";

const pluginConfig = {
  name: "cancelarregistro",
  alias: ["cancelreg", "bataldaftar", "regcancel"],
  category: "usuario",
  description: "Cancela la sesión de registro activa",
  usage: ".cancelarregistro",
  example: ".cancelarregistro",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
  skipRegistration: true,
};

async function handler(m) {
  const canceled = clearRegistrationSession(m.sender);

  if (!canceled) {
    return m.reply(
      `*¡Hola, buenas tardes!* ฅ^·ﻌ·^ฅ\n` +
      `> _Aviso de cancelación ≽^• ˕ • ྀི≼_\n\n` +
      `## ꕥ *W⍺gurı 𝖠ssı𝗌ƚ⍺nƚ* (*ᴗ͈ˬᴗ͈)ꕤ\n` +
      `> 𝖲𝖤𝖲𝖨Ó𝖭 𝖭𝖮 𝖤𝖭𝖢𝖮𝖭𝖳𝖱𝖠𝖣𝖠\n\n` +
      `> Aviso: No tienes ninguna sesión de registro activa.\n\n` +
      `> sɪᴍᴘʟᴇ ᴡʜᴀᴛsᴀᴘᴘ ʙᴏᴛ ツ`
    );
  }

  return m.reply(
    `*¡Hola, buenas tardes!* ฅ^·ﻌ·^ฅ\n` +
    `> _Proceso cancelado ≽^• ˕ • ྀི≼_\n\n` +
    `## ꕥ *W⍺gurı 𝖠ssı𝗌ƚ⍺nƚ* (*ᴗ͈ˬᴗ͈)ꕤ\n` +
    `> 𝖱𝖤𝖦𝖨𝖲𝖳𝖱𝖮 𝖢𝖠𝖭𝖢𝖤𝖫𝖠𝖣𝖮\n\n` +
    `> Aviso: Has cancelado el proceso de registro.\n` +
    `> Puedes iniciarlo de nuevo escribiendo: \`${m.prefix}daftar\`\n\n` +
    `> sɪᴍᴘʟᴇ ᴡʜᴀᴛsᴀᴘᴘ ʙᴏᴛ ツ`
  );
}

export { pluginConfig as config, handler };
