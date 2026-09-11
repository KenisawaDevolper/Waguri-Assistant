import { getAllPlugins } from '../../src/lib/rimuru-plugins.js'
import config from '../../config.js'

const pluginConfig = {
    name: 'benefitowner',
    alias: ['ownerbenefits', 'ownerfitur'],
    category: 'main',
    description: 'Muestra la explicación y lista de funciones exclusivas para el Creador/Owner estilo Waguri',
    usage: '.benefitowner',
    isOwner: false,
    isGroup: false,
    isEnabled: true
}

async function handler(m, { sock }) {
    const plugins = getAllPlugins()
    const ownerCommands = plugins.filter(p => p.config.isOwner && p.config.isEnabled)
    
    const seen = new Set()
    const commandList = []
    for (const p of ownerCommands) {
        const names = Array.isArray(p.config.name) ? p.config.name : [p.config.name]
        for (const name of names) {
            if (!name || seen.has(name)) continue
            seen.add(name)
            commandList.push(`      • *${config.command?.prefix || '.'}${name}*`)
        }
    }
    commandList.sort()
    
    const totalCommands = commandList.length
    
    const message = 
        `ꕥ 𝖡𝖤𝖭𝖤𝖥𝖨𝖢𝖨𝖮𝖲 𝖣𝖤𝖫 𝖢𝖱𝖤𝖠𝖣𝖮𝖱 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « El Creador u Owner es el propietario del bot, con acceso total a todas las funciones y al control completo del sistema. »\n\n` +
        `      𓈒 ◌ㅤ──    *𝖯𝖱𝖨𝖵𝖨𝖫𝖤𝖦𝖨𝖮𝖲 𝖣𝖤𝖫 𝖢𝖱𝖤𝖠𝖣𝖮𝖱*\n` +
        `      • Acceso :: Comandos sin ningún tipo de restricción\n` +
        `      • Límite :: Uso ilimitado (-1)\n` +
        `      • Cooldown :: Omisión total de tiempos de espera\n` +
        `      • Control :: Gestión integral del sistema del bot\n` +
        `      • Gestión :: Administración de usuarios y grupos\n` +
        `      • Servidor :: Acceso a paneles y servidores\n\n` +
        `      𓈒 ◌ㅤ──    *𝖢𝖮𝖭𝖖𝖨𝖦𝖴𝖱𝖠𝖢𝖨𝖮𝖭*\n` +
        `      • Asignar :: \`${config.command?.prefix || '.'}addowner <número>\`\n` +
        `      • Directo :: Edición directa desde el archivo config.js\n\n` +
        `      𓈒 ◌ㅤ──    *𝖢𝖮𝖬𝖠𝖭𝖣𝖮𝖲 𝖣𝖤𝖫 𝖢𝖱𝖤𝖠𝖣𝖮𝖱 (${totalCommands})*\n` +
        (totalCommands > 0 
            ? commandList.join('\n')
            : `      • No hay comandos asignados exclusivamente al Creador`) +
        `\n\n` +
        `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    
    await m.reply(message)
}

export { pluginConfig as config, handler }
