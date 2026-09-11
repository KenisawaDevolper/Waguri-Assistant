import axios from "axios";
import FormData from "form-data";

let handler = async (m, { conn, text, prefix, command }) => {
  // Detectar si el mensaje actual o el mensaje citado contiene una imagen
  const q = m.quoted ? m.quoted : m;
  const mime = (q.msg || q).mimetype || '';

  if (!mime || !mime.startsWith('image/')) {
    return conn.sendMessage(m.chat, { 
      text: `ꕥ 𝖦𝖤𝖬𝖬𝖸 𝖠𝖨 (𝖵𝖨𝖲𝖨Ó𝖭) ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `      𓈒 ◌ㅤ──    *𝖬𝖮𝖣𝖮 𝖣𝖤 𝖴𝖲𝖮*\n` +
            `      • Envía o responde a una imagen con:\n` +
            `        \`#${command} <tu pregunta sobre la imagen>\`\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    }, { quoted: m });
  }

  await m.react("👁️");

  try {
    // Descargar el archivo multimedia de la imagen
    let stream = await q.download?.();
    if (!stream) {
      stream = await conn.downloadMediaMessage(q);
    }
    
    let buffer = Buffer.isBuffer(stream) ? stream : Buffer.concat(await streamToArray(stream));

    // Si el usuario no escribió texto, asignamos un prompt por defecto
    const promptText = text || "Descríbeme detalladamente qué ves en esta imagen.";

    // Construir el formulario multipart/form-data igual que en el cURL
    const form = new FormData();
    form.append("prompt", promptText);
    form.append("media", buffer, { 
      filename: "image.jpg", 
      contentType: mime 
    });

    const apiUrl = "https://my.izuka-api.xyz/api/ai/gemmy-chat";
    
    const { data } = await axios.post(apiUrl, form, {
      headers: {
        ...form.getHeaders()
      }
    });

    if (!data.status || !data.result) {
      await m.react("❌");
      return conn.sendMessage(m.chat, { 
        text: `ꕥ 𝖤𝖱𝖱𝖮𝖱 𝖣𝖤 𝖠𝖯𝖨 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\nଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « No se pudo procesar la imagen con Gemini. »` 
      }, { quoted: m });
    }

    const aiResponse = data.result;
    const aiModol = data.model || "gemini-2.5-flash";

    const caption = 
      `ꕥ 𝖶𝖠𝖦𝖴𝖱𝖨 • 𝖦𝖤𝖬𝖬𝖸 𝖵𝖨𝖲𝖨Ó𝖭 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
      `      𓈒 ◌ㅤ──    *𝖱𝖤𝖲𝖯𝖴𝖤𝖲𝖳𝖠*\n` +
      `> ${aiResponse}\n\n` +
      `｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ) *Modolo: ${aiModol}*`;

    await conn.sendMessage(m.chat, { text: caption }, { quoted: m });
    await m.react("✅");

  } catch (error) {
    console.error("[Gemmy Vision Error]:", error?.message || error);
    await m.react("☢");
    await conn.sendMessage(m.chat, { 
      text: `ꕥ 𝖤𝖱𝖱𝖮𝖱 𝖣𝖤 𝖢𝖮𝖭𝖤𝖃𝖨Ó𝖭 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\nଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Ocurrió un error al conectar con la API de visión. »` 
    }, { quoted: m });
  }
};

// Función auxiliar para convertir stream a buffer si es necesario
async function streamToArray(stream) {
  let chunks = [];
  for await (let chunk of stream) {
    chunks.push(chunk);
  }
  return chunks;
}

handler.help = ['gemini', 'gemmy', 'vision'];
handler.tags = ['ai', 'tools'];
handler.command = /^(gemini|gemmy|vision|ia-gemini)$/i;

export default handler;
