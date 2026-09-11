import config from "../../config.js"
import { getDatabase } from "../../src/lib/rimuru-database.js"
import { getAssetBuffer } from "../../src/lib/rimuru-asset-manager.js"

const pluginConfig = {
    name: "rules",
    alias: ["reglas", "normas", "rulesbot", "reglasbot", "aturanbot"],
    category: "main",
    description: "Muestra las reglas y normas de uso del bot de forma detallada",
    usage: ".rules",
    example: ".rules",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true,
}

function buildDefaultRules(botName, prefix) {
    return (
        `ꕥ 𝖱𝖤𝖦𝖫𝖠𝖲 𝖣𝖤𝖫 𝖡𝖮𝖳 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `¡Hola! Antes de usar las funciones del bot, por favor lee atentamente y respeta nuestras normas para garantizar un uso correcto y fluido.\n\n` +
        `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « 𝗇𝗈𝗋𝗆⍺𝗌 𝗀ᧉ𝗇ᧉ𝗋⍺𝗅ᧉ𝗌 »\n\n` +
        `        𓈒 ◌ㅤ──    *No Spam* :: Queda prohibido el spam de comandos en corto tiempo. El sistema puede sancionarte automáticamente.\n` +
        `        𓈒 ◌ㅤ──    *Contenido Inapropiado* :: Prohibido enviar contenido NSFW, ilegal, discriminatorio o de odio mediante el bot.\n` +
        `        𓈒 ◌ㅤ──    *Respeto* :: No uses las funciones del bot para acosar, molestar o perjudicar a otros usuarios o grupos.\n` +
        `        𓈒 ◌ㅤ──    *Uso Responsable* :: Utiliza cada comando de manera razonable sin forzar el rendimiento del servidor.\n\n` +
        `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « 𝗎𝗌𝗈 ᑯᧉ 𝖿𝗎𝗇𝖼ɩ𝗈𝗇ᧉ𝗌 »\n\n` +
        `        𓈒 ◌ㅤ──    *Energía & Cooldown* :: Respeta los tiempos de espera y el consumo de energía de cada comando.\n` +
        `        𓈒 ◌ㅤ──    *Reporte de Bugs* :: Si encuentras un fallo, repórtalo con el comando *${prefix}owner*. No te aproveches del error.\n` +
        `        𓈒 ◌ㅤ──    *Funciones Premium* :: Algunas funciones requieren suscripción. Consulta con *${prefix}benefitpremium*.\n\n` +
        `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « 𝗌⍺𝗇𝖼ɩ𝗈𝗇ᧉ𝗌 »\n\n` +
        `        𓈒 ◌ㅤ──    *Infracción Leve* :: Advertencia directa por parte del bot o del administrador.\n` +
        `        𓈒 ◌ㅤ──    *Infracción Grave* :: Bloqueo o Baneo permanente del uso del bot sin previo aviso.\n\n` +
        `· ⛁ :: *Al utilizar este bot, aceptas haber leído y aceptado todas las reglas anteriores.*\n\n` +
        `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    )
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const botName = config.bot?.name || "Waguri Assistant"
    const customRules = db.setting("botRules")

    let rulesText
    if (customRules && typeof customRules === "string" && customRules.trim().length > 0) {
        rulesText = customRules
    } else if (Array.isArray(customRules) && customRules.length > 0) {
        rulesText = 
            `ꕥ 𝖱𝖤𝖦𝖫𝖠𝖲 𝖣𝖤𝖫 𝖡𝖮𝖳 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « 𝗇𝗈𝗋𝗆⍺𝗌 𝗉ᧉ𝗋𝗌𝗈𝗇⍺𝗅ɩ𝗭⍺ᑯ⍺𝗌 »\n\n`
        
        customRules.forEach((rule, i) => {
            rulesText += `      📌   𓈒 ◌ㅤ──    *Regla ${i + 1}* :: ${rule}\n`
        })
        
        rulesText += `\n> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    } else {
        rulesText = buildDefaultRules(botName, m.prefix)
    }

    const imageBuffer = getAssetBuffer("rimuru-rules") || getAssetBuffer("waguri-rules")

    if (imageBuffer) {
        await sock.sendMessage(m.chat, {
            image: imageBuffer,
            caption: rulesText,
        }, { quoted: m })
    } else {
        await m.reply(rulesText)
    }
}

export { pluginConfig as config, handler }
