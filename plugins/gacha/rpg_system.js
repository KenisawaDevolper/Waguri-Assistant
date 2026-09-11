import { generateWAMessageFromContent } from "ourin";
import axios from "axios";
import sharp from "sharp";

// ==========================================
// GESTIÓN LOCAL RPG (AHORA CON ESTADÍSTICAS)
// ==========================================
function ensureRpgUser(userId) {
  if (!global.db) global.db = {};
  if (!global.db.data) global.db.data = {};
  if (!global.db.data.users) global.db.data.users = {};
  
  if (!global.db.data.users[userId]) {
    global.db.data.users[userId] = {};
  }
  
  const u = global.db.data.users[userId];
  
  // Recursos básicos
  if (typeof u.tickets !== "number") u.tickets = 0;
  if (typeof u.gold !== "number") u.gold = 0;
  if (typeof u.level !== "number") u.level = 1;
  if (typeof u.exp !== "number") u.exp = 0;
  
  // Estadísticas de combate
  if (typeof u.maxHp !== "number") u.maxHp = 100;
  if (typeof u.hp !== "number") u.hp = 100;
  if (typeof u.attack !== "number") u.attack = 10;
  if (typeof u.defense !== "number") u.defense = 10;
  
  if (!u.harem) u.harem = [];
  if (!u.cooldowns) u.cooldowns = {};
  return u;
}

// ==========================================
// FUNCIÓN AUXILIAR PARA MENSAJES INTERACTIVOS
// ==========================================
async function sendRpgMsg(conn, m, text, buttons = [], imageUrl = null, title = "Waguri RPG", desc = "Sistema de Rol") {
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
    buttons = [{ id: `#perfilgacha`, text: "👤 Mi Perfil RPG" }];
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
// HANDLER PRINCIPAL RPG
// ==========================================
let handler = async (m, { conn, command, args }) => {
  const sender = m.sender;
  const user = ensureRpgUser(sender);
  
  // Lógica de subida de nivel dinámica
  const checkLevelUp = (u) => {
    let leveledUp = false;
    let xpNeeded = u.level * 100;
    
    while (u.exp >= xpNeeded) {
      u.exp -= xpNeeded;
      u.level += 1;
      u.maxHp += 20;    // Gana vida máxima
      u.hp = u.maxHp;   // Se cura por completo
      u.attack += 5;    // Sube su ataque
      u.defense += 3;   // Sube su defensa
      leveledUp = true;
      xpNeeded = u.level * 100; // Recalcular para el siguiente ciclo
    }
    return leveledUp;
  };

  switch (command) {
    case "perfil":
    case "perfilgacha":
    case "profilegacha": {
      const xpNeeded = user.level * 100;
      let rank = "Novato";
      if (user.level >= 5) rank = "Aventurero";
      if (user.level >= 15) rank = "Guerrero Élite";
      if (user.level >= 30) rank = "Maestro Gacha";
      if (user.level >= 50) rank = "Dios del Gacha";

      const text = 
        `ꕥ 𝖯𝖤𝖱𝖥𝖨𝖫 𝖱𝖯𝖦 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `      𓈒 ◌ㅤ──    *𝖤𝖲𝖳𝖠𝖣Í𝖲𝖳𝖨𝖢𝖠𝖲*\n` +
        `      • Nivel :: *${user.level}* (Rango: ${rank})\n` +
        `      • Experiencia :: *${user.exp} / ${xpNeeded} XP*\n` +
        `      • Salud :: *${user.hp} / ${user.maxHp} HP* ❤️\n` +
        `      • Ataque :: *${user.attack}* ⚔️ | Defensa :: *${user.defense}* 🛡️\n\n` +
        `      𓈒 ◌ㅤ──    *𝖨𝖭𝖵𝖤𝖭𝖳𝖠𝖱𝖨𝖮*\n` +
        `      • Monedas :: *${user.gold}* 🪙\n` +
        `      • Tickets :: *${user.tickets}* 🎟️\n` +
        `      • Harem :: *${user.harem.length} Waifus* 💖\n\n` +
        `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « ¡Sigue completando misiones para fortalecerte! »`;

      await sendRpgMsg(conn, m, text, [
        { id: `#mision`, text: "⚔️ Ir de Misión" },
        { id: `#curar`, text: "🏥 Curarse" },
        { id: `#diariogacha`, text: "🎁 Recompensa Diaria" }
      ], "https://telegra.ph/file/0b2405a761ec8dbb8b6e6.jpg", "Perfil de Jugador", `Nivel ${user.level}`);
      break;
    }

    case "diario":
    case "diariogacha":
    case "dailygacha": {
      const cooldownTime = 24 * 60 * 60 * 1000; // 24 horas
      const now = Date.now();
      const lastDaily = user.cooldowns.diario || 0;

      if (now - lastDaily < cooldownTime) {
        const remainingHours = Math.floor((cooldownTime - (now - lastDaily)) / (1000 * 60 * 60));
        const remainingMins = Math.floor(((cooldownTime - (now - lastDaily)) % (1000 * 60 * 60)) / (1000 * 60));
        return await sendRpgMsg(conn, m, `ꕥ 𝖢𝖮𝖮𝖫𝖣𝖮𝖶𝖭 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\nଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Ya reclamaste tu recompensa. Vuelve en *${remainingHours}h ${remainingMins}m*. »`);
      }

      user.cooldowns.diario = now;
      user.tickets += 5;
      user.exp += 100;
      user.gold += 250;
      
      let lvlUpMsg = checkLevelUp(user) ? `\n\n🎉 ¡Felicidades! Has subido al *Nivel ${user.level}* 🎉` : "";

      await sendRpgMsg(conn, m, `ꕥ 𝖱𝖤𝖢𝖮𝖬𝖯𝖤𝖭𝖲𝖠 𝖣𝖨𝖠𝖱𝖨𝖠 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\nଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Has reclamado tu botín diario. »\n\n      • *+5 Tickets* 🎟️\n      • *+250 Monedas* 🪙\n      • *+100 XP* ✨${lvlUpMsg}`, [
        { id: `#perfilgacha`, text: "👤 Ver Perfil" }
      ], "https://telegra.ph/file/0b2405a761ec8dbb8b6e6.jpg", "Botín Diario", "Reclamado con éxito");
      break;
    }

    case "curar":
    case "heal": {
      if (user.hp >= user.maxHp) {
        return await sendRpgMsg(conn, m, `ꕥ 𝖧𝖮𝖲𝖯𝖨𝖳𝖠𝖫 𝖱𝖯𝖦 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\nଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Tu salud ya está al máximo (*${user.hp}/${user.maxHp} HP*). ¡Estás listo para luchar! »`);
      }

      const cost = 50;
      if (user.gold < cost) {
        return await sendRpgMsg(conn, m, `ꕥ 𝖧𝖮𝖲𝖯𝖨𝖳𝖠𝖫 𝖱𝖯𝖦 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\nଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « No tienes suficientes monedas para pagar la curación. Cuesta *${cost} Monedas* 🪙 y solo tienes *${user.gold}*. »`);
      }

      user.gold -= cost;
      user.hp = user.maxHp;

      await sendRpgMsg(conn, m, `ꕥ 𝖧𝖮𝖲𝖯𝖨𝖳𝖠𝖫 𝖱𝖯𝖦 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\nଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Has pagado *${cost} Monedas* 🪙. ¡Te has curado por completo! »\n\n      • Salud actual :: *${user.hp} / ${user.maxHp} HP* ❤️`, [
        { id: `#mision`, text: "⚔️ Ir de Misión" }
      ]);
      break;
    }

    case "mision":
    case "quest": {
      const cooldownTime = 60 * 60 * 1000; // 1 hora
      const now = Date.now();
      const lastQuest = user.cooldowns.mision || 0;

      if (now - lastQuest < cooldownTime) {
        const remaining = Math.ceil((cooldownTime - (now - lastQuest)) / 60000);
        return await sendRpgMsg(conn, m, `ꕥ 𝖢𝖮𝖮𝖫𝖣𝖮𝖶𝖭 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\nଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Tus waifus están descansando de la última expedición. Vuelve en *${remaining} minuto(s)*. »`);
      }

      if (user.harem.length < 1) {
        return await sendRpgMsg(conn, m, `ꕥ 𝖬𝖨𝖲𝖨Ó𝖭 𝖥𝖠𝖫𝖫𝖨𝖣𝖠 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\nଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « No tienes a ninguna waifu en tu harem para enviar a la misión. »`, [
          { id: `#waifu`, text: "🎰 Tirar Gacha" }
        ]);
      }

      if (user.hp <= 20) {
        return await sendRpgMsg(conn, m, `ꕥ 𝖬𝖨𝖲𝖨Ó𝖭 𝖥𝖠𝖫𝖫𝖨𝖣𝖠 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\nଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Tu salud es muy baja (*${user.hp} HP*) para ir de expedición. ¡Cúrate primero! »`, [
          { id: `#curar`, text: "🏥 Curarse (50 Monedas)" }
        ]);
      }

      user.cooldowns.mision = now;
      const earnedExp = Math.floor(Math.random() * 60) + 30; // 30 - 90 XP
      const earnedGold = Math.floor(Math.random() * 100) + 50; // 50 - 150 Monedas
      const damageTaken = Math.floor(Math.random() * 15) + 5; // 5 - 20 Daño
      
      user.exp += earnedExp;
      user.gold += earnedGold;
      user.hp -= damageTaken;

      let lvlUpMsg = checkLevelUp(user) ? `\n\n🎉 ¡Felicidades! Has subido al *Nivel ${user.level}* 🎉` : "";

      const randomWaifu = user.harem[Math.floor(Math.random() * user.harem.length)].name;

      const text = 
        `ꕥ 𝖬𝖨𝖲𝖨Ó𝖭 𝖤𝖷𝖨𝖳𝖮𝖲𝖠 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Enviaste a *${randomWaifu}* a explorar las mazmorras. Enfrentaron monstruos y regresaron con un gran botín, aunque sufrieron algo de daño. »\n\n` +
        `      • *+${earnedExp} XP* ✨\n` +
        `      • *+${earnedGold} Monedas* 🪙\n` +
        `      • *-${damageTaken} HP* 💔 (Salud actual: ${user.hp})\n${lvlUpMsg}`;

      await sendRpgMsg(conn, m, text, [
        { id: `#perfilgacha`, text: "👤 Ver Perfil" },
        { id: `#curar`, text: "🏥 Curarse" }
      ], "https://telegra.ph/file/0b2405a761ec8dbb8b6e6.jpg", "Misión Completada", "Exploración de Mazmorras");
      break;
    }

    case "batalla":
    case "pvp": {
      if (!m.mentionedJid || m.mentionedJid.length === 0) {
        return await sendRpgMsg(conn, m, `ꕥ 𝖡𝖠𝖳𝖠𝖫𝖫𝖠 𝖱𝖯𝖦 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\nଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Debes mencionar a un oponente para luchar.\nUso: *#batalla @usuario* »`);
      }

      const targetJid = m.mentionedJid[0];
      if (targetJid === sender) {
        return await sendRpgMsg(conn, m, `ꕥ 𝖡𝖠𝖳𝖠𝖫𝖫𝖠 𝖱𝖯𝖦 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\nଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « No puedes luchar contra ti mismo, baka. »`);
      }

      if (user.hp <= 10) {
        return await sendRpgMsg(conn, m, `ꕥ 𝖡𝖠𝖳𝖠𝖫𝖫𝖠 𝖱𝖯𝖦 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\nଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Estás muy débil para luchar (*${user.hp} HP*). Necesitas curarte primero. »`, [
          { id: `#curar`, text: "🏥 Curarse" }
        ]);
      }

      const target = ensureRpgUser(targetJid);
      
      if (target.hp <= 10) {
        return await sendRpgMsg(conn, m, `ꕥ 𝖡𝖠𝖳𝖠𝖫𝖫𝖠 𝖱𝖯𝖦 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\nଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « ¡Ten piedad! Tu oponente está demasiado débil para luchar en este momento. »`);
      }

      const cooldownTime = 15 * 60 * 1000; // 15 minutos
      const now = Date.now();
      if (now - (user.cooldowns.batalla || 0) < cooldownTime) {
        const remaining = Math.ceil((cooldownTime - (now - user.cooldowns.batalla)) / 60000);
        return await sendRpgMsg(conn, m, `ꕥ 𝖢𝖮𝖮𝖫𝖣𝖮𝖶𝖭 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\nଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Estás exhausto de tu última batalla. Descansa *${remaining} minuto(s)*. »`);
      }

      user.cooldowns.batalla = now;

      // Lógica de batalla con Stats Reales
      // Poder se calcula en base al Ataque + Suerte RNG, restando la defensa del oponente.
      const userPower = user.attack + Math.floor(Math.random() * 20);
      const targetPower = target.attack + Math.floor(Math.random() * 20);

      const targetName = `@${targetJid.split("@")[0]}`;
      const stolenXP = Math.floor(Math.random() * 40) + 10;
      const stolenGold = Math.floor(Math.random() * 50) + 20;

      if (userPower > targetPower) {
        // Ganas la batalla
        const damageToTarget = Math.max(5, userPower - target.defense);
        target.hp = Math.max(0, target.hp - damageToTarget); // El perdedor pierde HP
        
        user.exp += stolenXP;
        user.gold += stolenGold;
        target.gold = Math.max(0, target.gold - stolenGold); // Evitamos oro negativo
        
        let lvlUpMsg = checkLevelUp(user) ? `\n🎉 ¡Has subido al Nivel ${user.level}! 🎉` : "";

        await conn.sendMessage(m.chat, { 
          text: `ꕥ 𝖵𝖨𝖢𝖳𝖮𝖱𝖨𝖠 𝖱𝖯𝖦 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\nଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « ¡Ganaste la batalla contra ${targetName}! Atacaste con una fuerza de *${userPower}* aplastando su defensa. »\n\n      • Botín :: *+${stolenGold} Monedas* 🪙\n      • Experiencia :: *+${stolenXP} XP* ✨\n      • Daño infligido :: *-${damageToTarget} HP* 💔 a tu rival.${lvlUpMsg}`, 
          mentions: [targetJid] 
        }, { quoted: m });
      } else {
        // Pierdes la batalla
        const damageToUser = Math.max(5, targetPower - user.defense);
        user.hp = Math.max(0, user.hp - damageToUser);
        
        await conn.sendMessage(m.chat, { 
          text: `ꕥ 𝖣𝖤𝖱𝖱𝖮𝖳𝖠 𝖱𝖯𝖦 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\nଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Perdiste miserablemente contra ${targetName}. Te faltó fuerza y sufriste heridas graves en el escape. »\n\n      • Daño recibido :: *-${damageToUser} HP* 💔 (Salud actual: ${user.hp})`, 
          mentions: [targetJid] 
        }, { quoted: m });
      }
      break;
    }
  }
};

handler.help = ['perfilgacha', 'diariogacha', 'mision', 'curar', 'batalla @user'];
handler.tags = ['rpg', 'gacha'];
handler.command = /^(perfil|perfilgacha|profilegacha|diario|diariogacha|dailygacha|mision|quest|batalla|pvp|curar|heal)$/i;

export default handler;
