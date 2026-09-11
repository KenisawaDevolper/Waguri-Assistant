let handler = async (m, { conn, usedPrefix, command, args, isOwner, isAdmin, isROwner }) => {
  let isEnable = /^(enable|on)$/i.test(command)

  global.db.data.chats = global.db.data.chats || {}

  let chat = global.db.data.chats[m.chat]
  if (!chat) chat = global.db.data.chats[m.chat] = {}

  // Inicialización de valores predeterminados
  if (!('welcome' in chat)) chat.welcome = true
  if (!('delete' in chat)) chat.delete = true
  if (!('antiDelete' in chat)) chat.antiDelete = false
  if (!('antiLink' in chat)) chat.antiLink = false
  if (!('antiMedia' in chat)) chat.antiMedia = false
  if (!('antiBadword' in chat)) chat.antiBadword = false
  if (!('autogpt' in chat)) chat.autogpt = false
  if (!('autosimi' in chat)) chat.autosimi = false
  if (!('autodl' in chat)) chat.autodl = false
  if (!('antiPromosi' in chat)) chat.antiPromosi = false
  if (!('detect' in chat)) chat.detect = true
  if (!('rpgs' in chat)) chat.rpgs = true
  if (!('autolevelup' in chat)) chat.autolevelup = false
  if (global.autocorrect === undefined) global.autocorrect = true

  let type = (args[0] || '').toLowerCase()
  let isAll = false

  // --- SI SE PASÓ UN PARÁMETRO, EJECUTA LA CONMUTACIÓN ---
  if (type) {
    switch (type) {
      case 'welcome':
        if (m.isGroup && !isAdmin) return global.dfail('admin', m, conn)
        chat.welcome = isEnable
        break

      case 'delete':
        if (m.isGroup && !(isAdmin || isOwner)) return global.dfail('admin', m, conn)
        chat.delete = isEnable
        break

      case 'antidelete':
        if (m.isGroup && !(isAdmin || isOwner)) return global.dfail('admin', m, conn)
        chat.antiDelete = isEnable
        break

      case 'antilink':
        if (m.isGroup && !(isAdmin || isOwner)) return global.dfail('admin', m, conn)
        chat.antiLink = isEnable
        break

      case 'antibadword':
        if (m.isGroup && !(isAdmin || isOwner)) return global.dfail('admin', m, conn)
        chat.antiBadword = isEnable
        break

      case 'antipromosi':
        if (m.isGroup && !(isAdmin || isOwner)) return global.dfail('admin', m, conn)
        chat.antiPromosi = isEnable
        break

      case 'antimedia':
        if (m.isGroup && !(isAdmin || isOwner)) return global.dfail('admin', m, conn)
        chat.antiMedia = isEnable
        break

      case 'autogpt':
        if (m.isGroup && !(isAdmin || isOwner)) return global.dfail('admin', m, conn)
        chat.autogpt = isEnable
        break

      case 'autosimi':
        if (m.isGroup && !(isAdmin || isOwner)) return global.dfail('admin', m, conn)
        chat.autosimi = isEnable
        break

      case 'autodl':
        if (m.isGroup && !(isAdmin || isOwner)) return global.dfail('admin', m, conn)
        chat.autodl = isEnable
        break

      case 'detect':
        if (m.isGroup && !(isAdmin || isOwner)) return global.dfail('admin', m, conn)
        chat.detect = isEnable
        break

      case 'rpg':
        if (m.isGroup && !(isAdmin || isOwner)) return global.dfail('admin', m, conn)
        chat.rpgs = isEnable
        break

      case 'autolevelup':
        isAll = true
        if (!isROwner) return global.dfail('rowner', m, conn)
        chat.autolevelup = isEnable
        break

      case 'autocorrect':
        isAll = true
        if (!isROwner) return global.dfail('rowner', m, conn)
        global.autocorrect = isEnable
        break

      case 'public':
        isAll = true
        if (!isROwner) return global.dfail('rowner', m, conn)
        global.opts.self = !isEnable
        break

      case 'autoread':
        isAll = true
        if (!isROwner) return global.dfail('rowner', m, conn)
        global.opts.autoread = isEnable
        break

      case 'pconly':
        isAll = true
        if (!isROwner) return global.dfail('rowner', m, conn)
        global.opts.pconly = isEnable
        break

      case 'gconly':
        isAll = true
        if (!isROwner) return global.dfail('rowner', m, conn)
        global.opts.gconly = isEnable
        break

      case 'self':
        isAll = true
        if (!isROwner) return global.dfail('rowner', m, conn)
        global.opts.self = isEnable
        break

      default:
        return m.reply(`❌ Opciones válidas: welcome, antilink, detect, etc.`)
    }

    let target = isAll ? 'para el bot' : m.isGroup ? 'para este grupo' : 'para este chat'
    await global.db.write?.().catch(() => null)
    return m.reply(`✅ Se ha *${isEnable ? 'activado' : 'desactivado'}* la función *${type}* ${target}.`)
  }

  // --- MENÚ DINÁMICO CON SINGLE_SELECT CUANDO NO HAY PARÁMETRO ---
  const botName = global.config?.bot?.name || "𝑊⍺ց𝗎ɾı 𝖠𝗌𝗌ı𝗌ƚ⍺𝗇ƚ"

  const groupFeatures = [
    { key: 'welcome', name: 'WELCOME', state: chat.welcome },
    { key: 'delete', name: 'DELETE', state: chat.delete },
    { key: 'antidelete', name: 'ANTI DELETE', state: chat.antiDelete },
    { key: 'antilink', name: 'ANTI LINK', state: chat.antiLink },
    { key: 'antibadword', name: 'ANTI BADWORD', state: chat.antiBadword },
    { key: 'antipromosi', name: 'ANTI PROMOSI', state: chat.antiPromosi },
    { key: 'antimedia', name: 'ANTI MEDIA', state: chat.antiMedia },
    { key: 'detect', name: 'DETECT', state: chat.detect },
    { key: 'autogpt', name: 'AUTO GPT', state: chat.autogpt },
    { key: 'autosimi', name: 'AUTO SIMI', state: chat.autosimi },
    { key: 'autodl', name: 'AUTO DL', state: chat.autodl },
    { key: 'rpg', name: 'RPG', state: chat.rpgs }
  ]

  const ownerFeatures = [
    { key: 'public', name: 'PUBLIC MODE', state: !global.opts.self },
    { key: 'self', name: 'SELF MODE', state: global.opts.self },
    { key: 'autoread', name: 'AUTO READ', state: global.opts.autoread },
    { key: 'pconly', name: 'PC ONLY', state: global.opts.pconly },
    { key: 'gconly', name: 'GC ONLY', state: global.opts.gconly },
    { key: 'autolevelup', name: 'AUTO LEVEL UP', state: chat.autolevelup },
    { key: 'autocorrect', name: 'AUTO CORRECT', state: global.autocorrect }
  ]

  // Contadores de funciones activas
  const totalGroupOn = groupFeatures.filter(f => f.state).length
  const totalOwnerOn = ownerFeatures.filter(f => f.state).length

  // Generar filas para el menú interactivo
  const groupRows = groupFeatures.map(f => ({
    title: `${f.state ? '✅' : '❌'} ${f.name}`,
    description: `Estado: ${f.state ? 'ACTIVO' : 'INACTIVO'} • Clic para ${f.state ? 'Desactivar' : 'Activar'}`,
    id: `${usedPrefix}${f.state ? 'disable' : 'enable'} ${f.key}`
  }))

  const ownerRows = ownerFeatures.map(f => ({
    title: `${f.state ? '✅' : '❌'} ${f.name}`,
    description: `Estado: ${f.state ? 'ACTIVO' : 'INACTIVO'} • Clic para ${f.state ? 'Desactivar' : 'Activar'}`,
    id: `${usedPrefix}${f.state ? 'disable' : 'enable'} ${f.key}`
  }))

  // Construcción de secciones
  const sections = [
    {
      title: "👥 𝖥𝖴𝖭𝖢𝖨𝖮𝖭𝖤𝖲 𝖣𝖤 𝖦𝖱𝖴𝖯𝖮",
      rows: groupRows
    }
  ]

  if (isOwner || isROwner) {
    sections.push({
      title: "👑 𝖥𝖴𝖭𝖢𝖨𝖮𝖭𝖤𝖲 𝖣𝖤𝖫 𝖮𝖶𝖭𝖤𝖱",
      rows: ownerRows
    })
  }

  const selectButton = {
    name: "single_select",
    buttonParamsJson: JSON.stringify({
      title: "⚙️ 𝖢𝗈𝗇𝖿ı𝗀𝗎𝗋⍺𝖼ıó𝗇",
      sections
    })
  }

  const bodyLines = [
    `« ¿ 𝗊𝗎é 𝖽ᧉ𝗌ᧉ⍺𝗌 𝖼𝗈𝗇𝖿ı𝗀𝗎𝗋⍺𝗋 ? »`,
    ``,
    `ꕥ *${botName.toUpperCase()}* (*ᴗ͈ˬᴗ͈)ꕤ`,
    ``,
    `⚙️ *𝖤𝖲𝖳𝖠𝖣𝖮 𝖣𝖤 𝖥𝖴𝖭𝖢𝖨𝖮𝖭𝖤𝖲* ｡ﾟ+.ღ`,
    ``,
    `      𓈒 ◌ㅤ──    *𝗀𝗋𝗎𝗉𝗈 ⍺𝖼ƚı᥎⍺𝗌* : ${totalGroupOn} / ${groupFeatures.length}`,
    `      𓈒 ◌ㅤ──    *𝗈𝗐𝗇ᧉ𝗋 ⍺𝖼ƚı᥎⍺𝗌* : ${totalOwnerOn} / ${ownerFeatures.length}`,
    ``,
    `‧₊ ᵎᵎ *𝖲𝖤𝖫𝖤CC𝖨Ó𝖭* ⋅˚##`,
    `> 📚 _𝗌ᧉ𝗅ᧉ𝖼𝖼ı𝗈𝗇⍺ 𝗎𝗇⍺ 𝗈𝗉𝖼ıó𝗇 𝖽ᧉ𝗌𝖽ᧉ ᧉ𝗅 𝖻𝗈ƚó𝗇 𝗉⍺𝗋⍺ ⍺𝖼ƚı᥎⍺𝗋 / 𝖽ᧉ𝗌⍺𝖼ƚı᥎⍺𝗋_`,
    ``,
    `*( ᴗ͈ˬᴗ͈ )* ${botName} • 𝖤𝖷𝖤𝖢𝖴𝖳𝖨𝖵𝖤`
  ]

  const body = bodyLines.join('\n')

  await conn.sendMessage(
    m.chat,
    {
      text: body,
      footer: `${botName} • 𝖤𝖷𝖤𝖢𝖴𝖳𝖨𝖵𝖤`,
      interactiveButtons: [selectButton]
    },
    { quoted: m }
  )
}

handler.help = ['enable', 'disable']
handler.tags = ['group', 'owner']
handler.command = /^(enable|disable|on|off)$/i

export default handler
