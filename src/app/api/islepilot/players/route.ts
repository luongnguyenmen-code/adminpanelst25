import { NextRequest, NextResponse } from 'next/server';
import { islePilotClient } from '@/lib/islepilot/client';
import { adminStore } from '@/lib/db/store';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const onlineOnly = searchParams.get('online') === 'true';
    const search = searchParams.get('search') || '';

    // Fetch REAL players from IslePilot API directly
    const rawPlayers = await islePilotClient.getPlayers(onlineOnly, search);

    return NextResponse.json({ players: rawPlayers, total: rawPlayers.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
