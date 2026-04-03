# Maskinoversikt (MVP+)

Webapp for maskiner med brukerhierarki, innlogging og automatisk Neon-oppsett.

## Teknologi
- Next.js
- Tailwind CSS
- Prisma
- Neon Postgres
- Vercel

## Funksjoner
- Innlogging med sesjon/cookie (`/login`)
- Adminpanel (`/admin`) for:
  - bedrifter
  - etater
  - prosjekter
  - brukere og roller
- Hierarki:
  - `SUPERADMIN`
  - `COMPANY_ADMIN`
  - `DEPARTMENT_MANAGER`
  - `USER`
- `/machines` viser maskiner i ditt scope (bedrift/etat)
- Tildeling av ansvarlig bruker i tabell
- `/available` viser ledige maskiner i ditt scope
- `/projects` viser prosjekter med maskinoversikt

## Automatisk oppsett i Neon (no-code)
Kall endpointet én gang etter deploy:

```bash
curl -X POST https://DIN-APP/api/setup
```

Dette oppretter tabeller, relasjoner, demo-hierarki og default admin automatisk.

### Demo login
- E-post: `admin@maskin.no`
- Passord: `Admin123!`

## Lokal oppstart

```bash
npm install
cp .env.example .env
```

Legg inn Neon connection string i `.env`:

```env
DATABASE_URL="postgresql://..."
```

Deretter:

```bash
npm run prisma:generate
npm run prisma:push
npm run seed
npm run dev
```

Åpne: `http://localhost:3000/login`
