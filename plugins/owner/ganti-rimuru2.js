import fs from 'fs'
import path from 'path'
import te from '../../src/lib/rimuru-error.js'
import { updateAssetUrl } from '../../src/lib/rimuru-uploader.js'
const pluginConfig = {
    name: 'ganti-rimuru2.jpg',
    alias: ['gantirimuru2', 'setrimuru2'],
    category: 'owner',
    description: 'Cambia la imagen rimuru2 con la estética Waguri Assistant 🖼️',
    usage: '.ganti-rimuru2.jpg (reply/kirim gambar)',
    example: '.ganti-rimuru2.jpg',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const isImage = m.isImage || (m.quoted && m.quoted.type === 'imageMessage')
    
    if (!isImage) {
        return m.reply(`🖼️ *ɢᴀɴᴛɪ ᴏᴜʀɪɴ2.ᴊᴘɢ*\n\n> Envía/reply gambar untuk mengganti\n> File: assets/images/rimuru2.jpg`)
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
        
        await m.reply(`⏳ Sedang mengupload gambar...`)
        try {
            const newUrl = await updateAssetUrl('rimuru2', buffer, 'rimuru2.jpg')
            m.reply(`✅ *ʙᴇʀʜᴀsɪʟ*\n\n> Gambar rimuru2.jpg telah diganti ke URL baru:\n> ${newUrl}\n> Config telah diupdate de forma realtime!`)
        } catch (e) {
            m.reply(`❌ Error mengupload gambar: ${e.message}`)
        }
    } catch (error) {
        await m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }