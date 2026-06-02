# iFood Clone

Clone do iFood com **React Native (Expo)** no frontend e **Node.js + Express + Prisma** no backend.

---

## Stack

| Camada     | Tecnologias                                                  |
|------------|--------------------------------------------------------------|
| Mobile     | Expo SDK 56, Expo Router, TypeScript, React Query, Zustand   |
| UI         | Animated API, @gorhom/bottom-sheet, expo-secure-store        |
| Backend    | Node.js, Express, Prisma ORM, PostgreSQL, JWT, Zod           |

---

## Pré-requisitos

- Node.js 18+
- PostgreSQL rodando localmente (ou Docker)
- Expo Go ou emulador Android/iOS

---

## Configuração rápida

### Pré-requisitos

- Node.js 18+
- PostgreSQL rodando localmente
- Expo Go instalado no celular
- ngrok com conta gratuita configurada (`npx expo install @expo/ngrok` + `ngrok authtoken SEU_TOKEN`)

### 1. Instale as dependências

```bash
npm install
cd backend && npm install && cd ..
```

### 2. Configure o banco de dados

```bash
cd backend
cp .env.example .env
# Edite DATABASE_URL com suas credenciais do PostgreSQL
# Exemplo: postgresql://postgres:suasenha@localhost:5432/ifood_clone

npx prisma migrate dev
npx prisma db seed
cd ..
```

### 3. Rodando o projeto (com Expo Go no celular)

> O app usa tunnel para funcionar no celular físico fora da rede local.
> São necessários **dois terminais**.

**Terminal 1 — Sobe o backend + cria tunnel público para a API:**

```bash
npm run back
```

Aguarde aparecer:

```
✅ Backend rodando!
✅ API pública: https://xxxx.trycloudflare.com
✅ .env.local atualizado
```

**Terminal 2 — Sobe o Expo com tunnel:**

```bash
npx expo start --tunnel --clear
```

Escaneie o QR code com o **Expo Go** no iPhone/Android.

**Usuário de teste criado pelo seed:**

- E-mail: `test@ifood.com`
- Senha: `123456`

---

## Estrutura do projeto

```
clone-ifood/
├── app/                   # Telas (Expo Router file-based routing)
│   ├── (auth)/            # Login, cadastro
│   ├── (tabs)/            # Início, Busca, Pedidos, Perfil
│   ├── restaurant/[id].tsx
│   ├── reorder/[id].tsx   # Pedir novamente (ajuste de quantidades → checkout)
│   ├── checkout.tsx
│   └── _layout.tsx
├── components/            # Componentes reutilizáveis
├── constants/             # theme.ts, mockData.ts
├── hooks/                 # useAuth, useDebounce, useDebounceValue
├── services/              # Axios: api.ts, auth, restaurant, order
├── store/                 # Zustand: cart.store, auth.store
├── types/                 # Interfaces TypeScript globais
└── backend/               # API REST
    ├── prisma/
    │   ├── schema.prisma
    │   └── seed.ts
    └── src/
        ├── controllers/   # auth, restaurant, order, category
        ├── middleware/     # auth.middleware (JWT)
        ├── routes/
        ├── lib/           # prisma singleton
        ├── app.ts
        └── server.ts
```

---

## Rotas da API

| Método | Rota                          | Auth | Descrição                    |
|--------|-------------------------------|------|------------------------------|
| POST   | `/auth/login`                 | —    | Login                        |
| POST   | `/auth/register`              | —    | Cadastro                     |
| GET    | `/auth/me`                    | ✅   | Perfil do usuário logado     |
| GET    | `/restaurants`                | —    | Lista (filtros: category, minRating, page) |
| GET    | `/restaurants/search?q=`      | —    | Busca por nome/categoria     |
| GET    | `/restaurants/:id`            | —    | Detalhe do restaurante       |
| GET    | `/restaurants/:id/menu`       | —    | Menu em seções               |
| GET    | `/categories`                 | —    | Lista de categorias          |
| POST   | `/orders`                     | ✅   | Criar pedido                 |
| GET    | `/orders`                     | ✅   | Meus pedidos                 |
| GET    | `/orders/:id`                 | ✅   | Detalhe de um pedido         |

---

## 🤖 AI-Assisted Development

This project's mobile QA automation framework — covering test infrastructure, page objects, test cases, and CI/CD pipeline — was built with significant assistance from AI coding tools. Below is a transparent account of what each tool contributed and the measurable impact on delivery speed.

### Tools used

#### GitHub Copilot Chat (VS Code)

Used for **generating the core test infrastructure from scratch**.

**What it produced:**

- **`tests/conftest.py`** — Full Appium 2.x session fixture using `UiAutomator2Options`, `python-dotenv` environment loading, the `api_client` fixture with JWT authentication against the Express backend, and the `pytest_runtest_makereport` hook for automatic failure screenshots saved to `reports/screenshots/`.
- **`tests/pages/base_page.py`** and **`tests/pages/login_page.py`** — Page Object Model classes with `WebDriverWait`-backed element interactions, `AppiumBy.ACCESSIBILITY_ID` locators, and a clean `login(email, password)` composition method.
- **`tests/smoke/test_login.py`** — Four smoke test cases (`valid login`, `wrong password`, `invalid email`, `empty fields`) with `@pytest.mark.parametrize` for input validation coverage, `@allure.title`/`@allure.description` decorators, and `allure.step` context managers throughout.

**Concrete prompt example:**

> *"Create conftest.py for PyTest + Appium 2.x + UiAutomator2 testing an iFood Clone React Native APK. Include a `driver` fixture with `scope=function`, UiAutomator2 capabilities reading `APK_PATH` from environment, an `api_client` fixture that POSTs to `/auth/login` and returns the JWT, and a `pytest_runtest_makereport` hook that screenshots on failure."*

The model generated a production-ready file on the first attempt, correctly inferring the `tokens.accessToken` response structure by cross-referencing the backend controller shown in context.

---

#### Claude (via GitHub Copilot Chat / Claude Sonnet 4.6)

Used for **infrastructure-level generation requiring multi-file reasoning**.

**What it produced:**

- **`.github/workflows/mobile-tests.yml`** — Complete GitHub Actions pipeline: PostgreSQL service container, Node.js backend build + `prisma migrate deploy` + `prisma db seed` + health-check loop, Python 3.11 + pip, Appium 2 server, `reactivecircus/android-emulator-runner@v2` (API 33, `google_apis`, `x86_64`), `pytest -m smoke --alluredir`, Allure report deployment to GitHub Pages via `simple-elf/allure-report-action` + `peaceiris/actions-gh-pages`.
- **Locator audit** — Reviewed all `AppiumBy` strategies across page objects and flagged XPath fragility, recommending `ACCESSIBILITY_ID`-first with `ANDROID_UI_AUTOMATOR` as fallback for dynamic lists.

**Concrete prompt example:**

> *"Create `.github/workflows/mobile-tests.yml`. PR trigger + daily cron at 06:00 BRT. PostgreSQL 15 service, Node 18 backend (npm ci, prisma migrate deploy, db seed, npm start), Python 3.11, Appium 2 + UiAutomator2, android-emulator-runner API 33, pytest smoke tests, Allure to GitHub Pages. Use secrets for DATABASE_URL and JWT_SECRET."*

The model correctly derived that `npm start` requires a prior `npm run build` step (TypeScript project), and added the health-check polling loop independently — details not specified in the prompt.

---

### Productivity impact

| Artifact | Manual estimate | Actual time | AI contribution |
|---|---|---|---|
| `conftest.py` (fixtures + hook) | ~3 h | ~25 min | Copilot generated full file; manual review + `.env` wiring |
| `BasePage` + `LoginPage` (POM) | ~1.5 h | ~15 min | Copilot generated; added `clear()` before `send_keys` |
| `test_login.py` (4 test cases) | ~2 h | ~20 min | Copilot generated; adjusted `parametrize` IDs and assertions |
| `mobile-tests.yml` (CI/CD) | ~4 h | ~30 min | Claude generated; verified `build` step ordering manually |
| **Total** | **~10.5 h** | **~90 min** | **~85% reduction in boilerplate time** |

The primary human effort shifted from *writing* to *reviewing*: validating that generated locators matched the actual app, confirming the API response schema against the backend source, and adjusting assertion messages for clarity.

---

### Limitations observed

- Both tools occasionally hallucinated Appium capability key names (e.g., `appPackage` vs `app` for full APK installs). Always cross-check against the [Appium UiAutomator2 driver docs](https://github.com/appium/appium-uiautomator2-driver).
- Generated `WebDriverWait` timeouts were conservative (10 s everywhere). Real-device testing on slower CI runners may require tuning per element.
- Neither tool verified that `accessibility_id` values (`"email-input"`, `"login-button"`, etc.) actually exist in the React Native component tree — that mapping must be done manually via `adb` or Appium Inspector.
