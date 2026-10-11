import { NextRequest, NextResponse } from 'next/server';
import { islePilotClient } from '@/lib/islepilot/client';
import { adminStore } from '@/lib/db/store';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ steamId: string }> }
) {
  try {
    const { steamId } = await params;
    const player = await islePilotClient.getPlayerDetail(steamId);
    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    // Fetch real garage slots from IslePilot
    const garageSlots = await islePilotClient.getPlayerGarage(steamId).catch(() => []);

    const notes = adminStore.getPlayerNotes(steamId);
    return NextResponse.json({ player, garage: garageSlots, notes });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
