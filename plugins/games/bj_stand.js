const pluginConfig = {
  name: "stand",
  alias: ["plantarse"],
  category: "games",
  description: "Plantarse en blackjack 🌸",
  usage: ".stand",
  example: ".stand",
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
  const bj = await import("./blackjack.js")
  const fake = { ...m, args: ["stand"], command: "blackjack" }
  return bj.handler(fake, { sock, command: "blackjack" })
}
export { pluginConfig as config, handler }
