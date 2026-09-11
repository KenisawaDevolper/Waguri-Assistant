import { getDatabase } from '../../src/lib/rimuru-database.js'

const pluginConfig = {
    name: 'resetgoodbye',
    alias: ['delgoodbye', 'cleargoodbye'],
    category: 'group',
    description: 'Restablece el mensaje de despedida (goodbye) del grupo a su plantilla predeterminada.',
    usage: '.resetgoodbye',
    example: '.resetgoodbye',
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
    const groupData = db.getGroup(m.chat)
    
    if (!groupData?.goodbyeMsg) {
        return m.reply(
            `ꕥ 𝖮𝖯𝖤𝖱𝖠𝖢𝖨𝖀́𝖭 𝖨𝖭𝖭𝖤𝖢𝖤𝖲𝖠𝖱𝖨𝖠 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « El mensaje de despedida de este grupo ya se encuentra configurado en su estado por defecto. »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        )
    }
    
    db.setGroup(m.chat, { goodbyeMsg: null })
    
    try { await m.react('✅'); } catch {}
    
    return m.reply(
        `ꕥ 𝖣𝖤𝖲𝖯𝖤𝖣𝖨𝖃𝖠 𝖱𝖤𝖲𝖳𝖠𝖴𝖱𝖠𝖣𝖠 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `      • Acción :: *Restaurado al mensaje estándar*\n\n` +
        `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « El mensaje personalizado de despedida ha sido eliminado exitosamente. »\n\n` +
        `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    )
}

export { pluginConfig as config, handler }
