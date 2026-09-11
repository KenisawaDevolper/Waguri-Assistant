import config from '../../config.js'
import { getDatabase } from '../../src/lib/rimuru-database.js'

const pluginConfig = {
    name: 'coins',
    alias: ['saldo', 'money', 'cash', 'coin'],
    category: 'user',
    description: 'Consulta las monedas y saldo financiero del usuario',
    usage: '.koin [@usuario]',
    example: '.koin',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
}

function formatKoin(num) {
    if (num >= 1000000000000) return (num / 1000000000000).toFixed(2) + 'T'
    if (num >= 1000000000) return (num / 1000000000).toFixed(2) + 'B'
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(2) + 'K'
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

async function handler(m, { sock }) {
    const db = getDatabase()
    
    let targetJid = m.sender
    let targetName = m.pushName || 'Usuario'
    
    if (m.quoted) {
        targetJid = m.quoted.sender
        targetName = m.quoted.pushName || targetJid.split('@')[0]
    } else if (m.mentionedJid?.length) {
        targetJid = m.mentionedJid[0]
        targetName = targetJid.split('@')[0]
    }
    
    const user = db.getUsuario(targetJid) || db.setUsuario(targetJid)
    const koinDisplay = formatKoin(user.koin || 0)
    
    const isSelf = targetJid === m.sender
    const statusText = config.isOwner(targetJid) ? 'Propietario' : user.isPremium ? 'Premium' : 'Libre'
    
    let text = `*¡Hola, buenas tardes!* ฅ^·ﻌ·^ฅ\n`
    text += `> _Consulta de saldo y monedas en el sistema ≽^• ˕ • ྀི≼_\n\n`
    
    text += `## ꕥ *W⍺gurı 𝖠ssı𝗌ƚ⍺nƚ* (*ᴗ͈ˬᴗ͈)ꕤ\n`
    text += `> 𝖪𝖮𝖨𝖭 𝖨𝖭𝖥𝖮𝖱𝖬𝖠𝖢𝖨Ó𝖭\n\n`
    
    text += `> Usuario: *${targetName}*\n`
    text += `> Mención: @${targetJid.split('@')[0]}\n`
    text += `> Saldo Koin: *${koinDisplay}* monedas\n`
    text += `> Estado de cuenta: *${statusText}*\n`
    
    if (isSelf) {
      text += `\n*〔 𝖲𝖧𝖮𝖯 𝖮𝖥𝖥𝖨𝖢𝖨𝖠𝖫 〕*\n`
      text += `> - \`.buyenergi <cant>\` (1 = 100 koin)\n`
      text += `> - \`.buyfitur\` (1 = 3000 koin)\n\n`
      text += `> _¡Participa en los juegos para conseguir más koin!_\n`
    }
    
    text += `\n> sɪᴍᴘʟᴇ ᴡʜᴀᴛsᴀᴘᴘ ʙᴏᴛ ツ`
    
    await m.reply(text, { mentions: [targetJid] })
}

export { pluginConfig as config, handler }
