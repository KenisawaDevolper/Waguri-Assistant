import { getDatabase } from '../../src/lib/rimuru-database.js'
import * as levelHelper from '../../src/lib/rimuru-level.js'
const pluginConfig = {
    name: 'addexp',
    alias: ['tambahexp', 'giveexp', 'addxp'],
    category: 'owner',
    description: 'Añadir experiencia a un usuario (máx. 9 mil millones)',
    usage: '.addexp <cantidad> @usuario',
    example: '.addexp 10000 @usuario',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
}

const MAX_EXP = 9000000000

function formatNumber(num) {
    if (num >= 1000000000) return (num / 1000000000).toFixed(2) + 'B'
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(2) + 'K'
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

function extractTarget(m) {
    if (m.quoted) return m.quoted.sender
    if (m.mentionedJid?.length) return m.mentionedJid[0]
    return null
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const args = m.args
    
    const numArg = args.find(a => !isNaN(a) && !a.startsWith('@'))
    let amount = parseInt(numArg) || 0
    
    let targetJid = await extractTarget(m)
    
    if (!targetJid && amount > 0) {
        targetJid = m.sender
    }
    
    if (!targetJid || amount <= 0) {
        return m.reply(
            `⭐ *ᴀñᴀᴅɪʀ ᴇxᴘ* 𓈒 ◌\n\n` +
            `ꕥ \`.addexp <cantidad>\` — para ti mismo\n` +
            `ꕥ \`.addexp <cantidad> @usuario\` — para otro usuario\n` +
            `ꕥ Máx: 9.000.000.000 (9B)  ( ᴗ͈ˬᴗ͈ )\n\n` +
            `\`Ejemplo: ${m.prefix}addexp 10000\``
        )
    }
    
    if (amount <= 0) {
        return m.reply(`❌ ꕥ La cantidad de experiencia debe ser mayor que 0`)
    }
    
    if (amount > MAX_EXP) {
        amount = MAX_EXP
    }
    
    const user = db.getUser(targetJid) || db.setUser(targetJid)
 
    await levelHelper.addExpWithLevelCheck(sock, m, db, user, amount)
    
    await m.react('✅')
    
    await m.reply(
        `✅ ꕥ Se añadieron *${formatNumber(amount)}* de experiencia a *@${targetJid.split('@')[0]}* 𓈒 ◌✨`,
        { mentions: [targetJid] }
    )
}

export { pluginConfig as config, handler }