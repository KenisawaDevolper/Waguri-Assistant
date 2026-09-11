import axios from 'axios'
import * as cheerio from 'cheerio'

export const config = {
  name: 'anitavid',
  alias: ['anitaimp4', 'anitavideo', 'hv', 'anita'],
  category: 'adulto',
  description: 'Vídeo aleatorio de anita desde sfmcompile.club (SOLO PREMIUM)',
  usage: '.anitavid',
  example: '.anitavid',
  isOwner: false,
  isPremium: true,
  isGroup: false,
  isPrivate: false,
  cooldown: 15,
  energi: 2,
  isEnabled: true
}

async function getRandomAnita() {
  const page = Math.floor(Math.random() * 1153)
  const response = await axios.get(`https://sfmcompile.club/page/${page}`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  })
  
  const htmlText = response.data
  const $ = cheerio.load(htmlText)
  const hasil = []  
  
  $("#primary > div > div > ul > li > article").each(function (a, b) {  
      hasil.push({  
          title: $(b).find("header > h2").text().trim(),  
          link: $(b).find("header > h2 > a").attr("href"),  
          category: $(b).find("header > div.entry-before-title > span > span").text().replace("in ", "").trim(),  
          share_count: $(b).find("header > div.entry-after-title > p > span.entry-shares").text().trim(),  
          views_count: $(b).find("header > div.entry-after-title > p > span.entry-views").text().trim(),  
          type: $(b).find("source").attr("type") || "image/jpeg",  
          video_1: $(b).find("source").attr("src") || $(b).find("img").attr("data-src"),  
          video_2: $(b).find("video > a").attr("href") || "",  
      })  
  })
  
  if (hasil.length === 0) return null
  
  // Obtiene 1 vídeo aleatorio del resultado del scraping en dicha página
  const randomItem = hasil[Math.floor(Math.random() * hasil.length)]
  return randomItem
}

function getCaption(obj) {
  return `*¡Hola, buenas tardes!* ฅ^·ﻌ·^ฅ\n` +
  `> _Vídeo hentai ≽^• ˕ • ྀི≼_\n\n` +
  `## ꕥ *W⍺gurı 𝖠ssı𝗌ƚ⍺nƚ* (*ᴗ͈ˬᴗ͈)ꕤ\n` +
  `> 𝖵Í𝖣𝖤𝖮 𝖧𝖤𝖭𝖳𝖠𝖨 𝖱𝖠𝖭𝖣𝖮𝖬\n\n` +
  `╭┈┈⬡「 📹 *𝖣𝖤𝖳𝖠𝖫𝖫𝖤𝖲* 」\n` +
  `┃ 📌 *𝖳Í𝖳𝖴𝖫𝖮*: ${obj.title}\n` +
  `┃ 🏷️ *𝖢𝖠𝖳𝖤𝖦𝖮𝖱Í𝖠*: ${obj.category}\n` +
  `┃ 👁️ *𝖵𝖨𝖲𝖳𝖠𝖲*: ${obj.views_count || 'N/A'}\n` +
  `┃ 📤 *𝖢𝖮𝖬𝖯𝖠𝖱𝖳𝖨𝖣𝖮*: ${obj.share_count || 'N/A'}\n` +
  `┃ 🔗 *𝖤𝖭𝖫𝖠𝖢𝖤*: ${obj.link}\n` +
  `╰┈┈⬡\n\n` +
  `> 💗 *Zero Two:* ¡Disfrútalo, darling~ 🥵!\n\n` +
  `> sɪᴍᴘʟᴇ ᴡʜᴀᴛsᴀᴘᴘ ʙᴏᴛ ツ`
}

export async function handler(m, { sock }) {
  await m.react('💕')  
  await m.reply(
      `*¡Hola, buenas tardes!* ฅ^·ﻌ·^ฅ\n` +
      `> _Buscando vídeo ≽^• ˕ • ྀི≼_\n\n` +
      `## ꕥ *W⍺gurı 𝖠ssı𝗌ƚ⍺nƚ* (*ᴗ͈ˬᴗ͈)ꕤ\n` +
      `> 𝖡𝖴𝖲𝖢𝖠𝖭𝖣𝖮 𝖵Í𝖣𝖤𝖮 𝖠𝖢𝖱𝖠𝖮...\n\n` +
      `> 💗 *Zero Two:* Espera un momento, darling, buscando un vídeo aleatorio~ 🔞\n\n` +
      `> sɪᴍᴘʟᴇ ᴡʜᴀᴛsᴀᴘᴘ ʙᴏᴛ ツ`
  )  

  try {  
      const selected = await getRandomAnita()  
        
      if (!selected) {  
          m.react('💔')  
          return m.reply(
              `*¡Hola, buenas tardes!* ฅ^·ﻌ·^ฅ\n` +
              `> _Error de búsqueda ≽^• ˕ • ྀི≼_\n\n` +
              `## ꕥ *W⍺gurı 𝖠ssı𝗌ƚ⍺nƚ* (*ᴗ͈ˬᴗ͈)ꕤ\n` +
              `> 𝖲𝖨𝖭 𝖣𝖠𝖳𝖮𝖲 𝖣𝖤𝖫 𝖵Í𝖣𝖤𝖮\n\n` +
              `> Error: No se pudo encontrar ningún vídeo, inténtalo más tarde, darling~ 🥺\n\n` +
              `> sɪᴍᴘʟᴇ ᴡʜᴀᴛsᴀᴘᴘ ʙᴏᴛ ツ`
          )  
      }  

      const videoUrl = selected.video_1 || selected.video_2
      
      if (!videoUrl) {
          m.react('💔')
          return m.reply(
              `*¡Hola, buenas tardes!* ฅ^·ﻌ·^ฅ\n` +
              `> _Error de vídeo ≽^• ˕ • ྀི≼_\n\n` +
              `## ꕥ *W⍺gurı 𝖠ssı𝗌ƚ⍺nƚ* (*ᴗ͈ˬᴗ͈)ꕤ\n` +
              `> 𝖵Í𝖣𝖤𝖮 𝖭𝖮 𝖤𝖭𝖢𝖮𝖭𝖳𝖱𝖠𝖣𝖮\n\n` +
              `> Error: El enlace del vídeo está vacío, inténtalo de nuevo, darling~\n\n` +
              `> sɪᴍᴘʟᴇ ᴡʜᴀᴛsᴀᴘᴘ ʙᴏᴛ ツ`
          )
      }

      await m.react('🎬')

      // Envía el vídeo directamente
      await sock.sendMessage(m.chat, {  
          video: { url: videoUrl },  
          caption: getCaption(selected),  
          mimetype: 'video/mp4'  
      }, { quoted: m })  
        
      m.react('✅')  

  } catch (err) {  
      console.error('[anitavid] Error:', err)  
      m.react('💔')  
      await m.reply(
          `*¡Hola, buenas tardes!* ฅ^·ﻌ·^ฅ\n` +
          `> _Error inesperado ≽^• ˕ • ྀི≼_\n\n` +
          `## ꕥ *W⍺gurı 𝖠ssı𝗌ƚ⍺nƚ* (*ᴗ͈ˬᴗ͈)ꕤ\n` +
          `> 𝖤𝖱𝖱𝖮𝖱 𝖣𝖤𝖫 𝖲𝖨𝖲𝖳𝖤𝖬𝖠\n\n` +
          `> Error: ${err.message}\n\n` +
          `> ¡Inténtalo de nuevo, darling~ 🥺!\n\n` +
          `> sɪᴍᴘʟᴇ ᴡʜᴀᴛsᴀᴘᴘ ʙᴏᴛ ツ`
      )  
  }
}

export default {
  config,
  handler
}
