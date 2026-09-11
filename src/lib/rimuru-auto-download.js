import axios from "axios";
import { getDatabase } from "./rimuru-database.js";
import { logger } from "./rimuru-logger.js";
import { sendAlbum } from "./rimuru-album.js";

const SUPPORTED_PATTERNS = [
  "youtube.com",
  "youtu.be",
  "tiktok.com",
  "vt.tiktok.com",
  "facebook.com",
  "fb.watch",
  "fb.com",
  "instagram.com",
  "pinterest.com",
  "pin.it",
  "capcut.com",
  "twitter.com",
  "x.com",
  "threads.net",
  "reddit.com",
  "spotify.com",
];

const SUPPORTED_PLATFORMS = SUPPORTED_PATTERNS;

const URL_REGEX = /(https?:\/\/[^\s<>"']+)/gi;

function containsSupportedLink(text) {
  if (!text) return false;
  return URL_REGEX.test(text);
}

function extractUrl(text) {
  if (!text) return null;
  const match = text.match(URL_REGEX);
  return match ? match[0].replace(/[.,;)\]]+$/, "") : null;
}

function isAutoDlEnabled(chatJid) {
  try {
    const db = getDatabase();
    const groupData = db.getGroup(chatJid);
    return groupData?.autodl || false;
  } catch (_) {
    return false;
  }
}

async function handleAutoDownload(m, sock, text) {
  const msgText = text || m?.text;
  if (!m || !msgText || m.fromMe || !m.chat) return;

  // Verificar si autodl está activado en la base de datos
  if (!isAutoDlEnabled(m.chat)) return;

  // Ignorar comandos
  if (/^[!./#$]/.test(msgText.trim())) return;

  if (!containsSupportedLink(msgText)) return;

  const targetUrl = extractUrl(msgText);
  if (!targetUrl) return;

  try {
    await sock.sendMessage(m.chat, { react: { text: "✨", key: m.key } });
  } catch (_) {}

  try {
    const isYouTube = /(?:youtu\.be\/|youtube\.com\/)/i.test(targetUrl);
    const isSpotify = /https?:\/\/open\.spotify\.com\/(track|album|playlist)\/[^\s]+/i.test(targetUrl);
    const isPinterest = /(?:pinterest\.com\/pin|pin\.it)\//i.test(targetUrl);
    const isTikTok = /(?:tiktok\.com|vt\.tiktok\.com)/i.test(targetUrl);

    // ============================================================
    // 1. YOUTUBE (API YO SOY YO)
    // ============================================================
    if (isYouTube) {
      const apiKey = "yosoyyo_sk_xb0u98gc";
      const isShorts = targetUrl.includes("/shorts/");
      const reqFormat = isShorts ? "mp4" : "mp3";
      
      const apiUrl = `https://apiyosoyyo-ofc.onrender.com/api/youtube/v2?url=${encodeURIComponent(targetUrl)}&format=${reqFormat}&apiKey=${apiKey}`;
      const { data } = await axios.get(apiUrl, { timeout: 40000 });

      if (data?.status && data?.result) {
        const res = data.result;
        const title = (res.title || "YouTube Content").replace(/\s+/g, " ").trim();
        const shortTitle = title.length > 80 ? title.slice(0, 80) + "..." : title;
        const thumbnail = res.thumbnail || "https://files.catbox.moe/megwu0.png";
        const items = Array.isArray(res.results) ? res.results : [];

        const videoItem = items.find((i) => i.type === "video" && (i.quality === "720p" || i.quality === "480p")) || items.find((i) => i.type === "video");
        const audioItem = items.find((i) => i.type === "audio" || i.extension === "mp3") || items[0];

        const selectedMedia = (isShorts && videoItem) ? videoItem : (audioItem || videoItem);

        if (selectedMedia?.download) {
          const isAudio = selectedMedia.type === "audio" || selectedMedia.extension === "mp3";

          const caption =
            `*¡𝖠𝗎ƚ𝗈-𝖣𝗈𝗐𝗇𝗅𝗈⍺ᑯ 𝖣ᧉƚᧉ𝖼ƚ⍺ᑯ𝗈!* 🔴 ฅ^·ﻌ·^ฅ\n` +
            `> _Procesado desde YOUTUBE ≽^• ˕ • ྀི≼_\n\n` +
            `## 🌸 \`𝖨𝗇𝖿𝗈𝗋𝗆⍺𝖼ıó𝗇:\`\n` +
            `- *✐ ƚíƚ𝗎𝗅𝗈:* *${shortTitle}*\n` +
            `- *✐ 𝖼⍺𝗅ıᑯ⍺ᑯ:* *${selectedMedia.quality || "Estándar"}*\n` +
            `- *✐ 𝖿𝗈𝗋𝗆⍺ƚ𝗈:* *${isAudio ? "Audio MP3 🎧" : "Video MP4 🎥"}*\n\n` +
            `｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ) *Enviando contenido...*`;

          if (isAudio) {
            try {
              await sock.sendMessage(m.chat, { image: { url: thumbnail }, caption }, { quoted: m });
            } catch (_) {}
          }

          const fileBuff = await axios.get(selectedMedia.download, {
            responseType: "arraybuffer",
            timeout: 90000,
            headers: { "User-Agent": "Mozilla/5.0" }
          });

          const bufferData = Buffer.from(fileBuff.data);

          if (isAudio) {
            await sock.sendMessage(
              m.chat,
              { audio: bufferData, mimetype: "audio/mpeg", fileName: `${title}.mp3`, ptt: false },
              { quoted: m }
            );
          } else {
            await sock.sendMessage(
              m.chat,
              { video: bufferData, mimetype: "video/mp4", caption },
              { quoted: m }
            );
          }

          await sock.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
          return;
        }
      }
    }

    // ============================================================
    // 2. SPOTIFY (API NEXRAY)
    // ============================================================
    if (isSpotify) {
      const spApiUrl = `https://api.nexray.eu.cc/downloader/spotify?url=${encodeURIComponent(targetUrl)}`;
      const { data } = await axios.get(spApiUrl, { timeout: 45000, headers: { "User-Agent": "Mozilla/5.0" } });

      if (data?.status && data?.result?.url) {
        const res = data.result;
        const title = res.title || "Spotify Track";
        const artist = res.artist || "Artista Desconocido";
        const downloadUrl = res.url;

        const coverFallback = "https://files.catbox.moe/megwu0.png";
        const musicCardUrl = `https://api.nexray.eu.cc/canvas/musiccard?judul=${encodeURIComponent(title)}&nama=${encodeURIComponent(artist)}&image_url=${encodeURIComponent(coverFallback)}`;

        const caption =
          `*¡𝖠𝗎ƚ𝗈-𝖣𝗈𝗐𝗇𝗅𝗈⍺ᑯ 𝖣ᧉƚᧉ𝖼ƚ⍺ᑯ𝗈!* 💚 ฅ^·ﻌ·^ฅ\n` +
          `> _Procesado desde SPOTIFY ≽^• ˕ • ྀི≼_\n\n` +
          `## 🎶 \`𝖨𝗇𝖿𝗈𝗋𝗆⍺𝖼ıó𝗇:\`\n` +
          `- *✐ ƚíƚ𝗎𝗅𝗈:* *${title}*\n` +
          `- *✐ ⍺𝗋ƚı𝗌ƚ⍺:* *${artist}*\n` +
          `- *✐ 𝖿𝗈𝗋𝗆⍺ƚ𝗈:* *Audio MP3 🎧*\n\n` +
          `｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ) *Enviando contenido...*`;

        try {
          await sock.sendMessage(m.chat, { image: { url: musicCardUrl }, caption }, { quoted: m });
        } catch (_) {
          try {
            await sock.sendMessage(m.chat, { image: { url: coverFallback }, caption }, { quoted: m });
          } catch (_) {}
        }

        const fileBuff = await axios.get(downloadUrl, {
          responseType: "arraybuffer",
          timeout: 90000,
          headers: { "User-Agent": "Mozilla/5.0" }
        });

        await sock.sendMessage(
          m.chat,
          {
            audio: Buffer.from(fileBuff.data),
            mimetype: "audio/mpeg",
            fileName: `${title} - ${artist}.mp3`,
            ptt: false
          },
          { quoted: m }
        );

        await sock.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
        return;
      }
    }

    // ============================================================
    // 3. PINTEREST (API NEXRAY)
    // ============================================================
    if (isPinterest) {
      const pinApiUrl = `https://api.nexray.eu.cc/downloader/pinterest?url=${encodeURIComponent(targetUrl)}`;
      const { data } = await axios.get(pinApiUrl, { timeout: 30000, headers: { "User-Agent": "Mozilla/5.0" } });

      if (data?.status && data?.result) {
        const res = data.result;

        if (res.video) {
          const title = (res.title || "Pinterest Video").replace(/\s+/g, " ").trim();
          const author = res.author || "Pinterest User";

          const caption =
            `*¡𝖠𝗎ƚ𝗈-𝖣𝗈𝗐𝗇𝗅𝗈⍺ᑯ 𝖣ᧉƚᧉ𝖼ƚ⍺ᑯ𝗈!* 📌 ฅ^·ﻌ·^ฅ\n` +
            `> _Procesado desde PINTEREST ≽^• ˕ • ྀི≼_\n\n` +
            `## 📌 \`𝖨𝗇𝖿𝗈𝗋𝗆⍺𝖼ıó𝗇:\`\n` +
            `- *✐ ƚíƚ𝗎𝗅𝗈:* *${title}*\n` +
            `- *✐ ⍺𝗎ƚ𝗈𝗋:* *${author}*\n` +
            `- *✐ 𝖿𝗈𝗋𝗆⍺ƚ𝗈:* *Video MP4 🎥*\n\n` +
            `｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ) *Enviando contenido...*`;

          await sock.sendMessage(m.chat, { video: { url: res.video }, caption }, { quoted: m });
          await sock.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
          return;
        }

        const items = Array.isArray(res) ? res : [res];
        if (items.length > 0 && items[0].images_url) {
          const item = items[0];
          const imgUrl = item.images_url;
          const title = (item.grid_title || item.seo_alt_text || "Pinterest Image").replace(/\s+/g, " ").trim();
          const author = item.pinner?.full_name || item.pinner?.username || "Pinterest User";

          const caption =
            `*¡𝖠𝗎ƚ𝗈-𝖣𝗈𝗐𝗇𝗅𝗈⍺ᑯ 𝖣ᧉƚᧉ𝖼ƚ⍺ᑯ𝗈!* 📌 ฅ^·ﻌ·^ฅ\n` +
            `> _Procesado desde PINTEREST ≽^• ˕ • ྀི≼_\n\n` +
            `## 📌 \`𝖨𝗇𝖿𝗈𝗋𝗆⍺𝖼ıó𝗇:\`\n` +
            `- *✐ ƚíƚ𝗎𝗅𝗈:* *${title}*\n` +
            `- *✐ ⍺𝗎ƚ𝗈𝗋:* *${author}*\n` +
            `- *✐ 𝖿𝗈𝗋𝗆⍺ƚ𝗈:* *Imagen 📸*\n\n` +
            `｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ) *Enviando contenido...*`;

          await sock.sendMessage(m.chat, { image: { url: imgUrl }, caption }, { quoted: m });
          await sock.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
          return;
        }
      }
    }

    // ============================================================
    // 4. TIKTOK (API IZUKA)
    // ============================================================
    if (isTikTok) {
      const ttApiUrl = `https://my.izuka-api.xyz/api/downloader/aio-v2?url=${encodeURIComponent(targetUrl)}`;
      const { data } = await axios.get(ttApiUrl, { timeout: 35000, headers: { "User-Agent": "Mozilla/5.0" } });

      if (data?.status && data?.result) {
        const res = data.result;
        const title = (res.title || "TikTok Content").replace(/\s+/g, " ").trim();
        const shortTitle = title.length > 80 ? title.slice(0, 80) + "..." : title;
        const author = res.author || "Anónimo";
        const duration = res.duration || "Desconocida";

        const videos = Array.isArray(res.videos) ? res.videos : [];
        const photos = Array.isArray(res.photos) ? res.photos : [];
        const audios = Array.isArray(res.audios) ? res.audios : [];

        const caption =
          `*¡𝖠𝗎ƚ𝗈-𝖣𝗈𝗐𝗇𝗅𝗈⍺ᑯ 𝖣ᧉƚᧉ𝖼ƚ⍺ᑯ𝗈!* 🎵 ฅ^·ﻌ·^ฅ\n` +
          `> _Procesado desde TIKTOK ≽^• ˕ • ྀི≼_\n\n` +
          `## 🌸 \`𝖨𝗇𝖿𝗈𝗋𝗆⍺𝖼ıó𝗇:\`\n` +
          `- *✐ ƚíƚ𝗎𝗅𝗈:* *${shortTitle}*\n` +
          `- *✐ ⍺𝗎ƚ𝗈𝗋:* *${author}*\n` +
          `- *✐ ᑯ𝗎𝗋⍺𝖼ıó𝗇:* *${duration}*\n\n` +
          `｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ) *Enviando contenido...*`;

        // 1. Si es video de TikTok
        if (videos.length > 0 && videos[0].url) {
          await sock.sendMessage(m.chat, { video: { url: videos[0].url }, caption }, { quoted: m });
          await sock.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
          return;
        }

        // 2. Si es carrusel de fotos (slideshow) - álbum nativo
        if (photos.length > 0) {
          if (photos.length >= 2) {
            const albumList = photos.map((p, idx) => ({
              image: { url: p.url },
              caption: idx === 0 ? caption : "",
              mimetype: "image/jpeg",
            }));
            await sendAlbum(sock, m.chat, albumList, m);
          } else {
            await sock.sendMessage(m.chat, { image: { url: photos[0].url }, caption }, { quoted: m });
          }

          // Enviar audio de fondo si está presente
          if (audios.length > 0 && audios[0].url) {
            await sock.sendMessage(
              m.chat, 
              { audio: { url: audios[0].url }, mimetype: "audio/mp4", ptt: false }, 
              { quoted: m }
            );
          }

          await sock.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
          return;
        }
      }
    }

    // ============================================================
    // 5. RESTO DE REDES SOCIALES (API NEXRAY AIO)
    // ============================================================
    const apiUrl = `https://api.nexray.eu.cc/downloader/aio?url=${encodeURIComponent(targetUrl)}`;
    const { data } = await axios.get(apiUrl, { timeout: 30000, headers: { "User-Agent": "Mozilla/5.0" } });

    if (data?.status && data?.result) {
      const res = data.result;
      const title = (res.title || "Sin título").replace(/\s+/g, " ").trim();
      const shortTitle = title.length > 80 ? title.slice(0, 80) + "..." : title;
      const author = res.author || res.unique_id || "Desconocido";
      const source = (res.source || "AutoDL").toUpperCase();
      const thumbnail = res.thumbnail || "https://files.catbox.moe/megwu0.png";

      const medias = Array.isArray(res.medias) ? res.medias : [];
      const images = medias.filter((item) => item.type === "image");
      const videos = medias.filter((item) => item.type === "video");
      const audios = medias.filter((item) => item.type === "audio");

      const caption =
        `*¡𝖠𝗎ƚ𝗈-𝖣𝗈𝗐𝗇𝗅𝗈⍺ᑯ 𝖣ᧉƚᧉ𝖼ƚ⍺ᑯ𝗈!* 📥 ฅ^·ﻌ·^ฅ\n` +
        `> _Procesado desde ${source} ≽^• ˕ • ྀི≼_\n\n` +
        `## 🌸 \`𝖨𝗇𝖿𝗈𝗋𝗆⍺𝖼ıó𝗇:\`\n` +
        `- *✐ ƚíƚ𝗎𝗅𝗈:* *${shortTitle}*\n` +
        `- *✐ ⍺𝗎ƚ𝗈𝗋:* *${author}*\n` +
        `- *✐ 𝗈𝗋ı𝗀ᧉ𝗇:* *${source}*\n\n` +
        `｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ) *Enviando contenido...*`;

      // Imágenes múltiples - álbum nativo
      if (images.length > 0) {
        if (images.length >= 2) {
          const albumList = images.map((img, idx) => ({
            image: { url: img.url },
            caption: idx === 0 ? caption : "",
            mimetype: "image/jpeg",
          }));
          await sendAlbum(sock, m.chat, albumList, m);
        } else {
          await sock.sendMessage(m.chat, { image: { url: images[0].url }, caption }, { quoted: m });
        }
        if (audios.length > 0) {
          await sock.sendMessage(m.chat, { audio: { url: audios[0].url }, mimetype: "audio/mpeg", ptt: false }, { quoted: m });
        }
        await sock.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
        return;
      }

      // Video
      if (videos.length > 0) {
        const bestVideo = videos.find((v) => v.quality === "hd_no_watermark") || videos[0];
        await sock.sendMessage(m.chat, { video: { url: bestVideo.url }, caption }, { quoted: m });
        await sock.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
        return;
      }

      // Audio
      const audioUrl = audios[0]?.url || res.audioPreview;
      if (audioUrl) {
        await sock.sendMessage(m.chat, { image: { url: thumbnail }, caption }, { quoted: m });

        const audioBuff = await axios.get(audioUrl, { responseType: "arraybuffer", timeout: 60000 });
        await sock.sendMessage(
          m.chat,
          { audio: Buffer.from(audioBuff.data), mimetype: "audio/mpeg", fileName: `${title}.mp3`, ptt: false },
          { quoted: m }
        );
        await sock.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
        return;
      }
    }
  } catch (err) {
    logger.error("AutoDL", err.message || err);
    try {
      await sock.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    } catch (_) {}
  }
}

export { handleAutoDownload, containsSupportedLink, SUPPORTED_PLATFORMS };
