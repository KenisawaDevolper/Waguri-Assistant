const pluginConfig = {
    name: 'getpp',
    alias: ['pp', 'profilepic', 'avatar'],
    category: 'group',
    description: 'Obtiene y muestra la foto de perfil de un usuario (mencionando, respondiendo o ingresando su número).',
    usage: '.getpp @user',
    example: '.getpp @628xxx',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
};

async function handler(m, { sock }) {
    let target = m.sender;
    
    if (m.quoted) {
        target = m.quoted.sender;
    } else if (m.mentionedJid?.length) {
        target = m.mentionedJid[0];
    } else if (m.args[0]) {
        let num = m.args[0].replace(/[^0-9]/g, '');
        if (num.startsWith('0')) num = '62' + num.slice(1);
        target = num + '@s.whatsapp.net';
    }
    
    const targetNum = target.split('@')[0];
    
    let ppUrl;
    try {
        ppUrl = await sock.profilePictureUrl(target, 'image');
    } catch {
        ppUrl = 'https://files.catbox.moe/ejy4ky.jpg';
    }

    try { await m.react('🖼️'); } catch {}

    const caption = 
        `ꕥ 𝖥𝖮𝖳𝖮 𝖣𝖤 𝖯𝖱𝖮𝖥𝖨𝖫 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `      • Propietario :: @${targetNum}\n\n` +
        `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Aquí tienes la imagen de perfil solicitada. »\n\n` +
        `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`;

    await sock.sendMedia(m.chat, ppUrl, caption, m, {
        type: 'image',
        mentions: [target]
    });
}

export { pluginConfig as config, handler };
