import te from "../../src/lib/rimuru-error.js";
/**
 * @file plugins/owner/schedule.js
 * @description Comando para gestionar mensajes programados
 * @author Lucky Archz, Keisya, hyuuSATAN
 * @version 1.1.0
 */

import {
  scheduleMessage,
  cancelScheduledMessage,
  getScheduledMessages,
  getSchedulerStatus,
  formatTimeRemaining,
  getMsUntilTime,
} from "../../src/lib/rimuru-scheduler.js";
/**
 * Configuración del plugin
 */
const pluginConfig = {
  name: "schedule",
  alias: ["sched", "jadwal", "timer"],
  category: "owner",
  description: 'Gestiona la función schedule con la estética Waguri Assistant ⚙️',
  usage:
    ".schedule <add/edit/list/kategori/preset/detail/del/status> [options]",
  example: ".schedule preset sekolah 06:30",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

const repeatKeywords = new Set(["repeat", "daily", "diario", "ulang"]);
const repeatOffKeywords = new Set([
  "once",
  "una vez",
  "off",
  "false",
  "no",
  "no",
  "0",
]);

const presetTemplates = {
  sekolah: {
    category: "sekolah",
    title: "Ir a la escuela",
    customText: "Dúchate, desayuna, revisa los libros y sal a tiempo.",
    repeat: true,
    target: "me",
  },
  kerja: {
    category: "kerja",
    title: "Empezar trabajo",
    customText: "Prepara el dispositivo, revisa las tareas y empieza a trabajar a tiempo.",
    repeat: true,
    target: "me",
  },
  turnamen: {
    category: "turnamen",
    title: "Preparación para torneo",
    customText: "Revisa roster, sala, conexión y queda en espera antes del match.",
    repeat: false,
    target: "here",
  },
  date: {
    category: "date",
    title: "Cita programada",
    customText: "Prepárate, revisa la ubicación y llega a tiempo.",
    repeat: false,
    target: "me",
  },
};

const presetAliases = {
  school: "sekolah",
  sekolah: "sekolah",
  work: "kerja",
  kerja: "kerja",
  tournament: "turnamen",
  turnamen: "turnamen",
  scrim: "turnamen",
  date: "date",
  ngedate: "date",
  dating: "date",
};

const formatClock = (hour, minute) =>
  `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

const truncateText = (text = "", max = 90) =>
  text.length > max ? `${text.slice(0, max)}...` : text;

const normalizeCategory = (value = "") => String(value).trim().toLowerCase();

const getTaskCategory = (task) => normalizeCategory(task.category) || "general";

const getTaskTitle = (task) => task.title || "Recordatorio";

const getTaskText = (task, fallback = "-") =>
  task.customText || task.message?.text || fallback;

const getTaskTargetLabel = (task) => task.targetLabel || task.jid;

function parseTimeString(value = "") {
  const normalized = String(value).trim().replace(/\./g, ":");
  const parts = normalized.split(":");

  if (parts.length !== 2) return null;

  const hour = Number(parts[0]);
  const minute = Number(parts[1]);

  if (
    !Number.isInteger(hour) ||
    !Number.isInteger(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return null;
  }

  return { hour, minute, label: formatClock(hour, minute) };
}

function isRepeatToken(value = "") {
  return repeatKeywords.has(String(value).trim().toLowerCase());
}

function isRepeatOffToken(value = "") {
  return repeatOffKeywords.has(String(value).trim().toLowerCase());
}

function parseRepeatValue(value = "") {
  if (isRepeatToken(value)) return true;
  if (isRepeatOffToken(value)) return false;
  throw new Error(
    "❌ El valor repeat debe ser uno de: repeat, daily, diario, once, una vez, off",
  );
}

function looksLikeTarget(value = "") {
  const normalized = String(value).trim().toLowerCase();
  const digits = normalized.replace(/[^0-9]/g, "");
  return (
    ["me", "self", "here", "this"].includes(normalized) ||
    normalized.includes("@") ||
    digits.length >= 5
  );
}

function resolveTarget(targetValue, m) {
  const raw = String(targetValue || "here").trim();
  const normalized = raw.toLowerCase();

  if (!raw || normalized === "here" || normalized === "this") {
    return {
      jid: m.chat,
      label: m.isGroup ? "here (chat ini)" : "here (private chat ini)",
    };
  }

  if (normalized === "me" || normalized === "self") {
    return {
      jid: m.sender,
      label: "me",
    };
  }

  if (raw.includes("@")) {
    return {
      jid: raw,
      label: raw,
    };
  }

  const digits = raw.replace(/[^0-9]/g, "");

  if (!digits) {
    return {
      jid: m.chat,
      label: m.isGroup ? "here (chat ini)" : "here (private chat ini)",
    };
  }

  return {
    jid: `${digits}@s.whatsapp.net`,
    label: `${digits}@s.whatsapp.net`,
  };
}

function extractTailOptions(
  m,
  parts,
  defaultTargetToken = "here",
  defaultRepeat = false,
) {
  const tail = [...parts];
  let targetToken = defaultTargetToken;
  let repeat = defaultRepeat;

  while (tail.length > 1) {
    const last = tail[tail.length - 1];

    if (isRepeatToken(last)) {
      repeat = true;
      tail.pop();
      continue;
    }

    if (isRepeatOffToken(last)) {
      repeat = false;
      tail.pop();
      continue;
    }

    if (looksLikeTarget(last)) {
      targetToken = tail.pop();
      continue;
    }

    break;
  }

  return {
    content: tail.join(" | ").trim(),
    target: resolveTarget(targetToken, m),
    repeat,
  };
}

function resolvePresetTemplate(name = "") {
  const normalized = normalizeCategory(name);
  const key = presetAliases[normalized] || normalized;

  if (!key || !presetTemplates[key]) {
    return { key: "", config: null };
  }

  return { key, config: presetTemplates[key] };
}

function getTaskState(task) {
  return {
    hour: task.hour,
    minute: task.minute,
    label: formatClock(task.hour, task.minute),
    category: getTaskCategory(task),
    title: getTaskTitle(task),
    customText: getTaskText(task, ""),
    repeat: Boolean(task.repeat),
    target: {
      jid: task.jid,
      label: getTaskTargetLabel(task),
    },
    mode: task.mode || "planner",
  };
}

function buildTaskPayload(id, parsed, extra = {}) {
  return {
    id,
    jid: parsed.target.jid,
    message: { text: parsed.customText },
    hour: parsed.hour,
    minute: parsed.minute,
    repeat: parsed.repeat,
    category: normalizeCategory(parsed.category) || "general",
    title: parsed.title || "Recordatorio",
    customText: parsed.customText,
    targetLabel: parsed.target.label,
    mode: parsed.mode || "planner",
    createdAt: extra.createdAt || null,
    ...(extra.meta || {}),
  };
}

function buildHelpText(m) {
  return `📅 *SCHEDULE PLANNER*

Esta función crea horarios o recordatorios libres.
Sirve para escuela, clases, trabajo, reuniones, citas, torneos o cualquier agenda.

El mensaje enviado seguirá el *texto personalizado* del owner.

*Formato principal:*
\`.schedule add <HH:MM> | <kategori> | <judul> | <pesan> | [target] | [repeat]\`

*Editar horario:*
\`.schedule edit <id> <HH:MM> | <kategori> | <judul> | <pesan> | [target] | [repeat]\`
\`.schedule edit <id> time=08:00 | text=angkat rapat | repeat=off\`

*Filtrar por categoría:*
\`.schedule kategori\`
\`.schedule kategori sekolah\`

*Preset rápido:*
\`.schedule preset list\`
\`.schedule preset sekolah 06:30\`
\`.schedule preset kerja 09:00 | standup pagi | masuk room meeting | here | repeat\`

*Destino opcional:*
• \`here\` = enviar a este chat
• \`me\` = enviar al chat del owner
• \`628xxx@s.whatsapp.net\` = enviar a un número específico

*Modo repetir opcional:*
• \`repeat\`
• \`daily\`
• \`diario\`

*Ejemplo:*
\`.schedule add 06:30 | sekolah | berangkat sekolah | mandi, sarapan, cek buku | me | repeat\`
\`.schedule add 12:00 | kerja | standup team | masuk room meeting jam 12 tepat | here | repeat\`
\`.schedule add 19:00 | date | dinner malam | jangan lupa datang rapi dan tepat waktu | me\`
\`.schedule add 20:00 | turnamen | scrim malam | room dibuka 15 menit sebelum mulai | here\`

*Subcomandos:*
• \`.schedule list\`
• \`.schedule kategori <nama>\`
• \`.schedule preset <nama> <HH:MM>\`
• \`.schedule edit <id> ...\`
• \`.schedule detail <id>\`
• \`.schedule del <id>\`
• \`.schedule status\`

*Formato antiguo aún soportado:*
\`.schedule add 08:00 628xxx repeat Selamat pagi tim\``;
}

function parsePlannerInput(m, args) {
  const timeInfo = parseTimeString(args[1]);

  if (!timeInfo) {
    throw new Error(
      "❌ Formato de hora incorrecto. Usa HH:MM o HH.MM, ejemplo: 08:00",
    );
  }

  const raw = args.slice(2).join(" ").trim();

  if (!raw) {
    throw new Error(
      "❌ Formato: `.schedule add <HH:MM> | <categoría> | <título> | <mensaje> | [destino] | [repetir]`",
    );
  }

  if (!raw.includes("|")) {
    const target = resolveTarget(args[2], m);
    let repeat = false;
    let messageStart = 3;

    if (isRepeatToken(args[3])) {
      repeat = true;
      messageStart = 4;
    }

    const customText = args.slice(messageStart).join(" ").trim();

    if (!customText) {
      throw new Error("❌ El mensaje del horario no puede estar vacío");
    }

    return {
      ...timeInfo,
      category: "general",
      title: "Recordatorio",
      customText,
      repeat,
      target,
      mode: "legacy",
    };
  }

  const segments = raw
    .split("|")
    .map((part) => part.trim())
    .filter(Boolean);

  if (segments.length < 3) {
    throw new Error(
      "❌ Formato mínimo: `.schedule add <HH:MM> | <categoría> | <título> | <mensaje>`",
    );
  }

  const category = normalizeCategory(segments[0]) || "general";
  const title = segments[1];
  const parsedTail = extractTailOptions(m, segments.slice(2));
  const customText = parsedTail.content;

  if (!customText) {
    throw new Error("❌ El contenido del recordatorio no puede estar vacío");
  }

  return {
    ...timeInfo,
    category,
    title,
    customText,
    repeat: parsedTail.repeat,
    target: parsedTail.target,
    mode: "planner",
  };
}

function parsePresetInput(m, args) {
  const { key, config } = resolvePresetTemplate(args[1]);

  if (!config) {
    throw new Error(
      "❌ Preset desconocido. Usa `.schedule preset list` para ver los disponibles.",
    );
  }

  const timeInfo = parseTimeString(args[2]);

  if (!timeInfo) {
    throw new Error(
      "❌ Formato: `.schedule preset <nombre> <HH:MM> [| <título> | <mensaje> | [destino] | [repetir]]`",
    );
  }

  const raw = args.slice(3).join(" ").trim();
  let title = config.title;
  let customText = config.customText;
  let repeat = config.repeat;
  let target = resolveTarget(config.target, m);

  if (raw) {
    const segments = raw
      .split("|")
      .map((part) => part.trim())
      .filter(Boolean);

    if (segments.length === 1) {
      customText = segments[0];
    } else if (segments.length > 1) {
      title = segments[0] || title;
      const parsedTail = extractTailOptions(
        m,
        segments.slice(1),
        config.target,
        config.repeat,
      );

      customText = parsedTail.content || customText;
      repeat = parsedTail.repeat;
      target = parsedTail.target;
    }
  }

  return {
    ...timeInfo,
    category: config.category,
    title,
    customText,
    repeat,
    target,
    mode: "preset",
    presetKey: key,
  };
}

function parseEditInput(m, args, task) {
  const raw = args.slice(2).join(" ").trim();

  if (!raw) {
    throw new Error(
      "❌ Format edit: `.schedule edit <id> <HH:MM> | <kategori> | <judul> | <pesan> | [target] | [repeat]` atau `.schedule edit <id> time=08:00 | text=... | repeat=off`",
    );
  }

  if (!raw.includes("=")) {
    const parsed = parsePlannerInput(m, ["add", ...args.slice(2)]);
    return {
      ...parsed,
      mode: task.mode || parsed.mode,
    };
  }

  const state = getTaskState(task);
  const segments = raw
    .split("|")
    .map((part) => part.trim())
    .filter(Boolean);

  if (!segments.length) {
    throw new Error("❌ No hay campo para editar.");
  }

  for (const segment of segments) {
    const separatorIndex = segment.indexOf("=");

    if (separatorIndex === -1) {
      throw new Error(
        "❌ El formato parcial debe ser `campo=valor`, ejemplo: `time=08:00 | text=reunión`",
      );
    }

    const field = normalizeCategory(segment.slice(0, separatorIndex));
    const value = segment.slice(separatorIndex + 1).trim();

    if (!value) {
      throw new Error(`❌ Valor para el campo \`${field}\` no puede estar vacío`);
    }

    switch (field) {
      case "time":
      case "waktu":
      case "jam": {
        const timeInfo = parseTimeString(value);

        if (!timeInfo) {
          throw new Error(
            "❌ Formato de hora incorrecto. Usa HH:MM o HH.MM",
          );
        }

        state.hour = timeInfo.hour;
        state.minute = timeInfo.minute;
        state.label = timeInfo.label;
        break;
      }
      case "category":
      case "kategori":
        state.category = normalizeCategory(value) || "general";
        break;
      case "title":
      case "judul":
        state.title = value;
        break;
      case "text":
      case "pesan":
      case "message":
      case "msg":
        state.customText = value;
        break;
      case "target":
      case "tujuan":
      case "jid":
        state.target = resolveTarget(value, m);
        break;
      case "repeat":
      case "ulang":
        state.repeat = parseRepeatValue(value);
        break;
      default:
        throw new Error(
          "❌ Field edit no dikenal. Usa: time, kategori, judul, text, target, repeat",
        );
    }
  }

  if (!state.customText) {
    throw new Error("❌ El contenido del recordatorio no puede estar vacío");
  }

  return state;
}

function findTaskById(taskId) {
  return getScheduledMessages().find((task) => task.id === taskId) || null;
}

function buildCategoryListText(tasks) {
  const categoryCounts = tasks.reduce((accumulator, task) => {
    const category = getTaskCategory(task);
    accumulator.set(category, (accumulator.get(category) || 0) + 1);
    return accumulator;
  }, new Map());

  const entries = [...categoryCounts.entries()].sort(
    (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
  );

  let text = "🏷️ *CATEGORÍAS DE HORARIO ACTIVAS*\n\n";

  for (const [category, total] of entries) {
    text += `• ${category} (${total})\n`;
  }

  text += "\nUsa `.schedule categoria <nombre>` para filtrar la lista.";
  return text;
}

function buildPresetListText() {
  let text = "⚡ *PRESETS RÁPIDOS DE HORARIO*\n\n";

  for (const [name, preset] of Object.entries(presetTemplates)) {
    text += `• *${name}*\n`;
    text += `  📝 ${preset.title}\n`;
    text += `  🔄 ${preset.repeat ? "Harian" : "Sekali"}\n`;
    text += `  📍 Default target: ${preset.target}\n`;
    text += `  💬 ${truncateText(preset.customText, 100)}\n\n`;
  }

  text += "Usa:\n";
  text += "`.schedule preset sekolah 06:30`\n";
  text +=
    "`.schedule preset kerja 09:00 | standup pagi | masuk room meeting | here | repeat`";
  return text;
}

function buildListText(tasks, header = null) {
  const sorted = [...tasks].sort(
    (a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute),
  );
  let text = `${header || `📅 *SCHEDULE PLANNER (${sorted.length})*`}\n\n`;

  for (const task of sorted) {
    const msUntil = getMsUntilTime(task.hour, task.minute);
    text += `• *${getTaskTitle(task)}*\n`;
    text += `  🆔 ${task.id}\n`;
    text += `  🏷️ ${getTaskCategory(task)}\n`;
    text += `  ⏰ ${formatClock(task.hour, task.minute)} WIB\n`;
    text += `  📍 ${getTaskTargetLabel(task)}\n`;
    text += `  🔄 ${task.repeat ? "Harian" : "Sekali"}\n`;
    text += `  🕕 ${formatTimeRemaining(msUntil)} lagi\n`;
    text += `  📝 ${truncateText(getTaskText(task))}\n\n`;
  }

  return text.trim();
}

function buildDetailText(task) {
  const msUntil = getMsUntilTime(task.hour, task.minute);
  return `📌 *DETAIL JADWAL*

🆔 ID: \`${task.id}\`
🏷️ Kategori: ${getTaskCategory(task)}
📝 Judul: ${getTaskTitle(task)}
⏰ Waktu: ${formatClock(task.hour, task.minute)} WIB
📍 Target: ${getTaskTargetLabel(task)}
🔄 Mode: ${task.repeat ? "Harian" : "Sekali"}
🕕 Próxima ejecución: ${formatTimeRemaining(msUntil)} lagi
🗓️ Creado: ${task.createdAt || "-"}

Pesan custom:
${getTaskText(task)}`;
}

/**
 * Handler para el comando schedule
 */
async function handler(m, { sock, args }) {
  const subCommand = args[0]?.toLowerCase();

  if (!subCommand || ["help", "menu"].includes(subCommand)) {
    await m.reply(buildHelpText(m));
    return;
  }

  switch (subCommand) {
    case "add": {
      try {
        const parsed = parsePlannerInput(m, args);
        const id = `sched_${Date.now()}`;

        await scheduleMessage(buildTaskPayload(id, parsed), sock);

        const msUntil = getMsUntilTime(parsed.hour, parsed.minute);

        await m.reply(`✅ *HORARIO CREADO CON ÉXITO*

🆔 ID: \`${id}\`
🏷️ Kategori: ${parsed.category}
📝 Judul: ${parsed.title}
⏰ Waktu: ${parsed.label} WIB
📍 Target: ${parsed.target.label}
🔄 Mode: ${parsed.repeat ? "Harian" : "Sekali"}
🕕 Próxima ejecución: ${formatTimeRemaining(msUntil)} lagi

Text custom:
${truncateText(parsed.customText, 180)}`);
      } catch (error) {
        await m.reply(
          error.message?.startsWith("❌")
            ? error.message
            : te(m.prefix, m.command, m.pushName),
        );
      }
      break;
    }

    case "preset": {
      if (!args[1] || ["list", "all"].includes(normalizeCategory(args[1]))) {
        await m.reply(buildPresetListText());
        return;
      }

      try {
        const parsed = parsePresetInput(m, args);
        const id = `sched_${Date.now()}`;

        await scheduleMessage(
          buildTaskPayload(id, parsed, {
            meta: { presetKey: parsed.presetKey },
          }),
          sock,
        );

        const msUntil = getMsUntilTime(parsed.hour, parsed.minute);

        await m.reply(`✅ *PRESET HORARIO CREADO CON ÉXITO*

🆔 ID: \`${id}\`
⚡ Preset: ${parsed.presetKey}
🏷️ Kategori: ${parsed.category}
📝 Judul: ${parsed.title}
⏰ Waktu: ${parsed.label} WIB
📍 Target: ${parsed.target.label}
🔄 Mode: ${parsed.repeat ? "Harian" : "Sekali"}
🕕 Próxima ejecución: ${formatTimeRemaining(msUntil)} lagi

Text custom:
${truncateText(parsed.customText, 180)}`);
      } catch (error) {
        await m.reply(
          error.message?.startsWith("❌")
            ? error.message
            : te(m.prefix, m.command, m.pushName),
        );
      }
      break;
    }

    case "edit": {
      const taskId = args[1];

      if (!taskId) {
        await m.reply("❌ Format: `.schedule edit <id> ...`");
        return;
      }

      const task = findTaskById(taskId);

      if (!task) {
        await m.reply(`❌ Horario con ID \`${taskId}\` no encontrado`);
        return;
      }

      try {
        const parsed = parseEditInput(m, args, task);

        await scheduleMessage(
          buildTaskPayload(task.id, parsed, {
            createdAt: task.createdAt,
            meta: { presetKey: task.presetKey || null },
          }),
          sock,
        );

        const msUntil = getMsUntilTime(parsed.hour, parsed.minute);

        await m.reply(`✅ *HORARIO ACTUALIZADO CON ÉXITO*

🆔 ID: \`${task.id}\`
🏷️ Kategori: ${parsed.category}
📝 Judul: ${parsed.title}
⏰ Waktu: ${parsed.label} WIB
📍 Target: ${parsed.target.label}
🔄 Mode: ${parsed.repeat ? "Harian" : "Sekali"}
🕕 Próxima ejecución: ${formatTimeRemaining(msUntil)} lagi

Text custom:
${truncateText(parsed.customText, 180)}`);
      } catch (error) {
        await m.reply(
          error.message?.startsWith("❌")
            ? error.message
            : te(m.prefix, m.command, m.pushName),
        );
      }
      break;
    }

    case "list": {
      const tasks = getScheduledMessages();

      if (tasks.length === 0) {
        await m.reply(
          "📅 Aún no hay horarios activos. Usa `.schedule` para ver el formato.",
        );
        return;
      }

      await m.reply(buildListText(tasks));
      break;
    }

    case "kategori":
    case "category": {
      const tasks = getScheduledMessages();

      if (tasks.length === 0) {
        await m.reply(
          "📅 Aún no hay horarios activos. Usa `.schedule` para ver el formato.",
        );
        return;
      }

      const categoryName = normalizeCategory(args.slice(1).join(" "));

      if (!categoryName) {
        await m.reply(buildCategoryListText(tasks));
        return;
      }

      const filteredTasks = tasks.filter(
        (task) => getTaskCategory(task) === categoryName,
      );

      if (!filteredTasks.length) {
        await m.reply(
          `❌ No hay horarios para la categoría \`${categoryName}\``,
        );
        return;
      }

      await m.reply(
        buildListText(
          filteredTasks,
          `🏷️ *KATEGORI: ${categoryName.toUpperCase()} (${filteredTasks.length})*`,
        ),
      );
      break;
    }

    case "detail":
    case "show":
    case "view": {
      const taskId = args[1];

      if (!taskId) {
        await m.reply("❌ Format: `.schedule detail <id>`");
        return;
      }

      const task = findTaskById(taskId);

      if (!task) {
        await m.reply(`❌ Horario con ID \`${taskId}\` no encontrado`);
        return;
      }

      await m.reply(buildDetailText(task));
      break;
    }

    case "del":
    case "delete":
    case "remove": {
      const taskId = args[1];

      if (!taskId) {
        await m.reply("❌ Format: `.schedule del <id>`");
        return;
      }

      const existingTask = findTaskById(taskId);
      const cancelled = cancelScheduledMessage(taskId);

      if (cancelled) {
        await m.reply(
          `✅ Horario \`${taskId}\` eliminado${existingTask?.title ? `\n\n📝 ${existingTask.title}` : ""}`,
        );
      } else {
        await m.reply(`❌ Horario \`${taskId}\` no encontrado`);
      }
      break;
    }

    case "status": {
      const status = getSchedulerStatus();
      const tasks = getScheduledMessages();
      const categories = [
        ...new Set(tasks.map((task) => getTaskCategory(task))),
      ];

      const text = `📊 *SCHEDULE PLANNER STATUS*

📝 Horario aktif: ${status.scheduledMessagesCount}
🏷️ Kategori aktif: ${categories.length ? categories.join(", ") : "-"}
📨 Reminder terkirim: ${status.totalMessagesSent}
🔄 Daily limit reset: ${status.dailyResetEnabled ? "✅ Active" : "❌ Inactive"}
📅 Last reset: ${status.lastLimitReset}

Gunakan \`.schedule list\` untuk lihat semua jadwal aktif.`;

      await m.reply(text);
      break;
    }

    default:
      await m.reply(
        "❌ Subcomando desconocido. Usa: add, edit, list, categoria, preset, detail, del, status",
      );
  }
}

export { pluginConfig as config, handler };
