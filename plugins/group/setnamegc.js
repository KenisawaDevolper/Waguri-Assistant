const pluginConfig = {
    name: 'setnamegc',
    alias: ['setnamegrup', 'setgcname', 'setnamegroup', 'setnamagrup'],
    category: 'group',
    description: 'Cambia y actualiza el nombre oficial del grupo.',
    usage: '.setnamegc <nuevo nombre>',
    example: '.setnamegc Grupo Genial',
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
    const newName = m.fullArgs?.trim() || m.args.join(' ');
    
    if (!newName) {
        return m.reply(
            `ꕥ 𝖢𝖮𝖭𝖥𝖨𝖦𝖴𝖱𝖠𝖱 𝖭𝖮𝖬𝖡𝖱𝖤 𝖣𝖤𝖫 𝖦𝖱𝖴𝖯 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `      • Uso correcto :: \`${m.prefix}setnamegc <nuevo nombre>\`\n` +
            `      • Ejemplo :: \`${m.prefix}setnamegc Mi Grupo Increíble\`\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Debes proporcionar el nuevo nombre que deseas asignarle al grupo. »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        );
    }
    
    if (newName.length < 1 || newName.length > 100) {
        return m.reply(
            `ꕥ 𝖵𝖠𝖫𝖨𝖃𝖮́𝖭 𝖨𝖭𝖵𝖠𝖫𝖨𝖣𝖠 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « El nombre del grupo debe contener entre 1 y 100 caracteres. »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        );
    }
    
    try {
        await sock.groupUpdateSubject(m.chat, newName);
        try { await m.react('✅'); } catch {}
        
        await m.reply(
            `ꕥ 𝖭𝖮𝖬𝖡𝖱𝖤 𝖣𝖤 𝖦𝖱𝖴𝖯𝖮 𝖠𝖢𝖳𝖴𝖠𝖫𝖨𝖹𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `      𓈒 ◌ㅤ──    *𝖭𝖴𝖤𝖵𝖮 𝖣𝖮𝖬𝖨𝖭𝖨𝖮*\n` +
            `      • Nuevo título :: *${newName}*\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « El nombre del grupo ha sido modificado con éxito. »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        );
    } catch (error) {
        await m.reply(
            `ꕥ 𝖤𝖱𝖱𝖮𝖱 𝖣𝖤𝖫 𝖲𝖨𝖲𝖳𝖤𝖬𝖠 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « No se pudo actualizar el nombre del grupo.\nDetalle: _${error.message}_ »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        );
    }
}

export { pluginConfig as config, handler };
