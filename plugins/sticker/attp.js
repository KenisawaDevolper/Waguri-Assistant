import { addExifToWebp } from '../../src/lib/rimuru-exif.js'
import axios from 'axios'
import config from '../../config.js'
import { f } from '../../src/lib/rimuru-http.js'
import te from '../../src/lib/rimuru-error.js'

const NEOXR_APIKEY = config.APIkey?.neoxr || 'Milik-Bot-rimuruMD'

const pluginConfig = {
    name: 'attp',
    alias: ['attp2', 'attp3'],
    category: 'sticker',
    description: '𝖢𝗋ᧉ⍺ 𝗎𝗇 𝗌ƚı𝖼𝗄ᧉ𝗋 𝖽ᧉ ƚᧉ𝗑ƚ𝗈 ⍺𝗇ı𝗆⍺𝖽𝗈',
    usage: '.attp <ƚᧉ𝗑ƚ𝗈>',
    example: '.attp 𝖧𝗈𝗅⍺ 𝖬𝗎𝗇𝖽𝗈',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 1,
    isEnabled: true
}

function getRandomColor() {
    const colors = ['FF5733', 'C70039', '900C3F', '581845', '2E86AB', 'A23B72', 'F18F01', 'C73E1D', '3A0CA3', '7209B7', '4361EE', '4CC9F0']
    return colors[Math.floor(Math.random() * colors.length)]
}

async function handler(m, { sock }) {
    let text = m.text?.trim()
    
    if (!text && m.quoted?.text) {
        text = m.quoted.text.trim()
    }
    
    if (!text) {
        return m.reply(
            `« ¿ 𝗊𝗎é 𝖽ᧉ𝗌ᧉ⍺𝗌 ᥎ᧉ𝗋 𝗑 ? »\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ *𝖠𝖭𝖨𝖬𝖠𝖳𝖤𝖣 𝖳𝖤𝖷𝖳* ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `      ⚠️   𓈒 ◌ㅤ──    _¡𝖨𝗇𝗀𝗋ᧉ𝗌⍺ 𝗎𝗇 ƚᧉ𝗑ƚ𝗈 𝗉⍺𝗋⍺ ᧉ𝗅 𝗌ƚı𝖼𝗄ᧉ𝗋!_\n\n` +
            `> 𝖤𝗃ᧉ𝗆𝗉𝗅𝗈: \`${m.prefix}attp 𝖧𝗈𝗅⍺ 𝖬𝗎𝗇𝖽𝗈\`\n\n` +
            `( ᴗ͈ˬᴗ͈ ) 𝑊⍺ց𝗎𝗋ı 𝖠𝗌𝗌ı𝗌ƚ⍺𝗇ƚ`
        )
    }
    
    if (text.length > 100) {
        return m.reply(
            `« ¿ 𝗊𝗎é 𝖽ᧉ𝗌ᧉ⍺𝗌 ᥎ᧉ𝗋 𝗑 ? »\n\n` +
            `❌ *𝖤𝖱𝖱𝖮𝖱* ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `      ⚠️   𓈒 ◌ㅤ──    ¡𝖤𝗅 ƚᧉ𝗑ƚ𝗈 ᧉ𝗌 𝖽ᧉ𝗆⍺𝗌ı⍺𝖽𝗈 𝗅⍺𝗋𝗀𝗈!\n` +
            `      📏   𓈒 ◌ㅤ──    _𝖬á𝗑ı𝗆𝗈 100 𝖼⍺𝗋⍺𝖼ƚᧉ𝗋ᧉ𝗌._\n\n` +
            `( ᴗ͈ˬᴗ͈ ) 𝑊⍺ց𝗎𝗋ı 𝖠𝗌𝗌ı𝗌ƚ⍺𝗇ƚ`
        )
    }
    
    m.react('🕕')
    
    try {
        const color = getRandomColor()
        const url = `https://api.neoxr.eu/api/attp3?text=${encodeURIComponent(text)}&color=${color}&apikey=${NEOXR_APIKEY}`
        const data = await f(url)
        
        if (!data?.status || !data?.data?.url) {
            throw new Error('API tidak mengembalikan data yang valid')
        }
        
        const stickerUrl = data.data.url
        const stickerRes = await f(stickerUrl, 'buffer')
        
        if (!stickerRes) throw new Error('Gagal mengunduh sticker dari server')
        
        let finalSticker = stickerRes
        try {
            finalSticker = await addExifToWebp(stickerRes, {
                packname: config.sticker.packname,
                author: config.sticker.author
            })
        } catch (e) {
            console.log('Exif error:', e)
        }
        
        await sock.sendMessage(m.chat, { sticker: finalSticker }, { quoted: m })
        m.react('✅')
    } catch (err) {
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
