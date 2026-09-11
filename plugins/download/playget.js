import axios from "axios"
import crypto from "crypto"
import fs from "fs"
import path from "path"
import { exec } from "child_process"
import { promisify } from "util"

const YOUTUBE_ID_REGEX = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
const run = promisify(exec)

function extractVideoId(url) {
  return String(url || "").match(YOUTUBE_ID_REGEX)?.[1] || null
}

/**
 * Convierte el audio mediante ffmpeg local si la descarga directa falla o da problemas.
 */
async function fallbackToMp3Buffer(url) {
  const tempDir = path.join(process.cwd(), "temp")
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true })

  const id = crypto.randomBytes(6).toString("hex")
  const inputPath = path.join(tempDir, `ytfb_${id}.bin`)
  const outputPath = path.join(tempDir, `ytfb_${id}.mp3`)

  try {
    const { data } = await axios.get(url, {
      responseType: "arraybuffer",
      timeout: 60000,
    })

    const buffer = Buffer.from(data)
    if (!buffer.length) {
      throw new Error("Audio fallback vacío")
    }

    fs.writeFileSync(inputPath, buffer)

    await run(
      `ffmpeg -y -i "${inputPath}" -vn -map_metadata -1 -ac 2 -ar 44100 -c:a libmp3lame -b:a 192k "${outputPath}"`,
      { timeout: 120000 }
    )

    const mp3Buffer = fs.readFileSync(outputPath)
    if (!mp3Buffer.length) {
      throw new Error("Error en conversión fallback a MP3")
    }

    return mp3Buffer
  } finally {
    try {
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath)
    } catch {}
    try {
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath)
    } catch {}
  }
}

/**
 * Scraper YTDL principal utilizando d.ymcdn.org
 */
async function ytdl(url, format = "mp3") {
  try {
    const videoId = extractVideoId(url)

    if (!videoId) {
      return {
        status: false,
        mess: "URL de YouTube no válida o ID no reconocido.",
      }
    }

    const normalizedFormat =
      String(format || "mp3").toLowerCase() === "mp4" ? "mp4" : "mp3"

    const client = axios.create({
      timeout: 60000,
      headers: {
        "Usuario-Agent":
          "Mozilla/5.0 (Linux; Android 16; NX729J) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.7271.123 Mobile Safari/537.36",
        Referer: "https://id.ytmp3.mobi/",
      },
    })

    const { data: init } = await client.get("https://d.ymcdn.org/api/v1/init", {
      params: {
        p: "y",
        23: "1llum1n471",
        _: Math.random(),
      },
    })

    if (!init?.convertURL) {
      return {
        status: false,
        mess: "No se pudo inicializar el servidor de descarga.",
      }
    }

    const { data: convert } = await client.get(init.convertURL, {
      params: {
        v: videoId,
        f: normalizedFormat,
        _: Math.random(),
      },
    })

    if (!convert?.progressURL || !convert?.downloadURL) {
      return {
        status: false,
        mess: "Error al obtener los datos de conversión.",
      }
    }

    let progress = 0
    let title = convert.title || ""
    let attempts = 0
    const maxAttempts = 20

    while (progress < 3 && attempts < maxAttempts) {
      const { data } = await client.get(convert.progressURL)

      if ((data?.error || 0) > 0) {
        return {
          status: false,
          mess: `Error devuelto por el servidor: ${data.error}`,
        }
      }

      progress = Number(data?.progress || 0)
      title = data?.title || title

      if (progress < 3) {
        attempts += 1;
        await new Promise((resolve) => setTimeout(resolve, 300))
      }
    }

    if (attempts >= maxAttempts && progress < 3) {
      return {
        status: false,
        mess: "El proceso tardó demasiado tiempo en responder.",
      }
    }

    return { status: true, title, dl: convert.downloadURL }
  } catch (e) {
    return { status: false, mess: `Error del sistema: ${e.message}` }
  }
}

/**
 * Obtener Buffer del archivo desde el enlace generado
 */
async function downloadBuffer(url, isVideo = false) {
  try {
    const res = await axios.get(url, {
      responseType: "arraybuffer",
      timeout: 120000,
      maxContentLength: 150 * 1024 * 1024,
      maxBodyLength: 150 * 1024 * 1024,
    })

    const type = String(res.headers["content-type"] || "").toLowerCase()
    if (type.includes("text/html") || type.includes("application/json")) {
      throw new Error("El enlace devuelto no es un archivo multimedia válido")
    }

    return Buffer.from(res.data)
  } catch (e) {
    if (!isVideo) {
      // Si falla la descarga directa de MP3, intenta mediante conversión local de FFmpeg
      return await fallbackToMp3Buffer(url)
    }
    throw e
  }
}

// Handler principal del plugin
let handler = async (m, { conn, text }) => {
  const query = (text || "").trim()
  const [type, ...urlParts] = query.split(" ")
  const videoUrl = urlParts.join(" ")

  if (!type || !videoUrl) return m.reply("❌ Parámetros inválidos")

  await m.react("⏳")

  try {
    const isVideo = type.startsWith("mp4")
    const asDocument = type.endsWith("doc")
    const targetFormat = isVideo ? "mp4" : "mp3"

    // Ejecuta el scraper ytdl
    const result = await ytdl(videoUrl, targetFormat)

    if (!result.status || !result.dl) {
      throw new Error(result.mess || "No se pudo obtener el enlace de descarga")
    }

    const mediaBuffer = await downloadBuffer(result.dl, isVideo)
    const cleanTitle = (result.title || "media").replace(/[\\/:*?"<>|]/g, "_")

    if (asDocument) {
      await conn.sendMessage(
        m.chat,
        {
          document: mediaBuffer,
          mimetype: isVideo ? "video/mp4" : "audio/mpeg",
          fileName: `${cleanTitle}.${isVideo ? "mp4" : "mp3"}`,
        },
        { quoted: m }
      )
    } else if (isVideo) {
      await conn.sendMessage(
        m.chat,
        {
          video: mediaBuffer,
          mimetype: "video/mp4",
          caption: `🎬 *${result.title || cleanTitle}*`,
          fileName: `${cleanTitle}.mp4`,
        },
        { quoted: m }
      )
    } else {
      await conn.sendMessage(
        m.chat,
        {
          audio: mediaBuffer,
          mimetype: "audio/mpeg",
          ptt: false,
          fileName: `${cleanTitle}.mp3`,
        },
        { quoted: m }
      )
    }

    await m.react("✓")
  } catch (e) {
    console.error("[PLAYGET ERROR]", e)
    await m.react("✕")
    return m.reply(`*Error*:\n\n${e?.message || "No se pudo procesar la descarga."}`)
  }
}

handler.help = ["playget"]
handler.tags = ["downloader"]
handler.command = /^(playget)$/i
handler.limit = true

export default handler
