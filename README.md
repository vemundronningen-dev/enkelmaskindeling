# Maskinoversikt (MVP)

Veldig enkel webapp for maskiner og brukere.

## Teknologi
- Next.js
- Tailwind CSS
- Prisma
- Neon Postgres
- Vercel

## Funksjoner
- `/machines` viser alle maskiner i tabell
- Velg/fjern ansvarlig bruker direkte i tabellen
- Status blir automatisk:
  - ansvarlig bruker valgt -> **Tildelt**
  - ansvarlig bruker fjernet -> **Ledig**
- `/available` viser kun maskiner med status **Ledig**
- `/users` viser alle brukere og maskiner de er ansvarlig for

## 1) Enkel lokal oppstart

```bash
npm install
cp .env.example .env
```

Legg inn Neon connection string i `.env`:

```env
DATABASE_URL="postgresql://..."
```

Kjør så:

```bash
npm run prisma:generate
npm run prisma:push
npm run seed
npm run dev
```

Åpne: `http://localhost:3000/machines`

## 2) Slik lager du database i Neon
1. Lag konto på Neon og opprett et nytt prosjekt.
2. Lag en database (f.eks. `maskinoversikt`).
3. Kopier connection string fra Neon Dashboard.
4. Lim den inn i `.env` lokalt som `DATABASE_URL`.

## 3) Deploy til Vercel
1. Push prosjektet til GitHub.
2. Importer repoet i Vercel.
3. Gå til **Project Settings -> Environment Variables**.
4. Legg inn:
   - `DATABASE_URL` = connection string fra Neon.
5. Deploy.

> Viktig: Denne appen leser live data fra Prisma i runtime (dynamiske sider), så build skal ikke prøve å prerendre DB-data.

### Etter første deploy (må gjøres én gang)
Du må opprette tabeller i databasen:

```bash
npm run prisma:generate
npm run prisma:push
npm run seed
```

Kjør dette lokalt mot samme `DATABASE_URL` som i Vercel, eller i Vercel shell.

## 4) Feil `P2021` (tabell finnes ikke)
Hvis du ser feil som:
- `public.Machine does not exist`
- `public.User does not exist`

så betyr det at schema ikke er pushet til databasen ennå.

Sjekkliste:
1. Bekreft at `DATABASE_URL` peker til riktig Neon-prosjekt og database.
2. Kjør `npm run prisma:push`.
3. Kjør `npm run seed`.
4. Last siden på nytt.

## 5) Enkel admin-løsning
Denne MVP-en har **ingen login** (bevisst for enkelhet).
Det gjør den enkel å teste, enkel å forstå, og enkel å bytte til ekte innlogging senere.

## 6) Prosjektstruktur
- `app/machines` - maskinliste + redigering + ansvarlig bruker
- `app/available` - ledige maskiner
- `app/users` - brukerliste
- `prisma/schema.prisma` - datamodell
- `prisma/seed.ts` - demo-data
