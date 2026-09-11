import { getDatabase } from '../../src/lib/rimuru-database.js'

const pluginConfig = {
    name: 'listantilink',
    alias: ['antilinklist', 'cekantilink'],
    category: 'group',
    description: 'Muestra el listado detallado de dominios y enlaces bloqueados por el sistema anti-link del grupo.',
    usage: '.listantilink',
    example: '.listantilink',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

const DEFAULT_BLOCKED_LINKS = [
    'chat.whatsapp.com',
    'wa.me',
    'bit.ly',
    't.me',
    'telegram.me',
    'discord.gg',
    'discord.com/invite'
]

function handler(m) {
    const db = getDatabase()
    const groupData = db.getGroup(m.chat) || {}
    const customList = groupData.antilinkList || []
    
    let txt = `ꕥ 𝖫𝖨𝖲𝖳𝖠 𝖣𝖤 𝖤𝖭𝖫𝖠𝖢𝖤𝖲 𝖡𝖫𝖮𝖰𝖴𝖤𝖠𝖣𝖮𝖲 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n`
    
    txt += `      𓈒 ◌ㅤ──    *📌 𝖣𝖤𝖥𝖠𝖴𝖫𝖳 (𝖲𝖨𝖲𝖳𝖤𝖬𝖠)*\n`
    DEFAULT_BLOCKED_LINKS.forEach((l, i) => {
        txt += `      • ${i + 1}. \`${l}\`\n`
    })
    
    if (customList.length > 0) {
        txt += `\n      𓈒 ◌ㅤ──    *➕ 𝖢𝖴𝖲𝖳𝖮𝖬 (𝖦𝖱𝖴𝖯𝖮)*\n`
        customList.forEach((l, i) => {
            txt += `      • ${i + 1}. \`${l}\`\n`
        })
    }
    
    txt += `\n      𓈒 ◌ㅤ──    *📊 𝖱𝖤𝖲𝖴𝖬𝖤𝖭 𝖣𝖤 𝖱𝖤𝖦𝖫𝖠𝖲*\n` +
           `      • Predeterminados :: *${DEFAULT_BLOCKED_LINKS.length} enlaces*\n` +
           `      • Personalizados :: *${customList.length} enlaces*\n\n` +
           `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Comandos útiles de gestión:\n` +
           `• \`${m.prefix}addantilink <link>\` para añadir uno nuevo.\n` +
           `• \`${m.prefix}delantilink <link>\` para remover un enlace personalizado. »\n\n` +
           `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`

    return m.reply(txt)
}

export { pluginConfig as config, handler, DEFAULT_BLOCKED_LINKS }
