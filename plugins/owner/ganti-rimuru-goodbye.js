import fs from 'fs'
import path from 'path'
import te from '../../src/lib/rimuru-error.js'
import { updateAssetUrl } from '../../src/lib/rimuru-uploader.js'
const pluginConfig = {
    name: 'ganti-rimuru-goodbye.jpg',
    alias: ['gantigoodbye', 'setrimurugoodbye'],
    category: 'owner',
    description: 'Cambia la imagen de despedida rimuru con la estética Waguri Assistant 👋 (thumbnail goodbye)',
    usage: '.ganti-rimuru-goodbye.jpg (reply/kirim gambar)',
    example: '.ganti-rimuru-goodbye.jpg',
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
        return m.reply(`🖼️ *ɢᴀɴᴛɪ ᴏᴜʀɪɴ-ɢᴏᴏᴅʙʏᴇ.ᴊᴘɢ*\n\n> Envía/reply gambar untuk mengganti\n> File: assets/images/rimuru-goodbye.jpg`)
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
            const newUrl = await updateAssetUrl('rimuru-goodbye', buffer, 'rimuru-goodbye.jpg')
            m.reply(`✅ *ʙᴇʀʜᴀsɪʟ*\n\n> Gambar rimuru-goodbye.jpg telah diganti ke URL baru:\n> ${newUrl}\n> Config telah diupdate de forma realtime!`)
        } catch (e) {
            m.reply(`❌ Error mengupload gambar: ${e.message}`)
        }
    } catch (error) {
        await m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }