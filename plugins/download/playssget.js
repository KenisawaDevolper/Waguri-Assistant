import axios from "axios";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import ssyoutube from "../../src/scraper/youtube.js";
import config from "../../config.js";
import { generateWAMessageFromContent } from "ourin";

const run = promisify(exec);
const YT_REGEX = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;

const pluginConfig = {
  name: "playssget",
  alias: ["ssget"],
  category: "download",
  description: "Descarga directa desde es.ssyoutube.com (SSYouTube) con fallback",
  usage: ".playssget <mp3|mp4|mp3doc|mp3fb|mp4fb> <url>",
  example: ".playssget mp3 https://youtu.be/xxx",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 3,
  isEnabled: true,
};

async function ytmp3Fallback(url, format = "mp3") {
  const videoId = url.match(YT_REGEX)?.[1];
  if (!videoId) throw new Error("URL inválida");
  const client = axios.create({
    timeout: 60000,
    headers: {
      "User-Agent": "Mozilla/5.0 (Linux; Android 16) AppleWebKit/537.36 Chrome/141.0.0 Mobile",
      Referer: "https://id.ytmp3.mobi/",
    },
  });
  const { data: init } = await client.get("https://d.ymcdn.org/api/v1/init", { params: { p: "y", 23: "1llum1n471", _: Math.random() } });
  if (!init?.convertURL) throw new Error("Init fallback falló");
  const { data: convert } = await client.get(init.convertURL, { params: { v: videoId, f: format, _: Math.random() } });
  if (!convert?.progressURL || !convert?.downloadURL) throw new Error("Convert fallback falló");
  let progress = 0, attempts = 0;
  while (progress < 3 && attempts < 20) {
    const { data } = await client.get(convert.progressURL);
    if ((data?.error || 0) > 0) throw new Error(`Error fallback: ${data.error}`);
    progress = Number(data?.progress || 0);
    if (progress < 3) { attempts++; await new Promise(r=>setTimeout(r,350)); }
  }
  return { title: convert.title, dl: convert.downloadURL };
}

async function downloadBuffer(url, isVideo = false) {
  const res = await axios.get(url, {
    responseType: "arraybuffer",
    timeout: 120000,
    maxContentLength: 150*1024*1024,
    maxBodyLength: 150*1024*1024,
    headers: {
      "User-Agent": "Mozilla/5.0 (Linux; Android 16) AppleWebKit/537.36 Chrome/141.0.0 Mobile",
      Accept: "*/*",
      Referer: "https://ssyoutube.com/",
    },
  });
  const type = String(res.headers["content-type"]||"").toLowerCase();
  if (type.includes("text/html") || type.includes("application/json")) {
    const txt = Buffer.from(res.data).toString().slice(0,500);
    throw new Error("Enlace no es archivo multimedia válido: " + txt);
  }
  return Buffer.from(res.data);
}

async function ensureMp3(buffer) {
  // Si ya es MP3 (ID3 o frame sync FFFB) devolver tal cual
  if (buffer.length > 3) {
    const isMp3 = buffer.slice(0,3).toString() === "ID3" || (buffer[0] === 0xFF && (buffer[1] & 0xE0) === 0xE0);
    if (isMp3) return buffer;
  }
  // Convertir cualquier audio (m4a/webm/opus) a MP3 via ffmpeg
  const tmpDir = path.join(process.cwd(), "temp");
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
  const id = crypto.randomBytes(6).toString("hex");
  const inPath = path.join(tmpDir, `ss_in_${id}.bin`);
  const outPath = path.join(tmpDir, `ss_out_${id}.mp3`);
  try {
    fs.writeFileSync(inPath, buffer);
    await run(`ffmpeg -y -i "${inPath}" -vn -c:a libmp3lame -b:a 192k -ar 44100 "${outPath}"`, { timeout: 60000 });
    const out = fs.readFileSync(outPath);
    if (!out.length) throw new Error("Conversión vacía");
    return out;
  } finally {
    try { if (fs.existsSync(inPath)) fs.unlinkSync(inPath); } catch {}
    try { if (fs.existsSync(outPath)) fs.unlinkSync(outPath); } catch {}
  }
}

async function handler(m, { sock, text, prefix }) {
  const pf = prefix || m.prefix || config.command?.prefix || ".";
  const [typeRaw, ...urlParts] = (text || m.args?.join(" ") || "").trim().split(/\s+/);
  const type = (typeRaw || "").toLowerCase();
  const url = urlParts.join(" ").trim();

  if (!type || !url || !YT_REGEX.test(url)) {
    return m.reply(
      `*( 𝜰 ﹏ 𝜰 )* Uso incorrecto.\n\n` +
      `• Ejemplo: \`${pf}playssget mp3 https://youtu.be/xxx\`\n` +
      `• Tipos: mp3, mp4, mp3doc, mp3fb (fallback), mp4fb`
    );
  }

  const isVideo = type.startsWith("mp4");
  const asDocument = type.includes("doc");
  const useFallback = type.includes("fb");
  const targetFormat = isVideo ? "mp4" : "mp3";

  await m.react("⏳");
  try {
    let dlUrl = null;
    let title = "media";
    let source = "";

    if (!useFallback) {
      // Intentar SSYouTube primero
      try {
        const ss = await ssyoutube.download(url);
        if (!ss?.error && ss?.downloads?.length) {
          source = "es.ssyoutube.com";
          title = ss.meta?.title || title;
          // Elegir mejor calidad según tipo - priorizar MP3/M4A y fallback a cualquier audio
          let pick = null;
          if (isVideo) {
            pick = ss.downloads.find(d => d.format === "mp4" && String(d.quality).includes("720"))
                || ss.downloads.find(d => d.format === "mp4")
                || ss.downloads[0];
          } else {
            // Audios ordenados por calidad descendente (141, 140, etc)
            const audios = ss.downloads.filter(d => d.audio || ["m4a","mp3","opus","webm"].includes(d.format)).sort((a,b)=> parseInt(b.quality||0)-parseInt(a.quality||0));
            pick = ss.downloads.find(d => d.format === "mp3")
                || audios[0]
                || ss.downloads.find(d => d.audio)
                || ss.downloads[0];
          }
          if (pick?.url) dlUrl = pick.url;
        } else {
          throw new Error(ss?.error || "SSYouTube no devolvió descargas");
        }
      } catch (e) {
        console.log("[SSYouTube fallback por error]", e.message);
        // caer a fallback
        const fb = await ytmp3Fallback(url, targetFormat);
        dlUrl = fb.dl; title = fb.title || title; source = "ytmp3 fallback (d.ymcdn.org)";
      }
    } else {
      const fb = await ytmp3Fallback(url, targetFormat);
      dlUrl = fb.dl; title = fb.title || title; source = "ytmp3 fallback";
    }

    if (!dlUrl) throw new Error("No se pudo obtener enlace de descarga");

    await m.react("📥");
    let buffer = await downloadBuffer(dlUrl, isVideo);
    const cleanTitle = (title || "media").replace(/[\\/:*?"<>|]/g, "_").slice(0, 60);

    // Si es audio y viene de SSYouTube (m4a/opus/webm), convertir a MP3 para que WhatsApp lo reproduzca
    if (!isVideo && source.includes("ssyoutube")) {
      try {
        await m.react("🎛️");
        buffer = await ensureMp3(buffer);
      } catch (e) {
        console.log("[SS convert error, usando buffer original]", e.message);
      }
    }

    const footer = `${config?.bot?.name || "waguri"} • ${source} • es.ssyoutube.com`;

    if (asDocument) {
      await sock.sendMessage(m.chat, { document: buffer, mimetype: isVideo ? "video/mp4" : "audio/mpeg", fileName: `${cleanTitle}.${isVideo ? "mp4" : "mp3"}`, caption: footer }, { quoted: m });
    } else if (isVideo) {
      await sock.sendMessage(m.chat, { video: buffer, mimetype: "video/mp4", caption: `🎬 *${title}*\n${footer}`, fileName: `${cleanTitle}.mp4` }, { quoted: m });
    } else {
      await sock.sendMessage(m.chat, { audio: buffer, mimetype: "audio/mpeg", ptt: false, fileName: `${cleanTitle}.mp3` }, { quoted: m });
      // Botones post-descarga
      try {
        const buttons = [
          { buttonId: `${pf}playssget mp4 ${url}`, buttonText: { displayText: "📹 Descargar Video" }, type: 1 },
          { buttonId: `${pf}playss ${url}`, buttonText: { displayText: "🔍 Buscar otro" }, type: 1 },
        ];
        const content = { buttonsMessage: { buttons, contentText: `✅ Audio enviado: *${title}*\nFuente: ${source}\n\n¿Quieres el video también?`, footerText: config?.bot?.name || "waguri assistant", headerType: 1 } };
        const msg = generateWAMessageFromContent(m.chat, content, { quoted: m });
        await sock.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
      } catch {}
    }

    await m.react("✅");
  } catch (e) {
    console.error("[PLAYSSGET ERROR]", e);
    await m.react("❌");
    return m.reply(`*( 𝜰 ﹏ 𝜰 )* Error al descargar:\n${e?.message || e}\n\n> Tip: prueba con \`${pf}playssget mp3fb ${url}\` para forzar fallback.`);
  }
}

export { pluginConfig as config, handler };
