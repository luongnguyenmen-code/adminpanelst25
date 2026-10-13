import { NextRequest, NextResponse } from 'next/server';
import { st25PlayerEngine } from '@/lib/server/player-engine';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const onlineOnly = searchParams.get('online') === 'true';
    const search = searchParams.get('search') || '';

    // Fetch REAL players from internal ST25 database engine
    const players = await st25PlayerEngine.getAllPlayers(onlineOnly, search);

    return NextResponse.json({ success: true, players, total: players.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
