import { getDatabase } from '../../src/lib/rimuru-database.js'

const pluginConfig = {
    name: 'resetwelcome',
    alias: ['delwelcome', 'clearwelcome'],
    category: 'group',
    description: 'Restablece el mensaje de bienvenida del grupo al formato por defecto predeterminado.',
    usage: '.resetwelcome',
    example: '.resetwelcome',
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
    
    if (!groupData?.welcomeMsg) {
        return m.reply(
            `ꕥ 𝖢𝖮𝖭𝖥𝖨𝖦𝖴𝖱𝖠𝖢𝖨𝖀́𝖭 𝖸𝖠 𝖯𝖮𝖱 𝖣𝖤𝖥𝖮𝖴𝖫𝖳 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `      • Estado actual :: *Mensaje predeterminado*\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Este grupo no cuenta con un mensaje de bienvenida personalizado configurado. »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        )
    }
    
    db.setGroup(m.chat, { welcomeMsg: null })
    
    try { await m.react('✅'); } catch {}
    
    return m.reply(
        `ꕥ 𝖶𝖤𝖫𝖢𝖮𝖬𝖤 𝖱𝖤𝖲𝖳𝖠𝖴𝖱𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `      • Acción :: *Restablecido a valores de fábrica*\n\n` +
        `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « El mensaje de bienvenida ha vuelto a su plantilla original por defecto. »\n\n` +
        `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    )
}

export { pluginConfig as config, handler }
