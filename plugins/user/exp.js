import { getDatabase } from '../../src/lib/rimuru-database.js'
import { calculateLevel, getRole } from '../../src/lib/rimuru-level.js'

const pluginConfig = {
    name: 'exp',
    alias: ['cekexp', 'myexp', 'xp'],
    category: 'user',
    description: 'Consulta la experiencia (EXP) y nivel del usuario',
    usage: '.exp [@usuario]',
    example: '.exp',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
}

function formatNumber(num) {
    if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B'
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
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
    
    const user = db.getUser(targetJid) || db.setUser(targetJid)
    const expDisplay = formatNumber(user.exp || 0)
    const level = calculateLevel(user.exp || 0)
    const title = getRole(level)
    
    let text = `*¡Hola, buenas tardes!* ฅ^·ﻌ·^ฅ\n`
    text += `> _Consulta de experiencia y nivel en el sistema ≽^• ˕ • ྀི≼_\n\n`
    
    text += `## ꕥ *W⍺gurı 𝖠ssı𝗌ƚ⍺nƚ* (*ᴗ͈ˬᴗ͈)ꕤ\n`
    text += `> 𝖤𝖷𝖯𝖤𝖱𝖨𝖤𝖭𝖢𝖨𝖠 𝖨𝖭𝖥𝖮𝖱𝖬𝖠𝖢𝖨Ó𝖭\n\n`
    
    text += `> Usuario: *${targetName}*\n`
    text += `> Mención: @${targetJid.split('@')[0]}\n`
    text += `> Experiencia total: *${expDisplay}* XP\n`
    text += `> Nivel actual: *${level}*\n`
    text += `> Rango / Título: *${title}*\n\n`
    
    text += `> sɪᴍᴘʟᴇ ᴡʜᴀᴛsᴀᴘᴘ ʙᴏᴛ ツ`
    
    await m.reply(text, { mentions: [targetJid] })
}

export { pluginConfig as config, handler }
