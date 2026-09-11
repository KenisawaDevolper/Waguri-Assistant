const pluginConfig = {
    name: 'notifpromote',
    alias: [],
    category: 'group',
    description: 'Activa o desactiva la notificación automática cuando un miembro asciende a administrador (solo admins).',
    usage: '.notifpromote on/off',
    example: '.notifpromote on',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

function handler(m, { sock, db }) {
    if (!m.isAdmin && !m.isOwner) {
        return m.reply(
            `ꕥ 𝖢𝖮𝖬𝖠𝖭𝖣𝖮 𝖱𝖤𝖲𝖳𝖱𝖨𝖭𝖦𝖨𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Esta función de configuración solo puede ser utilizada por administradores del grupo o el owner. »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        )
    }
    
    const args = m.args[0]?.toLowerCase()
    const group = db.getGroup(m.chat) || {}
    
    if (!['on', 'off'].includes(args)) {
        const status = group.notifPromote === true ? '✅ Activo (Encendido)' : '❌ Inactivo (Apagado)'
        return m.reply(
            `ꕥ 𝖭𝖮𝖳𝖨𝖥𝖨𝖢𝖠𝖢𝖨𝖀́𝖭 𝖣𝖤 𝖯𝖱𝖮𝖬𝖮𝖳𝖤 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `      • Estado actual :: *${status}*\n\n` +
            `      𓈒 ◌ㅤ──    *📋 𝖬𝖮𝖣𝖮 𝖣𝖤 𝖴𝖲𝖮*\n` +
            `      • \`${m.prefix}notifpromote on\` — Habilitar aviso\n` +
            `      • \`${m.prefix}notifpromote off\` — Deshabilitar aviso\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Elige una opción válida para modificar el estado de este módulo de avisos. »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        )
    }
    
    if (args === 'on') {
        group.notifPromote = true
        db.setGroup(m.chat, group)
        
        try { m.react('✅'); } catch {}
        
        return m.reply(
            `ꕥ 𝖭𝖮𝖳𝖨𝖥𝖨𝖢𝖠𝖢𝖨𝖀́𝖭 𝖠𝖢𝖳𝖨𝖵𝖠𝖣𝖠 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `      • Módulo :: *Aviso de ascenso a admin activado*\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Ahora se enviará una notificación cuando un miembro sea promovido a administrador en el grupo. »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        )
    }
    
    if (args === 'off') {
        group.notifPromote = false
        db.setGroup(m.chat, group)
        
        try { m.react('❌'); } catch {}
        
        return m.reply(
            `ꕥ 𝖭𝖮𝖳𝖨𝖥𝖨𝖢𝖠𝖢𝖨𝖀́𝖭 𝖣𝖤𝖲𝖠𝖢𝖳𝖨𝖵𝖠𝖣𝖠 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `      • Módulo :: *Aviso de ascenso a admin desactivado*\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Las alertas automáticas por nuevos administradores han sido suspendidas. »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        )
    }
}

export { pluginConfig as config, handler }
