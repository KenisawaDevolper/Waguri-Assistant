import { getDatabase } from '../../src/lib/rimuru-database.js'

const pluginConfig = {
    name: 'addtoxic',
    alias: ['tambahtoxic', 'addkata'],
    category: 'group',
    description: 'Agrega una palabra tóxica a la lista del grupo con la estética Waguri Assistant',
    usage: '.addtoxic <palabra>',
    example: '.addtoxic palabra_grosera',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    cooldown: 3,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const word = (m.args?.join(" ") || m.text)?.toLowerCase()?.trim()
    
    if (!word) {
        return m.reply(
            `ꕥ 𝖠𝖣𝖣 𝖳𝖮𝖷𝖨𝖢 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `      𓈒 ◌ㅤ──    *𝖬𝖮𝖣𝖮 𝖣𝖤 𝖴𝖲𝖮*\n` +
            `      • Comando :: \`${m.prefix}addtoxic <palabra>\`\n\n` +
            `      𓈒 ◌ㅤ──    *𝖤𝖩𝖤𝖬𝖯𝖫𝖮𝖲*\n` +
            `      • \`${m.prefix}addtoxic groseria\`\n` +
            `      • \`${m.prefix}addtoxic insulto\`\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        )
    }
    
    if (word.length < 2) {
        return m.reply(
            `ꕥ 𝖯𝖠𝖫𝖠𝖡𝖱𝖠 𝖬𝖴𝖸 𝖢𝖮𝖱𝖳𝖠 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « La palabra debe tener al menos 2 caracteres. »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        )
    }
    
    if (word.length > 30) {
        return m.reply(
            `ꕥ 𝖯𝖠𝖫𝖠𝖡𝖱𝖠 𝖬𝖴𝖸 𝖫𝖠𝖱𝖦𝖠 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « La palabra no puede superar los 30 caracteres. »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        )
    }
    
    const groupData = db.getGroup(m.chat) || {}
    const toxicWords = groupData.toxicWords || []
    
    if (toxicWords.includes(word)) {
        return m.reply(
            `ꕥ 𝖯𝖠𝖫𝖠𝖡𝖱𝖠 𝖸𝖠 𝖤𝖷𝖨𝖲𝖳𝖤 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « La palabra \`${word}\` ya se encuentra registrada en la lista de toxicidad. »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        )
    }
    
    toxicWords.push(word)
    db.setGroup(m.chat, { toxicWords })
    
    await m.react('✅')
    
    m.reply(
        `ꕥ 𝖳𝖮𝖷𝖨𝖢 𝖹𝖮𝖭𝖤 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `      𓈒 ◌ㅤ──    *𝖨𝖭𝖥𝖮𝖱𝖬𝖠𝖢𝖨𝖮𝖭*\n` +
        `      • Palabra agregada :: \`${word}\`\n` +
        `      • Total prohibidas :: ${toxicWords.length}\n\n` +
        `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    )
}

export { pluginConfig as config, handler }
