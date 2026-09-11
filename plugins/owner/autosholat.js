import * as timeHelper from "../../src/lib/rimuru-time.js";
import { getDatabase } from "../../src/lib/rimuru-database.js";
import config from "../../config.js";
import {
  getTodaySchedule,
  extractPrayerTimes,
  searchKota,
} from "../../src/lib/rimuru-sholat-api.js";
import te from "../../src/lib/rimuru-error.js";

const pluginConfig = {
  name: "autosholat",
  alias: ["sholat", "autoadzan"],
  category: "owner",
  description: "Alterna el recordatorio automático de oración con audio de adhan y cierre de grupo con la estética Waguri Assistant 🕌",
  usage: ".autosholat on/off/status/kota <nama>",
  example: ".autosholat on",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

const AUDIO_ADZAN = "https://media.vocaroo.com/mp3/1ofLT2YUJAjQ";

async function handler(m, { sock, db }) {
  const args = m.args[0]?.toLowerCase();
  const database = getDatabase();
  
  if (!args || args === "status") {
    const status = database.setting("autoSholat") ? "Aktif ✅" : "Nonaktif ❌";
    const closeGroup = database.setting("autoSholatCloseGroup") ? "Ya ✅" : "No ❌";
    const duration = database.setting("autoSholatDuration") || 5;
    const kotaSetting = database.setting("autoSholatKota") || { id: "1301", nama: "KOTA JAKARTA" };
    
    let jadwalText = "";
    try {
      const jadwalData = await getTodaySchedule(kotaSetting.id);
      const times = extractPrayerTimes(jadwalData);
      for (const [nama, waktu] of Object.entries(times)) {
        jadwalText += `- **${nama.charAt(0).toUpperCase() + nama.slice(1)}**: ${waktu}\n`;
      }
    } catch {
      jadwalText = "- Error memuat jadwal dari MyQuran\n";
    }

    return m.reply(
      `🕌 **Auto Sholat - Sistem Recordatorio Hora Beribadah**\n\n` +
      `El sistema está configurado para ayudarte a ti y a los miembros del grupo a recordar los tiempos de oración automáticamente. Esta es la configuración actual: ✨\n\n` +
      `- **Status Recordatorio**: ${status}\n` +
      `- **Penutupan Grupo Otomatis**: ${closeGroup}\n` +
      `- **Durasi Penutupan**: ${duration} menit\n` +
      `- **Lokasi Recordatorio Saat Ini**: ${kotaSetting.nama}\n\n` +
      `**Horario Sholat Día Ini:**\n` +
      jadwalText + `\n` +
      `**Panduan Pengaturan Función:**\n` +
      `- Ketik \`${m.prefix}autosholat on\` untuk mengaktifkan sistem pengingat.\n` +
      `- Ketik \`${m.prefix}autosholat off\` untuk mematikan sistem pengingat.\n` +
      `- Ketik \`${m.prefix}autosholat close on\` atau \`off\` untuk menyalakan/mematikan fitur tutup grup otomatis.\n` +
      `- Ketik \`${m.prefix}autosholat duration <angka>\` untuk menentukan berapa lama grup akan ditutup (dalam menit).\n` +
      `- Ketik \`${m.prefix}autosholat kota <nama daerah>\` para sincronizar el horario de oración con la región que elijas.\n\n` +
      `_Semua jadwal diambil de forma presisi dan langsung dari pusat data MyQuran API._`
    );
  }

  if (args === "on") {
    database.setting("autoSholat", true);
    await m.react("✅");
    const kota = database.setting("autoSholatKota") || { nama: "KOTA JAKARTA" };
    return m.reply(
      `✅ **Sistem Recordatorio Sholat Éxito Activada!**\n\n` +
      `A partir de ahora, enviaré notificaciones con audio del adhan justo a la hora de la oración. Toda la información está ajustada a la zona horaria de **${kota.nama}** ya!`
    );
  }

  if (args === "off") {
    database.setting("autoSholat", false);
    await m.react("❌");
    return m.reply(
      `❌ **Sistem Recordatorio Sholat Desactivada.**\n\n` +
      `De acuerdo, ya no transmitiré el horario de oración ni reproduciré el audio del adhan automáticamente en los grupos.`
    );
  }

  if (args === "close") {
    const subArg = m.args[1]?.toLowerCase();
    if (subArg === "on") {
      database.setting("autoSholatCloseGroup", true);
      await m.react("🔒");
      return m.reply(
        `🔒 **Función Tutup Grupo Otomatis Activada!**\n\n` +
        `Cuando llegue la hora de la oración, cerraré automáticamente el chat del grupo para que todos puedan concentrarse en rezar. ¡Genial, ¿verdad? ✨`
      );
    }
    if (subArg === "off") {
      database.setting("autoSholatCloseGroup", false);
      await m.react("🔓");
      return m.reply(
        `🔓 **Función Tutup Grupo Otomatis Dimatikan.**\n\n` +
        `Sekarang grup no akan ditutup saat azan berkumandang, sehingga obrolan bisa terus berjalan tanpa hambatan.`
      );
    }
    return m.reply(`Oh, maaf. Formatnya sedikit keliru. Silakan gunakan \`${m.prefix}autosholat close on\` atau \`${m.prefix}autosholat close off\`.`);
  }

  if (args === "duration") {
    const duration = parseInt(m.args[1]);
    if (isNaN(duration) || duration < 1 || duration > 60) {
      return m.reply(`Por favor ingresa un número entre 1 y 60 para la duración del cierre del grupo (en minutos). 💫`);
    }
    database.setting("autoSholatDuration", duration);
    await m.react("⏱️");
    return m.reply(
      `⏱️ **Durasi Penutupan Grupo Telah Actualizado!**\n\n` +
      `Nantinya, akses obrolan di grup akan dikunci selama **${duration} menit** berturut-turut pada setiap jadwal sholat sebelum kubuka kembali de forma otomatis.`
    );
  }

  if (args === "kota") {
    const kotaName = m.args.slice(1).join(" ").trim();
    if (!kotaName) {
      return m.reply(`Tolong sebutkan nama kotanya juga! Misalnya, \`${m.prefix}autosholat kota Surabaya\`.`);
    }
    await m.react("🔍");
    try {
      const result = await searchKota(kotaName);
      if (!result) {
        return m.reply(`Vaya, busqué en la base de datos MyQuran pero no encontré la región **${kotaName}** ¿Podrías probar con otro nombre de ciudad? 💫`);
      }
      database.setting("autoSholatKota", {
        id: result.id,
        nama: result.lokasi,
      });
      await m.react("📍");
      return m.reply(
        `📍 **Lokasi Recordatorio Éxito Actualizado!**\n\n` +
        `Seluruh jadwal sholat sekarang telah dikalibrasi ulang untuk menyesuaikan con wilayah **${result.lokasi}**.`
      );
    } catch (e) {
      await m.reply(te(m.prefix, m.command, m.pushName));
    }
  }

  return m.reply(`El comando que ingresaste no es correcto. Puedes usar parámetros como \`on\`, \`off\`, \`status\`, \`close\`, \`duration\`, atau \`kota\`.`);
}

async function runAutoSholat(sock) {
  const db = getDatabase();
  if (!db.setting("autoSholat")) return;
  
  const kotaSetting = db.setting("autoSholatKota") || {
    id: "1301",
    nama: "KOTA JAKARTA",
  };
  
  let times;
  try {
    const jadwalData = await getTodaySchedule(kotaSetting.id);
    times = extractPrayerTimes(jadwalData);
  } catch {
    return;
  }
  
  const JADWAL = {
    subuh: times.subuh,
    dzuhur: times.dzuhur,
    ashar: times.ashar,
    maghrib: times.maghrib,
    isya: times.isya,
  };
  
  const timeNow = timeHelper.getCurrentTimeString();
  if (!global.autoSholatLock) global.autoSholatLock = {};
  
  for (const [sholat, waktu] of Object.entries(JADWAL)) {
    if (waktu === "-") continue;
    
    if (timeNow === waktu && !global.autoSholatLock[sholat]) {
      global.autoSholatLock[sholat] = true;
      try {
        global.isFetchingGroups = true;
        const groupsObj = await sock.groupFetchAllParticipating();
        global.isFetchingGroups = false;
        
        const groupList = Object.keys(groupsObj);
        const closeGroup = db.setting("autoSholatCloseGroup") || false;
        const duration = db.setting("autoSholatDuration") || 5;

        for (const jid of groupList) {
          const groupData = db.data?.groups?.[jid] || {};
          if (groupData.notifSholat === false) continue;
          
          try {
            const caption =
              `🕌 **Pemberitahuan Hora Sholat ${sholat.toUpperCase()}** 🕌\n\n` +
              `Sudah saatnya mengistirahatkan sejenak urusan duniamu! Hora untuk menunaikan ibadah sholat **${sholat}** telah tiba untuk wilayah **${kotaSetting.nama}** dan sekitarnya (tepatnya pada pukul **${waktu} WIB**).\n\n` +
              `Mari segarkan pikiran, ambil air wudhu, dan hampiri panggilan suci-Nya. Selamat menunaikan ibadah sholat! 🤲\n\n` +
              (closeGroup ? `_Sebagai bentuk penghormatan, sistem akan menutup obrolan grup ini untuk sementara waktu (selama ${duration} menit)._` : "");
            
            const msgTeks = await sock.sendMessage(jid, {
              text: caption,
            });

            await sock.sendMessage(jid, {
              audio: { url: AUDIO_ADZAN },
              mimetype: "audio/mpeg",
              ptt: false,
            }, { quoted: msgTeks });

            if (closeGroup) {
              await sock.groupSettingUpdate(jid, "announcement");
            }
            await new Promise((res) => setTimeout(res, 500));
          } catch (e) {
            console.log(`Error mengirim pesan sholat ke grup ${jid}:`, e.message);
          }
        }
        
        if (closeGroup) {
          setTimeout(async () => {
            for (const jid of groupList) {
              try {
                await sock.groupSettingUpdate(jid, "not_announcement");
                await sock.sendMessage(jid, {
                  text: `✅ **Hora Penutupan Telah Berakhir**\n\nSesi ibadah sholat **${sholat}** telah usai. Obrolan grup sekarang sudah kubuka kembali de forma otomatis. Selamat melanjutkan aktivitas kembali!`,
                });
                await new Promise((res) => setTimeout(res, 600));
              } catch (e) {
                console.log(`Error membuka obrolan grup ${jid}:`, e.message);
              }
            }
            console.log(`Selesai mereset pembukaan seluruh grup.`);
          }, duration * 60 * 1000);
        }
        
        console.log(`Transmisión del adhan ${sholat} realizada con éxito a ${groupList.length} grupos en paralelo. ✨`);
      } catch (error) {
        global.isFetchingGroups = false;
        console.error("Terdapat kesalahan pada eksekutor:", error.message);
      }
      
      setTimeout(() => {
        delete global.autoSholatLock[sholat];
      }, 2 * 60 * 1000);
    }
  }
}

export { pluginConfig as config, handler, runAutoSholat, AUDIO_ADZAN };
