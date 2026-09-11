const pluginConfig = {
    name: 'pinchat',
    alias: ['pinmsg', 'pinpesan'],
    category: 'group',
    description: 'Fija un mensaje importante dentro del chat grupal por un tiempo determinado.',
    usage: '.pinchat <horas> (respondiendo a un mensaje)',
    example: '.pinchat 24',
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

async function handler(m, { sock, args }) {
    if (!m.quoted || !m.quoted.key || !m.quoted.key.id) {
        return m.reply(
            `ꕥ 𝖲𝖨𝖭 𝖬𝖤𝖲𝖠𝖩𝖤 𝖱𝖤𝖲𝖯𝖮𝖭𝖣𝖨𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `      • Uso correcto :: \`${m.prefix}pinchat [horas]\`\n` +
            `      • Alternativa :: Responde al mensaje que deseas fijar y escribe el comando.\n\n` +
            `      𓈒 ◌ㅤ──    *📋 𝖤𝖩𝖤𝖬𝖯𝖫𝖮𝖲 𝖣𝖤 𝖴𝖲𝖮*\n` +
            `      • \`${m.prefix}pinchat\` — Fija el mensaje por 24 horas por defecto.\n` +
            `      • \`${m.prefix}pinchat 12\` — Fija el mensaje por 12 horas.\n` +
            `      • \`${m.prefix}pinchat 48\` — Fija el mensaje por 48 horas (máximo 720h).\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Por favor, responde al mensaje que quieres destacar en el grupo. »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        );
    }
    
    let duration = 86400; // 24 horas por defecto
    if (args && args.length > 0 && args[0]) {
        const hours = parseInt(args[0]);
        if (!isNaN(hours) && hours >= 1 && hours <= 720) {
            duration = hours * 3600;
        }
    }
    
    try {
        const pinKey = {
            remoteJid: m.chat,
            fromMe: m.quoted.key.fromMe || false,
            id: m.quoted.key.id,
            participant: m.quoted.key.participant || m.quoted.sender
        };
        
        await sock.sendMessage(m.chat, {
            pin: pinKey,
            type: 1,
            time: duration
        });
        
        const durationText = duration >= 86400 
            ? `${Math.floor(duration / 86400)} día(s)` 
            : `${Math.floor(duration / 3600)} hora(s)`;
        
        try { await m.react('📌'); } catch {}

        return m.reply(
            `ꕥ 𝖬𝖤𝖲𝖠𝖩𝖤 𝖥𝖨𝖩𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `      • Duración estimada :: *${durationText}*\n` +
            `      • Estado :: *Anclado correctamente en el grupo*\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « El mensaje ha sido fijado con éxito para todos los participantes. »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`,
            { mentions: [m.sender] }
        );
        
    } catch (error) {
        try { await m.react('☢'); } catch {}
        return m.reply(
            `ꕥ 𝖤𝖱𝖱𝖮𝖱 𝖣𝖤 𝖲𝖨𝖲𝖳𝖤𝖬𝖠 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `      • Motivo :: *No se pudo fijar el mensaje seleccionado*\n` +
            `      • Detalle :: _${error.message}_\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Asegúrate de que el bot tenga permisos de administrador activos. »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        );
    }
}

export { pluginConfig as config, handler };
