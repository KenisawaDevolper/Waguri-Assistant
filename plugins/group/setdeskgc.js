const pluginConfig = {
    name: 'setdescgc',
    alias: ['setdesc', 'setdeskripsi', 'setdesk'],
    category: 'group',
    description: 'Actualiza, cambia o elimina la descripción oficial del grupo.',
    usage: '.setdeskgc <nueva descripción>',
    example: '.setdeskgc Grupoo exclusivo para discusiones sanas',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    isBotAdmin: true,
    cooldown: 10,
    energi: 0,
    isEnabled: true
};

async function handler(m, { sock }) {
    const newDesc = m.fullArgs?.trim() || m.args.join(' ') || '';
    
    if (!m.text && m.args?.length === 0) {
        return m.reply(
            `ꕥ 𝖢𝖮𝖭𝖥𝖨𝖦𝖴𝖱𝖠𝖱 𝖣𝖤𝖲𝖢𝖱𝖨𝖯𝖢𝖨𝖀́𝖭 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `      • Cambiar :: \`${m.prefix}setdescgc <tu texto>\`\n` +
            `      • Eliminar :: \`${m.prefix}setdescgc clear\`\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Debes indicar la nueva descripción o escribir \`clear\` para borrarla. »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        );
    }
    
    const descToSet = newDesc.toLowerCase() === 'clear' ? '' : newDesc;
    
    if (descToSet.length > 2048) {
        return m.reply(
            `ꕥ 𝖵𝖠𝖫𝖨𝖃𝖮́𝖭 𝖨𝖭𝖵𝖠𝖫𝖨𝖣𝖠 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « La descripción no puede superar los 2048 caracteres permitidos por WhatsApp. »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        );
    }
    
    try {
        await sock.groupUpdateDescription(m.chat, descToSet);
        try { await m.react('✅'); } catch {}
        
        if (descToSet) {
            await m.reply(
                `ꕥ 𝖣𝖤𝖲𝖢𝖱𝖨𝖯𝖢𝖨𝖀́𝖭 𝖠𝖢𝖳𝖴𝖠𝖫𝖨𝖹𝖠𝖣𝖠 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « La descripción del grupo ha sido actualizada con éxito. »\n\n` +
                `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
            );
        } else {
            await m.reply(
                `ꕥ 𝖣𝖤𝖲𝖢𝖱𝖨𝖯𝖢𝖨𝖀́𝖭 𝖤𝖫𝖨𝖬𝖨𝖭𝖠𝖣𝖠 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « La descripción anterior ha sido borrada por completo. »\n\n` +
                `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
            );
        }
    } catch (error) {
        await m.reply(
            `ꕥ 𝖤𝖱𝖱𝖮𝖱 𝖣𝖤𝖫 𝖲𝖨𝖲𝖳𝖤𝖬𝖠 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « No se pudo modificar la descripción del grupo.\nDetalle: _${error.message}_ »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        );
    }
}

export { pluginConfig as config, handler };
