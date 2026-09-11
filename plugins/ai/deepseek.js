import axios from "axios";

let handler = async (m, { conn, text, prefix, command, args }) => {
  // flags opcionales: --thinking --search
  let thinking = args.includes("--thinking") || args.includes("--think")
  let search = args.includes("--search") || args.includes("--web")
  // limpia flags del texto
  let cleanText = text.replace(/--thinking|--think|--search|--web/g, "").trim()

  if (!cleanText) {
    return conn.sendMessage(m.chat, {
      text: `ꕥ 𝖣𝖤𝖫𝖴𝖷𝖤 𝖣𝖤𝖤𝖯𝖲𝖤𝖤𝖪 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `      𓈒 ◌ㅤ──    *𝖬𝖮𝖣𝖮 𝖣𝖤 𝖴𝖲𝖮*\n` +
            `      • Comando :: \`#${command} <tu mensaje>\`\n` +
            `      • Flags :: \`--thinking\` (R1) \`--search\` (web)\n\n` +
            `      𓈒 ◌ㅤ──    *𝖤𝖩𝖤𝖬𝖯𝖫𝖮*\n` +
            `      • \`#${command} ¿Qué es la IA? --thinking\`\n` +
            `      • \`#${command} noticias de hoy --search\`\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    }, { quoted: m });
  }

  await m.react("🤖");

  try {
    const encoded = encodeURIComponent(cleanText);
    // usa tu dominio cuando esté listo: https://deluxe-api.is-a.dev
    const apiUrl = `https://rest-api-lwqi.onrender.com/api/deepseek/quick?prompt=${encoded}&thinking=${thinking}&search=${search}&apikey=Kenisawa`;
    // si tienes apikey propia cámbiala: &apikey=deluxe_xxxxx

    const { data } = await axios.get(apiUrl, { timeout: 60000 });

    if (!data.status || !data.content) {
      await m.react("❌");
      return conn.sendMessage(m.chat, {
        text: `ꕥ 𝖤𝖱𝖱𝖮𝖱 𝖣𝖤 𝖠𝖯𝖨 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\nଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « ${data.error || "No se pudo obtener respuesta"} »`
      }, { quoted: m });
    }

    const caption =
      `ꕥ 𝖣𝖤𝖫𝖴𝖷𝖤 𝖣𝖤𝖤𝖯𝖲𝖤𝖤𝖪 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
      `      𓈒 ◌ㅤ──    *𝖱𝖤𝖲𝖯𝖴𝖤𝖲𝖳𝖠*\n` +
      `> ${data.content}\n\n` +
      `｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ) *thinking:${data.thinking} • search:${data.search} • id:${data.message_id || "-"}*`;

    await conn.sendMessage(m.chat, { text: caption }, { quoted: m });
    await m.react("✅");

  } catch (error) {
    console.error("[DeepSeek Error]:", error?.response?.data || error.message);
    await m.react("☢");
    await conn.sendMessage(m.chat, {
      text: `ꕥ 𝖤𝖱𝖱𝖮𝖱 𝖣𝖤 𝖢𝖮𝖭𝖤𝖃𝖨Ó𝖭 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\nଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « ${error?.response?.data?.error || "Error al conectar con Deluxe API"} »`
    }, { quoted: m });
  }
};

handler.help = ['deepseek'];
handler.tags = ['ai'];
handler.command = /^(deepseek|deluxe|waguri)$/i;

export default handler;