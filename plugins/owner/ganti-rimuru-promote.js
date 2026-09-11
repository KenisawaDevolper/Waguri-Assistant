import fs from 'fs'
import path from 'path'
import te from '../../src/lib/rimuru-error.js'
import { updateAssetUrl } from '../../src/lib/rimuru-uploader.js'
const pluginConfig = {
    name: 'ganti-rimuru-promote.jpg',
    alias: ['gantirimurupromote', 'setrimurupromote'],
    category: 'owner',
    description: 'Cambia la imagen de promote rimuru con la estética Waguri Assistant 🎉',
    usage: '.ganti-rimuru-promote.jpg (reply/kirim gambar)',
    example: '.ganti-rimuru-promote.jpg',
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
    if (!isImage) return m.reply(`🖼️ *ɢᴀɴᴛɪ rimuru-PROMOTE.JPG*\n\n> Kirim/reply gambar untuk mengganti\n> File: assets/images/rimuru-promote.jpg`)
    try {
        let buffer = m.quoted && m.quoted.isMedia ? await m.quoted.download() : await m.download()
        if (!buffer) return m.reply('❌ Error al descargar la imagen')
        await m.reply(`⏳ Sedang mengupload gambar...`)
        try {
            const newUrl = await updateAssetUrl('rimuru-promote', buffer, 'rimuru-promote.jpg')
            m.reply(`✅ *ʙᴇʀʜᴀsɪʟ*\n\n> Gambar rimuru-promote.jpg telah diganti ke URL baru:\n> ${newUrl}\n> Config telah diupdate secara realtime!`)
        } catch (e) {
            m.reply(`❌ Error mengupload gambar: ${e.message}`)
        }
    } catch (error) {
        await m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }