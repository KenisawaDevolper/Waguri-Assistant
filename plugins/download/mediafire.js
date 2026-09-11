import axios from "axios";
import * as cheerio from "cheerio";

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) {
    return m.reply(`¿Y la URL?\nEjemplo: ${usedPrefix + command} https://www.mediafire.com/file/...`);
  }

  if (!/https?:\/\/(www\.)?mediafire\.com/i.test(args[0])) {
    return m.reply("> ❌ URL no válida, asegúrate de que sea un enlace de Mediafire.");
  }

  await m.react("⬇️");
  const startTime = Date.now();

  try {
    const { data } = await axios.get(args[0], {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      },
      timeout: 30000
    });

    const $ = cheerio.load(data);

    const downloadUrl = (
      $("#downloadButton").attr("href") || 
      $("#download_link > a.retry").attr("href") || 
      ""
    ).trim();

    if (!downloadUrl) {
      await m.react("❌");
      return m.reply("> *Error:* No se pudo extraer el enlace de descarga directo.");
    }

    const $intro = $("div.dl-info > div.intro");
    const filename = $intro.find("div.filename").text().trim() || "archivo_mediafire";
    const filetype = $intro.find("div.filetype > span").eq(0).text().trim() || "Desconocido";

    let _a, _b;
    const ext = (
      (_b = (_a = /\(\.(.*?)\)/.exec($intro.find("div.filetype > span").eq(1).text()))?.[1])?.trim()
    ) || "bin";

    const $li = $("div.dl-info > ul.details > li");
    const filesizeH = $li.eq(0).find("span").text().trim() || "Desconocido";
    const upload = $li.eq(1).find("span").text().trim() || "Desconocido";

    const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(2);

    const caption =
      `*¡𝖣ᧉ𝗌𝖼⍺𝗋𝗀⍺ ᑯᧉ 𝖬ᧉᑯı⍺𝖥ı𝗋ᧉ!* 📂 ฅ^·ﻌ·^ฅ\n\n` +
      `## 🌸 \`𝖨𝗇𝖿𝗈𝗋𝗆⍺𝖼ıó𝗇:\`\n` +
      `- *✐ 𝖭𝗈𝗆𝖻𝗋ᧉ:* *${filename}*\n` +
      `- *✐ 𝖳⍺𝗆⍺ñ𝗈:* *${filesizeH}*\n` +
      `- *✐ 𝖳ı𝗉𝗈:* *${filetype}*\n` +
      `- *✐ 𝖲𝗎𝖻ıᑯ𝗈:* *${upload}*\n` +
      `- *✐ 𝖳ıᧉ𝗆𝗉𝗈:* *${elapsedTime}s*\n\n` +
      `｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ) *Enviando archivo...*`;

    await conn.sendMessage(
      m.chat,
      {
        document: { url: downloadUrl },
        fileName: filename,
        mimetype: `application/${ext.toLowerCase()}`,
        caption
      },
      { quoted: m }
    );

    await m.react("✅");
  } catch (err) {
    console.error("[Mediafire Handler Error]", err);
    await m.react("❌");
    await m.reply(`⚠️ Error al procesar Mediafire: ${err.message || err}`);
  }
};

handler.help = ["mediafire", "mf"].map((v) => v + " <url>");
handler.tags = ["downloader"];
handler.command = /^(mediafire|mf)$/i;
handler.limit = true;
handler.ai = { risk: "low", description: "download file from Mediafire" };

export default handler;
