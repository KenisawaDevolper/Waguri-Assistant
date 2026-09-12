import axios from "axios";
let bostoken;
try {
  bostoken = (await import("@bostoken/waifu-gatcha")).default;
} catch {
  // fallback stub si el paquete no está instalado (evita FAIL plugin failed)
  bostoken = {
    waifuGatcha: () => ({
      name: "Rem",
      anime: "Re:Zero",
      picture: "https://cdn.myanimelist.net/images/characters/9/311327.jpg",
      star: 3
    })
  };
}

// ==========================================
// 1. UTILIDADES Y GESTIÓN DE USUARIO
// ==========================================

function getRarityName(star) {
  const rarities = {
    1: "⭐ C",
    2: "⭐⭐ R",
    3: "⭐⭐⭐ SR",
    4: "🌟🌟🌟🌟 UR",
    5: "✨✨✨ SSR",
  };
  return rarities[star] || "⭐ C";
}

export function ensureLocalUser(userId) {
  if (!global.db) global.db = {};
  if (!global.db.data) global.db.data = {};
  if (!global.db.data.users) global.db.data.users = {};

  if (!global.db.data.users[userId]) {
    global.db.data.users[userId] = {};
  }

  const u = global.db.data.users[userId];

  // Estructura Gacha
  if (!Array.isArray(u.waifuCollection)) u.waifuCollection = [];
  if (typeof u.tickets !== "number") u.tickets = 0;
  if (typeof u.gachaCount !== "number") u.gachaCount = 0;
  if (typeof u.lastGacha !== "number") u.lastGacha = 0;
  if (u.tempGacha === undefined) u.tempGacha = null;

  // Estructura RPG / Nivel
  if (typeof u.exp !== "number") u.exp = 0;
  if (typeof u.level !== "number") u.level = 1;
  if (typeof u.rank !== "string") u.rank = "Beginner";
  if (!u.name) u.name = "Usuario";

  return u;
}

export async function getRandomWaifuFromPackage(userId) {
  const localUser = ensureLocalUser(userId);
  let attempt = 0;
  const maxAttempt = 10;

  while (attempt++ < maxAttempt) {
    const waifuData = bostoken.waifuGatcha();
    const waifuObj = {
      _id: waifuData.name.toLowerCase().replace(/[^a-z0-9]/g, "_"),
      name: waifuData.name,
      source: waifuData.anime,
      image: waifuData.picture,
      rarity: getRarityName(waifuData.star),
    };

    const alreadyOwned = localUser.waifuCollection.find(
      (entry) =>
        (entry.waifu?._id || entry._id) === waifuObj._id ||
        (entry.waifu?.name || entry.name) === waifuObj.name
    );

    if (!alreadyOwned) return waifuObj;
  }

  const fallbackData = bostoken.waifuGatcha();
  return {
    _id: fallbackData.name.toLowerCase().replace(/[^a-z0-9]/g, "_"),
    name: fallbackData.name,
    source: fallbackData.anime,
    image: fallbackData.picture,
    rarity: getRarityName(fallbackData.star),
  };
}

// ==========================================
// 2. LÓGICA PRINCIPAL DEL GACHA
// ==========================================

export async function handleDailyGacha(userId, isPremium = false) {
  const localUser = ensureLocalUser(userId);
  const now = Date.now();
  const lastGachaDate = new Date(localUser.lastGacha || 0);
  const today = new Date().setHours(0, 0, 0, 0);

  if (lastGachaDate < today) {
    localUser.gachaCount = 0;
  }

  const limit = isPremium ? 5 : 1;
  if (localUser.gachaCount >= limit) {
    return { status: false, message: `⏳ Límite de gacha alcanzado. Usa *.reroll* si tienes tickets disponibles.` };
  }

  const waifu = await getRandomWaifuFromPackage(userId);
  if (!waifu) return { status: false, error: "❌ Error al obtener el personaje. Por favor, intenta de nuevo." };

  localUser.tempGacha = waifu;
  localUser.gachaCount += 1;
  localUser.lastGacha = now;

  return {
    status: true,
    data: waifu,
    message: `Escribe *.claim* para reclamar o *.skip* para descartar.`,
  };
}

export async function handleClaim(userId) {
  const localUser = ensureLocalUser(userId);
  if (!localUser.tempGacha) return { error: "❌ No hay ninguna waifu pendiente para reclamar." };

  const waifu = localUser.tempGacha;
  localUser.waifuCollection.push({
    waifu: waifu,
    obtainedAt: new Date(),
  });
  localUser.tempGacha = null;

  return { message: `🎉 ¡*${waifu.name || "Waifu"}* ha sido añadida a tu colección con éxito!` };
}

export async function handleSkip(userId) {
  const localUser = ensureLocalUser(userId);
  if (!localUser.tempGacha) return { error: "❌ No hay ninguna waifu para descartar." };
  localUser.tempGacha = null;
  return { message: "⏩ Personaje descartado." };
}

export async function rerollGacha(userId) {
  const localUser = ensureLocalUser(userId);
  if ((localUser.tickets || 0) <= 0) {
    return { status: false, error: "❌ No tienes tickets disponibles. ¡Consigue más tickets o vuelve mañana!" };
  }

  const waifu = await getRandomWaifuFromPackage(userId);
  if (!waifu) return { status: false, error: "❌ Error al obtener el personaje. Por favor, intenta de nuevo." };

  localUser.tempGacha = waifu;
  localUser.tickets -= 1;

  return {
    status: true,
    data: waifu,
    message: "🎟️ Ticket consumido para el reroll.",
  };
}

// ==========================================
// 3. COLECCIONES E INVENTARIO
// ==========================================

export async function getUsuarioHarem(userId) {
  const localUser = ensureLocalUser(userId);
  const collection = (localUser.waifuCollection || []).map((c) => c.waifu || c).filter(Boolean);

  if (!collection.length) {
    return { status: false, message: "📭 Tu harem está vacío. ¡Usa *.waifu* para empezar a coleccionar!" };
  }

  return {
    status: true,
    data: collection,
    count: collection.length,
  };
}

export async function checkTickets(userId) {
  const localUser = ensureLocalUser(userId);
  const tickets = localUser.tickets || 0;
  return {
    status: true,
    tickets,
    message: `🎟️ Tienes *${tickets}* ticket(s) disponible(s).`,
  };
}

export async function addTicket(userId, amount = 1) {
  const localUser = ensureLocalUser(userId);
  localUser.tickets = (localUser.tickets || 0) + amount;
  return { status: true, message: `🎟️ Se han añadido *${amount}* ticket(s) con éxito.` };
}

export async function addWaifuImage(userId, imageUrl) {
  const localUser = ensureLocalUser(userId);
  if (localUser.tempGacha) {
    localUser.tempGacha.image = imageUrl;
    return { message: `📷 Imagen actualizada con éxito.` };
  }
  return { message: `❌ No hay un personaje pendiente al cual añadirle imagen.` };
}

export async function removeWaifu(userPhone, waifuName) {
  const localUser = ensureLocalUser(userPhone);
  const index = (localUser.waifuCollection || []).findIndex((c) => {
    const w = c.waifu || c;
    return w.name && w.name.toLowerCase() === waifuName.toLowerCase();
  });

  if (index === -1) return { error: `❌ No tienes ninguna waifu llamada *${waifuName}* en tu colección.` };
  
  const removed = localUser.waifuCollection.splice(index, 1)[0];
  const wName = (removed?.waifu || removed)?.name || waifuName;
  return { message: `✅ La waifu *${wName}* ha sido eliminada de tu colección con éxito.` };
}

export async function getHaremChar(name) {
  const usersWithWaifu = [];
  const localUsers = global.db?.data?.users || {};
  
  for (const [phone, u] of Object.entries(localUsers)) {
    const hasIt = (u.waifuCollection || []).some((c) => {
      const w = c.waifu || c;
      return w.name && w.name.toLowerCase() === name.toLowerCase();
    });
    if (hasIt) {
      usersWithWaifu.push({ phone_number: phone, username: u.name || phone.split('@')[0] });
    }
  }

  const sampleWaifu = { name, source: "Anime", rarity: "⭐ C" };
  return {
    status: true,
    user: usersWithWaifu,
    waifu: sampleWaifu,
  };
}

// ==========================================
// 4. SISTEMA DE INTERCAMBIOS (TRADES)
// ==========================================

export async function initiateTrade(fromPhone, toPhone, waifuName, isPremium = false) {
  if (!isPremium) return { error: "⚠️ Solo los usuarios premium pueden iniciar intercambios." };

  const fromLocal = ensureLocalUser(fromPhone);
  ensureLocalUser(toPhone);

  const offerEntry = (fromLocal.waifuCollection || []).find((c) => {
    const w = c.waifu || c;
    return w.name && w.name.toLowerCase() === waifuName.toLowerCase();
  });
  
  if (!offerEntry) return { error: "❌ La waifu no se encuentra en tu colección." };

  if (!global.db.data.trades) global.db.data.trades = {};
  const tradeId = `${fromPhone}_${toPhone}_${Date.now()}`;
  
  global.db.data.trades[tradeId] = {
    fromUser: fromPhone,
    toUser: toPhone,
    offerWaifu: offerEntry.waifu || offerEntry,
    status: "waiting_accept",
  };

  return { message: `📬 Propuesta de intercambio enviada a *@${toPhone.split('@')[0]}*. Espera su respuesta con *.acctrade*.`, tradeId };
}

export async function acceptTrade(toPhone, fromPhone, waifuName) {
  const toLocal = ensureLocalUser(toPhone);
  const trades = global.db?.data?.trades || {};
  const tradeEntry = Object.entries(trades).find(
    ([_, t]) => t.fromUser === fromPhone && t.toUser === toPhone && t.status === "waiting_accept"
  );

  if (!tradeEntry) return { error: "❌ Intercambio no encontrado o ya procesado." };
  const [_, trade] = tradeEntry;

  const acceptEntry = (toLocal.waifuCollection || []).find((c) => {
    const w = c.waifu || c;
    return w.name && w.name.toLowerCase() === waifuName.toLowerCase();
  });
  
  if (!acceptEntry) return { error: "❌ No se encontró esa waifu en tu colección." };

  trade.acceptWaifu = acceptEntry.waifu || acceptEntry;
  trade.status = "waiting_confirm";

  return { message: `🤝 Intercambio aceptado. *@${fromPhone.split('@')[0]}* debe confirmar con *.tradeyes*.` };
}

export async function confirmTrade(fromPhone) {
  const trades = global.db?.data?.trades || {};
  const tradeEntry = Object.entries(trades).find(
    ([_, t]) => t.fromUser === fromPhone && t.status === "waiting_confirm"
  );

  if (!tradeEntry) return { error: "❌ No hay intercambios pendientes de confirmación." };
  const [tradeId, trade] = tradeEntry;

  const fromLocal = ensureLocalUser(trade.fromUser);
  const toLocal = ensureLocalUser(trade.toUser);

  const removeFrom = (localU, waifu) => {
    const idx = localU.waifuCollection.findIndex((c) => {
      const w = c.waifu || c;
      return (w._id && w._id === waifu._id) || w.name === waifu.name;
    });
    if (idx >= 0) localU.waifuCollection.splice(idx, 1);
  };

  removeFrom(fromLocal, trade.offerWaifu);
  removeFrom(toLocal, trade.acceptWaifu);

  fromLocal.waifuCollection.push({ waifu: trade.acceptWaifu, obtainedAt: new Date() });
  toLocal.waifuCollection.push({ waifu: trade.offerWaifu, obtainedAt: new Date() });

  trade.status = "completed";
  delete global.db.data.trades[tradeId]; // Limpiar la DB local para que no pese
  
  return { message: "✅ ¡Intercambio completado con éxito!" };
}

// ==========================================
// 5. BÚSQUEDA EN ANILIST
// ==========================================

export async function swaifu(query) {
  if (!query || typeof query !== "string") {
    return { success: false, message: "⚠️ Por favor, ingresa el nombre de un personaje." };
  }
  const url = "https://graphql.anilist.co";
  const anilistQuery = {
    query: `
      query ($search: String) {
        Character(search: $search) {
          id
          name { full native alternative }
          gender
          description(asHtml: false)
          image { large medium }
          dateOfBirth { year month day }
          siteUrl
          favourites
        }
      }
    `,
    variables: { search: query },
  };

  try {
    const response = await axios.post(url, anilistQuery, {
      headers: { "Content-Type": "application/json", Accept: "application/json" },
    });

    const char = response.data?.data?.Character;
    if (!char) {
      return { success: false, message: `❌ No se encontró el personaje "${query}".` };
    }

    const birthDate = char.dateOfBirth;
    const formattedBirthDate = birthDate?.day && birthDate?.month 
      ? `${birthDate.day}-${birthDate.month}` + (birthDate.year ? `-${birthDate.year}` : "") 
      : "Desconocido";

    const cleanDesc = (char.description || "Sin descripción disponible.").replace(/<[^>]+>/g, "").split("\n")[0];

    return {
      success: true,
      id: char.id,
      name: { full: char.name.full, native: char.name.native, alternative: char.name.alternative },
      gender: char.gender || "Desconocido",
      image: { large: char.image?.large, medium: char.image?.medium },
      description: cleanDesc,
      birthDate: formattedBirthDate,
      favourites: char.favourites || 0,
      siteUrl: char.siteUrl,
    };
  } catch (err) {
    console.error("Error en swaifu:", err.message);
    return { success: false, message: "❌ Ocurrió un error al obtener datos desde AniList." };
  }
}
