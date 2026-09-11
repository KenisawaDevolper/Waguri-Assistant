import { getDatabase } from '../../src/lib/rimuru-database.js'

const pluginConfig = {
    name: 'antiswgc',
    alias: ['antiswgroup', 'antiswmentiongc', 'antiswtaggc'],
    category: 'group',
    description: 'Gestiona la protección antiswgc (menciones de estados en grupos) bajo la estética Waguri Assistant',
    usage: '.antiswgc <on/off>',
    example: '.antiswgc on',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    isBotAdmin: true,
    cooldown: 3,
    energi: 0,
    isEnabled: true
}

async function handler(m, { db }) {
    const action = (m.args || [])[0]?.toLowerCase()
    const group = db.getGroup(m.chat) || {}

    if (!action) {
        const status = group.antiswgc || 'off'
        await m.reply(
            `ꕥ 𝖠𝖭𝖳𝖨𝖲𝖶𝖦𝖢 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `      𓈒 ◌ㅤ──    *𝖤𝖲𝖳𝖠𝖡𝖫𝖤𝖢𝖨𝖬𝖨𝖤𝖭𝖳𝖮𝖲*\n` +
            `      • Estado :: ${status === 'on' ? 'ACTIVO ✅' : 'INACTIVO ❌'}\n\n` +
            `      𓈒 ◌ㅤ──    *𝖣𝖤𝖳𝖤𝖢𝖢𝖨𝖮𝖭*\n` +
            `      • groupStatusMentionMessage\n` +
            `      • groupMentionedMessage\n` +
            `      • statusMentionMessage\n` +
            `      • contextInfo.groupMentions\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Uso: \`${m.prefix}antiswgc on\` o \`${m.prefix}antiswgc off\`. »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        )
        return
    }

    if (action === 'on') {
        db.setGroup(m.chat, { ...group, antiswgc: 'on' })
        try { await m.react('✅') } catch {}
        await m.reply(
            `ꕥ 𝖠𝖭𝖳𝖨𝖲𝖶𝖦𝖢 𝖠𝖢𝖳𝖨𝖵𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « El sistema AntiSWGC se ha activado. Las menciones de estado en grupo se eliminarán automáticamente. »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        )
        return
    }

    if (action === 'off') {
        db.setGroup(m.chat, { ...group, antiswgc: 'off' })
        try { await m.react('❌') } catch {}
        await m.reply(
            `ꕥ 𝖠𝖭𝖳𝖨𝖲𝖶𝖦𝖢 𝖣𝖤𝖲𝖠𝖢𝖳𝖨𝖵𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « El sistema AntiSWGC se ha desactivado. »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        )
        return
    }

    await m.reply(
        `ꕥ 𝖮𝖯𝖢𝖨𝖮𝖭 𝖨𝖭𝖵𝖠𝖫𝖨𝖣𝖠 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Usa \`${m.prefix}antiswgc on\` o \`${m.prefix}antiswgc off\`. »\n\n` +
        `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    )
}

export { pluginConfig as config, handler }
