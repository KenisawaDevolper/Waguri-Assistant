import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const link = (text || m.quoted?.text || '').trim()
  if (!link || !/(?:facebook\.com|fb\.watch|fb\.com)\//i.test(link)) {
    return m.reply(`📌 *Uso:* ${usedPrefix + command} <enlace de facebook>`)
  }

  await m.react('⏳')
  try {
    const { data } = await axios.get(`https://api.nexray.eu.cc/downloader/aio?url=${encodeURIComponent(link)}`)
    if (!data?.status || !data?.result) throw new Error('No se pudo descargar el video.')

    const res = data.result
    const videos = (res.medias || []).filter((m) => m.type === 'video')
    if (!videos.length) throw new Error('No se encontró ningún video en la publicación.')

    const bestVideo = videos.find((v) => v.quality === 'hd') || videos[0]
    const caption = `📘 *Facebook Download*\n\n✧ ‹ ƚíƚ𝗎𝗅𝗈 › ${res.title || 'Facebook Video'}`

    await conn.sendMessage(m.chat, { video: { url: bestVideo.url }, caption }, { quoted: m })
    await m.react('✅')
  } catch (e) {
    await m.react('✕')
    m.reply(`❌ Error: ${e.message}`)
  }
}

handler.help = ['facebook <url>']
handler.tags = ['downloader']
handler.command = /^(facebook|fb|fbdl)$/i

export default handler
