import { getDatabase } from '../../src/lib/rimuru-database.js'
import config from '../../config.js'

const pluginConfig = {
    name: 'cumpleanos',
    alias: ['bday', 'ultah', 'ulangtahun', 'cumple', 'cumpleanos'],
    category: 'usuario',
    description: 'Ver el cumpleaños de un miembro',
    usage: '.cumpleanos [@usuario]',
    example: '.cumpleanos @usuario',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const target = m.mentionedJid?.[0] || m.quoted?.sender || m.sender
    const cleanJid = target.replace(/@.+/g, '')
    const db = getDatabase()
    const user = db.getUser(target)
    
    if (!user?.birthday) {
        if (target === m.sender) {
            return m.reply(
                `*¡Hola, buenas tardes!* ฅ^·ﻌ·^ฅ\n` +
                `> _Información de cumpleaños ≽^• ˕ • ྀི≼_\n\n` +
                `## ꕥ *W⍺gurı 𝖠ssı𝗌ƚ⍺nƚ* (*ᴗ͈ˬᴗ͈)ꕤ\n` +
                `> 𝖲𝖨𝖭 𝖢𝖴𝖬𝖯𝖫𝖤𝖠Ñ𝖮𝖲 𝖱𝖤𝖦𝖨𝖲𝖳𝖱𝖠𝖣𝖮\n\n` +
                `> Aviso: ¡Aún no has registrado tu cumpleaños!\n` +
                `> Usa: \`${m.prefix}setcumple DD-MM\`\n` +
                `> Ejemplo: \`${m.prefix}setcumple 25-12\`\n\n` +
                `> sɪᴍᴘʟᴇ ᴡʜᴀᴛsᴀᴘᴘ ʙᴏᴛ ツ`
            )
        }
        return m.reply(
            `*¡Hola, buenas tardes!* ฅ^·ﻌ·^ฅ\n` +
            `> _Información de cumpleaños ≽^• ˕ • ྀི≼_\n\n` +
            `## ꕥ *W⍺gurı 𝖠ssı𝗌ƚ⍺nƚ* (*ᴗ͈ˬᴗ͈)ꕤ\n` +
            `> 𝖲𝖨𝖭 𝖢𝖴𝖬𝖯𝖫𝖤𝖠Ñ𝖮𝖲 𝖱𝖤𝖦𝖨𝖲𝖳𝖱𝖠𝖣𝖮\n\n` +
            `> Aviso: ¡El usuario aún no ha registrado su cumpleaños!\n\n` +
            `> sɪᴍᴘʟᴇ ᴡʜᴀᴛsᴀᴘᴘ ʙᴏᴛ ツ`
        )
    }
    
    const [day, month] = user.birthday.split('-').map(Number)
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
    
    const now = new Date()
    const currentYear = now.getFullYear()
    let nextBday = new Date(currentYear, month - 1, day)
    
    if (nextBday < now) {
        nextBday = new Date(currentYear + 1, month - 1, day)
    }
    
    const diffTime = nextBday.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    const isToday = now.getDate() === day && now.getMonth() === month - 1
    
    let text = `*¡Hola, buenas tardes!* ฅ^·ﻌ·^ฅ\n` +
    `> _Información de cumpleaños ≽^• ˕ • ྀི≼_\n\n` +
    `## ꕥ *W⍺gurı 𝖠ssı𝗌ƚ⍺nƚ* (*ᴗ͈ˬᴗ͈)ꕤ\n` +
    `> 𝖨𝖭𝖥𝖮𝖱𝖬𝖠𝖢𝖨Ó𝖭 𝖣𝖤 𝖢𝖴𝖬𝖯𝖫𝖤𝖠Ñ𝖮𝖲\n\n` +
    `╭┈┈⬡「 👤 *𝖴𝖲𝖴𝖠𝖱𝖨𝖮* 」\n` +
    `┃ 🏷️ @${cleanJid}\n` +
    `┃ 📅 ${day} de ${months[month - 1]}\n`
    
    if (isToday) {
        text += `┃ 🎉 *¡ES SU CUMPLEAÑOS HOY!*\n`
    } else {
        text += `┃ 🕕 Faltan ${diffDays} días\n`
    }
    
    text += `╰┈┈┈┈┈┈┈┈⬡`
    
    if (isToday) {
        text += `\n\n🎊 *¡FELIZ CUMPLEAÑOS!* 🎊\n` +
        `> ¡Te deseamos mucha salud,\n` +
        `> prosperidad y éxito siempre! 🎉🎂`
    }
    
    text += `\n\n> sɪᴍᴘʟᴇ ᴡʜᴀᴛsᴀᴘᴘ ʙᴏᴛ ツ`
    
    await m.reply(text, { mentions: [target] })
}

export { pluginConfig as config, handler }
