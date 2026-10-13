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
    const rawGarageSlots = await islePilotClient.getPlayerGarage(steamId).catch(() => []);

    // Enrich player with stored mutations & lineage
    const savedPlayerMuts = adminStore.getPlayerMutations(steamId);
    if (savedPlayerMuts) {
      if (!player.mutations || player.mutations.length === 0) {
        player.mutations = savedPlayerMuts.mutations;
      }
      (player as any).lineage = savedPlayerMuts.lineage;
      if (savedPlayerMuts.elder) {
        (player as any).elder = savedPlayerMuts.elder;
      }
    }

    // Enrich garage slots with stored mutations & lineage
    const garageSlots = rawGarageSlots.map((slot) => {
      const savedDino = adminStore.getGarageSlotMutations(slot.id);
      if (savedDino) {
        return {
          ...slot,
          mutations:
            savedDino.mutations && savedDino.mutations.length > 0
              ? savedDino.mutations
              : slot.mutations,
          elder: savedDino.elder || (slot.isPrimeElder ? 'Prime' : 'No elder'),
          lineage: savedDino.lineage,
        };
      }
      return slot;
    });

    const notes = adminStore.getPlayerNotes(steamId);
    return NextResponse.json({ player, garage: garageSlots, notes });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
