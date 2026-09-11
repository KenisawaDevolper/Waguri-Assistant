import fs from "fs"
import path from "path"
import { hotReloadPlugin, loadPlugins, getPlugin, pluginStore } from "../../src/lib/rimuru-plugins.js"
import { logger } from "../../src/lib/rimuru-logger.js"

const pluginConfig = {
    name: "reload",
    alias: ["rload", "recargar", "refresh", "update"],
    category: "owner",
    description: "Recargar plugins sin reiniciar el bot 🌸",
    usage: ".reload [plugin] | .reload all",
    example: ".reload menu\n.reload all",
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const args = m.args || []
    const target = (args[0] || "").toLowerCase().trim()

    if (!target) {
        return m.reply(
            `ꕥ 𝖱𝖤𝖫𝖮𝖠𝖣 • 𝑊⍺ց𝗎𝗋ı ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `      𓈒 ◌ㅤ──    *𝖴𝖲𝖮*\n` +
            `      • \`${m.prefix}reload <nombre>\` — Recarga un plugin\n` +
            `      • \`${m.prefix}reload all\` — Recarga TODOS\n` +
            `      • \`${m.prefix}reload list\` — Ver plugins cargados\n\n` +
            `      𓈒 ◌ㅤ──    *𝖤𝖩𝖤𝖬𝖯𝖫𝖮𝖲*\n` +
            `      • \`${m.prefix}reload menu\`\n` +
            `      • \`${m.prefix}reload stacktower\`\n` +
            `      • \`${m.prefix}reload all\`\n\n` +
            `> 𝗐⍺𝗀𝗎ɾı ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ 🌸`
        )
    }

    if (target === "list" || target === "lista") {
        const all = [...pluginStore.commands.keys()].sort()
        const total = all.length
        const preview = all.slice(0, 40).join(", ")
        return m.reply(
            `ꕥ 𝖯𝖫𝖴𝖦𝖨𝖭𝖲 𝖢𝖠𝖱𝖦𝖠𝖣𝖮𝖲 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `      • Total :: *${total}*\n` +
            `      • Lista :: ${preview}${total > 40 ? ` +${total - 40} más` : ""}\n\n` +
            `> Usa \`${m.prefix}reload <nombre>\` para recargar uno`
        )
    }

    if (target === "all" || target === "todo" || target === "todos") {
        await m.react("🔄").catch(()=>{})
        const start = Date.now()
        try {
            const pluginsPath = path.join(process.cwd(), "plugins")
            const count = await loadPlugins(pluginsPath)
            const ms = Date.now() - start
            await m.react("✅").catch(()=>{})
            return m.reply(
                `ꕥ 𝖱𝖤𝖫𝖮𝖠𝖣 𝖠𝖫𝖫 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                `      • Estado :: *Recargados ${count} plugins* ✅\n` +
                `      • Tiempo :: *${ms}ms*\n\n` +
                `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « No necesitas reiniciar. »\n\n` +
                `> 𝗐⍺𝗀𝗎ɾı ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ 🌸`
            )
        } catch (e) {
            await m.react("❌").catch(()=>{})
            return m.reply(`❌ Error al recargar todos: ${e.message}`)
        }
    }

    // reload single plugin
    const plugin = getPlugin(target)
    if (!plugin) {
        return m.reply(
            `❌ Plugin *${target}* no encontrado\n` +
            `> Prueba \`${m.prefix}reload list\` para ver nombres`
        )
    }

    const filePath = plugin.filePath
    if (!filePath || !fs.existsSync(filePath)) {
        return m.reply(`❌ No se encontró el archivo de *${target}*`)
    }

    await m.react("🔄").catch(()=>{})
    try {
        const result = await hotReloadPlugin(filePath, plugin.config.category)
        if (result.success) {
            await m.react("✅").catch(()=>{})
            return m.reply(
                `ꕥ 𝖱𝖤𝖫𝖮𝖠𝖣 𝖮𝖪 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                `      • Plugin :: *${result.name || target}*\n` +
                `      • Archivo :: \`${path.relative(process.cwd(), filePath)}\`\n` +
                `      • Categoría :: *${plugin.config.category}*\n\n` +
                `> 𝗐⍺𝗀𝗎ɾı ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ 🌸 ( ᴗ͈ˬᴗ͈ )`
            )
        } else {
            await m.react("❌").catch(()=>{})
            return m.reply(`❌ Falló recarga de *${target}*: ${result.error}`)
        }
    } catch (e) {
        await m.react("❌").catch(()=>{})
        return m.reply(`❌ Error: ${e.message}`)
    }
}

export { pluginConfig as config, handler }
