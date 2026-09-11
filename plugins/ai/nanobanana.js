import axios from "axios";
import FormData from "form-data";

let handler = async (m, { conn, text, prefix, command }) => {
  // Detectar si el mensaje actual o el mensaje citado contiene una imagen
  const q = m.quoted ? m.quoted : m;
  const mime = (q.msg || q).mimetype || '';

  if (!mime || !mime.startsWith('image/')) {
    return conn.sendMessage(m.chat, { 
      text: `ꕥ 𝖭𝖠𝖭𝖮𝖡𝖠𝖭𝖠𝖭𝖠 (𝖤𝖣𝖨𝖳𝖮𝖱 𝖣𝖤 𝖨𝖬𝖠𝖦𝖤𝖭𝖤𝖲) ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `      𓈒 ◌ㅤ──    *𝖬𝖮𝖣𝖮 𝖣𝖤 𝖴𝖲𝖮*\n` +
            `      • Envía o responde a una imagen con:\n` +
            `        \`#${command} <instrucción para editar>\`\n\n` +
            `      𓈒 ◌ㅤ──    *𝖤𝖩𝖤𝖬𝖯𝖫𝖮*\n` +
            `      • \`#${command} Quiero que se vea mejor el logo\`\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    }, { quoted: m });
  }

  await m.react("🎨");

  try {
    // Descargar el archivo multimedia de la imagen
    let stream = await q.download?.();
    if (!stream) {
      stream = await conn.downloadMediaMessage(q);
    }
    
    let buffer = Buffer.isBuffer(stream) ? stream : Buffer.concat(await streamToArray(stream));

    // Si el usuario no escribió texto, asignamos una instrucción por defecto
    const promptText = text || "Mejora la calidad y apariencia de esta imagen.";

    // Construir el formulario multipart/form-data con los campos 'prompt' e 'image'
    const form = new FormData();
    form.append("prompt", promptText);
    form.append("image", buffer, { 
      filename: "image.jpg", 
      contentType: mime 
    });

    const apiUrl = "https://my.izuka-api.xyz/api/ai/nanobanana";
    
    const { data } = await axios.post(apiUrl, form, {
      headers: {
        ...form.getHeaders()
      }
    });

    if (!data.status || !data.result) {
      await m.react("❌");
      return conn.sendMessage(m.chat, { 
        text: `ꕥ 𝖤𝖱𝖱𝖮𝖱 𝖣𝖤 𝖠𝖯𝖨 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\nଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « No se pudo procesar la edición de la imagen. »` 
      }, { quoted: m });
    }

    const editedImageUrl = data.result;

    const caption = 
      `ꕥ 𝖶𝖠𝖦𝖴𝖱𝖨 • 𝖭𝖠𝖭𝖮𝖡𝖠𝖭𝖠𝖭𝖠 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
      `      𓈒 ◌ㅤ──    *𝖨𝖬𝖠𝖦𝖤𝖭 𝖤𝖣𝖨𝖳𝖠𝖣𝖠*\n` +
      `      • Instrucción :: *${promptText}*\n\n` +
      `｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ) *Desarrollador: ${data.developer || "@IzukaDev"}*`;

    // Enviamos la imagen resultante directamente al chat
    await conn.sendMessage(m.chat, { 
      image: { url: editedImageUrl }, 
      caption: caption 
    }, { quoted: m });

    await m.react("✅");

  } catch (error) {
    console.error("[Nanobanana Editor Error]:", error?.message || error);
    await m.react("☢");
    await conn.sendMessage(m.chat, { 
      text: `ꕥ 𝖤𝖱𝖱𝖮𝖱 𝖣𝖤 𝖢𝖮𝖭𝖤𝖃𝖨Ó𝖭 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\nଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Ocurrió un error al conectar con el servidor de edición. »` 
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

handler.help = ['nanobanana', 'editimage', 'editor'];
handler.tags = ['ai', 'tools'];
handler.command = /^(nanobanana|editimage|editor|ia-editar)$/i;

export default handler;
