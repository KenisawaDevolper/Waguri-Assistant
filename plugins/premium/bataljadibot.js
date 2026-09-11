const cancelJadibot = new Set()

const pluginConfig = {
  name: "canceljadibot",
  alias: ["stopjadibotstart"],
  category: "premium",
  description: "Cancela el proceso de jadibot en curso",
  usage: ".bataljadibot",
  example: ".bataljadibot",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  cooldown: 5,
  isEnabled: true,
}

async function handler(m) {

  const userJid = m.sender

  cancelJadibot.add(userJid)

  await m.reply(
`ꕥ *𝖶⍺𝗀uɾı 𝖭oƚıɔᧉ* (*ᴗ͈ˬᴗ͈)ꕤ

𝖬uʏ bıᧉn, d⍺rlıng~

> 𝖤l proɔᧉso dᧉ *jadıboƚ* y⍺ 𝗁⍺ sıdo ɔ⍺nɔᧉl⍺do
> Sı dᧉsᧉ⍺s ıntᧉnƚ⍺rlo dᧉ nuᧉvo, ᧉsɔrıbᧉ \`.jadıboƚ\` (*ᴗ͈ˬᴗ͈)ꕤ`
  )

}

export { pluginConfig as config, handler, cancelJadibot };
