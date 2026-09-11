import axios from "axios";

let handler = async (m, { conn, text, prefix, command }) => {
  if (!text) {
    return conn.sendMessage(m.chat, { 
      text: `ꕥ 𝖢𝖧𝖠𝖳 𝖨𝖭𝖳𝖤𝖫𝖨𝖦𝖤𝖭𝖢𝖨𝖠 𝖠𝖱𝖳𝖨𝖥𝖨𝖢𝖨𝖠𝖫 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `      𓈒 ◌ㅤ──    *𝖬𝖮𝖣𝖮 𝖣𝖤 𝖴𝖲𝖮*\n` +
            `      • Comando :: \`#${command} <tu mensaje>\`\n\n` +
            `      𓈒 ◌ㅤ──    *𝖤𝖩𝖤𝖬𝖯𝖫𝖮*\n` +
            `      • \`#${command} ¿Qué es la inteligencia artificial?\`\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    }, { quoted: m });
  }

  await m.react("🤖");

  try {
    // Codificamos el texto correctamente para que la URL acepte espacios y acentos
    const encodedText = encodeURIComponent(text);
    const apiUrl = `https://my.izuka-api.xyz/api/ai/chatai?text=${encodedText}`;
    
    const { data } = await axios.get(apiUrl);

    if (!data.status || !data.result?.content) {
      await m.react("❌");
      return conn.sendMessage(m.chat, { 
        text: `ꕥ 𝖤𝖱𝖱𝖮𝖱 𝖣𝖤 𝖠𝖯𝖨 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\nଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « No se pudo obtener una respuesta válida de la IA. »` 
      }, { quoted: m });
    }

    const aiResponse = data.result.content;
    const aiModel = data.result.model || "openai/gpt-4o-mini";

    const caption = 
      `ꕥ 𝖶𝖠𝖦𝖴𝖱𝖨 𝖠𝖨 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
      `      𓈒 ◌ㅤ──    *𝖱𝖤𝖲𝖯𝖴𝖤𝖲𝖳𝖠*\n` +
      `> ${aiResponse}\n\n` +
      `｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ) *Modelo: ${aiModel}*`;

    await conn.sendMessage(m.chat, { text: caption }, { quoted: m });
    await m.react("✅");

  } catch (error) {
    console.error("[AI Chat Error]:", error?.message || error);
    await m.react("☢");
    await conn.sendMessage(m.chat, { 
      text: `ꕥ 𝖤𝖱𝖱𝖮𝖱 𝖣𝖤 𝖢𝖮𝖭𝖤𝖃𝖨Ó𝖭 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\nଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Ocurrió un error al conectar con el servidor de la API. »` 
    }, { quoted: m });
  }
};

handler.help = ['ai', 'chatai', 'ia'];
handler.tags = ['ai', 'tools'];
handler.command = /^(ai|chatai|ia|gpt)$/i;

export default handler;
