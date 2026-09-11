import { getAllPlugins } from '../../src/lib/rimuru-plugins.js'
import config from '../../config.js'

const pluginConfig = {
    name: 'premiumbenefits',
    alias: ['premiumbenefits', 'benefitprem'],
    category: 'main',
    description: 'Muestra la explicación y lista de funciones exclusivas Premium estilo Waguri',
    usage: '.premiumbenefits',
    isOwner: false,
    isGroup: false,
    isEnabled: true
}

async function handler(m, { sock }) {
    const plugins = getAllPlugins()
    const premiumCommands = plugins.filter(p => p.config.isPremium && p.config.isEnabled)
    
    const seen = new Set()
    const commandList = []
    for (const p of premiumCommands) {
        const names = Array.isArray(p.config.name) ? p.config.name : [p.config.name]
        for (const name of names) {
            if (!name || seen.has(name)) continue
            seen.add(name)
            commandList.push(`      • *${config.command?.prefix || '.'}${name}*`)
        }
    }
    commandList.sort()
    
    const totalCommands = commandList.length
    const defaultLimit = config.limits?.default || 25
    const premiumLimit = config.limits?.premium || 100
    
    const message = 
        `ꕥ 𝖡𝖤𝖭𝖤𝖥𝖨𝖢𝖨𝖮𝖲 𝖯𝖱𝖤𝖬𝖨𝖴𝖬 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Los usuarios Premium cuentan con acceso a funciones exclusivas y ventajas adicionales dentro del bot. »\n\n` +
        `      𓈒 ◌ㅤ──    *𝖵𝖤𝖭𝖳𝖠𝖩𝖠𝖲 𝖯𝖱𝖤𝖬𝖨𝖴𝖬*\n` +
        `      • Límite diario :: ${premiumLimit} usos (vs ${defaultLimit} del usuario gratuito)\n` +
        `      • Cooldown :: Tiempos de espera reducidos\n` +
        `      • Exclusividad :: Acceso a comandos especiales\n` +
        `      • Prioridad :: Respuesta prioritaria en solicitudes\n` +
        `      • Sin marcas :: Descargas sin marcas de agua\n` +
        `      • Soporte :: Atención prioritaria por parte del Creador\n\n` +
        `      𓈒 ◌ㅤ──    *𝖢𝖮𝖬𝖮 𝖮𝖡𝖳𝖤𝖭𝖤𝖱𝖫𝖮*\n` +
        `      • Contacta directamente al Creador\n` +
        `      • Comando Creador :: \`${config.command?.prefix || '.'}addprem <número> <duración>\`\n` +
        `      • Ejemplo :: \`${config.command?.prefix || '.'}addprem 549xxx 30d\`\n\n` +
        `      𓈒 ◌ㅤ──    *𝖢𝖮𝖬𝖠𝖭𝖣𝖮𝖲 𝖯𝖱𝖤𝖬𝖨𝖴𝖬 (${totalCommands})*\n` +
        (totalCommands > 0 
            ? commandList.join('\n')
            : `      • Actualmente todos los comandos están disponibles para usuarios gratuitos`) +
        `\n\n` +
        `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « ¿Quieres adquirir una membresía Premium? Contacta al Creador: »\n` +
        `${config.owner.number.map(num => `      • wa.me/${num}`).join('\n')}\n\n` +
        `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    
    await m.reply(message)
}

export { pluginConfig as config, handler }
