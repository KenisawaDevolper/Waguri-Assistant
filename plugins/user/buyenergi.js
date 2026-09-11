import { getDatabase } from '../../src/lib/rimuru-database.js'

const pluginConfig = {
    name: 'comprarenergia',
    alias: ['buyenergi', 'belienergi', 'purchaseenergi', 'buyenergy'],
    category: 'usuario',
    description: 'Compra energía con monedas (1 energía = 100 monedas)',
    usage: '.comprarenergia <cantidad>',
    example: '.comprarenergia 10',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

const PRICE_PER_ENERGI = 100

function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const amount = parseInt(m.args[0]) || 0
    
    if (amount <= 0) {
        const user = db.getUsuario(m.sender) || db.setUsuario(m.sender)
        
        return m.reply(
            `*¡Hola, buenas tardes!* ฅ^·ﻌ·^ฅ\n` +
            `> _Compra de energía ≽^• ˕ • ྀི≼_\n\n` +
            `## ꕥ *W⍺gurı 𝖠ssı𝗌ƚ⍺nƚ* (*ᴗ͈ˬᴗ͈)ꕤ\n` +
            `> 𝖢𝖮𐌌𝖯𝖱𝖠 𝖣𝖤 𝖤𝖭𝖤𝖱𝖦Í𝖠\n\n` +
            `╭┈┈⬡「 💰 *ɪɴꜰᴏ* 」\n` +
            `┃ 💵 𝖯𝖱𝖤𝖢𝖨𝖮: *${PRICE_PER_ENERGI}* monedas/energía\n` +
            `┃ 💰 𝖳𝖴𝖲 𝖬𝖮𝖭𝖤𝖣𝖠𝖲: *${formatNumber(user.koin || 0)}*\n` +
            `╰┈┈⬡\n\n` +
            `> Uso: \`${m.prefix}comprarenergia <cantidad>\`\n` +
            `> Ejemplo: \`${m.prefix}comprarenergia 10\`\n\n` +
            `> sɪᴍᴘʟᴇ ᴡʜᴀᴛsᴀᴘᴘ ʙᴏᴛ ツ`
        )
    }
    
    const totalPrice = amount * PRICE_PER_ENERGI
    const user = db.getUsuario(m.sender) || db.setUsuario(m.sender)
    
    if ((user.koin || 0) < totalPrice) {
        return m.reply(
            `*¡Hola, buenas tardes!* ฅ^·ﻌ·^ฅ\n` +
            `> _Error de compra ≽^• ˕ • ྀི≼_\n\n` +
            `## ꕥ *W⍺gurı 𝖠ssı𝗌ƚ⍺nƚ* (*ᴗ͈ˬᴗ͈)ꕤ\n` +
            `> 𝖬𝖮𝖭𝖤𝖣𝖠𝖲 𝖨𝖭𝖲𝖴𝖥𝖨𝖢𝖨𝖤𝖭𝖳𝖤𝖲\n\n` +
            `> Error: ¡No tienes suficientes monedas!\n` +
            `> Necesitas: *${formatNumber(totalPrice)}*\n` +
            `> Tienes: *${formatNumber(user.koin || 0)}*\n\n` +
            `> sɪᴍᴘʟᴇ ᴡʜᴀᴛsᴀᴘᴘ ʙᴏᴛ ツ`
        )
    }
    
    db.updateKoin(m.sender, -totalPrice)
    
    if (user.energi === -1) {
        m.react('✅')
        return m.reply(
            `*¡Hola, buenas tardes!* ฅ^·ﻌ·^ฅ\n` +
            `> _Compra exitosa ≽^• ˕ • ྀི≼_\n\n` +
            `## ꕥ *W⍺gurı 𝖠ssı𝗌ƚ⍺nƚ* (*ᴗ͈ˬᴗ͈)ꕤ\n` +
            `> 𝖤𝖭𝖤𝖱𝖦Í𝖠 𝖨𝖭𝖫𝖨𝖬𝖨𝖳𝖠𝖣𝖠\n\n` +
            `> Aviso: ¡Ya tienes energía ilimitada!\n` +
            `> Tus monedas han sido devueltas.\n\n` +
            `> sɪᴍᴘʟᴇ ᴡʜᴀᴛsᴀᴘᴘ ʙᴏᴛ ツ`
        )
    }
    
    const newEnergi = db.updateEnergi(m.sender, amount)
    const newKoin = db.getUsuario(m.sender).koin
    
    m.react('✅')
    
    await m.reply(
        `*¡Hola, buenas tardes!* ฅ^·ﻌ·^ฅ\n` +
        `> _Compra exitosa ≽^• ˕ • ྀི≼_\n\n` +
        `## ꕥ *W⍺gurı 𝖠ssı𝗌ƚ⍺nƚ* (*ᴗ͈ˬᴗ͈)ꕤ\n` +
        `> 𝖢𝖮𐌌𝖯𝖱𝖠 𝖣𝖤 𝖤𝖭𝖤𝖱𝖦Í𝖠 𝖤𝖷𝖨𝖳𝖮𝖲𝖠\n\n` +
        `╭┈┈⬡「 📋 *𝖣𝖤𝖳𝖠𝖫𝖫𝖤* 」\n` +
        `┃ ⚡ 𝖤𝖭𝖤𝖱𝖦Í𝖠: *+${formatNumber(amount)}*\n` +
        `┃ 💵 𝖯𝖱𝖤𝖢𝖨𝖮: *-${formatNumber(totalPrice)}* monedas\n` +
        `╰┈┈⬡\n\n` +
        `╭┈┈⬡「 💰 *𝖲𝖠𝖫𝖣𝖮* 」\n` +
        `┃ ⚡ 𝖤𝖭𝖤𝖱𝖦Í𝖠: *${formatNumber(newEnergi)}*\n` +
        `┃ 💰 𝖬𝖮𝖭𝖤𝖣𝖠𝖲: *${formatNumber(newKoin)}*\n` +
        `╰┈┈⬡\n\n` +
        `> sɪᴍᴘʟᴇ ᴡʜᴀᴛsᴀᴘᴘ ʙᴏᴛ ツ`
    )
}

export { pluginConfig as config, handler }
