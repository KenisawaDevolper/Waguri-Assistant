import axios from 'axios'
import { sendAlbum } from '../../src/lib/rimuru-album.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const link = (text || m.quoted?.text || '').trim()
  if (!link || !/(?:pinterest\.com\/pin|pin\.it)\//i.test(link)) {
    return m.reply(`📌 *Uso:* ${usedPrefix + command} <enlace de pinterest>`)
  }

  await m.react('⏳')
  try {
    const { data } = await axios.get(`https://api.nexray.eu.cc/downloader/pinterest?url=${encodeURIComponent(link)}`)
    if (!data?.status || !data?.result) throw new Error('No se pudo descargar el contenido.')

    const res = data.result

    if (res.video) {
      const caption = `📌 *Pinterest Video*\n\n✧ ‹ ƚíƚ𝗎𝗅𝗈 › ${res.title || '-'}\n✧ ‹ ⍺𝗎ƚ𝗈𝗋 › ${res.author || '-'}`
      await conn.sendMessage(m.chat, { video: { url: res.video }, caption }, { quoted: m })
    } else {
      const items = Array.isArray(res) ? res : [res]
      const imageItems = items.filter(it => it.images_url || it.image || it.images);
      if (imageItems.length > 0) {
        // Si hay varias imágenes (carrusel de Pinterest), enviar como álbum
        if (imageItems.length >= 2) {
          const albumList = imageItems.slice(0, 10).map((item, i) => ({
            image: { url: item.images_url || item.image || item.images },
            caption: i === 0 ? `📌 *Pinterest Image*\n\n✧ ‹ ƚíƚ𝗎𝗅𝗈 › ${item.grid_title || item.seo_alt_text || res.title || '-'}\n✧ Total :: ${imageItems.length} imágenes` : "",
            mimetype: "image/jpeg",
          }));
          await sendAlbum(conn, m.chat, albumList, m);
        } else {
          const item = imageItems[0]
          const caption = `📌 *Pinterest Image*\n\n✧ ‹ ƚíƚ𝗎𝗅𝗈 › ${item.grid_title || item.seo_alt_text || '-'}`
          await conn.sendMessage(m.chat, { image: { url: item.images_url || item.image }, caption }, { quoted: m })
        }
      } else if (res.images_url || res.image) {
        const caption = `📌 *Pinterest Image*\n\n✧ ‹ ƚíƚ𝗎𝗅𝗈 › ${res.grid_title || res.seo_alt_text || res.title || '-'}`
        await conn.sendMessage(m.chat, { image: { url: res.images_url || res.image }, caption }, { quoted: m })
      }
    }

    await m.react('✅')
  } catch (e) {
    await m.react('✕')
    m.reply(`❌ Error: ${e.message}`)
  }
}

handler.help = ['pinterest <url>']
handler.tags = ['downloader']
handler.command = /^(pinterest|pin|pindl)$/i

export default handler
