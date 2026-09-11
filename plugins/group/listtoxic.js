import { getDatabase } from '../../src/lib/rimuru-database.js'
import { DEFAULT_TOXIC_WORDS } from './antitoxic.js'

const pluginConfig = {
    name: 'listtoxic',
    alias: ['toxiclist', 'katatoxic', 'lihatkata'],
    category: 'group',
    description: 'Muestra el registro completo de palabras groseras o tóxicas filtradas en el grupo.',
    usage: '.listtoxic',
    example: '.listtoxic',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const groupData = db.getGroup(m.chat) || {}
    
    const customWords = groupData.toxicWords || []
    const defaultWords = DEFAULT_TOXIC_WORDS || []
    
    let text = `ꕥ 𝖫𝖨𝖲𝖳𝖠 𝖣𝖤 𝖯𝖠𝖫𝖠𝖡𝖱𝖠𝖲 𝖳𝖮𝖷𝖨𝖢𝖠𝖲 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n`
    
    if (customWords.length > 0) {
        text += `      𓈒 ◌ㅤ──    *✏️ 𝖢𝖴𝖲𝖳𝖮𝖬 (${customWords.length})*\n`
        for (let i = 0; i < customWords.length; i++) {
            text += `      • ${i + 1}. \`${customWords[i]}\`\n`
        }
        text += `\n`
    }
    
    text += `      𓈒 ◌ㅤ──    *📦 𝖣𝖤𝖥𝖠𝖴𝖫𝖳 (${defaultWords.length})*\n`
    for (let i = 0; i < defaultWords.length; i++) {
        text += `      • ${i + 1}. \`${defaultWords[i]}\`\n`
    }
    
    text += `\n      𓈒 ◌ㅤ──    *📊 𝖱𝖤𝖲𝖴𝖬𝖤𝖭 𝖳𝖮𝖳𝖠𝖫*\n` +
           `      • Total de términos bloqueados :: *${customWords.length + defaultWords.length} palabras*\n\n` +
           `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Comandos de gestión rápida:\n` +
           `• \`${m.prefix}addtoxic <palabra>\` para añadir una nueva.\n` +
           `• \`${m.prefix}deltoxic <palabra>\` para eliminar una personalizada. »\n\n` +
           `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    
    return m.reply(text)
}

export { pluginConfig as config, handler }
