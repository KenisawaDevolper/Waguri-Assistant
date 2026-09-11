import crypto from "crypto";
import { generateWAMessage, generateWAMessageFromContent, jidNormalizedUser } from "ourin";

/**
 * Envía un álbum apilado (carrusel) de imágenes/videos usando Baileys albumMessage.
 * Evita spam de N mensajes separados y los agrupa como 1 álbum nativo de WhatsApp.
 *
 * @param {object} sock - Socket de Baileys
 * @param {string} chatId - m.chat
 * @param {Array} mediaList - Array de objetos { image: {url}, video: {url}, caption, mimetype }
 * @param {object} quoted - Mensaje citado (m)
 * @returns {Promise<void>}
 */
export async function sendAlbum(sock, chatId, mediaList, quoted = null) {
  if (!mediaList?.length) return;
  // Si solo hay 1, enviar normal
  if (mediaList.length === 1) {
    await sock.sendMessage(chatId, mediaList[0], { quoted });
    return;
  }

  // Contar tipos para albumMessage
  const expectedImageCount = mediaList.filter(m => m.image).length;
  const expectedVideoCount = mediaList.filter(m => m.video).length;

  try {
    const opener = generateWAMessageFromContent(
      chatId,
      {
        messageContextInfo: { messageSecret: crypto.randomBytes(32) },
        albumMessage: {
          expectedImageCount,
          expectedVideoCount,
        },
      },
      {
        userJid: jidNormalizedUser(sock.user.id),
        quoted,
        upload: sock.waUploadToServer,
      }
    );

    await sock.relayMessage(opener.key.remoteJid, opener.message, {
      messageId: opener.key.id,
    });

    // Generar cada media asociada al álbum
    const generated = await Promise.all(
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

    for (const msg of generated) {
      await sock.relayMessage(msg.key.remoteJid, msg.message, {
        messageId: msg.key.id,
      });
    }
  } catch (e) {
    console.error("[Album] fallback a envío individual:", e?.message || e);
    // Fallback: enviar uno por uno si el álbum falla
    for (const content of mediaList) {
      await sock.sendMessage(chatId, content, { quoted });
    }
  }
}
