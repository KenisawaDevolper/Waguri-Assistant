import crypto from "crypto";
import axios from "axios";
import {
  generateWAMessage,
  generateWAMessageFromContent,
  jidNormalizedUser,
} from "ourin";
import te from "../../src/lib/rimuru-error.js";

const pluginConfig = {
  name: "tiktok",
  alias: ["tt", "ttdl", "tiktokdl", "vt"],
  category: "downloader",
  description: "Descarga videos o carrusel de fotos de TikTok apilados como álbum",
  usage: ".tiktok <url>",
  example: ".tiktok https://vt.tiktok.com/ZSVxt31Ty/",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const url = m.args[0] || m.text?.trim();

  if (!url || !/tiktok\.com/i.test(url)) {
    return m.reply(
      `ꕥ 𝖣𝖤𝖲𝖢𝖠𝖱𝖦𝖠𝖣𝖮𝖱 𝖣𝖤 𝖳𝖨𝖪𝖳𝖮𝖪 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
      `      𓈒 ◌ㅤ──    *𝖬𝖮𝖣𝖮 𝖣𝖤 𝖴𝖲𝖮*\n` +
      `      • Comando :: \`${m.prefix}tiktok <enlace_tiktok>\`\n\n` +
      `      𓈒 ◌ㅤ──    *𝖤𝖩𝖤𝖬𝖯𝖫𝖮𝖲*\n` +
      `      • \`${m.prefix}tiktok https://vt.tiktok.com/ZSVxt31Ty/\`\n\n` +
      `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    );
  }

  await m.react("🕕");

  try {
    const apiUrl = `https://my.izuka-api.xyz/api/downloader/aio-v2?url=${encodeURIComponent(url)}`;
    const res = await axios.get(apiUrl, { timeout: 30000 });

    if (!res.data || !res.data.status || !res.data.result) {
      await m.react("❌");
      return m.reply(
        `ꕥ 𝖤𝖱𝖱𝖮𝖱 𝖣𝖤𝖫 𝖲𝖨𝖲𝖳𝖤𝖬𝖠 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « No se pudieron obtener los datos de la URL proporcionada. Verifica que el enlace sea válido. »\n\n` +
        `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
      );
    }

    const { title, author, duration, videos, photos, audios } = res.data.result;

    // Caso 1: Publicación de Video Unico
    if (videos && videos.length > 0) {
      const videoUrl = videos[0].url;
      const caption = 
        `ꕥ 𝖳𝖨𝖪𝖳𝖮𝖪 𝖣𝖮𝖖𝖭𝖫𝖮𝖠𝖣𝖤𝖱 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `      𓈒 ◌ㅤ──    *𝖨𝖭𝖥𝖮𝖱𝖬𝖠𝖢𝖨𝖮𝖭*\n` +
        `      • Creador :: ${author || 'Anónimo'}\n` +
        `      • Duración :: ${duration || 'Desconocida'}\n` +
        (title ? `      • Título :: ${title}\n` : '') + `\n` +
        `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`;

      await sock.sendMessage(m.chat, { video: { url: videoUrl }, caption }, { quoted: m });
      await m.react("✅");
      return;
    }

    // Caso 2: Carrusel de Fotos (Usa la función para apilar imágenes como álbum)
    if (photos && photos.length > 0) {
      const captionInfo = 
        `ꕥ 𝖳𝖨𝖪𝖳𝖮𝖪 𝖲𝖫𝖨𝖣𝖤𝖲𝖧𝖮𝖶 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `      𓈒 ◌ㅤ──    *𝖨𝖭𝖥𝖮𝖱𝖬𝖠𝖢𝖨𝖮𝖭*\n` +
        `      • Creador :: ${author || 'Anónimo'}\n` +
        `      • Total de fotos :: ${photos.length}\n` +
        (title ? `      • Título :: ${title}\n` : '') + `\n` +
        `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`;

      // Prepara la estructura de las imágenes para el álbum
      const mediaList = photos.map((photo, index) => ({
        image: { url: photo.url },
        mimetype: "image/jpeg",
        caption: index === 0 ? captionInfo : "",
        contextInfo: {
          forwardingScore: 99,
          isForwarded: true,
        },
      }));

      // Si hay 2 o más fotos, intenta enviar como álbum apilado
      if (mediaList.length >= 2) {
        try {
          const opener = generateWAMessageFromContent(
            m.chat,
            {
              messageContextInfo: { messageSecret: crypto.randomBytes(32) },
              albumMessage: {
                expectedImageCount: mediaList.length,
                expectedVideoCount: 0,
              },
            },
            {
              userJid: jidNormalizedUser(sock.user.id),
              quoted: m,
              upload: sock.waUploadToServer,
            }
          );

          await sock.relayMessage(opener.key.remoteJid, opener.message, {
            messageId: opener.key.id,
          });

          const generatedMessages = await Promise.all(
            mediaList.map(async (content) => {
              const msg = await generateWAMessage(opener.key.remoteJid, content, {
                upload: sock.waUploadToServer,
              });

              msg.message.messageContextInfo = {
                messageSecret: crypto.randomBytes(32),
                messageAssociation: {
                  associationType: 1,
                  parentMessageKey: opener.key,
                },
              };

              return msg;
            })
          );

          for (const msg of generatedMessages) {
            await sock.relayMessage(msg.key.remoteJid, msg.message, {
              messageId: msg.key.id,
            });
          }
        } catch (albumError) {
          // Fallback a envío individual si falla el álbum
          for (const content of mediaList) {
            await sock.sendMessage(m.chat, content, { quoted: m });
          }
        }
      } else {
        // Si es solo 1 imagen
        await sock.sendMessage(m.chat, mediaList[0], { quoted: m });
      }

      // Enviar el audio de la publicación
      if (audios && audios.length > 0 && audios[0].url) {
        await sock.sendMessage(
          m.chat,
          {
            audio: { url: audios[0].url },
            mimetype: "audio/mp4",
            ptt: false,
          },
          { quoted: m }
        );
      }

      await m.react("✅");
      return;
    }

    // Caso 3: Sin contenido multimedia
    await m.react("❌");
    return m.reply(
      `ꕥ 𝖭𝖮 𝖲𝖤 𝖤𝖭𝖢𝖮𝖭𝖳𝖱𝖮 𝖢𝖮𝖭𝖳𝖤𝖭𝖨𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
      `gh៸៸᳐⦁⩊⦁៸៸᳐ଓ « No se encontraron videos ni fotos disponibles en la publicación. »\n\n` +
      `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    );

  } catch (error) {
    console.error("[TikTok Downloader Error]:", error?.message || error);
    await m.react("☢");
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
