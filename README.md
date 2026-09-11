<p align="center">
  <img src="assets/image/rimuru.png" width="180" alt="Waguri Assistant"/>
</p>

<h1 align="center">𝑊⍺ց𝗎𝗋ı 𝖠𝗌𝗌ı𝗌ƚ⍺𝗇ƚ — Rimuru-MD</h1>

<p align="center">
  <a href="https://github.com/KenisawaDevolper/Waguri-Assistant"><img src="https://img.shields.io/badge/Version-5.0-blue?style=for-the-badge" alt="Version"/></a>
  <a href="https://nodejs.org"><img src="https://img.shields.io/badge/Node.js-%3E%3D22-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node"/></a>
  <a href="https://github.com/WhiskeySockets/Baileys"><img src="https://img.shields.io/badge/Baileys-MultiDevice-25D366?style=for-the-badge&logo=whatsapp&logoColor=white" alt="Baileys"/></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-ISC-yellow?style=for-the-badge" alt="License"/></a>
</p>

<p align="center">
  <a href="https://whatsapp.com/channel/0029VbD4qs1B4hdauCwffB33"><img src="https://img.shields.io/badge/Canal_Oficial-WhatsApp-25D366?style=flat&logo=whatsapp" alt="Canal"/></a>
  <a href="https://chat.whatsapp.com/LYTiednOrLB4ObAKYesqLH?s=cl&p=a&ilr=4"><img src="https://img.shields.io/badge/Grupo-WhatsApp-128C7E?style=flat&logo=whatsapp" alt="Grupo"/></a>
  <img src="https://img.shields.io/badge/Plugins-220+-8A2BE2?style=flat" alt="Plugins"/>
</p>

<p align="center">
  Bot de WhatsApp Multi-Device modular, estable y rápido. Sistema de plugins con hot-reload, protección de grupos, economía RPG, IA, descargas y más.<br/>
  <sub>Desarrollado por <b>KenisawaDev</b> • Basado en <b>Baileys (WhiskeySockets)</b></sub>
</p>

---

## ✨ Características

| Categoría | Descripción |
|---|---|
| **🤖 IA** | ChatGPT, Gemini, CharacterAI, Auto-AI por grupo |
| **📥 Descargas** | YouTube, TikTok, Instagram, Facebook, Mediafire, etc. |
| **🎮 Juegos** | Suit PvP, TicTacToe, Ular Tangga, Family100, Dungeon, RPG |
| **👥 Grupos** | Antilink, AntiSpam, AntiToxic, AntiBot, Welcome/Goodbye, Mute, Slowmode |
| **🎨 Stickers** | Sticker, Stickerly, Brat, Carbon, Ephoto, TTP |
| **🔧 Tools** | ToImage, HD, Carbon, Dafont, Upload, Translate, Reminder |
| **👑 Owner** | `.up` (git push), `.eval`, `.exec`, Backup, Jadibot, Sewa |
| **💎 Premium** | Sistema de usuarios premium, límites y energía |
| **🗄️ Base de Datos** | LowDB + helpers con auto-backup y pruner diario |

## 🧩 Sistema de Plugins

- **Hot-Reload** automático en `plugins/` — edita un `.js` y se recarga sin reiniciar (`src/lib/rimuru-plugins.js:281`).
- Categorías: `ai/`, `download/`, `games/`, `group/`, `owner/`, `sticker/`, `tools/`, `search/`, `gacha/`, `user/`, `premium/`, `nsfw/`
- **220+ comandos** listos.

### Comando destacado: `.up`

Hace `git add .` → `commit` → `push` a GitHub automáticamente (solo Owner). Soporta staging en Android por FUSE `/sdcard`.

```bash
.up                           # commit auto "update bot YYYY-MM-DD HH:mm:ss"
.up fix menu y antilink       # mensaje custom
.up https://github.com/USUARIO/REPO.git  # vincula remote si no existe
.push / .gitpush              # alias
```
> El plugin sanitiza `gsk_*` y `AIza*` antes de pushear para evitar el bloqueo `GH013` de GitHub.

---

## 🚀 Instalación

### Requisitos
- **Node.js >= 22** (`node -v`)
- **Git** (`git --version`)
- **FFmpeg** (para stickers/audio)

### 1. Clonar
```bash
git clone https://github.com/KenisawaDevolper/Waguri-Assistant.git
cd Waguri-Assistant
```

### 2. Instalar dependencias
```bash
npm install
# o con yarn
yarn install
```

### 3. Configurar
Edita `config.js`:

```js
owner: {
  name: "KenisawaDev",
  number: ["5491164431320"], // tu número sin + ni espacios
},
session: {
  pairingNumber: "5493865317981", // número para pairing code
  usePairingCode: true, // false = QR
},
bot: {
  name: "𝑊⍺ց𝗎𝗋ı 𝖠𝗌𝗌ı𝗌ƚ⍺𝗇ƚ",
  version: "1.0.0",
},
```

Opcional — claves API en `config.js > APIkey` o mejor en `.env`:

```env
ALIGHT_API_BASE_URL=https://am.rafaelxd.my.id/api/v1
ALIGHT_API_KEY=tu_key_aqui
```

> ⚠️ **No subas keys reales a GitHub.** El bot incluye `.gitignore` para `.env` y el comando `.up` las sanitiza automáticamente. Usa placeholders `YOUR_GROQ_API_KEY` en el repo.

### 4. Iniciar
```bash
npm start
# desarrollo con hot-reload
npm run dev
```

Escanea el QR o ingresa el **pairing code** que aparece en consola. La sesión se guarda en `./sessions/` (o `./session_voip/` si `fake_call` activo).

---

## ⚙️ Configuración Avanzada

| Archivo | Descripción |
|---|---|
| `config.js` | Owner, bot name, prefix (`#` por defecto), prefijos extra en `database/prefix.json` (`. ! / - $`), mensajes, APIs |
| `database/prefix.json` | Prefijos habilitados: `[".", "!", "/", "-", "$"]` |
| `database/main/*.json` | Persistencia (users, groups, premium, sewa) |
| `.env` | Secrets (no se pushea) |
| `plugins/owner/*.js` | Comandos exclusivos owner |

### Prefijo
Por defecto `#` (`config.command.prefix`), pero también funcionan `. ! / - $` según `database/prefix.json:2`.

### Modo del Bot
```bash
#botmode all     # todos los comandos
#botmode md      # solo multi-device (excluye store/panel)
#botmode cpanel  # solo cpanel
#public / #self # modo global
```

---

## 📁 Estructura

```
Waguri-Assistant/
├── assets/            # imágenes, fuentes, audios
├── case/              # handlers legacy
├── config.js          # configuración principal
├── database/          # lowdb + prefix.json, settings
├── index.js           # entry + boot sequence + watchers
├── json/              # datos estáticos
├── plugins/           # 220+ plugins por categoría
│   ├── owner/up.js    # git push automático
│   ├── group/         # antilink, welcome, etc.
│   ├── ai/            # gpt, gemini
│   └── ...
├── src/
│   ├── connection.js
│   ├── handler.js     # middleware principal
│   └── lib/           # rimuru-*.js helpers
├── package.json
└── .gitignore
```

---

## 💻 Uso

### Comandos básicos
```
#menu / .menu          # lista de comandos
#ping / .ping          # latencia
#owner                 # info del creador
#daftar                # registro (si está activo)
```

### Grupos
```
#antilink on/off
#welcome on/off
#goodbye on/off
#promote / #demote / #kick
#tagall
```

### Owner
```
.up mensaje            # push a github
.eval 1+1              # eval JS
> return m.chat        # exec (reply)
.backupsc              # backup zip
.restart               # reinicio real
```

---

## 🌐 Despliegue

### Panel (Pterodactyl)
Configura `config.js > pterodactyl` y usa los comandos de panel.

### VPS / Termux
```bash
pkg install nodejs git ffmpeg
git clone https://github.com/KenisawaDevolper/Waguri-Assistant.git
cd Waguri-Assistant && npm install && npm start
# para mantener vivo: pm2 o screen
pm2 start index.js --name waguri
pm2 save
```

### Docker (ejemplo)
```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
CMD ["node", "index.js"]
```

---

## 🔐 Seguridad

- `.env`, `creds.json`, `sessions/` están en `.gitignore`
- El comando `.up` reemplaza `gsk_*` y `AIza*` por placeholders antes de commitear
- GitHub Push Protection (`GH013`) bloqueará pushes con secretos — si te pasa, revisa el link que da GitHub o sanitiza `config.js`

---

## 🤝 Contribuir

1. Fork el repo
2. Crea una rama: `git checkout -b feat/nueva-funcion`
3. Haz tu plugin en `plugins/<categoria>/`
4. Commit: `git commit -m "feat: añade comando xyz"`
5. Push: `.up feat: añade comando xyz` o `git push`
6. Abre un PR

Sigue el estilo de `plugins/_feature-credit.js` y usa `pluginConfig` + `handler`.

---

## 📞 Soporte

- **Canal:** https://whatsapp.com/channel/0029VbD4qs1B4hdauCwffB33
- **Grupo:** https://chat.whatsapp.com/LYTiednOrLB4ObAKYesqLH?s=cl&p=a&ilr=4
- **Dev:** KenisawaDev — `5491164431320` (ver `config.js:owner`)

---

## 📄 Licencia

**ISC** — © 2026 KenisawaDev / Anita (Rimuru-MD). Ver `package.json:20`.

> Hecho con ❤️ para la comunidad de WhatsApp bots. Si te sirvió, deja una ⭐ en GitHub.
