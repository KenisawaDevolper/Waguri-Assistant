import { getDatabase } from '../../src/lib/rimuru-database.js'

const pluginConfig = {
    name: 'addantilink',
    alias: ['addalink', 'addblocklink'],
    category: 'group',
    description: 'Agrega un enlace o dominio a la lista de antilink del grupo con la estética Waguri Assistant',
    usage: '.addantilink <dominio/patrón>',
    example: '.addantilink tiktok.com',
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
    const link = (m.args?.join(" ") || m.text)?.toLowerCase()?.trim()
    
    if (!link) {
        return m.reply(
            `ꕥ 𝖠𝖣𝖣 𝖠𝖭𝖳𝖨𝖫𝖨𝖭𝖪 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `      𓈒 ◌ㅤ──    *𝖬𝖮𝖣𝖮 𝖣𝖤 𝖴𝖲𝖮*\n` +
            `      • Comando :: \`${m.prefix}addantilink <dominio>\`\n\n` +
            `      𓈒 ◌ㅤ──    *𝖤𝖩𝖤𝖬𝖯𝖫𝖮𝖲*\n` +
            `      • \`${m.prefix}addantilink tiktok.com\`\n` +
            `      • \`${m.prefix}addantilink chat.whatsapp.com\`\n` +
            `      • \`${m.prefix}addantilink instagram.com\`\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        )
    }
    
    const groupData = db.getGroup(m.chat) || {}
    const antilinkList = groupData.antilinkList || []
    
    if (antilinkList.includes(link)) {
        return m.reply(
            `ꕥ 𝖠𝖭𝖳𝖨𝖫𝖨𝖭𝖪 𝖸𝖠 𝖤𝖷𝖨𝖲𝖳𝖤 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « El enlace \`${link}\` ya se encuentra registrado en la lista de antilink. »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        )
    }
    
    antilinkList.push(link)
    db.setGroup(m.chat, { antilinkList })
    
    m.reply(
        `ꕥ 𝖠𝖭𝖳𝖨𝖫𝖨𝖭𝖪 𝖹𝖮𝖭𝖤 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `      𓈒 ◌ㅤ──    *𝖨𝖭𝖥𝖮𝖱𝖬𝖠𝖢𝖨𝖮𝖭*\n` +
        `      • Enlace agregado :: \`${link}\`\n` +
        `      • Total bloqueados :: ${antilinkList.length}\n\n` +
        `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Puedes usar \`${m.prefix}listantilink\` para ver todos los dominios protegidos. »\n\n` +
        `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    )
}

export { pluginConfig as config, handler }
