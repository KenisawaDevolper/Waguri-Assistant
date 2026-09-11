import config from '../../config.js'
import { getDatabase } from '../../src/lib/rimuru-database.js'

const pluginConfig = {
    name: 'botmode',
    alias: ['setmode', 'mode'],
    category: 'owner',
    description: 'Configura el modo del bot (md/cpanel/store/pushkontak/all) con la estética Waguri Assistant ⚙️',
    usage: '.botmode <mode>',
    example: '.botmode store',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
}

const VALID_MODES = ['md', 'cpanel', 'store', 'pushkontak', 'otp', 'all']

const MODE_DESCRIPTIONS = {
    md: 'Modo default, todos fitur kecuali panel/store/pushkontak',
    cpanel: 'Modo panel, main + group + sticker + owner + tools + panel',
    store: 'Modo store manual, main + group + sticker + owner + store',
    pushkontak: 'Modo pushkontak, main + group + sticker + owner + pushkontak',
    otp: 'Modo OTP service, main + group + sticker + owner + otp',
    all: 'Modo full, SEMUA fitur dari todos mode bisa diakses'
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const args = m.args || []
    
    let mode = (args[0] || '').toLowerCase()
    const flags = args.slice(1).map(f => f.toLowerCase())
    const globalModo = db.setting('botModo') || 'all'
    const groupData = m.isGroup ? (db.getGroup(m.chat) || {}) : {}
    const groupModo = groupData.botModo || null
    
    if (!mode) {
        let txt = `╭┈┈⬡「 🤖 *ʙᴏᴛ ᴍᴏᴅᴇ* 」\n`
        txt += `┃ ㊗ ɢʟᴏʙᴀʟ: *${globalModo.toUpperCase()}*\n`
        
        if (m.isGroup) {
            txt += `┃ ㊗ ɢʀᴜᴘ: *${(groupModo || 'INHERIT').toUpperCase()}*\n`
        }
        txt += `╰┈┈⬡\n\n`
        
        txt += `╭┈┈⬡「 📋 *ᴀᴠᴀɪʟᴀʙʟᴇ ᴍᴏᴅᴇs* 」\n`
        
        const currentModo = m.isGroup ? (groupModo || globalModo) : globalModo
        
        for (const [key, desc] of Object.entries(MODE_DESCRIPTIONS)) {
            const isActive = key === currentModo ? ' ✅' : ''
            txt += `┃ ㊗ *${key.toUpperCase()}*${isActive}\n`
            txt += `┃   ${desc}\n`
        }
        txt += `╰┈┈⬡\n\n`
        
        txt += `*ꜰʟᴀɢ sᴛᴏʀᴇ:*\n`
        txt += `> \`${m.prefix}botmode store\` - Manual order\n`
        txt += `> \`${m.prefix}botmode md\` → Modo default\n`
        txt += `> \`${m.prefix}botmode all\` → Semua fitur`
        
        await m.reply(txt)
        return
    }

    if (!VALID_MODES.includes(mode)) {
        return m.reply(
            `❌ *ᴍᴏᴅᴇ ᴛɪᴅᴀᴋ ᴠᴀʟɪᴅ*\n\n` +
            `> Modo tersedia: \`${VALID_MODES.join(', ')}\``
        )
    }

    if (m.isGroup) {
        const newGroupData = {
            ...groupData,
            botModo: mode
        }

        if (mode === 'store') {
            newGroupData.storeConfig = {
                ...(groupData.storeConfig || {}),
                products: groupData.storeConfig?.products || []
            }
        }

        db.setGroup(m.chat, newGroupData)
    } else {
        db.setting('botModo', mode)
    }

    db.save()
    await m.react('✅')

    let extraInfo = ''
    if (mode === 'store' && m.isGroup) {
        extraInfo = `\n\n📋 *Manual mode*\n> Admin perlu confirm order manual`
    }

    await m.reply(
        `✅ *ᴍᴏᴅᴇ ᴅɪᴜʙᴀʜ*\n\n` +
        `> Modo: *${mode.toUpperCase()}*\n` +
        `> ${MODE_DESCRIPTIONS[mode]}\n` +
        extraInfo +
        `\n\n` +
        (m.isGroup ? `> _Modo grup ini juga diubah._` : `> _Modo global diubah._`)
    )

    console.log(`[BotModo] Changed to ${mode.toUpperCase()} by ${m.pushName} (${m.sender})`)
}

export { pluginConfig as config, handler, VALID_MODES, MODE_DESCRIPTIONS }