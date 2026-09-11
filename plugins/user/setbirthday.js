import { getDatabase } from '../../src/lib/rimuru-database.js'
import config from '../../config.js'

const pluginConfig = {
    name: 'setbirthday',
    alias: ['setbday', 'setultah', 'settgl'],
    category: 'user',
    description: 'Establece tu fecha de cumpleaños',
    usage: '.setbirthday <DD-MM>',
    example: '.setbirthday 25-12',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

async function handler(m) {
    const db = getDatabase()
    const input = m.args?.[0]?.trim()
    const userJid = m.sender
    const cleanJid = userJid.replace(/@.+/g, '')
    
    if (!input) {
        const user = db.getUsuario(userJid)
        const currentBday = user?.birthday
        
        let text = `ꕥ *sᧉƚ bıɾƚhᑯ⍺y* (*ᴗ͈ˬᴗ͈)ꕤ\n\n`
        
        if (currentBday) {
            text += `> Tu cumpleaños: *${currentBday}*\n\n`
        }
        
        text += `╭┈┈⬡「 📋 *f𝗈r⍺m⍺ƚo* 」\n`
        text += `┃ ${m.prefix}setbirthday DD-MM\n`
        text += `╰┈┈┈┈┈┈┈┈⬡\n\n`
        text += `*Ejemplo:*\n`
        text += `> ${m.prefix}setbirthday 25-12\n`
        text += `> ${m.prefix}setbirthday 01-01`
        
        return m.reply(text)
    }
    
    const dateRegex = /^(\d{1,2})[-\/](\d{1,2})$/
    const match = input.match(dateRegex)
    
    if (!match) {
        return m.reply(`ꕥ *𝖶⍺𝗀uɾı 𝖭oƚıɔᧉ* (*ᴗ͈ˬᴗ͈)ꕤ\n\n> ¡Formato incorrecto! Usa: DD-MM\n\n> Ejemplo: ${m.prefix}setbirthday 25-12`)
    }
    
    const day = parseInt(match[1])
    const month = parseInt(match[2])
    
    if (month < 1 || month > 12) {
        return m.reply(`ꕥ *𝖶⍺𝗀uɾı 𝖭oƚıɔᧉ* (*ᴗ͈ˬᴗ͈)ꕤ\n\n> ¡Mes no válido! (1-12)`)
    }
    
    const daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    if (day < 1 || day > daysInMonth[month - 1]) {
        return m.reply(`ꕥ *𝖶⍺𝗀uɾı 𝖭oƚıɔᧉ* (*ᴗ͈ˬᴗ͈)ꕤ\n\n> ¡Fecha no válida para el mes ${month}!`)
    }
    
    const formattedDate = `${day.toString().padStart(2, '0')}-${month.toString().padStart(2, '0')}`
    
    db.setUsuario(m.sender, { 
        birthday: formattedDate 
    })
    
    await db.save()
    
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
    
    await m.reply(
        `ꕥ *bıɾƚhᑯ⍺y ɡu⍺rd⍺do* (*ᴗ͈ˬᴗ͈)ꕤ\n\n` +
        `╭┈┈⬡「 📋 *dᧉƚ⍺llᧉ* 」\n` +
        `┃ Fecha: *${day} de ${months[month - 1]}*\n` +
        `┃ Usuario: @${cleanJid}\n` +
        `╰┈┈┈┈┈┈┈┈⬡\n\n` +
        `> ¡El bot te felicitará\n` +
        `> en tu día especial!`,
        { mentions: [userJid] }
    )
}

export { pluginConfig as config, handler }
