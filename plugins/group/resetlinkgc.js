import te from '../../src/lib/rimuru-error.js'

const pluginConfig = {
    name: 'resetlinkgc',
    alias: ['resetlink', 'revokelink', 'newlink'],
    category: 'group',
    description: 'Revoca y restablece el enlace de invitación del grupo, invalidando el anterior de forma permanente.',
    usage: '.resetlinkgc',
    example: '.resetlinkgc',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 60,
    energi: 0,
    isEnabled: true,
    isAdmin: true,
    isBotAdmin: true
}

async function handler(m, { sock }) {
    try { await m.react('🔄'); } catch {}
    
    try {
        await sock.groupRevokeInvite(m.chat)
        
        try { await m.react('✅'); } catch {}
        
        return m.reply(
            `ꕥ 𝖤𝖭𝖫𝖠𝖢𝖤 𝖣𝖤𝖫 𝖦𝖱𝖴𝖯 𝖱𝖤𝖲𝖳𝖠𝖴𝖱𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `      • Estado :: *Enlace anterior invalidado con éxito*\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « El código de invitación anterior ha dejado de funcionar.\nUtiliza \`${m.prefix}linkgrup\` para generar y consultar el nuevo enlace. »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        )
        
    } catch (err) {
        try { await m.react('☢'); } catch {}
        return m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
