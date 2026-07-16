# 🧠 Memory – Theme-Based Card Game
A multi-page memory card game with four distinct visual themes, dynamic game states, and fully customizable styling through SCSS theme tokens. Built with TypeScript, Vite, and modular SCSS.

---

## 🚀 Live Demo
🔗 Add your live URL here (e.g. GitHub Pages / custom domain)

---

## ✨ Features
- 🎨 Four selectable themes: codeVibes, gaming, daProjects, foods
- 🧩 Configurable board sizes (e.g. 4x4, 6x6)
- 👥 Two-player turn-based game flow with live score tracking
- 🏆 Winner and draw screens with per-theme assets and typography
- 🖼️ Theme-specific card fronts/backs and UI icons
- 🪟 Reusable exit confirmation popup component (themeable via CSS variables)
- 🧱 SCSS token architecture for page/component-level styling consistency
- 📱 Responsive game layout for desktop and mobile breakpoints

---

## 🛠️ Technologies
- TypeScript
- Vite
- SCSS (modular structure + theme variables)
- HTML5
- Vanilla DOM APIs (no frontend framework)

---

## 🏗️ Architecture
### Page Structure
- `index.html` – Start screen / entry point
- `pages/settings.html` – Game setup and theme selection
- `pages/game.html` – Main game board and header controls
- `pages/draw.html` – Draw result page
- `pages/winner.html` – Winner result page
- `pages/game-over.html` – End-of-game summary route

### TypeScript Modules (`src/`)
- `src/style.ts` – Start page bootstrap
- `src/settings.ts` – Settings page logic
- `src/game.ts` – Game page bootstrap, board rendering, exit popup behavior
- `src/game_logic.ts` – Turn handling, card matching, game flow
- `src/card.ts` – Card model/types
- `src/player.ts` – Player model
- `src/draw.ts` – Draw page setup
- `src/winner.ts` – Winner page setup and icon mode switching
- `src/game-over.ts` – Game-over page behavior
- `src/game-settings-storage.ts` – Persistent settings/results storage
- `src/theme-catalog.ts` – Central theme metadata and asset mapping

### SCSS Modules (`src/scss/`)
- `base/` – Global resets, fonts, base styles
- `components/` – Reusable UI parts (`_card.scss`, `_header.scss`, `_exit-confirm.scss`, ...)
- `pages/` – Per-page styling (`game.scss`, `settings.scss`, `winner.scss`, ...)
- `themes/` – Theme token files (`_theme-code-vibes.scss`, `_theme-gaming.scss`, `_theme-da-projects.scss`, `_theme-foods.scss`)

---

## ▶️ Installation
Clone repository:
```bash
git clone <YOUR_REPOSITORY_URL>
```

Install dependencies:
```bash
cd memory
npm install
```

Start development server:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

Preview production build locally:
```bash
npm run preview
```

---

## 📁 Project Structure
```text
memory/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── pages/
│   ├── draw.html
│   ├── game-over.html
│   ├── game.html
│   ├── settings.html
│   └── winner.html
├── public/
│   └── assets/
│       ├── theme_files/
│       │   ├── codeVibes/
│       │   ├── gaming/
│       │   ├── daProjects/
│       │   └── foods/
│       ├── theme_preview/
│       └── ui/
└── src/
    ├── card.ts
    ├── draw.ts
    ├── game.ts
    ├── game_logic.ts
    ├── game-over.ts
    ├── game-settings-storage.ts
    ├── player.ts
    ├── settings.ts
    ├── style.ts
    ├── theme-catalog.ts
    ├── winner.ts
    ├── assets/
    │   ├── theme_files/
    │   └── theme_preview/
    └── scss/
        ├── abstract/
        ├── base/
        ├── components/
        ├── layout/
        ├── pages/
        ├── themes/
        └── vendor/
```

---

## 👨‍💻 Developer
Andreas Hüpgen  
🔗 GitHub · LinkedIn · a.huepgen@web.de
