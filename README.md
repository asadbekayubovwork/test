# Wordzen Web App

Клиент **Telegram Mini App** (React 19 + Vite + TypeScript). Бэкенды (`api` / `account` / `payment`) и ключ клиента задаются через переменные **`VITE_*`** (см. `.env.example`).

## Docker / деплой

Образ **multi-stage**: Node собирает `dist/`, затем **nginx:alpine** отдаёт статику. Подходит для VPS, Kubernetes, Portainer и т.п.

### Через Docker Compose

1. `cp .env.example .env` — задайте **`VITE_MINIAPP_CLIENT_KEY`** и при необходимости URL API.
2. `docker compose up --build`
3. Откройте `http://localhost:8080` (порт задаётся переменной **`WEB_PORT`**).

### Только Docker

```bash
docker build \
  --build-arg VITE_MINIAPP_CLIENT_KEY='секрет_от_бэка' \
  -t wordzen-web:latest .

docker run --rm -p 8080:80 wordzen-web:latest
```

Передайте остальные **`VITE_*`** через `--build-arg`, если отличаются от значений по умолчанию в `Dockerfile`.

### Важно

- **`VITE_*` попадают в бандл на этапе сборки** (`docker build`). Поменяли URL или ключ — **пересоберите** образ.
- В контейнере **нет** dev-proxy Vite; браузер ходит напрямую на HTTPS API — на бэкенде нужен **CORS** для вашего домена мини-приложения.
- Контейнер — **только фронт**; payment/account API деплоятся отдельно.

---

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
