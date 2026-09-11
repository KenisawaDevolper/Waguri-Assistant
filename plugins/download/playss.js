import yts from "yt-search";
import axios from "axios";
import crypto from "crypto";
import qs from "qs";
import ssyoutube from "../../src/scraper/youtube.js";
import config from "../../config.js";
import { generateWAMessageFromContent } from "ourin";

const pluginConfig = {
  name: "playss",
  alias: ["plays", "ssplay", "ytss", "play2"],
  category: "download",
  description: "Play alternativo scrapeando es.ssyoutube.com (SSYouTube) - descarga MP3/MP4 con botones",
  usage: ".playss <búsqueda o URL de YouTube>",
  example: ".playss bad bunny diles\n.playss https://youtu.be/dQw4w9WgXcQ",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 6,
  energi: 3,
  isEnabled: true,
};

const YT_REGEX = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;

async function ytmp3Fallback(url, format = "mp3") {
  // Fallback del playget actual (d.ymcdn.org) - muy estable
  const videoId = url.match(YT_REGEX)?.[1];
  if (!videoId) throw new Error("URL de YouTube inválida");
  const client = axios.create({
    timeout: 60000,
    headers: {
      "User-Agent": "Mozilla/5.0 (Linux; Android 16) AppleWebKit/537.36 Chrome/141.0.0 Mobile",
      Referer: "https://id.ytmp3.mobi/",
    },
  });
  const { data: init } = await client.get("https://d.ymcdn.org/api/v1/init", { params: { p: "y", 23: "1llum1n471", _: Math.random() } });
  if (!init?.convertURL) throw new Error("No se pudo inicializar servidor alternativo");
  const { data: convert } = await client.get(init.convertURL, { params: { v: videoId, f: format, _: Math.random() } });
  if (!convert?.progressURL || !convert?.downloadURL) throw new Error("Error en conversión fallback");
  let progress = 0, attempts = 0;
  while (progress < 3 && attempts < 20) {
    const { data } = await client.get(convert.progressURL);
    if ((data?.error || 0) > 0) throw new Error(`Error servidor fallback: ${data.error}`);
    progress = Number(data?.progress || 0);
    if (progress < 3) { attempts++; await new Promise(r => setTimeout(r, 400)); }
  }
  return { title: convert.title, dl: convert.downloadURL };
}

function formatNumber(n = 0) {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return n.toString();
}

async function handler(m, { sock, text, prefix, command }) {
  const pf = prefix || m.prefix || config.command?.prefix || ".";
  const query = (text || m.args?.join(" ") || "").trim();
  if (!query) {
    const helpText =
      `ꕥ 𝖯𝖫𝖠𝖸𝖲𝖲 - 𝖲𝖲𝖸𝖮𝖴𝖳𝖴𝖡𝖤 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
      `      𓈒 ◌ㅤ──    *𝖬𝖮𝖣𝖮 𝖣𝖤 𝖴𝖲𝖮*\n` +
      `      • \`${pf}playss <búsqueda>\`\n` +
      `      • \`${pf}playss <url de youtube>\`\n\n` +
      `      𓈒 ◌ㅤ──    *𝖤𝖩𝖤𝖬𝖯𝖫𝖮𝖲*\n` +
      `      • \`${pf}playss bad bunny diles\`\n` +
      `      • \`${pf}playss https://youtu.be/dQw4w9WgXcQ\`\n\n` +
      `Scrapea directamente *es.ssyoutube.com* (mismo motor que ssyoutube.com) y si está caído usa fallback ytmp3.\n` +
      `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`;
    const helpButtons = [
      { buttonId: `${pf}playss bad bunny`, buttonText: { displayText: "🎵 Probar: Bad Bunny" }, type: 1 },
      { buttonId: `${pf}playss https://youtu.be/dQw4w9WgXcQ`, buttonText: { displayText: "🔗 Probar con URL" }, type: 1 },
    ];
    try {
      const content = { buttonsMessage: { buttons: helpButtons, contentText: helpText, footerText: config?.bot?.name || "waguri assistant", headerType: 1 } };
      const msg = generateWAMessageFromContent(m.chat, content, { quoted: m });
      await sock.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
      return;
    } catch { return m.reply(helpText); }
  }

  await m.react("🔍");

  try {
    // 1. Resolver búsqueda o URL
    let videoUrl = query;
    let videoMeta = null;

    if (!YT_REGEX.test(query)) {
      // Búsqueda por texto
      const search = await yts(query);
      if (!search.videos?.length) {
        await m.react("❌");
        return m.reply(`*( 𝜰 ﹏ 𝜰 )* No se encontró ningún resultado para: *${query}*`);
      }
      const v = search.videos[0];
      videoUrl = v.url;
      videoMeta = v;
    } else {
      // Es URL directa, obtener meta via yts por ID para mostrar info bonita
      try {
        const id = query.match(YT_REGEX)[1];
        const s = await yts({ query: id });
        // yts no soporta bien ID directo, intentar search
        const search2 = await yts(`https://youtu.be/${id}`);
        if (search2.videos?.length) videoMeta = search2.videos[0];
      } catch {}
    }

    await m.react("⏳");

    const botName = config?.bot?.name || "Waguri Assistant";
    const titleForCanvas = encodeURIComponent(videoMeta?.title || "YouTube");
    const artistForCanvas = encodeURIComponent(videoMeta?.author?.name || "YouTube");
    const coverForCanvas = encodeURIComponent(videoMeta?.thumbnail || videoMeta?.image || "");
    const canvasUrl = `https://api.nexray.eu.cc/canvas/youtube?title=${titleForCanvas}&artist=${artistForCanvas}&coverurl=${coverForCanvas}`;

    const infoText =
      `ꕥ 𝖲𝖲𝖸𝖮𝖴𝖳𝖴𝖡𝖤 - 𝖱𝖤𝖲𝖴𝖫𝖳𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
      `      𓈒 ◌ㅤ──    *𝖨𝖭𝖥𝖮*\n` +
      `      • Título :: ${videoMeta?.title || "(obteniendo...)"}\n` +
      `      • Canal :: ${videoMeta?.author?.name || "-"}\n` +
      `      • Duración :: ${videoMeta?.timestamp || "-"}\n` +
      `      • Vistas :: ${videoMeta?.views ? formatNumber(videoMeta.views) : "-"}\n` +
      `      • Publicado :: ${videoMeta?.ago || "-"}\n` +
      `      • URL :: ${videoUrl}\n` +
      `      • Fuente :: es.ssyoutube.com (scrape directo) + fallback ytmp3\n\n` +
      `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Elige el formato que deseas descargar »`;

    // 2. Probar ssyoutube primero (scrape real)
    let ssData = null;
    let ssError = null;
    try {
      const res = await ssyoutube.download(videoUrl);
      if (res?.error) ssError = res.error;
      else if (res?.downloads?.length) ssData = res;
    } catch (e) { ssError = e.message; }

    // Construir botones dinámicos
    const rows = [];

    if (ssData?.downloads?.length) {
      // Priorizar: mejor MP3 (m4a 141) y MP4 720
      const mp3 = ssData.downloads.find(d => d.format === "m4a" || d.format === "mp3") || ssData.downloads.find(d => d.audio) || ssData.downloads[0];
      const mp4_720 = ssData.downloads.find(d => d.quality === "720") || ssData.downloads.find(d => d.format === "mp4");
      const mp4_360 = ssData.downloads.find(d => d.quality === "360");

      if (mp3) rows.push({ title: "🎵 Audio M4A/MP3 (SSYouTube)", description: `${mp3.quality} • ${mp3.size} • ${mp3.format}`, id: `${pf}playssget mp3 ${videoUrl}` });
      if (mp4_720) rows.push({ title: "📹 Video 720p (SSYouTube)", description: `${mp4_720.format} • ${mp4_720.size}`, id: `${pf}playssget mp4 ${videoUrl}` });
      if (mp4_360 && mp4_360.url !== mp4_720?.url) rows.push({ title: "📹 Video 360p (SSYouTube)", description: `${mp4_360.format} • ${mp4_360.size}`, id: `${pf}playssget mp4 ${videoUrl}` });
      // Fallback rápido también
      rows.push({ title: "🔄 Audio MP3 (Fallback ytmp3)", description: "Si SSYouTube falla", id: `${pf}playssget mp3fb ${videoUrl}` });
    } else {
      // Si SSYouTube falló, ofrecer directamente fallback
      rows.push({ title: "🎵 Audio MP3 (Fallback)", description: ssError ? `SSYouTube: ${String(ssError).slice(0,30)}...` : "SSYouTube no respondió", id: `${pf}playssget mp3fb ${videoUrl}` });
      rows.push({ title: "📹 Video MP4 (Fallback)", description: "ytmp3 via d.ymcdn.org", id: `${pf}playssget mp4fb ${videoUrl}` });
    }

    rows.push({ title: "📄 Audio como Documento", description: "MP3 en formato documento", id: `${pf}playssget mp3doc ${videoUrl}` });

    const listButton = {
      name: "single_select",
      buttonParamsJson: JSON.stringify({
        title: "🌸 Opciones de Descarga",
        sections: [{ title: "Formatos disponibles", rows }],
      }),
    };
    const urlButton = {
      name: "cta_url",
      buttonParamsJson: JSON.stringify({ display_text: "⭐ Ver en YouTube", url: videoUrl, merchant_url: videoUrl }),
    };

    await sock.sendMessage(m.chat, {
      image: { url: canvasUrl },
      caption: infoText,
      footer: `${botName} • es.ssyoutube.com scraper`,
      interactiveButtons: [listButton, urlButton],
    }, { quoted: m });

    await m.react("✅");

  } catch (e) {
    console.error("[PLAYSS ERROR]", e);
    await m.react("❌");
    return m.reply(`*( 𝜰 ﹏ 𝜰 )* Error en playss:\n${e?.message || e}`);
  }
}

export { pluginConfig as config, handler };
