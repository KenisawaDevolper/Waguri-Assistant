const pluginConfig = {
    name: 'open',
    alias: ['buka', 'opengroup', 'bukagroup'],
    category: 'group',
    description: 'Abre el grupo para que todos los participantes puedan enviar mensajes.',
    usage: '.open',
    example: '.open',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true,
    isAdmin: true,
    isBotAdmin: true
};

async function handler(m, { sock }) {
    try {
        const groupMeta = m.groupMetadata;
        
        if (!groupMeta.announce) {
            return m.reply(
                `ꕥ 𝖦𝖱𝖴𝖯𝖮 𝖸𝖠 𝖠𝖡𝖨𝖤𝖱𝖳𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                `      • Estado actual :: *Abierto (Libre)*\n\n` +
                `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Todos los miembros ya tienen permisos para enviar mensajes en este chat. »\n\n` +
                `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
            );
        }
        
        await sock.groupSettingUpdate(m.chat, 'not_announcement');
        
        const senderNum = m.sender.replace(/@.+/g, '');
        
        try { await m.react('🔓'); } catch {}
        
        return m.reply(
            `ꕥ 𝖦𝖱𝖴𝖯𝖮 𝖠𝖡𝖨𝖤𝖱𝖳𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `      • Administrador :: *@${senderNum}*\n` +
            `      • Estado :: *Chat abierto para todos los miembros*\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « El grupo ha sido abierto exitosamente. Ya se pueden enviar mensajes con normalidad. »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`,
            { mentions: [m.sender] }
        );
        
    } catch (error) {
        try { await m.react('☢'); } catch {}
        return m.reply(
            `ꕥ 𝖤𝖱𝖱𝖮𝖱 𝖣𝖤 𝖲𝖨𝖲𝖳𝖤𝖬𝖠 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `      • Motivo :: *No se pudo cambiar la configuración del grupo*\n` +
            `      • Detalle :: _${error.message}_\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Comprueba que el bot disponga de los privilegios de administración necesarios. »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        );
    }
}

export { pluginConfig as config, handler };
