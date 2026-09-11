import { getDatabase } from '../../src/lib/rimuru-database.js'
const pluginConfig = {
    name: 'addkoin',
    alias: ['tambahkoin', 'givekoin', 'addcoin', 'adddcoin'],
    category: 'owner',
    description: 'Añadir monedas a un usuario (máx. 9 billones)',
    usage: '.addkoin <cantidad> @usuario',
    example: '.addkoin 100000 @usuario',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
}

const MAX_KOIN = 9000000000000
function formatKoin(num) {
    if (num === -1) return '∞ Unlimited'
    if (num >= 1000000000000) return (num / 1000000000000).toFixed(2) + 'T'
    if (num >= 1000000000) return (num / 1000000000).toFixed(2) + 'B'
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(2) + 'K'
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const args = m.args || []

    const numArg = args.find(a => !isNaN(a) && !a.startsWith('@'))
    let amount = parseInt(numArg) || 0

    let targetJid = null
    if (m.quoted) {
        targetJid = m.quoted.sender
    } else if (m.mentionedJid?.length) {
        targetJid = m.mentionedJid[0]
    }

    if (!targetJid && amount > 0) {
        targetJid = m.sender
    }

    if (!targetJid || amount <= 0) {
        return m.reply(
            `💰 *ᴀñᴀᴅɪʀ ᴍᴏɴᴇᴅᴀs* 𓈒 ◌\n\n` +
            `ꕥ \`.addkoin <cantidad>\` — para ti mismo\n` +
            `ꕥ \`.addkoin <cantidad> @usuario\` — para otro usuario\n` +
            `ꕥ Máx: 9.000.000.000.000 (9T) ( ᴗ͈ˬᴗ͈ )\n\n` +
            `\`Ejemplo: ${m.prefix}addkoin 100000\``
        )
    }

    if (amount > MAX_KOIN) amount = MAX_KOIN

    const user = db.getUser(targetJid) || db.setUser(targetJid)

    if (user.koin === -1) {
        return m.reply(
            `💰 *ɪɴғᴏʀᴍᴀᴄɪóɴ* 𓈒 ◌\n` +
            `ꕥ @${targetJid.split('@')[0]} ya tiene monedas *∞ Ilimitadas*\n` +
            `✨ No es necesario añadir más ( ᴗ͈ˬᴗ͈ )`,
            { mentions: [targetJid] }
        )
    }

    const newKoin = db.updateKoin(targetJid, amount)

    await m.react('✅')
    await m.reply(
        `✅ ꕥ Se añadieron *${formatKoin(amount)}* monedas a *@${targetJid.split('@')[0]}* 𓈒 ◌🌸`,
        { mentions: [targetJid] }
    )
}

export { pluginConfig as config, handler }