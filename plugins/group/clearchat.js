import te from '../../src/lib/rimuru-error.js';

const pluginConfig = {
    name: 'clearchat',
    alias: ['cc', 'cleangc', 'deletechat', 'delchat'],
    category: 'group',
    description: 'Limpia o vacía el historial de chat del grupo.',
    usage: '.clearchat',
    example: '.clearchat',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    isBotAdmin: true,
    cooldown: 60,
    energi: 0,
    isEnabled: true
};

async function handler(m, { sock }) {
    try { await m.react('🗑️'); } catch {}
    
    try {
        const now = Math.floor(Date.now() / 1000);
        
        await sock.chatModify({ 
            delete: true, 
            lastMessages: [{ 
                key: m.key, 
                messageTimestamp: m.messageTimestamp || now
            }] 
        }, m.chat);
        
        await sock.sendMessage(m.chat, {
            text: `ꕥ 𝖢𝖧𝖠𝖳 𝖫𝖨𝖬𝖯𝖨𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                `      𓈒 ◌ㅤ──    *𝖣𝖤𝖳𝖠𝖫𝖫𝖤𝖲*\n` +
                `      • Estado :: Chat limpiado con éxito ✅\n` +
                `      • Ejecutado por :: @${m.sender.split('@')[0]}\n\n` +
                `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « El historial de mensajes ha sido depurado. »\n\n` +
                `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`,
            mentions: [m.sender]
        }, { quoted: m });
        
    } catch (error) {
        try {
            await sock.chatModify({ 
                clear: { 
                    messages: [{ 
                        id: m.key.id, 
                        fromMe: m.key.fromMe,
                        timestamp: Math.floor(Date.now() / 1000)
                    }] 
                } 
            }, m.chat);
            
            await sock.sendMessage(m.chat, {
                text: `ꕥ 𝖢𝖧𝖠𝖳 𝖫𝖨𝖬𝖯𝖨𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                    `      𓈒 ◌ㅤ──    *𝖣𝖤𝖳𝖠𝖫𝖫𝖤𝖲*\n` +
                    `      • Estado :: Limpiado secundario completado ✅\n` +
                    `      • Ejecutado por :: @${m.sender.split('@')[0]}\n\n` +
                    `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « El chat del bot ha sido depurado. Revisa tu aplicación. »\n\n` +
                    `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`,
                mentions: [m.sender]
            }, { quoted: m });
        } catch (e) {
            try { await m.react('☢'); } catch {}
            m.reply(te(m.prefix, m.command, m.pushName));
        }
    }
}

export { pluginConfig as config, handler };
