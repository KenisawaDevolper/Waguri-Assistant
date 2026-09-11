import config from '../../config.js'
/**
 * @file plugins/owner/self.js
 * @description Plugin para activar el modo self (solo owner y bot)
 */
import { getDatabase } from '../../src/lib/rimuru-database.js'
import te from '../../src/lib/rimuru-error.js'
const pluginConfig = {
    name: 'self',
    alias: ['selfmode', 'private-mode'],
    category: 'owner',
    description: 'Activa el modo self (solo owner y bot pueden usarlo) con la estética Waguri Assistant 🔒',
    usage: '.self',
    example: '.self',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
};

/**
 * Handler para el comando self
 */
async function handler(m, { sock }) {
    try {
        const isRealOwner = validateOwner(m);
        if (!isRealOwner) {
            return await m.reply('🚫 *ᴀᴄᴄᴇsᴏ ᴅᴇɴᴇɢᴀᴅᴏ*\n\n> ¡Solo el owner puede cambiar el modo del bot!');
        }
        const currentModo = config.mode;
        if (currentModo === 'self') {
            return await m.reply('ℹ️ El bot ya está en modo *self*');
        }
        config.mode = 'self';
        const db = getDatabase();
        db.setting('botModo', 'self');
        
        const responseText = `🔒 *ᴍᴏᴅᴏ sᴇʟꜰ ᴀᴄᴛɪᴠᴏ*\n\n` +
            `> El bot ahora solo responderá a:\n` +
            `> • Owner del bot\n` +
            `> • El bot mismo (fromMe)\n\n` +
            `_Usa .public para abrir el acceso_`;
        await m.reply(responseText);
        console.log(`[Modo] Changed to SELF by ${m.pushName} (${m.sender})`);
    } catch (error) {
        console.error('[Self Command Error]', error);
        await m.reply(te(m.prefix, m.command, m.pushName));
    }
}

/**
 * Validación de owner con múltiples verificaciones
 */
function validateOwner(m) {
    if (!m.isOwner) return false;
    if (m.fromMe) return true;
    const senderNumber = m.sender?.replace(/[^0-9]/g, '') || '';
    const ownerNumbers = config.owner?.number || [];
    
    const isInOwnerList = ownerNumbers.some(owner => {
        const cleanOwner = owner.replace(/[^0-9]/g, '');
        return senderNumber.includes(cleanOwner) || cleanOwner.includes(senderNumber);
    });
    if (!isInOwnerList) return false;
    if (!m.sender || !m.sender.includes('@')) return false;
    return true;
}

export { pluginConfig as config, handler }