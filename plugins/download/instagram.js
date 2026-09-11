import axios from 'axios'
import { sendAlbum } from '../../src/lib/rimuru-album.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const link = (text || m.quoted?.text || '').trim()
  if (!link || !/(?:instagram\.com|instagr\.am)\//i.test(link)) {
    return m.reply(`📌 *Uso:* ${usedPrefix + command} <enlace de instagram>`)
  }

  await m.react('⏳')
  try {
    const { data } = await axios.get(`https://api.nexray.eu.cc/downloader/aio?url=${encodeURIComponent(link)}`)
    if (!data?.status || !data?.result) throw new Error('No se pudo procesar la publicación.')

    const res = data.result
    const medias = res.medias || []
    const caption = `📸 *Instagram Download*\n\n✧ ‹ ⍺𝗎ƚ𝗈𝗋 › ${res.author || 'Instagram Usuario'}`

    // Si hay varias imágenes/videos, enviar como álbum nativo de Baileys (no spam)
    if (medias.length >= 2) {
      const albumList = medias.map((media, i) => {
        if (media.type === 'video') {
          return { video: { url: media.url }, caption: i === 0 ? caption : '', mimetype: 'video/mp4' };
        } else {
          return { image: { url: media.url }, caption: i === 0 ? caption : '', mimetype: 'image/jpeg' };
        }
      });
      await sendAlbum(conn, m.chat, albumList, m);
    } else {
      for (let i = 0; i < medias.length; i++) {
        const media = medias[i]
        if (media.type === 'video') {
          await conn.sendMessage(m.chat, { video: { url: media.url }, caption: i === 0 ? caption : '' }, { quoted: m })
        } else if (media.type === 'image') {
          await conn.sendMessage(m.chat, { image: { url: media.url }, caption: i === 0 ? caption : '' }, { quoted: m })
        }
      }
    }

    await m.react('✅')
  } catch (e) {
    await m.react('✕')
    m.reply(`❌ Error: ${e.message}`)
  }
}

handler.help = ['instagram <url>']
handler.tags = ['downloader']
handler.command = /^(instagram|ig|igdl|reel)$/i

export default handler
