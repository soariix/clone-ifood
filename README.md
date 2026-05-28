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
