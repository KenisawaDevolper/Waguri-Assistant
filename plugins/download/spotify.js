import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const link = (text || m.quoted?.text || '').trim()
  if (!link || !/https?:\/\/open\.spotify\.com\/(track|album|playlist)\/[^\s]+/i.test(link)) {
    return m.reply(`📌 *Uso:* ${usedPrefix + command} <enlace de spotify>`)
  }

  await m.react('⏳')
  try {
    const { data } = await axios.get(`https://api.nexray.eu.cc/downloader/spotify?url=${encodeURIComponent(link)}`)
    if (!data?.status || !data?.result?.url) throw new Error('No se pudo descargar la pista.')

    const res = data.result
    const title = res.title || 'Spotify Track'
    const artist = res.artist || 'Artista Desconocido'
    const coverFallback = 'https://files.catbox.moe/megwu0.png'
    const musicCardUrl = `https://api.nexray.eu.cc/canvas/musiccard?judul=${encodeURIComponent(title)}&nama=${encodeURIComponent(artist)}&image_url=${encodeURIComponent(coverFallback)}`

    const caption = `💚 *Spotify Download*\n\n✧ ‹ ƚíƚ𝗎𝗅𝗈 › ${title}\n✧ ‹ ⍺𝗋ƚı𝗌ƚ⍺ › ${artist}`

    try {
      await conn.sendMessage(m.chat, { image: { url: musicCardUrl }, caption }, { quoted: m })
    } catch (_) {
      await conn.sendMessage(m.chat, { image: { url: coverFallback }, caption }, { quoted: m })
    }

    const fileBuff = await axios.get(res.url, { responseType: 'arraybuffer', timeout: 90000 })

    await conn.sendMessage(m.chat, {
      audio: Buffer.from(fileBuff.data),
      mimetype: 'audio/mpeg',
      fileName: `${title} - ${artist}.mp3`,
      ptt: false
    }, { quoted: m })

    await m.react('✅')
  } catch (e) {
    await m.react('✕')
    m.reply(`❌ Error: ${e.message}`)
  }
}

handler.help = ['spotify <url>']
handler.tags = ['downloader']
handler.command = /^(spotify|sp|music)$/i

export default handler
