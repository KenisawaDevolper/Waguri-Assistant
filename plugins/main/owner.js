import crypto from "crypto";
import config, { getOwnerName } from "../../config.js";
import { getDatabase } from "../../src/lib/rimuru-database.js";
import {
  proto,
  generateWAMessageFromContent,
  prepareWAMessageMedia,
} from "ourin";
import { AIRich } from "../../src/lib/rimuru-builder.js";
import axios from "axios";
import sharp from "sharp";

const pluginConfig = {
  name: "owner",
  alias: ["creator", "dev", "developer"],
  category: "main",
  description: "Muestra la información de contacto del creador del bot con estilo Waguri",
  usage: ".owner",
  example: ".owner",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock, config: botConfig }) {
  const db = getDatabase();
  const ownerType = db.setting("ownerType") || 1;
  const configOwners = botConfig.owner?.number || [];
  const dbOwners = db.data.owner || [];
  const ownerNumbers = [...new Set([...configOwners, ...dbOwners])];
  const botName = botConfig.bot?.name || "Waguri-AI";

  if (ownerType === 2) {
    const contacts = [];

    for (const number of ownerNumbers) {
      const cleanNumber = number.replace(/[^0-9]/g, "");
      const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${getOwnerName(number)}\nTEL;type=CELL;type=VOICE;waid=${cleanNumber}:+${cleanNumber}\nEND:VCARD`;
      contacts.push({ vcard });
    }

    const zanne = await sock.sendMessage(
      m.chat,
      {
        contacts: {
          displayName: `Contacto de mi Creador`,
          contacts,
        },
      },
      { quoted: m.raw },
    );

    await sock.sendMessage(
      m.chat,
      {
        text: "ꕥ 𝖢𝖮𝖭𝖳𝖠𝖢𝖳𝖮 𝖣𝖤𝖫 𝖢𝖱𝖤𝖠𝖣𝖮𝖱 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n" +
              "ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Si tienes alguna pregunta o problema, ponte en contacto con mi creador. ¡Te responderá con gusto! »\n\n" +
              "> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ"
      },
      { quoted: zanne }
    );
  } else {
    const ownerText = 
      `ꕥ 𝖨𝖭𝖥𝖮𝖱𝖬𝖠𝖢𝖨𝖮𝖭 𝖣𝖤𝖫 𝖢𝖱𝖤𝖠𝖣𝖮𝖱 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
      `      𓈒 ◌ㅤ──    *𝖣𝖤𝖳𝖠𝖫𝖫𝖤𝖲*\n` +
      `      • Nombre :: ${ownerNumbers.map((n) => getOwnerName(n)).join(", ")}\n` +
      `      • Bot :: ${botName}\n` +
      `      • Estado :: Activo\n\n` +
      `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Si tienes dudas o inconvenientes, contáctalo mediante la tarjeta adjunta. »\n\n` +
      `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`;

    await m.reply(ownerText);

    for (const number of ownerNumbers) {
      const cleanNumber = number.replace(/[^0-9]/g, "");
      const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${getOwnerName(number)} (Creador de ${botName})\nTEL;type=CELL;type=VOICE;waid=${cleanNumber}:+${cleanNumber}\nEND:VCARD`;

      await sock.sendMessage(
        m.chat,
        {
          contacts: {
            displayName: getOwnerName(number),
            contacts: [{ vcard }],
          },
        },
        { quoted: m.raw },
      );
    }
  }
}

export { pluginConfig as config, handler };
