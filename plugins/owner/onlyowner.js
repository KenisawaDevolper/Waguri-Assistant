import config from '../../config.js';
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const fs = require('fs')
const path = require('path')
const pluginConfig = {
    name: 'onlyowner',
    alias: ['onlyownerbot', 'modeowner', 'owneronly'],
    category: 'owner',
    description: 'Configura el modo solo-owner para el uso del bot con la estética Waguri Assistant 👑',
    usage: '.onlyowner on/off',
    example: '.onlyowner on',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock, db }) {
    const args = m.args || []
    const mode = args[0]?.toLowerCase()
    
    if (!mode || (mode !== 'on' && mode !== 'off')) {
        return m.reply(
`╭───〔 𝗭𝗘𝗥𝗢 𝗧𝗪𝗢 𝗢𝗡𝗟𝗬𝗢𝗪𝗡𝗘𝗥 〕───⬣
│
│ ✦ *Cara Pakai*
│
│  𖦹 .onlyowner on  = Activar mode owner only
│  𖦹 .onlyowner off = Desactivar mode owner only
│
│ ✦ *Fungsi*
│
│  𖦹 Saat aktif, HANYA owner utama,
│  𖦹 owner tambahan, dan creator
│  𖦹 yang bisa menggunakan bot
│
│ ✦ *Ejemplo*
│
│  𖦹 .onlyowner on
│
╰──────────────────⬣`
        )
    }
    
    const isEnabled = mode === 'on'
    
    // Simpan ke database (global setting)
    db.setting('onlyOwnerMode', isEnabled)
    await db.save()
    
    const status = isEnabled ? '🟢 *AKTIF*' : '🔴 *NONAKTIF*'
    const pesan = isEnabled 
        ? `> Hanya *OWNER UTAMA, OWNER TAMBAHAN & CREATOR* yang bisa menggunakan bot sekarang!`
        : `> Semua *USER* bisa menggunakan bot sekarang!`
    
    m.reply(
`╭───〔 𝗭𝗘𝗥𝗢 𝗧𝗪𝗢 𝗢𝗡𝗟𝗬𝗢𝗪𝗡𝗘𝗥 〕───⬣
│
│ ✦ *Status Mode*
│
│  ${status}
│
│ ${pesan}
│
│ ✦ *Diubah oleh*
│  @${m.sender.split('@')[0]}
│
╰──────────────────⬣`,
        { mentions: [m.sender] }
    )
}

export { pluginConfig as config, handler };
