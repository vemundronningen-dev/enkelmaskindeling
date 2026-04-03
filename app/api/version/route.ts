import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    appVersion: process.env.NEXT_PUBLIC_APP_VERSION ?? 'lokal',
    commitSha: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
    branch: process.env.VERCEL_GIT_COMMIT_REF ?? null,
    timestamp: new Date().toISOString()
  });
}
