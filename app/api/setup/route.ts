import { NextRequest, NextResponse } from 'next/server';
import { ensureDatabaseSetup } from '@/lib/db-init';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function isAuthorized(request: NextRequest) {
  const requiredToken = process.env.SETUP_TOKEN;

  if (!requiredToken) {
    return true;
  }

  const tokenFromQuery = request.nextUrl.searchParams.get('token');
  const tokenFromHeader = request.headers.get('x-setup-token');

  return tokenFromQuery === requiredToken || tokenFromHeader === requiredToken;
}

async function runSetup(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      {
        ok: false,
        message: 'Ugyldig setup-token. Legg til token i query (?token=...) eller header x-setup-token.'
      },
      { status: 401 }
    );
  }

  try {
    const result = await ensureDatabaseSetup();

    return NextResponse.json({
      ok: true,
      message: 'Database er klar.',
      ...result
    });
  } catch (error) {
    const err = error as { code?: string; message?: string };
    console.error('[api/setup] Setup failed', error);

    return NextResponse.json(
      {
        ok: false,
        message: 'Setup feilet.',
        errorCode: err.code ?? null,
        error: err.message ?? 'Ukjent feil'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return runSetup(request);
}

export async function POST(request: NextRequest) {
  return runSetup(request);
}
