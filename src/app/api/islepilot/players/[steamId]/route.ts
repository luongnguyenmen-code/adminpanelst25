import { NextRequest, NextResponse } from 'next/server';
import { st25PlayerEngine } from '@/lib/server/player-engine';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ steamId: string }> }
) {
  try {
    const { steamId } = await params;
    const profile = await st25PlayerEngine.getPlayer(steamId);
    if (!profile) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      player: profile,
      garage: profile.garage || [],
      notes: profile.notes || [],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
