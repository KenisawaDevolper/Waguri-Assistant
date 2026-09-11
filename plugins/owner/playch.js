import axios from "axios"
import crypto from "crypto"
import fs from "fs"
import path from "path"
import os from "os"
import { spawn, exec } from "child_process"
import { promisify } from "util"
import yts from "yt-search"

const YOUTUBE_ID_REGEX = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
const run = promisify(exec)

function extractVideoId(url) {
  return String(url || "").match(YOUTUBE_ID_REGEX)?.[1] || null
}

async function fallbackToMp3Buffer(url) {
  const tempDir = path.join(os.tmpdir(), "temp")
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
        "User-Agent":
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
        attempts += 1
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
      return await fallbackToMp3Buffer(url)
    }
    throw e
  }
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`💡 *Ejemplo de uso:*\n${usedPrefix + command} swim chase atlantic`)

  const idsal = '120363409285330747@newsletter'
  let tempInput, tempOutput

  try {
    await m.reply('⏳ *Buscando, procesando y preparando el audio para el canal...*')

    let videoUrl = text.trim()
    let videoInfo = null

    if (!/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//i.test(videoUrl)) {
      const search = await yts(videoUrl)
      videoInfo = search.videos[0]
      if (!videoInfo) throw '❌ *No se encontró ningún resultado para tu búsqueda.*'
      videoUrl = videoInfo.url
    } else {
      const vId = extractVideoId(videoUrl)
      if (vId) {
        const search = await yts({ videoId: vId })
        videoInfo = search
      }
    }

    const result = await ytdl(videoUrl, "mp3")
    if (!result.status || !result.dl) {
      throw new Error(result.mess || '❌ *No se pudo obtener el enlace de descarga de la API.*')
    }

    const title = result.title || (videoInfo ? videoInfo.title : 'Audio')
    const authorName = videoInfo?.author?.name || videoInfo?.author || 'YouTube'
    const thumbnail = videoInfo?.thumbnail || videoInfo?.image || ''

    const mediaBuffer = await downloadBuffer(result.dl, false)

    tempInput = path.join(os.tmpdir(), `${Date.now()}_input.mp3`)
    tempOutput = path.join(os.tmpdir(), `${Date.now()}_output.opus`)

    fs.writeFileSync(tempInput, mediaBuffer)

    await new Promise((resolve, reject) => {
      const ffmpeg = spawn('ffmpeg', [
        '-i', tempInput,
        '-map_metadata', '-1',
        '-vn',
        '-ac', '1',
        '-ar', '48000',
        '-c:a', 'libopus',
        '-b:a', '128k',
        '-y',
        tempOutput
      ])

      let stderr = ''
      ffmpeg.stderr.on('data', d => stderr += d.toString())
      ffmpeg.on('close', code => {
        if (code === 0) resolve()
        else reject(new Error(stderr))
      })
    })

    const opusBuffer = fs.readFileSync(tempOutput)

    const newsletterInfo = {
      newsletterJid: idsal,
      serverMessageId: 100
    }

    await conn.sendMessage(idsal, {
      audio: opusBuffer,
      mimetype: 'audio/ogg; codecs=opus',
      ptt: true,
      contextInfo: {
        forwardingScore: 999,
        isForwarded: false,
        forwardedNewsletterMessageInfo: newsletterInfo,
        externalAdReplyOffOffOff: {
          title: title,
          body: authorName,
          thumbnailUrl: thumbnail,
          sourceUrl: videoUrl,
          mediaType: 1,
          renderLargerThumbnail: true,
          showAdAttribution: false
        }
      }
    }, { quoted: null })

    await m.reply(`✅ *¡Audio enviado con éxito al canal!*\n\n🎵 *Título:* ${title}`)

  } catch (e) {
    console.error('[PLAYCH ERROR]', e)
    m.reply(`❌ *Ocurrió un error:* ${e.message || e}`)
  } finally {
    if (tempInput && fs.existsSync(tempInput)) fs.unlinkSync(tempInput)
    if (tempOutput && fs.existsSync(tempOutput)) fs.unlinkSync(tempOutput)
  }
}

handler.help = ['playch']
handler.tags = ['owner']
handler.command = /^playch$/i
handler.owner = true

export default handler
