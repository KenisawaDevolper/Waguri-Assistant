import fs from 'fs'
import path from 'path'

const pluginConfig = {
    name: 'canal',
    alias: ['channel', 'ch', 'saluran', 'joinch'],
    category: 'main',
    description: 'Muestra el canal oficial de Waguri Assistant 💖',
    usage: '.canal',
    cooldown: 5,
    isEnabled: true
}

async function handler(m, { sock }) {

    const chBot = 'https://whatsapp.com/channel/0029VbD4qs1B4hdauCwffB33'

    // 🖼️ Ruta de la imagen
    const imgPath = path.join(process.cwd(), 'assets', 'images', 'zerotwo2.jpg')
    let imageBuffer = null

    if (fs.existsSync(imgPath)) {
        imageBuffer = fs.readFileSync(imgPath)
    } else {
        return m.reply('✐ ¡No se encontró la imagen en assets/images/ ! ୧ ֹ ִ')
    }

    const caption = 
        `ꕥ 𝖢𝖠𝖭𝖠𝖫 𝖮𝖥𝖨𝖢𝖨𝖠𝖫 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « ú𝗇ᧉƚᧉ ⍺ 𝗇𝗎ᧉ𝗌ƚ𝗋⍺ 𝖼𝗈𝗆𝗎𝗇ɩᑯ⍺ᑯ »\n\n` +
        `        𓈒 ◌ㅤ──    𝖼⍺𝗇⍺𝗅 :: *Waguri Assistant*\n` +
        `        𓈒 ◌ㅤ──    ⍺𝖼ƚ𝗎⍺𝗅ɩ𝗭⍺𝖼ɩ𝗈𝗇ᧉ𝗌 :: *Novedades & Bot*\n\n` +
        `· ⛁ :: ¡Únete para no perderte ninguna actualización ni nueva función!\n\n` +
        `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`

    try {

        await sock.sendMessage(m.chat, {
            image: imageBuffer,
            caption: caption,
            footer: 'Waguri Assistant 💖',
            interactiveButtons: [
                {
                    name: 'cta_url',
                    buttonParamsJson: JSON.stringify({
                        display_text: '📢 Unirse al Canal Oficial',
                        url: chBot
                    })
                }
            ]
        }, { quoted: m })

    } catch (err) {
        console.log(err)
        m.reply('✐ Ocurrió un error al enviar la información del canal ! ୧ ֹ ִ')
    }

}

export { pluginConfig as config, handler };
