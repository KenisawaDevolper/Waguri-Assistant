import config from '../../config.js';
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const fs = require('fs')
const path = require('path')
const pluginConfig = {
    name: 'addjpg',
    alias: ['addimage', 'tambahjpg', 'setjpg'],
    category: 'owner',
    description: 'Añade una nueva imagen a la carpeta assets/images con la estética Waguri Assistant 🖼️',
    usage: '.addjpg <nombre_archivo.jpg> (responde a una imagen)',
    example: '.addjpg zerotwo.jpg',
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
    
    if (!fileName || !fileName.toLowerCase().endsWith('.jpg')) {
        return m.reply(`❌ Usa: .addjpg <nombre_archivo.jpg>\nEjemplo: .addjpg zerotwo.jpg`)
    }
    
    const isImage = m.isImage || (m.quoted && m.quoted.type === 'imageMessage')
    
    if (!isImage) {
        return m.reply(`🖼️ Responde a la imagen que deseas añadir. 💫`)
    }
    
    try {
        let buffer
        if (m.quoted && m.quoted.isMedia) {
            buffer = await m.quoted.download()
        } else if (m.isMedia) {
            buffer = await m.download()
        }
        
        if (!buffer) {
            return m.reply(`❌ Error al descargar la imagen`)
        }
        
        const targetPath = path.join(process.cwd(), 'assets', 'images', fileName)
        const dir = path.dirname(targetPath)
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
        
        fs.writeFileSync(targetPath, buffer)
        
        m.reply(`✅ *ʙᴇʀʜᴀsɪʟ*\n> Imagen guardada como assets/images/${fileName}\n> Reinicia el bot si necesitas ver los cambios. ✨`)
        
    } catch (err) {
        m.reply(`❌ *ᴇʀʀᴏʀ*\n> ${err.message}`)
    }
}

export { pluginConfig as config, handler };
