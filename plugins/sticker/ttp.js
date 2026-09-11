import axios from "axios";
import te from "../../src/lib/rimuru-error.js";
import config from "../../config.js";

const pluginConfig = {
  name: "ttp",
  alias: ["texttopicture"],
  category: "maker",
  description: "Convierte texto en un sticker personalizado estilo Waguri",
  usage: ".ttp <texto>",
  example: ".ttp Hola",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const text = m.args.join(" ") || m.text?.trim();

  if (!text) {
    return m.reply(
      `ꕥ 𝖳𝖤𝖷𝖳𝖮 𝖠 𝖲𝖳𝖨𝖢𝖪𝖤𝖱 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
      `      𓈒 ◌ㅤ──    *𝖬𝖮𝖣𝖮 𝖣𝖤 𝖴𝖲𝖮*\n` +
      `      • Comando :: \`${m.prefix}ttp <texto>\`\n\n` +
      `      𓈒 ◌ㅤ──    *𝖤𝖩𝖤𝖬𝖯𝖫𝖮𝖲*\n` +
      `      • \`${m.prefix}ttp Hola\`\n` +
      `      • \`${m.prefix}ttp Waguri Assistant\`\n\n` +
      `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    );
  }

  await m.react("🕕");

  try {
    const apiUrl = `https://api.nexray.eu.cc/maker/ttp?text=${encodeURIComponent(text)}`;

    const res = await axios.get(apiUrl, {
      responseType: "arraybuffer",
      timeout: 30000
    });

    const imageBuffer = Buffer.from(res.data);

    const packname = config.sticker?.packname || config.bot?.name || "Waguri Assistant";
    const author = config.sticker?.author || config.owner?.name || "Waguri";

    await sock.sendImageAsSticker(m.chat, imageBuffer, m, {
      packname,
      author,
    });

    await m.react("✅");

  } catch (err) {
    console.error("[TTP Maker]", err.message);
    await m.react("☢");
    m.reply(
      `ꕥ 𝖤𝖱𝖱𝖮𝖱 𝖣𝖤𝖫 𝖲𝖨𝖲𝖳𝖤𝖬𝖠 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
      `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Ocurrió un error al conectar con el servidor de creación de stickers. Inténtalo de nuevo más tarde. »\n\n` +
      `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    );
  }
}

export { pluginConfig as config, handler };
