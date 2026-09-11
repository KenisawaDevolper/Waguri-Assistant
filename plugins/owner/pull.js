import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import config from "../../config.js";

const execAsync = promisify(exec);

const pluginConfig = {
  name: "pull",
  alias: ["sync", "update", "gitpull", "sincronizar"],
  category: "owner",
  description: "Sincroniza el bot con GitHub haciendo git pull (Owner Only) con la estética Waguri Assistant 🔄",
  usage: ".pull | .sync | .update",
  example: ".pull",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

function redactToken(str) {
  if (!str) return str;
  // Oculta https://TOKEN@github.com -> https://***@github.com y ghp_xxx
  return String(str)
    .replace(/https:\/\/[^@\s]+@/g, "https://***@")
    .replace(/ghp_[A-Za-z0-9_]+/g, "***")
    .replace(/github_pat_[A-Za-z0-9_]+/g, "***");
}

function sanitizeOutput(str, max = 3500) {
  if (!str) return "";
  let s = redactToken(String(str).trim());
  if (s.length > max) s = s.slice(0, max) + "\n... (truncated)";
  return s;
}

async function runGit(cmd, cwd) {
  try {
    const { stdout, stderr } = await execAsync(cmd, { cwd, timeout: 60000, maxBuffer: 10 * 1024 * 1024 });
    return { ok: true, out: (stdout || "") + (stderr ? "\n" + stderr : "") };
  } catch (e) {
    const out = (e.stdout || "") + (e.stderr ? "\n" + e.stderr : "") + (e.message ? "\n" + e.message : "");
    return { ok: false, out, error: e };
  }
}

async function ensureStagingCwd(originalCwd) {
  if (!originalCwd.includes("/sdcard")) return originalCwd;
  const staging = "/data/local/tmp/waguri-push";
  try {
    await execAsync(`mkdir -p "${staging}"`);
    await execAsync(`tar -cf - -C "${originalCwd}" --exclude='.git' --exclude='node_modules' --exclude='tmp' --exclude='temp' --exclude='sessions' --exclude='session' . | tar -xf - -C "${staging}"`, { timeout: 60000 });
    try { await execAsync(`cp -f "${originalCwd}/.gitignore" "${staging}/.gitignore" 2>/dev/null || true`); } catch {}
    return staging;
  } catch { return originalCwd; }
}

async function handler(m, { sock }) {
  if (!config.isOwner(m.sender)) {
    return m.reply("❌ *Owner Only!* Solo el creador puede usar .pull");
  }

  const cwd = process.cwd();
  let cwdEffective = cwd;
  let usingStaging = false;
  if (cwd.includes("/sdcard")) {
    const st = await ensureStagingCwd(cwd);
    if (st !== cwd) { cwdEffective = st; usingStaging = true; }
  }

  await m.react("🔄");
  await m.reply(
    `🔄 *ɢɪᴛ ᴘᴜʟʟ — .ᴘᴜʟʟ*\n\n` +
    `> 📂 Dir: \`${cwd}\`${usingStaging ? ` → staging: \`${cwdEffective}\`` : ""}\n` +
    `> ⏳ Sincronizando con GitHub...`
  );

  const logs = [];
  if (usingStaging) logs.push(`ℹ Usando staging ${cwdEffective}`);

  const gitCheck = await runGit("git --version", cwdEffective);
  if (!gitCheck.ok) {
    await m.react("❌");
    return m.reply(`❌ *Git no instalado*\n\n\`\`\`${sanitizeOutput(gitCheck.out, 800)}\`\`\``);
  }
  logs.push(`✓ ${sanitizeOutput(gitCheck.out, 200)}`);

  const isGitRepo = fs.existsSync(path.join(cwdEffective, ".git")) || fs.existsSync(path.join(cwd, ".git"));
  if (!isGitRepo && !usingStaging) {
    const check = await runGit("git rev-parse --is-inside-work-tree", cwdEffective);
    if (!check.ok || !check.out.includes("true")) {
      await m.react("❌");
      return m.reply(`❌ *No es un repo git*\n\n> Clona con:\n\`git clone https://github.com/KenisawaDevolper/Waguri-Assistant.git\``);
    }
  }

  // Asegurar branch main
  await runGit("git branch -M main 2>/dev/null || true", cwdEffective);

  const remoteCheck = await runGit("git remote -v", cwdEffective);
  logs.push(`$ git remote -v\n${sanitizeOutput(redactToken(remoteCheck.out), 600)}`);
  if (!remoteCheck.out.includes("origin")) {
    await m.react("⚠️");
    return m.reply(`⚠️ *Sin remote origin*\n\n> Configura:\n\`git remote add origin https://github.com/KenisawaDevolper/Waguri-Assistant.git\``);
  }

  // Fetch
  const fetchRes = await runGit("git fetch origin", cwdEffective);
  logs.push(`$ git fetch origin\n${sanitizeOutput(fetchRes.out || "ok", 500)}`);

  // Verificar si hay cambios sin commitear -> stash
  const statusRes = await runGit("git status --porcelain", cwdEffective);
  const hasUnstaged = statusRes.out.trim().length > 0;
  let didStash = false;
  if (hasUnstaged) {
    logs.push(`ℹ Cambios sin guardar detectados, haciendo stash...`);
    const stashRes = await runGit('git stash push -m "temp pull stash" --include-untracked', cwdEffective);
    logs.push(`$ git stash\n${sanitizeOutput(stashRes.out, 600)}`);
    didStash = stashRes.ok || stashRes.out.includes("Saved");
  }

  // Pull --rebase
  let pullRes = await runGit("git pull --rebase origin main", cwdEffective);
  logs.push(`$ git pull --rebase origin main\n${sanitizeOutput(pullRes.out, 1200)}`);

  if (!pullRes.ok) {
    const outLower = pullRes.out.toLowerCase();
    if (outLower.includes("conflict") || outLower.includes("could not apply") || outLower.includes("needs merge")) {
      logs.push("⚠ Conflicto en rebase, intentando abort y reset...");
      await runGit("git rebase --abort 2>/dev/null || true", cwdEffective);
      const resetRes = await runGit("git reset --hard origin/main", cwdEffective);
      logs.push(`$ git reset --hard origin/main\n${sanitizeOutput(resetRes.out, 800)}`);
      pullRes = { ok: resetRes.ok, out: resetRes.out };
      if (pullRes.ok) {
        logs.push("✓ Reset a origin/main exitoso");
      } else {
        await m.react("❌");
        return m.reply(
          `❌ *git pull falló (conflicto)*\n\n\`\`\`${sanitizeOutput(pullRes.out, 2000)}\`\`\`\n\n` +
          `*Solución manual:*\n\`git rebase --abort && git reset --hard origin/main\`\n\n` +
          `*Logs:*\n\`\`\`${sanitizeOutput(logs.slice(-5).join("\n---\n"), 1000)}\`\`\``
        );
      }
    } else if (outLower.includes("unstaged") || outLower.includes("please commit")) {
      await runGit("git stash push -m \"temp\" --include-untracked 2>/dev/null || true", cwdEffective);
      pullRes = await runGit("git pull --rebase origin main", cwdEffective);
      logs.push(`$ git pull --rebase (retry)\n${sanitizeOutput(pullRes.out, 1000)}`);
      if (!pullRes.ok) {
        await m.react("❌");
        return m.reply(`❌ *git pull falló*\n\n\`\`\`${sanitizeOutput(pullRes.out, 2000)}\`\`\``);
      }
    } else {
      await m.react("❌");
      return m.reply(`❌ *git pull falló*\n\n\`\`\`${sanitizeOutput(pullRes.out, 2000)}\`\`\`\n\n*Logs:*\n\`\`\`${sanitizeOutput(logs.slice(-6).join("\n---\n"), 1000)}\`\`\``);
    }
  }

  // Restaurar stash si hubo
  if (didStash) {
    const popRes = await runGit("git stash pop 2>&1 || true", cwdEffective);
    logs.push(`$ git stash pop\n${sanitizeOutput(popRes.out, 600)}`);
    if (popRes.out.toLowerCase().includes("conflict")) {
      await runGit("git stash drop 2>/dev/null || true", cwdEffective);
      logs.push("⚠ Conflicto en stash pop, stash descartado (cambios locales se perdieron, se usó origin/main)");
    }
  }

  const logRes = await runGit("git log --oneline -1", cwdEffective);
  const statusShort = await runGit("git status --short", cwdEffective);

  await m.react("✅");
  return m.reply(
    `✅ *sɪɴᴄʀᴏɴɪᴢᴀᴅᴏ — .ᴘᴜʟʟ*\n\n` +
    `╭┈┈⬡「 📋 *ᴅᴇᴛᴀʟʟᴇs* 」\n` +
    `┃ 🔗 Remote: \`origin/main\`\n` +
    `┃ 📦 Último commit: \`${sanitizeOutput(logRes.out.trim() || "?", 200)}\`\n` +
    `┃ 📊 Estado: \`${statusShort.out.trim() ? "cambios locales" : "limpio"}\`\n` +
    `╰┈┈┈┈┈┈┈┈⬡\n\n` +
    `*Logs:*\n\`\`\`${sanitizeOutput(logs.slice(-8).join("\n"), 1500)}\`\`\`\n\n` +
    `> 🚀 Bot sincronizado con GitHub. Haz *Restart* si no se recarga solo.`
  );
}

export { pluginConfig as config, handler };
