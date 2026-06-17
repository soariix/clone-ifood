# iFood Clone

Clone do iFood com **React Native (Expo)** no frontend e **Node.js + Express + Prisma** no backend.

---

## Stack

| Camada  | Tecnologias                                                |
|---------|------------------------------------------------------------|
| Mobile  | Expo SDK 56, Expo Router, TypeScript, React Query, Zustand |
| UI      | Animated API, @gorhom/bottom-sheet, expo-secure-store      |
| Backend | Node.js, Express, Prisma ORM, PostgreSQL, JWT, Zod         |

---

## Pré-requisitos

- Node.js 18+
- PostgreSQL rodando localmente (ou Docker)
- Expo Go ou emulador Android/iOS

---

## Configuração rápida

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

| Método | Rota                           | Auth | Descrição                              |
|--------|--------------------------------|------|----------------------------------------|
| POST   | `/auth/login`                  | —    | Login                                  |
| POST   | `/auth/register`               | —    | Cadastro                               |
| GET    | `/auth/me`                     | ✅   | Perfil do usuário logado               |
| GET    | `/restaurants`                 | —    | Lista (filtros: category, minRating, page) |
| GET    | `/restaurants/search?q=`       | —    | Busca por nome/categoria               |
| GET    | `/restaurants/:id`             | —    | Detalhe do restaurante                 |
| GET    | `/restaurants/:id/menu`        | —    | Menu em seções                         |
| GET    | `/categories`                  | —    | Lista de categorias                    |
| POST   | `/orders`                      | ✅   | Criar pedido                           |
| GET    | `/orders`                      | ✅   | Meus pedidos                           |
| GET    | `/orders/:id`                  | ✅   | Detalhe de um pedido                   |

---

## QA Automation

O projeto inclui um framework de testes mobile com **Pytest + Appium 2.x + UiAutomator2**, cobrindo testes de fumaça (smoke tests) e pipeline de CI/CD automatizado.

### Stack de testes

| Camada   | Tecnologias                                              |
|----------|----------------------------------------------------------|
| Testes   | Python 3.11, Pytest, Appium 2.x, UiAutomator2           |
| Padrão   | Page Object Model (POM)                                  |
| Reports  | Allure Report                                            |
| CI/CD    | GitHub Actions + Android Emulator (API 33)              |

### Estrutura de testes

```
tests/
├── conftest.py          # Fixtures: driver (Appium), api_client (JWT auth)
├── pages/
│   ├── base_page.py     # Métodos base com WebDriverWait
│   └── login_page.py    # Page Object da tela de login
└── smoke/
    └── test_login.py    # 4 casos: login válido, senha errada,
                         # e-mail inválido, campos vazios
```

### Rodando os testes localmente

```bash
# Instale as dependências Python
pip install -r tests/requirements.txt

# Configure o .env com APK_PATH, APPIUM_HOST, API_BASE_URL
cp .env.example .env

# Suba o Appium
appium

# Em outro terminal, rode os testes
pytest tests/smoke/ -m smoke --alluredir=reports/allure-results

# Gere o report
allure serve reports/allure-results
```

### Pipeline CI/CD

O arquivo `.github/workflows/mobile-tests.yml` executa automaticamente a cada PR e diariamente às 06:00 BRT:

1. Sobe o PostgreSQL como service container
2. Roda `prisma migrate deploy` + `prisma db seed`
3. Sobe o backend Node.js
4. Inicia o Android Emulator (API 33, x86_64)
5. Executa os smoke tests com Pytest
6. Publica o Allure Report no GitHub Pages

---

## Licença

MIT