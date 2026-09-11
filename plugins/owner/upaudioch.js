import config from '../../config.js';
const pluginConfig = {
    name: 'upaudioch',
    alias: ['tovnsaluran', 'uploadaudioch', 'upaudiosaluran'],
    category: 'owner',
    description: 'Upload audio ke saluran (channel) WhatsApp',
    usage: '.upaudioch (reply audio) <teks>',
    example: '.upaudioch Mensaje dari owner',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const quoted = m.quoted
    
    if (!quoted) {
        return m.reply(
            `💕 *ᴜᴘʟᴏᴀᴅ ᴀᴜᴅɪᴏ ᴛᴏ ᴄʜᴀɴɴᴇʟ* 💕\n\n` +
            `╭━━━━━━━━━━━━━━━━━━━━━⬣\n` +
            `┃ ✦ *Cara Pakai*\n` +
            `┃\n` +
            `┃   Reply audio con caption\n` +
            `┃   ${m.prefix}upaudioch <teks>\n` +
            `┃\n` +
            `┃ ✦ *Ejemplo*\n` +
            `┃\n` +
            `┃   ${m.prefix}upaudioch Info terbaru!\n` +
            `┃\n` +
            `┃ 💗 *Zero Two:* Mau upload audio ke channel apa cariño~?\n` +
            `╰━━━━━━━━━━━━━━━━━━━━━⬣`
        )
    }
    
    const text = m.args.join(' ') || m.text?.trim() || 'Audio dari Owner'
    
    // 🔥 AMBIL ID CHANNEL DARI CONFIG
    const CHANNEL_ID = config.saluran?.id
    if (!CHANNEL_ID) {
        return m.reply(
            `❌ *ᴇʀʀᴏʀ*\n\n` +
            `> ID Saluran no encontrado di config!\n` +
            `> Cek bagian \`saluran.id\` di config.js`
        )
    }
    
    const mime = quoted.mimetype || quoted.msg?.mimetype || ''
    
    if (!/audio/.test(mime)) {
        return m.reply(`❌ *ᴇʀʀᴏʀ*\n\n> Reply audio/voice note yang mau diupload cariño~ 🥺`)
    }
    
    m.react('💕')
    await m.reply(`⏳ *ᴘʀᴏᴄᴇꜱꜱɪɴɢ...*\n\n💗 *Zero Two:* Lagi upload audio ke channel cariño~ tunggu sebentar yaa 🎵`)
    
    try {
        const audioBuffer = await quoted.download()
        
        if (!audioBuffer) {
            throw new Error('Error download audio')
        }
        
        await sock.sendMessage(CHANNEL_ID, {
            audio: audioBuffer,
            mimetype: 'audio/mpeg',
            ptt: true,
            contextInfo: {
                isForwarded: true,
                mentionedJid: [m.sender],
                businessMessageForwardInfo: {
                    businessOwnerJid: "0@s.whatsapp.net"
                },
                forwardedNewsletterMessageInfo: {
                    newsletterName: `${text}`,
                    newsletterJid: CHANNEL_ID
                }
            }
        })
        
        m.react('✅')
        
        await m.reply(
            `✅ *ᴜᴘʟᴏᴀᴅ sᴜᴄᴄᴇss*\n\n` +
            `╭━━━━━━━━━━━━━━━━━━━━━⬣\n` +
            `┃ 🎵 *ᴀᴜᴅɪᴏ*: Éxito dikirim\n` +
            `┃ 📢 *ᴄʜᴀɴɴᴇʟ*: ${CHANNEL_ID}\n` +
            `┃ 📝 *ᴘᴇꜱᴀɴ*: ${text}\n` +
            `┃\n` +
            `┃ 💗 *Zero Two:* Audio sudah terkirim cariño~ 🎤\n` +
            `╰━━━━━━━━━━━━━━━━━━━━━⬣`
        )
        
    } catch (err) {
        console.error('[UpAudioCh] Error:', err)
        m.react('💔')
        await m.reply(
            `💔 *ᴇʀʀᴏʀ*\n\n` +
            `> ${err.message}\n\n` +
            `> Inténtalo de nuevo, cariño~ 🥺`
        )
    }
}

export { pluginConfig as config, handler };
