import { generateWAMessageFromContent } from "ourin"

const pluginConfig = {
  name: "tictactoe",
  alias: ["ttt", "tateti", "gato", "3enraya"],
  category: "games",
  description: "TicTacToe 3 en raya con botones 🌸",
  usage: ".ttt @user | .ttt 1-9",
  example: ".ttt @amigo",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
}

const games = new Map() // chat -> { board: Array(9), players: [jid1, jid2], turn: 0, over: false }

function renderBoard(board) {
  const e = ["1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣","9️⃣"]
  return board.map((v,i) => v ? (v==="X"?"❌":"⭕") : e[i]).reduce((a,c,i)=>{
    a += c + ((i+1)%3===0 ? (i===8?"":"\n") : " ")
    return a
  },"")
}
function checkWin(b) {
  const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]
  for (const [a,b1,c] of wins) if (b[a] && b[a]===b[b1] && b[a]===b[c]) return b[a]
  if (b.every(v=>v)) return "draw"
  return null
}

async function sendBoard(m, sock, g) {
  const turnJid = g.players[g.turn]
  const turnMark = g.turn===0?"❌":"⭕"
  const boardTxt = renderBoard(g.board)
  const txt =
    `ꕥ 𝖳𝖨𝖢𝖳𝖠𝖢𝖳𝖮𝖤 🌸 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
    `${boardTxt}\n\n` +
    `      𓈒 ◌ㅤ──    *𝖳𝖴𝖱𝖭𝖮*\n` +
    `      • ${turnMark} @${turnJid.split("@")[0]}\n\n` +
    `> Toca un botón o usa \`${m.prefix}ttt 5\`\n\n` +
    `> 𝗐⍺𝗀𝗎ɾı ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ`

  const buttons = []
  for (let i=0;i<9;i++) {
    if (!g.board[i]) {
      buttons.push({
        name: "quick_reply",
        buttonParamsJson: JSON.stringify({ display_text: `${i+1}️⃣`, id: `${m.prefix}ttt ${i+1}` })
      })
    }
  }
  // WhatsApp max 6 quick_reply visibles, cortamos a 6 y el resto por texto
  const visible = buttons.slice(0,6)
  if (buttons.length>6) visible.push({ name:"quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🎮 Ver tablero", id: `${m.prefix}ttt` }) })

  try {
    const msg = generateWAMessageFromContent(m.chat, {
      viewOnceMessage: {
        message: {
          messageContextInfo: {},
          interactiveMessage: {
            body: { text: txt },
            footer: { text: `${g.players[0].split("@")[0]} ❌ vs ⭕ ${g.players[1].split("@")[0]}` },
            contextInfo: { mentionedJid: g.players },
            nativeFlowMessage: { buttons: visible }
          }
        }
      }
    }, { quoted: m })
    await sock.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
  } catch {
    await m.reply(txt, { mentions: g.players })
  }
}

async function handler(m, { sock, command }) {
  const chat = m.chat
  const args = m.args || []
  const textPos = args[0]

  // Si hay partida activa y el mensaje es un número 1-9
  let g = games.get(chat)
  if (g && !g.over && textPos && /^[1-9]$/.test(textPos)) {
    if (!g.players.includes(m.sender)) return m.reply(`ꕥ No eres jugador de esta partida 🌸`)
    if (g.players[g.turn] !== m.sender) return m.reply(`ꕥ No es tu turno 🌸 Espera a @${g.players[g.turn].split("@")[0]}`, { mentions: [g.players[g.turn]] })
    const idx = parseInt(textPos)-1
    if (g.board[idx]) return m.reply(`ꕥ Casilla ${textPos} ocupada`)
    g.board[idx] = g.turn===0 ? "X" : "O"
    const win = checkWin(g.board)
    if (win) {
      g.over = true
      if (win==="draw") {
        await m.reply(`ꕥ 𝖤𝖬𝖯𝖠𝖳𝖤 🤝\n\n${renderBoard(g.board)}\n\n> Nadie gana ( ᴗ͈ˬᴗ͈ )`, { mentions: g.players })
      } else {
        const winner = g.players[g.turn]
        await m.reply(`ꕥ 𝖦𝖠𝖭𝖠𝖣𝖮𝖱 🎉\n\n${renderBoard(g.board)}\n\n> Ganó @${winner.split("@")[0]} con ${win==="X"?"❌":"⭕"} 🌸`, { mentions: g.players })
      }
      setTimeout(()=> games.delete(chat), 30000)
      return
    }
    g.turn = g.turn===0?1:0
    return sendBoard(m, sock, g)
  }

  // Comando base sin args -> mostrar tablero si hay juego, si no pedir oponente
  if (!textPos || !/^[1-9]$/.test(textPos)) {
    if (g && !g.over) return sendBoard(m, sock, g)
    // Iniciar nueva partida
    let opponent = null
    if (m.mentionedJid && m.mentionedJid[0]) opponent = m.mentionedJid[0]
    else if (args[0] && args[0].includes("@")) opponent = args[0].replace(/[^0-9]/g,"") + "@s.whatsapp.net"

    if (!opponent) {
      return m.reply(
        `ꕥ 𝖳𝖨𝖢𝖳𝖠𝖢𝖳𝖮𝖤 🌸 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `      𓈒 ◌ㅤ──    *𝖢𝖮𝖬𝖮 𝖩𝖴𝖦𝖠𝖱*\n` +
        `      • \`${m.prefix}ttt @usuario\` — Desafiar\n` +
        `      • \`${m.prefix}ttt 5\` — Marcar casilla 5\n\n` +
        `> 𝗐⍺𝗀𝗎ɾı ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ`
      )
    }
    if (opponent === m.sender) return m.reply(`ꕥ No puedes jugar contra ti mismo`)
    const newGame = { board: Array(9).fill(null), players: [m.sender, opponent], turn: 0, over: false }
    games.set(chat, newGame)
    await m.reply(`ꕥ Desafío enviado a @${opponent.split("@")[0]} 🌸\n> Empieza ❌ (@${m.sender.split("@")[0]})`, { mentions: [m.sender, opponent] })
    return sendBoard(m, sock, newGame)
  }
}

export { pluginConfig as config, handler }
