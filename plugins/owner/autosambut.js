import { getDatabase } from "../../src/lib/rimuru-database.js";

const pluginConfig = {
  name: "autosambut",
  alias: ["sambutowner"],
  category: "group",
  description: "Configura el saludo automático cuando el owner aparece tras estar inactivo con la estética Waguri Assistant 👋",
  usage: ".autosambut on/off/delay/add/del/list",
  example: ".autosambut on",
  isOwner: true,
  isGroup: true,
  cooldown: 3,
  isEnabled: true,
};

function parseTime(str) {
  const match = str.match(/^([\d.]+)([a-zA-Z]+)$/);
  if (!match) return null;
  const val = parseFloat(match[1]);
  const unit = match[2].toLowerCase();

  if (unit.startsWith('s')) return val * 1000;
  if (unit.startsWith('m')) return val * 60 * 1000;
  if (unit.startsWith('h')) return val * 60 * 60 * 1000;
  if (unit.startsWith('d')) return val * 24 * 60 * 60 * 1000;
  if (unit.startsWith('w')) return val * 7 * 24 * 60 * 60 * 1000;
  if (unit.startsWith('y')) return val * 365 * 24 * 60 * 60 * 1000;
  return null;
}

function formatTime(ms) {
  if (ms < 60000) return `${ms / 1000} detik`;
  if (ms < 3600000) return `${ms / 60000} menit`;
  if (ms < 86400000) return `${ms / 3600000} jam`;
  if (ms < 604800000) return `${ms / 86400000} hari`;
  return `${ms / 86400000} hari`;
}

async function handler(m, { sock, db }) {
  const args = m.args || [];
  const action = args[0]?.toLowerCase();
  const isGlobal = args.includes("--global");

  const database = getDatabase();
  let groupData = database.getGroup(m.chat);
  if (!groupData.autoSambut) {
    groupData.autoSambut = {
      enabled: false,
      delayMs: 2 * 60 * 60 * 1000,
      pesanList: ["Halo {user}! Selamat datang kembali 🙇‍♂️"],
      lastChats: {}
    };
    database.setGroup(m.chat, { autoSambut: groupData.autoSambut });
  }
  if (groupData.autoSambut.pesan !== undefined) {
    if (!groupData.autoSambut.pesanList) {
      groupData.autoSambut.pesanList = [groupData.autoSambut.pesan];
    }
    delete groupData.autoSambut.pesan;
    database.setGroup(m.chat, { autoSambut: groupData.autoSambut });
  }
  // Fallback
  if (!Array.isArray(groupData.autoSambut.pesanList) || groupData.autoSambut.pesanList.length === 0) {
    groupData.autoSambut.pesanList = ["Halo {user}! Selamat datang kembali 🙇‍♂️"];
  }

  if (!action) {
    const status = groupData.autoSambut.enabled ? "Aktif ✅" : "Nonaktif ❌";
    const delayMs = groupData.autoSambut.delayMs || 7200000;
    const totalMensaje = groupData.autoSambut.pesanList.length;

    return m.reply(
      `⚠️ *SISTEM AUTO SAMBUT*\n\n` +
      `Sistem otomatis menyambut owner di grup de forma acak ketika owner muncul setelah lama idle.\n` +
      `Status: *${status}*\n` +
      `Batas Hora Idle: *${formatTime(delayMs)}*\n` +
      `Jumlah Mensaje Acak: *${totalMensaje} Sapaan*\n\n` +
      `*PENGGUNAAN UTAMA:*\n` +
      `• *${m.prefix}autosambut on/off* — Menghidupkan/mematikan fitur di grup ini\n` +
      `• *${m.prefix}autosambut delay <waktu>* — Mengubah batas waktu idle\n\n` +
      `*PENGATURAN PESAN ACAK (LIST):*\n` +
      `• *${m.prefix}autosambut list* — Melihat todos sapaan yang telah didaftarkan\n` +
      `• *${m.prefix}autosambut add <teks>* — Menambah teks sambutan baru ke daftar\n` +
      `• *${m.prefix}autosambut del <angka>* — Menghapus pesan pada nomor urutan tertentu\n\n` +
      `*PENJELASAN KHUSUS:*\n` +
      `1. Gunakan format waktu: *s* (detik), *m* (menit), *h* (jam), *d* (hari). Ejemplo: *${m.prefix}autosambut delay 30m*\n` +
      `2. Gunakan *{name}* untuk menyebut pushname owner, dan *{user}* untuk me-mention owner.\n` +
      `3. ¡Si añades el atributo *--global* al final del comando, la configuración de *este* grupo se copiará a TODOS los grupos donde está el bot! ✨`
    );
  }

  if (action === "on" || action === "off") {
    const isEnable = action === "on";
    if (isGlobal) {
      const groups = await sock.groupFetchAllParticipating();
      let count = 0;
      for (const jid of Object.keys(groups)) {
        let gData = database.getGroup(jid) || {};
        gData.autoSambut = {
          enabled: isEnable,
          delayMs: groupData.autoSambut.delayMs,
          pesanList: [...groupData.autoSambut.pesanList],
          lastChats: {}
        };
        database.setGroup(jid, { autoSambut: gData.autoSambut });
        count++;
      }
      return m.reply(`${isEnable ? '✅' : '❌'} *Función Auto Saludo Global ${isEnable ? 'Activada' : 'Desactivada'}!*\n\nSemua grup (${count}) sekarang menggunakan sistem sapaan yang sama con grup ini.`);
    }

    groupData.autoSambut.enabled = isEnable;
    database.setGroup(m.chat, { autoSambut: groupData.autoSambut });
    return m.reply(isEnable ? `✅ *Función Auto Sambut Activada!*` : `❌ *Función Auto Sambut Desactivada.*`);
  }

  if (action === "delay") {
    const timeInput = args[1];
    if (!timeInput) return m.reply(`Tolong berikan waktu! Ejemplo: \`${m.prefix}autosambut delay 2h\``);

    const parsedMs = parseTime(timeInput);
    if (!parsedMs) {
      return m.reply(`Format waktu no dikenali. Gunakan angka dan akhiran s, m, h, d, w, y. Ejemplo: \`2h\` (2 jam), \`30m\` (30 menit).`);
    }

    if (isGlobal) {
      const groups = await sock.groupFetchAllParticipating();
      let count = 0;
      for (const jid of Object.keys(groups)) {
        let gData = database.getGroup(jid) || {};
        gData.autoSambut = {
          enabled: groupData.autoSambut.enabled,
          delayMs: parsedMs,
          pesanList: [...groupData.autoSambut.pesanList],
          lastChats: {}
        };
        database.setGroup(jid, { autoSambut: gData.autoSambut });
        count++;
      }
      return m.reply(`⏱️ *Retardo de Auto Saludo Global cambiado a ${formatTime(parsedMs)} untuk ${count} grup!*`);
    }

    groupData.autoSambut.delayMs = parsedMs;
    database.setGroup(m.chat, { autoSambut: groupData.autoSambut });
    return m.reply(`⏱️ *Delay Auto Sambut Diubah!*\n\nAhora el bot te saludará después de que no escribas nada en este grupo durante *${formatTime(parsedMs)}* consecutivos. ✨`);
  }

  if (action === "list") {
    let listText = `📜 *DAFTAR PESAN AUTO SAMBUT*\n\nTotal ada *${groupData.autoSambut.pesanList.length}* sapaan acak yang terdaftar di grup ini:\n\n`;
    groupData.autoSambut.pesanList.forEach((text, index) => {
      listText += `*${index + 1}.* ${text}\n\n`;
    });
    listText += `_Gunakan \`${m.prefix}autosambut del <angka>\` untuk menghapus salah satu._`;
    return m.reply(listText);
  }

  if (action === "add") {
    const newMsg = args.slice(1).filter(v => v !== '--global').join(" ").trim();
    if (!newMsg) {
      return m.reply(`Tolong masukkan teks sambutannya.\nEjemplo: \`${m.prefix}autosambut add Halo bosku {user}!\``);
    }

    groupData.autoSambut.pesanList.push(newMsg);
    database.setGroup(m.chat, { autoSambut: groupData.autoSambut });

    if (isGlobal) {
      const groups = await sock.groupFetchAllParticipating();
      let count = 0;
      for (const jid of Object.keys(groups)) {
        let gData = database.getGroup(jid) || {};
        gData.autoSambut = {
          enabled: groupData.autoSambut.enabled,
          delayMs: groupData.autoSambut.delayMs,
          pesanList: [...groupData.autoSambut.pesanList],
          lastChats: {}
        };
        database.setGroup(jid, { autoSambut: gData.autoSambut });
        count++;
      }
      return m.reply(`💬 *Mensaje Baru Añadido ke Daftar Global (${count} grup)!*\n\nMensaje terdaftar:\n"${newMsg}"`);
    }

    return m.reply(`💬 *Mensaje Baru Éxito Añadido!*\nKini ada ${groupData.autoSambut.pesanList.length} sapaan acak di dalam daftar.`);
  }

  if (action === "del") {
    const indexInput = parseInt(args[1]);
    if (isNaN(indexInput) || indexInput < 1 || indexInput > groupData.autoSambut.pesanList.length) {
      return m.reply(`Por favor ingresa un número de mensaje válido. 💫\nLihat daftar angka con \`${m.prefix}autosambut list\`.`);
    }
    if (groupData.autoSambut.pesanList.length <= 1) {
      return m.reply(`Error eliminado! Harus ada minimal 1 pesan di dalam daftar sapaan grup ini.`);
    }

    const removedMsg = groupData.autoSambut.pesanList.splice(indexInput - 1, 1)[0];
    database.setGroup(m.chat, { autoSambut: groupData.autoSambut });

    if (isGlobal) {
      const groups = await sock.groupFetchAllParticipating();
      let count = 0;
      for (const jid of Object.keys(groups)) {
        let gData = database.getGroup(jid) || {};
        gData.autoSambut = {
          enabled: groupData.autoSambut.enabled,
          delayMs: groupData.autoSambut.delayMs,
          pesanList: [...groupData.autoSambut.pesanList],
          lastChats: {}
        };
        database.setGroup(jid, { autoSambut: gData.autoSambut });
        count++;
      }
      return m.reply(`🗑️ *Mensaje Éxito Eliminado Secara Global (${count} grup)!*\n\nTerhapus:\n"${removedMsg}"`);
    }

    return m.reply(`🗑️ *Mensaje Éxito Eliminado!*\n\nTerhapus:\n"${removedMsg}"\nRestantes saludos: ${groupData.autoSambut.pesanList.length}`);
  }

  if (action === "pesan") {
    return m.reply(`⚠️ Perintah \`pesan\` telah usang dan digantikan oleh sistem acak.\nSilakan gunakan \`${m.prefix}autosambut add <teks>\` untuk menambahkan sapaan, atau \`${m.prefix}autosambut list\` untuk melihat daftar sapaan.`);
  }

  return m.reply(`Comando no válido. Intenta escribir \`${m.prefix}autosambut\` sin extras para ver la guía. 💫`);
}

export { pluginConfig as config, handler };
