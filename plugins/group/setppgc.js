const pluginConfig = {
    name: 'setppgc',
    alias: ['setprofilegc', 'setppgroup', 'setppgrup'],
    category: 'group',
    description: 'Actualiza y cambia la foto de perfil oficial del grupo.',
    usage: '.setppgc (respondiendo a una imagen)',
    example: '.setppgc',
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
    let buffer = null;

    if (m.quoted?.isImage) {
        try {
            buffer = await m.quoted.download();
        } catch (e) {
            return m.reply(
                `ꕥ 𝖤𝖱𝖱𝖮𝖱 𝖣𝖤 𝖣𝖤𝖲𝖢𝖠𝖱𝖦𝖠 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « No se pudo procesar la imagen citada. Inténtalo de nuevo. »\n\n` +
                `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
            );
        }
    } else if (m.isImage) {
        try {
            buffer = await m.download();
        } catch (e) {
            return m.reply(
                `ꕥ 𝖤𝖱𝖱𝖮𝖱 𝖣𝖤 𝖣𝖤𝖲𝖢𝖠𝖱𝖦𝖠 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « No se pudo descargar la imagen adjunta. Inténtalo de nuevo. »\n\n` +
                `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
            );
        }
    }

    if (!buffer) {
        return m.reply(
            `ꕥ 𝖲𝖨𝖭 𝖬𝖴𝖫𝖳𝖨𝖬𝖤𝖣𝖨𝖠 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `      • Opción 1 :: Responde a una imagen con \`${m.prefix}setppgc\`\n` +
            `      • Opción 2 :: Envía una imagen con el texto \`${m.prefix}setppgc\`\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Necesitas proporcionar una fotografía para cambiar el icono del grupo. »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        );
    }

    try {
        await sock.updateProfilePicture(m.chat, buffer);
        try { await m.react('✅'); } catch {}

        await m.reply(
            `ꕥ 𝖥𝖮𝖳𝖮 𝖣𝖤 𝖦𝖱𝖴𝖯𝖮 𝖠𝖢𝖳𝖴𝖠𝖫𝖨𝖹𝖠𝖣𝖠 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « La foto de perfil del grupo ha sido actualizada correctamente. »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        );
    } catch (error) {
        await m.reply(
            `ꕥ 𝖤𝖱𝖱𝖮𝖱 𝖣𝖤𝖫 𝖲𝖨𝖲𝖳𝖤𝖬𝖠 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « No se pudo actualizar la foto de perfil.\nDetalle: _${error.message}_ »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        );
    }
}

export { pluginConfig as config, handler };
