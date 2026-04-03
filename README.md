# Maskinoversikt (MVP)

En veldig enkel app for maskiner og brukere.

## Teknologi
- Next.js 14
- Tailwind CSS
- Prisma
- Neon Postgres
- Vercel


## Maskinfelter
Hver maskin har nå:
- maskinnummer
- merke
- modell
- serienummer (valgfritt)
- type
- prosjekt
- status
- ansvarlig bruker

På `/machines` kan du også **opprette ny maskin**.

## Viktig om deploy
Denne appen bruker Prisma i runtime på sidene:
- `/machines`
- `/available`
- `/users`

Sidene er satt til **dynamiske** for å unngå prerender-feil under build.

## Miljøvariabler
Legg inn disse i Vercel:

1. `DATABASE_URL` (obligatorisk)
2. `SETUP_TOKEN` (valgfri, men anbefalt for å beskytte setup-endepunkt)

Lokal `.env`:

```env
DATABASE_URL="postgresql://..."
SETUP_TOKEN="valgfri-hemmelig-token"
```

## Én-klikks DB-setup uten lokal CLI
Appen har et runtime-endepunkt:

- `GET /api/setup`
- `POST /api/setup`

Dette endepunktet gjør automatisk:
1. Oppretter enum `MachineStatus` hvis den mangler
2. Oppretter tabellene `User` og `Machine` hvis de mangler
3. Oppretter nødvendige unike indekser og foreign key
4. Seeder demo-data hvis tabellene er tomme

### Kall setup etter deploy
Uten token:

```text
https://DITT-DOMENE/api/setup
```

Med token:

```text
https://DITT-DOMENE/api/setup?token=DITT_SETUP_TOKEN
```

Svar ved suksess (eksempel):

```json
{
  "ok": true,
  "message": "Database er klar.",
  "seeded": true,
  "users": 5,
  "machines": 12
}
```

## Vercel-steg (enkelt)
1. Legg inn `DATABASE_URL` i Vercel prosjektet.
2. (Anbefalt) Legg inn `SETUP_TOKEN`.
3. Deploy.
4. Kall `https://DITT-DOMENE/api/setup` én gang (med token hvis satt).
5. Åpne `/machines`, `/available`, `/users`.

## Neon SQL Editor
Du trenger normalt **ikke** gjøre noe manuelt i Neon SQL Editor.
Setup-endepunktet oppretter schema automatisk.

## Lokal kjøring (valgfritt)
```bash
npm install
npm run dev
```

Hvis databasen er tom lokalt, kall:

```text
http://localhost:3000/api/setup
```


## Hvis du ikke ser endringer etter deploy
Sjekk dette i rekkefølge:

1. **Riktig branch i Vercel**
   - Gå til Vercel -> Project -> Settings -> Git
   - Bekreft at Production Branch er samme branch du pusher til.

2. **Sjekk deploy-versjon i appen**
   - Nederst i appen vises nå: `Deploy-versjon` og `Commit`.
   - Hvis commit ikke matcher siste push, ser du en eldre deploy.

3. **Sett versjonsvariabel for tydelig kontroll**
   - Legg inn `NEXT_PUBLIC_APP_VERSION` i Vercel (f.eks. `v3`), redeploy, og sjekk footer.

4. **Kjør setup etter ny deploy**
   - Kall `https://DITT-DOMENE/api/setup` én gang.
   - Oppdater deretter `/machines`.
