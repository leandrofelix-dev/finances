# Finanças Pessoais

App pessoal de finanças em Next.js, TypeScript, Prisma e PostgreSQL. A interface centraliza cartões, faturas, compras, parcelamentos, despesas fixas, dívidas, entradas e projeções em um layout visual inspirado no Notion.

## Requisitos

- Node.js 20+
- Docker e Docker Compose para o PostgreSQL local

## Rodando Localmente

```bash
docker compose up -d
npm install
npm run db:setup   # cria tabelas + dados de exemplo (obrigatório na 1ª vez)
npm run dev
```

A aplicação fica em `http://localhost:3000`.

## Variáveis

Use `DATABASE_URL` apontando para um PostgreSQL:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/finances?schema=public"
```

## Scripts

- `npm run dev`: inicia o Next.js em desenvolvimento.
- `npm run build`: gera build de produção.
- `npm run start`: inicia o build de produção.
- `npm run lint`: roda ESLint.
- `npm run db:push`: aplica o schema Prisma no banco.
- `npm run db:seed`: popula dados de exemplo.

## Deploy

O projeto é único: frontend, rotas de API e Prisma ficam no mesmo app Next.js. Para deploy em container, forneça uma `DATABASE_URL` PostgreSQL gerenciada e faça:

```bash
docker build -t finances .
docker run -p 3000:3000 --env DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB?schema=public" finances
```

Antes do primeiro deploy, aplique o schema no banco com `npm run db:push` usando a mesma `DATABASE_URL`.
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
# finances
# finances
