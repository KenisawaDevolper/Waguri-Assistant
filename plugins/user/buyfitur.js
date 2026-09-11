import { getDatabase } from '../../src/lib/rimuru-database.js'
import config from '../../config.js'

const pluginConfig = {
    name: 'buyfitur',
    alias: ['belifitur', 'purchasefeature', 'buyfeature'],
    category: 'user',
    description: 'Compra funciones premium (1 función = 3000 monedas)',
    usage: '.buyfitur [nombre_funcion]',
    example: '.buyfitur sticker',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

const PRICE_PER_FEATURE = 3000

const PREMIUM_FEATURES = [
    { id: 'sticker', name: 'Stickers Ilimitados', desc: 'Comandos de stickers sin límite' },
    { id: 'downloader', name: 'Descargador Pro', desc: 'Descargas sin límites' },
    { id: 'ai', name: 'Acceso IA', desc: 'Acceso a funciones de IA premium' },
    { id: 'tools', name: 'Herramientas Avanzadas', desc: 'Herramientas exclusivas' },
    { id: 'game', name: 'Bono de Juegos', desc: 'Recompensas de juegos al doble (2x)' }
]

function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const user = db.getUsuario(m.sender) || db.setUsuario(m.sender)
    const featureName = m.args[0]?.toLowerCase()
    
    if (user.isPremium || config.isPremium(m.sender)) {
        return m.reply(
            `*¡Hola, buenas tardes!* ฅ^·ﻌ·^ฅ\n` +
            `> _Estado de usuario ≽^• ˕ • ྀི≼_\n\n` +
            `## ꕥ *W⍺gurı 𝖠ssı𝗌ƚ⍺nƚ* (*ᴗ͈ˬᴗ͈)ꕤ\n` +
            `> 𝖴𝖲𝖴𝖠𝖱𝖨𝖮 𝖯𝖱𝖤𝖬𝖨𝖴𝖬\n\n` +
            `> ¡Ya cuentas con una suscripción premium!\n` +
            `> Todas las funciones ya están desbloqueadas.\n\n` +
            `> sɪᴍᴘʟᴇ ᴡʜᴀᴛsᴀᴘᴘ ʙᴏᴛ ツ`
        )
    }
    
    if (!featureName) {
        const unlockedFeatures = user.unlockedFeatures || []
        
        let text = `*¡Hola, buenas tardes!* ฅ^·ﻌ·^ฅ\n` +
            `> _Tienda de funciones ≽^• ˕ • ྀི≼_\n\n` +
            `## ꕥ *W⍺gurı 𝖠ssı𝗌ƚ⍺nƚ* (*ᴗ͈ˬᴗ͈)ꕤ\n` +
            `> 𝖢𝖮𝖬𝖯𝖱𝖠 𝖣𝖤 𝖥𝖨𝖳𝖴𝖱𝖠𝖲\n\n` +
            `> Precio: *${formatNumber(PRICE_PER_FEATURE)}* monedas / función\n` +
            `> Monedas disponibles: *${formatNumber(user.koin || 0)}*\n\n` +
            `> [FUNCIONES PREMIUM DISPONIBLES]\n`
        
        for (const feature of PREMIUM_FEATURES) {
            const isUnlocked = unlockedFeatures.includes(feature.id)
            const status = isUnlocked ? 'Desbloqueado' : 'Bloqueado'
            text += `> - *${feature.name}* [${status}]\n` +
                    `>   Descripción: _${feature.desc}_\n` +
                    `>   ID de comando: \`${feature.id}\`\n\n`
        }
        
        text += `> Uso del comando: \`.buyfitur <id>\`\n` +
                `> O adquiere el rango *Premium* para desbloquearlas todas.\n\n` +
                `> sɪᴍᴘʟᴇ ᴡʜᴀᴛsᴀᴘᴘ ʙᴏᴛ ツ`
        
        await m.reply(text)
        return
    }
    
    const feature = PREMIUM_FEATURES.find(f => f.id === featureName)
    
    if (!feature) {
        return m.reply(
            `*¡Hola, buenas tardes!* ฅ^·ﻌ·^ฅ\n` +
            `> _Error de compra ≽^• ˕ • ྀི≼_\n\n` +
            `## ꕥ *W⍺gurı 𝖠ssı𝗌ƚ⍺nƚ* (*ᴗ͈ˬᴗ͈)ꕤ\n` +
            `> 𝖥𝖨𝖳𝖴𝖱𝖠 𝖭𝖮 𝖤𝖭𝖢𝖮𝖭𝖳𝖱𝖠𝖣𝖠\n\n` +
            `> Error: La función \`${featureName}\` no existe.\n` +
            `> Escribe \`.buyfitur\` para ver el catálogo disponible.\n\n` +
            `> sɪᴍᴘʟᴇ ᴡʜᴀᴛsᴀᴘᴘ ʙᴏᴛ ツ`
        )
    }
    
    const unlockedFeatures = user.unlockedFeatures || []
    
    if (unlockedFeatures.includes(feature.id)) {
        return m.reply(
            `*¡Hola, buenas tardes!* ฅ^·ﻌ·^ฅ\n` +
            `> _Aviso de compra ≽^• ˕ • ྀི≼_\n\n` +
            `## ꕥ *W⍺gurı 𝖠ssı𝗌ƚ⍺nƚ* (*ᴗ͈ˬᴗ͈)ꕤ\n` +
            `> 𝖥𝖨𝖳𝖴𝖱𝖠 𝖸𝖠 𝖣𝖤𝖲𝖡𝖫𝖮𝖰𝖴𝖤𝖠𝖣𝖠\n\n` +
            `> Aviso: La función \`${feature.name}\` ya se encuentra desbloqueada en tu cuenta.\n\n` +
            `> sɪᴍᴘʟᴇ ᴡʜᴀᴛsᴀᴘᴘ ʙᴏᴛ ツ`
        )
    }
    
    if ((user.koin || 0) < PRICE_PER_FEATURE) {
        return m.reply(
            `*¡Hola, buenas tardes!* ฅ^·ﻌ·^ฅ\n` +
            `> _Saldo insuficiente ≽^• ˕ • ྀི≼_\n\n` +
            `## ꕥ *W⍺gurı 𝖠ssı𝗌ƚ⍺nƚ* (*ᴗ͈ˬᴗ͈)ꕤ\n` +
            `> 𝖲𝖠𝖫𝖣𝖮 𝖨𝖭𝖲𝖴𝖥𝖨𝖢𝖨𝖤𝖭𝖳𝖤\n\n` +
            `> Error: No tienes suficientes monedas para realizar la compra.\n` +
            `> Costo necesario: *${formatNumber(PRICE_PER_FEATURE)}* monedas\n` +
            `> Tienes actualmente: *${formatNumber(user.koin || 0)}* monedas\n\n` +
            `> sɪᴍᴘʟᴇ ᴡʜᴀᴛsᴀᴘᴘ ʙᴏᴛ ツ`
        )
    }
    
    db.updateKoin(m.sender, -PRICE_PER_FEATURE)
    unlockedFeatures.push(feature.id)
    db.setUsuario(m.sender, { unlockedFeatures })
    
    const newKoin = db.getUsuario(m.sender).koin
    
    m.react('✅')
    
    await m.reply(
        `*¡Hola, buenas tardes!* ฅ^·ﻌ·^ฅ\n` +
        `> _Compra exitosa ≽^• ˕ • ྀི≼_\n\n` +
        `## ꕥ *W⍺gurı 𝖠ssı𝗌ƚ⍺nƚ* (*ᴗ͈ˬᴗ͈)ꕤ\n` +
        `> 𝖥𝖨𝖳𝖴𝖱𝖠 𝖣𝖤𝖲𝖡𝖫𝖮𝖰𝖴𝖤𝖠𝖣𝖠\n\n` +
        `> ¡Has desbloqueado una nueva función exitosamente!\n\n` +
        `> [DETALLES DE LA TRANSACCIÓN]\n` +
        `> - Función adquirida: *${feature.name}*\n` +
        `> - Costo aplicado: -${formatNumber(PRICE_PER_FEATURE)} monedas\n` +
        `> - Saldo restante: *${formatNumber(newKoin)}* monedas\n\n` +
        `> Descripción: _${feature.desc}_\n\n` +
        `> Tip: ¡Conviértete en usuario *Premium* para desbloquear todas las funciones sin costo adicional!\n\n` +
        `> sɪᴍᴘʟᴇ ᴡʜᴀᴛsᴀᴘᴘ ʙᴏᴛ ツ`
    )
}

export { pluginConfig as config, handler, PREMIUM_FEATURES }
