const pluginConfig = {
  name: "hit",
  alias: ["pedir"],
  category: "games",
  description: "Pedir carta en blackjack 🌸",
  usage: ".hit",
  example: ".hit",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 2,
  energi: 0,
  isEnabled: true,
}
async function handler(m, { sock }) {
  const sessions = global.blackjackSessions
  if (!sessions || !sessions.has(m.chat)) return m.reply(`ꕥ No tienes partida. Usa \`${m.prefix}blackjack\` para empezar 🌸`)
  // delega al handler principal para no duplicar lógica
  const bj = await import("./blackjack.js")
  // reutiliza funciones internas vía handler con sub
  const fake = { ...m, args: ["hit"], command: "blackjack" }
  return bj.handler(fake, { sock, command: "blackjack" })
}
export { pluginConfig as config, handler }
