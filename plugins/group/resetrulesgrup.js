import { getDatabase } from '../../src/lib/rimuru-database.js'

const pluginConfig = {
    name: 'resetrulesgrup',
    alias: ['resetgrouprules'],
    category: 'group',
    description: 'Restablece las normas personalizadas del grupo al reglamento predeterminado por defecto.',
    usage: '.resetrulesgrup',
    example: '.resetrulesgrup',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

function handler(m) {
    const db = getDatabase()
    
    db.setGroup(m.chat, { groupRules: null })
    
    try { m.react('✅'); } catch {}

    return m.reply(
        `ꕥ 𝖱𝖴𝖤𝖫𝖲 𝖣𝖤𝖫 𝖦𝖱𝖴𝖯 𝖱𝖤𝖲𝖳𝖠𝖴𝖱𝖠𝖣𝖮𝖲 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `      • Acción :: *Restauradas a la plantilla estándar*\n\n` +
        `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Las reglas personalizadas se han eliminado. Escribe \`${m.prefix}rulesgrup\` para ver las normativas actuales del chat. »\n\n` +
        `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    )
}

export { pluginConfig as config, handler }
