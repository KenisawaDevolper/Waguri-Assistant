import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import config from "../../config.js";

const execAsync = promisify(exec);

const pluginConfig = {
  name: "up",
  alias: ["push", "gitpush", "upload", "upgit"],
  category: "owner",
  description: "Hacer git add, commit y push a Github (Owner Only)",
  usage: ".up [mensaje] | .up <github_url> [mensaje]",
  example: ".up update fitur terbaru",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

function isGithubUrl(text) {
  return /github\.com[:\/]/i.test(text) || /^https?:\/\//i.test(text) && text.includes(".git");
}

function sanitizeOutput(str, max = 3500) {
  if (!str) return "";
  let s = String(str).trim();
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

// En Android, /sdcard es FUSE y falla al escribir .git/objects -> usamos staging en /data/local/tmp
async function ensureStagingCwd(originalCwd) {
  // solo para rutas en /sdcard
  if (!originalCwd.includes("/sdcard")) return originalCwd;
  const staging = "/data/local/tmp/waguri-push";
  try {
    await execAsync(`mkdir -p "${staging}"`);
    // copiar archivos al staging (sin node_modules, .git ya existe)
    // usamos tar para respetar permisos de linux
    await execAsync(`tar -cf - -C "${originalCwd}" --exclude='.git' --exclude='node_modules' --exclude='tmp' --exclude='temp' --exclude='sessions' --exclude='session' . | tar -xf - -C "${staging}"`, { timeout: 60000 });
    // si no existe .git en staging, inicializar luego se copiará config
    // copiar .gitignore si existe
    try { await execAsync(`cp -f "${originalCwd}/.gitignore" "${staging}/.gitignore" 2>/dev/null || true`); } catch {}
    return staging;
  } catch (e) {
    return originalCwd;
  }
}

async function syncBackGit(staging, originalCwd) {
  // sincroniza .git del staging al original para mantener history local si usuario quiere
  try {
    await execAsync(`rm -rf "${originalCwd}/.git" 2>/dev/null; cp -a "${staging}/.git" "${originalCwd}/.git" 2>/dev/null || true`);
  } catch {}
}

async function handler(m, { sock }) {
  if (!config.isOwner(m.sender)) {
    return m.reply("❌ *Owner Only!* Solo el creador puede usar .up");
  }

  const cwd = process.cwd();
  const rawArgs = (m.fullArgs || m.args?.join(" ") || "").trim();
  // Separar posible URL de github del mensaje
  let githubUrl = null;
  let commitMsg = rawArgs;

  // detectar si el primer arg es url
  if (rawArgs) {
    const first = rawArgs.split(/\s+/)[0];
    if (isGithubUrl(first)) {
      githubUrl = first;
      commitMsg = rawArgs.slice(first.length).trim();
    }
  }

  if (!commitMsg) {
    const now = new Date();
    // Asia/Jakarta UTC+7
    const ts = new Date(now.getTime() + 7*60*60*1000).toISOString().replace("T"," ").slice(0,19);
    commitMsg = `update bot ${ts}`;
  }

  await m.react("⏳");
  // Detectar staging si /sdcard falla
  let cwdEffective = cwd;
  let usingStaging = false;
  if (cwd.includes("/sdcard")) {
    const st = await ensureStagingCwd(cwd);
    if (st !== cwd) {
      cwdEffective = st;
      usingStaging = true;
    }
  }

  await m.reply(
    `🚀 *ɢɪᴛ ᴘᴜsʜ — .ᴜᴘ*\n\n` +
    `> 📝 Mensaje: \`${commitMsg}\`\n` +
    `> 📂 Dir: \`${cwd}\`${usingStaging ? ` → staging: \`${cwdEffective}\`` : ""}\n` +
    `> ⏳ Procesando...`
  );

  const logs = [];
  if (usingStaging) logs.push(`ℹ Usando staging ${cwdEffective} por FUSE /sdcard`);

  // Auto-sanitizar secretos antes de commit para evitar GH013 push protection
  if (usingStaging) {
    try {
      await execAsync(`sed -i 's/gsk_[A-Za-z0-9_\\-]\\+/YOUR_GROQ_API_KEY/g' "${cwdEffective}/config.js" 2>/dev/null; sed -i 's/AIza[0-9A-Za-z_\\-]\\+/YOUR_GOOGLE_API_KEY/g' "${cwdEffective}/config.js" 2>/dev/null; sed -i 's/AIza[0-9A-Za-z_\\-]\\+/YOUR_GOOGLE_API_KEY/g' "${cwdEffective}/plugins/sticker/smeme.js" 2>/dev/null; sed -i 's/AIza[0-9A-Za-z_\\-]\\+/YOUR_GOOGLE_API_KEY/g' "${cwdEffective}/src/lib/rimuru-tmpfiles.js" 2>/dev/null; sed -i 's/AIza[0-9A-Za-z_\\-]\\+/YOUR_GOOGLE_API_KEY/g' "${cwdEffective}/src/lib/rimuru-uploader.js" 2>/dev/null; echo sanitized`);
      logs.push("✓ Secretos sanitizados para Github (groq/google)");
    } catch {}
  }

  // 1. Verificar git instalado
  const gitCheck = await runGit("git --version", cwdEffective);
  if (!gitCheck.ok) {
    await m.react("❌");
    return m.reply(
      `❌ *Git no está instalado en el servidor*\n\n\`\`\`${sanitizeOutput(gitCheck.out, 800)}\`\`\`\n\n> Instala git con: \`pkg install git\` o \`apt install git\``
    );
  }
  logs.push(`✓ ${sanitizeOutput(gitCheck.out, 200)}`);

  // 2. Verificar si es repo git
  const isGitRepo = fs.existsSync(path.join(cwd, ".git"));
  if (!isGitRepo) {
    if (!githubUrl) {
      await m.react("⚠️");
      return m.reply(
        `⚠️ *No es un repositorio git*\n\n` +
        `> Este proyecto aún no tiene \`.git\`\n\n` +
        `*Para inicializar y vincular a Github:*\n` +
        `> \`.up https://github.com/USUARIO/REPO.git ${commitMsg}\`\n\n` +
        `*O manualmente:*\n` +
        `\`\`\`git init\ngit remote add origin https://github.com/USUARIO/REPO.git\`\`\`\n\n` +
        `*Luego vuelve a usar:*\n> \`.up ${commitMsg}\``
      );
    }
    // init + remote add
    const initRes = await runGit("git init", cwdEffective);
    logs.push(`$ git init\n${sanitizeOutput(initRes.out, 600)}`);
    if (!initRes.ok) {
      await m.react("❌");
      return m.reply(`❌ *git init falló*\n\n\`\`\`${sanitizeOutput(initRes.out)}\`\`\``);
    }

    // crear .gitignore básico si no existe
    const gitignorePath = path.join(cwd, ".gitignore");
    if (!fs.existsSync(gitignorePath)) {
      const defaultIgnore = `node_modules/
session/
sessions/
auth_info/
*.session
.env
database/*.json
backups/
tmp/
temp/
*.log
.DS_Store
`;
      try { fs.writeFileSync(gitignorePath, defaultIgnore); logs.push("✓ .gitignore creado"); } catch {}
    }

    const remoteAdd = await runGit(`git remote add origin ${githubUrl}`, cwdEffective);
    logs.push(`$ git remote add origin ${githubUrl}\n${sanitizeOutput(remoteAdd.out, 600)}`);
    if (!remoteAdd.ok && !remoteAdd.out.includes("already exists")) {
      await m.react("❌");
      return m.reply(`❌ *No se pudo agregar remote*\n\n\`\`\`${sanitizeOutput(remoteAdd.out)}\`\`\``);
    }
  } else {
    // ya es repo, si se pasó URL y no existe origin, agregar/actualizar
    if (githubUrl) {
      const remoteV = await runGit("git remote -v", cwdEffective);
      const hasOrigin = remoteV.out.includes("origin");
      if (!hasOrigin) {
        const add = await runGit(`git remote add origin ${githubUrl}`, cwdEffective);
        logs.push(`$ git remote add origin ${githubUrl}\n${sanitizeOutput(add.out, 600)}`);
      } else {
        const setUrl = await runGit(`git remote set-url origin ${githubUrl}`, cwdEffective);
        logs.push(`$ git remote set-url origin ${githubUrl}\n${sanitizeOutput(setUrl.out, 600)}`);
      }
    }
  }

  // 3. Configurar user git (siempre, para evitar Author identity unknown en HidenCloud)
  const botName = (config.bot?.name || "Waguri").replace(/"/g, "");
  const botEmail = "bot@waguri.local";
  // set local y global por si el repo está recién clonado
  await runGit(`git config user.name "${botName}"`, cwdEffective);
  await runGit(`git config user.email "${botEmail}"`, cwdEffective);
  await runGit(`git config --global user.name "${botName}" 2>/dev/null || true`, cwdEffective);
  await runGit(`git config --global user.email "${botEmail}" 2>/dev/null || true`, cwdEffective);
  logs.push(`✓ git config user.name = ${botName} | user.email = ${botEmail}`);

  // 4. Verificar remote existe después de todo
  const remoteCheck = await runGit("git remote -v", cwdEffective);
  logs.push(`$ git remote -v\n${sanitizeOutput(remoteCheck.out, 600)}`);
  if (!remoteCheck.out.includes("origin")) {
    await m.react("⚠️");
    return m.reply(
      `⚠️ *No hay remote origin configurado*\n\n` +
      `> Configura con:\n\`.up https://github.com/USUARIO/REPO.git ${commitMsg}\`\n\n` +
      `*Remote actual:*\n\`\`\`${sanitizeOutput(remoteCheck.out || "(vacío)", 600)}\`\`\``
    );
  }

  // 5. Asegurar .gitignore correcto antes de add (evita subir .npm, .cache, etc en HidenCloud)
  try {
    const giPath = path.join(cwdEffective, ".gitignore");
    let gi = "";
    try { gi = fs.readFileSync(giPath, "utf8"); } catch { gi = ""; }
    const needed = ["node_modules/", ".npm/", ".cache/", ".gitconfig", "tmp/", "temp/", "sessions/", "session/", ".env"];
    let changed = false;
    for (const p of needed) {
      if (!gi.includes(p)) { gi += (gi.endsWith("\n") || gi === "" ? "" : "\n") + p + "\n"; changed = true; }
    }
    if (changed) { fs.writeFileSync(giPath, gi); logs.push("✓ .gitignore actualizado (.npm/.cache)"); }
  } catch {}

  // Forzar rama a main (HidenCloud a veces inicia en master)
  await runGit("git branch -M main 2>/dev/null || true", cwdEffective);
  logs.push("✓ branch forzado a main");

  // git add (respeta .gitignore)
  const addRes = await runGit("git add .", cwdEffective);
  logs.push(`$ git add .\n${sanitizeOutput(addRes.out || "ok", 300)}`);
  if (!addRes.ok) {
    await m.react("❌");
    return m.reply(`❌ *git add falló*\n\n\`\`\`${sanitizeOutput(addRes.out)}\`\`\``);
  }

  // 6. git status --porcelain para saber si hay cambios
  const statusRes = await runGit("git status --porcelain", cwdEffective);
  const hasChanges = statusRes.out.trim().length > 0;
  const statusShort = await runGit("git status --short", cwdEffective);

  if (!hasChanges) {
    // Verificar si hay commits por pushear (ahead)
    const aheadCheck = await runGit("git status -sb", cwdEffective);
    const isAhead = aheadCheck.out.includes("ahead");
    if (!isAhead) {
      await m.react("✅");
      return m.reply(
        `✅ *Nada que pushear*\n\n` +
        `> No hay cambios nuevos para commitear y no hay commits pendientes.\n\n` +
        `*Status:*\n\`\`\`${sanitizeOutput(statusShort.out || aheadCheck.out || "clean", 800)}\`\`\``
      );
    }
    logs.push(`ℹ No hay cambios nuevos, pero hay commits pendientes por pushear`);
  } else {
    logs.push(`$ git status\n${sanitizeOutput(statusRes.out, 800)}`);
  }

  // 7. git commit si hay cambios (con -c para forzar identidad y evitar Author unknown)
  let didCommit = false;
  if (hasChanges) {
    // escapar comillas en mensaje
    const safeMsg = commitMsg.replace(/"/g, '\\"').replace(/`/g, "'");
    const commitRes = await runGit(`git -c user.name="${botName}" -c user.email="${botEmail}" commit -m "${safeMsg}"`, cwdEffective);
    logs.push(`$ git commit -m "${commitMsg}"\n${sanitizeOutput(commitRes.out, 800)}`);
    if (!commitRes.ok) {
      // si es "nothing to commit" no es error fatal
      if (commitRes.out.includes("nothing to commit") || commitRes.out.includes("no changes added")) {
        logs.push("ℹ nothing to commit, continuando a push");
      } else {
        await m.react("❌");
        return m.reply(`❌ *git commit falló*\n\n\`\`\`${sanitizeOutput(commitRes.out)}\`\`\``);
      }
    } else {
      didCommit = true;
    }
  }

  // 8. Detectar rama actual (forzada a main)
  let branch = "main";
  await runGit("git branch -M main 2>/dev/null || true", cwdEffective);
  logs.push(`⎇ Branch: ${branch} (forzado)`);

  // Si es primera vez (no upstream), usar -u
  const upstreamCheck = await runGit(`git rev-parse --abbrev-ref --symbolic-full-name @{u}`, cwdEffective);
  const hasUpstream = upstreamCheck.ok;

  let pushCmd = hasUpstream ? `git push origin ${branch}` : `git push -u origin ${branch}`;
  let pushRes = await runGit(pushCmd, cwdEffective);
  logs.push(`$ ${pushCmd}\n${sanitizeOutput(pushRes.out, 1200)}`);

  // Si falla por fetch first (divergencia), hacer pull --rebase y reintentar push automáticamente
  if (!pushRes.ok && pushRes.out.toLowerCase().includes("fetch first")) {
    logs.push("⚠ Divergencia detectada, haciendo pull --rebase...");
    const fetchRes = await runGit("git fetch origin", cwdEffective);
    logs.push(`$ git fetch origin\n${sanitizeOutput(fetchRes.out, 500)}`);
    const rebaseRes = await runGit(`git pull --rebase origin ${branch}`, cwdEffective);
    logs.push(`$ git pull --rebase origin ${branch}\n${sanitizeOutput(rebaseRes.out, 1200)}`);
    if (rebaseRes.ok || rebaseRes.out.includes("Already up to date") || rebaseRes.out.includes("Successfully rebased")) {
      pushRes = await runGit(pushCmd, cwdEffective);
      logs.push(`$ ${pushCmd} (retry)\n${sanitizeOutput(pushRes.out, 1200)}`);
    } else {
      // si rebase falla por conflictos, intentar abort y hacer merge
      await runGit("git rebase --abort 2>/dev/null || true", cwdEffective);
      const mergeRes = await runGit(`git pull origin ${branch} --no-rebase 2>&1 || git merge origin/${branch} 2>&1 || true`, cwdEffective);
      logs.push(`$ git pull merge fallback\n${sanitizeOutput(mergeRes.out, 800)}`);
      pushRes = await runGit(pushCmd, cwdEffective);
      logs.push(`$ ${pushCmd} (retry2)\n${sanitizeOutput(pushRes.out, 1200)}`);
    }
  }

  if (!pushRes.ok) {
    // analizar errores comunes
    let hint = "";
    const outLower = pushRes.out.toLowerCase();
    if (outLower.includes("authentication") || outLower.includes("could not read username") || outLower.includes("permission denied") || outLower.includes("403") || outLower.includes("401")) {
      hint = `\n\n💡 *Pista Auth:*\n> Usa un Personal Access Token (PAT) en la URL:\n\`https://TOKEN@github.com/USUARIO/REPO.git\`\n> O configura credential helper.\n> Ej: \`.up https://ghp_xxx@github.com/USUARIO/REPO.git\``;
    } else if (outLower.includes("failed to push") && outLower.includes("fetch first")) {
      hint = `\n\n💡 *Pista:*\n> Conflicto persiste. En HidenCloud Console haz:\n\`git fetch origin && git rebase origin/${branch}\` o \`git reset --hard origin/${branch}\` (perderás cambios locales no pusheados)`;
    } else if (outLower.includes("src refspec") && outLower.includes("does not match")) {
      hint = `\n\n💡 *Pista:*\n> No hay commits aún. Asegúrate de haber hecho commit.`;
    }

    await m.react("❌");
    return m.reply(
      `❌ *git push falló*\n\n` +
      `*Comando:* \`${pushCmd}\`\n` +
      `*Branch:* \`${branch}\`\n\n` +
      `\`\`\`${sanitizeOutput(pushRes.out, 2500)}\`\`\`${hint}\n\n` +
      `*Logs previos:*\n\`\`\`${sanitizeOutput(logs.slice(-6).join("\n---\n"), 1000)}\`\`\``
    );
  }

  // Éxito - sincronizar .git de vuelta si usamos staging
  if (usingStaging) {
    await syncBackGit(cwdEffective, cwd);
    logs.push(`✓ Sincronizado .git staging -> ${cwd}`);
  }
  await m.react("✅");

  const lastLog = await runGit("git log --oneline -1", cwdEffective);
  const remoteUrl = (await runGit("git config --get remote.origin.url", cwdEffective)).out.trim();

  // Truncar logs para mensaje final
  const shortLogs = logs.slice(-8).join("\n").slice(0, 1500);

  return m.reply(
    `✅ *ᴘᴜsʜ ᴇxɪᴛᴏsᴏ — .ᴜᴘ*\n\n` +
    `╭┈┈⬡「 📋 *ᴅᴇᴛᴀʟʟᴇs* 」\n` +
    `┃ 📝 Mensaje: \`${commitMsg}\`\n` +
    `┃ ⎇ Branch: \`${branch}\`\n` +
    `┃ 🔗 Remote: \`${remoteUrl || "origin"}\`\n` +
    `┃ 📦 Commit: \`${sanitizeOutput(lastLog.out.trim() || (didCommit ? "nuevo commit" : "sin commit nuevo"), 200)}\`\n` +
    `┃ 📊 Cambios: \`${hasChanges ? "commiteados" : "push de commits pendientes"}\`\n` +
    `╰┈┈┈┈┈┈┈┈⬡\n\n` +
    `*Logs:*\n\`\`\`${sanitizeOutput(shortLogs, 1200)}\`\`\`\n\n` +
    `> 🚀 Push a Github completado!`
  );
}

export { pluginConfig as config, handler };
