import fs from "fs";
import path from "path";
import { hotReloadPlugin } from "../../src/lib/rimuru-plugins.js";
import te from "../../src/lib/rimuru-error.js";

const pluginConfig = {
  name: "addplugin",
  alias: ["addpl", "tambahplugin"],
  category: "owner",
  description: "Añade un nuevo plugin desde el código respondido con la estética Waguri Assistant",
  usage: ".addplugin [nombre] [carpeta]",
  example: ".addplugin bliblidl downloader",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

function extractPluginInfo(code) {
  const info = { name: null, category: null };
  const nameMatch = code.match(/name:\s*['"`]([^'"`]+)['"]/i);
  if (nameMatch) info.name = nameMatch[1];
  const categoryMatch = code.match(/category:\s*['"`]([^'"`]+)['"]/i);
  if (categoryMatch) info.category = categoryMatch[1];
  return info;
}

async function handler(m, { sock }) {
  const quoted = m.quoted;

  if (!quoted) {
    return m.reply(
      `ꕥ 𝖠𝖣𝖣 𝖯𝖫𝖴𝖦𝖨𝖭 𓈒 ◌ ( ᴗ͈ˬᴗ͈ )\n\n` +
      `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Hola *${m.pushName}*, parece que no has respondido al código del plugin. »\n\n` +
      `      𓈒 ◌ㅤ──    *𝖬𝖮𝖣𝖮 𝖣𝖤 𝖴𝖲𝖮*\n` +
      `      • \`${m.prefix}addplugin\` — Detección automática 🌸\n` +
      `      • \`${m.prefix}addplugin <nombre>\` — Nombre personalizado\n` +
      `      • \`${m.prefix}addplugin <nombre> <carpeta>\` — Nombre y carpeta ✨\n\n` +
      `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    );
  }

  let code = quoted.text || quoted.body || "";

  if (
    quoted.mimetype === "application/javascript" ||
    quoted.filename?.endsWith(".js")
  ) {
    try {
      code = (await quoted.download()).toString();
    } catch (e) {
      return m.reply(`ꕥ Error 𓈒 ◌\n\nଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Lo siento *${m.pushName}*, no se pudo descargar el archivo. » ( ᴗ͈ˬᴗ͈ )`);
    }
  }

  if (!code || code.length < 50) {
    return m.reply(`ꕥ Error 𓈒 ◌\n\nଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Lo siento *${m.pushName}*, el código es demasiado corto o inválido. » ( ᴗ͈ˬᴗ͈ )`);
  }

  const hasExport = code.includes("module.exports") || code.includes("export ");
  const hasConfig = code.includes("pluginConfig") || code.includes("config");
  if (!hasExport || !hasConfig) {
    return m.reply(
      `Lo siento *${m.pushName}*, proses gagal karena kode bukan format plugin yang valid. Pastikan ada export dan config di dalamnya.`
    );
  }

  const extracted = extractPluginInfo(code);
  const args = m.args;

  let fileName = args[0] || extracted.name;
  let folderName = args[1] || extracted.category;

  if (!fileName) {
    return m.reply(
      `Lo siento *${m.pushName}*, no pude detectar el nombre del plugin. Por favor usa el formato .addplugin <nombre_archivo>. 💫`
    );
  }

  if (!folderName) folderName = "other";

  fileName = fileName.toLowerCase().replace(/[^a-z0-9\-_]/g, "");
  folderName = folderName.toLowerCase().replace(/[^a-z0-9\-_]/g, "");

  if (!fileName) {
    return m.reply(`Lo siento *${m.pushName}*, el proceso falló porque el nombre del archivo no es válido. 💫`);
  }

  await m.react("🕕");

  try {
    const pluginsDir = path.join(process.cwd(), "plugins");
    const folderPath = path.join(pluginsDir, folderName);
    const filePath = path.join(folderPath, `${fileName}.js`);

    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    if (fs.existsSync(filePath)) {
      await m.react("❌");
      return m.reply(
        `Lo siento *${m.pushName}*, file ${fileName}.js sudah ada di folder ${folderName}.\n\n` +
        `💡 Tips: Gunakan perintah .ganticode ${fileName} ${folderName} si deseas reemplazar el código de un plugin existente. ✨`
      );
    }

    fs.writeFileSync(filePath, code);

    let reloadResult = { success: false };
    try {
      reloadResult = (await hotReloadPlugin(filePath)) || { success: true };
    } catch {}

    await m.react("✅");
    let replyText =
      `Proses selesai! Plugin berhasil ditambahkan ke dalam sistem.\n\n` +
      `- File: ${fileName}.js\n` +
      `- Folder: ${folderName}\n` +
      `- Tamaño: ${code.length} bytes\n` +
      `- Status Reload: ${reloadResult.success ? "Éxito" : "Pending"}\n\n` +
      `Plugin sudah aktif dan siap digunakan, silakan dicoba ya!`;

    return m.reply(replyText);
  } catch (error) {
    await m.react("☢");
    await m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
