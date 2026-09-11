let handler = async (m, { conn, command, usedPrefix }) => {
  let currentSelf = global.opts["self"]

  // Cambio directo mediante los comandos .self o .public
  if (/^(self|public)$/i.test(command)) {
    let wantSelf = command.toLowerCase() === 'self'

    if (currentSelf === wantSelf) {
      return m.reply(`✐ El bot ya se encuentra en modo *${wantSelf ? "Privado (Self)" : "Público"}* ! ୧ ֹ ִ`)
    }

    global.opts["self"] = wantSelf

    const caption = 
      `ꕥ 𝖬𝖮𝖣𝖮 𝖣𝖤𝖫 𝖡𝖮𝖳 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
      `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « ⍺𝖼ƚ𝗎⍺𝗅ɩ𝗭⍺𝖼ɩó𝗇 »\n\n` +
      `      𓈒 ◌ㅤ──    ᧉ𝗌ƚ⍺ᑯ𝗈 :: *Modo ${wantSelf ? "Privado (Self)" : "Público"} activado*\n\n` +
      `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`

    return m.reply(caption)
  }

  // Menú de lista interactiva mediante .botmode o .modo
  const botName = global.config?.bot?.name || "Waguri Assistant"

  const options = [
    {
      key: 'public',
      name: 'MODO PUBLICO',
      state: !currentSelf,
      desc: 'Todos los usuarios pueden usar el bot'
    },
    {
      key: 'self',
      name: 'MODO PRIVADO (SELF)',
      state: currentSelf,
      desc: 'Solo los owners pueden usar el bot'
    }
  ]

  const rows = options.map(opt => ({
    title: `${opt.state ? '[ACTIVO]' : '[INACTIVO]'} ${opt.name}`,
    description: `${opt.desc} • Clic para cambiar`,
    id: `${usedPrefix}${opt.key}`
  }))

  const selectButton = {
    name: "single_select",
    buttonParamsJson: JSON.stringify({
      title: "𝖬𝗈ᑯ𝗈 ᑯᧉ𝗅 𝖡𝗈ƚ",
      sections: [
        {
          title: "𝖮𝖯𝖢𝖨𝖮𝖭𝖤𝖲 𝖣𝖤 𝖠𝖢𝖢𝖤𝖲𝖮",
          rows
        }
      ]
    })
  }

  const body = 
    `ꕥ 𝖬𝖮𝖣𝖮 𝖣𝖤𝖫 𝖡𝖮𝖳 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
    `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « ᧉ𝗌ƚ⍺ᑯ𝗈 ⍺𝖼ƚ𝗎⍺𝗅 »\n\n` +
    `      𓈒 ◌ㅤ──    𝗆𝗈ᑯ𝗈 ⍺𝖼ƚɩ᥎𝗈 :: *${currentSelf ? "Privado (Self)" : "Público"}*\n\n` +
    `· ⛁ :: *Selecciona una opción de la lista para cambiar la visibilidad del bot.*\n\n` +
    `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ`

  await conn.sendMessage(
    m.chat,
    {
      text: body,
      footer: `${botName}`,
      interactiveButtons: [selectButton]
    },
    { quoted: m }
  )
}

handler.help = ["self", "public", "botmode", "modo"]
handler.tags = ["owner"]
handler.rowner = true
handler.command = /^(self|public|botmode|modo)$/i

export default handler
