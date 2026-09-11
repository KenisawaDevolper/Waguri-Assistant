import { generateWAMessageFromContent } from "ourin";
import axios from "axios";
import sharp from "sharp";
import * as gacha from '../../src/lib/gacha.js'; 

// ==========================================
// FUNCIÓN AUXILIAR PARA BOTONES + IMAGEN
// ==========================================
async function sendGachaMsg(conn, m, text, buttons = [], imageUrl = null, title = "Waguri", desc = "Gacha System") {
  let thumbnailBuffer = null;
  
  if (imageUrl) {
    try {
      const res = await axios.get(imageUrl, { responseType: "arraybuffer" });
      thumbnailBuffer = await sharp(res.data).resize(300, 170).jpeg().toBuffer();
    } catch (_) {
      thumbnailBuffer = null;
    }
  }

  if (buttons.length === 0) {
    buttons = [{ id: `${m.prefix}menu`, text: "🧩 Menú Principal" }];
  }

  const content = {
    buttonsMessage: {
      buttons: buttons.map(b => ({
        buttonId: b.id,
        buttonText: { displayText: b.text },
        type: 1,
      })),
      ...(thumbnailBuffer ? {
        locationMessage: {
          jpegThumbnail: thumbnailBuffer,
          name: title,
          address: desc
        }
      } : {}),
      contentText: text,
      footerText: "waguri assistant ツ",
      headerType: thumbnailBuffer ? 6 : 1,
    },
  };

  const msg = generateWAMessageFromContent(m.chat, content, { quoted: m });
  await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
}

// ==========================================
// HANDLER DE COMANDOS
// ==========================================
let handler = async (m, { conn, command, args, text, isPrems, prefix }) => {
  const sender = m.sender;

  // Aseguramos que el usuario exista en la DB local para compra/venta
  if (!global.db.data.users[sender]) global.db.data.users[sender] = { tickets: 0, harem: [] };
  const userDb = global.db.data.users[sender];

  switch (command) {
    case "waifu": {
      await m.react("🕕");
      const result = await gacha.handleDailyGacha(sender, isPrems);
      const tickets = await gacha.checkTickets(sender);

      if (!result.status) {
        await m.react("❌");
        return await sendGachaMsg(conn, m, `ꕥ 𝖦𝖠𝖢𝖧𝖠 𝖲𝖸𝖲𝖳𝖤𝖬 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\nଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « ${result.message || result.error} »`, [
          { id: `#reroll`, text: "🎟️ Usar Ticket de Reroll" },
          { id: `#comprar`, text: "🛒 Comprar Tirada (5 🎟️)" },
          { id: `#harem`, text: "📭 Ver mi Harem" }
        ]);
      }

      const { name, source, rarity, image } = result.data || {};
      const caption = `ꕥ 𝖶𝖠𝖨𝖥𝖴 𝖣𝖤𝖫 𝖣𝖨𝖠 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n      𓈒 ◌ㅤ──    *𝖨𝖭𝖥𝖮𝖱𝖬𝖠𝖢𝖨𝖮𝖭*\n      • Nombre :: ${name}\n      • Origen :: ${source}\n      • Rareza :: ${rarity}\n\nଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « ${result.message} »\n> ${tickets.message}`;

      await sendGachaMsg(conn, m, caption, [
        { id: `#claim`, text: "💖 Reclamar" },
        { id: `#skip`, text: "⏩ Descartar" },
        { id: `#reroll`, text: "🎟️ Reroll" }
      ], image, name, `🌟 Rareza: ${rarity}`);
      await m.react("✅");
      break;
    }

    case "vender":
    case "sellwaifu": {
      const waifuName = args.join(" ").trim();
      if (!waifuName) {
        return await sendGachaMsg(conn, m, `ꕥ 𝖵𝖤𝖭𝖣𝖤𝖱 𝖶𝖠𝖨𝖥𝖴 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\nଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Indica el nombre de la waifu que deseas vender.\nEjemplo: *#vender Miku* »`, [
          { id: `#harem`, text: "📭 Ver mi Harem" }
        ]);
      }

      if (!userDb.harem || userDb.harem.length === 0) {
        return await sendGachaMsg(conn, m, `ꕥ 𝖧𝖠𝖱𝖤𝖬 𝖵𝖠𝖢𝖨𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\nଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « No tienes ninguna waifu en tu harem para vender. »`);
      }

      const index = userDb.harem.findIndex(w => w.name && w.name.toLowerCase().includes(waifuName.toLowerCase()));
      if (index === -1) {
        return await sendGachaMsg(conn, m, `ꕥ 𝖤𝖱𝖱𝖮𝖱 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\nଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « No se encontró ninguna waifu llamada "${waifuName}" en tu colección. »`, [
          { id: `#harem`, text: "📭 Ver mi Harem" }
        ]);
      }

      const soldWaifu = userDb.harem.splice(index, 1)[0];
      const rewardTickets = 3; 
      userDb.tickets = (userDb.tickets || 0) + rewardTickets;

      await sendGachaMsg(conn, m, `ꕥ 𝖵𝖤𝖭𝖳𝖠 𝖤𝖷𝖨𝖳𝖮𝖲𝖠 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\nଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Has vendido a *${soldWaifu.name}* al mercado de coleccionistas. »\n\n      • Ganancia :: *+${rewardTickets} Tickets* 🎟️\n      • Total actual :: *${userDb.tickets} 🎟️*`, [
        { id: `#harem`, text: "📭 Ver mi Harem" }
      ], soldWaifu.image || "https://telegra.ph/file/0b2405a761ec8dbb8b6e6.jpg", "Mercado Gacha", `Venta de Personaje`);
      break;
    }

    case "comprar":
    case "buywaifu": {
      const cost = 5; // Costo en tickets
      if ((userDb.tickets || 0) < cost) {
        return await sendGachaMsg(conn, m, `ꕥ 𝖢𝖮𝖬𝖯𝖱𝖠𝖱 𝖳𝖨𝖱𝖠𝖣𝖠 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\nଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « No tienes suficientes tickets. Necesitas al menos *${cost} tickets* 🎟️ para comprar una tirada extra. Tienes *${userDb.tickets || 0}*. »`, [
          { id: `#vender`, text: "💰 Vender Waifus" }
        ]);
      }

      userDb.tickets -= cost;
      
      // Reiniciamos el cooldown del gacha localmente si lo guardas así, 
      // O le sumamos una tirada extra a la base de datos de cooldowns
      if (!userDb.cooldowns) userDb.cooldowns = {};
      userDb.cooldowns.gacha = 0; // Esto asume que el cooldown se guarda aquí. Si se guarda en gacha.js, deberás adaptar esa librería.

      await sendGachaMsg(conn, m, `ꕥ 𝖢𝖮𝖬𝖯𝖱𝖠 𝖤𝖷𝖨𝖳𝖮𝖲𝖠 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\nଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Has comprado una tirada extra por *${cost} tickets*. ¡Ya puedes volver a tirar! »\n\n      • Tickets restantes :: *${userDb.tickets} 🎟️*`, [
        { id: `#waifu`, text: "🎰 Tirar Gacha Ahora" }
      ], "https://telegra.ph/file/0b2405a761ec8dbb8b6e6.jpg", "Tienda Gacha", "Tirada Extra Adquirida");
      break;
    }

    // ... (Mantén el resto de tus cases intactos: reroll, claim, skip, harem, trade, etc.)
    case "reroll": {
      await m.react("🕕");
      const result = await gacha.rerollGacha(sender);
      const tickets = await gacha.checkTickets(sender);

      if (!result.status) {
        await m.react("❌");
        return await sendGachaMsg(conn, m, `ꕥ 𝖦𝖠𝖢𝖧𝖠 𝖱𝖤𝖱𝖮𝖫𝖫 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\nଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « ${result.message || result.error} »`, [
          { id: `#harem`, text: "📭 Ver mi Harem" }
        ]);
      }

      const { name, source, rarity, image } = result.data || {};
      const caption = `ꕥ 𝖦𝖠𝖢𝖧𝖠 𝖱𝖤𝖱𝖮𝖫𝖫 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n      𓈒 ◌ㅤ──    *𝖨𝖭𝖥𝖮𝖱𝖬𝖠𝖢𝖨𝖮𝖭*\n      • Nombre :: ${name}\n      • Origen :: ${source}\n      • Rareza :: ${rarity}\n\nଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Usa reclamar o saltar para decidir. »\n> ${tickets.message}`;

      await sendGachaMsg(conn, m, caption, [
        { id: `#claim`, text: "💖 Reclamar" },
        { id: `#skip`, text: "⏩ Descartar" }
      ], image, name, `🌟 Rareza: ${rarity}`);
      await m.react("✅");
      break;
    }

    case "claim": {
      const result = await gacha.handleClaim(sender);
      await sendGachaMsg(conn, m, `ꕥ 𝖢𝖫𝖠𝖨𝖬 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\nଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « ${result.message || result.error} »`, [
        { id: `#harem`, text: "📭 Ver mi Harem" }
      ]);
      break;
    }

    case "skip": {
      const result = await gacha.handleSkip(sender);
      await sendGachaMsg(conn, m, `ꕥ 𝖲𝖪𝖨𝖯 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\nଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « ${result.message || result.error} »`, [
        { id: `#waifu`, text: "🎰 Tirar de nuevo" }
      ]);
      break;
    }

    case "harem":
    case "mymarry": {
      await m.react("🕕");
      if (text) {
        try {
          const { waifu, user } = await gacha.getHaremChar(text);
          if (!waifu || !user) throw new Error("Datos no encontrados");

          const count = user.length;
          const list = user.map((u, i) => `${i + 1}. @${u.phone_number.split("@")[0]}`).join("\n      ");
          
          const caption = `ꕥ 𝖢𝖮𝖭𝖲𝖴𝖫𝖳𝖠 𝖣𝖤 𝖶𝖠𝖨𝖥𝖴 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n      𓈒 ◌ㅤ──    *𝖨𝖭𝖥𝖮𝖱𝖬𝖠𝖢𝖨𝖮𝖭*\n      • Nombre :: ${waifu.name}\n      • Origen :: ${waifu.source}\n      • Obtenida por :: ${count} usuario(s)\n\n      𓈒 ◌ㅤ──    *𝖯𝖱𝖮𝖯𝖨𝖤𝖳𝖠𝖱𝖨𝖮𝖲*\n      ${count > 0 ? list : "Nadie la ha reclamado aún."}`;

          await sendGachaMsg(conn, m, caption, [{ id: `#harem`, text: "📭 Mi Harem" }], waifu.image || 'https://telegra.ph/file/0b2405a761ec8dbb8b6e6.jpg', waifu.name, "Búsqueda Global");
          await m.react("✅");
        } catch (err) {
          await m.react("❌");
          await sendGachaMsg(conn, m, `ꕥ 𝖤𝖱𝖱𝖮𝖱 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\nଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Ocurrió un error al buscar esa waifu en específico. »`, [{ id: `#harem`, text: "📭 Ver mi Harem" }]);
        }
      } else {
        try {
          const result = await gacha.getUserHarem(sender);
          if (!result.status) return await sendGachaMsg(conn, m, `ꕥ 𝖧𝖠𝖱𝖤𝖬 𝖵𝖠𝖢𝖨𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\nଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « ${result.message} »`, [{ id: `#waifu`, text: "🎰 Tirar Gacha" }]);

          const collection = result.data;
          const randomWaifu = collection[Math.floor(Math.random() * collection.length)];

          const list = collection.map((w, i) => {
            return `      ${i + 1}. *${(w.name || "").replace(/[\n\r]/g, " ")}*\n      ╰ ${w.rarity || "Desconocida"} | ${w.source || "Origen desconocido"}`;
          });

          const haremText = `ꕥ 𝖳𝖴 𝖧𝖠𝖱𝖤𝖬 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n      𓈒 ◌ㅤ──    *𝖢𝖮𝖫𝖤𝖢𝖢𝖨𝖮𝖭 (${collection.length})*\n${list.join("\n\n")}`;
          
          await sendGachaMsg(conn, m, haremText, [
            { id: `#waifu`, text: "🎰 Tirar Gacha" }
          ], randomWaifu.image, "Tu Colección", `${collection.length} Personajes Obtenidos`);
          await m.react("✅");
        } catch (e) {
          await m.react("❌");
          await sendGachaMsg(conn, m, `ꕥ 𝖤𝖱𝖱𝖮𝖱 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\nଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « No se pudo obtener la información de tu harem. »`, [{ id: `#waifu`, text: "🎰 Tirar Gacha" }]);
        }
      }
      break;
    }

    case "trade": {
      const target = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : (args[0] ? args[0].replace(/[@ .+-]/g, '') + '@s.whatsapp.net' : '');
      const waifuName = m.mentionedJid ? args.slice(1).join(" ").trim() : args.slice(1).join(" ").trim();
      
      if (!target || !waifuName) {
        return await sendGachaMsg(conn, m, `ꕥ 𝖳𝖱𝖠𝖣𝖤 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\nଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Debes mencionar al usuario y escribir el nombre de la waifu que ofreces. Ejemplo: #trade @usuario Miku »`);
      }

      const result = await gacha.initiateTrade(sender, target, waifuName, isPrems);
      await sendGachaMsg(conn, m, `ꕥ 𝖳𝖱𝖠𝖣𝖤 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\nଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « ${result.error || result.message} »`, [
        { id: `#tradeno`, text: "🚫 Cancelar Propuesta" }
      ]);
      break;
    }

    case "acctrade": {
      const from = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : (args[0] ? args[0].replace(/[@ .+-]/g, '') + '@s.whatsapp.net' : '');
      const waifuName = m.mentionedJid ? args.slice(1).join(" ").trim() : args.slice(1).join(" ").trim();
      
      if (!from || !waifuName) {
        return await sendGachaMsg(conn, m, `ꕥ 𝖳𝖱𝖠𝖣𝖤 𝖠𝖢𝖢𝖤𝖯𝖳 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\nଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Debes mencionar al usuario y escribir el nombre de la waifu que darás a cambio. »`);
      }

      const result = await gacha.acceptTrade(sender, from, waifuName);
      await sendGachaMsg(conn, m, `ꕥ 𝖳𝖱𝖠𝖣𝖤 𝖠𝖢𝖢𝖤𝖯𝖳 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\nଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « ${result.error || result.message} »`, [
        { id: `#tradeyes`, text: "✅ Confirmar" },
        { id: `#tradeno`, text: "🚫 Rechazar" }
      ]);
      break;
    }

    case "tradeyes": {
      const result = await gacha.confirmTrade(sender);
      await sendGachaMsg(conn, m, `ꕥ 𝖳𝖱𝖠𝖣𝖤 𝖢𝖮𝖭𝖥𝖨𝖱𝖬 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\nଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « ${result.error || result.message} »`, [{ id: `#harem`, text: "📭 Ver mi Harem" }]);
      break;
    }

    case "tradeno": {
      const trades = global.db.data.trades || {};
      const tradeEntry = Object.entries(trades).find(([_, t]) => t.toUser === sender || t.fromUser === sender);
      
      if (!tradeEntry) {
        return await sendGachaMsg(conn, m, `ꕥ 𝖳𝖱𝖠𝖣𝖤 𝖢𝖠𝖭𝖢𝖤𝖫 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\nଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « No tienes intercambios pendientes para cancelar. »`);
      }
      
      delete global.db.data.trades[tradeEntry[0]];
      await sendGachaMsg(conn, m, `ꕥ 𝖳𝖱𝖠𝖣𝖤 𝖢𝖠𝖭𝖢𝖤𝖫 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\nଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Intercambio rechazado/cancelado con éxito. »`);
      break;
    }

    case "swaifu":
    case "searchwaifu": {
      if (!text) {
        return await sendGachaMsg(conn, m, `ꕥ 𝖲𝖤𝖠𝖱𝖢𝖧 𝖶𝖠𝖨𝖥𝖴 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\nଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Ingresa el nombre de un personaje. Ejemplo: #swaifu Kaoruko Waguri »`);
      }

      await m.react("🕕");
      const result = await gacha.swaifu(text);
      if (!result.success) {
        await m.react("❌");
        return await sendGachaMsg(conn, m, `ꕥ 𝖲𝖤𝖠𝖱𝖢𝖧 𝖤𝖱𝖱𝖮𝖱 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\nଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « ${result.message} »`);
      }

      const caption = `ꕥ 𝖠𝖭𝖨𝖫𝖨𝖲𝖳 𝖲𝖤𝖠𝖱𝖢𝖧 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n      𓈒 ◌ㅤ──    *𝖣𝖤𝖳𝖠𝖫𝖫𝖤𝖲*\n      • Nombre :: ${result.name.full} (${result.name.native || "-"})\n      • Género :: ${result.gender}\n      • Cumpleaños :: ${result.birthDate}\n      • Favoritos :: ${result.favourites} ❤️\n\n      𓈒 ◌ㅤ──    *𝖣𝖤𝖲𝖢𝖱𝖨𝖯𝖢𝖨𝖮𝖭*\n> ${result.description}`;

      await sendGachaMsg(conn, m, caption, [
        { id: `#waifu`, text: "🎰 Tirar Gacha" }
      ], result.image?.large, result.name.full, "Base de datos AniList");
      await m.react("✅");
      break;
    }
  }
};

// Agregamos los tags nuevos a la lista de ayuda
handler.help = ['waifu', 'reroll', 'claim', 'skip', 'harem', 'vender', 'comprar', 'trade', 'acctrade', 'tradeyes', 'tradeno', 'swaifu'];
handler.tags = ['gacha', 'economy'];
handler.command = /^(waifu|reroll|claim|skip|harem|mymarry|vender|sellwaifu|comprar|buywaifu|trade|acctrade|tradeyes|tradeno|swaifu|searchwaifu)$/i;

export default handler;
