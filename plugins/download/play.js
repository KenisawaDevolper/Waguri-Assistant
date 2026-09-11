import yts from 'yt-search'

let handler = async (m, { conn, usedPrefix, command, text }) => {
  const query = (text || '').trim()

  if (!query) {
    return m.reply(`*𝗉𝗅⍺𝗒*\n\nᧉjᧉ𝗆𝗉𝗅𝗈:\n${usedPrefix + command} Joji Ew`)
  }

  await m.react('⏳')

  try {
    const search = await yts(query)
    if (!search.videos?.length) throw new Error('𝗇𝗈 𝗌ᧉ ᧉ𝗇𝖼𝗈𝗇ƚ𝗋ó 𝗇ı𝗇𝗀ú𝗇 𝗋ᧉ𝗌𝗎𝗅ƚ⍺𝖽𝗈')

    const video = search.videos[0]

    const titleParam = encodeURIComponent(video.title)
    const artistParam = encodeURIComponent(video.author?.name || '-')
    const coverParam = encodeURIComponent(video.thumbnail)
    const canvasUrl = `https://api.nexray.eu.cc/canvas/youtube?title=${titleParam}&artist=${artistParam}&coverurl=${coverParam}`

    const botName = global.config?.bot?.name || "𝑊⍺ց𝗎ɾı 𝖠𝗌𝗌ı𝗌ƚ⍺𝗇ƚ"

    const bodyLines = [
      `« ¿ 𝗊𝗎é 𝖽ᧉ𝗌ᧉ⍺𝗌 𝖽ᧉ𝗌𝖼⍺𝗋𝗀⍺𝗋 ? »`,
      ``,
      `ꕥ *${botName.toUpperCase()}* (*ᴗ͈ˬᴗ͈)ꕤ`,
      ``,
      `🌸   𓈒 ◌ㅤ──    *ƚíƚ𝗎𝗅𝗈* : ${video.title}`,
      `👤   𓈒 ◌ㅤ──    *𝖼⍺𝗇⍺𝗅* : ${video.author?.name || '-'}`,
      `⚙️   𓈒 ◌ㅤ──    *𝖽𝗎𝗋⍺𝖼ıó𝗇* : ${video.timestamp || '-'}`,
      `🏷️   𓈒 ◌ㅤ──    *᥎ı𝗌ıƚ⍺𝗌* : ${formatNumber(video.views)}`,
      `⚡   𓈒 ◌ㅤ──    *𝗉𝗎𝖻𝗅ı𝖼⍺𝖽𝗈* : ${video.ago || '-'}`,
      ``,
      `‧₊ ᵎᵎ *𝖲𝖤𝖫𝖤CC𝖨Ó𝖭* ⋅˚##`,
      `> 📚 _𝗌ᧉ𝗅ᧉ𝖼𝖼ı𝗈𝗇⍺ ᧉ𝗅 𝖿𝗈𝗋𝗆⍺ƚ𝗈 𝖽ᧉ 𝖽ᧉ𝗌𝖼⍺𝗋𝗀⍺ 𝖽ᧉ𝗌𝖽ᧉ ᧉ𝗅 𝖻𝗈ƚó𝗇_`,
      ``,
      `*( ᴗ͈ˬᴗ͈ )* ${botName} • 𝖣𝖮𝖶𝖭𝖫𝖮𝖠𝖣𝖤𝖱`
    ]

    const body = bodyLines.join('\n')

    // Opciones del botón de lista dirigidas al comando "playget"
    const downloadRows = [
      {
        title: "🎵 Audio MP3",
        description: "Descargar música en formato de audio normal",
        id: `${usedPrefix}playget mp3 ${video.url}`
      },
      {
        title: "📄 Audio Documento",
        description: "Descargar audio en formato de documento",
        id: `${usedPrefix}playget mp3doc ${video.url}`
      },
      {
        title: "📹 Video MP4",
        description: "Descargar video en formato multimedia normal",
        id: `${usedPrefix}playget mp4 ${video.url}`
      },
      {
        title: "📁 Video Documento",
        description: "Descargar video en formato de documento",
        id: `${usedPrefix}playget mp4doc ${video.url}`
      }
    ]

    const selectButton = {
      name: "single_select",
      buttonParamsJson: JSON.stringify({
        title: "🌸 𝖮𝗉𝖼ı𝗈𝗇ᧉ𝗌 𝖽ᧉ 𝖣ᧉ𝗌𝖼⍺𝗋𝗀⍺",
        sections: [{
          title: "𝖥𝗈𝗋𝗆⍺ƚ𝗈𝗌 𝖣ı𝗌𝗉𝗈𝗇ı𝖻𝗅ᧉ𝗌",
          rows: downloadRows
        }]
      })
    }

    const urlButton = {
      name: "cta_url",
      buttonParamsJson: JSON.stringify({
        display_text: "⭐ 𝖵ᧉ𝗋 ᧉ𝗇 𝖸𝗈𝗎𝖳𝗎𝖻ᧉ",
        url: video.url,
        merchant_url: video.url
      })
    }

    await conn.sendMessage(m.chat, {
      image: { url: canvasUrl },
      caption: body,
      footer: `${botName} • 𝖤𝖷𝖤𝖢𝖴𝖳𝖨𝖵𝖤`,
      interactiveButtons: [selectButton, urlButton]
    }, { quoted: m })

    await m.react('✓')

  } catch (e) {
    console.error('[PLAY ERROR]', e)
    await m.react('✕')
    return m.reply(`*ᧉ𝗋𝗋𝗈𝗋*:\n\n${e?.message || '𝗇𝗈 𝗌ᧉ 𝗉𝗎𝖽𝗈 𝗉𝗋𝗈𝖼ᧉ𝗌⍺𝗋 𝗅⍺ 𝗌𝗈𝗅ı𝖼ıƚ𝗎𝖽.'}`)
  }
}

handler.help = ['play']
handler.tags = ['downloader']
handler.command = /^(play)$/i
handler.limit = true

export default handler

function formatNumber(num = 0) {
  if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B'
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M'
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K'
  return num.toString()
}
