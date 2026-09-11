import axios from "axios"
import FormData from "form-data"
import { generateWAMessageFromContent } from "ourin"

const pluginConfig = {
  name: "tourl",
  alias: ["catbox", "tourl2", "upurl"],
  category: "tools",
  description: "Sube archivo a Catbox.moe y genera link 🌸",
  usage: ".tourl [reply a imagen/video/sticker/archivo]",
  example: ".tourl (reply a imagen)",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
}

async function uploadToCatbox(buffer, filename) {
  const form = new FormData()
  form.append("reqtype", "fileupload")
  form.append("fileToUpload", buffer, filename)
  try {
    const { data } = await axios.post("https://catbox.moe/user/api.php", form, {
      headers: { ...form.getHeaders(), "User-Agent": "Mozilla/5.0 (Linux; Android) Waguri/1.0" },
      timeout: 60000, maxContentLength: Infinity, maxBodyLength: Infinity, validateStatus: s => s < 500
    })
    const url = String(data || "").trim()
    if (url.startsWith("https://")) return url
    throw new Error(url || "Catbox error")
  } catch (err) {
    const body = err.response?.data ? String(err.response.data).trim() : err.message
    const status = err.response?.status
    if (status === 412 || body.includes("412") || body.toLowerCase().includes("invalid")) throw new Error(`Catbox ${status||412}: ${body}`)
    throw err
  }
}

async function uploadToTmpFiles(buffer, filename) {
  const form = new FormData()
  form.append("file", buffer, { filename, contentType: "application/octet-stream" })
  const { data } = await axios.post("https://tmpfiles.org/api/v1/upload", form, {
    headers: { ...form.getHeaders(), "User-Agent": "Mozilla/5.0 Waguri/1.0" },
    timeout: 60000, maxContentLength: Infinity, maxBodyLength: Infinity, validateStatus: s => s < 500
  })
  // tmpfiles: { status:"success", data:{url:"https://tmpfiles.org/dl/xxx"} }
  let url = data?.data?.url || data?.url
  if (url && url.includes("tmpfiles.org/dl/")) url = url.replace("/dl/", "/dl/") // keep as is, es directo
  if (!url || !url.startsWith("https://")) throw new Error(data?.message || JSON.stringify(data).slice(0,120) || "TmpFiles falló")
  return url
}

async function uploadToFileIO(buffer, filename) {
  const form = new FormData()
  form.append("file", buffer, { filename })
  const { data } = await axios.post("https://file.io", form, {
    headers: { ...form.getHeaders(), "User-Agent": "Mozilla/5.0 Waguri/1.0" },
    timeout: 60000, maxContentLength: Infinity, maxBodyLength: Infinity
  })
  const url = data?.link || data?.url
  if (!url) throw new Error(data?.message || "FileIO falló")
  return url
}

async function uploadWithFallback(buffer, filename) {
  try { return await uploadToCatbox(buffer, filename) } catch (e) {
    const msg = String(e.message)
    console.log("[TOURL] Catbox fallo:", msg.slice(0,120), "-> probando tmpfiles")
    if (!msg.includes("412") && !msg.toLowerCase().includes("invalid") && !msg.toLowerCase().includes("catbox")) throw e
    try { return await uploadToTmpFiles(buffer, filename) } catch (e2) {
      console.log("[TOURL] TmpFiles fallo:", String(e2.message).slice(0,120), "-> probando file.io")
      return await uploadToFileIO(buffer, filename)
    }
  }
}

async function handler(m, { sock }) {
  let buffer = null
  let filename = `waguri_${Date.now()}`
  let mimetype = ""

  // Detecta media en mensaje actual o citado
  const quoted = m.quoted
  const target = (m.isMedia ? m : quoted?.isMedia ? quoted : null)

  if (!target) {
    // intenta descargar si es sticker/viewonce etc
    if (m.isImage || m.isVideo || m.isDocument || m.isAudio || m.isSticker) {
      // ya es target = m
    } else {
      return m.reply(
        `ꕥ 𝖳𝖮𝖴𝖱𝖫 • 𝑊⍺ց𝗎ɾı ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `      𓈒 ◌ㅤ──    *𝖴𝖲𝖮*\n` +
        `      • Envía una imagen/video/sticker/archivo con \`${m.prefix}tourl\`\n` +
        `      • O responde a un archivo con \`${m.prefix}tourl\`\n\n` +
        `> 𝗐⍺𝗀𝗎ɾı ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ 🌸`
      )
    }
  }

  const src = target || m
  // Si es citado, usa el citado
  const dlSource = quoted?.isMedia ? quoted : m.isMedia ? m : quoted

  try {
    await m.react("⏳")

    if (quoted && quoted.isMedia) {
      buffer = await quoted.download()
      mimetype = quoted.mimetype || ""
      filename = quoted.fileName || quoted.filename || `file_${Date.now()}`
    } else if (m.isMedia) {
      buffer = await m.download()
      mimetype = m.mimetype || ""
      filename = m.fileName || m.filename || `file_${Date.now()}`
    } else if (dlSource) {
      buffer = await dlSource.download()
      mimetype = dlSource.mimetype || ""
      filename = dlSource.fileName || `file_${Date.now()}`
    }

    if (!buffer || !Buffer.isBuffer(buffer) || buffer.length === 0) {
      throw new Error("No se pudo descargar el archivo")
    }

    // Asegura extensión
    if (!filename.includes(".")) {
      const ext = mimetype.split("/")[1]?.split(";")[0] || "bin"
      const map = { jpeg: "jpg", png: "png", webp: "webp", mp4: "mp4", mpeg: "mp3", "octet-stream": "bin" }
      filename += `.${map[ext] || ext}`
    }

    if (buffer.length > 200 * 1024 * 1024) {
      throw new Error("Archivo muy grande (>200MB) — Catbox no lo permite")
    }

    const url = await uploadWithFallback(buffer, filename)

    const txt =
      `ꕥ 𝖢𝖠𝖳𝖡𝖮𝖷 • 𝑊⍺ց𝗎ɾı 🌸 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
      `      𓈒 ◌ㅤ──    *𝖠𝖱𝖢𝖧𝖨𝖵𝖮*\n` +
      `      • Nombre :: *${filename}*\n` +
      `      • Tamaño :: *${(buffer.length/1024).toFixed(1)} KB*\n` +
      `      • Tipo :: *${mimetype || "desconocido"}*\n\n` +
      `      𓈒 ◌ㅤ──    *𝖫𝖨𝖭𝖪*\n` +
      `      • ${url}\n\n` +
      `> 𝗐⍺𝗀𝗎ɾı ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ( ᴗ͈ˬᴗ͈ )`

    try {
      const msg = generateWAMessageFromContent(m.chat, {
        viewOnceMessage: {
          message: {
            messageContextInfo: {},
            interactiveMessage: {
              body: { text: txt },
              footer: { text: "Toca para copiar el link 🌸" },
              nativeFlowMessage: {
                buttons: [
                  {
                    name: "cta_copy",
                    buttonParamsJson: JSON.stringify({
                      display_text: "📋 Copiar Link",
                      copy_code: url
                    })
                  },
                  {
                    name: "cta_url",
                    buttonParamsJson: JSON.stringify({
                      display_text: "🔗 Abrir en Catbox",
                      url: url,
                      merchant_url: url
                    })
                  }
                ]
              }
            }
          }
        }
      }, { quoted: m })
      await sock.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
    } catch {
      await m.reply(`${txt}\n\n> 📋 Copiar: ${url}`)
    }

    await m.react("✅")
  } catch (e) {
    console.error("[TOURL ERROR]", e)
    await m.react("✕")
    return m.reply(`*Error Tourl*:\n\n${e?.message || "No se pudo subir el archivo."}`)
  }
}

export { pluginConfig as config, handler }
