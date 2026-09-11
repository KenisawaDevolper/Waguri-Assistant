import { getDatabase } from '../../src/lib/rimuru-database.js'

const pluginConfig = {
    name: 'resetwarn',
    alias: ['clearwarn', 'hapuswarn', 'delwarn'],
    category: 'group',
    description: 'Restablece a cero las advertencias (warnings) acumuladas de un miembro del grupo.',
    usage: '.resetwarn @user',
    example: '.resetwarn @user',
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
    
    let targetUser = null
    if (m.quoted) {
        targetUser = m.quoted.sender
    } else if (m.mentionedJid && m.mentionedJid.length > 0) {
        targetUser = m.mentionedJid[0]
    }
    
    if (!targetUser) {
        return m.reply(
            `ꕥ 𝖲𝖨𝖭 𝖮𝖡𝖩𝖤𝖳𝖨𝖵𝖮 𝖣𝖤𝖲𝖨𝖦𝖭𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `      • Uso correcto :: \`${m.prefix}resetwarn @user\` o responde a su mensaje\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Debes mencionar al usuario o responder a un mensaje suyo para limpiar sus advertencias. »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        )
    }
    
    let groupData = db.getGroup(m.chat) || {}
    let warnings = groupData.warnings || {}
    const maxWarns = groupData.maxWarnings || 3
    
    const targetName = targetUser.split('@')[0]
    
    if (!warnings[targetUser] || warnings[targetUser].length === 0) {
        return m.reply(
            `ꕥ 𝖲𝖨𝖭 𝖠𝖣𝖵𝖤𝖱𝖳𝖤𝖭𝖢𝖨𝖠𝖲 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `      • Usuario :: *@${targetName}*\n` +
            `      • Estado :: *0 advertencias registradas*\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « El miembro seleccionado no cuenta con historial de warns activos en este grupo. »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`,
            { mentions: [targetUser] }
        )
    }
    
    const prevCount = warnings[targetUser].length
    delete warnings[targetUser]
    db.setGroup(m.chat, { ...groupData, warnings: warnings })
    
    try { await m.react('✅'); } catch {}

    return m.reply(
        `ꕥ 𝖶𝖠𝖱𝖭𝖲 𝖱𝖤𝖲𝖳𝖠𝖴𝖱𝖠𝖣𝖮𝖲 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `      • Objetivo :: *@${targetName}*\n` +
        `      • Historial previo :: *${prevCount}/${maxWarns}*\n` +
        `      • Estado actual :: *0/${maxWarns}*\n\n` +
        `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Se han limpiado todas las advertencias del usuario exitosamente. »\n\n` +
        `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`,
        { mentions: [targetUser] }
    )
}

export { pluginConfig as config, handler }
