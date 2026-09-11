import fs from "fs"
import path from "path"
import { generateWAMessageFromContent, prepareWAMessageMedia } from "ourin"
import config from "../../config.js"

const pluginConfig = {
  name: "rpg",
  alias: ["rpgmenu", "aventura", "rol"],
  category: "games",
  description: "Hub RPG dinámico con botones Waguri 🌸",
  usage: ".rpg | .rpg <perfil|mision|curar|batalla|diario|tienda>",
  example: ".rpg\n.rpg mision",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
}

function loadRpgCommands() {
  try {
    const p = path.join(process.cwd(), "src/data/rpg_commands.json")
    return JSON.parse(fs.readFileSync(p, "utf-8"))
  } catch {
    return []
  }
}

function ensureRpgUsuario(userId) {
  if (!global.db) global.db = {}
  if (!global.db.data) global.db.data = {}
  if (!global.db.data.users) global.db.data.users = {}
  if (!global.db.data.users[userId]) global.db.data.users[userId] = {}
  const u = global.db.data.users[userId]
  if (typeof u.tickets !== "number") u.tickets = 0
  if (typeof u.gold !== "number") u.gold = 0
  if (typeof u.level !== "number") u.level = 1
  if (typeof u.exp !== "number") u.exp = 0
  if (typeof u.maxHp !== "number") u.maxHp = 100
  if (typeof u.hp !== "number") u.hp = 100
  if (typeof u.attack !== "number") u.attack = 10
  if (typeof u.defense !== "number") u.defense = 10
  if (!u.harem) u.harem = []
  if (!u.cooldowns) u.cooldowns = {}
  return u
}

function canUse(user, cmd) {
  if (user.level < (cmd.level || 1)) return `🔒 Requiere nivel ${cmd.level}`
  if (cmd.goldCost && user.gold < cmd.goldCost) return `🪙 Necesitas ${cmd.goldCost} monedas`
  if (cmd.hpMin && user.hp <= cmd.hpMin) return `❤️ HP muy bajo (${user.hp}/${user.maxHp})`
  if (cmd.cooldown) {
    const last = user.cooldowns[cmd.id] || 0
    const left = cmd.cooldown * 1000 - (Date.now() - last)
    if (left > 0) {
      const m = Math.ceil(left / 60000)
      return `⏳ Espera ${m}m`
    }
  }
  return null
}

async function sendRpgHub(m, sock, user) {
  const cmds = loadRpgCommands()
  const xpNeeded = user.level * 100
  let rank = "Novato"
  if (user.level >= 5) rank = "Aventurero"
  if (user.level >= 15) rank = "Guerrero Élite"
  if (user.level >= 30) rank = "Maestro Gacha"
  if (user.level >= 50) rank = "Dios del Gacha"

  const headerTxt = 
    `ꕥ 𝖧𝖴𝖡 𝖱𝖯𝖦 • 𝑊⍺ց𝗎𝗋ı ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
    `      𓈒 ◌ㅤ──    *𝖤𝖲𝖳𝖠𝖣Í𝖲𝖳𝖨𝖢𝖠𝖲*\n` +
    `      • Nivel :: *${user.level}* (${rank})\n` +
    `      • XP :: *${user.exp}/${xpNeeded}*\n` +
    `      • HP :: *${user.hp}/${user.maxHp}* ❤️\n` +
    `      • ATK *${user.attack}* ⚔️ | DEF *${user.defense}* 🛡️\n` +
    `      • Oro :: *${user.gold}* 🪙 | Tickets :: *${user.tickets}* 🎟️\n` +
    `      • Harem :: *${user.harem.length}* 💖\n`

  let bodyTxt = headerTxt + `\n      𓈒 ◌ㅤ──    *𝖢𝖮𝖬𝖠𝖭𝖣𝖮𝖲 𝖣𝖨𝖭Á𝖬𝖨𝖢𝖮𝖲*\n`
  cmds.forEach(c => {
    const block = canUse(user, c)
    const status = block ? `❌ ${block}` : `✅`
    bodyTxt += `      ${c.icon} *${c.name}* — ${c.desc} ${status}\n`
  })
  bodyTxt += `\nଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Toca un botón o escribe \`${m.prefix}rpg <comando>\` »\n\n> 𝗐⍺𝗀𝗎ɾı ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ 🌸`

  // Construir botones dinámicos (solo los disponibles primero)
  const buttons = []
  for (const c of cmds) {
    const blocked = canUse(user, c)
    const label = blocked ? `${c.icon} ${c.name} 🔒` : `${c.icon} ${c.name}`
    // quick_reply no soporta disabled, pero igual lo mostramos
    buttons.push({
      name: "quick_reply",
      buttonParamsJson: JSON.stringify({
        display_text: label,
        id: `${m.prefix}${c.command}`
      })
    })
    if (buttons.length >= 6) break // límite WhatsApp
  }
  // Botón extra para tienda si sobra espacio
  if (buttons.length < 6) {
    buttons.push({
      name: "quick_reply",
      buttonParamsJson: JSON.stringify({
        display_text: "🎒 Inventario",
        id: `${m.prefix}perfilgacha`
      })
    })
  }

  try {
    const media = await prepareWAMessageMedia({ image: fs.readFileSync(config.assets["rimuru-rpg"]) }, { upload: sock.waUploadToServer })
    const msg = generateWAMessageFromContent(m.chat, {
      viewOnceMessage: {
        message: {
          messageContextInfo: {},
          interactiveMessage: {
            header: { title: "𝑊⍺ց𝗎𝗋ı RPG 🌸", subtitle: `Nivel ${user.level} • ${rank}`, hasMediaAttachment: true, imageMessage: media.imageMessage },
            body: { text: bodyTxt },
            footer: { text: "Elige tu destino, aventurero ( ᴗ͈ˬᴗ͈ )" },
            contextInfo: { mentionedJid: [m.sender], isForwarded: true, forwardingScore: 999 },
            nativeFlowMessage: {
              messageParamsJson: JSON.stringify({
                limited_time_offer: { text: `HP ${user.hp}/${user.maxHp} • ${user.gold} 🪙`, url: "https://waguri", expiration_time: Date.now() + 1000000 },
                bottom_sheet: { in_thread_buttons_limit: 2, divider_indices: [1,2], list_title: "Acciones RPG", button_title: "🌸 Ver Acciones" }
              }),
              buttons
            }
          }
        }
      }
    }, { quoted: m })
    await sock.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
  } catch (e) {
    // Fallback simple si falla interactive
    let txt = bodyTxt + "\n\n"
    cmds.forEach(c => txt += `• ${m.prefix}${c.command} — ${c.name}\n`)
    await m.reply(txt)
  }
}

async function handler(m, { sock }) {
  const args = (m.args || [])[0]?.toLowerCase()
  const user = ensureRpgUsuario(m.sender)

  // Sub-comando directo: delega al rpg_system existente
  if (args) {
    const cmds = loadRpgCommands()
    const found = cmds.find(c => c.command === args || c.id === args || c.name.toLowerCase() === args)
    if (found) {
      // Reenvía como si el usuario hubiera escrito el comando real
      const fakeBody = `${m.prefix}${found.command}`
      const { parseCommand } = await import("../../src/lib/rimuru-serialize.js")
      const parsed = parseCommand(fakeBody, m.prefix)
      // parchea m para el handler destino
      const orig = { body: m.body, command: m.command, args: m.args, text: m.text }
      m.body = fakeBody
      m.command = parsed.command
      m.args = parsed.args
      m.text = parsed.text
      try {
        const mod = await import("../gacha/rpg_system.js")
        const h = mod.default?.handler || mod.handler || mod.default
        if (h) await h(m, { conn: sock, command: parsed.command, args: parsed.args })
        else await m.reply(`⚠️ No se pudo ejecutar *${found.name}*`)
      } finally {
        Object.assign(m, orig)
      }
      return
    }
    // si no es comando dinámico, muestra hub igual
  }

  await sendRpgHub(m, sock, user)
}

export { pluginConfig as config, handler }
