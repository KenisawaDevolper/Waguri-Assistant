import axios from "axios";

let handler = async (m, { conn, text, prefix, command }) => {
  if (!text) {
    return conn.sendMessage(m.chat, { 
      text: `ꕥ 𝖲𝖴𝖭𝑶𝖱𝖠 𝖠𝖨 𝖬𝖴𝖲𝖨𝖢 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `      𓈒 ◌ㅤ──    *𝖬𝖮𝖣𝖮 𝖣𝖤 𝖴𝖲𝖮*\n` +
            `      • Comando :: \`#${command} <descripción de la música>\`\n\n` +
            `      𓈒 ◌ㅤ──    *𝖤𝖩𝖤𝖬𝖯𝖫𝖮*\n` +
            `      • \`#${command} Haz una música de Reguetón\`\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    }, { quoted: m });
  }

  await m.react("🎧");

  try {
    // Nota: Esta API utiliza el parámetro 'prompt' en lugar de 'text'
    const encodedPrompt = encodeURIComponent(text);
    const apiUrl = `https://my.izuka-api.xyz/api/ai/sunora-music?prompt=${encodedPrompt}`;
    
    const { data } = await axios.get(apiUrl);

    if (!data.status || !data.result) {
      await m.react("❌");
      return conn.sendMessage(m.chat, { 
        text: `ꕥ 𝖤𝖱𝖱𝖮𝖱 𝖣𝖤 𝖠𝖯𝖨 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\nଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « No se pudo generar la música en Sunora AI. »` 
      }, { quoted: m });
    }

    const music1 = data.result.music_1;
    const music2 = data.result.music_2;

    let caption = 
      `ꕥ 𝖲𝖴𝖭𝑶𝖱𝖠 𝖠𝖨 𝖬𝖴𝖲𝖨𝖢 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
      `      𓈒 ◌ㅤ──    *𝖱𝖤𝖲𝖴𝖫𝖳𝖠𝖣𝖮𝖲 𝖦𝖤𝖭𝖤𝖱𝖠𝖣𝖮𝖲*\n` +
      `      • Prompt :: *${text}*\n\n`;

    if (music1) {
      caption += `      🎵 *Opción 1: ${music1.title}*\n` +
                 `      • Enlace Audio :: ${music1.music_url}\n\n`;
    }

    if (music2) {
      caption += `      🎶 *Opción 2: ${music2.title}*\n` +
                 `      • Enlace Audio :: ${music2.music_url}\n\n`;
    }

    caption += `｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ) *Desarrollador: ${data.developer || "@IzukaDev"}*`;

    // 1. Enviamos la imagen con la información general de las pistas
    if (music1 && music1.image_url) {
      await conn.sendMessage(m.chat, { 
        image: { url: music1.image_url }, 
        caption: caption 
      }, { quoted: m });
    } else {
      await conn.sendMessage(m.chat, { text: caption }, { quoted: m });
    }

    // 2. Enviamos el archivo de audio de la opción 1 directamente al chat
    if (music1 && music1.music_url) {
      await conn.sendMessage(m.chat, { 
        audio: { url: music1.music_url }, 
        mimetype: 'audio/mp4', 
        fileName: `${music1.title || 'sunora_music'}.mp3`,
        ptt: false 
      }, { quoted: m });
    }

    await m.react("✅");

  } catch (error) {
    console.error("[Sunora Music Error]:", error?.message || error);
    await m.react("☢");
    await conn.sendMessage(m.chat, { 
      text: `ꕥ 𝖤𝖱𝖱𝖮𝖱 𝖣𝖤 𝖢𝖮𝖭𝖤𝖃𝖨Ó𝖭 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\nଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Ocurrió un error al conectar con la API de Sunora Music. »` 
    }, { quoted: m });
  }
};

handler.help = ['sunora', 'sunoramusic', 'aimusic'];
handler.tags = ['ai', 'tools', 'downloader'];
handler.command = /^(sunora|sunoramusic|aimusic)$/i;

export default handler;
