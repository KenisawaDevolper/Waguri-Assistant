import axios from "axios";
import archiver from "archiver";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import config from "../../config.js";

const pluginConfig = {
  name: "mixzip",
  alias: ["playlistzip", "descargarmix"],
  category: "download",
  description: "Descarga todos los temas de un mix como archivo ZIP (usando es.ssyoutube fallback)",
  usage: ".mixzip <url1> <url2> ... (interno, se llama desde el botón del mix)",
  example: ".mixzip https://youtu.be/xxx https://youtu.be/yyy",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 20,
  energi: 5,
  isEnabled: true,
};

const YT_REGEX = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
const SPOTIFY_REGEX = /open\.spotify\.com\/track\/([a-zA-Z0-9]+)/;

async function spotifyGetDl(url) {
  const { data } = await axios.get(`https://api.nexray.eu.cc/downloader/spotify?url=${encodeURIComponent(url)}`, { timeout: 30000 });
  if (!data?.status || !data?.result?.url) throw new Error(data?.error || "No se pudo obtener descarga Spotify");
  const title = data.result.title || "spotify track";
  const dl = data.result.url; // URL directa mp3 vía rapid.spotidown.app
  return { title, dl };
}

async function ytmp3GetDl(url, format = "mp3") {
  const id = url.match(YT_REGEX)?.[1];
  if (!id) throw new Error("URL inválida " + url);
  const client = axios.create({ timeout: 60000, headers: { "Usuario-Agent": "Mozilla/5.0", Referer: "https://id.ytmp3.mobi/" } });
  const { data: init } = await client.get("https://d.ymcdn.org/api/v1/init", { params: { p: "y", 23: "1llum1n471", _: Math.random() } });
  if (!init?.convertURL) throw new Error("Init falló");
  const { data: conv } = await client.get(init.convertURL, { params: { v: id, f: format, _: Math.random() } });
  if (!conv?.progressURL || !conv?.downloadURL) throw new Error("Convert falló");
  let p = 0, a = 0;
  while (p < 3 && a < 20) {
    const { data } = await client.get(conv.progressURL);
    if ((data?.error||0)>0) throw new Error("Error progress");
    p = Number(data?.progress||0);
    if (p < 3) { a++; await new Promise(r=>setTimeout(r,350)); }
  }
  return { title: conv.title || id, dl: conv.downloadURL };
}

async function handler(m, { sock, text, prefix }) {
  const pf = prefix || m.prefix || config.command?.prefix || ".";
  const rawUrls = (text || m.args?.join(" ") || "").trim().split(/\s+/);
  const urls = rawUrls.filter(u=>YT_REGEX.test(u) || SPOTIFY_REGEX.test(u));
  if (urls.length < 2) {
    return m.reply(`*( 𝜰 ﹏ 𝜰 )* Necesito al menos 2 URLs para armar el ZIP.\nUsa el botón 📦 del comando \`${pf}mix\` o ejemplo:\n\`${pf}mixzip https://open.spotify.com/track/xxx https://youtu.be/yyy\`\nDetecté: ${rawUrls.join(" ").slice(0,100)}`);
  }
  if (urls.length > 8) {
    return m.reply(`*( 𝜰 ﹏ 𝜰 )* Máximo 8 temas por ZIP (pediste ${urls.length}). Usa \`${pf}mix artista 6\` para un mix más chico.`);
  }

  await m.react("📦");
  // Mensaje editable para no spamear - se va actualizando el mismo mensaje
  const statusMsg = await sock.sendMessage(m.chat, {
    text: `ꕥ 𝖬𝖨𝖷 𝖹𝖨𝖯 ｡ﾟ+.ღ\n\n• Temas :: ${urls.length}\n• Estado :: Iniciando...\n> Esto puede tardar 1-2 minutos, no reenvíes el comando.`
  }, { quoted: m });

  const editStatus = async (texto) => {
    try { await sock.sendMessage(m.chat, { text: texto, edit: statusMsg.key }); } catch { try { await m.reply(texto); } catch {} }
  };

  const tmpDir = path.join(process.cwd(), "temp");
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
  const id = crypto.randomBytes(4).toString("hex");
  const zipPath = path.join(tmpDir, `mix_${id}.zip`);

  try {
    const output = fs.createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 6 } });
    archive.pipe(output);

    let ok = 0, fail = 0;
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      try {
        await editStatus(
          `ꕥ 𝖬𝖨𝖷 𝖹𝖨𝖯 ｡ﾟ+.ღ\n\n` +
          `• Temas :: ${urls.length}\n` +
          `• Progreso :: ${i + 1}/${urls.length}\n` +
          `• Actual :: ${url.slice(0,45)}...\n` +
          `• OK :: ${ok} | Fallos :: ${fail}\n` +
          `• Estado :: ⏳ Descargando...`
        );
        let title, dl;
        if (SPOTIFY_REGEX.test(url)) {
          const res = await spotifyGetDl(url);
          title = res.title; dl = res.dl;
        } else {
          const res = await ytmp3GetDl(url, "mp3");
          title = res.title; dl = res.dl;
        }
        const res = await axios.get(dl, { responseType: "arraybuffer", timeout: 120000, maxContentLength: 100*1024*1024, maxBodyLength: 100*1024*1024 });
        const buffer = Buffer.from(res.data);
        if (!buffer.length) throw new Error("Buffer vacío");
        const safeTitle = (title || `track_${i+1}`).replace(/[\\/:*?"<>|]/g, "_").slice(0,40);
        archive.append(buffer, { name: `${String(i+1).padStart(2,"0")} - ${safeTitle}.mp3` });
        ok++;
        await editStatus(
          `ꕥ 𝖬𝖨𝖷 𝖹𝖨𝖯 ｡ﾟ+.ღ\n\n` +
          `• Temas :: ${urls.length}\n` +
          `• Progreso :: ${i + 1}/${urls.length} ✅\n` +
          `• Último :: ${safeTitle.slice(0,30)}\n` +
          `• OK :: ${ok} | Fallos :: ${fail}\n` +
          `• Estado :: 📦 Empaquetando...`
        );
      } catch (e) {
        console.error("[MIXZIP track fail]", urls[i], e.message);
        fail++;
        archive.append(`Error descargando ${url}: ${e.message}`, { name: `ERROR_${i+1}.txt` });
        await editStatus(
          `ꕥ 𝖬𝖨𝖷 𝖹𝖨𝖯 ｡ﾟ+.ღ\n\n` +
          `• Temas :: ${urls.length}\n` +
          `• Progreso :: ${i + 1}/${urls.length} ⚠️\n` +
          `• Error :: ${String(e.message).slice(0,40)}\n` +
          `• OK :: ${ok} | Fallos :: ${fail}`
        );
      }
    }

    // Info txt
    archive.append(`Mix generado por ${config.bot?.name || "Waguri Assistant"}\nFecha: ${new Date().toLocaleString("es-AR")}\nTemas: ${urls.length}\nOK: ${ok} | Fallos: ${fail}\nURLs:\n${urls.join("\n")}\n`, { name: "00_INFO.txt" });

    await editStatus(
      `ꕥ 𝖬𝖨𝖷 𝖹𝖨𝖯 ｡ﾟ+.ღ\n\n` +
      `• Temas :: ${urls.length}\n` +
      `• Progreso :: ${urls.length}/${urls.length}\n` +
      `• OK :: ${ok} | Fallos :: ${fail}\n` +
      `• Estado :: 📦 Finalizando ZIP...`
    );

    await archive.finalize();
    await new Promise((res, rej)=>{ output.on("close", res); output.on("error", rej); });

    await editStatus(
      `ꕥ 𝖬𝖨𝖷 𝖹𝖨𝖯 ｡ﾟ+.ღ\n\n` +
      `• Temas :: ${ok}/${urls.length} listos\n` +
      `• Estado :: 📤 Enviando archivo...`
    );

    const stat = fs.statSync(zipPath);
    const mb = (stat.size/1024/1024).toFixed(2);
    if (stat.size > 95*1024*1024) {
      await sock.sendMessage(m.chat, { document: fs.readFileSync(zipPath), mimetype: "application/zip", fileName: `mix_${urls.length}temas_${mb}MB.zip`, caption: `⚠️ ZIP muy grande (${mb} MB). Algunos WhatsApp no permiten >100MB.` }, { quoted: m });
    } else {
      await sock.sendMessage(m.chat, { document: fs.readFileSync(zipPath), mimetype: "application/zip", fileName: `mix_${urls.length}temas.zip`, caption: `ꕥ 𝖬𝖨𝖷 𝖯𝖫𝖠𝖸𝖫𝖨𝖲𝖳 ｡ﾟ+.ღ\n\n• Temas :: ${ok}/${urls.length}\n• Tamaño :: ${mb} MB\n• Fuente :: API default (play)\n\n> Tip: descomprime y tendrás todos los MP3 listos.` }, { quoted: m });
    }
    await editStatus(
      `ꕥ 𝖬𝖨𝖷 𝖹𝖨𝖯 - 𝖢𝖮𝖬𝖯𝖫𝖤𝖳𝖠𝖣𝖮 ｡ﾟ+.ღ\n\n` +
      `• Temas :: ${ok}/${urls.length}\n` +
      `• Tamaño :: ${mb} MB\n` +
      `• Estado :: ✅ Enviado correctamente\n\n` +
      `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    );
    await m.react("✅");
  } catch (e) {
    console.error("[MIXZIP ERROR]", e);
    await m.react("❌");
    try { await editStatus(`*( 𝜰 ﹏ 𝜰 )* Error armando ZIP:\n${e?.message || e}`); } catch {}
    return;
  } finally {
    try { if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath); } catch {}
  }
}

export { pluginConfig as config, handler };
