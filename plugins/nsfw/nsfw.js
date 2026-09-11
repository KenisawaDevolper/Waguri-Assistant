import fs from "fs"
import path from "path"
import axios from "axios"
import { getDatabase } from "../../src/lib/rimuru-database.js"
import te from "../../src/lib/rimuru-error.js"
import { prepareWAMessageMedia, generateWAMessageFromContent } from "ourin"

const NSFW_DATA_DIR = path.join(process.cwd(), "src", "data", "nsfw")

const jsonCache = new Map()

function loadJsonUrls(filename) {
  if (jsonCache.has(filename)) return jsonCache.get(filename)
  try {
    const filePath = path.join(NSFW_DATA_DIR, filename)
    if (!fs.existsSync(filePath)) return []
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"))
    if (Array.isArray(data) && data.length > 0) {
      jsonCache.set(filename, data)
      return data
    }
    return []
  } catch {
    return []
  }
}

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

const JSON_CATEGORIES = {
  ass: { file: "ass.json", emoji: "🍑", label: "Trasero Anime" },
  bdsm: { file: "bdsm.json", emoji: "⛓️", label: "BDSM Anime" },
  cum: { file: "cum.json", emoji: "💦", label: "Cum Anime" },
  gangbang: { file: "gangbang.json", emoji: "👥", label: "Gangbang Anime" },
  hentai: { file: "hentai.json", emoji: "🔞", label: "Hentai" },
  kasedaiki: { file: "kasedaiki.json", emoji: "🎎", label: "Kasedaiki" },
  manstrubation: { file: "manstrubation.json", emoji: "✋", label: "Masturbación Anime" },
  opaianime: { file: "opaianime.json", emoji: "🍈", label: "Oppai Anime" },
}

const API_CATEGORIES = {
  blowjob: { endpoint: "blowjob", emoji: "👄", label: "Blowjob Anime" },
  neko: { endpoint: "neko", emoji: "🐱", label: "Neko NSFW" },
  trap: { endpoint: "trap", emoji: "🎭", label: "Trap Anime" },
  waifunsfw: { endpoint: "waifu", emoji: "💕", label: "Waifu NSFW" },
}

const ALL_COMMANDS = [
  ...Object.keys(JSON_CATEGORIES),
  ...Object.keys(API_CATEGORIES),
  "nsfw",
  "nsfwon",
  "nsfwoff",
  "nsfwmenu",
]

const pluginConfig = {
  name: ALL_COMMANDS,
  alias: ["oppai", "oppaianimee"],
  category: "adulto",
  description: "Colección de imágenes NSFW de anime de varias categorías (Solo para mayores de 18 años)",
  usage: ".nsfw o .<categoría>",
  example: ".nsfw hentai",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 8,
  energi: 2,
  isEnabled: true,
}

async function fetchFromApi(endpoint) {
  const res = await axios.get(`https://api.waifu.pics/nsfw/${endpoint}`, { timeout: 15000 })
  if (!res.data?.url) throw new Error("Error al obtener la imagen de la API")
  const imgRes = await axios.get(res.data.url, { responseType: "arraybuffer", timeout: 30000 })
  return Buffer.from(imgRes.data)
}

async function fetchFromJson(filename) {
  const urls = loadJsonUrls(filename)
  if (urls.length === 0) throw new Error("Los datos de la imagen están vacíos o no se encontró el archivo")
  const url = getRandomItem(urls)
  const res = await axios.get(url, { responseType: "arraybuffer", timeout: 30000 })
  return Buffer.from(res.data)
}

function buildCategoryList(prefix) {
  let text = `*¡Hola, buenas tardes!* ฅ^·ﻌ·^ฅ\n` +
    `> _Menú NSFW ≽^• ˕ • ྀི≼_\n\n` +
    `## ꕥ *W⍺gurı 𝖠ssı𝗌ƚ⍺nƚ* (*ᴗ͈ˬᴗ͈)ꕤ\n` +
    `> 𝖬𝖤𝖭Ú 𝖭𝖲𝖥𝖂\n\n` +
    `> Colección de imágenes de anime NSFW de varias categorías.\n` +
    `> Esta función es exclusiva para usuarios de *18 años en adelante*.\n\n` +
    `*📂 CATEGORÍAS DISPONIBLES:*\n\n` +
    `*— Desde la Base de Datos Local —*\n`

  for (const [cmd, info] of Object.entries(JSON_CATEGORIES)) {
    const count = loadJsonUrls(info.file).length
    text += `- ${info.emoji} *${prefix}${cmd}* — ${info.label} (${count} imágenes)\n`
  }

  text += `\n*— Desde la API Online —*\n`
  for (const [cmd, info] of Object.entries(API_CATEGORIES)) {
    text += `- ${info.emoji} *${prefix}${cmd}* — ${info.label}\n`
  }

  text += `\n*⚙️ CONFIGURACIÓN DE GRUPO:*\n` +
    `- *${prefix}nsfwon* — Activa la función NSFW en este grupo\n` +
    `- *${prefix}nsfwoff* — Desactiva la función NSFW en este grupo\n\n` +
    `*📌 NOTAS IMPORTANTES:*\n` +
    `- Puedes usar esta función directamente en el *chat privado* del bot\n` +
    `- En grupos, un administrador debe activarla primero con *${prefix}nsfwon*\n` +
    `- Úsalo con sabiduría y responsabilidad\n` +
    `- Contenido exclusivo para mayores de *18 años*\n\n` +
    `> sɪᴍᴘʟᴇ ᴡʜᴀᴛsᴀᴘᴘ ʙᴏᴛ ツ`

  return text
}

function isNsfwAllowed(m, db) {
  if (!m.isGroup) return true
  const groupData = db.getGroup(m.chat) || {}
  return groupData.nsfw === true
}

async function handler(m, { sock }) {
  const db = getDatabase()
  const cmd = m.command.toLowerCase()

  if (cmd === "nsfwon") {
    if (!m.isGroup) {
      return m.reply(
        `*¡Hola, buenas tardes!* ฅ^·ﻌ·^ฅ\n` +
        `> _Configuración de grupo ≽^• ˕ • ྀི≼_\n\n` +
        `## ꕥ *W⍺gurı 𝖠ssı𝗌ƚ⍺nƚ* (*ᴗ͈ˬᴗ͈)ꕤ\n` +
        `> 𝖢𝖮𝖭𝖥𝖨𝖦𝖴𝖱𝖠𝖢𝖨Ó𝖭 𝖨𝖭𝖵Á𝖫𝖨𝖣𝖠\n\n` +
        `> Error: ¡Este comando es solo para grupos!\n` +
        `> La función NSFW se puede usar directamente en chats privados sin necesidad de activarla.\n\n` +
        `> sɪᴍᴘʟᴇ ᴡʜᴀᴛsᴀᴘᴘ ʙᴏᴛ ツ`
      )
    }
    if (!m.isAdmin && !m.isOwner) {
      return m.reply(
        `*¡Hola, buenas tardes!* ฅ^·ﻌ·^ฅ\n` +
        `> _Acceso denegado ≽^• ˕ • ྀི≼_\n\n` +
        `## ꕥ *W⍺gurı 𝖠ssı𝗌ƚ⍺nƚ* (*ᴗ͈ˬᴗ͈)ꕤ\n` +
        `> 𝖠𝖢𝖢𝖤𝖲𝖮 𝖣𝖤𝖭𝖤𝖦𝖠𝖣𝖮\n\n` +
        `> Error: Solo los administradores del grupo pueden activar o desactivar la función NSFW aquí.\n\n` +
        `> sɪᴍᴘʟᴇ ᴡʜᴀᴛsᴀᴘᴘ ʙᴏᴛ ツ`
      )
    }

    const groupData = db.getGroup(m.chat) || {}
    groupData.nsfw = true
    db.setGroup(m.chat, groupData)
    return m.reply(
      `*¡Hola, buenas tardes!* ฅ^·ﻌ·^ฅ\n` +
      `> _Configuración de grupo ≽^• ˕ • ྀི≼_\n\n` +
      `## ꕥ *W⍺gurı 𝖠ssı𝗌ƚ⍺nƚ* (*ᴗ͈ˬᴗ͈)ꕤ\n` +
      `> 𝖭𝖲𝖥𝖂 𝖠𝖢𝖳𝖨𝖵𝖠𝖣𝖮\n\n` +
      `> La función NSFW se ha activado exitosamente para este grupo.\n\n` +
      `> *Atención:*\n` +
      `> - Asegúrate de que todos los miembros tengan más de *18 años*\n` +
      `> - Los administradores son responsables del contenido mostrado\n` +
      `> - Usa *${m.prefix}nsfwoff* para desactivarlo de nuevo\n\n` +
      `> Escribe *${m.prefix}nsfw* para ver las categorías disponibles.\n\n` +
      `> sɪᴍᴘʟᴇ ᴡʜᴀᴛsᴀᴘᴘ ʙᴏᴛ ツ`
    )
  }

  if (cmd === "nsfwoff") {
    if (!m.isGroup) {
      return m.reply(
        `*¡Hola, buenas tardes!* ฅ^·ﻌ·^ฅ\n` +
        `> _Configuración de grupo ≽^• ˕ • ྀི≼_\n\n` +
        `## ꕥ *W⍺gurı 𝖠ssı𝗌ƚ⍺nƚ* (*ᴗ͈ˬᴗ͈)ꕤ\n` +
        `> 𝖢𝖮𝖭𝖥𝖨𝖦𝖴𝖱𝖠𝖢𝖨Ó𝖭 𝖨𝖭𝖵Á𝖫𝖨𝖣𝖠\n\n` +
        `> Error: ¡Este comando es solo para grupos!\n` +
        `> En chats privados, la función NSFW siempre está disponible.\n\n` +
        `> sɪᴍᴘʟᴇ ᴡʜᴀᴛsᴀᴘᴘ ʙᴏᴛ ツ`
      )
    }
    if (!m.isAdmin && !m.isOwner) {
      return m.reply(
        `*¡Hola, buenas tardes!* ฅ^·ﻌ·^ฅ\n` +
        `> _Acceso denegado ≽^• ˕ • ྀི≼_\n\n` +
        `## ꕥ *W⍺gurı 𝖠ssı𝗌ƚ⍺nƚ* (*ᴗ͈ˬᴗ͈)ꕤ\n` +
        `> 𝖠𝖢𝖢𝖤𝖲𝖮 𝖣𝖤𝖭𝖤𝖦𝖠𝖣𝖮\n\n` +
        `> Error: Solo los administradores del grupo pueden activar o desactivar la función NSFW aquí.\n\n` +
        `> sɪᴍᴘʟᴇ ᴡʜᴀᴛsᴀᴘᴘ ʙᴏᴛ ツ`
      )
    }

    const groupData = db.getGroup(m.chat) || {}
    groupData.nsfw = false
    db.setGroup(m.chat, groupData)
    return m.reply(
      `*¡Hola, buenas tardes!* ฅ^·ﻌ·^ฅ\n` +
      `> _Configuración de grupo ≽^• ˕ • ྀི≼_\n\n` +
      `## ꕥ *W⍺gurı 𝖠ssı𝗌ƚ⍺nƚ* (*ᴗ͈ˬᴗ͈)ꕤ\n` +
      `> 𝖭𝖲𝖥𝖂 𝖣𝖤𝖲𝖠𝖢𝖳𝖨𝖵𝖠𝖣𝖮\n\n` +
      `> La función NSFW se ha desactivado exitosamente para este grupo.\n` +
      `> Ningún comando NSFW podrá usarse aquí hasta que se active nuevamente.\n\n` +
      `> sɪᴍᴘʟᴇ ᴡʜᴀᴛsᴀᴘᴘ ʙᴏᴛ ツ`
    )
  }

  if (!isNsfwAllowed(m, db)) {
    return m.reply(
      `*¡Hola, buenas tardes!* ฅ^·ﻌ·^ฅ\n` +
      `> _Restricción de contenido ≽^• ˕ • ྀི≼_\n\n` +
      `## ꕥ *W⍺gurı 𝖠ssı𝗌ƚ⍺nƚ* (*ᴗ͈ˬᴗ͈)ꕤ\n` +
      `> 𝖭𝖲𝖥𝖂 𝖡𝖮𝖫𝖮𝖰𝖴𝖤𝖠𝖣𝖮 ⚡\n\n` +
      `> La función NSFW aún no está activa en este grupo.\n` +
      `> Pídele a un administrador del grupo que la active con el comando *${m.prefix}nsfwon*\n\n` +
      `> O también puedes usar esta función directamente en el *chat privado* del bot.\n\n` +
      `> sɪᴍᴘʟᴇ ᴡʜᴀᴛsᴀᴘᴘ ʙᴏᴛ ツ`
    )
  }

  if (cmd === "nsfw" || cmd === "nsfwmenu") {
    const args = m.args
    if (args[0]) {
      const sub = args[0].toLowerCase()
      if (JSON_CATEGORIES[sub] || API_CATEGORIES[sub]) {
        return await sendNsfwImage(m, sock, sub)
      }
    }
    return m.reply(buildCategoryList(m.prefix))
  }

  if (JSON_CATEGORIES[cmd] || API_CATEGORIES[cmd]) {
    return await sendNsfwImage(m, sock, cmd)
  }

  return m.reply(buildCategoryList(m.prefix))
}

async function sendNsfwImage(m, sock, category) {
  await m.react("🕕")

  try {
    let buffer
    let info

    if (JSON_CATEGORIES[category]) {
      info = JSON_CATEGORIES[category]
      buffer = await fetchFromJson(info.file)
    } else if (API_CATEGORIES[category]) {
      info = API_CATEGORIES[category]
      buffer = await fetchFromApi(info.endpoint)
    } else {
      return m.reply(
        `*¡Hola, buenas tardes!* ฅ^·ﻌ·^ฅ\n` +
        `> _Error de búsqueda ≽^• ˕ • ྀི≼_\n\n` +
        `## ꕥ *W⍺gurı 𝖠ssı𝗌ƚ⍺nƚ* (*ᴗ͈ˬᴗ͈)ꕤ\n` +
        `> 𝖢𝖠𝖳𝖤𝖦𝖮𝖱Í𝖠 𝖭𝖮 𝖤𝖭𝖢𝖮𝖭𝖳𝖱𝖠𝖣𝖠\n\n` +
        `> Error: La categoría *${category}* no fue encontrada.\n\n` +
        `> sɪᴍᴘʟᴇ ᴡʜᴀᴛsᴀᴘᴘ ʙᴏᴛ ツ`
      )
    }

    const media = await prepareWAMessageMedia(
      { image: buffer },
      { upload: sock.waUploadToServer }
    )

    const msg = generateWAMessageFromContent(m.chat, {
      viewOnceMessage: {
        message: {
          messageContextInfo: {
            deviceListMetadata: {},
            deviceListMetadataVersion: 2,
          },
          interactiveMessage: {
            body: { text: `${info.emoji} *${info.label.toUpperCase()}*` },
            footer: { text: "🔞 Este contenido es solo para mayores de 18 — Úsalo con sabiduría" },
            header: {
              hasMediaAttachment: true,
              imageMessage: media.imageMessage,
            },
            nativeFlowMessage: {
              buttons: [
                {
                  name: "quick_reply",
                  buttonParamsJson: JSON.stringify({
                    display_text: `${info.emoji} ¿Continuar?`,
                    id: `${m.prefix}${category}`,
                  }),
                },
                {
                  name: "quick_reply",
                  buttonParamsJson: JSON.stringify({
                    display_text: "📂 Ver todas las categorías",
                    id: `${m.prefix}nsfw`,
                  }),
                },
              ],
            },
          },
        },
      },
    }, { quoted: m })

    await sock.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
    await m.react("✅")
  } catch (err) {
    await m.react("☢")
    m.reply(te(m.prefix, m.command, m.pushName))
  }
}

export { pluginConfig as config, handler }
