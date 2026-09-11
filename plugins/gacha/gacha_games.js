import { generateWAMessageFromContent } from "ourin";
import axios from "axios";
import sharp from "sharp";

// ==========================================
// GESTIÓN LOCAL DE USUARIOS Y COOLDOWNS
// ==========================================
function ensureLocalUsuario(userId) {
  if (!global.db) global.db = {};
  if (!global.db.data) global.db.data = {};
  if (!global.db.data.users) global.db.data.users = {};
  
  if (!global.db.data.users[userId]) {
    global.db.data.users[userId] = {};
  }
  
  const u = global.db.data.users[userId];
  if (typeof u.tickets !== "number") u.tickets = 0;
  if (!u.cooldowns) u.cooldowns = {};
  return u;
}

// ==========================================
// FUNCIÓN AUXILIAR PARA BOTONES E IMAGEN
// ==========================================
async function sendJuegoMsg(conn, m, text, buttons = [], imageUrl = null, title = "Waguri Arcade", desc = "Sistema de Tickets") {
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
    buttons = [{ id: `${m.prefix}minijuegos`, text: "🎮 Menú Minijuegos" }];
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
// HANDLER PRINCIPAL DE MINIJUEGOS
// ==========================================
let handler = async (m, { conn, command, args, prefix }) => {
  const sender = m.sender;
  const user = ensureLocalUsuario(sender);

  switch (command) {
    case "ticketgames":
    case "minijuegos": {
      const text = 
        `ꕥ 𝖬𝖨𝖭𝖨𝖩𝖴𝖤𝖦𝖮𝖲 𝖣𝖤 𝖳𝖨𝖢𝖪𝖤𝖳𝖲 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `      𓈒 ◌ㅤ──    *𝖳𝖴𝖲 𝖱𝖤𝖢𝖴𝖱𝖲𝖮𝖲*\n` +
        `      • Tickets actuales :: *${user.tickets} 🎟️*\n\n` +
        `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Selecciona un minijuego abajo para ganar tickets gratis para tus rerolls. »`;

      await sendJuegoMsg(conn, m, text, [
        { id: `#minar`, text: "⛏️ Minar Tickets" },
        { id: `#suerte`, text: "🎲 Ruleta de Suerte" },
        { id: `#adivinar 3`, text: "🔢 Adivinar (Ej: 3)" }
      ], "https://telegra.ph/file/0b2405a761ec8dbb8b6e6.jpg", "Zona Arcade", "Gana Tickets Diarios");
      break;
    }

    case "minar":
    case "work": {
      const cooldownTime = 30 * 60 * 1000; // 30 minutos de espera
      const now = Date.now();
      const lastMine = user.cooldowns.minar || 0;

      if (now - lastMine < cooldownTime) {
        const remaining = Math.ceil((cooldownTime - (now - lastMine)) / 60000);
        return await sendJuegoMsg(conn, m, `ꕥ 𝖢𝖮𝖮𝖫𝖣𝖮𝖶𝖭 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\nଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Tus picos están cansados. Debes esperar *${remaining} minuto(s)* para volver a minar. »`, [
          { id: `#minijuegos`, text: "🎮 Volver al Menú" }
        ]);
      }

      user.cooldowns.minar = now;
      const earnedTickets = Math.floor(Math.random() * 3) + 1; // Gana entre 1 y 3 tickets aleatorios
      user.tickets += earnedTickets;

      const text = 
        `ꕥ 𝖬𝖨𝖭𝖤𝖱İA 𝖤𝖷𝖳𝖮𝖲𝖠 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « ¡Has excavado profundamente en las cuevas y encontrado cristales raros! »\n\n` +
        `      • Recompensa :: *+${earnedTickets} Ticket(s)* 🎟️\n` +
        `      • Total actual :: *${user.tickets} 🎟️*`;

      await sendJuegoMsg(conn, m, text, [
        { id: `#minar`, text: "⛏️ Minar de nuevo" },
        { id: `#minijuegos`, text: "🎮 Menú Principal" }
      ], "https://telegra.ph/file/0b2405a761ec8dbb8b6e6.jpg", "Minería Exitosa", `+${earnedTickets} Tickets Obtenidos`);
      break;
    }

    case "suerte":
    case "gambling": {
      const cooldownTime = 15 * 60 * 1000; // 15 minutos de espera
      const now = Date.now();
      const lastSuerte = user.cooldowns.suerte || 0;

      if (now - lastSuerte < cooldownTime) {
        const remaining = Math.ceil((cooldownTime - (now - lastSuerte)) / 60000);
        return await sendJuegoMsg(conn, m, `ꕥ 𝖢𝖮𝖮𝖫𝖣𝖮𝖶𝖭 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\nଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « La diosa de la fortuna no te atenderá tan rápido. Vuelve en *${remaining} minuto(s)*. »`, [
          { id: `#minijuegos`, text: "🎮 Volver al Menú" }
        ]);
      }

      user.cooldowns.suerte = now;
      const won = Math.random() < 0.45; // 45% de probabilidad de ganar

      if (won) {
        const earnedTickets = 2;
        user.tickets += earnedTickets;
        await sendJuegoMsg(conn, m, `ꕥ 𝖲𝖴𝖤𝖱𝖳𝖤 𝖣𝖨𝖢𝖤 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\nଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « ¡Increíble! La ruleta giró y se detuvo en la casilla ganadora. »\n\n      • Recompensa :: *+2 Tickets* 🎟️\n      • Total actual :: *${user.tickets} 🎟️*`, [
          { id: `#suerte`, text: "🎲 Jugar otra vez" },
          { id: `#minijuegos`, text: "🎮 Menú Principal" }
        ], "https://telegra.ph/file/0b2405a761ec8dbb8b6e6.jpg", "¡Victoria en la Ruleta!", "+2 Tickets");
      } else {
        await sendJuegoMsg(conn, m, `ꕥ 𝖲𝖴𝖤𝖱𝖳𝖤 𝖣𝖨𝖢𝖤 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\nଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « ¡Mala suerte! La bola cayó en zona vacía y no obtuviste nada esta vez. »\n\n      • Total actual :: *${user.tickets} 🎟️*`, [
          { id: `#minijuegos`, text: "🎮 Menú Principal" }
        ], "https://telegra.ph/file/0b2405a761ec8dbb8b6e6.jpg", "Derrota en la Ruleta", "Inténtalo más tarde");
      }
      break;
    }

    case "adivinar": {
      const guess = parseInt(args[0]);

      if (!args[0] || isNaN(guess) || guess < 1 || guess > 5) {
        return await sendJuegoMsg(conn, m, `ꕥ 𝖩𝖴𝖤𝖦𝖮 𝖠𝖣𝖨𝖵𝖨𝖭𝖠𝖱 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\nଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Elige un número del 1 al 5. \nUso correcto: *#adivinar <número>* »`, [
          { id: `#minijuegos`, text: "🎮 Ver Menú" }
        ]);
      }

      const winningNumber = Math.floor(Math.random() * 5) + 1; // Número aleatorio del 1 al 5

      if (guess === winningNumber) {
        user.tickets += 3;
        await sendJuegoMsg(conn, m, `ꕥ 𝖩𝖴𝖦𝖮 𝖠𝖣𝖨𝖵𝖨𝖭𝖠𝖱 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\nଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « ¡Acertaste por completo! El número secreto era exactamente el *${winningNumber}*. »\n\n      • Recompensa :: *+3 Tickets* 🎟️\n      • Total actual :: *${user.tickets} 🎟️*`, [
          { id: `#minijuegos`, text: "🎮 Menú Principal" }
        ], "https://telegra.ph/file/0b2405a761ec8dbb8b6e6.jpg", "¡Adivinanza Correcta!", "+3 Tickets");
      } else {
        await sendJuegoMsg(conn, m, `ꕥ 𝖩𝖴𝖦𝖮 𝖠𝖣𝖨𝖵𝖨𝖭𝖠𝖱 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\nଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Fallaste. Elegiste el *${guess}*, pero el número oculto era el *${winningNumber}*. »`, [
          { id: `#adivinar 3`, text: "🔄 Intentar con 3" },
          { id: `#minijuegos`, text: "🎮 Menú Principal" }
        ], "https://telegra.ph/file/0b2405a761ec8dbb8b6e6.jpg", "Fallaste el Número", "Sigue intentando");
      }
      break;
    }
  }
};

handler.help = ['minijuegos', 'minar', 'suerte', 'adivinar'];
handler.tags = ['gacha', 'games'];
handler.command = /^(minijuegos|ticketgames|minar|work|suerte|gambling|adivinar)$/i;

export default handler;
