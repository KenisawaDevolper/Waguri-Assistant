import fs from 'fs'
import path from 'path'
import te from '../../src/lib/rimuru-error.js'
const pluginConfig = {
    name: 'rimuru-large',
    alias: ['setrimurularge', 'gantirimurularge'],
    category: 'owner',
    description: 'Preset: Ganti gambar rimuru.jpg, serta rimuru-v7 hingga rimuru-v11.jpg una vezgus',
    usage: '.rimuru-large (reply/kirim gambar)',
    example: '.rimuru-large',
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
        return m.reply(`🖼️ *ᴏᴜʀɪɴ ʟᴀʀɢᴇ ᴘʀᴇsᴇᴛ*\n\n> Kirim/reply gambar untuk mengganti kumpulan foto besar (rimuru.jpg, rimuru-v8.jpg, rimuru-v10.jpg) una vezgus.\n> Pastikan rasio gambar sesuai dengan yang diinginkan.`)
    }
    
    await m.react('🕕')
    
    try {
        let buffer
        if (m.quoted && m.quoted.isMedia) {
            buffer = await m.quoted.download()
        } else if (m.isMedia) {
            buffer = await m.download()
        }
        
        if (!buffer) {
            await m.react('❌')
            return m.reply(`❌ Error al descargar la imagen`)
        }
        
        const targetImages = [
            'rimuru.jpg',
            'rimuru-v8.jpg',
            'rimuru-v10.jpg'
        ]
        
        const assetsDir = path.join(process.cwd(), 'assets', 'images')
        if (!fs.existsSync(assetsDir)) {
            fs.mkdirSync(assetsDir, { recursive: true })
        }
        
        for (const imgName of targetImages) {
            const targetPath = path.join(assetsDir, imgName)
            fs.writeFileSync(targetPath, buffer)
        }
        
        await m.react('✅')
        m.reply(`✅ *ʙᴇʀʜᴀsɪʟ*\n\n> Gambar bundle *rimuru-large* cambiado masivamente con éxito. ✨\n> Incluye: ${targetImages.join(', ')}\n> Reinicia el bot si la imagen no cambia de inmediato. ✨`)
        
    } catch (error) {
        await m.react('☢')
        await m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }