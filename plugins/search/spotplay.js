import axios from "axios";
import te from "../../src/lib/rimuru-error.js";

const pluginConfig = {
  name: "spotplay",
  alias: ["splay", "sp", "spotifyplay"],
  category: "search",
  description: "Busca y reproduce canciones desde Spotify con la estética Waguri Assistant",
  usage: ".spotplay <nombre / url>",
  example: ".spotplay neffex grateful",
  cooldown: 15,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const query = m.args?.join(" ")?.trim() || m.text?.trim();

  if (!query) {
    return m.reply(
      `ꕥ 𝖲𝖯𝖮𝖳𝖨𝖥𝖸 𝖯𝖫𝖠𝖸 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
      `      𓈒 ◌ㅤ──    *𝖬𝖮𝖣𝖮 𝖣𝖤 𝖴𝖲𝖮*\n` +
      `      • Comando :: \`${m.prefix}spotplay <canción / artista>\`\n\n` +
      `      𓈒 ◌ㅤ──    *𝖤𝖩𝖤𝖬𝖯𝖫𝖮𝖲*\n` +
      `      • \`${m.prefix}spotplay neffex grateful\`\n` +
      `      • \`${m.prefix}spotplay yoasobi idol\`\n\n` +
      `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    );
  }

  await m.react("🕕");

  try {
    const searchUrl = `https://my.izuka-api.xyz/api/search/spotify-search?query=${encodeURIComponent(query)}`;
    const searchRes = await axios.get(searchUrl, { timeout: 30000 });
    const searchData = searchRes.data;

    if (!searchData?.status || !searchData?.result || searchData.result.length === 0) {
      await m.react("❌");
      return m.reply(
        `ꕥ 𝖲𝖨𝖭 𝖱𝖤𝖲𝖴𝖫𝖳𝖠𝖣𝖮𝖲 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « No se encontraron canciones en Spotify para tu búsqueda. »\n\n` +
        `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
      );
    }

    const firstTrack = searchData.result[0];
    const dlUrl = `https://my.izuka-api.xyz/api/downloader/spotify?url=${encodeURIComponent(firstTrack.url)}`;
    const dlRes = await axios.get(dlUrl, { timeout: 30000 });
    const dlData = dlRes.data;

    if (!dlData?.status || !dlData?.result?.download_url) {
      await m.react("❌");
      return m.reply(
        `ꕥ 𝖤𝖱𝖱𝖮𝖱 𝖣𝖤𝖫 𝖲𝖨𝖲𝖳𝖤𝖬𝖠 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `gh៸៸᳐⦁⩊⦁៸៸᳐ଓ « No se pudo obtener el enlace de descarga para este tema. »\n\n` +
        `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
      );
    }

    const result = dlData.result;

    const captionInfo = 
      `ꕥ 𝖲𝖯𝖮𝖳𝖨𝖥𝖸 𝖬𝖴𝖲𝖨𝖢 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
      `      𓈒 ◌ㅤ──    *𝖨𝖭𝖥𝖮𝖱𝖬𝖠𝖢𝖨𝖮𝖭*\n` +
      `      • Título :: ${result.title || firstTrack.title || 'Canción'}\n` +
      `      • Artista :: ${result.artist || firstTrack.artist || 'Artista'}\n` +
      `      • Álbum :: ${result.album || 'Spotify Single'}\n\n` +
      `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Enviando audio en breve... »\n\n` +
      `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`;

    if (result.image || firstTrack.image) {
      await sock.sendMessage(
        m.chat, 
        { image: { url: result.image || firstTrack.image }, caption: captionInfo }, 
        { quoted: m }
      );
    }

    await sock.sendMedia(m.chat, result.download_url, null, m, {
      type: "audio",
      mimetype: "audio/mpeg",
      ptt: false,
      fileName: `${result.artist || "Spotify"} - ${result.title || "audio"}.mp3`,
    });

    await m.react("✅");
  } catch (e) {
    console.error("[Spotplay Error]:", e?.message || e);
    await m.react("☢");
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
