import { getDatabase } from '../../src/lib/rimuru-database.js'
import config from '../../config.js'

const pluginConfig = {
    name: 'antilinkgc',
    alias: ['algc', 'antilinkgrup'],
    category: 'group',
    description: 'Gestiona la protección contra enlaces de WhatsApp (grupos, canales, wa.me) bajo la estética Waguri Assistant',
    usage: '.antilinkgc <on/off/metode> [kick/remove]',
    example: '.antilinkgc on',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true,
    isAdmin: true,
    isBotAdmin: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const option = m.args?.[0]?.toLowerCase()?.trim()
    
    if (!option) {
        const groupData = db.getGroup(m.chat) || {}
        const status = groupData.antilinkgc || 'off'
        const mode = groupData.antilinkgcMode || 'remove'
        
        return m.reply(
            `ꕥ 𝖠𝖭𝖳𝖨𝖫𝖨𝖭𝖪 𝖶𝖧𝖠𝖳𝖲𝖠𝖯𝖯 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `      𓈒 ◌ㅤ──    *𝖤𝖲𝖳𝖠𝖡𝖫𝖤𝖢𝖨𝖬𝖨𝖤𝖭𝖳𝖮𝖲*\n` +
            `      • Estado :: ${status === 'on' ? 'ACTIVO ✅' : 'INACTIVO ❌'}\n` +
            `      • Modo :: *${mode.toUpperCase()}*\n\n` +
            `      𓈒 ◌ㅤ──    *𝖣𝖤𝖳𝖤𝖢𝖢𝖨𝖮𝖭*\n` +
            `      • chat.whatsapp.com (grupos)\n` +
            `      • wa.me (contactos)\n` +
            `      • whatsapp.com/channel (canales)\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Comandos:\n` +
            `> \`${m.prefix}antilinkgc on\` — Activar\n` +
            `> \`${m.prefix}antilinkgc off\` — Desactivar\n` +
            `> \`${m.prefix}antilinkgc metode kick\` — Modo expulsión\n` +
            `> \`${m.prefix}antilinkgc metode remove\` — Modo eliminación »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        )
    }
    
    if (option === 'on') {
        db.setGroup(m.chat, { antilinkgc: 'on' })
        try { await m.react('✅') } catch {}
        return m.reply(
            `ꕥ 𝖠𝖭𝖳𝖨𝖫𝖨𝖭𝖪 𝖶𝖠 𝖠𝖢𝖳𝖨𝖵𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « El sistema Antilink WhatsApp se ha activado exitosamente. »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        )
    }
    
    if (option === 'off') {
        db.setGroup(m.chat, { antilinkgc: 'off' })
        try { await m.react('❌') } catch {}
        return m.reply(
            `ꕥ 𝖠𝖭𝖳𝖨𝖫𝖨𝖭𝖪 𝖶𝖠 𝖣𝖤𝖲𝖠𝖢𝖳𝖨𝖵𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « El sistema Antilink WhatsApp se ha desactivado. »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        )
    }
    
    if (option === 'metode') {
        const method = m.args?.[1]?.toLowerCase()
        if (method === 'kick') {
            db.setGroup(m.chat, { antilinkgc: 'on', antilinkgcMode: 'kick' })
            return m.reply(
                `ꕥ 𝖬𝖮𝖣𝖮 𝖪𝖨𝖢𝖪 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Antilink WhatsApp configurado en modo *KICK*. Los usuarios serán expulsados al enviar enlaces de WA. »\n\n` +
                `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
            )
        } else if (method === 'remove' || method === 'delete') {
            db.setGroup(m.chat, { antilinkgc: 'on', antilinkgcMode: 'remove' })
            return m.reply(
                `ꕥ 𝖬𝖮𝖣𝖮 𝖱𝖤𝖬𝖮𝖵𝖤 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Antilink WhatsApp configurado en modo *REMOVE*. Los mensajes con enlaces de WA serán eliminados. »\n\n` +
                `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
            )
        } else {
            return m.reply(
                `ꕥ 𝖬𝖤𝖳𝖮𝖣𝖮 𝖨𝖭𝖵𝖠𝖫𝖨𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Usa \`kick\` o \`remove\` (ej: \`${m.prefix}antilinkgc metode kick\`). »\n\n` +
                `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
            )
        }
    }
    
    if (option === 'kick') {
        db.setGroup(m.chat, { antilinkgc: 'on', antilinkgcMode: 'kick' })
        return m.reply(
            `ꕥ 𝖬𝖮𝖣𝖮 𝖪𝖨𝖢𝖪 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Antilink WhatsApp configurado en modo *KICK* exitosamente. »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        )
    }
    
    if (option === 'remove' || option === 'delete') {
        db.setGroup(m.chat, { antilinkgc: 'on', antilinkgcMode: 'remove' })
        return m.reply(
            `ꕥ 𝖬𝖮𝖣𝖮 𝖱𝖤𝖬𝖮𝖵𝖤 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Antilink WhatsApp configurado en modo *REMOVE* exitosamente. »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        )
    }
    
    return m.reply(
        `ꕥ 𝖮𝖯𝖢𝖨𝖮𝖭 𝖨𝖭𝖵𝖠𝖫𝖨𝖣𝖠 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Usa \`on\`, \`off\`, \`metode kick\` o \`metode remove\`. »\n\n` +
        `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    )
}

export { pluginConfig as config, handler }
