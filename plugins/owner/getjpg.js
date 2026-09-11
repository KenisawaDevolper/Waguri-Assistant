import config from '../../config.js';
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const fs = require('fs')
const path = require('path')
const pluginConfig = {
    name: 'getjpg',
    alias: ['lihatjpg', 'showjpg'],
    category: 'owner',
    description: 'Obtiene una imagen de la carpeta assets/images con la estética Waguri Assistant 🖼️',
    usage: '.getjpg <nombre_archivo.jpg>',
    example: '.getjpg zerotwo.jpg',
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

    if (!fileName) {
        return m.reply(`❌ Gunakan:\n.getjpg <nombre_archivo.jpg>\nEjemplo: .getjpg zerotwo.jpg`)
    }

    const filePath = path.join(process.cwd(), 'assets', 'images', fileName)

    if (!fs.existsSync(filePath)) {
        return m.reply(`❌ File no encontrado!\n> Cek nama file dan pastikan sudah tersimpan di assets/images`)
    }

    try {
        const buffer = fs.readFileSync(filePath)
        await sock.sendMessage(m.chat, {
            image: buffer,
            caption: `📸 *Zero Two Gallery*\n\n> File: ${fileName}`,
        }, { quoted: m })

    } catch (err) {
        m.reply(`❌ *Error*: ${err.message}`)
    }
}

export { pluginConfig as config, handler };
