import config from '../../config.js';
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const fs = require('fs')
const path = require('path')
const pluginConfig = {
    name: 'addmp4',
    alias: ['addvideo', 'tambahmp4', 'setmp4', 'addvid'],
    category: 'owner',
    description: 'Añade un nuevo video a la carpeta assets/video con la estética Waguri Assistant 🎬',
    usage: '.addmp4 <nombre_archivo.mp4> (responde a un video)',
    example: '.addmp4 opening.mp4',
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
    
    // Cek ekstensi file (bisa .mp4, .mkv, .mov, .avi, .webm)
    const validExtensions = ['.mp4', '.mkv', '.mov', '.avi', '.webm', '.m4v']
    const isValidExt = validExtensions.some(ext => fileName?.toLowerCase().endsWith(ext))
    
    if (!fileName || !isValidExt) {
        return m.reply(`❌ Usa: .addmp4 <nombre_archivo.mp4>\nEjemplo: .addmp4 opening.mp4\n\n📌 *Extensiones compatibles:* ${validExtensions.join(', ')}`)
    }
    
    const isVideo = m.isVideo || (m.quoted && m.quoted.type === 'videoMessage')
    
    if (!isVideo) {
        return m.reply(`🎥 Responde al video que deseas añadir. 💫`)
    }
    
    try {
        let buffer
        if (m.quoted && m.quoted.isMedia) {
            buffer = await m.quoted.download()
        } else if (m.isMedia) {
            buffer = await m.download()
        }
        
        if (!buffer) {
            return m.reply(`❌ Error al descargar el video`)
        }
        
        const targetPath = path.join(process.cwd(), 'assets', 'video', fileName)
        const dir = path.dirname(targetPath)
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
        
        fs.writeFileSync(targetPath, buffer)
        
        // Dapatkan ukuran file
        const fileSizeMB = (buffer.length / (1024 * 1024)).toFixed(2)
        
        m.reply(`✅ *ʙᴇʀʜᴀsɪʟ*\n> Video guardado como assets/video/${fileName}\n> 📦 Tamaño: ${fileSizeMB} MB\n> Reinicia el bot si necesitas ver los cambios. ✨`)
        
    } catch (err) {
        m.reply(`❌ *ᴇʀʀᴏʀ*\n> ${err.message}`)
    }
}

export { pluginConfig as config, handler };
