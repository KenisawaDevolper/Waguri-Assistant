import { generateWAMessageFromContent } from "ourin"

const pluginConfig = {
  name: "ahorcado",
  alias: ["hangman", "ahorcadito", "colgado"],
  category: "games",
  description: "Ahorcado clásico con botones 🌸",
  usage: ".ahorcado | .ahorcado <letra>",
  example: ".ahorcado a",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
}

const sessions = new Map()
const WORDS = ["WAGURI","ANIME","MANGA","SAKURA","NEKO","KAWAII","SENPAI","OTAKU","HANA","YUME","ARIGATO","KONNICHIWA","SAYONARA","TSUNDERE","KAWAII","BERRY","CHERRY","MELON","PEACH","HOSHINO","AI","RIMURU","MIKASA","NARUTO","GOKU","LUNA","ESTRELLA","CORAZON","AMISTAD","AVENTURA","MAGIA","DRAGON","ESPADA","CASTILLO","PRINCESA","GUERRERO"]
const MAX_TRIES = 6
const STAGES = [
  "```\n  +---+\n  |   |\n      |\n      |\n      |\n      |\n=========```",
  "```\n  +---+\n  |   |\n  O   |\n      |\n      |\n      |\n=========```",
  "```\n  +---+\n  |   |\n  O   |\n  |   |\n      |\n      |\n=========```",
  "```\n  +---+\n  |   |\n  O   |\n /|   |\n      |\n      |\n=========```",
  "```\n  +---+\n  |   |\n  O   |\n /|\\  |\n      |\n      |\n=========```",
  "```\n  +---+\n  |   |\n  O   |\n /|\\  |\n /    |\n      |\n=========```",
  "```\n  +---+\n  |   |\n  O   |\n /|\\  |\n / \\  |\n      |\n=========```",
]

function pickWord() { return WORDS[Math.floor(Math.random()*WORDS.length)] }
function displayWord(word, guessed) {
  return word.split("").map(c => guessed.includes(c) ? c : "＿").join(" ")
}
function isWin(word, guessed) { return word.split("").every(c=>guessed.includes(c)) }

async function sendHang(m, sock, s) {
  const wordDisp = displayWord(s.word, s.guessed)
  const wrong = s.guessed.filter(c=> !s.word.includes(c))
  const triesLeft = MAX_TRIES - s.wrong
  const stage = STAGES[s.wrong] || STAGES[0]
  const txt =
    `ꕥ 𝖠𝖧𝖮𝖱𝖢𝖠𝖣𝖮 🌸 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
    `${stage}\n\n` +
    `      𓈒 ◌ㅤ──    *𝖯𝖠𝖫𝖠𝖡𝖱𝖠*\n` +
    `      • ${wordDisp}\n` +
    `      • Letras: ${s.guessed.join(", ") || "-"}\n` +
    `      • Fallos: ${s.wrong}/${MAX_TRIES} (quedan ${triesLeft})\n` +
    `      • Erradas: ${wrong.join(", ") || "-"}\n\n` +
    `> Escribe \`${m.prefix}ahorcado <letra>\` o toca una letra\n\n` +
    `> 𝗐⍺𝗀𝗎ɾı ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ`

  // Botones con letras no usadas (máx 6 por mensaje)
  const alphabet = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split("")
  const available = alphabet.filter(c=> !s.guessed.includes(c)).slice(0,6)
  const buttons = available.map(l=> ({
    name: "quick_reply",
    buttonParamsJson: JSON.stringify({ display_text: l, id: `${m.prefix}ahorcado ${l.toLowerCase()}` })
  }))
  // Botón rendirse
  if (buttons.length < 6) buttons.push({ name:"quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🏳️ Rendirse", id: `${m.prefix}ahorcado rendirse` }) })

  try {
    const msg = generateWAMessageFromContent(m.chat, {
      viewOnceMessage: {
        message: {
          messageContextInfo: {},
          interactiveMessage: {
            body: { text: txt },
            footer: { text: `Categoría: Waguri • ${s.word.length} letras` },
            nativeFlowMessage: { buttons }
          }
        }
      }
    }, { quoted: m })
    await sock.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
  } catch {
    await m.reply(txt)
  }
}

async function handler(m, { sock, command }) {
  const chat = m.chat
  const args = (m.args||[]).join(" ").trim().toLowerCase()
  let s = sessions.get(chat)

  if (!s || s.over) {
    // iniciar nueva partida si no hay o si escribe sin letra
    if (!args || args === "iniciar" || args === "start") {
      const word = pickWord()
      s = { word, guessed: [], wrong: 0, over: false }
      sessions.set(chat, s)
      return sendHang(m, sock, s)
    }
    // si escribe letra sin sesión, inicia nueva y procesa esa letra
    if (args && /^[a-zñ]$/.test(args)) {
      const word = pickWord()
      s = { word, guessed: [], wrong: 0, over: false }
      sessions.set(chat, s)
      // cae al flujo de procesar letra abajo
    } else {
      // mensaje de bienvenida
      return m.reply(
        `ꕥ 𝖠𝖧𝖮𝖱𝖢𝖠𝖣𝖮 🌸 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `      𓈒 ◌ㅤ──    *𝖢𝖮𝖬𝖮 𝖩𝖴𝖦𝖠𝖱*\n` +
        `      • \`${m.prefix}ahorcado\` — Iniciar partida\n` +
        `      • \`${m.prefix}ahorcado a\` — Probar letra A\n` +
        `      • Toca los botones de letras 🌸\n\n` +
        `> 𝗐⍺𝗀𝗎ɾı ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ`
      )
    }
  }

  // procesar intento
  if (!s) return
  if (args === "rendirse" || args === "rendirse") {
    s.over = true
    const txt = `ꕥ Te rendiste 💔\n\n> La palabra era *${s.word}* ( ᴗ͈ˬᴗ͈ )\n\n> Usa \`${m.prefix}ahorcado\` para otra`
    sessions.delete(chat)
    return m.reply(txt)
  }
  const letter = args[0]?.toUpperCase()
  if (!letter || !/^[A-ZÑ]$/.test(letter)) {
    return sendHang(m, sock, s)
  }
  if (s.guessed.includes(letter)) {
    return m.reply(`ꕥ Ya probaste *${letter}* 🌸\n> Prueba otra`)
  }
  s.guessed.push(letter)
  if (!s.word.includes(letter)) s.wrong++

  if (isWin(s.word, s.guessed)) {
    s.over = true
    sessions.delete(chat)
    return m.reply(
      `ꕥ ¡GANASTE! 🎉🌸\n\n` +
      `      • Palabra :: *${s.word}*\n` +
      `      • Fallos :: *${s.wrong}/${MAX_TRIES}*\n\n` +
      `> Eres un genio ( ᴗ͈ˬᴗ͈ ) ✨\n\n> \`${m.prefix}ahorcado\` para otra`
    )
  }
  if (s.wrong >= MAX_TRIES) {
    s.over = true
    sessions.delete(chat)
    return m.reply(
      `${STAGES[MAX_TRIES]}\n\n` +
      `ꕥ ¡AHORCADO! 💀\n\n` +
      `      • Palabra :: *${s.word}*\n` +
      `      • Intentos :: *${s.wrong}/${MAX_TRIES}*\n\n` +
      `> Casi... ¡intenta de nuevo! 🌸\n\n> \`${m.prefix}ahorcado\` para otra`
    )
  }
  return sendHang(m, sock, s)
}

export { pluginConfig as config, handler }
