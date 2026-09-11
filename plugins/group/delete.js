const pluginConfig = {
    name: 'delete',
    alias: ['del', 'hapus', 'd'],
    category: 'group',
    description: 'Elimina un mensaje respondiendo a él.',
    usage: '.delete (respondiendo a un mensaje)',
    example: '.delete',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    isBotAdmin: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
};

async function handler(m, { sock }) {
    if (!m.quoted) {
        return m.reply(
            `ꕥ 𝖱𝖤𝖯𝖫𝖸 𝖱𝖤𝖰𝖴𝖤𝖱𝖨𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Debes responder al mensaje que deseas eliminar. »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        );
    }

    const quotedSender = m.quoted.sender || m.quoted.key?.participant;
    const botJid = sock.user?.id?.split(':')[0] + '@s.whatsapp.net';
    const isOwnMessage = m.quoted.key?.fromMe || quotedSender === m.sender;
    const isBotMessage = quotedSender === botJid || m.quoted.key?.fromMe;

    if (!isOwnMessage && !isBotMessage) {
        if (!m.isBotAdmin) {
            return m.reply(
                `ꕥ 𝖡𝖮𝖳 𝖲𝖨𝖭 𝖯𝖤𝖱𝖬𝖨𝖲𝖮𝖲 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « El bot necesita ser administrador del grupo para poder eliminar mensajes de otros usuarios. »\n\n` +
                `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
            );
        }
        if (!m.isAdmin && !m.isOwner) {
            return m.reply(
                `ꕥ 𝖠𝖢𝖢𝖤𝖲𝖮 𝖣𝖤𝖭𝖤𝖦𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Solo los administradores pueden eliminar mensajes enviados por otros miembros. »\n\n` +
                `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
            );
        }
    }

    try {
        const key = {
            remoteJid: m.chat,
            id: m.quoted.key.id,
            fromMe: m.quoted.key.fromMe,
            participant: quotedSender
        };

        await sock.sendMessage(m.chat, { delete: key });
        try { await m.react('✅'); } catch {}

    } catch (err) {
        try { await m.react('❌'); } catch {}
        if (err.message?.includes('not found') || err.message?.includes('forbidden')) {
            await m.reply(
                `ꕥ 𝖤𝖱𝖱𝖮𝖱 𝖣𝖤 𝖤𝖫𝖨𝖬𝖨𝖭𝖠𝖢𝖨Ó𝖭 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « No se pudo eliminar el mensaje. Es posible que ya haya sido borrado o sea demasiado antiguo. »\n\n` +
                `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
            );
        }
    }
}

export { pluginConfig as config, handler };
