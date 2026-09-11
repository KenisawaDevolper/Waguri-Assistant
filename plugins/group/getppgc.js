const pluginConfig = {
    name: 'getppgc',
    alias: ['ppgc'],
    category: 'group',
    description: 'Obtiene y muestra la foto de perfil actual del grupo (solo administradores o creador del bot).',
    usage: '.getppgc',
    example: '.getppgc',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 10,
    energi: 3,
    isEnabled: true
};

async function handler(m, { sock, config }) {
    const group = await sock.groupMetadata(m.chat);
    const sender = m.sender;

    const admins = group.participants
        .filter(v => v.admin)
        .map(v => v.id);

    const ownerNumbers = config.owner?.number || [];

    const isAdmin = admins.includes(sender);
    const isCreator = ownerNumbers.some(num => sender.includes(num));

    if (!isAdmin && !isCreator) {
        return m.reply(
            `ꕥ 𝖠𝖢𝖢𝖤𝖲𝖮 𝖣𝖤𝖭𝖤𝖦𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Esta función exclusiva solo puede ser utilizada por administradores del grupo o propietarios del bot. »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        );
    }

    try { await m.react('⏳'); } catch {}

    await m.reply(
        `ꕥ 𝖮𝖡𝖳𝖨𝖤𝖭𝖨𝖤𝖭𝖣𝖮 𝖥𝖮𝖳𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Conectando con el servidor para extraer la fotografía del grupo, por favor espera... »\n\n` +
        `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    );

    let pp;

    try {
        pp = await sock.profilePictureUrl(m.chat, 'image');
    } catch {
        pp = 'https://cdn.gimita.id/download/pp%20kosong%20wa%20default%20(1)_1769506608569_52b57f5b.jpg';
    }

    const caption = 
        `ꕥ 𝖥𝖮𝖳𝖮 𝖣𝖤 𝖯𝖱𝖮𝖥𝖨𝖫 𝖣𝖤𝖫 𝖦𝖱𝖴𝖯 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `      • Grupoo :: *${group.subject}*\n\n` +
        `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Aquí tienes la imagen actual registrada en el grupo. »\n\n` +
        `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`;

    await sock.sendMessage(m.chat, {
        image: { url: pp },
        caption
    }, { quoted: m.raw });
}

export { pluginConfig as config, handler };
