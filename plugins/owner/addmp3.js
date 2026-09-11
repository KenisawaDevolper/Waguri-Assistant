import config from '../../config.js';
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const fs = require('fs')
const path = require('path')
const pluginConfig = {
    name: 'addmp3',
    alias: ['addaudio', 'tambahmp3', 'setmp3', 'addmusik'],
    category: 'owner',
    description: 'Añade un archivo MP3/Audio a la carpeta assets/audio con la estética Waguri Assistant 🎵',
    usage: '.addmp3 <nombre_archivo.mp3> (responde a un audio)',
    example: '.addmp3 zerotwo.mp3',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const args = m.args || []
    const fileName = args[0]?.trim()
    
    const validExtensions = ['.mp3', '.m4a', '.ogg', '.wav', '.aac', '.flac']
    const isValidExt = validExtensions.some(ext => fileName?.toLowerCase().endsWith(ext))
    
    if (!fileName || !isValidExt) {
        return m.reply(
            `💕 *ᴀᴅᴅ ᴍᴘ3* 💕\n\n` +
            `╭━━━━━━━━━━━━━━━━━━━━━⬣\n` +
            `┃ ✦ *Cara Pakai*\n` +
            `┃\n` +
            `┃   ${m.prefix}addmp3 <nama_file.mp3>\n` +
            `┃   (sambil reply audio)\n` +
            `┃\n` +
            `┃ ✦ *Ejemplo*\n` +
            `┃\n` +
            `┃   ${m.prefix}addmp3 zerotwo.mp3\n` +
            `┃\n` +
            `┃ ✦ *Ekstensi yang didukung*\n` +
            `┃   ${validExtensions.join(', ')}\n` +
            `╰━━━━━━━━━━━━━━━━━━━━━⬣\n\n` +
            `💗 *Zero Two:* Envíame el audio, cariño~ 💫`
        )
    }
    
    const isAudio = m.isAudio || (m.quoted && m.quoted.type === 'audioMessage')
    
    if (!isAudio) {
        return m.reply(
            `💔 *ᴇʀʀᴏʀ*\n\n` +
            `> Responde al audio/nota de voz que deseas añadir, cariño~ 🥺`
        )
    }
    
    m.react('💕')
    
    try {
        let buffer
        if (m.quoted && m.quoted.isMedia) {
            buffer = await m.quoted.download()
        } else if (m.isMedia) {
            buffer = await m.download()
        }
        
        if (!buffer) {
            return m.reply(
                `💔 *ɢᴀɢᴀʟ*\n\n` +
                `> No pude descargar el audio, cariño~ 🥺`
            )
        }
        
        const targetPath = path.join(process.cwd(), 'assets', 'audio', fileName)
        const dir = path.dirname(targetPath)
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
        
        fs.writeFileSync(targetPath, buffer)
        
        const fileSizeMB = (buffer.length / (1024 * 1024)).toFixed(2)
        
        m.react('✅')
        
        return m.reply(
            `💕 *ᴀᴅᴅ ᴍᴘ3* 💕\n\n` +
            `╭━━━━━━━━━━━━━━━━━━━━━⬣\n` +
            `┃ ✅ *ʙᴇʀʜᴀꜱɪʟ*\n` +
            `┃\n` +
            `┃ 📁 *ʟᴏᴋᴀꜱɪ*: assets/audio/${fileName}\n` +
            `┃ 📦 *ᴜᴋᴜʀᴀɴ*: ${fileSizeMB} MB\n` +
            `┃\n` +
            `┃ 💗 *Zero Two:* ¡El audio ya está guardado, cariño~ ✨\n` +
            `╰━━━━━━━━━━━━━━━━━━━━━⬣`
        )
        
    } catch (err) {
        console.error('[AddMP3] Error:', err)
        m.react('💔')
        return m.reply(
            `💔 *ᴇʀʀᴏʀ*\n\n` +
            `> ${err.message}\n\n` +
            `> Inténtalo de nuevo, cariño~ 🥺`
        )
    }
}

export { pluginConfig as config, handler };
