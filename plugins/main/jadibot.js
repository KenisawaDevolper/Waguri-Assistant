import { startJadibot, isJadibotActive } from '../../src/lib/rimuru-jadibot-manager.js'

const pluginConfig = {
    name: 'jadibot',
    alias: ['jadibotqr', 'code', 'bot'],
    category: 'main',
    description: 'Convierte tu número en un bot (Código de emparejamiento / QR) estilo Waguri',
    usage: '.jadibot o .jadibot qr',
    example: '.jadibot',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 30,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const sender = m.sender
    if (!sender) {
        return m.reply(
            `ꕥ 𝖤𝖱𝖱𝖮𝖱 𝖣𝖤 𝖲𝖨𝖲𝖳𝖤𝖬𝖠 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « No se pudo identificar tu número correctamente. »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        )
    }

    if (isJadibotActive(sender)) {
        return m.reply(
            `ꕥ 𝖩𝖠𝖣𝖨𝖡𝖮𝖳 𝖠𝖢𝖳𝖨𝖵𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `      • Estado :: Tu número ya está funcionando como un bot.\n` +
            `      • Comando :: Escribe \`${m.prefix}stopjadibot\` para detenerlo.\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        )
    }

    const arg = (m.args?.[0] || '').toLowerCase()
    const useQR = arg === 'qr'

    if (useQR) {
        await m.reply(
            `ꕥ 𝖩𝖠𝖣𝖨𝖡𝖮𝖳 — 𝖰𝖱 𝖬𝖮𝖣𝖤 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `      • Estado :: Preparando conexión...\n` +
            `      • Acción :: Escanea el código QR que se enviará en breve.\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        )
    } else {
        await m.reply(
            `ꕥ 𝖩𝖠𝖣𝖨𝖡𝖮𝖳 — 𝖯𝖠𝖨𝖱𝖨𝖭𝖦 𝖢𝖮𝖣𝖤 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `      • Estado :: Preparando conexión...\n` +
            `      • Acción :: Generando código de emparejamiento.\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        )
    }

    try {
        await startJadibot(sock, m, sender, !useQR)
    } catch (e) {
        await m.reply(
            `ꕥ 𝖩𝖠𝖣𝖨𝖡𝖮𝖳 𝖥𝖠𝖫𝖫𝖨𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `      • Motivo :: ${e.message || 'Ocurrió un error inesperado'}\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Inténtalo nuevamente en unos minutos. »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        )
    }
}

export { pluginConfig as config, handler }
