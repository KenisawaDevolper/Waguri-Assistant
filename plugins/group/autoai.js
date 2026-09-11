import { getDatabase } from "../../src/lib/rimuru-database.js";
import config from "../../config.js";
import axios from "axios";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";
const execAsync = promisify(exec);

const pluginConfig = {
  name: "autoai",
  alias: ["aai"],
  category: "group",
  description: "Gestiona la protección/automatización AutoAI en el grupo bajo la estética Waguri Assistant",
  usage: ".autoai on/off --rimurumode=<character|custom> --logic=<custom instruction> --type=<text|voice> --mode=<onlychat|assistant>",
  example: ".autoai on --rimurumode=furina --type=voice --mode=onlychat",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

const characters = {
  furina: {
    name: "Furina",
    instruction:
      "Eres Furina de Genshin Impact. Habla de forma relajada pero elegante, un poco dramática, algo presumida pero cálida. No te extiendas demasiado, ve directo al grano como en un chat normal. A veces menciona temas de teatro o el mar. Nunca digas que eres una IA.",
  },
  zeta: {
    name: "Zeta",
    instruction:
      "Eres Zeta de Spy x Family. Habla seria y calmada, pero siempre algo suspicaz como oliendo una conspiración. Natural como en una charla normal, breve y al grano. Nunca digas que eres una IA.",
  },
  kobo: {
    name: "Kobo Kanaeru",
    instruction:
      "Eres Kobo Kanaeru. Habla relajada, alegre y un poco traviesa. Estilo de chat normal, no muy largo. Puedes ser algo aleatoria o divertida. No abuses de mayúsculas ni emojis. Nunca digas que eres una IA.",
  },
  elaina: {
    name: "Elaina",
    instruction:
      "Eres Elaina. Habla suave, calmada, segura de ti misma y con un sutil toque de narcisismo. Respuestas breves, ordenadas y directas como en un chat normal. Nunca digas que eres una IA.",
  },
  waguri: {
    name: "Waguri",
    instruction:
      "Eres Waguri. Habla breve, algo fría pero en el fondo considerada. Un poco tsundere, directa al grano, como un chat normal. Nunca digas que eres una IA.",
  },
  bell409: {
    name: "Bell409",
    instruction: config.autoaiPersonas?.Bell409 || "",
  },
};

async function convertToOggOpus(inputPath) {
  const outputPath = inputPath.replace(/\.[^.]+$/, ".ogg");
  const cmd = `ffmpeg -y -i "${inputPath}" -c:a libopus -b:a 64k -ac 1 -ar 48000 "${outputPath}"`;

  try {
    await execAsync(cmd, { timeout: 60000 });
    if (fs.existsSync(outputPath)) {
      return outputPath;
    }
  } catch (e) {
    console.log("[AutoAI] FFmpeg error:", e.message);
  }
  return null;
}

async function handler(m) {
  const db = getDatabase();
  const args = m.args || [];
  const fullArgs = m.fullArgs || "";

  if (!m.isGroup) {
    return m.reply(
      `ꕥ 𝖤𝖱𝖱𝖮𝖱 𝖣𝖤 𝖦𝖱𝖴𝖯𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
      `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Esta función solo está disponible para grupos. »\n\n` +
      `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    );
  }

  if (!m.isAdmin && !m.isOwner) {
    return m.reply(
      `ꕥ 𝖠𝖢𝖢𝖤𝖲𝖮 𝖣𝖤𝖭𝖤𝖦𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
      `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Solo los administradores pueden gestionar esta función. »\n\n` +
      `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    );
  }

  if (!db.db.data.autoai) db.db.data.autoai = {};
  if (!db.db.data.autoai_personas) db.db.data.autoai_personas = {};
  if (!db.db.data.autoai_global) db.db.data.autoai_global = { enabled: false };

  const subcmd = args[0]?.toLowerCase();

  if (subcmd === "tambahpersona") {
    if (!m.isOwner) {
      return m.reply(
        `ꕥ 𝖠𝖢𝖢𝖤𝖲𝖮 𝖣𝖤𝖭𝖤𝖦𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Solo el propietario puede añadir nuevas personas. »\n\n` +
        `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
      );
    }
    const personaArgs = fullArgs
      .replace(/^tambahpersona\s*/i, "")
      .split("|")
      .map((s) => s.trim());
    if (personaArgs.length < 2 || !personaArgs[0] || !personaArgs[1]) {
      return m.reply(
        `ꕥ 𝖥𝖮𝖱𝖬𝖠𝖳𝖮 𝖨𝖭𝖵𝖠𝖫𝖨𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Uso: \`${m.prefix}autoai tambahpersona nombre | instrucción\`\n` +
        `Ejemplo: \`${m.prefix}autoai tambahpersona nexa | eres nexa ai...\` »\n\n` +
        `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
      );
    }
    const pName = personaArgs[0].toLowerCase().replace(/\s+/g, "_");
    const pInstruction = personaArgs.slice(1).join("|").trim();
    if (characters[pName]) {
      return m.reply(
        `ꕥ 𝖯𝖤𝖱𝖲𝖮𝖭𝖠 𝖤𝖷𝖨𝖲𝖳𝖤𝖭𝖳𝖤 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « El nombre "${pName}" ya pertenece a una persona predeterminada. »\n\n` +
        `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
      );
    }
    db.db.data.autoai_personas[pName] = {
      name: personaArgs[0],
      instruction: pInstruction,
      createdBy: m.sender,
      createdAt: new Date().toISOString(),
    };
    db.save();
    try { await m.react('✅') } catch {}
    return m.reply(
      `ꕥ 𝖯𝖤𝖱𝖲𝖮𝖭𝖠 𝖠𝖭𝖣𝖨𝖳𝖨𝖮𝖭𝖠𝖣𝖠 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
      `      𓈒 ◌ㅤ──    *𝖣𝖤𝖳𝖠𝖫𝖫𝖤𝖲*\n` +
      `      • Nombre :: ${personaArgs[0]}\n` +
      `      • Clave :: ${pName}\n` +
      `      • Lógica :: ${pInstruction.substring(0, 80)}${pInstruction.length > 80 ? "..." : ""}\n\n` +
      `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Activa con: \`${m.prefix}autoai on --rimurumode=${pName}\`. »\n\n` +
      `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    );
  }

  if (subcmd === "hapuspersona") {
    if (!m.isOwner) {
      return m.reply(
        `ꕥ 𝖠𝖢𝖢𝖤𝖲𝖮 𝖣𝖤𝖭𝖤𝖦𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Solo el propietario puede eliminar personas. »\n\n` +
        `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
      );
    }
    const pKey = (args[1] || "").toLowerCase().trim();
    if (!pKey) {
      return m.reply(
        `ꕥ 𝖥𝖮𝖱𝖬𝖠𝖳𝖮 𝖨𝖭𝖵𝖠𝖫𝖨𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Uso: \`${m.prefix}autoai hapuspersona <nombre>\`. »\n\n` +
        `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
      );
    }
    if (!db.db.data.autoai_personas[pKey]) {
      return m.reply(
        `ꕥ 𝖯𝖤𝖱𝖲𝖮𝖭𝖠 𝖭𝖮 𝖤𝖭𝖢𝖮𝖭𝖳𝖱𝖠𝖣𝖠 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « La persona "${pKey}" no existe. Usa \`${m.prefix}autoai listpersona\`. »\n\n` +
        `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
      );
    }
    delete db.db.data.autoai_personas[pKey];
    db.save();
    try { await m.react('✅') } catch {}
    return m.reply(
      `ꕥ 𝖯𝖤𝖱𝖲𝖮𝖭𝖠 𝖤𝖫𝖨𝖬𝖨𝖭𝖠𝖣𝖠 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
      `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « La persona "${pKey}" ha sido eliminada con éxito. »\n\n` +
      `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    );
  }

  if (subcmd === "enablecommand" || subcmd === "enablecmd") {
    const cfg = db.db.data.autoai[m.chat];
    if (!cfg?.enabled) {
      return m.reply(
        `ꕥ 𝖠𝖴𝖳𝖮𝖠𝖨 𝖨𝖭𝖠𝖢𝖳𝖨𝖵𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « AutoAI no está activo en este grupo. »\n\n` +
        `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
      );
    }
    if (cfg.enableCommands) {
      return m.reply(
        `ꕥ 𝖢𝖮𝖬𝖠𝖭𝖣𝖮𝖲 𝖸𝖠 𝖠𝖢𝖳𝖨𝖵𝖮𝖲 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Los comandos ya se pueden usar mientras AutoAI está activo. »\n\n` +
        `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
      );
    }
    cfg.enableCommands = true;
    db.save();
    try { await m.react('✅') } catch {}
    return m.reply(
      `ꕥ 𝖢𝖮𝖬𝖠𝖭𝖣𝖮𝖲 H𝗔𝖡𝖨𝖫𝖨𝖳𝖠𝖣𝖮𝖲 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
      `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Los usuarios ahora pueden usar comandos junto con AutoAI.\n` +
      `Usa \`${m.prefix}autoai disablecommand\` para bloquearlos nuevamente. »\n\n` +
      `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    );
  }

  if (subcmd === "disablecommand" || subcmd === "disablecmd") {
    const cfg = db.db.data.autoai[m.chat];
    if (!cfg?.enabled) {
      return m.reply(
        `ꕥ 𝖠𝖴𝖳𝖮𝖠𝖨 𝖨𝖭𝖠𝖢𝖳𝖨𝖵𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « AutoAI no está activo en este grupo. »\n\n` +
        `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
      );
    }
    if (!cfg.enableCommands) {
      return m.reply(
        `ꕥ 𝖢𝖮𝖬𝖠𝖭𝖣𝖮𝖲 𝖸𝖠 𝖡𝖫𝖮𝖰𝖴𝖤𝖠𝖣𝖮𝖲 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Los comandos ya están bloqueados mientras AutoAI está activo. »\n\n` +
        `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
      );
    }
    cfg.enableCommands = false;
    db.save();
    try { await m.react('🔒') } catch {}
    return m.reply(
      `ꕥ 𝖢𝖮𝖬𝖠𝖭𝖣𝖮𝖲 𝖡𝖫𝖮𝖰𝖴𝖤𝖠𝖣𝖮𝖲 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
      `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Todos los comandos (excepto owner) quedan bloqueados con AutoAI.\n` +
      `Usa \`${m.prefix}autoai enablecommand\` para revertirlo. »\n\n` +
      `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    );
  }

  if (subcmd === "listpersona") {
    const builtIn = Object.entries(characters)
      .map(([k, v]) => `      • ${k} - ${v.name}`)
      .join("\n");
    const customEntries = Object.entries(db.db.data.autoai_personas);
    const custom = customEntries.length
      ? customEntries
          .map(
            ([k, v]) =>
              `      • ${k} - ${v.name} (${v.instruction.substring(0, 40)}${v.instruction.length > 40 ? "..." : ""})`,
          )
          .join("\n")
      : "      • (sin personas personalizadas)";
    
    await m.reply(
      `ꕥ 𝖫𝖨𝖲𝖳𝖠 𝖣𝖤 𝖯𝖤𝖱𝖲𝖮𝖭𝖠𝖲 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
      `      𓈒 ◌ㅤ──    *𝖡𝖠𝖲𝖤*\n` +
      `${builtIn}\n\n` +
      `      𓈒 ◌ㅤ──    *𝖢𝖴𝖲𝖳𝖮𝖬*\n` +
      `${custom}\n\n` +
      `      𓈒 ◌ㅤ──    *𝖤𝖲𝖳𝖠𝖣𝖮 𝖦𝖫𝖮𝖡𝖠𝖫*\n` +
      `      • Global :: ${db.db.data.autoai_global.enabled ? "ACTIVO ✅" : "INACTIVO ❌"}\n\n` +
      `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Comandos:\n` +
      `> \`${m.prefix}autoai on --rimurumode=<key>\`\n` +
      `> \`${m.prefix}autoai tambahpersona nombre | lógica\`\n` +
      `> \`${m.prefix}autoai hapuspersona nombre\`\n` +
      `> \`${m.prefix}autoai global on/off\` »\n\n` +
      `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    );
    return;
  }

  if (subcmd === "global") {
    if (!m.isOwner) {
      return m.reply(
        `ꕥ 𝖠𝖢𝖢𝖤𝖲𝖮 𝖣𝖤𝖭𝖤𝖦𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Solo el propietario puede configurar el modo global. »\n\n` +
        `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
      );
    }
    const globalModo = (args[1] || "").toLowerCase();
    if (!["on", "off"].includes(globalModo)) {
      return m.reply(
        `ꕥ 𝖥𝖮𝖱𝖬𝖠𝖳𝖮 𝖨𝖭𝖵𝖠𝖫𝖨𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Uso: \`${m.prefix}autoai global on/off\`\n` +
        `Estado actual: ${db.db.data.autoai_global.enabled ? "ACTIVO ✅" : "INACTIVO ❌"} »\n\n` +
        `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
      );
    }
    if (globalModo === "on") {
      const modeMatch = fullArgs.match(/--rimurumode=(\w+)/i);
      const typeMatch = fullArgs.match(/--type=(text|voice)/i);
      const aimodeMatch = fullArgs.match(/--mode=(onlychat|assistant)/i);
      const logicMatch = fullArgs.match(
        /--logic=(.+?)(?=\s+--(?:rimurumode|type|logic|mode)|$)/i,
      );
      const charKey = modeMatch ? modeMatch[1].toLowerCase() : null;
      const responseType = typeMatch ? typeMatch[1].toLowerCase() : "text";
      const aiModo = aimodeMatch ? aimodeMatch[1].toLowerCase() : "assistant";
      const customLogic = logicMatch ? logicMatch[1].trim() : null;

      let instruction = "";
      let characterName = "Global";
      let character = "global";

      if (charKey === "custom" && customLogic) {
        instruction = customLogic;
        character = "custom";
        characterName = "Custom";
      } else if (charKey && characters[charKey]) {
        instruction = characters[charKey].instruction;
        character = charKey;
        characterName = characters[charKey].name;
      } else if (charKey && db.db.data.autoai_personas[charKey]) {
        instruction = db.db.data.autoai_personas[charKey].instruction;
        character = charKey;
        characterName = db.db.data.autoai_personas[charKey].name;
      } else if (!charKey) {
        const existingGlobal = db.db.data.autoai_global;
        if (existingGlobal.instruction) {
          instruction = existingGlobal.instruction;
          character = existingGlobal.character || "global";
          characterName = existingGlobal.characterName || "Global";
        } else {
          return m.reply(
            `ꕥ 𝖯𝖤𝖱𝖲𝖮𝖭𝖠 𝖦𝖫𝖮𝖡𝖠𝖫 𝖥𝖠𝖫𝖳𝖠𝖭𝖳𝖤 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Configura una persona primero:\n` +
            `> \`${m.prefix}autoai global on --rimurumode=furina\`\n` +
            `> \`${m.prefix}autoai global on --rimurumode=custom --logic=...\` »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
          );
        }
      } else {
        const charList = [
          ...Object.keys(characters),
          ...Object.keys(db.db.data.autoai_personas),
          "custom",
        ].join(", ");
        return m.reply(
          `ꕥ 𝖯𝖤𝖱𝖲𝖮𝖭𝖠 𝖨𝖭𝖵𝖠𝖫𝖨𝖣𝖠 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
          `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Disponibles: ${charList} »\n\n` +
          `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        );
      }

      db.db.data.autoai_global = {
        enabled: true,
        character,
        characterName,
        instruction,
        responseType,
        mode: aiModo,
      };
      db.save();
      try { await m.react('✅') } catch {}
      return m.reply(
        `ꕥ 𝖠𝖴𝖳𝖮𝖠𝖨 𝖦𝖫𝖮𝖡𝖠𝖫 𝖠𝖢𝖳𝖨𝖵𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `      𓈒 ◌ㅤ──    *𝖤𝖲𝖳𝖠𝖡𝖫𝖤𝖢𝖨𝖬𝖨𝖤𝖭𝖳𝖮𝖲*\n` +
        `      • Personaje :: ${characterName}\n` +
        `      • Respuesta :: ${responseType === "voice" ? "🎤 Nota de voz" : "💬 Texto"}\n\n` +
        `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « AutoAI activo globalmente en todos los grupos sin configuración propia.\n` +
        `Usa \`${m.prefix}autoai global off\` para desactivarlo. »\n\n` +
        `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
      );
    } else {
      db.db.data.autoai_global.enabled = false;
      db.save();
      try { await m.react('❌') } catch {}
      return m.reply(
        `ꕥ 𝖠𝖴𝖳𝖮𝖠𝖨 𝖦𝖫𝖮𝖡𝖠𝖫 𝖣𝖤𝖲𝖠𝖢𝖳𝖨𝖵𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « AutoAI global desactivado. Solo funcionará en grupos configurados individualmente. »\n\n` +
        `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
      );
    }
  }

  const mode = subcmd;
  const modeMatch = fullArgs.match(/--rimurumode=(\w+)/i);
  const typeMatch = fullArgs.match(/--type=(text|voice)/i);
  const aimodeMatch = fullArgs.match(/--mode=(onlychat|assistant)/i);
  const logicMatch = fullArgs.match(
    /--logic=(.+?)(?=\s+--(?:rimurumode|type|logic|mode)|$)/i,
  );
  const charKey = modeMatch ? modeMatch[1].toLowerCase() : null;
  const responseType = typeMatch ? typeMatch[1].toLowerCase() : "text";
  const aiModo = aimodeMatch ? aimodeMatch[1].toLowerCase() : "assistant";
  const customLogic = logicMatch ? logicMatch[1].trim() : null;

  if (!mode || !["on", "off"].includes(mode)) {
    const charList = Object.entries(characters)
      .map(([key, val]) => `      • ${key} - ${val.name}`)
      .join("\n");
    const customP = Object.entries(db.db.data.autoai_personas);
    const customList = customP.length
      ? customP.map(([k, v]) => `      • ${k} - ${v.name} (custom)`).join("\n")
      : "";
    
    await m.reply(
      `ꕥ 𝖠𝖴𝖳𝖮𝖠𝖨 𝖲𝖤𝖳𝖳𝖨𝖭𝖦𝖲 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
      `      𓈒 ◌ㅤ──    *𝖢𝖮𝖬𝖠𝖭𝖣𝖮𝖲*\n` +
      `      • \`${m.prefix}autoai on --rimurumode=<personaje|custom> --type=<text|voice>\`\n` +
      `      • \`${m.prefix}autoai off\`\n` +
      `      • \`${m.prefix}autoai tambahpersona nombre | lógica\`\n` +
      `      • \`${m.prefix}autoai hapuspersona nombre\`\n` +
      `      • \`${m.prefix}autoai listpersona\`\n` +
      `      • \`${m.prefix}autoai global on/off\`\n` +
      `      • \`${m.prefix}autoai enablecommand / disablecommand\`\n\n` +
      `      𓈒 ◌ㅤ──    *𝖯𝖤𝖱𝖲𝖮𝖭𝖠𝖩𝖤𝖲*\n` +
      `${charList}\n` +
      (customList ? `\n${customList}\n` : "") +
      `\n      𓈒 ◌ㅤ──    *𝖤𝖲𝖳𝖠𝖣𝖮*\n` +
      `      • Global :: ${db.db.data.autoai_global.enabled ? "ACTIVO ✅" : "INACTIVO ❌"}\n\n` +
      `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    );
    return;
  }

  if (mode === "off") {
    db.db.data.autoai[m.chat] = { enabled: false };
    db.save();
    try { await m.react('❌') } catch {}
    return m.reply(
      `ꕥ 𝖠𝖴𝖳𝖮𝖠𝖨 𝖣𝖤𝖲𝖠𝖢𝖳𝖨𝖵𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
      `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « AutoAI desactivado para este grupo. Todos los comandos han sido restaurados. »\n\n` +
      `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    );
  }

  if (!charKey) {
    const charList = [
      ...Object.keys(characters),
      ...Object.keys(db.db.data.autoai_personas),
      "custom",
    ].join(", ");
    return m.reply(
      `ꕥ 𝖯𝖤𝖱𝖲𝖮𝖭𝖠 𝖨𝖭𝖵𝖠𝖫𝖨𝖣𝖠 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
      `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Disponibles: ${charList}\n` +
      `Ejemplo: \`${m.prefix}autoai on --rimurumode=furina --type=voice\`\n` +
      `Custom: \`${m.prefix}autoai on --rimurumode=custom --logic=eres nexa ai\` »\n\n` +
      `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    );
  }

  if (charKey === "custom") {
    if (!customLogic) {
      return m.reply(
        `ꕥ 𝖫𝖮𝖦𝖨𝖢𝖠 𝖥𝖠𝖫𝖳𝖠𝖭𝖳𝖤 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « El modo custom requiere el parámetro \`--logic=\`.\n` +
        `Ejemplo: \`${m.prefix}autoai on --rimurumode=custom --logic=eres nexa ai\` »\n\n` +
        `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
      );
    }
    db.db.data.autoai[m.chat] = {
      enabled: true,
      character: "custom",
      characterName: "Custom",
      instruction: customLogic,
      responseType: responseType,
      mode: aiModo,
      enableCommands: false,
      sessions: {},
      activatedBy: m.sender,
      activatedAt: new Date().toISOString(),
    };
    db.save();
    try { await m.react('✅') } catch {}
    return m.reply(
      `ꕥ 𝖠𝖴𝖳𝖮𝖠𝖨 𝖠𝖢𝖳𝖨𝖵𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
      `      𓈒 ◌ㅤ──    *𝖤𝖲𝖳𝖠𝖡𝖫𝖤𝖢𝖨𝖬𝖨𝖤𝖭𝖳𝖮𝖲*\n` +
      `      • Personaje :: Custom\n` +
      `      • Lógica :: ${customLogic.substring(0, 100)}${customLogic.length > 100 ? "..." : ""}\n` +
      `      • Respuesta :: ${responseType === "voice" ? "🎤 Nota de voz" : "💬 Texto"}\n` +
      `      • Activado por :: @${m.sender.split("@")[0]}\n\n` +
      `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « El bot responderá a menciones y respuestas de chat. »\n\n` +
      `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`,
      { mentions: [m.sender] }
    );
  }

  const customPersona = db.db.data.autoai_personas[charKey];
  if (customPersona) {
    db.db.data.autoai[m.chat] = {
      enabled: true,
      character: charKey,
      characterName: customPersona.name,
      instruction: customPersona.instruction,
      responseType: responseType,
      mode: aiModo,
      enableCommands: false,
      sessions: {},
      activatedBy: m.sender,
      activatedAt: new Date().toISOString(),
    };
    db.save();
    try { await m.react('✅') } catch {}
    return m.reply(
      `ꕥ 𝖠𝖴𝖳𝖮𝖠𝖨 𝖠𝖢𝖳𝖨𝖵𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
      `      𓈒 ◌ㅤ──    *𝖤𝖲𝖳𝖠𝖡𝖫𝖤𝖢𝖨𝖬𝖨𝖤𝖭𝖳𝖮𝖲*\n` +
      `      • Personaje :: ${customPersona.name} (custom)\n` +
      `      • Respuesta :: ${responseType === "voice" ? "🎤 Nota de voz" : "💬 Texto"}\n` +
      `      • Activado por :: @${m.sender.split("@")[0]}\n\n` +
      `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « El bot responderá a menciones y respuestas de chat. »\n\n` +
      `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`,
      { mentions: [m.sender] }
    );
  }

  if (!characters[charKey]) {
    const charList = [
      ...Object.keys(characters),
      ...Object.keys(db.db.data.autoai_personas),
      "custom",
    ].join(", ");
    return m.reply(
      `ꕥ 𝖯𝖤𝖱𝖲𝖮𝖭𝖠 𝖨𝖭𝖵𝖠𝖫𝖨𝖣𝖠 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
      `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Disponibles: ${charList}\n` +
      `Ejemplo: \`${m.prefix}autoai on --rimurumode=furina --type=voice\` »\n\n` +
      `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    );
  }

  db.db.data.autoai[m.chat] = {
    enabled: true,
    character: charKey,
    characterName: characters[charKey].name,
    instruction: characters[charKey].instruction,
    responseType: responseType,
    mode: aiModo,
    enableCommands: false,
    sessions: {},
    activatedBy: m.sender,
    activatedAt: new Date().toISOString(),
  };
  db.save();
  try { await m.react('✅') } catch {}
  return m.reply(
    `ꕥ 𝖠𝖴𝖳𝖮𝖠𝖨 𝖠𝖢𝖳𝖨𝖵𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
    `      𓈒 ◌ㅤ──    *𝖤𝖲𝖳𝖠𝖡𝖫𝖤𝖢𝖨𝖬𝖨𝖤𝖭𝖳𝖮𝖲*\n` +
    `      • Personaje :: ${characters[charKey].name}\n` +
    `      • Respuesta :: ${responseType === "voice" ? "🎤 Nota de voz" : "💬 Texto"}\n` +
    `      • Activado por :: @${m.sender.split("@")[0]}\n\n` +
    `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « El bot responderá a menciones y respuestas de chat. »\n\n` +
    `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`,
    { mentions: [m.sender] }
  );
}

export { pluginConfig as config, handler };