import { getDatabase } from "../../src/lib/rimuru-database.js";
import config from "../../config.js";

const PAGE_SIZE = 20;

function getRegistrationContextInfo() {
  const saluranId = config.saluran?.id || "120363400911374213@newsletter";
  const saluranName = config.saluran?.name || config.bot?.name || "rimuru-AI";

  return {
    forwardingScore: 9999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: saluranId,
      newsletterName: saluranName,
      serverMessageId: 127,
    },
  };
}

function getRegistrationTime(user) {
  const value = user?.lastRegisteredAt || user?.registeredAt || null;
  if (!value) return 0;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function formatDateTime(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function parseListOptions(input) {
  const tokens = String(input || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  let page = 1;
  let search = "";
  let sort = "default";

  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i].toLowerCase();

    if (["page", "hal", "halaman", "pagina", "página"].includes(token)) {
      const next = parseInt(tokens[i + 1], 10);
      if (!Number.isNaN(next) && next > 0) {
        page = next;
        i += 1;
      }
      continue;
    }

    if (["search", "cari", "nama", "buscar", "nombre"].includes(token)) {
      const searchTokens = [];
      for (let j = i + 1; j < tokens.length; j += 1) {
        const nextToken = tokens[j].toLowerCase();
        if (
          [
            "page",
            "hal",
            "halaman",
            "pagina",
            "página",
            "search",
            "cari",
            "nama",
            "buscar",
            "nombre",
            "sort",
            "urut",
            "orden",
          ].includes(nextToken)
        )
          break;
        searchTokens.push(tokens[j]);
        i = j;
      }
      if (searchTokens.length) {
        search = searchTokens.join(" ").trim();
      }
      continue;
    }

    if (["sort", "urut", "orden"].includes(token)) {
      const nextToken = tokens[i + 1]?.toLowerCase();
      if (["terbaru", "newest", "reciente", "ultimos", "últimos"].includes(nextToken)) {
        sort = "terbaru";
        i += 1;
      }
      continue;
    }

    if (["terbaru", "newest", "reciente"].includes(token)) {
      sort = "terbaru";
      continue;
    }

    if (/^\d+$/.test(token) && page === 1) {
      page = parseInt(token, 10);
    }
  }

  return { page, search, sort };
}

const pluginConfig = {
  name: "listdaftar",
  alias: ["listuser", "registeredusers", "daftarlist"],
  category: "user",
  description: "Muestra la lista de usuarios registrados con filtros y paginación",
  usage: ".listdaftar [pagina <número>] [buscar <nombre>] [orden reciente]",
  example: ".listdaftar buscar zann orden reciente pagina 2",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const allUsuarios = db.getAllUsuarios();
  const options = parseListOptions(m.text);
  let registeredUsuarios = Object.values(allUsuarios).filter((u) => u.isRegistered);

  if (registeredUsuarios.length === 0) {
    return m.reply(
      `*¡Hola, buenas tardes!* ฅ^·ﻌ·^ฅ\n` +
      `> _Consulta de usuarios registrados ≽^• ˕ • ྀི≼_\n\n` +
      `## ꕥ *W⍺gurı 𝖠ssı𝗌ƚ⍺nƚ* (*ᴗ͈ˬᴗ͈)ꕤ\n` +
      `> 𝖫𝖨𝖲𝖳𝖠𝖣𝖮 𝖣𝖤 𝖴𝖲𝖴𝖠𝖱𝖨𝖮𝖲\n\n` +
      `> Aviso: ¡Aún no hay usuarios registrados en el sistema!\n\n` +
      `> sɪᴍᴘʟᴇ ᴡʜᴀᴛsᴀᴘᴘ ʙᴏᴛ ツ`
    );
  }

  if (options.search) {
    const keyword = options.search.toLowerCase();
    registeredUsuarios = registeredUsuarios.filter((user) =>
      String(user.regName || "")
        .toLowerCase()
        .includes(keyword),
    );
  }

  if (options.sort === "terbaru") {
    registeredUsuarios.sort(
      (a, b) => getRegistrationTime(b) - getRegistrationTime(a),
    );
  }

  if (registeredUsuarios.length === 0) {
    return m.reply(
      `*¡Hola, buenas tardes!* ฅ^·ﻌ·^ฅ\n` +
      `> _Consulta de usuarios registrados ≽^• ˕ • ྀི≼_\n\n` +
      `## ꕥ *W⍺gurı 𝖠ssı𝗌ƚ⍺nƚ* (*ᴗ͈ˬᴗ͈)ꕤ\n` +
      `> 𝖫𝖨𝖲𝖳𝖠𝖣𝖮 𝖣𝖤 𝖴𝖲𝖴𝖠𝖱𝖨𝖮𝖲\n\n` +
      `> Aviso: No hay usuarios que coincidan con la búsqueda: *${options.search}*\n\n` +
      `> sɪᴍᴘʟᴇ ᴡʜᴀᴛsᴀᴘᴘ ʙᴏᴛ ツ`
    );
  }

  const totalPages = Math.max(1, Math.ceil(registeredUsuarios.length / PAGE_SIZE));
  const page = Math.min(Math.max(options.page, 1), totalPages);
  const startIndex = (page - 1) * PAGE_SIZE;
  const displayUsuarios = registeredUsuarios.slice(
    startIndex,
    startIndex + PAGE_SIZE,
  );

  let text = `*¡Hola, buenas tardes!* ฅ^·ﻌ·^ฅ\n`;
  text += `> _Listado general de usuarios en el sistema ≽^• ˕ • ྀི≼_\n\n`;
  text += `## ꕥ *W⍺gurı 𝖠ssı𝗌ƚ⍺nƚ* (*ᴗ͈ˬᴗ͈)ꕤ\n`;
  text += `> 𝖫𝖨𝖲𝖳𝖠𝖣𝖮 𝖣𝖤 𝖴𝖲𝖴𝖠𝖱𝖨𝖮𝖲 𝖱𝖤𝖦𝖨𝖲𝖳𝖱𝖠𝖣𝖮𝖲\n\n`;
  text += `> Total de resultados: *${registeredUsuarios.length}* usuarios\n`;
  text += `> Página: *${page}/${totalPages}*\n`;
  text += `> Orden: *${options.sort === "terbaru" ? "Reciente" : "Predeterminado"}*\n`;
  if (options.search) {
    text += `> Búsqueda: *${options.search}*\n`;
  }
  text += `\n`;

  displayUsuarios.forEach((user, i) => {
    const genderMenciona =
      user.regGender === "Laki-laki" || user.regGender === "Masculino"
        ? "[M]"
        : user.regGender === "Perempuan" || user.regGender === "Femenino"
          ? "[F]"
          : "[*]";
    const listNumber = startIndex + i + 1;
    const registeredAt = formatDateTime(
      user.lastRegisteredAt || user.registeredAt,
    );
    text += `${listNumber}. ${genderMenciona} *${user.regName || "Desconocido"}*\n`;
    text += `   > @${user.jid} | ${user.regAge || "?"} años | ${registeredAt}\n`;
  });

  if (totalPages > 1) {
    text += `\n> Usa \`${m.prefix}listdaftar pagina ${page + 1 > totalPages ? totalPages : page + 1}\` para ver otra página.\n`;
  }

  text += `\n> sɪᴍᴘʟᴇ ᴡʜᴀᴛsᴀᴘᴘ ʙᴏᴛ ツ`;

  const mentions = displayUsuarios.map((u) => u.jid + "@s.whatsapp.net");

  await sock.sendMessage(
    m.chat,
    {
      text,
      mentions,
      contextInfo: {
        mentionedJid: mentions,
        ...getRegistrationContextInfo(),
      },
    },
    { quoted: m },
  );
}

export { pluginConfig as config, handler };
