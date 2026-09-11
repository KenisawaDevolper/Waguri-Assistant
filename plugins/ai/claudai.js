import axios from "axios";

let handler = async (m, { conn, text, prefix, command }) => {
  if (!text) {
    return conn.sendMessage(m.chat, { 
      text: `ꕥ 𝖢𝖫𝖠𝖴𝖣𝖤 𝖠𝖨 𝖨𝖭𝖳𝖤𝖫𝖨𝖦𝖤𝖭𝖢𝖨𝖠 𝖠𝖱𝖳𝖨𝖥𝖨𝖢𝖨𝖠𝖫 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `      𓈒 ◌ㅤ──    *𝖬𝖮𝖣𝖮 𝖣𝖤 𝖴𝖲𝖮*\n` +
            `      • Comando :: \`#${command} <tu mensaje>\`\n\n` +
            `      𓈒 ◌ㅤ──    *𝖤𝖩𝖤𝖬𝖯𝖫𝖮*\n` +
            `      • \`#${command} ¿Cómo optimizar un código en Node.js?\`\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    }, { quoted: m });
  }

  await m.react("🧠");

  try {
    const encodedText = encodeURIComponent(text);
    const apiUrl = `https://my.izuka-api.xyz/api/ai/claudai?text=${encodedText}`;
    
    const { data } = await axios.get(apiUrl);

    if (!data.status || !data.result?.answer) {
      await m.react("❌");
      return conn.sendMessage(m.chat, { 
        text: `ꕥ 𝖤𝖱𝖱𝖮𝖱 𝖣𝖤 𝖠𝖯𝖨 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\nଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « No se pudo obtener una respuesta válida del modelo Claude. »` 
      }, { quoted: m });
    }

    const aiAnswer = data.result.answer;

    const caption = 
      `ꕥ 𝖶𝖠𝖦𝖴𝖱𝖨 • 𝖢𝖫𝖠𝖴𝖣𝖤 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
      `      𓈒 ◌ㅤ──    *𝖱𝖤𝖲𝖯𝖴𝖤𝖲𝖳𝖠*\n` +
      `> ${aiAnswer}\n\n` +
      `｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ) *Desarrollador: ${data.developer || "@IzukaDev"}*`;

    await conn.sendMessage(m.chat, { text: caption }, { quoted: m });
    await m.react("✅");

  } catch (error) {
    console.error("[Claude AI Error]:", error?.message || error);
    await m.react("☢");
    await conn.sendMessage(m.chat, { 
      text: `ꕥ 𝖤𝖱𝖱𝖮𝖱 𝖣𝖤 𝖢𝖮𝖭𝖤𝖃𝖨Ó𝖭 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\nଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Ocurrió un error al conectar con la API de Claude. »` 
    }, { quoted: m });
  }
};

handler.help = ['claude', 'claudai', 'ia-claude'];
handler.tags = ['ai', 'tools'];
handler.command = /^(claude|claudai|ia-claude)$/i;

export default handler;
