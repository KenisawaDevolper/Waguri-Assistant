import config from '../../config.js';
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const fs = require('fs')
const path = require('path')
const pluginConfig = {
    name: 'getmp3',
    alias: ['getaudio', 'ambilmp3', 'ambilaudio'],
    category: 'owner',
    description: 'Obtiene un archivo MP3/Audio de la carpeta assets/audio con la estética Waguri Assistant 🎵',
    usage: '.getmp3 <nombre_archivo.mp3>',
    example: '.getmp3 zerotwo.mp3',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const args = m.args || []
    const fileName = args[0]?.trim()
    
    if (!fileName) {
        return m.reply(
            `💕 *ɢᴇᴛ ᴍᴘ3* 💕\n\n` +
            `╭━━━━━━━━━━━━━━━━━━━━━⬣\n` +
            `┃ ✦ *Cara Pakai*\n` +
            `┃\n` +
            `┃   ${m.prefix}getmp3 <nama_file.mp3>\n` +
            `┃\n` +
            `┃ ✦ *Ejemplo*\n` +
            `┃\n` +
            `┃   ${m.prefix}getmp3 zerotwo.mp3\n` +
            `┃\n` +
            `┃ ✦ *Lihat daftar file*\n` +
            `┃   ${m.prefix}listmp3\n` +
            `╰━━━━━━━━━━━━━━━━━━━━━⬣\n\n` +
            `💗 *Zero Two:* ¿Qué audio quieres obtener, cariño~? 💫`
        )
    }
    
    m.react('💕')
    
    try {
        const audioPath = path.join(process.cwd(), 'assets', 'audio', fileName)
        
        if (!fs.existsSync(audioPath)) {
            m.react('💔')
            return m.reply(
                `💔 *ᴇʀʀᴏʀ*\n\n` +
                `> File *${fileName}* no encontrado di folder assets/audio cariño~\n\n` +
                `> Ketik *${m.prefix}listmp3* untuk lihat daftar file yang tersedia 🥺`
            )
        }
        
        const audioBuffer = fs.readFileSync(audioPath)
        const fileSizeMB = (audioBuffer.length / (1024 * 1024)).toFixed(2)
        
        await sock.sendMessage(m.chat, {
            audio: audioBuffer,
            mimetype: 'audio/mpeg',
            ptt: false,
            fileName: fileName
        }, { quoted: m })
        
        m.react('✅')
        
        await m.reply(
            `💕 *ɢᴇᴛ ᴍᴘ3* 💕\n\n` +
            `╭━━━━━━━━━━━━━━━━━━━━━⬣\n` +
            `┃ ✅ *ʙᴇʀʜᴀꜱɪʟ*\n` +
            `┃\n` +
            `┃ 🎵 *ɴᴀᴍᴇ*: ${fileName}\n` +
            `┃ 📦 *ᴜᴋᴜʀᴀɴ*: ${fileSizeMB} MB\n` +
            `┃\n` +
            `┃ 💗 *Zero Two:* Ini dia audio nya cariño~ 🎶\n` +
            `╰━━━━━━━━━━━━━━━━━━━━━⬣`
        )
        
    } catch (err) {
        console.error('[GetMP3] Error:', err)
        m.react('💔')
        return m.reply(
            `💔 *ᴇʀʀᴏʀ*\n\n` +
            `> ${err.message}\n\n` +
            `> Inténtalo de nuevo, cariño~ 🥺`
        )
    }
}

export { pluginConfig as config, handler };
