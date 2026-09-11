import config from "../../config.js"
import { getDatabase } from "../../src/lib/rimuru-database.js"
import { getAssetBuffer } from "../../src/lib/rimuru-asset-manager.js"

const pluginConfig = {
    name: "rulesgrup",
    alias: ["grouprules", "aturangrup", "grules"],
    category: "group",
    description: "Muestra las normas y reglas establecidas del grupo de forma detallada.",
    usage: ".rulesgrup",
    example: ".rulesgrup",
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true,
}

const DEFAULT_GROUP_RULES = 
    `ꕥ 𝖱𝖴𝖤𝖫𝖲 𝖸 𝖭𝖮𝖱𝖬𝖠𝖲 𝖣𝖤𝖫 𝖦𝖱𝖴𝖯 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
    `¡Te damos la bienvenida! Para mantener un ambiente amigable, seguro y ordenado para todos, por favor respeta las siguientes normas:\n\n` +
    `      𓈒 ◌ㅤ──    *𝖤𝖳𝖨𝖢𝖠 𝖸 𝖢𝖮𝖬𝖴𝖭𝖨𝖢𝖠𝖢𝖨𝖀́𝖭*\n` +
    `      • Utiliza siempre un lenguaje respetuoso y educado. Quedan prohibidos los insultos y la toxicidad.\n` +
    `      • No realices *spam* masivo de stickers, imágenes o notas de voz.\n` +
    `      • Está prohibido compartir contenido nsfw, violencia explícita o temáticas SARA.\n` +
    `      • Prohibido acosar, intimidar o burlarse de otros participantes.\n\n` +
    `      𓈒 ◌ㅤ──    *𝖤𝖭𝖫𝖠𝖢𝖤𝖲 𝖸 𝖯𝖴𝖡𝖫𝖨𝖢𝖨𝖣𝖠𝖣*\n` +
    `      • No hagas spam de promociones, redes sociales o negocios sin autorización previa de los administradores.\n` +
    `      • Está prohibido enviar links externos o invitaciones a otros grupos de WhatsApp.\n` +
    `      • No difundas noticias falsas (*fake news*) o bulos alarmantes.\n` +
    `      • Queda prohibido enviar archivos o APKs sospechosos con riesgo de virus.\n\n` +
    `      𓈒 ◌ㅤ──    *𝖴𝖲𝖮 𝖣𝖤𝖫 𝖡𝖮𝖳 𝖸 𝖠𝖣𝖬𝖨𝖭𝖲*\n` +
    `      • Usa los comandos de forma moderada, evitando saturar el chat.\n` +
    `      • Sigue las indicaciones de la administración. Las decisiones de los admins son definitivas.\n` +
    `      • Cualquier inconveniente personal, repórtalo en privado a la administración.\n\n` +
    `      𓈒 ◌ㅤ──    *𝖲𝖮𝖭𝖢𝖤𝖰𝖴𝖤𝖭𝖢𝖨𝖠𝖲*\n` +
    `      • Infracciones leves conllevan advertencias (*warnings*).\n` +
    `      • Infracciones graves o reiteradas resultarán en expulsión (*kick*).\n\n` +
    `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Al permanecer en este grupo, aceptas cumplir con cada una de las normas descritas. »\n\n` +
    `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`;

async function handler(m, { sock }) {
    const db = getDatabase()
    const groupData = db.getGroup(m.chat) || {}
    const customRules = groupData.groupRules
    const rulesText = customRules || DEFAULT_GROUP_RULES

    const imageBuffer = getAssetBuffer("rimuru-rules")

    if (imageBuffer) {
        await sock.sendMessage(m.chat, {
            image: imageBuffer,
            caption: rulesText,
        }, { quoted: m })
    } else {
        await m.reply(rulesText)
    }
}

export { pluginConfig as config, handler, DEFAULT_GROUP_RULES }
