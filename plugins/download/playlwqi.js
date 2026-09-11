import yts from 'yt-search'

let handler = async (m, { conn, usedPrefix, command, text }) => {
  const query = (text || '').trim()
  if (!query) {
    return m.reply(
      `ꕥ 𝖯𝖫𝖠𝖸𝟤 • 𝑊⍺ց𝗎ɾı ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
      `      𓈒 ◌ㅤ──    *𝖴𝖲𝖮*\n` +
      `      • \`${usedPrefix + command} <nombre | url>\`\n` +
      `      • Ej: \`${usedPrefix + command} Joji Ew\`\n` +
      `      • Ej: \`${usedPrefix + command} https://youtu.be/0rpAc9ID_v4\`\n\n` +
      `> Alternativa a .play usando API LWQI 🌸`
    )
  }

  await m.react('⏳')

  try {
    let videoUrl = ""
    let video = null

    // Si es URL directa, usarla
    const isUrl = /youtu\.be|youtube\.com/.test(query)
    if (isUrl) {
      videoUrl = query
      // intentar sacar info con yts para mostrar preview
      try {
        const search = await yts(query)
        video = search.videos[0] || null
      } catch {}
      if (!video) {
        // fallback mínimo
        video = {
          title: "YouTube Video",
          author: { name: "-" },
          timestamp: "-",
          views: 0,
          ago: "-",
          url: videoUrl,
          thumbnail: "https://i.ytimg.com/vi/0rpAc9ID_v4/maxresdefault.jpg"
        }
      }
    } else {
      const search = await yts(query)
      if (!search.videos?.length) throw new Error('no se encontró ningún resultado')
      video = search.videos[0]
      videoUrl = video.url
    }

    const titleParam = encodeURIComponent(video.title)
    const artistParam = encodeURIComponent(video.author?.name || '-')
    const coverParam = encodeURIComponent(video.thumbnail)
    const canvasUrl = `https://api.nexray.eu.cc/canvas/youtube?title=${titleParam}&artist=${artistParam}&coverurl=${coverParam}`
    const botName = global.config?.bot?.name || "𝑊⍺ց𝗎ɾı 𝖠𝗌𝗌ı𝗌ƚ⍺𝗇ƚ"

    const bodyLines = [
      `« alternativa a .play con API LWQI »`,
      ``,
      `ꕥ *${botName.toUpperCase()}* (*ᴗ͈ˬᴗ͈)ꕤ`,
      ``,
      `🌸   𓈒 ◌ㅤ──    *ƚíƚ𝗎𝗅𝗈* : ${video.title}`,
      `👤   𓈒 ◌ㅤ──    *𝖼⍺𝗇⍺𝗅* : ${video.author?.name || '-'}`,
      `⚙️   𓈒 ◌ㅤ──    *𝖽𝗎𝗋⍺𝖼ıó𝗇* : ${video.timestamp || '-'}`,
      `🏷️   𓈒 ◌ㅤ──    *᥎ı𝗌ıƚ⍺𝗌* : ${formatNumber(video.views)}`,
      `⚡   𓈒 ◌ㅤ──    *𝗉𝗎𝖻𝗅ı𝖼⍺𝖽𝗈* : ${video.ago || '-'}`,
      ``,
      `‧₊ ᵎᵎ *𝖲𝖤𝖫𝖤CC𝖨Ó𝖭 LWQI* ⋅˚##`,
      `> 📚 _API: rest-api-lwqi.onrender.com_`,
      ``,
      `*( ᴗ͈ˬᴗ͈ )* ${botName} • LWQI DOWNLOADER`
    ]
    const body = bodyLines.join('\n')

    const downloadRows = [
      {
        title: "🎵 Audio MP3",
        description: "Descargar audio (m4a → mp3) vía LWQI",
        id: `${usedPrefix}playlwqiget mp3 ${videoUrl}`
      },
      {
        title: "📄 Audio Documento",
        description: "Audio como documento",
        id: `${usedPrefix}playlwqiget mp3doc ${videoUrl}`
      },
      {
        title: "📹 Video MP4",
        description: "Video 360p-720p vía LWQI",
        id: `${usedPrefix}playlwqiget mp4 ${videoUrl}`
      },
      {
        title: "📁 Video Documento",
        description: "Video como documento",
        id: `${usedPrefix}playlwqiget mp4doc ${videoUrl}`
      }
    ]

    const selectButton = {
      name: "single_select",
      buttonParamsJson: JSON.stringify({
        title: "🌸 𝖮𝗉𝖼ı𝗈𝗇ᧉ𝗌 LWQI",
        sections: [{ title: "𝖥𝗈𝗋𝗆⍺ƚ𝗈𝗌 𝖣ı𝗌𝗉𝗈𝗇ı𝖻𝗅ᧉ𝗌", rows: downloadRows }]
      })
    }
    const urlButton = {
      name: "cta_url",
      buttonParamsJson: JSON.stringify({ display_text: "⭐ Ver en YouTube", url: videoUrl, merchant_url: videoUrl })
    }

    await conn.sendMessage(m.chat, {
      image: { url: canvasUrl },
      caption: body,
      footer: `${botName} • LWQI`,
      interactiveButtons: [selectButton, urlButton]
    }, { quoted: m })

    await m.react('✓')
  } catch (e) {
    console.error('[PLAYLWQI ERROR]', e)
    await m.react('✕')
    return m.reply(`*error*:\n\n${e?.message || 'no se pudo procesar la solicitud.'}`)
  }
}

handler.help = ['play2', 'playlwqi']
handler.tags = ['downloader']
handler.command = /^(play2|playlwqi|lwplay)$/i
handler.limit = true

export default handler

function formatNumber(num = 0) {
  if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B'
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M'
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K'
  return num.toString()
}
