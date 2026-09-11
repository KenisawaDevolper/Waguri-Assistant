import { getPlugin } from "../../src/lib/rimuru-plugins.js";
import { getDatabase } from "../../src/lib/rimuru-database.js";

const config = {
  name: "capfree",
  alias: ["capgratis", "setfree"],
  category: "owner",
  description: "Marca muchas funciones como gratuitas a la vez con la estética Waguri Assistant 🆓",
  usage: ".capfree <nama_fitur1> <nama_fitur2> ...",
  example: ".capfree hd jpm warn",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 0,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  if (m.args.length === 0) {
    return m.reply(
      `🆓 *SISTEM CAP FREE*\n\n` +
      `Sistem untuk mengembalikan status akses banyak fitur una vezgus menjadi gratis de forma publik.\n\n` +
      `*PENGGUNAAN:*\n` +
      `- *${m.prefix}capfree <nama_fitur1> <nama_fitur2> ...* — Bisa banyak una vezgus\n\n` +
      `*CONTOH PENGGUNAAN:*\n` +
      `- *${m.prefix}capfree hd jpm warn*\n\n` +
      `*PENJELASAN:*\n` +
      `Ingresa satu atau lebih nama fitur yang ingin digratiskan. Pisahkan con spasi.`
    );
  }

  await m.react("🕕");
  
  const db = getDatabase();
  const overrides = db.setting("capprem") || {};
  
  let successList = [];
  let failedList = [];
  
  for (const cmd of m.args) {
    const targetCommand = cmd.toLowerCase();
    const plugin = getPlugin(targetCommand);
    if (!plugin) {
      failedList.push(targetCommand);
    } else {
      overrides[plugin.config.name] = false;
      successList.push(plugin.config.name);
    }
  }
  
  db.setting("capprem", overrides);
  await db.save();

  await m.react("✅");
  
  let msg = `✅ *STATUS ÉXITO DIUBAH*\n\n`;
  if (successList.length > 0) {
    msg += `*Éxito (FREE 🆓):*\n${successList.map(f => `- ${f}`).join("\n")}\n\n`;
  }
  if (failedList.length > 0) {
    msg += `*Error (No ditemukan):*\n${failedList.map(f => `- ${f}`).join("\n")}\n\n`;
  }
  
  msg += `_Función di atas (yang berhasil) sekarang sudah bebas diakses todos member._`;
  
  return m.reply(msg.trim());
}

export { config, handler };
