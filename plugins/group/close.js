const pluginConfig = {
    name: 'close',
    alias: ['tutup', 'closegroup', 'tutupgroup'],
    category: 'group',
    description: 'Cierra el grupo para que solo los administradores puedan enviar mensajes.',
    usage: '.close',
    example: '.close',
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
        
        if (groupMeta.announce) {
            return m.reply(
                `ꕥ 𝖦𝖱𝖴𝖯𝖮 𝖸𝖠 𝖢𝖤𝖱𝖱𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « El grupo ya se encuentra cerrado. Actualmente solo los administradores pueden enviar mensajes. »\n\n` +
                `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
            );
        }
        
        await sock.groupSettingUpdate(m.chat, 'announcement');
        
        const senderNum = m.sender.split('@')[0];
        
        const successMsg = `ꕥ 𝖦𝖱𝖴𝖯𝖮 𝖢𝖤𝖱𝖱𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `      𓈒 ◌ㅤ──    *𝖣𝖤𝖳𝖠𝖫𝖫𝖤𝖲*\n` +
            `      • Estado :: Cerrado correctamente 🔒\n` +
            `      • Cerrado por :: @${senderNum}\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « A partir de ahora, solo los administradores tienen permiso para chatear. »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`;
        
        await sock.sendMessage(m.chat, {
            text: successMsg,
            mentions: [m.sender]
        }, { quoted: m });
        
    } catch (error) {
        await m.reply(
            `ꕥ 𝖤𝖱𝖱𝖮𝖱 𝖣𝖤 𝖲𝖨𝖲𝖳𝖤𝖬𝖠 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « No se pudo cerrar el grupo.\n` +
            `Detalle: _${error.message}_ »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        );
    }
}

export { pluginConfig as config, handler };
