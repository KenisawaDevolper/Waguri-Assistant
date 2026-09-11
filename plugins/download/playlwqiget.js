import axios from "axios"

const API_BASE = "https://rest-api-lwqi.onrender.com/api/downloader/youtube"
const API_KEY = "Kenisawa"
const YOUTUBE_ID_REGEX = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/

function extractVideoId(url) {
  return String(url || "").match(YOUTUBE_ID_REGEX)?.[1] || null
}

async function fetchLwqi(url, isVideo = false) {
  const endpoint = isVideo ? "mp4" : "mp3"
  const apiUrlNew = `${API_BASE}/${endpoint}?url=${encodeURIComponent(url)}&apikey=${encodeURIComponent(API_KEY)}`
  const apiUrlOld = `${API_BASE}?url=${encodeURIComponent(url)}&apikey=${encodeURIComponent(API_KEY)}`
  const headers = {
    "User-Agent": "Mozilla/5.0 (Linux; Android 16; NX729J) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.7271.123 Mobile Safari/537.36",
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "es-ES,es;q=0.9",
    "Referer": "https://rest-api-lwqi.onrender.com/",
    "Origin": "https://rest-api-lwqi.onrender.com"
  }
  // Intenta nuevo endpoint /mp3 o /mp4
  try {
    const { data } = await axios.get(apiUrlNew, { timeout: 40000, headers, validateStatus: s => s < 500 })
    if (data?.status === 403 || data?.code === 403) throw new Error("LWQI 403 - API bloqueada")
    if (data?.status && data?.result?.url) {
      // nuevo formato: { title, url, format }
      return { title: data.result.title, url: data.result.url, format: data.result.format || endpoint, thumbnail: data.result.thumbnail, duration: data.result.duration || "0", isNew: true }
    }
    if (data?.status && data?.result?.medias?.length) return { ...data.result, isNew: false }
  } catch (e) {
    if (e.response?.status === 403) throw e
    // fallback a viejo si falla el nuevo
  }
  // Fallback viejo endpoint unificado
  try {
    const { data } = await axios.get(apiUrlOld, { timeout: 40000, headers, validateStatus: s => s < 500 })
    if (data?.status === 403 || data?.code === 403) throw new Error("LWQI 403 - API bloqueada")
    if (!data?.status || (!data?.result?.medias?.length && !data?.result?.url)) {
      throw new Error(data?.message || data?.msg || "Respuesta inválida de LWQI API")
    }
    if (data.result.url) return { ...data.result, isNew: true }
    return { ...data.result, isNew: false }
  } catch (err) {
    if (err.response?.status === 403) {
      const msg = err.response?.data?.message || err.response?.data?.msg || ""
      throw new Error(`403 Forbidden${msg ? ": " + msg : ""} — La API LWQI bloqueó la IP.`)
    }
    throw err
  }
}

function pickMedia(medias, isVideo) {
  if (isVideo) {
    // prefer 360p (itag 18) o 720p, luego 480p
    const pref = medias.filter(m => m.format?.includes("360p") || m.format?.includes("720p") || m.format?.includes("480p"))
    if (pref.length) {
      // prioriza 360p para peso ligero
      const p360 = pref.find(m => m.format.includes("360p"))
      if (p360) return p360
      return pref[0]
    }
    // fallback primer video mp4
    return medias.find(m => m.format?.includes(".mp4")) || medias[0]
  } else {
    // audio: busca .m4a 800KB
    const audio = medias.find(m => m.format?.includes(".m4a") || m.format?.toLowerCase().includes("audio"))
    if (audio) return audio
    // filtra por mime audio o menor fileSize
    const audios = medias.filter(m => m.url && m.fileSize && m.fileSize < 5 * 1024 * 1024)
    if (audios.length) return audios.sort((a,b)=>a.fileSize - b.fileSize)[0]
    return medias[medias.length - 1]
  }
}

async function downloadBuffer(url) {
  const res = await axios.get(url, {
    responseType: "arraybuffer",
    timeout: 120000,
    maxContentLength: 150 * 1024 * 1024,
    maxBodyLength: 150 * 1024 * 1024,
    headers: { "User-Agent": "Mozilla/5.0 (Linux; Android 16)" }
  })
  const type = String(res.headers["content-type"] || "").toLowerCase()
  if (type.includes("text/html") || type.includes("application/json")) {
    throw new Error("El enlace no es un archivo multimedia válido")
  }
  return Buffer.from(res.data)
}

let handler = async (m, { conn, text }) => {
  const query = (text || "").trim()
  const [type, ...urlParts] = query.split(" ")
  const videoUrl = urlParts.join(" ")

  if (!type || !videoUrl) return m.reply(
    `ꕥ 𝖯𝖫𝖠𝖸𝟤𝖦𝖤𝖳 • 𝑊⍺ց𝗎ɾı ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
    `> Uso: \`${m.prefix}playlwqiget mp3 <url>\`\n` +
    `> Uso: \`${m.prefix}playlwqiget mp4 <url>\``
  )

  if (!extractVideoId(videoUrl)) {
    return m.reply(`❌ URL de YouTube no válida`)
  }

    await m.react("⏳")

  try {
    const isVideo = type.startsWith("mp4")
    const asDocument = type.endsWith("doc")

    let result
    try {
      result = await fetchLwqi(videoUrl, isVideo)
    } catch (lwqiErr) {
      if (String(lwqiErr.message).includes("403")) {
        await m.reply(
          `ꕥ *LWQI bloqueado (403)* 🌸\n\n` +
          `> La IP de HidenCloud fue bloqueada por LWQI.\n` +
          `> Reintentando con API principal \`.play\`...\n\n` +
          `*Motivo:* ${lwqiErr.message}`
        )
        throw new Error(`LWQI 403 — Usa \`${m.prefix}play ${videoUrl}\` como alternativa.`)
      }
      throw lwqiErr
    }
    // Soporta ambos formatos: nuevo {url} y viejo {medias[]}
    let mediaUrl, mediaFormat, mediaSize, mediaThumb
    if (result.isNew && result.url) {
      mediaUrl = result.url
      mediaFormat = result.format || (isVideo ? "mp4" : "mp3")
      mediaSize = result.fileSize || 0
      mediaThumb = result.thumbnail
    } else {
      const media = pickMedia(result.medias, isVideo)
      if (!media?.url) throw new Error("No se encontró el medio en la respuesta LWQI")
      mediaUrl = media.url
      mediaFormat = media.format
      mediaSize = media.fileSize
      mediaThumb = result.thumbnail
      // guarda para info
      result._pickedFormat = mediaFormat
      result._pickedSize = mediaSize
    }

    const mediaBuffer = await downloadBuffer(mediaUrl)
    const cleanTitle = (result.title || "media").replace(/[\\/:*?"<>|]/g, "_")

    if (asDocument) {
      await conn.sendMessage(m.chat, {
        document: mediaBuffer,
        mimetype: isVideo ? "video/mp4" : "audio/mpeg",
        fileName: `${cleanTitle}.${isVideo ? "mp4" : "mp3"}`,
      }, { quoted: m })
    } else if (isVideo) {
      await conn.sendMessage(m.chat, {
        video: mediaBuffer,
        mimetype: "video/mp4",
        caption: `🎬 *${result.title || cleanTitle}*`,
        fileName: `${cleanTitle}.mp4`,
      }, { quoted: m })
    } else {
      await conn.sendMessage(m.chat, {
        audio: mediaBuffer,
        mimetype: "audio/mpeg",
        ptt: false,
        fileName: `${cleanTitle}.mp3`,
      }, { quoted: m })
    }

    // info extra Waguri
    const sizeStr = mediaSize ? `${(mediaSize/1024/1024).toFixed(2)} MB` : "desconocido"
    await conn.sendMessage(m.chat, {
      text:
        `ꕥ 𝖣𝖤𝖲𝖢𝖠𝖱𝖦𝖠 LWQI 🌸\n\n` +
        `      • Título :: *${result.title}*\n` +
        `      • Duración :: *${result.duration || "?"}s*\n` +
        `      • Formato :: *${mediaFormat}*\n` +
        `      • Tamaño :: *${sizeStr}*\n\n` +
        `> 𝗐⍺𝗀𝗎ɾı ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ( ᴗ͈ˬᴗ͈ )`,
      contextInfo: { externalAdReply: { title: result.title, body: "LWQI • Waguri Assistant", thumbnailUrl: mediaThumb || result.thumbnail, sourceUrl: videoUrl, mediaType: 1 } }
    }, { quoted: m })

    await m.react("✓")
  } catch (e) {
    console.error("[PLAYLWQIGET ERROR]", e)
    await m.react("✕")
    return m.reply(`*Error LWQI*:\n\n${e?.message || "No se pudo procesar la descarga."}`)
  }
}

handler.help = ["playlwqiget"]
handler.tags = ["downloader"]
handler.command = /^(playlwqiget|play2get|lwget)$/i
handler.limit = true

export default handler
