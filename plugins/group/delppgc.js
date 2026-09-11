const pluginConfig = {
    name: 'delppgc',
    alias: ['delprofilegc', 'delppgroup', 'hapusppgc'],
    category: 'group',
    description: 'Elimina la foto de perfil actual del grupo.',
    usage: '.delppgc',
    example: '.delppgc',
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
    try {
        await sock.removeProfilePicture(m.chat);
        try { await m.react('✅'); } catch {}
        
        await m.reply(
            `ꕥ 𝖥𝖮𝖳𝖮 𝖣𝖤 𝖯𝖤𝖱𝖥𝖨𝖫 𝖤𝖫𝖨𝖬𝖨𝖭𝖠𝖣𝖠 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `      𓈒 ◌ㅤ──    *𝖣𝖤𝖳𝖠𝖫𝖫𝖤𝖲*\n` +
            `      • Estado :: Eliminada con éxito 🗑️\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « El grupo ya no tiene foto de perfil asignada. »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        );
    } catch (error) {
        try { await m.react('❌'); } catch {}
        await m.reply(
            `ꕥ 𝖤𝖱𝖱𝖮𝖱 𝖣𝖤 𝖲𝖨𝖲𝖳𝖤𝖬𝖠 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « No se pudo eliminar la foto del grupo.\n` +
            `Detalle: _${error.message}_ »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        );
    }
}

export { pluginConfig as config, handler };
