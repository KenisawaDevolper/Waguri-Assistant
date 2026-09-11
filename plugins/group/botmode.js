import { getDatabase } from '../../src/lib/rimuru-database.js'
const pluginConfig = {
    name: 'botmode',
    alias: ['setmode', 'mode'],
    category: 'group',
    description: 'Atur mode bot untuk grup ini',
    usage: '.botmode <md/cpanel/pushkontak/store/otp/all>',
    example: '.botmode store',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

const MODES = {
    md: {
        name: 'Multi-Device',
        desc: 'Modo default con todos fitur standar',
        allowedCategories: null,
        excludeCategories: ['cpanel', 'pushkontak', 'store']
    },
    all: {
        name: 'All Features',
        desc: 'Semua fitur dari todos mode bisa diakses',
        allowedCategories: null,
        excludeCategories: null
    },
    cpanel: {
        name: 'CPanel Pterodactyl',
        desc: 'Modo khusus untuk panel server',
        allowedCategories: ['main', 'group', 'sticker', 'owner', 'tools', 'panel'],
        excludeCategories: null
    },
    pushkontak: {
        name: 'Push Kontak',
        desc: 'Modo khusus untuk push kontak ke member',
        allowedCategories: ['owner', 'main', 'group', 'sticker', 'pushkontak'],
        excludeCategories: null
    },
    store: {
        name: 'Store/Toko',
        desc: 'Modo khusus untuk toko manual',
        allowedCategories: ['main', 'group', 'sticker', 'owner', 'store'],
        excludeCategories: null
    },
    otp: {
        name: 'OTP Service',
        desc: 'Modo layanan OTP otomatis',
        allowedCategories: ['main', 'group', 'sticker', 'owner', 'otp'],
        excludeCategories: null
    }
}

function handler(m, { sock }) {
    const db = getDatabase()
    const args = m.args || []
    let mode = (args[0] || '').toLowerCase()
    const flags = args.slice(1).map(f => f.toLowerCase())

    const groupData = db.getGroup(m.chat) || {}
    const currentModo = groupData.botModo || 'all'

    if (!mode) {
        let modeList = ''
        for (const [key, val] of Object.entries(MODES)) {
            const isCurrent = key === currentModo ? ' ⬅️' : ''
            modeList += `┃ \`${m.prefix}botmode ${key}\`${isCurrent}\n`
            modeList += `┃ └ ${val.desc}\n`
        }

        return m.reply(
            `🔧 *ʙᴏᴛ ᴍᴏᴅᴇ*\n\n` +
            `> Modo saat ini: *${currentModo.toUpperCase()}* (${MODES[currentModo]?.name || 'Unknown'})\n` +
            `\n╭─「 📋 *ᴘɪʟɪʜᴀɴ* 」\n` +
            `${modeList}` +
            `╰───────────────\n\n` +
            `*ꜰʟᴀɢ sᴛᴏʀᴇ:*\n` +
            `> \`${m.prefix}botmode store\` - Manual order\n\n` +
            `> _Pengaturan per-grup_`
        )
    }

    if (!Object.keys(MODES).includes(mode)) {
        return m.reply(`❌ Modo no valid. Pilihan: \`${Object.keys(MODES).join(', ')}\``)
    }



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
    db.save()

    m.react('✅')

    let extraInfo = ''
    if (mode === 'store') {
        const products = newGroupData.storeConfig?.products || []
        extraInfo = `\n\n📋 *Manual mode*\n` +
            `> Admin perlu confirm order manual\n` +
            `> Product: \`${products.length}\` item\n\n` +
            `*ᴘᴀɴᴅᴜᴀɴ:*\n` +
            `> \`${m.prefix}addprod <kode> <harga> <nama>\`\n` +
            `> \`${m.prefix}listprod\` - Lihat produk`
    }

    return m.reply(
        `✅ *ᴍᴏᴅᴇ ᴅɪᴜʙᴀʜ*\n\n` +
        `> Modo: *${mode.toUpperCase()}* (${MODES[mode].name})\n` +
        `> Grupo: *${m.chat.split('@')[0]}*\n` +
        extraInfo +
        `\n\n> Ketik \`${m.prefix}menu\` untuk melihat menu.`
    )
}

function getGroupModo(chatJid, db) {
    const globalModo = db.setting('botModo') || 'all'
    if (!chatJid?.endsWith('@g.us')) return globalModo
    const groupData = db.getGroup(chatJid) || {}
    return groupData.botModo || globalModo
}

function getModoCategories(mode) {
    const modeConfig = MODES[mode] || MODES.md
    return {
        allowed: modeConfig.allowedCategories,
        excluded: modeConfig.excludeCategories
    }
}

function filterCategoriesByModo(categories, mode) {
    const modeConfig = MODES[mode] || MODES.md

    if (modeConfig.allowedCategories) {
        return categories.filter(cat => modeConfig.allowedCategories.includes(cat.toLowerCase()))
    }

    if (modeConfig.excludeCategories) {
        return categories.filter(cat => !modeConfig.excludeCategories.includes(cat.toLowerCase()))
    }

    return categories
}

export { pluginConfig as config, handler, getGroupModo, getModoCategories, filterCategoriesByModo, MODES }