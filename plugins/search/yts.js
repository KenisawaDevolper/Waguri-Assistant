import yts from "yt-search";
import { generateWAMessageFromContent } from "ourin";
import axios from "axios";
import sharp from "sharp";
import config from "../../config.js";
import te from "../../src/lib/rimuru-error.js";

const pluginConfig = {
  name: "yts",
  alias: ["ytsearch", "youtubesearch"],
  category: "search",
  description: "Busca videos en YouTube y muestra los detalles con botones interactivos estilo Waguri Assistant.",
  usage: ".yts <búsqueda>",
  example: ".yts lagu pop terbaru",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 2,
  isEnabled: true,
};

async function handler(m, { sock, text }) {
  const query = text || m.args?.join(" ")?.trim();

  if (!query) {
    return m.reply(
      `ꕥ 𝖡𝖴𝖲𝖰𝖴𝖤𝖣𝖠 𝖣𝖤 𝖸𝖮𝖴𝖳𝖴𝖡𝖤 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
      `      𓈒 ◌ㅤ──    *𝖬𝖮𝖣𝖮 𝖣𝖤 𝖴𝖲𝖮*\n` +
      `      • Comando :: \`${m.prefix}yts <texto>\`\n\n` +
      `      𓈒 ◌ㅤ──    *𝖤𝖩𝖤𝖬𝖯𝖫𝖮𝖲*\n` +
      `      • \`${m.prefix}yts miku vocaloid\`\n` +
      `      • \`${m.prefix}yts lo fi hip hop\`\n\n` +
      `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    );
  }

  await m.react("🕕");

  try {
    const searchResults = await yts(query);
    const videos = searchResults.videos;

    if (!videos || videos.length === 0) {
      await m.react("❌");
      return m.reply(
        `ꕥ 𝖲𝖨𝖭 𝖱𝖤𝖲𝖴𝖫𝖳𝖠𝖣𝖮𝖲 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « No se encontraron videos para tu búsqueda. Intenta con un término más general. »\n\n` +
        `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
      );
    }

    const firstVideo = videos[0];

    // Procesar la imagen con Sharp para el encabezado
    let thumbnailBuffer;
    try {
      const imageResponse = await axios.get(firstVideo.thumbnail, { responseType: "arraybuffer" });
      thumbnailBuffer = await sharp(imageResponse.data).resize(300, 170).jpeg().toBuffer();
    } catch (_) {
      thumbnailBuffer = null;
    }

    const contentText = 
      `ꕥ 𝖸𝖮𝖴𝖳𝖴𝖡𝖤 𝖲𝖤𝖠𝖱𝖢𝖧 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
      `      𓈒 ◌ㅤ──    *𝖨𝖭𝖥𝖮𝖱𝖬𝖠𝖢𝖨𝖮𝖭*\n` +
      `      • Título :: ${firstVideo.title}\n` +
      `      • Canal :: ${firstVideo.author.name}\n` +
      `      • Duración :: ${firstVideo.timestamp}\n` +
      `      • Vistas :: ${firstVideo.views.toLocaleString()}\n` +
      `      • Publicado :: ${firstVideo.ago}\n` +
      `      • Enlace :: ${firstVideo.url}\n\n` +
      `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Selecciona una de las opciones a continuación para descargar el contenido. »`;

    const content = {
      buttonsMessage: {
        buttons: [
          {
            buttonId: `${m.prefix}ytmp4 ${firstVideo.url}`,
            buttonText: { displayText: "🎥 Descargar Video" },
            type: 1,
          },
          {
            buttonId: `${m.prefix}ytmp3 ${firstVideo.url}`,
            buttonText: { displayText: "🎵 Descargar Audio" },
            type: 1,
          },
        ],
        ...(thumbnailBuffer ? {
          locationMessage: {
            jpegThumbnail: thumbnailBuffer,
            name: firstVideo.title,
            address: `📺 Canal: ${firstVideo.author.name} | ⏱️ Duración: ${firstVideo.timestamp}`
          }
        } : {}),
        contentText: contentText,
        footerText: config?.bot?.name || "waguri assistant",
        headerType: thumbnailBuffer ? 6 : 1,
      },
    };

    const msg = generateWAMessageFromContent(m.chat, content, {
      quoted: m,
    });

    await sock.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
    await m.react("✅");

  } catch (error) {
    console.error("[YouTube Search Error]:", error?.message || error);
    await m.react("☢");
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
