import config from '../../config.js'
import { getDatabase } from '../../src/lib/rimuru-database.js'

const pluginConfig = {
    name: 'energy',
    alias: ['cekenergi', 'myenergi', 'limit', 'ceklimit'],
    category: 'user',
    description: 'Consulta la energía y límites disponibles del usuario',
    usage: '.energy [@usuario]',
    example: '.energy',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
}

function formatNumber(num) {
    if (num === -1) return '∞ Ilimitado'
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
    const isOwner = config.owner?.number?.includes(targetJid.replace(/[^0-9]/g, '')) || config.isOwner?.(targetJid)

    const dbToggle = db.setting('energi')
    const energiEnabled = dbToggle !== undefined ? dbToggle : (config.energi?.enabled !== false)

    let finalEnergi
    if (!energiEnabled || isOwner) {
        finalEnergi = -1
    } else if (user.isPremium) {
        finalEnergi = user.energi ?? config.energi?.premium ?? 100
    } else {
        finalEnergi = user.energi ?? config.energi?.default ?? 25
    }

    const isUnlimited = finalEnergi === -1
    const energiDisplay = formatNumber(finalEnergi)
    
    const isSelf = targetJid === m.sender
    
    let userStatus = 'Libre'
    if (isOwner) userStatus = 'Propietario'
    else if (user.isPremium) userStatus = 'Premium'
    if (!energiEnabled) userStatus += ' (Sistema Inactivo)'
    
    let text = `*¡Hola, buenas tardes!* ฅ^·ﻌ·^ฅ\n`
    text += `> _Consulta de energía y límites en el sistema ≽^• ˕ • ྀི≼_\n\n`
    
    text += `## ꕥ *W⍺gurı 𝖠ssı𝗌ƚ⍺nƚ* (*ᴗ͈ˬᴗ͈)ꕤ\n`
    text += `> 𝖤𝖭𝖤𝖱𝖦𝖨 𝖨𝖭𝖥𝖮𝖱𝖬𝖠𝖢𝖨Ó𝖭\n\n`
    
    text += `> Usuario: *${targetName}*\n`
    text += `> Mención: @${targetJid.split('@')[0]}\n`
    text += `> Energía disponible: *${energiDisplay}*\n`
    text += `> Estado de cuenta: *${userStatus}*\n\n`
    
    if (!energiEnabled) {
        text += `> Aviso: El sistema de energía está desactivado — todos los comandos son gratuitos.\n`
    } else if (isSelf && !isUnlimited && finalEnergi < 10) {
        text += `> Aviso: ¡Tu energía está a punto de agotarse!\n`
        text += `> Usa \`.buyenergi\` para recargar más.\n`
    } else if (isUnlimited) {
        text += `> Aviso: ¡La energía ilimitada se encuentra activa!\n`
    }
    
    text += `\n> sɪᴍᴘʟᴇ ᴡʜᴀᴛsᴀᴘᴘ ʙᴏᴛ ツ`
    
    await m.reply(text, { mentions: [targetJid] })
}

export { pluginConfig as config, handler }
