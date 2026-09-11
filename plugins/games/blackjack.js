import { generateWAMessageFromContent } from "ourin"

const pluginConfig = {
  name: "blackjack",
  alias: ["bj", "21"],
  category: "games",
  description: "Blackjack 21 contra la banca 🌸",
  usage: ".blackjack | .hit | .stand",
  example: ".blackjack",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
}

const sessions = global.blackjackSessions || (global.blackjackSessions = new Map())

function createDeck() {
  const suits = ["♠️","♥️","♦️","♣️"]
  const ranks = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"]
  const deck = []
  for (const s of suits) for (const r of ranks) deck.push({ rank: r, suit: s, text: `${r}${s}` })
  for (let i = deck.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [deck[i], deck[j]] = [deck[j], deck[i]] }
  return deck
}
function cardValue(c) {
  if (c.rank === "A") return 11
  if (["K","Q","J"].includes(c.rank)) return 10
  return parseInt(c.rank)
}
function handValue(hand) {
  let v = 0, aces = 0
  for (const c of hand) { v += cardValue(c); if (c.rank === "A") aces++ }
  while (v > 21 && aces > 0) { v -= 10; aces-- }
  return v
}
function handStr(hand) { return hand.map(c => c.text).join(" ") }

async function sendBJ(m, sock, s, extra="") {
  const pVal = handValue(s.player)
  const dVal = handValue(s.dealer)
  const dShow = s.stand ? handStr(s.dealer) + ` (${dVal})` : `${s.dealer[0].text} ?`
  const txt =
    `ꕥ 𝖡𝖫𝖠𝖢𝖪𝖩𝖠𝖢𝖪 𝟤𝟣 🌸 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
    `      𓈒 ◌ㅤ──    *𝖬𝖤𝖲𝖠*\n` +
    `      • Banca :: ${dShow}\n` +
    `      • Tú :: ${handStr(s.player)} (${pVal})\n` +
    (extra ? `\n${extra}\n` : ``) +
    `\n> 𝗐⍺𝗀𝗎ɾı ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ( ᴗ͈ˬᴗ͈ )`

  if (s.over) {
    return m.reply(txt)
  }
  try {
    const msg = generateWAMessageFromContent(m.chat, {
      viewOnceMessage: {
        message: {
          messageContextInfo: {},
          interactiveMessage: {
            body: { text: txt },
            footer: { text: "Elige tu jugada" },
            nativeFlowMessage: {
              buttons: [
                { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🃏 Pedir", id: `${m.prefix}blackjack hit` }) },
                { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "✋ Plantarse", id: `${m.prefix}blackjack stand` }) },
              ]
            }
          }
        }
      }
    }, { quoted: m })
    await sock.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
  } catch {
    await m.reply(txt + `\n\n> • ${m.prefix}blackjack hit — Pedir\n> • ${m.prefix}blackjack stand — Plantarse`)
  }
}

async function doHit(m, sock) {
  const chat = m.chat
  const s = sessions.get(chat)
  if (!s || s.over) return m.reply(`ꕥ No tienes partida. Usa \`${m.prefix}blackjack\` para empezar 🌸`)
  s.player.push(s.deck.pop())
  const v = handValue(s.player)
  if (v > 21) {
    s.over = true
    s.stand = true
    sessions.set(chat, s)
    setTimeout(()=> sessions.delete(chat), 30000)
    return sendBJ(m, sock, s, `💔 Te pasaste (${v}). ¡Perdiste!`)
  }
  if (v === 21) {
    return doStand(m, sock)
  }
  return sendBJ(m, sock, s)
}
async function doStand(m, sock) {
  const chat = m.chat
  const s = sessions.get(chat)
  if (!s || s.over) return m.reply(`ꕥ No tienes partida. Usa \`${m.prefix}blackjack\` 🌸`)
  s.stand = true
  let dVal = handValue(s.dealer)
  while (dVal < 17) {
    s.dealer.push(s.deck.pop())
    dVal = handValue(s.dealer)
  }
  const pVal = handValue(s.player)
  s.over = true
  let result = ""
  if (dVal > 21) result = `🎉 ¡La banca se pasó (${dVal})! ¡Ganaste! ✨`
  else if (dVal > pVal) result = `💔 La banca gana ${dVal} vs ${pVal}.`
  else if (pVal > dVal) result = `🎉 ¡Ganaste! ${pVal} vs ${dVal} 🌸`
  else result = `🤝 Empate ${pVal} - ${dVal}`
  sessions.set(chat, s)
  setTimeout(()=> sessions.delete(chat), 30000)
  return sendBJ(m, sock, s, result)
}

async function handler(m, { sock, command }) {
  const chat = m.chat
  const cmd = (command || m.command || "").toLowerCase()
  const sub = (m.args && m.args[0] ? m.args[0].toLowerCase() : "")

  if (cmd === "blackjack" || cmd === "bj" || cmd === "21") {
    if (sub === "hit" || sub === "pedir") {
      return doHit(m, sock)
    }
    if (sub === "stand" || sub === "plantarse") {
      return doStand(m, sock)
    }
    if (sessions.has(chat)) {
      const s = sessions.get(chat)
      if (!s.over) return sendBJ(m, sock, s, `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Ya tienes partida en curso. »`)
      sessions.delete(chat)
    }
    const deck = createDeck()
    const player = [deck.pop(), deck.pop()]
    const dealer = [deck.pop(), deck.pop()]
    const s = { deck, player, dealer, stand: false, over: false }
    const pVal = handValue(player)
    if (pVal === 21) {
      s.over = true
      s.stand = true
      sessions.set(chat, s)
      return sendBJ(m, sock, s, `✨ ¡Blackjack natural! Ganaste 🎉`)
    }
    sessions.set(chat, s)
    return sendBJ(m, sock, s)
  }

  if (cmd === "hit" || cmd === "pedir") return doHit(m, sock)
  if (cmd === "stand" || cmd === "plantarse") return doStand(m, sock)
}

export { pluginConfig as config, handler }
