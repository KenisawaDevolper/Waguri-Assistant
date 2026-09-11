import config from '../../config.js'
import { getDatabase } from '../../src/lib/rimuru-database.js'
const pluginConfig = {
    name: 'addenergi',
    alias: ['tambahenergi', 'giveenergi', 'addenergy'],
    category: 'owner',
    description: 'Añade energía a un usuario con la estética Waguri Assistant',
    usage: '.addenergi <cantidad> @user',
    example: '.addenergi 100 @user',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
}

function formatNumber(num) {
    if (num === -1) return '∞ Unlimited'
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const args = m.args || []

    let amount = 0
    let isUnlimited = false
    let targetJid = null

    if (m.text?.toLowerCase().includes('--unlimited') || m.text?.toLowerCase().includes('--unli')) {
        isUnlimited = true
    }

    const numArg = args.find(a => !isNaN(a) && !a.includes('@') && !a.startsWith('-'))
    if (numArg) amount = parseInt(numArg)

    if (m.quoted) {
        targetJid = m.quoted.sender
    } else if (m.mentionedJid?.length) {
        targetJid = m.mentionedJid[0]
    } else {
        const phoneArg = args.find(a => a !== numArg && a.length > 5 && /^\d+$/.test(a.replace(/[^0-9]/g, '')))
        if (phoneArg) {
            targetJid = phoneArg.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
        }
    }

    if (!targetJid && (amount > 0 || isUnlimited)) {
        targetJid = m.sender
    }

    if (!targetJid || (!isUnlimited && amount <= 0)) {
        return m.reply(
            `ꕥ 𝖠𝖣𝖣 𝖤𝖭𝖤𝖱𝖦𝖨 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `      𓈒 ◌ㅤ──    *𝖬𝖮𝖣𝖮 𝖣𝖤 𝖴𝖲𝖮*\n` +
            `      • \`${m.prefix}addenergi <cantidad>\` — Para ti mism@\n` +
            `      • \`${m.prefix}addenergi <cantidad> @user\` — Para otro usuario\n` +
            `      • \`${m.prefix}addenergi --unlimited\` — Energía ilimitada\n\n` +
            `      𓈒 ◌ㅤ──    *𝖤𝖩𝖤𝖬𝖯𝖫𝖮*\n` +
            `      • \`${m.prefix}addenergi 100\` ( ᴗ͈ˬᴗ͈ )\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        )
    }

    const user = db.getUser(targetJid) || db.setUser(targetJid)

    const effectiveUnlimited = user.energi === -1 ||
        (config.isOwner(targetJid) && (config.energi?.owner ?? -1) === -1) ||
        (config.isPremium(targetJid) && (config.energi?.premium ?? -1) === -1)

    if (!isUnlimited && effectiveUnlimited) {
        return m.reply(
            `ꕥ 𝖨𝖭𝖥𝖮𝖱𝖬𝖠𝖢𝖨𝖮𝖭 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « @${targetJid.split('@')[0]} ya posee energía *∞ Unlimited*, no necesita más ✨ »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`,
            { mentions: [targetJid] }
        )
    }

    if (isUnlimited) {
        db.setUser(targetJid, { energi: -1 })

        await m.react('✅')
        await m.reply(
            `ꕥ 𝖤𝖭𝖤𝖱𝖦𝖨𝖠 𝖨𝖫𝖨𝖬𝖨𝖳𝖠𝖣𝖠 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `      𓈒 ◌ㅤ──    *𝖨𝖭𝖥𝖮𝖱𝖬𝖠𝖢𝖨𝖮𝖭*\n` +
            `      • Usuario :: @${targetJid.split('@')[0]}\n` +
            `      • Estado :: ∞ Unlimited 🌸\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`,
            { mentions: [targetJid] }
        )
    } else {
        const newEnergi = db.updateEnergi(targetJid, amount)

        await m.react('✅')
        await m.reply(
            `ꕥ 𝖤𝖭𝖤𝖱𝖦𝖨𝖠 𝖠𝖭̃𝖠𝖣𝖨𝖣𝖠 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `      𓈒 ◌ㅤ──    *𝖨𝖭𝖥𝖮𝖱𝖬𝖠𝖢𝖨𝖮𝖭*\n` +
            `      • Usuario :: @${targetJid.split('@')[0]}\n` +
            `      • Añadido :: *${formatNumber(amount)}* ✨\n` +
            `      • Total :: *${formatNumber(newEnergi)}* 🌸\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`,
            { mentions: [targetJid] }
        )
    }
}

export { pluginConfig as config, handler }