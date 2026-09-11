import fs from "fs";
import path from "path";
import { unloadPlugin } from "../../src/lib/rimuru-plugins.js";
import te from "../../src/lib/rimuru-error.js";

const pluginConfig = {
  name: "delplugin",
  alias: ["delpl", "hapusplugin", "removeplugin"],
  category: "owner",
  description: "Elimina un plugin por nombre con la estética Waguri Assistant 🗑️",
  usage: ".delplugin <nama>",
  example: ".delplugin bliblidl",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

function findPluginFile(pluginsDir, name) {
  const folders = fs
    .readdirSync(pluginsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  for (const folder of folders) {
    const folderPath = path.join(pluginsDir, folder);
    const files = fs.readdirSync(folderPath).filter((f) => f.endsWith(".js"));

    for (const file of files) {
      const baseName = file.replace(".js", "");
      if (baseName.toLowerCase() === name.toLowerCase()) {
        return { folder, file, path: path.join(folderPath, file) };
      }
    }
  }

  return null;
}

async function handler(m, { sock }) {
  const name = m.fullArgs?.trim() || m.args?.[0];

  if (!name) {
    return m.reply(
      `Halo *${m.pushName}*, parece que olvidaste ingresar el nombre del plugin que deseas eliminar. 💫\n\n` +
      `Silakan gunakan format perintah berikut:\n` +
      `- .delplugin <nama plugin>\n\n` +
      `Ejemplo penggunaan:\n` +
      `- .delplugin bliblidl`
    );
  }

  await m.react("🕕");

  try {
    const pluginsDir = path.join(process.cwd(), "plugins");
    const found = findPluginFile(pluginsDir, name);

    if (!found) {
      await m.react("❌");
      return m.reply(`Lo siento *${m.pushName}*, plugin dengan nama ${name} no dapat ditemukan.`);
    }

    let unloadResult = { success: false };
    try {
      unloadResult = unloadPlugin(found.path) || { success: true };
    } catch {}

    fs.unlinkSync(found.path);

    await m.react("✅");
    let replyText =
      `Proses selesai! Plugin berhasil eliminado dari sistem.\n\n` +
      `- File: ${found.file}\n` +
      `- Folder: ${found.folder}\n` +
      `- Status Unload: ${unloadResult.success ? "Éxito" : "Pending"}\n\n` +
      `Plugin tersebut sudah eliminado dan no aktif lagi.`;

    return m.reply(replyText);
  } catch (error) {
    await m.react("☢");
    await m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
