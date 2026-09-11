import axios from "axios";
import te from "../../src/lib/rimuru-error.js";
import { generateWAMessageFromContent } from "ourin";
import sharp from "sharp";
import config from "../../config.js";

const pluginConfig = {
  name: "spotify",
  alias: ["spotifysearch", "spsearch"],
  category: "search",
  description: "Busca canciones en Spotify y muestra los resultados detallados con el diseño de Waguri Assistant",
  usage: ".spotify <búsqueda>",
  example: ".spotify neffex grateful",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock, text }) {
  const query = text || m.args?.join(" ")?.trim();

  if (!query) {
    return m.reply(
      `ꕥ 𝖡𝖴𝖲𝖰𝖴𝖤𝖣𝖠 𝖣𝖤 𝖲𝖯𝖮𝖳𝖨𝖥𝖸 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
      `      𓈒 ◌ㅤ──    *𝖬𝖮𝖣𝖮 𝖣𝖤 𝖴𝖲𝖮*\n` +
      `      • Comando :: \`${m.prefix}spotify <texto>\`\n\n` +
      `      𓈒 ◌ㅤ──    *𝖤𝖩𝖤𝖬𝖯𝖫𝖮𝖲*\n` +
      `      • \`${m.prefix}spotify bruno mars\`\n` +
      `      • \`${m.prefix}spotify yoasobi idol\`\n\n` +
      `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    );
  }

  await m.react("🕕");

  try {
    const res = await axios.get(`https://api.nexray.eu.cc/search/spotify?q=${encodeURIComponent(query)}`);
    const data = res.data;

    if (!data.status || !data.result || data.result.length === 0) {
      await m.react("❌");
      return m.reply(
        `ꕥ 𝖲𝖨𝖭 𝖱𝖤𝖲𝖴𝖫𝖳𝖠𝖣𝖮𝖲 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « No se encontraron canciones para tu búsqueda en Spotify. »\n\n` +
        `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
      );
    }

    const results = data.result.slice(0, 5);
    const firstResult = results[0];

    let contentText = 
      `ꕥ 𝖲𝖯𝖮𝖳𝖨𝖥𝖸 𝖲𝖤𝖠𝖱𝖢𝖧 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
      `      𓈒 ◌ㅤ──    *𝖱𝖤𝖲𝖴𝖫𝖳𝖠𝖣𝖮𝖲*\n`;

    results.forEach((t, i) => {
      contentText += `      • *[${i + 1}]* ${t.title}\n`;
      contentText += `        - Artista :: ${t.artist}\n`;
      contentText += `        - Duración :: ${t.duration}\n`;
      contentText += `        - Enlace :: ${t.url}\n\n`;
    });

    contentText += `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Selecciona el botón para descargar el primer resultado o usa \`.spdl <link>\`. »\n\n` +
      `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`;

    let thumbnailBuffer = null;
    try {
      const imageResponse = await axios.get(firstResult.thumbnail, { responseType: "arraybuffer" });
      thumbnailBuffer = await sharp(imageResponse.data).resize(300, 170).jpeg().toBuffer();
    } catch (_) {
      thumbnailBuffer = null;
    }

    if (thumbnailBuffer) {
      const content = {
        buttonsMessage: {
          buttons: [
            {
              buttonId: `${m.prefix}spdl ${firstResult.url}`,
              buttonText: { displayText: '🎵 Descargar Primer Tema' },
              type: 1,
            }
          ],
          locationMessage: {
            jpegThumbnail: thumbnailBuffer,
            name: firstResult.title,
            address: `🎤 ${firstResult.artist} | ⏱️ ${firstResult.duration}`
          },
          contentText: contentText,
          footerText: config?.bot?.name || "waguri assistant",
          headerType: 6,
        },
      };

      const msg = generateWAMessageFromContent(m.chat, content, { quoted: m });
      await sock.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
    } else {
      await m.reply(contentText);
    }

    await m.react("✅");

  } catch (err) {
    console.error("[Spotify Search Error]:", err?.message || err);
    await m.react("☢");
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
