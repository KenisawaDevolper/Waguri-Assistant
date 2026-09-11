const pluginConfig = {
    name: 'antitagsw',
    alias: ['antitag', 'antistatustag'],
    category: 'group',
    description: 'Gestiona la protección antitagsw (etiquetas de estados en el grupo) bajo la estética Waguri Assistant',
    usage: '.antitagsw <on/off>',
    example: '.antitagsw on',
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

async function handler(m, { sock, db }) {
    const args = m.args || []
    const action = args[0]?.toLowerCase()
    const groupId = m.chat
    const group = db.getGroup(groupId) || {}

    if (!action) {
        const status = group.antitagsw || 'off'

        await m.reply(
            `ꕥ 𝖠𝖭𝖳𝖨𝖳𝖠𝖦𝖲𝖶 𝖲𝖤𝖳𝖳𝖨𝖭𝖦𝖲 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `      𓈒 ◌ㅤ──    *𝖤𝖲𝖳𝖠𝖡𝖫𝖤𝖢𝖨𝖬𝖨𝖤𝖭𝖳𝖮𝖲*\n` +
            `      • Estado :: ${status === 'on' ? 'ACTIVO ✅' : 'INACTIVO ❌'}\n\n` +
            `      𓈒 ◌ㅤ──    *𝖣𝖤𝖳𝖤𝖢𝖢𝖨𝖮𝖭*\n` +
            `      • groupStatusMentionMessage\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Comandos:\n` +
            `> \`${m.prefix}antitagsw on\` — Activar\n` +
            `> \`${m.prefix}antitagsw off\` — Desactivar »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        )
        return
    }

    if (action === 'on') {
        db.setGroup(groupId, { ...group, antitagsw: 'on' })
        try { await m.react('✅') } catch {}
        await m.reply(
            `ꕥ 𝖠𝖭𝖳𝖨𝖳𝖠𝖦𝖲𝖶 𝖠𝖢𝖳𝖨𝖵𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « El sistema AntiMenciona Status se ha activado exitosamente. Las etiquetas de estados serán eliminadas automáticamente. »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        )
        return
    }

    if (action === 'off') {
        db.setGroup(groupId, { ...group, antitagsw: 'off' })
        try { await m.react('❌') } catch {}
        await m.reply(
            `ꕥ 𝖠𝖭𝖳𝖨𝖳𝖠𝖦𝖲𝖶 𝖣𝖤𝖲𝖠𝖢𝖳𝖨𝖵𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « El sistema AntiMenciona Status se ha desactivado. »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        )
        return
    }

    await m.reply(
        `ꕥ 𝖮𝖯𝖢𝖨𝖮𝖭 𝖨𝖭𝖵𝖠𝖫𝖨𝖣𝖠 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Usa \`${m.prefix}antitagsw on\` o \`${m.prefix}antitagsw off\`. »\n\n` +
        `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    )
}

export { pluginConfig as config, handler }
